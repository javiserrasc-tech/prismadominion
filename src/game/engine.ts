import type { GameState, PlayerState, BattleCard, CardDef, GamePhase } from '../types'
import { getCard } from '../data/cards'

// ═══════════════════════════════════════════════════════
//  PRISMA DOMINION — Game Engine
// ═══════════════════════════════════════════════════════

let uidCounter = 0
export function newUid(prefix = 'bc') {
  return `${prefix}-${++uidCounter}-${Math.random().toString(36).slice(2, 6)}`
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makePlayer(deckIds: string[]): PlayerState {
  const cards = deckIds.map(id => getCard(id))
  const deck = shuffle(cards)
  const hand = deck.splice(0, 5)
  return {
    life: 20,
    hand,
    deck,
    battlefield: [],
    graveyard: [],
    shardPlayedThisTurn: false,
    extraEnergy: 0,
  }
}

function makeBattleCard(defId: string, hasRush = false): BattleCard {
  return {
    uid: newUid(),
    defId,
    tapped: false,
    summonSick: !hasRush,
    attacking: false,
    resilientUsed: false,
    rebirthDone: false,
    bonusAtk: 0,
    bonusDef: 0,
    frozenTurns: 0,
    rushThisTurn: false,
  }
}

export function createGame(
  playerDeckIds: string[],
  aiDeckIds: string[],
  difficulty: 'easy' | 'hard'
): GameState {
  return {
    phase: 'player-main',
    turn: 1,
    activePlayer: 'player',
    player: makePlayer(playerDeckIds),
    ai: makePlayer(aiDeckIds),
    combat: null,
    log: ['⚔  Battle begins! Your turn.'],
    winner: null,
    difficulty,
    pendingSpell: null,
    selectedBlockerFor: null,
  }
}

// ─────────────────────────────────────────────
//  Queries
// ─────────────────────────────────────────────

export function getEnergy(state: GameState, who: 'player' | 'ai'): number {
  const p = state[who]
  const untappedShards = p.battlefield.filter(
    bc => !bc.tapped && getCard(bc.defId).type === 'shard'
  ).length
  return untappedShards + p.extraEnergy
}

export function getCardOnBattlefield(state: GameState, uid: string): { card: BattleCard; owner: 'player' | 'ai' } | null {
  for (const bc of state.player.battlefield) {
    if (bc.uid === uid) return { card: bc, owner: 'player' }
  }
  for (const bc of state.ai.battlefield) {
    if (bc.uid === uid) return { card: bc, owner: 'ai' }
  }
  return null
}

export function getEffectiveAtk(bc: BattleCard): number {
  const def = getCard(bc.defId)
  return Math.max(0, (def.atk ?? 0) + bc.bonusAtk)
}

export function getEffectiveDef(bc: BattleCard): number {
  const def = getCard(bc.defId)
  return Math.max(0, (def.def ?? 0) + bc.bonusDef)
}

function hasTaunt(battlefield: BattleCard[]): boolean {
  return battlefield.some(bc => !bc.tapped && getCard(bc.defId).keywords.includes('taunt'))
}

// ─────────────────────────────────────────────
//  State helpers (immutable pattern)
// ─────────────────────────────────────────────

function clone(state: GameState): GameState {
  return structuredClone(state)
}

function addLog(state: GameState, msg: string) {
  state.log = [msg, ...state.log].slice(0, 30)
}

function tapShards(state: GameState, who: 'player' | 'ai', cost: number) {
  const p = state[who]
  let remaining = cost
  for (const bc of p.battlefield) {
    if (remaining <= 0) break
    if (!bc.tapped && getCard(bc.defId).type === 'shard') {
      bc.tapped = true
      remaining--
    }
  }
  if (remaining > 0) {
    state[who].extraEnergy = Math.max(0, state[who].extraEnergy - remaining)
  }
}

function sendToGraveyard(p: PlayerState, uid: string): CardDef | null {
  const idx = p.battlefield.findIndex(bc => bc.uid === uid)
  if (idx === -1) return null
  const bc = p.battlefield.splice(idx, 1)[0]
  const def = getCard(bc.defId)
  p.graveyard.push(def)
  return def
}

function drawCard(state: GameState, who: 'player' | 'ai', count = 1) {
  for (let i = 0; i < count; i++) {
    const p = state[who]
    if (p.deck.length === 0) {
      const dmg = 2
      p.life -= dmg
      addLog(state, `💀 ${who === 'player' ? 'You have' : 'AI has'} no cards! Take ${dmg} damage.`)
      checkWinner(state)
      return
    }
    const card = p.deck.shift()!
    p.hand.push(card)
  }
}

function checkWinner(state: GameState) {
  if (state.player.life <= 0) {
    state.winner = 'ai'
    state.phase = 'game-over'
  } else if (state.ai.life <= 0) {
    state.winner = 'player'
    state.phase = 'game-over'
  }
}

// ─────────────────────────────────────────────
//  Actions
// ─────────────────────────────────────────────

/** Play a card from hand */
export function actionPlayCard(
  state: GameState,
  cardId: string,
  who: 'player' | 'ai',
  targetUid?: string
): GameState {
  const s = clone(state)
  const p = s[who]
  const cardIdx = p.hand.findIndex(c => c.id === cardId)
  if (cardIdx === -1) return state

  const card = p.hand[cardIdx]
  const energy = getEnergy(s, who)

  // Shards: free, but 1 per turn
  if (card.type === 'shard') {
    if (p.shardPlayedThisTurn) return state
    p.hand.splice(cardIdx, 1)
    const bc = makeBattleCard(card.id)
    bc.tapped = false
    bc.summonSick = false
    p.battlefield.push(bc)
    p.shardPlayedThisTurn = true
    addLog(s, `${who === 'player' ? '🟡 You play' : '🔵 AI plays'} ${card.name}`)
    return s
  }

  // Non-shards: cost energy
  if (energy < card.cost) return state
  tapShards(s, who, card.cost)
  p.hand.splice(cardIdx, 1)

  if (card.type === 'champion') {
    const hasRush = card.keywords.includes('rush')
    const bc = makeBattleCard(card.id, hasRush)
    p.battlefield.push(bc)
    addLog(s, `${who === 'player' ? '✨ You summon' : '🤖 AI summons'} ${card.name} (${card.atk}/${card.def})`)

    // On-enter effects
    if (card.keywords.includes('bounce') && targetUid) {
      applyBounce(s, who, targetUid)
    }
    if (card.name === 'Seraphine') {
      s[who].life += 2
      addLog(s, `💛 ${card.name}: +2 life → ${s[who].life}`)
    }
    if (card.keywords.includes('harvest')) {
      s[who].extraEnergy += 1
      addLog(s, `🌿 ${card.name}: +1 bonus energy this turn`)
    }
    if (card.name === 'Mizuki') {
      drawCard(s, who, 1)
      addLog(s, `🔮 Mizuki: draw 1 card`)
    }

    // Apply Power Core bonus if relic is in play
    const hasPowerCore = p.battlefield.some(b => b.defId === 'relic-powercore')
    if (hasPowerCore && card.type === 'champion') {
      bc.bonusAtk += 1
    }
  } else if (card.type === 'art') {
    applyArt(s, card, who, targetUid)
    p.graveyard.push(card)

    // Glitch counter-damage
    const opponent = who === 'player' ? 'ai' : 'player'
    s[opponent].battlefield.forEach(bc => {
      if (bc.defId === 'champ-glitch') {
        s[who].life -= 1
        addLog(s, `⚡ Glitch: counter-damage! ${who === 'player' ? 'You' : 'AI'} lose 1 life → ${s[who].life}`)
        checkWinner(s)
      }
    })
  } else if (card.type === 'relic') {
    const bc = makeBattleCard(card.id)
    bc.summonSick = false
    p.battlefield.push(bc)
    addLog(s, `${who === 'player' ? '💎 You play relic' : '🔵 AI plays relic'} ${card.name}`)

    if (card.id === 'relic-powercore') {
      p.battlefield.forEach(b => {
        if (getCard(b.defId).type === 'champion') b.bonusAtk += 1
      })
      addLog(s, `⚡ Power Core: all your champions gain +1 ATK`)
    }
  }

  checkWinner(s)
  return s
}

function applyBounce(s: GameState, who: 'player' | 'ai', targetUid: string) {
  const opponent = who === 'player' ? 'ai' : 'player'
  const p = s[opponent]
  const idx = p.battlefield.findIndex(bc => bc.uid === targetUid)
  if (idx === -1) return
  const bc = p.battlefield.splice(idx, 1)[0]
  const def = getCard(bc.defId)
  p.hand.push(def)
  addLog(s, `💨 Bounce: ${def.name} returned to ${opponent}'s hand`)
}

function applyArt(
  s: GameState,
  card: CardDef,
  who: 'player' | 'ai',
  targetUid?: string
) {
  const opponent = who === 'player' ? 'ai' : 'player'
  addLog(s, `${who === 'player' ? '✨ You cast' : '🤖 AI casts'} ${card.name}`)

  switch (card.id) {
    case 'art-holybeam': {
      if (!targetUid) return
      if (targetUid === 'opponent') {
        s[opponent].life -= 3
        addLog(s, `💛 Holy Beam: 3 damage to ${opponent} → ${s[opponent].life} life`)
        checkWinner(s)
      } else {
        dealDamageToCard(s, targetUid, 3, 'Holy Beam')
      }
      break
    }
    case 'art-divineshield': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === who) {
        res.card.bonusDef += 3
        addLog(s, `🛡️ Divine Shield: ${getCard(res.card.defId).name} +3 DEF`)
      }
      break
    }
    case 'art-tidalcrash': {
      const enemies = [...s[opponent].battlefield]
      for (const bc of enemies) {
        if (getCard(bc.defId).type !== 'shard') {
          dealDamageToCard(s, bc.uid, 2, 'Tidal Crash')
        }
      }
      break
    }
    case 'art-icelance': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === opponent) {
        res.card.tapped = true
        res.card.frozenTurns = 1
        addLog(s, `❄️ Ice Lance: ${getCard(res.card.defId).name} frozen`)
      }
      break
    }
    case 'art-fireball': {
      if (!targetUid) return
      if (targetUid === 'opponent') {
        s[opponent].life -= 4
        addLog(s, `🔥 Fireball: 4 damage to ${opponent} → ${s[opponent].life} life`)
        checkWinner(s)
      } else {
        dealDamageToCard(s, targetUid, 4, 'Fireball')
      }
      break
    }
    case 'art-blazingcharge': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === who) {
        res.card.bonusAtk += 2
        res.card.rushThisTurn = true
        res.card.summonSick = false
        addLog(s, `💨 Blazing Charge: ${getCard(res.card.defId).name} +2 ATK and Rush`)
      }
      break
    }
    case 'art-naturesembrace': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === who) {
        res.card.bonusAtk += 2
        res.card.bonusDef += 2
        addLog(s, `🌿 Nature's Embrace: ${getCard(res.card.defId).name} +2/+2`)
      }
      break
    }
    case 'art-systemcrash': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === opponent) {
        const def = getCard(res.card.defId)
        if (def.type !== 'shard') {
          sendToGraveyard(s[opponent], targetUid)
          addLog(s, `💥 System Crash: ${def.name} destroyed!`)
        }
      }
      break
    }
  }
}

function dealDamageToCard(s: GameState, targetUid: string, damage: number, source: string) {
  const res = getCardOnBattlefield(s, targetUid)
  if (!res) return
  const { card: bc, owner } = res
  const def = getCard(bc.defId)
  if (def.type === 'shard') return

  const currentDef = getEffectiveDef(bc)
  const newDef = currentDef - damage

  if (newDef <= 0) {
    // Would be destroyed
    if (def.keywords.includes('resilient') && !bc.resilientUsed) {
      bc.resilientUsed = true
      bc.bonusDef = -(currentDef - 1) // survive with 1
      addLog(s, `💚 ${def.name} is resilient! Survives with 1 DEF`)
    } else if (def.keywords.includes('rebirth') && !bc.rebirthDone) {
      bc.rebirthDone = true
      bc.bonusAtk = 1 - (def.atk ?? 0)
      bc.bonusDef = 1 - (def.def ?? 0)
      bc.tapped = false
      bc.summonSick = false
      addLog(s, `🔥 ${def.name} reborn as 1/1!`)
    } else {
      sendToGraveyard(s[owner], targetUid)
      addLog(s, `💀 ${def.name} destroyed by ${source}!`)
    }
  } else {
    bc.bonusDef -= damage
    addLog(s, `💢 ${source} → ${def.name} takes ${damage} damage (${Math.max(0, currentDef - damage)} DEF left)`)
  }
}

// ─────────────────────────────────────────────
//  Combat
// ─────────────────────────────────────────────

export function actionDeclareAttack(state: GameState): GameState {
  if (state.phase !== 'player-main') return state
  const s = clone(state)
  s.phase = 'player-attackers'
  s.combat = { attackerUids: [], blockerMap: {}, source: 'player' }
  addLog(s, '⚔  Declare attackers!')
  return s
}

export function actionToggleAttacker(state: GameState, uid: string): GameState {
  if (state.phase !== 'player-attackers') return state
  if (!state.combat) return state
  const s = clone(state)

  const bc = s.player.battlefield.find(b => b.uid === uid)
  if (!bc) return state
  const def = getCard(bc.defId)
  if (def.type === 'shard' || def.type === 'relic') return state
  if (bc.tapped) return state
  if (bc.summonSick && !bc.rushThisTurn) return state

  const idx = s.combat!.attackerUids.indexOf(uid)
  if (idx === -1) {
    s.combat!.attackerUids.push(uid)
    bc.attacking = true
  } else {
    s.combat!.attackerUids.splice(idx, 1)
    bc.attacking = false
  }
  return s
}

/** Player confirms attackers → AI assigns blockers automatically */
export function actionConfirmAttackers(state: GameState): GameState {
  if (!state.combat || state.combat.attackerUids.length === 0) {
    return actionEndMainPhase(state)
  }
  const s = clone(state)

  // AI auto-blocks (smart or random)
  const aiBlockers = s.ai.battlefield.filter(bc => {
    const def = getCard(bc.defId)
    return !bc.tapped && def.type === 'champion'
  })

  const attackers = s.combat!.attackerUids.map(uid => s.player.battlefield.find(b => b.uid === uid)!)
  const availableBlockers = [...aiBlockers]

  for (const attacker of attackers) {
    const attDef = getCard(attacker.defId)
    const attAtk = getEffectiveAtk(attacker)
    const hasFlying = attDef.keywords.includes('flying')
    const hasStealth = attDef.keywords.includes('stealth')

    // Find best blocker
    let bestBlocker: BattleCard | null = null
    let bestScore = -Infinity

    for (const blocker of availableBlockers) {
      const blkDef = getCard(blocker.defId)
      const blkAtk = getEffectiveAtk(blocker)
      const blkDef_ = getEffectiveDef(blocker)
      const blkFlying = blkDef.keywords.includes('flying')

      // Flying attackers can only be blocked by flying
      if (hasFlying && !blkFlying) continue
      // Stealth: can't be blocked by ATK ≤ 1
      if (hasStealth && blkAtk <= 1) continue

      // Score: prefer blocks where we kill attacker without dying
      const killsAttacker = blkAtk >= attDef.def! + attacker.bonusDef
      const survives = blkDef_ > attAtk
      let score = 0
      if (killsAttacker) score += 10
      if (survives) score += 5
      if (score < -5) continue // don't block if terrible trade

      if (score > bestScore) {
        bestScore = score
        bestBlocker = blocker
      }
    }

    if (bestBlocker) {
      s.combat!.blockerMap[attacker.uid] = bestBlocker.uid
      availableBlockers.splice(availableBlockers.indexOf(bestBlocker), 1)
      addLog(s, `🛡️ AI blocks ${getCard(attacker.defId).name} with ${getCard(bestBlocker.defId).name}`)
    } else {
      addLog(s, `⚡ ${getCard(attacker.defId).name} is unblocked!`)
    }
  }

  s.phase = 'combat-resolve'
  return s
}

/** Player assigns a blocker for a specific attacker */
export function actionAssignBlocker(
  state: GameState,
  attackerUid: string,
  blockerUid: string | null
): GameState {
  if (state.phase !== 'player-blockers') return state
  const s = clone(state)
  if (blockerUid === null) {
    delete s.combat!.blockerMap[attackerUid]
  } else {
    s.combat!.blockerMap[attackerUid] = blockerUid
    addLog(s, `🛡️ You block ${getCard(s.combat!.attackerUids.find(u => u === attackerUid) ? getCardOnBattlefield(s, attackerUid)!.card.defId : '')?.name ?? '?'} with ${getCard(s.player.battlefield.find(b => b.uid === blockerUid)!.defId).name}`)
  }
  return s
}

export function actionConfirmBlockers(state: GameState): GameState {
  if (state.phase !== 'player-blockers') return state
  const s = clone(state)
  s.phase = 'combat-resolve'
  return s
}

export function actionResolveCombat(state: GameState): GameState {
  if (state.phase !== 'combat-resolve' || !state.combat) return state
  const s = clone(state)
  const { attackerUids, blockerMap, source } = s.combat!

  const attOwner = source
  const defOwner = source === 'player' ? 'ai' : 'player'

  for (const attackerUid of attackerUids) {
    const attackerBc = s[attOwner].battlefield.find(bc => bc.uid === attackerUid)
    if (!attackerBc) continue

    const attDef = getCard(attackerBc.defId)
    const attAtk = getEffectiveAtk(attackerBc)
    const attDefStat = getEffectiveDef(attackerBc)

    attackerBc.tapped = true
    attackerBc.attacking = false

    const blockerUid = blockerMap[attackerUid]
    if (blockerUid) {
      const blockerBc = s[defOwner].battlefield.find(bc => bc.uid === blockerUid)
      if (!blockerBc) continue

      const blkDef = getCard(blockerBc.defId)
      const blkAtk = getEffectiveAtk(blockerBc)
      const blkDefStat = getEffectiveDef(blockerBc)

      addLog(s, `⚔  ${attDef.name} (${attAtk}/${attDefStat}) vs ${blkDef.name} (${blkAtk}/${blkDefStat})`)

      // Damage to blocker
      const newBlkDef = blkDefStat - attAtk
      // Damage to attacker
      const newAttDef = attDefStat - blkAtk

      // Trample: excess damage to opponent
      if (attDef.keywords.includes('trample') && newBlkDef < 0) {
        const excess = Math.abs(newBlkDef)
        s[defOwner].life -= excess
        addLog(s, `🌊 Trample: ${excess} damage to ${defOwner}! → ${s[defOwner].life} life`)
        checkWinner(s)
      }

      // Check deaths
      if (newBlkDef <= 0) {
        // Blocker dies
        if (blkDef.keywords.includes('resilient') && !blockerBc.resilientUsed) {
          blockerBc.resilientUsed = true
          addLog(s, `💚 ${blkDef.name} is resilient! Survives`)
          blockerBc.bonusDef = Math.max(1, blkDefStat) - (blkDef.def ?? 0) - blockerBc.bonusDef + 1
        } else if (blkDef.keywords.includes('rebirth') && !blockerBc.rebirthDone) {
          blockerBc.rebirthDone = true
          blockerBc.bonusAtk = 1 - (blkDef.atk ?? 0)
          blockerBc.bonusDef = 1 - (blkDef.def ?? 0)
          addLog(s, `🔥 ${blkDef.name} reborn as 1/1!`)
        } else {
          sendToGraveyard(s[defOwner], blockerUid)
          addLog(s, `💀 ${blkDef.name} destroyed!`)
        }
      } else {
        blockerBc.bonusDef -= attAtk
      }

      if (newAttDef <= 0) {
        // Attacker dies
        if (attDef.keywords.includes('resilient') && !attackerBc.resilientUsed) {
          attackerBc.resilientUsed = true
          addLog(s, `💚 ${attDef.name} is resilient! Survives`)
        } else if (attDef.keywords.includes('rebirth') && !attackerBc.rebirthDone) {
          attackerBc.rebirthDone = true
          attackerBc.bonusAtk = 1 - (attDef.atk ?? 0)
          attackerBc.bonusDef = 1 - (attDef.def ?? 0)
          addLog(s, `🔥 ${attDef.name} reborn as 1/1!`)
        } else {
          sendToGraveyard(s[attOwner], attackerUid)
          addLog(s, `💀 ${attDef.name} destroyed in battle!`)
        }
      } else {
        attackerBc.bonusDef -= blkAtk
      }
    } else {
      // Unblocked — deal damage to opponent
      s[defOwner].life -= attAtk
      addLog(s, `💥 ${attDef.name} hits ${defOwner} for ${attAtk}! → ${s[defOwner].life} life`)
      checkWinner(s)

      // Attacker effects when dealing damage
      if (attDef.keywords.includes('draw')) {
        drawCard(s, attOwner, 1)
        addLog(s, `📖 ${attDef.name}: draw a card`)
      }
      if (attDef.name === 'Exe' || (attDef.keywords.includes('draw') && attDef.type === 'champion')) {
        // already handled above
      }
      if (attDef.keywords.includes('freeze')) {
        // freeze chosen at random for AI or first enemy for player
        const enemies = s[defOwner].battlefield.filter(b => getCard(b.defId).type === 'champion')
        if (enemies.length > 0) {
          const target = enemies[0]
          target.tapped = true
          target.frozenTurns = 1
          addLog(s, `❄️ Freeze: ${getCard(target.defId).name} frozen`)
        }
      }
      if (attDef.name === 'Aria') {
        // Aria: deal 1 to random enemy champion when attacking (even if blocked, on attack)
      }
    }
  }

  // Aria's on-attack effect (when attacking, not on damage)
  for (const attackerUid of attackerUids) {
    const bc = s[attOwner].battlefield.find(b => b.uid === attackerUid)
    if (!bc) continue
    const def = getCard(bc.defId)
    if (def.id === 'champ-aria') {
      const enemies = s[defOwner].battlefield.filter(b => getCard(b.defId).type === 'champion')
      if (enemies.length > 0) {
        const target = enemies[Math.floor(Math.random() * enemies.length)]
        dealDamageToCard(s, target.uid, 1, 'Aria')
      }
    }
    if (def.id === 'champ-nova') {
      const enemies = s[defOwner].battlefield.filter(b => getCard(b.defId).type === 'champion')
      if (enemies.length > 0) {
        const target = enemies[0]
        target.bonusAtk -= 1
        target.bonusDef -= 1
        addLog(s, `⚡ Nova: ${getCard(target.defId).name} -1/-1 this turn`)
      }
    }
  }

  s.combat = null

  // Advance to correct main phase
  if (source === 'player') {
    s.phase = s.winner ? 'game-over' : 'player-main' // main2 (same screen)
    if (!s.winner) addLog(s, '⚔  Combat over. Main Phase 2.')
  } else {
    // AI attacked: back to AI turn (ai-turn handler will advance)
    s.phase = s.winner ? 'game-over' : 'ai-turn'
    if (!s.winner) addLog(s, '🤖 AI combat resolved. Continuing AI turn...')
  }

  return s
}

// ─────────────────────────────────────────────
//  Turn Management
// ─────────────────────────────────────────────

export function actionEndMainPhase(state: GameState): GameState {
  if (state.phase !== 'player-main') return state
  const s = clone(state)
  // Start AI turn
  s.phase = 'ai-turn'
  addLog(s, "🤖 AI's turn begins...")
  return s
}

export function actionStartAITurn(state: GameState): GameState {
  const s = clone(state)
  untapPhase(s, 'ai')
  drawPhase(s, 'ai')
  s.turn++
  return s
}

export function actionStartPlayerTurn(state: GameState): GameState {
  const s = clone(state)
  untapPhase(s, 'player')
  drawPhase(s, 'player')
  s.phase = 'player-main'
  s.turn++
  addLog(s, `🌟 Turn ${s.turn} — Your turn!`)
  return s
}

function untapPhase(s: GameState, who: 'player' | 'ai') {
  const p = s[who]
  p.shardPlayedThisTurn = false
  p.extraEnergy = 0

  // Crystal Amulet bonus
  const hasAmulet = p.battlefield.some(bc => bc.defId === 'relic-crystalamulet')
  if (hasAmulet) {
    p.extraEnergy += 1
    addLog(s, `💎 Crystal Amulet: +1 bonus energy`)
  }

  for (const bc of p.battlefield) {
    if (bc.frozenTurns > 0) {
      bc.frozenTurns--
      continue // skip untap
    }
    bc.tapped = false
    bc.summonSick = false
    bc.attacking = false
    bc.rushThisTurn = false
    // Clear temp buffs
    bc.bonusAtk = 0
    bc.bonusDef = 0
  }

  // Igna buff
  const igna = p.battlefield.find(bc => bc.defId === 'champ-igna')
  if (igna) {
    igna.bonusAtk += 1
    igna.bonusDef -= 1
    addLog(s, `🔥 Igna grows stronger: ${getEffectiveAtk(igna)}/${Math.max(0, getEffectiveDef(igna))}`)
  }

  // Regenerate
  const regCards = p.battlefield.filter(bc => getCard(bc.defId).keywords.includes('regenerate'))
  for (const bc of regCards) {
    p.life += 1
    addLog(s, `💚 ${getCard(bc.defId).name} regenerates: +1 life → ${p.life}`)
  }
}

function drawPhase(s: GameState, who: 'player' | 'ai') {
  drawCard(s, who, 1)
}

// ─────────────────────────────────────────────
//  AI Turn logic (called step by step from component)
// ─────────────────────────────────────────────

export function aiPlayCards(state: GameState): { newState: GameState; played: boolean } {
  const s = clone(state)
  const who = 'ai'
  let played = false

  const hand = [...s.ai.hand]

  // 1. Play a shard if we have one and haven't this turn
  if (!s.ai.shardPlayedThisTurn) {
    const shardInHand = hand.find(c => c.type === 'shard')
    if (shardInHand) {
      const ns = actionPlayCard(s, shardInHand.id, who)
      Object.assign(s, ns)
      played = true
      return { newState: s, played }
    }
  }

  // 2. Play best non-shard card we can afford
  const energy = getEnergy(s, who)
  const playable = hand
    .filter(c => c.type !== 'shard' && c.cost <= energy)
    .sort((a, b) => b.cost - a.cost)

  for (const card of playable) {
    let targetUid: string | undefined

    // Determine target for arts
    if (card.type === 'art') {
      targetUid = pickArtTarget(s, card.id, who)
      if (targetUid === null) continue // no valid target, skip
    } else if (card.keywords.includes('bounce')) {
      // pick a target for bounce on-entry
      const playerChamps = s.player.battlefield.filter(
        bc => getCard(bc.defId).type === 'champion'
      )
      if (playerChamps.length > 0) {
        targetUid = playerChamps[0].uid
      }
    }

    const ns = actionPlayCard(s, card.id, who, targetUid)
    if (ns !== s) {
      Object.assign(s, ns)
      played = true
      return { newState: s, played }
    }
  }

  return { newState: s, played: false }
}

function pickArtTarget(s: GameState, artId: string, who: 'ai' | 'player'): string | undefined {
  const opponent = who === 'player' ? 'ai' : 'player'
  const friendlyChamps = s[who].battlefield.filter(bc => getCard(bc.defId).type === 'champion')
  const enemyChamps = s[opponent].battlefield.filter(bc => getCard(bc.defId).type === 'champion')

  switch (artId) {
    case 'art-holybeam':
    case 'art-fireball':
    case 'art-systemcrash': {
      // Target highest ATK enemy champion, or go face if none
      if (enemyChamps.length === 0) return 'opponent'
      const best = enemyChamps.reduce((a, b) =>
        getEffectiveAtk(a) > getEffectiveAtk(b) ? a : b
      )
      return best.uid
    }
    case 'art-icelance': {
      if (enemyChamps.length === 0) return undefined
      return enemyChamps.reduce((a, b) =>
        getEffectiveAtk(a) > getEffectiveAtk(b) ? a : b
      ).uid
    }
    case 'art-tidalcrash':
      return undefined // no target needed
    case 'art-divineshield':
    case 'art-blazingcharge':
    case 'art-naturesembrace': {
      if (friendlyChamps.length === 0) return undefined
      return friendlyChamps.reduce((a, b) =>
        getEffectiveAtk(a) > getEffectiveAtk(b) ? a : b
      ).uid
    }
    default:
      return undefined
  }
}

export function aiDeclareAttackers(state: GameState): GameState {
  const s = clone(state)

  const attackers = s.ai.battlefield.filter(bc => {
    const def = getCard(bc.defId)
    return def.type === 'champion' && !bc.tapped && !bc.summonSick
  })

  if (attackers.length === 0) {
    return actionStartPlayerTurn(s)
  }

  // Determine which to attack with
  let selectedAttackers: BattleCard[]
  if (s.difficulty === 'easy') {
    selectedAttackers = attackers.filter(() => Math.random() > 0.4)
  } else {
    // Hard: attack with champions where benefit > risk
    const playerBlockers = s.player.battlefield.filter(bc =>
      getCard(bc.defId).type === 'champion' && !bc.tapped
    )
    if (playerBlockers.length === 0) {
      selectedAttackers = attackers
    } else {
      selectedAttackers = attackers.filter(atk => {
        const atkAtk = getEffectiveAtk(atk)
        const worstBlock = playerBlockers.reduce((best, b) =>
          getEffectiveAtk(b) > getEffectiveAtk(best) ? b : best
        )
        // Attack if we can kill blocker or if blocker's ATK won't kill us
        return atkAtk >= getEffectiveDef(worstBlock) || getEffectiveAtk(worstBlock) < getEffectiveDef(atk)
      })
      if (selectedAttackers.length === 0) selectedAttackers = attackers // attack anyway
    }
  }

  if (selectedAttackers.length === 0) {
    return actionStartPlayerTurn(s)
  }

  for (const bc of selectedAttackers) {
    bc.attacking = true
  }

  s.combat = {
    attackerUids: selectedAttackers.map(bc => bc.uid),
    blockerMap: {},
    source: 'ai',
  }

  s.phase = 'player-blockers'
  addLog(s, `🤖 AI attacks with ${selectedAttackers.length} champion(s)!`)
  return s
}
