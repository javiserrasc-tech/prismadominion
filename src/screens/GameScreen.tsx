import { useReducer, useEffect, useCallback, useState } from 'react'
import type { GameState, BattleCard, CardDef, GamePhase } from '../types'
import { getCard } from '../data/cards'
import {
  createGame, getEnergy,
  actionPlayCard, actionDeclareAttack, actionToggleAttacker,
  actionConfirmAttackers, actionAssignBlocker, actionConfirmBlockers,
  actionResolveCombat, actionEndMainPhase,
  actionStartAITurn, actionStartPlayerTurn, aiPlayCards, aiDeclareAttackers,
} from '../game/engine'
import { HandCard, BFieldCard, ShardToken, CardBack, ENERGY_COLORS } from '../components/CardComponent'
import { DECK_MAP } from '../data/decks'


// ─── Reducer ─────────────────────────────────────────

type Action =
  | { type: 'PLAY_CARD'; cardId: string; targetUid?: string }
  | { type: 'TOGGLE_ATTACKER'; uid: string }
  | { type: 'CONFIRM_ATTACKERS' }
  | { type: 'ASSIGN_BLOCKER'; attackerUid: string; blockerUid: string | null }
  | { type: 'CONFIRM_BLOCKERS' }
  | { type: 'RESOLVE_COMBAT' }
  | { type: 'END_MAIN' }
  | { type: 'DECLARE_ATTACK' }
  | { type: 'CANCEL_ATTACK' }
  | { type: 'AI_START' }
  | { type: 'AI_PLAY_CARD' }
  | { type: 'AI_ATTACK' }
  | { type: 'PLAYER_START_TURN' }

function cancelAttack(state: GameState): GameState {
  const s = structuredClone(state)
  s.phase = 'player-main'
  s.combat = null
  for (const bc of s.player.battlefield) { bc.attacking = false }
  return s
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'PLAY_CARD':         return actionPlayCard(state, action.cardId, 'player', action.targetUid)
    case 'TOGGLE_ATTACKER':   return actionToggleAttacker(state, action.uid)
    case 'CONFIRM_ATTACKERS': return actionConfirmAttackers(state)
    case 'ASSIGN_BLOCKER':    return actionAssignBlocker(state, action.attackerUid, action.blockerUid)
    case 'CONFIRM_BLOCKERS':  return actionConfirmBlockers(state)
    case 'RESOLVE_COMBAT':    return actionResolveCombat(state)
    case 'END_MAIN':          return actionEndMainPhase(state)
    case 'DECLARE_ATTACK':    return actionDeclareAttack(state)
    case 'CANCEL_ATTACK':     return cancelAttack(state)
    case 'AI_START':          return actionStartAITurn(state)
    case 'AI_PLAY_CARD':      return aiPlayCards(state).newState
    case 'AI_ATTACK':         return aiDeclareAttackers(state)
    case 'PLAYER_START_TURN': return actionStartPlayerTurn(state)
    default:                  return state
  }
}

// ─── Props ────────────────────────────────────────────

interface GameScreenProps {
  playerDeckId: string; aiDeckId: string
  difficulty: 'easy' | 'hard'; onExit: () => void
}

// ─── Component ───────────────────────────────────────

export function GameScreen({ playerDeckId, aiDeckId, difficulty, onExit }: GameScreenProps) {
  const playerDeck = DECK_MAP[playerDeckId]
  const aiDeck     = DECK_MAP[aiDeckId]

  const [state, dispatch] = useReducer(
    reducer, null,
    () => createGame(playerDeck.deckIds, aiDeck.deckIds, difficulty)
  )

  const [pendingSpell, setPendingSpell]           = useState<CardDef | null>(null)
  const [selectedBlockerFor, setSelectedBlockerFor] = useState<string | null>(null)
  const [showLog, setShowLog]                     = useState(false)

  const energy = getEnergy(state, 'player')

  // ─── AI automation ───
  useEffect(() => {
    if (state.phase === 'game-over' || state.winner) return
    if (state.phase === 'ai-turn') {
      const t = setTimeout(() => dispatch({ type: 'AI_START' }), 400)
      return () => clearTimeout(t)
    }
    if (state.phase === 'combat-resolve') {
      const t = setTimeout(() => dispatch({ type: 'RESOLVE_COMBAT' }), 600)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'ai-turn' || state.winner) return
    const { played } = aiPlayCards(state)
    const t = setTimeout(() => dispatch({ type: played ? 'AI_PLAY_CARD' : 'AI_ATTACK' }), 700)
    return () => clearTimeout(t)
  }, [state.ai.hand.length, state.ai.battlefield.length, state.phase])

  // ─── Handlers ───

  const handleHandCardClick = useCallback((card: CardDef) => {
    if (state.phase !== 'player-main') return
    const needsTarget = card.type === 'art' && [
      'art-holybeam','art-icelance','art-fireball',
      'art-divineshield','art-blazingcharge','art-naturesembrace','art-systemcrash',
    ].includes(card.id)
    const needsBounce = card.keywords.includes('bounce')
    if (needsTarget || needsBounce) {
      setPendingSpell(prev => prev?.id === card.id ? null : card)
    } else {
      dispatch({ type: 'PLAY_CARD', cardId: card.id })
    }
  }, [state.phase])

  const handleBattleFieldClick = useCallback((uid: string, owner: 'player' | 'ai') => {
    const { phase } = state
    if (pendingSpell) {
      const card = pendingSpell
      const isEnemy = owner === 'ai'
      const isFriendly = owner === 'player'
      if (card.type === 'art') {
        const needsEnemy    = ['art-holybeam','art-icelance','art-fireball','art-systemcrash'].includes(card.id)
        const needsFriendly = ['art-divineshield','art-blazingcharge','art-naturesembrace'].includes(card.id)
        if (needsEnemy && !isEnemy) return
        if (needsFriendly && !isFriendly) return
      } else if (card.keywords.includes('bounce') && !isEnemy) return
      dispatch({ type: 'PLAY_CARD', cardId: card.id, targetUid: uid })
      setPendingSpell(null)
      return
    }
    if (phase === 'player-attackers' && owner === 'player') {
      dispatch({ type: 'TOGGLE_ATTACKER', uid }); return
    }
    if (phase === 'player-blockers' && owner === 'player' && selectedBlockerFor) {
      dispatch({ type: 'ASSIGN_BLOCKER', attackerUid: selectedBlockerFor, blockerUid: uid })
      setSelectedBlockerFor(null)
    }
  }, [state.phase, pendingSpell, selectedBlockerFor])

  const handleFaceTarget = () => {
    if (pendingSpell && ['art-holybeam','art-fireball'].includes(pendingSpell.id)) {
      dispatch({ type: 'PLAY_CARD', cardId: pendingSpell.id, targetUid: 'opponent' })
      setPendingSpell(null)
    }
  }

  function isCardSelectable(bc: BattleCard, owner: 'player' | 'ai'): boolean {
    const { phase } = state
    const def = getCard(bc.defId)
    if (pendingSpell) {
      if (pendingSpell.type === 'art') {
        const needsEnemy    = ['art-holybeam','art-icelance','art-fireball','art-systemcrash'].includes(pendingSpell.id)
        const needsFriendly = ['art-divineshield','art-blazingcharge','art-naturesembrace'].includes(pendingSpell.id)
        if (needsEnemy)    return owner === 'ai' && def.type !== 'shard'
        if (needsFriendly) return owner === 'player' && def.type === 'champion'
      }
      if (pendingSpell.keywords.includes('bounce')) return owner === 'ai' && def.type === 'champion'
    }
    if (phase === 'player-attackers' && owner === 'player')
      return def.type === 'champion' && !bc.tapped && (!bc.summonSick || bc.rushThisTurn)
    if (phase === 'player-blockers' && owner === 'player' && selectedBlockerFor)
      return def.type === 'champion' && !bc.tapped
    if (phase === 'player-blockers' && owner === 'ai' && !selectedBlockerFor)
      return state.combat?.attackerUids.includes(bc.uid) ?? false
    return false
  }

  if (state.phase === 'game-over') {
    return <GameOverScreen winner={state.winner} playerName={playerDeck.name} onExit={onExit} />
  }

  const phaseLabel: Partial<Record<GamePhase, string>> = {
    'player-main':      '✦ Your Turn',
    'player-attackers': '⚔ Declare Attackers',
    'player-blockers':  '🛡 Assign Blockers',
    'combat-resolve':   '💥 Combat...',
    'ai-turn':          '🤖 AI Turn',
    'game-over':        'Game Over',
  }

  const playerColor = ENERGY_COLORS[playerDeck.energyType]
  const aiColor     = ENERGY_COLORS[aiDeck.energyType]

  // Split battlefield into shards and non-shards
  const playerShards    = state.player.battlefield.filter(bc => getCard(bc.defId).type === 'shard')
  const playerPermanents = state.player.battlefield.filter(bc => getCard(bc.defId).type !== 'shard')
  const aiShards         = state.ai.battlefield.filter(bc => getCard(bc.defId).type === 'shard')
  const aiPermanents     = state.ai.battlefield.filter(bc => getCard(bc.defId).type !== 'shard')

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', overflow: 'hidden',
    }}>

      {/* ══ AI ZONE ══ */}
      <div style={{
        padding: '6px 12px',
        borderBottom: '1px solid var(--border)',
        background: `linear-gradient(180deg, ${aiColor}0d, transparent)`,
      }}>
        {/* AI header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <LifeBar life={state.ai.life} color={aiColor} label={`AI · ${aiDeck.name}`} />
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            ✋{state.ai.hand.length}  📚{state.ai.deck.length}
          </div>
        </div>
        {/* AI hand face-down */}
        <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 3, alignItems: 'center' }}>
          {state.ai.hand.map((_, i) => <CardBack key={i} />)}
        </div>
      </div>

      {/* ══ AI BATTLEFIELD ══ */}
      <div style={{ padding: '6px 12px', minHeight: 108, borderBottom: '1px solid rgba(200,160,255,0.04)' }}>
        <div style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          AI Field
        </div>
        {/* AI permanents */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', marginBottom: aiShards.length ? 5 : 0 }}>
          {aiPermanents.length === 0
            ? <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>—</div>
            : aiPermanents.map(bc => (
              <BFieldCard
                key={bc.uid} bc={bc} isEnemy
                isSelectable={isCardSelectable(bc, 'ai')}
                isAttacking={bc.attacking}
                isSelected={
                  (state.phase === 'player-blockers' && !selectedBlockerFor && state.combat?.attackerUids.includes(bc.uid)) ||
                  isCardSelectable(bc, 'ai')
                }
                onClick={() => {
                  if (state.phase === 'player-blockers' && !selectedBlockerFor && state.combat?.attackerUids.includes(bc.uid)) {
                    setSelectedBlockerFor(bc.uid)
                  } else {
                    handleBattleFieldClick(bc.uid, 'ai')
                  }
                }}
              />
            ))
          }
        </div>
        {/* AI shard zone */}
        {aiShards.length > 0 && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 8, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 2 }}>Shards</span>
            {aiShards.map(bc => <ShardToken key={bc.uid} bc={bc} />)}
          </div>
        )}
      </div>

      {/* ══ CENTER HUD ══ */}
      <div style={{
        padding: '6px 12px',
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        borderBottom: '1px solid rgba(200,160,255,0.04)',
        background: 'rgba(13,11,26,0.7)',
        minHeight: 46,
      }}>
        {/* Phase pill */}
        <div style={{
          padding: '4px 12px', borderRadius: 20,
          background: 'rgba(199,125,255,0.08)',
          border: '1px solid var(--border)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          color: state.phase === 'ai-turn' ? aiColor
               : state.phase === 'player-main' ? playerColor
               : 'var(--text)',
        }}>
          {phaseLabel[state.phase]}
        </div>

        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>T{state.turn}</div>

        {state.phase === 'player-main' && (
          <div style={{
            padding: '3px 10px', borderRadius: 20,
            background: `${playerColor}1a`, border: `1px solid ${playerColor}55`,
            fontSize: 11, color: playerColor, fontWeight: 700,
          }}>◆ {energy}</div>
        )}

        {/* Pending spell hint */}
        {pendingSpell && (
          <div style={{
            fontSize: 10, color: '#ffd166',
            padding: '3px 10px', borderRadius: 20,
            background: 'rgba(255,209,102,0.1)',
            border: '1px solid rgba(255,209,102,0.3)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            🎯 {pendingSpell.name}
            {['art-holybeam','art-fireball'].includes(pendingSpell.id) && (
              <button onClick={handleFaceTarget} style={{
                background: 'transparent', border: 'none',
                color: '#ff6b8a', cursor: 'pointer', fontSize: 10, fontWeight: 700, padding: 0,
              }}>→ face</button>
            )}
            <button onClick={() => setPendingSpell(null)} style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1,
            }}>✕</button>
          </div>
        )}

        {/* Blocker hint */}
        {state.phase === 'player-blockers' && selectedBlockerFor && (
          <div style={{
            fontSize: 10, color: 'var(--verdis)',
            padding: '3px 10px', borderRadius: 20,
            background: 'rgba(122,229,130,0.1)',
            border: '1px solid rgba(122,229,130,0.3)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            🛡 Pick blocker
            <button onClick={() => setSelectedBlockerFor(null)} style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1,
            }}>✕</button>
          </div>
        )}

        {/* Action buttons — right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, alignItems: 'center' }}>
          {/* Log toggle */}
          <button
            className="btn"
            onClick={() => setShowLog(v => !v)}
            style={{ padding: '4px 10px', fontSize: 10, borderColor: showLog ? 'var(--accent)' : undefined, color: showLog ? 'var(--accent)' : undefined }}
          >
            📜 Log
          </button>

          {state.phase === 'player-main' && !pendingSpell && (
            <>
              <button className="btn btn-danger" onClick={() => dispatch({ type: 'DECLARE_ATTACK' })} style={{ padding: '5px 12px', fontSize: 10 }}>
                ⚔ Attack
              </button>
              <button className="btn" onClick={() => dispatch({ type: 'END_MAIN' })} style={{ padding: '5px 12px', fontSize: 10 }}>
                End Turn →
              </button>
            </>
          )}

          {state.phase === 'player-attackers' && (
            <>
              <button className="btn btn-cancel" onClick={() => dispatch({ type: 'CANCEL_ATTACK' })} style={{ padding: '5px 12px', fontSize: 10 }}>
                ✕ Cancel
              </button>
              <button className="btn btn-danger" onClick={() => dispatch({ type: 'CONFIRM_ATTACKERS' })} style={{ padding: '5px 12px', fontSize: 10 }}>
                ✓ Send {state.combat?.attackerUids.length ?? 0}
              </button>
            </>
          )}

          {state.phase === 'player-blockers' && !selectedBlockerFor && (
            <button className="btn btn-success" onClick={() => dispatch({ type: 'CONFIRM_BLOCKERS' })} style={{ padding: '5px 12px', fontSize: 10 }}>
              ✓ Confirm Blocks
            </button>
          )}
        </div>
      </div>

      {/* ══ PLAYER BATTLEFIELD ══ */}
      <div style={{ padding: '6px 12px', minHeight: 108, borderBottom: '1px solid rgba(200,160,255,0.04)' }}>
        <div style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Your Field
        </div>
        {/* Player permanents */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', marginBottom: playerShards.length ? 5 : 0 }}>
          {playerPermanents.length === 0
            ? <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>—</div>
            : playerPermanents.map(bc => (
              <BFieldCard
                key={bc.uid} bc={bc}
                isSelectable={isCardSelectable(bc, 'player')}
                isSelected={
                  state.combat?.attackerUids.includes(bc.uid) ||
                  (state.phase === 'player-blockers' && Object.values(state.combat?.blockerMap ?? {}).includes(bc.uid))
                }
                isAttacking={bc.attacking}
                isBlocking={
                  !!state.combat?.blockerMap &&
                  Object.values(state.combat.blockerMap).includes(bc.uid)
                }
                onClick={() => handleBattleFieldClick(bc.uid, 'player')}
              />
            ))
          }
        </div>
        {/* Player shard zone */}
        {playerShards.length > 0 && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 8, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 2 }}>Shards</span>
            {playerShards.map(bc => <ShardToken key={bc.uid} bc={bc} />)}
          </div>
        )}
      </div>

      {/* ══ PLAYER HAND ══ */}
      <div style={{
        padding: '6px 12px',
        borderTop: '1px solid var(--border)',
        background: `linear-gradient(0deg, ${playerColor}0d, transparent)`,
        flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
          <LifeBar life={state.player.life} color={playerColor} label={`You · ${playerDeck.name}`} />
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            ✋{state.player.hand.length}  📚{state.player.deck.length}
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 5, overflowX: 'auto',
          paddingBottom: 6, flex: 1, alignItems: 'flex-end',
        }}>
          {state.player.hand.map((card, i) => {
            const isAffordable = card.type === 'shard'
              ? !state.player.shardPlayedThisTurn
              : energy >= card.cost
            return (
              <HandCard
                key={`${card.id}-${i}`} card={card}
                canPlay={state.phase === 'player-main' && isAffordable}
                isSelected={pendingSpell?.id === card.id}
                onClick={() => handleHandCardClick(card)}
              />
            )
          })}
        </div>
      </div>

      {/* ══ BATTLE LOG (dropdown, not fixed) ══ */}
      {showLog && (
        <div style={{
          position: 'absolute', top: 52, right: 12, zIndex: 200,
          width: 220, maxHeight: '50vh',
          background: 'rgba(13,11,26,0.97)',
          border: '1px solid var(--accent)',
          borderRadius: 12, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 4px 24px rgba(199,125,255,0.25)',
        }}>
          <div style={{
            padding: '7px 12px',
            fontSize: 9, fontWeight: 700, color: 'var(--accent)',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            borderBottom: '1px solid rgba(199,125,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            Battle Log
            <button onClick={() => setShowLog(false)} style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, lineHeight: 1,
            }}>✕</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {state.log.slice(0, 20).map((msg, i) => (
              <div key={i} style={{
                padding: '4px 12px', fontSize: 10, lineHeight: 1.5,
                color: i === 0 ? 'var(--text)' : 'var(--text-muted)',
                borderBottom: '1px solid rgba(200,160,255,0.04)',
                opacity: Math.max(0.3, 1 - i * 0.05),
              }}>{msg}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Life Bar ─────────────────────────────────────────

function LifeBar({ life, color, label }: { life: number; color: string; label: string }) {
  const pct = Math.max(0, Math.min(100, (life / 20) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', color: 'var(--text-muted)', minWidth: 100 }}>
        {label}
      </div>
      <div style={{ width: 80, height: 6, borderRadius: 3, background: 'rgba(200,160,255,0.1)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 3,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          transition: 'width 0.4s ease', boxShadow: `0 0 6px ${color}`,
        }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color, minWidth: 30 }}>
        {life}♥
      </div>
    </div>
  )
}

// ─── Game Over ────────────────────────────────────────

function GameOverScreen({ winner, playerName, onExit }: {
  winner: 'player' | 'ai' | null; playerName: string; onExit: () => void
}) {
  const isWin = winner === 'player'
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
      background: isWin
        ? 'radial-gradient(ellipse at center, rgba(199,125,255,0.25), transparent 70%)'
        : 'radial-gradient(ellipse at center, rgba(255,107,138,0.2), transparent 70%)',
    }}>
      <div style={{ fontSize: 72 }}>{isWin ? '🏆' : '💀'}</div>
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 'clamp(24px, 5vw, 40px)',
        color: isWin ? '#c77dff' : '#ff6b8a',
        letterSpacing: '0.15em',
        textShadow: isWin ? '0 0 30px rgba(199,125,255,0.7)' : '0 0 30px rgba(255,107,138,0.7)',
      }}>
        {isWin ? 'VICTORY!' : 'DEFEATED'}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
        {isWin
          ? `The ${playerName} goddesses have prevailed!`
          : 'The enemy faction has conquered the battlefield.'}
      </div>
      <button className="btn btn-primary" onClick={onExit} style={{ padding: '12px 32px', fontSize: 13 }}>
        ← Back to Menu
      </button>
    </div>
  )
}
