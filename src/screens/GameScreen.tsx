import { useReducer, useEffect, useCallback, useState } from 'react'
import type { GameState, BattleCard, CardDef } from '../types'
import { getCard } from '../data/cards'
import {
  createGame, getEnergy, getCardOnBattlefield,
  actionPlayCard, actionDeclareAttack, actionToggleAttacker,
  actionConfirmAttackers, actionAssignBlocker, actionConfirmBlockers,
  actionResolveCombat, actionEndMainPhase,
  actionStartAITurn, actionStartPlayerTurn, aiPlayCards, aiDeclareAttackers,
  getEffectiveAtk, getEffectiveDef,
} from '../game/engine'
import { HandCard, BFieldCard, CardBack, ENERGY_COLORS } from '../components/CardComponent'
import { DECK_MAP } from '../data/decks'

// ═══════════════════════════════════════════════════════
//  Reducer
// ═══════════════════════════════════════════════════════

type Action =
  | { type: 'PLAY_CARD'; cardId: string; targetUid?: string }
  | { type: 'TOGGLE_ATTACKER'; uid: string }
  | { type: 'CONFIRM_ATTACKERS' }
  | { type: 'ASSIGN_BLOCKER'; attackerUid: string; blockerUid: string | null }
  | { type: 'CONFIRM_BLOCKERS' }
  | { type: 'RESOLVE_COMBAT' }
  | { type: 'END_MAIN' }
  | { type: 'DECLARE_ATTACK' }
  | { type: 'AI_START' }
  | { type: 'AI_PLAY_CARD' }
  | { type: 'AI_ATTACK' }
  | { type: 'PLAYER_START_TURN' }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'PLAY_CARD':
      return actionPlayCard(state, action.cardId, 'player', action.targetUid)
    case 'TOGGLE_ATTACKER':
      return actionToggleAttacker(state, action.uid)
    case 'CONFIRM_ATTACKERS':
      return actionConfirmAttackers(state)
    case 'ASSIGN_BLOCKER':
      return actionAssignBlocker(state, action.attackerUid, action.blockerUid)
    case 'CONFIRM_BLOCKERS':
      return actionConfirmBlockers(state)
    case 'RESOLVE_COMBAT':
      return actionResolveCombat(state)
    case 'END_MAIN':
      return actionEndMainPhase(state)
    case 'DECLARE_ATTACK':
      return actionDeclareAttack(state)
    case 'AI_START':
      return actionStartAITurn(state)
    case 'AI_PLAY_CARD': {
      const { newState } = aiPlayCards(state)
      return newState
    }
    case 'AI_ATTACK':
      return aiDeclareAttackers(state)
    case 'PLAYER_START_TURN':
      return actionStartPlayerTurn(state)
    default:
      return state
  }
}

// ═══════════════════════════════════════════════════════
//  Props
// ═══════════════════════════════════════════════════════

interface GameScreenProps {
  playerDeckId: string
  aiDeckId: string
  difficulty: 'easy' | 'hard'
  onExit: () => void
}

// ═══════════════════════════════════════════════════════
//  Component
// ═══════════════════════════════════════════════════════

export function GameScreen({ playerDeckId, aiDeckId, difficulty, onExit }: GameScreenProps) {
  const playerDeck = DECK_MAP[playerDeckId]
  const aiDeck = DECK_MAP[aiDeckId]

  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => createGame(playerDeck.deckIds, aiDeck.deckIds, difficulty)
  )

  // Spell/effect targeting state
  const [pendingSpell, setPendingSpell] = useState<CardDef | null>(null)
  const [selectedBlockerFor, setSelectedBlockerFor] = useState<string | null>(null)

  const energy = getEnergy(state, 'player')

  // ─── AI automation via useEffect ───
  useEffect(() => {
    if (state.phase === 'game-over' || state.winner) return

    if (state.phase === 'ai-turn') {
      // Step 1: untap + draw
      const t1 = setTimeout(() => dispatch({ type: 'AI_START' }), 400)
      return () => clearTimeout(t1)
    }

    if (state.phase === 'combat-resolve') {
      const t = setTimeout(() => dispatch({ type: 'RESOLVE_COMBAT' }), 600)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'ai-turn' || state.winner) return
    // After AI_START sets up turn, play cards and attack
    const { played } = aiPlayCards(state)
    if (played) {
      const t = setTimeout(() => dispatch({ type: 'AI_PLAY_CARD' }), 700)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => dispatch({ type: 'AI_ATTACK' }), 700)
      return () => clearTimeout(t)
    }
  }, [state.ai.hand.length, state.ai.battlefield.length, state.phase])

  // ─── Handlers ───

  const handleHandCardClick = useCallback((card: CardDef) => {
    if (state.phase !== 'player-main') return

    const needsTarget =
      card.type === 'art' && [
        'art-holybeam', 'art-icelance', 'art-fireball',
        'art-divineshield', 'art-blazingcharge', 'art-naturesembrace', 'art-systemcrash',
      ].includes(card.id)

    const needsBounceTarget = card.keywords.includes('bounce')

    if (needsTarget || needsBounceTarget) {
      setPendingSpell(prev => prev?.id === card.id ? null : card)
    } else {
      dispatch({ type: 'PLAY_CARD', cardId: card.id })
    }
  }, [state.phase])

  const handleBattleFieldClick = useCallback((uid: string, owner: 'player' | 'ai') => {
    const { phase } = state

    // Spell targeting
    if (pendingSpell) {
      const card = pendingSpell
      const isEnemy = owner === 'ai'
      const isFriendly = owner === 'player'

      if (card.type === 'art') {
        const needsEnemy = ['art-holybeam', 'art-icelance', 'art-fireball', 'art-systemcrash'].includes(card.id)
        const needsFriendly = ['art-divineshield', 'art-blazingcharge', 'art-naturesembrace'].includes(card.id)
        if (needsEnemy && !isEnemy) return
        if (needsFriendly && !isFriendly) return
      } else if (card.keywords.includes('bounce') && !isEnemy) return

      dispatch({ type: 'PLAY_CARD', cardId: card.id, targetUid: uid })
      setPendingSpell(null)
      return
    }

    // Attack declaration
    if (phase === 'player-attackers' && owner === 'player') {
      dispatch({ type: 'TOGGLE_ATTACKER', uid })
      return
    }

    // Blocker assignment
    if (phase === 'player-blockers' && owner === 'player') {
      if (selectedBlockerFor) {
        dispatch({ type: 'ASSIGN_BLOCKER', attackerUid: selectedBlockerFor, blockerUid: uid })
        setSelectedBlockerFor(null)
      }
    }
  }, [state.phase, pendingSpell, selectedBlockerFor])

  const handleFaceTarget = () => {
    if (pendingSpell && ['art-holybeam', 'art-fireball'].includes(pendingSpell.id)) {
      dispatch({ type: 'PLAY_CARD', cardId: pendingSpell.id, targetUid: 'opponent' })
      setPendingSpell(null)
    }
  }

  // ─── Render helpers ───

  function isCardSelectable(bc: BattleCard, owner: 'player' | 'ai'): boolean {
    const { phase } = state
    const def = getCard(bc.defId)

    if (pendingSpell) {
      if (pendingSpell.type === 'art') {
        const needsEnemy = ['art-holybeam', 'art-icelance', 'art-fireball', 'art-systemcrash'].includes(pendingSpell.id)
        const needsFriendly = ['art-divineshield', 'art-blazingcharge', 'art-naturesembrace'].includes(pendingSpell.id)
        if (needsEnemy) return owner === 'ai' && def.type !== 'shard'
        if (needsFriendly) return owner === 'player' && def.type === 'champion'
      }
      if (pendingSpell.keywords.includes('bounce')) return owner === 'ai' && def.type === 'champion'
    }

    if (phase === 'player-attackers' && owner === 'player') {
      return def.type === 'champion' && !bc.tapped && (!bc.summonSick || bc.rushThisTurn)
    }

    if (phase === 'player-blockers' && owner === 'player' && selectedBlockerFor) {
      return def.type === 'champion' && !bc.tapped
    }

    if (phase === 'player-blockers' && owner === 'ai' && !selectedBlockerFor) {
      return state.combat?.attackerUids.includes(bc.uid) ?? false
    }

    return false
  }

  if (state.phase === 'game-over') {
    return <GameOverScreen winner={state.winner} playerName={playerDeck.name} onExit={onExit} />
  }

const phaseLabel: Partial<Record<GamePhase, string>> = {
    'player-main': 'Your Turn',
    'player-attackers': 'Declare Attackers',
    'player-blockers': 'Assign Blockers',
    'combat-resolve': 'Combat...',
    'ai-turn': 'AI Thinking...',
    'game-over': 'Game Over',
  }

  const playerColor = ENERGY_COLORS[playerDeck.energyType]
  const aiColor = ENERGY_COLORS[aiDeck.energyType]

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* ── AI Area (top) ── */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        background: `linear-gradient(180deg, ${aiColor}0a, transparent)`,
      }}>
        {/* AI header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <LifeBar life={state.ai.life} color={aiColor} label={`AI — ${aiDeck.name}`} />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Hand: {state.ai.hand.length} · Deck: {state.ai.deck.length}
          </div>
        </div>
        {/* AI hand (face down) */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
          {state.ai.hand.map((_, i) => <CardBack key={i} />)}
        </div>
      </div>

      {/* ── AI Battlefield ── */}
      <div style={{
        padding: '8px 12px',
        minHeight: 100,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          AI Battlefield
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {state.ai.battlefield.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>Empty</div>
          ) : (
            state.ai.battlefield.map(bc => (
              <BFieldCard
                key={bc.uid}
                bc={bc}
                isEnemy
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
          )}
        </div>
      </div>

      {/* ── Center HUD ── */}
      <div style={{
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(0,0,0,0.3)',
        minHeight: 52,
      }}>
        {/* Phase badge */}
        <div style={{
          padding: '4px 12px', borderRadius: 20,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--border)',
          fontSize: 11, fontWeight: 600,
          letterSpacing: '0.08em',
          color: state.phase === 'ai-turn' ? aiColor :
                 state.phase === 'player-main' ? playerColor :
                 'var(--text)',
        }}>
          {phaseLabel[state.phase]}
        </div>

        {/* Turn counter */}
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Turn {state.turn}
        </div>

        {/* Energy */}
        {state.phase === 'player-main' && (
          <div style={{
            padding: '4px 10px', borderRadius: 20,
            background: `${playerColor}22`, border: `1px solid ${playerColor}44`,
            fontSize: 12, color: playerColor, fontWeight: 700,
          }}>
            ◆ {energy} energy
          </div>
        )}

        {/* Pending spell hint */}
        {pendingSpell && (
          <div style={{
            fontSize: 11, color: '#ffcc44',
            padding: '4px 10px', borderRadius: 20,
            background: 'rgba(255,204,68,0.12)',
            border: '1px solid rgba(255,204,68,0.3)',
          }}>
            🎯 Select target for {pendingSpell.name}
            {['art-holybeam', 'art-fireball'].includes(pendingSpell.id) && (
              <button
                onClick={handleFaceTarget}
                style={{
                  marginLeft: 8, background: 'transparent', border: 'none',
                  color: '#ff8888', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                }}
              >
                [Hit face]
              </button>
            )}
            <button
              onClick={() => setPendingSpell(null)}
              style={{
                marginLeft: 8, background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Blocker selection hint */}
        {state.phase === 'player-blockers' && selectedBlockerFor && (
          <div style={{
            fontSize: 11, color: '#88ff88',
            padding: '4px 10px', borderRadius: 20,
            background: 'rgba(39,174,96,0.12)',
            border: '1px solid rgba(39,174,96,0.3)',
          }}>
            🛡 Select a champion to block
            <button
              onClick={() => setSelectedBlockerFor(null)}
              style={{
                marginLeft: 8, background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {state.phase === 'player-main' && !pendingSpell && (
            <>
              <button
                className="btn btn-danger"
                onClick={() => dispatch({ type: 'DECLARE_ATTACK' })}
                style={{ padding: '6px 14px', fontSize: 11 }}
              >
                ⚔ Attack
              </button>
              <button
                className="btn"
                onClick={() => dispatch({ type: 'END_MAIN' })}
                style={{ padding: '6px 14px', fontSize: 11 }}
              >
                End Turn →
              </button>
            </>
          )}

          {state.phase === 'player-attackers' && (
            <button
              className="btn btn-danger"
              onClick={() => dispatch({ type: 'CONFIRM_ATTACKERS' })}
              style={{ padding: '6px 14px', fontSize: 11 }}
            >
              ✓ Send {state.combat?.attackerUids.length ?? 0}
            </button>
          )}

          {state.phase === 'player-blockers' && !selectedBlockerFor && (
            <button
              className="btn btn-success"
              onClick={() => dispatch({ type: 'CONFIRM_BLOCKERS' })}
              style={{ padding: '6px 14px', fontSize: 11 }}
            >
              ✓ Confirm Blocks
            </button>
          )}
        </div>
      </div>

      {/* ── Player Battlefield ── */}
      <div style={{
        padding: '8px 12px',
        minHeight: 100,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Your Battlefield
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {state.player.battlefield.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>Empty</div>
          ) : (
            state.player.battlefield.map(bc => (
              <BFieldCard
                key={bc.uid}
                bc={bc}
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
          )}
        </div>
      </div>

      {/* ── Player Hand ── */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid var(--border)',
        background: `linear-gradient(0deg, ${playerColor}0a, transparent)`,
        flex: 1, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
          <LifeBar life={state.player.life} color={playerColor} label={`You — ${playerDeck.name}`} />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Hand: {state.player.hand.length} · Deck: {state.player.deck.length}
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto',
          paddingBottom: 6, flex: 1, alignItems: 'flex-end',
        }}>
          {state.player.hand.map((card, i) => {
            const isAffordable = card.type === 'shard'
              ? !state.player.shardPlayedThisTurn
              : energy >= card.cost

            return (
              <HandCard
                key={`${card.id}-${i}`}
                card={card}
                canPlay={state.phase === 'player-main' && isAffordable}
                isSelected={pendingSpell?.id === card.id}
                onClick={() => handleHandCardClick(card)}
              />
            )
          })}
        </div>
      </div>

      {/* ── Game Log (floating) ── */}
      <div style={{
        position: 'fixed', right: 8, top: '50%',
        transform: 'translateY(-50%)',
        width: 170, maxHeight: '40vh',
        background: 'rgba(8,8,15,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        zIndex: 100,
      }}>
        <div style={{
          padding: '6px 10px',
          fontSize: 9, fontWeight: 700,
          color: 'var(--text-muted)', letterSpacing: '0.15em',
          textTransform: 'uppercase',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          Battle Log
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {state.log.slice(0, 10).map((msg, i) => (
            <div key={i} style={{
              padding: '4px 10px',
              fontSize: 10, lineHeight: 1.4,
              color: i === 0 ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              opacity: Math.max(0.3, 1 - i * 0.09),
            }}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Life Bar
// ─────────────────────────────────────────────

function LifeBar({ life, color, label }: { life: number; color: string; label: string }) {
  const pct = Math.max(0, Math.min(100, (life / 20) * 100))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 12, fontFamily: 'Cinzel, serif', color: 'var(--text-muted)', minWidth: 90 }}>
        {label}
      </div>
      <div style={{ width: 80, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 4,
          background: color, transition: 'width 0.4s ease',
          boxShadow: `0 0 6px ${color}`,
        }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color, minWidth: 30 }}>
        {life}❤
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Game Over
// ─────────────────────────────────────────────

function GameOverScreen({ winner, playerName, onExit }: {
  winner: 'player' | 'ai' | null
  playerName: string
  onExit: () => void
}) {
  const isWin = winner === 'player'

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24,
      background: isWin
        ? 'radial-gradient(ellipse at center, rgba(39,174,96,0.2), transparent 70%)'
        : 'radial-gradient(ellipse at center, rgba(232,64,64,0.2), transparent 70%)',
    }}>
      <div style={{ fontSize: 72 }}>
        {isWin ? '🏆' : '💀'}
      </div>

      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 'clamp(24px, 5vw, 40px)',
        color: isWin ? '#27ae60' : '#e84040',
        letterSpacing: '0.15em',
      }}>
        {isWin ? 'VICTORY!' : 'DEFEATED'}
      </div>

      <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
        {isWin
          ? `The ${playerName} goddesses have prevailed!`
          : 'The enemy faction has conquered the battlefield.'}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={onExit} style={{ padding: '12px 28px', fontSize: 13 }}>
          ← Back to Menu
        </button>
      </div>
    </div>
  )
}
