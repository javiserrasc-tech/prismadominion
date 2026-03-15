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
    shardsPlaced: 0,
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
    phase: 'player-shard',
    turn: 1,
    activePlayer: 'player',
    player: makePlayer(playerDeckIds),
    ai: makePlayer(aiDeckIds),
    combat: null,
    log: ['⚔  Battle begins! Choose your first shard.'],
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

  // Shards cannot be played from hand — they are placed at start of turn
  if (card.type === 'shard') return state

  // Non-shards: cost energy
  if (energy < card.cost) return state
  tapShards(s, who, card.cost)
  p.hand.splice(cardIdx, 1)

  if (card.type === 'champion') {
    const hasRush = card.keywords.includes('rush')
    const bc = makeBattleCard(card.id, hasRush)
    p.battlefield.push(bc)
    addLog(s, `${who === 'player' ? '✨ You summon' : '🤖 AI summons'} ${card.name} (${card.atk}/${card.def})`)

    // Bounce on enter
    if (card.keywords.includes('bounce') && targetUid) {
      applyBounce(s, who, targetUid)
    }
    // Daemon: bounce without keyword flag
    if (card.id === 'champ-daemon' && targetUid) {
      applyBounce(s, who, targetUid)
    }
    // Harvest: +1 energy
    if (card.keywords.includes('harvest')) {
      s[who].extraEnergy += 1
      addLog(s, `🌿 ${card.name}: +1 bonus energy this turn`)
    }
    // Life gain on enter
    const lifeOnEnter: Record<string, number> = {
      'champ-seraphine': 2, 'champ-celestia': 3, 'champ-briar': 1,
      'champ-worldtree': 4, 'champ-solara-prime': 5,
    }
    if (lifeOnEnter[card.id]) {
      s[who].life += lifeOnEnter[card.id]
      addLog(s, `💛 ${card.name}: +${lifeOnEnter[card.id]} life → ${s[who].life}`)
    }
    // Draw on enter
    const drawOnEnter = ['champ-mizuki', 'champ-prism']
    if (drawOnEnter.includes(card.id)) {
      drawCard(s, who, 1)
      addLog(s, `🔮 ${card.name}: draw 1 card`)
    }
    // Hex: deal 2 damage to target enemy on enter
    if (card.id === 'champ-hex' && targetUid) {
      dealDamageToCard(s, targetUid, 2, 'Hex')
    }
    // Aqua: deal 1 to all enemies on enter
    if (card.id === 'champ-aqua') {
      const opponent = who === 'player' ? 'ai' : 'player'
      const enemies = [...s[opponent].battlefield]
      for (const ebc of enemies) {
        if (getCard(ebc.defId).type !== 'shard') dealDamageToCard(s, ebc.uid, 1, 'Aqua')
      }
    }
    // Null: destroy target enemy relic on enter
    if (card.id === 'champ-null' && targetUid) {
      const opponent = who === 'player' ? 'ai' : 'player'
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === opponent && getCard(res.card.defId).type === 'relic') {
        sendToGraveyard(s[opponent], targetUid)
        addLog(s, `💥 Null: ${getCard(res.card.defId).name} destroyed!`)
      }
    }

    // Apply static relic buffs to new champion
    if (p.battlefield.some(b => b.defId === 'relic-powercore'))    { bc.bonusAtk += 1 }
    if (p.battlefield.some(b => b.defId === 'relic-quantumcore'))  { bc.bonusAtk += 1; bc.bonusDef += 1 }
    if (p.battlefield.some(b => b.defId === 'relic-halocrown'))    { bc.bonusDef += 2 }
    if (p.battlefield.some(b => b.defId === 'relic-canopyshield')) { bc.bonusDef += 2 }
    if (p.battlefield.some(b => b.defId === 'relic-arcticthrone')) { bc.bonusAtk += 1; bc.bonusDef += 2 }
    if (p.battlefield.some(b => b.defId === 'relic-forgeoffury'))  { bc.bonusAtk += 2 }

  } else if (card.type === 'art') {
    applyArt(s, card, who, targetUid)
    p.graveyard.push(card)

    // Glitch counter-damage
    const opponent = who === 'player' ? 'ai' : 'player'
    s[opponent].battlefield.forEach(bc => {
      if (bc.defId === 'champ-glitch') {
        s[who].life -= 1
        addLog(s, `⚡ Glitch: counter-damage! → ${s[who].life}`)
        checkWinner(s)
      }
    })
  } else if (card.type === 'relic') {
    const bc = makeBattleCard(card.id)
    bc.summonSick = false
    p.battlefield.push(bc)
    addLog(s, `${who === 'player' ? '💎 You play relic' : '🔵 AI plays relic'} ${card.name}`)

    // Apply static buffs to existing champions
    const buffAll = (atkBonus: number, defBonus: number) => {
      p.battlefield.forEach(b => {
        if (getCard(b.defId).type === 'champion') {
          b.bonusAtk += atkBonus
          b.bonusDef += defBonus
        }
      })
    }
    if (card.id === 'relic-powercore')    { buffAll(1, 0); addLog(s, `⚡ Power Core: +1 ATK to all champions`) }
    if (card.id === 'relic-quantumcore')  { buffAll(1, 1); addLog(s, `⚡ Quantum Core: +1/+1 to all champions`) }
    if (card.id === 'relic-halocrown')    { buffAll(0, 2); addLog(s, `👑 Halo Crown: +0/+2 to all champions`) }
    if (card.id === 'relic-canopyshield') { buffAll(0, 2); addLog(s, `🌿 Canopy Shield: +0/+2 to all champions`) }
    if (card.id === 'relic-arcticthrone') { buffAll(1, 2); addLog(s, `❄ Arctic Throne: +1/+2 to all champions`) }
    if (card.id === 'relic-forgeoffury')  { buffAll(2, 0); addLog(s, `🔥 Forge of Fury: +2 ATK to all champions`) }
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
    // ── Solara new arts ──
    case 'art-healinglight': {
      s[who].life += 4
      addLog(s, `💛 Healing Light: +4 life → ${s[who].life}`)
      break
    }
    case 'art-purify': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === who) {
        res.card.frozenTurns = 0
        res.card.bonusDef += 2
        addLog(s, `✨ Purify: ${getCard(res.card.defId).name} cleansed +0/+2`)
      }
      break
    }
    case 'art-radiantstrike': {
      const enemies = [...s[opponent].battlefield]
      for (const ebc of enemies) {
        if (getCard(ebc.defId).type !== 'shard') dealDamageToCard(s, ebc.uid, 2, 'Radiant Strike')
      }
      break
    }
    case 'art-blessing': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === who) {
        res.card.bonusAtk += 2; res.card.bonusDef += 2
        addLog(s, `💛 Blessing: ${getCard(res.card.defId).name} +2/+2`)
      }
      break
    }
    case 'art-solarflare': {
      if (!targetUid) return
      if (targetUid === 'opponent') {
        s[opponent].life -= 5
        addLog(s, `☀️ Solar Flare: 5 damage to ${opponent} → ${s[opponent].life}`)
        checkWinner(s)
      } else {
        dealDamageToCard(s, targetUid, 5, 'Solar Flare')
      }
      break
    }
    // ── Glacis new arts ──
    case 'art-whirlpool': {
      if (!targetUid) return
      applyBounce(s, who, targetUid)
      break
    }
    case 'art-frozentime': {
      s[opponent].battlefield.forEach(ebc => {
        if (getCard(ebc.defId).type !== 'shard') {
          ebc.tapped = true; ebc.frozenTurns = 1
        }
      })
      addLog(s, `❄ Frozen Time: all enemies frozen!`)
      break
    }
    case 'art-insight': {
      drawCard(s, who, 2)
      addLog(s, `📖 Insight: draw 2 cards`)
      break
    }
    case 'art-blizzard': {
      const enemies = [...s[opponent].battlefield]
      for (const ebc of enemies) {
        if (getCard(ebc.defId).type !== 'shard') {
          dealDamageToCard(s, ebc.uid, 1, 'Blizzard')
          const stillAlive = s[opponent].battlefield.find(b => b.uid === ebc.uid)
          if (stillAlive) { stillAlive.tapped = true }
        }
      }
      break
    }
    case 'art-countercurrent': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === opponent && res.card.tapped) {
        dealDamageToCard(s, targetUid, 3, 'Countercurrent')
      }
      break
    }
    // ── Ignis new arts ──
    case 'art-ignite': {
      if (!targetUid) return
      dealDamageToCard(s, targetUid, 2, 'Ignite')
      break
    }
    case 'art-inferno': {
      const enemies = [...s[opponent].battlefield]
      for (const ebc of enemies) {
        if (getCard(ebc.defId).type !== 'shard') dealDamageToCard(s, ebc.uid, 3, 'Inferno')
      }
      break
    }
    case 'art-heatwave': {
      s[who].battlefield.forEach(fbc => {
        if (getCard(fbc.defId).type === 'champion') fbc.bonusAtk += 2
      })
      addLog(s, `🔥 Heat Wave: all your champions +2 ATK this turn`)
      break
    }
    case 'art-eruption': {
      s[opponent].life -= 2
      addLog(s, `🌋 Eruption: 2 damage to ${opponent} → ${s[opponent].life}`)
      checkWinner(s)
      if (!s.winner && targetUid) dealDamageToCard(s, targetUid, 2, 'Eruption')
      break
    }
    case 'art-phoenixcall': {
      if (!targetUid) return
      const grave = s[who].graveyard.find(c => c.id === targetUid)
      if (grave) {
        s[who].graveyard = s[who].graveyard.filter(c => c !== grave)
        s[who].hand.push(grave)
        addLog(s, `🦅 Phoenix Call: ${grave.name} returned to hand`)
      }
      break
    }
    // ── Verdis new arts ──
    case 'art-entangle': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === opponent) {
        res.card.tapped = true; res.card.frozenTurns = 1
        addLog(s, `🌿 Entangle: ${getCard(res.card.defId).name} entangled`)
      }
      break
    }
    case 'art-regrowth': {
      if (!targetUid) return
      const grave = s[who].graveyard.find(c => c.id === targetUid)
      if (grave) {
        s[who].graveyard = s[who].graveyard.filter(c => c !== grave)
        s[who].hand.push(grave)
        addLog(s, `🌱 Regrowth: ${grave.name} returned to hand`)
      }
      break
    }
    case 'art-overgrowth': {
      s[who].battlefield.forEach(fbc => {
        if (getCard(fbc.defId).type === 'champion') { fbc.bonusAtk += 1; fbc.bonusDef += 2 }
      })
      addLog(s, `🌿 Overgrowth: all your champions +1/+2`)
      break
    }
    case 'art-sporecloud': {
      const enemies = [...s[opponent].battlefield]
      for (const ebc of enemies) {
        if (getCard(ebc.defId).type !== 'shard') {
          dealDamageToCard(s, ebc.uid, 1, 'Spore Cloud')
          const stillAlive = s[opponent].battlefield.find(b => b.uid === ebc.uid)
          if (stillAlive) stillAlive.tapped = true
        }
      }
      break
    }
    case 'art-ancientrite': {
      const champCount = s[who].battlefield.filter(bc => getCard(bc.defId).type === 'champion').length
      s[who].life += champCount * 2
      addLog(s, `🌿 Ancient Rite: +${champCount * 2} life → ${s[who].life}`)
      break
    }
    case 'art-verdantstorm': {
      if (!targetUid) return
      dealDamageToCard(s, targetUid, 3, 'Verdant Storm')
      s[who].life += 3
      addLog(s, `🌿 Verdant Storm: +3 life → ${s[who].life}`)
      break
    }
    // ── Aether new arts ──
    case 'art-datadrain': {
      if (!targetUid) return
      dealDamageToCard(s, targetUid, 2, 'Data Drain')
      drawCard(s, who, 1)
      addLog(s, `⚡ Data Drain: draw 1 card`)
      break
    }
    case 'art-overclock': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === who) {
        res.card.bonusAtk += 2
        res.card.rushThisTurn = true
        res.card.summonSick = false
        addLog(s, `⚡ Overclock: ${getCard(res.card.defId).name} +2 ATK + Rush`)
      }
      break
    }
    case 'art-ghostprotocol': {
      s[who].battlefield.forEach(fbc => {
        if (getCard(fbc.defId).type === 'champion') fbc.rushThisTurn = true
      })
      addLog(s, `👻 Ghost Protocol: all your champions gain Stealth this turn`)
      break
    }
    case 'art-nullpointer': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === opponent && res.card.tapped) {
        dealDamageToCard(s, targetUid, 3, 'Null Pointer')
      }
      break
    }
    case 'art-reboot': {
      if (!targetUid) return
      const grave = s[who].graveyard.find(c => c.id === targetUid)
      if (grave) {
        s[who].graveyard = s[who].graveyard.filter(c => c !== grave)
        s[who].hand.push(grave)
        addLog(s, `🔄 Reboot: ${grave.name} returned to hand`)
      }
      break
    }
    case 'art-firewall': {
      if (!targetUid) return
      const res = getCardOnBattlefield(s, targetUid)
      if (res && res.owner === who) {
        res.card.bonusDef += 4
        addLog(s, `🔥 Firewall: ${getCard(res.card.defId).name} +0/+4`)
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

// ─────────────────────────────────────────────
//  Shard placement (replaces old shard-from-hand)
// ─────────────────────────────────────────────

export const MAX_SHARDS = 10
export const SHARD_IDS: Record<import('../types').EnergyType, string> = {
  solara: 'shard-solara-a',
  glacis:  'shard-glacis-a',
  ignis:   'shard-ignis-a',
  verdis:  'shard-verdis-a',
  aether:  'shard-aether-a',
}

/** Player picks a shard color at the start of their turn */
export function actionPlaceShard(
  state: GameState,
  energyType: import('../types').EnergyType
): GameState {
  if (state.phase !== 'player-shard') return state
  const s = clone(state)
  const p = s.player
  const shardCount = p.battlefield.filter(bc => getCard(bc.defId).type === 'shard').length
  if (shardCount >= MAX_SHARDS) {
    // Already at max — just skip to main
    s.phase = 'player-main'
    addLog(s, `🌟 Turn ${s.turn} — Your turn!`)
    return s
  }
  const shardId = SHARD_IDS[energyType]
  const bc = makeBattleCard(shardId, false)
  bc.tapped = false
  bc.summonSick = false
  p.battlefield.push(bc)
  p.shardsPlaced = shardCount + 1
  addLog(s, `✦ You place a ${energyType} shard (${shardCount + 1}/${MAX_SHARDS})`)
  s.phase = 'player-main'
  addLog(s, `🌟 Turn ${s.turn} — Your turn!`)
  return s
}

/** AI places a shard — picks the color most useful for cards in hand */
function aiPlaceShard(s: GameState) {
  const p = s.ai
  const shardCount = p.battlefield.filter(bc => getCard(bc.defId).type === 'shard').length
  if (shardCount >= MAX_SHARDS) return

  // Count energy types in hand to pick best shard
  const handCounts: Partial<Record<import('../types').EnergyType, number>> = {}
  for (const card of p.hand) {
    if (card.type !== 'shard') {
      handCounts[card.energyType] = (handCounts[card.energyType] ?? 0) + 1
    }
  }
  // Also count existing shards to avoid too much of one type
  const shardCounts: Partial<Record<import('../types').EnergyType, number>> = {}
  for (const bc of p.battlefield) {
    const def = getCard(bc.defId)
    if (def.type === 'shard') {
      shardCounts[def.energyType] = (shardCounts[def.energyType] ?? 0) + 1
    }
  }

  const types: import('../types').EnergyType[] = ['solara','glacis','ignis','verdis','aether']
  // Pick type with most cards in hand, tiebreak by fewest existing shards
  const best = types.reduce((a, b) => {
    const scoreA = (handCounts[a] ?? 0) * 3 - (shardCounts[a] ?? 0)
    const scoreB = (handCounts[b] ?? 0) * 3 - (shardCounts[b] ?? 0)
    return scoreA >= scoreB ? a : b
  })

  const bc = makeBattleCard(SHARD_IDS[best], false)
  bc.tapped = false
  bc.summonSick = false
  p.battlefield.push(bc)
  p.shardsPlaced = shardCount + 1
  addLog(s, `🤖 AI places a ${best} shard (${shardCount + 1}/${MAX_SHARDS})`)
}

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
  aiPlaceShard(s)          // AI places its shard automatically
  drawPhase(s, 'ai')
  s.turn++
  return s
}

export function actionStartPlayerTurn(state: GameState): GameState {
  const s = clone(state)
  untapPhase(s, 'player')
  drawPhase(s, 'player')
  s.turn++
  const shardCount = s.player.battlefield.filter(bc => getCard(bc.defId).type === 'shard').length
  if (shardCount >= MAX_SHARDS) {
    // Already at 10 shards — skip shard phase
    s.phase = 'player-main'
    addLog(s, `🌟 Turn ${s.turn} — Your turn! (max shards reached)`)
  } else {
    s.phase = 'player-shard'
    addLog(s, `🌟 Turn ${s.turn} — Choose a shard color!`)
  }
  return s
}

function untapPhase(s: GameState, who: 'player' | 'ai') {
  const p = s[who]
  const opp = who === 'player' ? 'ai' : 'player'
  p.extraEnergy = 0

  // Energy relics: Crystal Amulet / War Drum / Root Network
  const energyRelics = ['relic-crystalamulet', 'relic-wardrum', 'relic-rootnetwork']
  for (const relicId of energyRelics) {
    if (p.battlefield.some(bc => bc.defId === relicId)) {
      p.extraEnergy += 1
      addLog(s, `💎 ${getCard(relicId).name}: +1 bonus energy`)
    }
  }

  // Sacred Banner: +1 life per champion
  if (p.battlefield.some(bc => bc.defId === 'relic-sacredbanner')) {
    const champCount = p.battlefield.filter(bc => getCard(bc.defId).type === 'champion').length
    if (champCount > 0) {
      p.life += champCount
      addLog(s, `🚩 Sacred Banner: +${champCount} life → ${p.life}`)
    }
  }

  // Druidic Altar: +2 life
  if (p.battlefield.some(bc => bc.defId === 'relic-druidicaltar')) {
    p.life += 2
    addLog(s, `🌿 Druidic Altar: +2 life → ${p.life}`)
  }

  // Draw relics: Tidecaller's Orb / Neural Link
  const drawRelics = ['relic-tidecallerorb', 'relic-neurallink']
  for (const relicId of drawRelics) {
    if (p.battlefield.some(bc => bc.defId === relicId)) {
      drawCard(s, who, 1)
      addLog(s, `📖 ${getCard(relicId).name}: draw 1 card`)
    }
  }

  // Ember Crown: 1 damage to random enemy champion
  if (p.battlefield.some(bc => bc.defId === 'relic-embercrown')) {
    const enemyChamps = s[opp].battlefield.filter(bc => getCard(bc.defId).type === 'champion')
    if (enemyChamps.length > 0) {
      const target = enemyChamps[Math.floor(Math.random() * enemyChamps.length)]
      dealDamageToCard(s, target.uid, 1, 'Ember Crown')
    }
  }

  // Frostwatch Tower: freeze random enemy permanent
  if (p.battlefield.some(bc => bc.defId === 'relic-frostwatch')) {
    const enemies = s[opp].battlefield.filter(bc => getCard(bc.defId).type !== 'shard')
    if (enemies.length > 0) {
      const target = enemies[Math.floor(Math.random() * enemies.length)]
      target.tapped = true
      target.frozenTurns = 1
      addLog(s, `❄ Frostwatch Tower: ${getCard(target.defId).name} frozen`)
    }
  }

  // Untap all cards (skip frozen)
  for (const bc of p.battlefield) {
    if (bc.frozenTurns > 0) { bc.frozenTurns--; continue }
    bc.tapped = false
    bc.summonSick = false
    bc.attacking = false
    bc.rushThisTurn = false
    bc.bonusAtk = 0
    bc.bonusDef = 0
  }

  // Igna: +1 ATK / -1 DEF each turn
  const igna = p.battlefield.find(bc => bc.defId === 'champ-igna')
  if (igna) {
    igna.bonusAtk += 1
    igna.bonusDef -= 1
    addLog(s, `🔥 Igna: ${getEffectiveAtk(igna)}/${Math.max(0, getEffectiveDef(igna))}`)
  }

  // Regenerate: +1 life per champion
  const regCards = p.battlefield.filter(bc => getCard(bc.defId).keywords.includes('regenerate'))
  for (const bc of regCards) {
    p.life += 1
    addLog(s, `💚 ${getCard(bc.defId).name}: +1 life → ${p.life}`)
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

  // Play best card we can afford
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
  const enemyChamps    = s[opponent].battlefield.filter(bc => getCard(bc.defId).type === 'champion')
  const tappedEnemies  = enemyChamps.filter(bc => bc.tapped)

  const highestAtkEnemy = () => enemyChamps.length === 0 ? undefined
    : enemyChamps.reduce((a, b) => getEffectiveAtk(a) > getEffectiveAtk(b) ? a : b).uid

  const highestAtkFriendly = () => friendlyChamps.length === 0 ? undefined
    : friendlyChamps.reduce((a, b) => getEffectiveAtk(a) > getEffectiveAtk(b) ? a : b).uid

  // Arts that hit enemy or face
  if (['art-holybeam','art-fireball','art-solarflare'].includes(artId)) {
    return enemyChamps.length === 0 ? 'opponent' : highestAtkEnemy()
  }
  // Arts that destroy targets
  if (['art-systemcrash'].includes(artId)) {
    if (enemyChamps.length === 0) return undefined
    return highestAtkEnemy()
  }
  // Arts that freeze/tap enemies
  if (['art-icelance','art-entangle'].includes(artId)) {
    return highestAtkEnemy()
  }
  // Arts that deal damage to a specific enemy champion
  if (['art-ignite','art-datadrain','art-verdantstorm','art-nullpointer'].includes(artId)) {
    if (artId === 'art-nullpointer') return tappedEnemies.length > 0
      ? tappedEnemies.reduce((a, b) => getEffectiveAtk(a) > getEffectiveAtk(b) ? a : b).uid
      : undefined
    return highestAtkEnemy()
  }
  // Arts with no target needed (AoE, self-effects)
  if (['art-tidalcrash','art-radiantstrike','art-inferno','art-heatwave',
       'art-frozentime','art-blizzard','art-sporecloud','art-overgrowth',
       'art-ancientrite','art-ghostprotocol','art-insight','art-healinglight',
       'art-eruption'].includes(artId)) {
    if (artId === 'art-eruption') return highestAtkEnemy() // for the champion part
    return undefined
  }
  // Arts that buff friendly champion
  if (['art-divineshield','art-blazingcharge','art-naturesembrace','art-blessing',
       'art-purify','art-overclock','art-firewall'].includes(artId)) {
    return highestAtkFriendly()
  }
  // Graveyard arts — pick first champion in graveyard
  if (['art-phoenixcall','art-regrowth','art-reboot'].includes(artId)) {
    const gravChamp = s[who].graveyard.find(c => c.type === 'champion')
    return gravChamp?.id
  }
  // Bounce
  if (artId === 'art-whirlpool') return highestAtkEnemy()

  return undefined
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
