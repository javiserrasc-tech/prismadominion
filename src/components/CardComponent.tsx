import { useState } from 'react'
import type { CardDef, BattleCard, EnergyType, Keyword } from '../types'
import { getCard } from '../data/cards'
import { getEffectiveAtk, getEffectiveDef } from '../game/engine'

export const ENERGY_COLORS: Record<EnergyType, string> = {
  solara: '#ffd166', glacis: '#06d6f7', ignis: '#ff6b8a', verdis: '#7ae582', aether: '#c77dff',
}
export const ENERGY_BG: Record<EnergyType, string> = {
  solara: 'rgba(255,209,102,0.12)', glacis: 'rgba(6,214,247,0.12)',
  ignis: 'rgba(255,107,138,0.12)', verdis: 'rgba(122,229,130,0.12)', aether: 'rgba(199,125,255,0.12)',
}
export const ENERGY_GLOW: Record<EnergyType, string> = {
  solara: 'rgba(255,209,102,0.5)', glacis: 'rgba(6,214,247,0.5)',
  ignis: 'rgba(255,107,138,0.5)', verdis: 'rgba(122,229,130,0.5)', aether: 'rgba(199,125,255,0.5)',
}

const KW_ICONS: Record<Keyword, string> = {
  rush:'⚡', flying:'🕊', taunt:'🛡', trample:'🌊', freeze:'❄',
  draw:'📖', bounce:'💨', regenerate:'💚', harvest:'🌿', resilient:'💎', stealth:'👻', rebirth:'🔥',
}

const SHARD_SIGIL: Record<EnergyType, string> = {
  solara:'✦', glacis:'❄', ignis:'◆', verdis:'✿', aether:'◈',
}

const CARD_EMOJI: Record<string, string> = {
  'champ-seraphine':'🌟','champ-lumia':'🔆','champ-aria':'🏹','champ-aurora':'🛡',
  'champ-marina':'🌊','champ-coral':'❄','champ-nami':'💨','champ-mizuki':'🔮',
  'champ-pyra':'🔥','champ-igna':'💢','champ-scarlet':'🦅','champ-ember':'✨',
  'champ-sylva':'🌳','champ-fern':'🌿','champ-gaia':'⛰','champ-ivy':'🌱',
  'champ-pixel':'👾','champ-nova':'⚡','champ-glitch':'🔧','champ-exe':'🖥',
  'art-holybeam':'✨','art-divineshield':'🛡','art-tidalcrash':'🌊',
  'art-icelance':'❄','art-fireball':'🔥','art-blazingcharge':'💨',
  'art-naturesembrace':'🌿','art-systemcrash':'💥',
  'relic-crystalamulet':'💎','relic-powercore':'⚡',
}

function getEmoji(card: CardDef): string {
  if (card.type === 'shard') return SHARD_SIGIL[card.energyType]
  return CARD_EMOJI[card.id] ?? '⚔'
}

// ─── Tooltip ─────────────────────────────────────────

function CardTooltip({ card, color, atk, def }: {
  card: CardDef; color: string; atk?: number; def?: number
}) {
  return (
    <div style={{
      position: 'absolute', zIndex: 999,
      bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
      width: 190,
      background: 'rgba(18,12,42,0.98)',
      border: `1.5px solid ${color}`,
      borderRadius: 12, padding: '10px 12px',
      pointerEvents: 'none',
      boxShadow: `0 4px 28px ${color}44`,
    }}>
      <div style={{ fontFamily:'Cinzel,serif', fontSize:12, fontWeight:700, color, marginBottom:3 }}>
        {card.name}
      </div>
      <div style={{ fontSize:9, color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.08em' }}>
        {card.faction} · {card.type}{card.type !== 'shard' ? ` · Cost ${card.cost}` : ''}
      </div>
      {card.type === 'champion' && (
        <div style={{ display:'flex', gap:8, marginBottom:5, fontSize:12, fontWeight:700 }}>
          <span style={{ color:'#ff8faa' }}>⚔ {atk ?? card.atk}</span>
          <span style={{ color:'var(--text-dim)' }}>/</span>
          <span style={{ color:'#8fffa0' }}>🛡 {def ?? card.def}</span>
        </div>
      )}
      {card.keywords.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginBottom:5 }}>
          {card.keywords.map(kw => (
            <span key={kw} className={`kw-${kw}`} style={{
              fontSize:9, padding:'1px 5px', borderRadius:4, border:'1px solid currentColor',
            }}>{KW_ICONS[kw]} {kw}</span>
          ))}
        </div>
      )}
      <div style={{ fontSize:11, color:'var(--text)', lineHeight:1.5, marginBottom: card.flavor ? 5 : 0 }}>
        {card.text}
      </div>
      {card.flavor && (
        <div style={{
          fontSize:10, color:'var(--text-muted)', fontStyle:'italic', lineHeight:1.4,
          borderTop:'1px solid rgba(200,160,255,0.15)', paddingTop:5,
        }}>
          "{card.flavor}"
        </div>
      )}
    </div>
  )
}

// ─── Hand Card ────────────────────────────────────────

interface HandCardProps {
  card: CardDef; canPlay: boolean; isSelected?: boolean; onClick: () => void
}

export function HandCard({ card, canPlay, isSelected, onClick }: HandCardProps) {
  const [hovered, setHovered] = useState(false)
  const color = ENERGY_COLORS[card.energyType]
  const bg = ENERGY_BG[card.energyType]
  const glow = ENERGY_GLOW[card.energyType]

  return (
    <div
      onClick={canPlay ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: 90, minHeight: 130, borderRadius: 12,
        border: `1.5px solid ${isSelected ? color : hovered && canPlay ? color+'88' : 'rgba(200,160,255,0.15)'}`,
        background: isSelected ? bg : 'var(--bg-card)',
        boxShadow: isSelected ? `0 0 18px ${glow}, 0 4px 20px rgba(0,0,0,0.5)`
          : hovered && canPlay ? `0 0 10px ${glow}66` : '0 4px 12px rgba(0,0,0,0.4)',
        cursor: canPlay ? 'pointer' : 'not-allowed',
        opacity: canPlay ? 1 : 0.5,
        transition: 'all 0.15s',
        transform: isSelected ? 'translateY(-10px) scale(1.05)' : hovered && canPlay ? 'translateY(-4px)' : 'none',
        display: 'flex', flexDirection: 'column',
        overflow: 'visible', flexShrink: 0,
      }}
    >
      {hovered && <CardTooltip card={card} color={color} />}

      <div style={{ borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{
          position: 'absolute', top: 5, right: 5, zIndex: 2,
          width: 20, height: 20, borderRadius: '50%',
          background: color, color: '#0d0b1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800,
        }}>{card.cost}</div>

        <div style={{
          height: 55,
          background: `linear-gradient(135deg, ${bg}, rgba(0,0,0,0.5))`,
          borderBottom: '1px solid rgba(200,160,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
        }}>{getEmoji(card)}</div>

        <div style={{
          padding: '4px 7px 2px', fontSize: 10, fontWeight: 700,
          color, fontFamily: 'Cinzel, serif',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{card.name}</div>

        <div style={{ padding: '0 7px', fontSize: 8.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {card.type === 'champion' ? card.faction : card.type}
        </div>

        {card.type === 'champion' && (
          <div style={{ margin: '4px 7px 0', display: 'flex', gap: 4, fontSize: 10 }}>
            <span style={{ color: '#ff8faa', fontWeight: 700 }}>⚔ {card.atk}</span>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <span style={{ color: '#8fffa0', fontWeight: 700 }}>🛡 {card.def}</span>
          </div>
        )}

        {card.keywords.length > 0 && (
          <div style={{ padding: '4px 7px', display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {card.keywords.map(kw => (
              <span key={kw} className={`kw-${kw}`} style={{
                fontSize: 8, padding: '1px 4px', borderRadius: 4, border: '1px solid currentColor',
              }}>{KW_ICONS[kw]} {kw}</span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 'auto', height: 3, background: color, opacity: 0.7 }} />
      </div>
    </div>
  )
}

// ─── Battlefield Card ─────────────────────────────────

interface BFieldCardProps {
  bc: BattleCard; isEnemy?: boolean; isSelectable?: boolean
  isSelected?: boolean; isAttacking?: boolean; isBlocking?: boolean; onClick?: () => void
}

export function BFieldCard({ bc, isSelectable, isSelected, isAttacking, isBlocking, onClick }: BFieldCardProps) {
  const [hovered, setHovered] = useState(false)
  const card = getCard(bc.defId)
  const color = ENERGY_COLORS[card.energyType]
  const bg = ENERGY_BG[card.energyType]
  const glow = ENERGY_GLOW[card.energyType]
  const isRelic = card.type === 'relic'
  const atk = getEffectiveAtk(bc)
  const def = getEffectiveDef(bc)

  let borderColor = 'rgba(200,160,255,0.15)'
  let shadow = '0 2px 8px rgba(0,0,0,0.4)'
  if (isSelected)   { borderColor = color;     shadow = `0 0 16px ${glow}` }
  if (isAttacking)  { borderColor = '#ff6b8a'; shadow = '0 0 16px rgba(255,107,138,0.7)' }
  if (isBlocking)   { borderColor = '#7ae582'; shadow = '0 0 16px rgba(122,229,130,0.7)' }
  if (isSelectable && !isSelected && !isAttacking) { borderColor = `${color}99` }

  return (
    <div
      onClick={isSelectable || onClick ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: isRelic ? 52 : 70,
        height: isRelic ? 52 : 88,
        borderRadius: isRelic ? '50%' : 10,
        border: `1.5px solid ${borderColor}`,
        background: isRelic ? `radial-gradient(circle, ${color}22, var(--bg-surface))` : 'var(--bg-card)',
        boxShadow: shadow,
        cursor: isSelectable || onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
        transform: isAttacking ? 'translateY(-8px)' : isBlocking ? 'translateX(5px)' : isSelectable ? 'translateY(-2px)' : 'none',
        opacity: bc.tapped ? 0.5 : 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'visible', flexShrink: 0,
        filter: bc.tapped ? 'saturate(0.3)' : 'none',
      }}
    >
      {hovered && <CardTooltip card={card} color={color} atk={atk} def={def} />}

      <div style={{ borderRadius: 'inherit', overflow: 'hidden', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {bc.summonSick && !isRelic && (
          <div style={{ position:'absolute', top:2, left:3, fontSize:7, color:'var(--text-muted)', zIndex:2 }}>💤</div>
        )}
        {bc.frozenTurns > 0 && (
          <div style={{
            position:'absolute', inset:0, background:'rgba(6,214,247,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:20, borderRadius:'inherit', zIndex:3,
          }}>❄</div>
        )}

        {isRelic ? (
          <>
            <div style={{ fontSize: 20 }}>{getEmoji(card)}</div>
            <div style={{ fontSize: 7, color, textAlign: 'center', padding: '1px 4px', fontWeight: 600 }}>{card.name}</div>
          </>
        ) : (
          <>
            <div style={{
              width: '100%', height: 36,
              background: `linear-gradient(135deg, ${bg}, rgba(0,0,0,0.4))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, borderBottom: '1px solid rgba(200,160,255,0.06)',
            }}>{getEmoji(card)}</div>

            <div style={{
              padding: '2px 4px', fontSize: 8, fontWeight: 700, color,
              fontFamily: 'Cinzel, serif', whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis', width: '100%', textAlign: 'center',
            }}>{card.name}</div>

            <div style={{ display: 'flex', gap: 3, fontSize: 9, padding: '2px 0' }}>
              <span style={{ color: '#ff8faa', fontWeight: 700 }}>{atk}</span>
              <span style={{ color: 'var(--text-dim)' }}>/</span>
              <span style={{ color: '#8fffa0', fontWeight: 700 }}>{def}</span>
            </div>

            {card.keywords.length > 0 && (
              <div style={{ display: 'flex', gap: 1, flexWrap: 'wrap', padding: '0 3px', justifyContent: 'center' }}>
                {card.keywords.map(kw => (
                  <span key={kw} style={{ fontSize: 8 }}>{KW_ICONS[kw]}</span>
                ))}
              </div>
            )}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:color, opacity:0.8, borderRadius:'0 0 8px 8px' }} />
          </>
        )}

        {bc.tapped && !isRelic && (
          <div style={{
            position:'absolute', bottom:3, right:3, fontSize:6,
            background:'rgba(0,0,0,0.7)', color:'var(--text-muted)',
            padding:'1px 3px', borderRadius:3,
          }}>TAP</div>
        )}
      </div>
    </div>
  )
}

// ─── Shard Token (for shard zone) ────────────────────

export function ShardToken({ bc }: { bc: BattleCard }) {
  const [hovered, setHovered] = useState(false)
  const card = getCard(bc.defId)
  const color = ENERGY_COLORS[card.energyType]
  const glow = ENERGY_GLOW[card.energyType]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: 34, height: 34, borderRadius: '50%',
        border: `1.5px solid ${bc.tapped ? 'rgba(200,160,255,0.12)' : color}`,
        background: bc.tapped ? 'rgba(200,160,255,0.04)' : `radial-gradient(circle, ${color}22, var(--bg-surface))`,
        boxShadow: bc.tapped ? 'none' : `0 0 8px ${glow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, color: bc.tapped ? 'var(--text-dim)' : color,
        flexShrink: 0,
        opacity: bc.tapped ? 0.4 : 1,
        transition: 'all 0.2s',
        filter: bc.tapped ? 'saturate(0.2)' : 'none',
      }}
    >
      {hovered && <CardTooltip card={card} color={color} />}
      {SHARD_SIGIL[card.energyType]}
    </div>
  )
}

// ─── Card Back ────────────────────────────────────────

export function CardBack() {
  return (
    <div style={{
      width: 52, height: 76, borderRadius: 10,
      border: '1px solid rgba(200,160,255,0.12)',
      background: 'linear-gradient(135deg, #1a1535, #0f0c20)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <div style={{
        width: 38, height: 56, borderRadius: 7,
        border: '1px solid rgba(199,125,255,0.25)',
        background: 'repeating-linear-gradient(45deg, rgba(199,125,255,0.05) 0px, rgba(199,125,255,0.05) 2px, transparent 2px, transparent 8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, color: 'rgba(199,125,255,0.4)',
      }}>◈</div>
    </div>
  )
}
