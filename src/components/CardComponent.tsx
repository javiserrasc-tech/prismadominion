import type { CardDef, BattleCard, EnergyType, Keyword } from '../types'
import { getCard, CARDS } from '../data/cards'
import { getEffectiveAtk, getEffectiveDef } from '../game/engine'

// ═══════════════════════════════════════════════════════
//  Color maps
// ═══════════════════════════════════════════════════════

export const ENERGY_COLORS: Record<EnergyType, string> = {
  solara: '#f5a623',
  glacis: '#4a90d9',
  ignis:  '#e84040',
  verdis: '#27ae60',
  aether: '#9b59b6',
}

export const ENERGY_BG: Record<EnergyType, string> = {
  solara: 'rgba(245,166,35,0.12)',
  glacis: 'rgba(74,144,217,0.12)',
  ignis:  'rgba(232,64,64,0.12)',
  verdis: 'rgba(39,174,96,0.12)',
  aether: 'rgba(155,89,182,0.12)',
}

export const ENERGY_GLOW: Record<EnergyType, string> = {
  solara: 'rgba(245,166,35,0.5)',
  glacis: 'rgba(74,144,217,0.5)',
  ignis:  'rgba(232,64,64,0.5)',
  verdis: 'rgba(39,174,96,0.5)',
  aether: 'rgba(155,89,182,0.5)',
}

const KW_ICONS: Record<Keyword, string> = {
  rush:       '⚡',
  flying:     '🕊',
  taunt:      '🛡',
  trample:    '🌊',
  freeze:     '❄',
  draw:       '📖',
  bounce:     '💨',
  regenerate: '💚',
  harvest:    '🌿',
  resilient:  '💎',
  stealth:    '👻',
  rebirth:    '🔥',
}

// ═══════════════════════════════════════════════════════
//  Hand Card: full card shown in player's hand
// ═══════════════════════════════════════════════════════

interface HandCardProps {
  card: CardDef
  canPlay: boolean
  isSelected?: boolean
  onClick: () => void
}

export function HandCard({ card, canPlay, isSelected, onClick }: HandCardProps) {
  const color = ENERGY_COLORS[card.energyType]
  const bg = ENERGY_BG[card.energyType]
  const glow = ENERGY_GLOW[card.energyType]

  return (
    <div
      onClick={canPlay ? onClick : undefined}
      style={{
        position: 'relative',
        width: 90,
        minHeight: 130,
        borderRadius: 10,
        border: `1.5px solid ${isSelected ? color : 'rgba(255,255,255,0.15)'}`,
        background: isSelected ? bg : 'var(--bg-card)',
        boxShadow: isSelected ? `0 0 14px ${glow}, 0 4px 20px rgba(0,0,0,0.5)` : '0 4px 12px rgba(0,0,0,0.4)',
        cursor: canPlay ? 'pointer' : 'not-allowed',
        opacity: canPlay ? 1 : 0.6,
        transition: 'all 0.15s',
        transform: isSelected ? 'translateY(-8px) scale(1.05)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Cost badge */}
      <div style={{
        position: 'absolute', top: 5, right: 5,
        width: 20, height: 20, borderRadius: '50%',
        background: color, color: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700,
      }}>
        {card.cost}
      </div>

      {/* Art area */}
      <div style={{
        height: 55,
        background: `linear-gradient(135deg, ${bg}, rgba(0,0,0,0.4))`,
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        {getCardEmoji(card)}
      </div>

      {/* Name */}
      <div style={{
        padding: '4px 6px 2px',
        fontSize: 10, fontWeight: 700,
        color: color,
        fontFamily: 'Cinzel, serif',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {card.name}
      </div>

      {/* Type */}
      <div style={{ padding: '0 6px', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {card.type === 'champion' ? card.faction : card.type}
      </div>

      {/* Stats for champions */}
      {card.type === 'champion' && (
        <div style={{
          margin: '4px 6px 0',
          display: 'flex', gap: 4,
          fontSize: 10,
        }}>
          <span style={{ color: '#ff8888', fontWeight: 700 }}>⚔ {card.atk}</span>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span style={{ color: '#88ff88', fontWeight: 700 }}>🛡 {card.def}</span>
        </div>
      )}

      {/* Keywords */}
      {card.keywords.length > 0 && (
        <div style={{ padding: '4px 6px', display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {card.keywords.map(kw => (
            <span key={kw} className={`kw-${kw}`} style={{
              fontSize: 8, padding: '1px 4px', borderRadius: 3,
              border: '1px solid currentColor',
            }}>
              {KW_ICONS[kw]} {kw}
            </span>
          ))}
        </div>
      )}

      {/* Type indicator bottom strip */}
      <div style={{
        marginTop: 'auto',
        height: 3,
        background: color,
        opacity: 0.6,
      }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════
//  Battlefield Card: compact card shown on field
// ═══════════════════════════════════════════════════════

interface BFieldCardProps {
  bc: BattleCard
  isEnemy?: boolean
  isSelectable?: boolean
  isSelected?: boolean
  isAttacking?: boolean
  isBlocking?: boolean
  onClick?: () => void
}

export function BFieldCard({ bc, isEnemy, isSelectable, isSelected, isAttacking, isBlocking, onClick }: BFieldCardProps) {
  const card = getCard(bc.defId)
  const color = ENERGY_COLORS[card.energyType]
  const bg = ENERGY_BG[card.energyType]
  const glow = ENERGY_GLOW[card.energyType]
  const isShard = card.type === 'shard'
  const isRelic = card.type === 'relic'
  const atk = getEffectiveAtk(bc)
  const def = getEffectiveDef(bc)

  let borderColor = 'rgba(255,255,255,0.12)'
  let shadow = '0 2px 8px rgba(0,0,0,0.4)'
  if (isSelected) { borderColor = color; shadow = `0 0 16px ${glow}` }
  else if (isAttacking) { borderColor = '#e84040'; shadow = '0 0 14px rgba(232,64,64,0.6)' }
  else if (isBlocking) { borderColor = '#27ae60'; shadow = '0 0 14px rgba(39,174,96,0.6)' }
  else if (isSelectable) { borderColor = `${color}88` }

  return (
    <div
      onClick={isSelectable || onClick ? onClick : undefined}
      style={{
        position: 'relative',
        width: isShard || isRelic ? 58 : 72,
        height: isShard || isRelic ? 58 : 90,
        borderRadius: isShard ? '50%' : 8,
        border: `1.5px solid ${borderColor}`,
        background: isShard ? `radial-gradient(circle, ${color}33, var(--bg-surface))` : 'var(--bg-card)',
        boxShadow: shadow,
        cursor: isSelectable ? 'pointer' : 'default',
        transition: 'all 0.15s',
        transform: isAttacking ? 'translateY(-6px)' : isBlocking ? 'translateX(4px)' : 'none',
        opacity: bc.tapped ? 0.6 : 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        filter: bc.tapped ? 'saturate(0.4)' : 'none',
      }}
    >
      {/* Summon sick indicator */}
      {bc.summonSick && !isShard && (
        <div style={{
          position: 'absolute', top: 2, left: 2,
          fontSize: 8, color: '#aaa',
        }}>💤</div>
      )}

      {/* Frozen indicator */}
      {bc.frozenTurns > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(74,144,217,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, borderRadius: 'inherit',
          zIndex: 1,
        }}>❄</div>
      )}

      {isShard ? (
        <>
          <div style={{ fontSize: 18 }}>{getCardEmoji(card)}</div>
          <div style={{ fontSize: 8, color, marginTop: 2, fontWeight: 600 }}>◆</div>
        </>
      ) : isRelic ? (
        <>
          <div style={{ fontSize: 20 }}>{getCardEmoji(card)}</div>
          <div style={{ fontSize: 8, color, textAlign: 'center', padding: '0 4px' }}>{card.name}</div>
        </>
      ) : (
        <>
          {/* Art area */}
          <div style={{
            width: '100%', height: 38,
            background: `linear-gradient(135deg, ${bg}, rgba(0,0,0,0.3))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, borderBottom: `1px solid rgba(255,255,255,0.06)`,
          }}>
            {getCardEmoji(card)}
          </div>

          {/* Name */}
          <div style={{
            padding: '2px 4px', fontSize: 8, fontWeight: 700,
            color: color, fontFamily: 'Cinzel, serif',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            width: '100%', textAlign: 'center',
          }}>
            {card.name}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 4, fontSize: 9, padding: '2px 0' }}>
            <span style={{ color: '#ff8888', fontWeight: 700 }}>{atk}</span>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <span style={{ color: '#88ff88', fontWeight: 700 }}>{def}</span>
          </div>

          {/* Keywords icons */}
          {card.keywords.length > 0 && (
            <div style={{ display: 'flex', gap: 1, flexWrap: 'wrap', padding: '0 4px', justifyContent: 'center' }}>
              {card.keywords.map(kw => (
                <span key={kw} style={{ fontSize: 8 }}>{KW_ICONS[kw]}</span>
              ))}
            </div>
          )}

          {/* Color strip */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: color }} />
        </>
      )}

      {/* Tapped overlay */}
      {bc.tapped && !isShard && (
        <div style={{
          position: 'absolute', bottom: -1, right: -1,
          fontSize: 7, background: 'rgba(0,0,0,0.7)',
          color: 'var(--text-muted)', padding: '1px 3px', borderRadius: '4px 0 0 0',
        }}>TAP</div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
//  Back of card (AI hand)
// ═══════════════════════════════════════════════════════

export function CardBack() {
  return (
    <div style={{
      width: 60, height: 84,
      borderRadius: 8,
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'linear-gradient(135deg, #1a1a2e, #0f0f20)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{
        width: 44, height: 64, borderRadius: 6,
        border: '1px solid rgba(155,89,182,0.3)',
        background: 'repeating-linear-gradient(45deg, rgba(155,89,182,0.06) 0px, rgba(155,89,182,0.06) 2px, transparent 2px, transparent 8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        ◈
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
//  Helper: emoji per card
// ═══════════════════════════════════════════════════════

function getCardEmoji(card: CardDef): string {
  if (card.type === 'shard') {
    const map: Record<EnergyType, string> = {
      solara: '✦', glacis: '❄', ignis: '◆', verdis: '✿', aether: '◈'
    }
    return map[card.energyType]
  }
  if (card.type === 'relic') return card.id === 'relic-crystalamulet' ? '💎' : '⚡'
  if (card.type === 'art') {
    const map: Record<string, string> = {
      'art-holybeam': '✨', 'art-divineshield': '🛡', 'art-tidalcrash': '🌊',
      'art-icelance': '❄', 'art-fireball': '🔥', 'art-blazingcharge': '💨',
      'art-naturesembrace': '🌿', 'art-systemcrash': '💥',
    }
    return map[card.id] ?? '✨'
  }
  // Champions
  const map: Record<string, string> = {
    'champ-seraphine': '🌟', 'champ-lumia': '🔆', 'champ-aria': '🏹', 'champ-aurora': '🛡',
    'champ-marina': '🌊', 'champ-coral': '❄', 'champ-nami': '💨', 'champ-mizuki': '🔮',
    'champ-pyra': '🔥', 'champ-igna': '💢', 'champ-scarlet': '🦅', 'champ-ember': '✨',
    'champ-sylva': '🌳', 'champ-fern': '🌿', 'champ-gaia': '⛰', 'champ-ivy': '🌱',
    'champ-pixel': '👾', 'champ-nova': '⚡', 'champ-glitch': '🔧', 'champ-exe': '🖥',
  }
  return map[card.id] ?? '⚔'
}
