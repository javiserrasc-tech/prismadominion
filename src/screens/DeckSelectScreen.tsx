import { useState } from 'react'
import { DECKS } from '../data/decks'
import type { DeckInfo, EnergyType } from '../types'
import { CustomDeck, loadCustomDecks, deleteCustomDeck } from '../utils/storage'
import { ENERGY_COLORS, ENERGY_GLOW } from '../components/CardComponent'

const ENERGY_ICONS: Record<EnergyType, string> = {
  solara: '✦', glacis: '❄', ignis: '◆', verdis: '✿', aether: '◈'
}

interface DeckSelectProps {
  onSelect:      (deckId: string, difficulty: 'easy' | 'hard', isCustom: boolean) => void
  onBack:        () => void
  onNewDeck:     () => void
  onEditDeck:    (deck: CustomDeck) => void
  refreshKey:    number   // bump to re-read localStorage
}

export function DeckSelectScreen({ onSelect, onBack, onNewDeck, onEditDeck, refreshKey }: DeckSelectProps) {
  const [tab,          setTab]        = useState<'default' | 'custom'>('default')
  const [selectedId,   setSelectedId] = useState<string | null>(null)
  const [isCustom,     setIsCustom]   = useState(false)
  const [difficulty,   setDifficulty] = useState<'easy' | 'hard'>('easy')

  const customDecks = loadCustomDecks()   // re-read on every render (refreshKey triggers re-render)
  void refreshKey

  const selectedDeck: DeckInfo | CustomDeck | null =
    isCustom
      ? customDecks.find(d => d.id === selectedId) ?? null
      : DECKS.find(d => d.id === selectedId) ?? null

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this deck?')) return
    deleteCustomDeck(id)
    if (selectedId === id) { setSelectedId(null) }
    // force re-render by parent refreshKey — caller handles that
    window.location.reload()   // simple: just reload
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      padding: 'clamp(10px,2vw,18px)', gap: 12, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button className="btn btn-cancel" onClick={onBack} style={{ padding: '5px 10px', fontSize: 11 }}>← Back</button>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: 'var(--accent)' }}>Choose Your Faction</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Select a deck and difficulty</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={onNewDeck}
          style={{ marginLeft: 'auto', padding: '6px 16px', fontSize: 11 }}
        >
          + New Deck
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {(['default', 'custom'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelectedId(null) }}
            style={{
              padding: '6px 18px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
              border: `1.5px solid ${tab === t ? 'var(--accent)' : 'rgba(200,160,255,0.2)'}`,
              background: tab === t ? 'var(--accent-soft)' : 'transparent',
              color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {t === 'default' ? '⚡ Predefined' : `✦ My Decks (${customDecks.length})`}
          </button>
        ))}
      </div>

      {/* Deck grid */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexWrap: 'wrap', gap: 10,
        alignContent: 'flex-start',
      }}>
        {tab === 'default' && DECKS.map(deck => (
          <DeckCard
            key={deck.id}
            name={deck.name}
            faction={deck.faction}
            energyType={deck.energyType}
            color={deck.color}
            description={deck.description}
            cardCount={deck.deckIds.length}
            isSelected={selectedId === deck.id}
            onClick={() => { setSelectedId(deck.id); setIsCustom(false) }}
          />
        ))}

        {tab === 'custom' && customDecks.length === 0 && (
          <div style={{
            width: '100%', padding: 32,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontSize: 32 }}>📜</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
              No custom decks yet.<br />Build your first one!
            </div>
            <button className="btn btn-primary" onClick={onNewDeck} style={{ padding: '8px 24px', fontSize: 12 }}>
              + Create Deck
            </button>
          </div>
        )}

        {tab === 'custom' && customDecks.map(deck => (
          <DeckCard
            key={deck.id}
            name={deck.name}
            faction="Custom"
            energyType={deck.energyType}
            color={deck.color}
            description={`${deck.deckIds.length} cards · ${new Date(deck.createdAt).toLocaleDateString()}`}
            cardCount={deck.deckIds.length}
            isSelected={selectedId === deck.id}
            onClick={() => { setSelectedId(deck.id); setIsCustom(true) }}
            onEdit={() => onEditDeck(deck)}
            onDelete={e => handleDelete(deck.id, e)}
          />
        ))}
      </div>

      {/* Confirm row */}
      {selectedDeck && (
        <div style={{
          flexShrink: 0, padding: '12px 16px', borderRadius: 14,
          border: `1px solid ${selectedDeck.color}44`,
          background: `${selectedDeck.color}0d`,
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <div style={{ fontFamily: 'Cinzel, serif', color: selectedDeck.color, fontSize: 13 }}>
            {ENERGY_ICONS[selectedDeck.energyType]} {selectedDeck.name}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {(['easy','hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  border: `1.5px solid ${difficulty === d ? selectedDeck.color : 'rgba(200,160,255,0.2)'}`,
                  background: difficulty === d ? `${selectedDeck.color}22` : 'transparent',
                  color: difficulty === d ? selectedDeck.color : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                {d === 'easy' ? '🌙 Easy' : '🔥 Hard'}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={() => selectedId && onSelect(selectedId, difficulty, isCustom)}
            style={{ marginLeft: 'auto', padding: '8px 24px', fontSize: 12, borderColor: selectedDeck.color, color: selectedDeck.color }}
          >
            ⚔ ENTER BATTLE
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Deck Card ────────────────────────────────────────

function DeckCard({ name, faction, energyType, color, description, cardCount, isSelected, onClick, onEdit, onDelete }: {
  name: string; faction: string; energyType: EnergyType; color: string
  description: string; cardCount: number; isSelected: boolean
  onClick: () => void
  onEdit?:   () => void
  onDelete?: (e: React.MouseEvent) => void
}) {
  const glow = ENERGY_GLOW[energyType]
  return (
    <div
      onClick={onClick}
      style={{
        width: 'clamp(130px, 17vw, 155px)',
        padding: 12, borderRadius: 14, cursor: 'pointer',
        border: `1.5px solid ${isSelected ? color : 'rgba(200,160,255,0.15)'}`,
        background: isSelected ? `${color}18` : 'var(--bg-card)',
        transition: 'all 0.15s',
        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
        boxShadow: isSelected ? `0 0 18px ${glow}44` : 'none',
        display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Edit / Delete buttons for custom decks */}
      {(onEdit || onDelete) && (
        <div style={{ position: 'absolute', top: 5, right: 5, display: 'flex', gap: 3 }}>
          {onEdit && (
            <button
              onClick={e => { e.stopPropagation(); onEdit() }}
              style={{
                width: 18, height: 18, borderRadius: '50%', background: 'rgba(199,125,255,0.15)',
                border: '1px solid rgba(199,125,255,0.3)', color: 'var(--accent)',
                cursor: 'pointer', fontSize: 9, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✏</button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              style={{
                width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,107,138,0.1)',
                border: '1px solid rgba(255,107,138,0.3)', color: '#ff6b8a',
                cursor: 'pointer', fontSize: 10, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          )}
        </div>
      )}

      {/* Sigil */}
      <div style={{
        width: 46, height: 46, borderRadius: '50%',
        border: `2px solid ${color}`, fontSize: 20, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}18`,
        boxShadow: isSelected ? `0 0 14px ${glow}` : 'none',
      }}>
        {ENERGY_ICONS[energyType]}
      </div>

      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 700, textAlign: 'center', color: isSelected ? color : 'var(--text)' }}>
        {name}
      </div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {faction}
      </div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
        {description}
      </div>
      <div style={{ fontSize: 9, color, borderTop: `1px solid ${color}33`, paddingTop: 5, width: '100%', textAlign: 'center' }}>
        {cardCount} cards
      </div>
    </div>
  )
}
