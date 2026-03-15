import { useState, useMemo } from 'react'
import { CARDS } from '../data/cards'
import type { CardDef, EnergyType } from '../types'
import { ENERGY_COLORS, ENERGY_BG, ENERGY_GLOW } from '../components/CardComponent'
import {
  CustomDeck, saveCustomDeck, generateDeckId,
  DECK_MIN, DECK_MAX, MAX_COPIES, validateDeck
} from '../utils/storage'

// ─── Helpers ────────────────────────────────────────

const ENERGY_TYPES: EnergyType[] = ['solara', 'glacis', 'ignis', 'verdis', 'aether']
const ENERGY_ICONS: Record<EnergyType, string> = {
  solara: '✦', glacis: '❄', ignis: '◆', verdis: '✿', aether: '◈'
}
const TYPE_ICONS: Record<string, string> = {
  champion: '⚔', art: '✨', relic: '💎', shard: '◆'
}

function countCards(deckIds: string[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const id of deckIds) counts[id] = (counts[id] ?? 0) + 1
  return counts
}

// ─── Props ────────────────────────────────────────────

interface DeckBuilderProps {
  existingDeck?: CustomDeck
  onSave: (deck: CustomDeck) => void
  onCancel: () => void
}

// ─── Component ───────────────────────────────────────

export function DeckBuilderScreen({ existingDeck, onSave, onCancel }: DeckBuilderProps) {
  const [deckName, setDeckName]     = useState(existingDeck?.name ?? 'My Deck')
  const [deckIds, setDeckIds]       = useState<string[]>(existingDeck?.deckIds ?? [])
  const [faction, setFaction]       = useState<EnergyType>(existingDeck?.energyType ?? 'solara')

  // Filter state
  const [filterFaction, setFilterFaction] = useState<EnergyType | 'all'>('all')
  const [filterType,    setFilterType]    = useState<string>('all')
  const [filterCost,    setFilterCost]    = useState<number | 'all'>('all')
  const [search,        setSearch]        = useState('')

  const [saved, setSaved] = useState(false)

  const color = ENERGY_COLORS[faction]
  const glow  = ENERGY_GLOW[faction]

  const counts    = countCards(deckIds)
  const total     = deckIds.length
  const error     = validateDeck(deckIds)
  const canSave   = !error && deckName.trim().length > 0

  // All non-shard cards available + shards
  const allCards = useMemo(() => Object.values(CARDS).filter(c => c.type !== 'shard'), [])

  const filtered = useMemo(() => {
    return allCards.filter(c => {
      if (filterFaction !== 'all' && c.energyType !== filterFaction) return false
      if (filterType    !== 'all' && c.type !== filterType)           return false
      if (filterCost    !== 'all' && c.cost !== filterCost)           return false
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }).sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))
  }, [allCards, filterFaction, filterType, filterCost, search])

  function addCard(id: string) {
    if ((counts[id] ?? 0) >= MAX_COPIES) return
    if (total >= DECK_MAX) return
    setDeckIds(prev => [...prev, id])
    setSaved(false)
  }

  function removeCard(id: string) {
    const idx = [...deckIds].reverse().findIndex(x => x === id)
    if (idx === -1) return
    const realIdx = deckIds.length - 1 - idx
    setDeckIds(prev => prev.filter((_, i) => i !== realIdx))
    setSaved(false)
  }

  function clearDeck() {
    if (!confirm('Clear the entire deck?')) return
    setDeckIds([])
    setSaved(false)
  }

  function handleSave() {
    if (!canSave) return
    const deck: CustomDeck = {
      id: existingDeck?.id ?? generateDeckId(),
      name: deckName.trim(),
      energyType: faction,
      color,
      deckIds,
      createdAt: existingDeck?.createdAt ?? Date.now(),
    }
    saveCustomDeck(deck)
    setSaved(true)
    onSave(deck)
  }

  // Progress bar fill
  const progress = Math.min(100, (total / DECK_MAX) * 100)
  const progressColor = total < DECK_MIN ? '#ff6b8a' : total <= DECK_MAX ? '#7ae582' : '#ff6b8a'

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', overflow: 'hidden',
    }}>

      {/* ═══ HEADER ═══ */}
      <div style={{
        padding: '8px 14px', flexShrink: 0,
        borderBottom: '1px solid var(--border)',
        background: `linear-gradient(180deg, ${ENERGY_BG[faction]}, transparent)`,
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <button className="btn btn-cancel" onClick={onCancel} style={{ padding: '5px 10px', fontSize: 10 }}>
          ← Back
        </button>

        {/* Deck name */}
        <input
          value={deckName}
          onChange={e => { setDeckName(e.target.value); setSaved(false) }}
          maxLength={24}
          style={{
            background: 'rgba(200,160,255,0.08)',
            border: `1px solid ${color}55`,
            borderRadius: 8, padding: '5px 10px',
            color: color, fontFamily: 'Cinzel, serif',
            fontSize: 14, fontWeight: 700,
            outline: 'none', width: 180,
          }}
        />

        {/* Faction picker */}
        <div style={{ display: 'flex', gap: 5 }}>
          {ENERGY_TYPES.map(e => (
            <button
              key={e}
              onClick={() => { setFaction(e); setSaved(false) }}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                border: `1.5px solid ${faction === e ? ENERGY_COLORS[e] : 'rgba(200,160,255,0.2)'}`,
                background: faction === e ? `${ENERGY_COLORS[e]}22` : 'transparent',
                color: ENERGY_COLORS[e], fontSize: 12, cursor: 'pointer',
                boxShadow: faction === e ? `0 0 10px ${ENERGY_GLOW[e]}` : 'none',
                transition: 'all 0.12s',
              }}
            >
              {ENERGY_ICONS[e]}
            </button>
          ))}
        </div>

        {/* Card count + progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: progressColor }}>
            {total}/{DECK_MAX}
          </div>
          <div style={{ width: 80, height: 6, borderRadius: 3, background: 'rgba(200,160,255,0.1)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`, borderRadius: 3,
              background: progressColor, transition: 'width 0.2s, background 0.2s',
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>min {DECK_MIN}</div>
        </div>

        {/* Error / status */}
        {error && (
          <div style={{ fontSize: 10, color: '#ff6b8a', padding: '3px 8px', borderRadius: 8, background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.3)' }}>
            ⚠ {error}
          </div>
        )}
        {saved && !error && (
          <div style={{ fontSize: 10, color: '#7ae582', padding: '3px 8px', borderRadius: 8, background: 'rgba(122,229,130,0.1)', border: '1px solid rgba(122,229,130,0.3)' }}>
            ✓ Saved!
          </div>
        )}

        {/* Save button */}
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!canSave}
          style={{ marginLeft: 'auto', padding: '6px 18px', fontSize: 11, borderColor: color, color }}
        >
          💾 Save Deck
        </button>
      </div>

      {/* ═══ MAIN BODY ═══ */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── LEFT: Card collection ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--border)', minWidth: 0,
        }}>
          {/* Filters */}
          <div style={{
            padding: '8px 12px', flexShrink: 0,
            borderBottom: '1px solid var(--border)',
            display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
          }}>
            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={{
                background: 'rgba(200,160,255,0.06)',
                border: '1px solid rgba(200,160,255,0.2)',
                borderRadius: 8, padding: '4px 10px',
                color: 'var(--text)', fontSize: 11, outline: 'none', width: 110,
              }}
            />

            {/* Faction filter */}
            <div style={{ display: 'flex', gap: 3 }}>
              <FilterPill label="All" active={filterFaction === 'all'} color="var(--accent)" onClick={() => setFilterFaction('all')} />
              {ENERGY_TYPES.map(e => (
                <FilterPill key={e} label={ENERGY_ICONS[e]} active={filterFaction === e} color={ENERGY_COLORS[e]} onClick={() => setFilterFaction(e)} />
              ))}
            </div>

            {/* Type filter */}
            <div style={{ display: 'flex', gap: 3 }}>
              {['all','champion','art','relic'].map(t => (
                <FilterPill key={t} label={t === 'all' ? 'All' : TYPE_ICONS[t]} active={filterType === t} color="var(--accent)" onClick={() => setFilterType(t)} />
              ))}
            </div>

            {/* Cost filter */}
            <div style={{ display: 'flex', gap: 3 }}>
              <FilterPill label="$" active={filterCost === 'all'} color="var(--accent)" onClick={() => setFilterCost('all')} />
              {[0,1,2,3,4,5,6,7].map(c => (
                <FilterPill key={c} label={String(c)} active={filterCost === c} color="var(--accent)" onClick={() => setFilterCost(c)} />
              ))}
            </div>

            <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)' }}>
              {filtered.length} cards
            </div>
          </div>

          {/* Card list */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px 12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {filtered.map(card => {
                const count    = counts[card.id] ?? 0
                const maxed    = count >= MAX_COPIES
                const deckFull = total >= DECK_MAX
                const cardColor = ENERGY_COLORS[card.energyType]

                return (
                  <CollectionRow
                    key={card.id}
                    card={card}
                    count={count}
                    canAdd={!maxed && !deckFull}
                    onAdd={() => addCard(card.id)}
                    onRemove={() => removeCard(card.id)}
                    color={cardColor}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Deck list ── */}
        <div style={{
          width: 220, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: 'rgba(13,11,26,0.6)',
        }}>
          <div style={{
            padding: '8px 12px', flexShrink: 0,
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Deck ({total})
            </div>
            <button
              onClick={clearDeck}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 11 }}
            >
              Clear ✕
            </button>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '6px 10px' }}>
            {/* Group by type */}
            {(['champion','art','relic'] as const).map(type => {
              const group = Object.entries(counts)
                .filter(([id]) => CARDS[id]?.type === type && counts[id] > 0)
                .sort(([a], [b]) => (CARDS[a]?.cost ?? 0) - (CARDS[b]?.cost ?? 0))
              if (group.length === 0) return null
              return (
                <div key={type} style={{ marginBottom: 8 }}>
                  <div style={{
                    fontSize: 8, color: 'var(--text-dim)', textTransform: 'uppercase',
                    letterSpacing: '0.12em', marginBottom: 3, paddingBottom: 2,
                    borderBottom: '1px solid rgba(200,160,255,0.08)',
                  }}>
                    {TYPE_ICONS[type]} {type}s
                  </div>
                  {group.map(([id, cnt]) => {
                    const c = CARDS[id]
                    if (!c) return null
                    const cardColor = ENERGY_COLORS[c.energyType]
                    return (
                      <div key={id} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '3px 4px', borderRadius: 6,
                        marginBottom: 1,
                        background: 'rgba(200,160,255,0.04)',
                      }}>
                        {/* Count badge */}
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%',
                          background: cardColor, color: '#0d0b1a',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 800, flexShrink: 0,
                        }}>{cnt}</div>

                        {/* Name */}
                        <div style={{
                          flex: 1, fontSize: 10, color: cardColor,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          fontFamily: 'Cinzel, serif',
                        }}>
                          {c.name}
                        </div>

                        {/* Cost */}
                        <div style={{ fontSize: 9, color: 'var(--text-dim)', flexShrink: 0 }}>
                          {c.cost}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeCard(id)}
                          style={{
                            background: 'transparent', border: 'none',
                            color: 'var(--text-dim)', cursor: 'pointer',
                            fontSize: 12, padding: 0, lineHeight: 1, flexShrink: 0,
                          }}
                        >−</button>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {total === 0 && (
              <div style={{ color: 'var(--text-dim)', fontSize: 11, textAlign: 'center', marginTop: 24 }}>
                Click + to add cards
              </div>
            )}
          </div>

          {/* Deck stats */}
          <div style={{
            padding: '8px 12px', flexShrink: 0,
            borderTop: '1px solid var(--border)',
          }}>
            <DeckStats deckIds={deckIds} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────

function FilterPill({ label, active, color, onClick }: {
  label: string; active: boolean; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '3px 8px', borderRadius: 12, fontSize: 10, cursor: 'pointer',
        border: `1px solid ${active ? color : 'rgba(200,160,255,0.15)'}`,
        background: active ? `${color}22` : 'transparent',
        color: active ? color : 'var(--text-muted)',
        transition: 'all 0.12s', fontWeight: active ? 700 : 400,
      }}
    >
      {label}
    </button>
  )
}

function CollectionRow({ card, count, canAdd, onAdd, onRemove, color }: {
  card: CardDef; count: number; canAdd: boolean
  onAdd: () => void; onRemove: () => void; color: string
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 8px', borderRadius: 8,
        border: `1px solid ${count > 0 ? color+'44' : 'transparent'}`,
        background: hovered ? 'rgba(200,160,255,0.06)' : count > 0 ? `${color}0a` : 'transparent',
        transition: 'all 0.1s',
      }}
    >
      {/* Cost */}
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        background: count > 0 ? color : 'rgba(200,160,255,0.15)',
        color: count > 0 ? '#0d0b1a' : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 800, flexShrink: 0,
      }}>
        {card.cost}
      </div>

      {/* Type icon */}
      <div style={{ fontSize: 10, flexShrink: 0, color: 'var(--text-dim)' }}>
        {TYPE_ICONS[card.type]}
      </div>

      {/* Name */}
      <div style={{
        flex: 1, fontSize: 11, fontFamily: 'Cinzel, serif',
        color: count > 0 ? color : 'var(--text)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {card.name}
      </div>

      {/* Faction tag */}
      <div style={{
        fontSize: 8, color, opacity: 0.7, flexShrink: 0,
        display: hovered || count > 0 ? 'block' : 'none',
      }}>
        {ENERGY_ICONS[card.energyType as EnergyType]}
      </div>

      {/* Stats */}
      {card.type === 'champion' && (
        <div style={{ fontSize: 9, color: 'var(--text-dim)', flexShrink: 0, display: hovered ? 'block' : 'none' }}>
          {card.atk}/{card.def}
        </div>
      )}

      {/* Count + buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {count > 0 && (
          <button
            onClick={onRemove}
            style={{
              width: 18, height: 18, borderRadius: '50%',
              border: '1px solid rgba(255,107,138,0.4)',
              background: 'transparent', color: '#ff6b8a',
              cursor: 'pointer', fontSize: 14, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >−</button>
        )}
        {count > 0 && (
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            background: color, color: '#0d0b1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 800,
          }}>
            {count}
          </div>
        )}
        <button
          onClick={onAdd}
          disabled={!canAdd}
          style={{
            width: 18, height: 18, borderRadius: '50%',
            border: `1px solid ${canAdd ? color+'88' : 'rgba(200,160,255,0.1)'}`,
            background: 'transparent',
            color: canAdd ? color : 'var(--text-dim)',
            cursor: canAdd ? 'pointer' : 'not-allowed',
            fontSize: 14, lineHeight: 1, opacity: canAdd ? 1 : 0.4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >+</button>
      </div>
    </div>
  )
}

function DeckStats({ deckIds }: { deckIds: string[] }) {
  const counts = countCards(deckIds)
  const byType = { champion: 0, art: 0, relic: 0, shard: 0 }
  let totalCost = 0
  let champCount = 0
  for (const [id, cnt] of Object.entries(counts)) {
    const c = CARDS[id]
    if (!c) continue
    byType[c.type as keyof typeof byType] = (byType[c.type as keyof typeof byType] ?? 0) + cnt
    totalCost += c.cost * cnt
    if (c.type === 'champion') champCount += cnt
  }
  const avgCost = champCount > 0 ? (totalCost / deckIds.length).toFixed(1) : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Stats</div>
      {Object.entries(byType).map(([type, cnt]) => cnt > 0 ? (
        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: 'var(--text-muted)' }}>{TYPE_ICONS[type]} {type}s</span>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{cnt}</span>
        </div>
      ) : null)}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 2, borderTop: '1px solid rgba(200,160,255,0.08)', paddingTop: 3 }}>
        <span style={{ color: 'var(--text-muted)' }}>Avg cost</span>
        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{avgCost}</span>
      </div>
    </div>
  )
}
