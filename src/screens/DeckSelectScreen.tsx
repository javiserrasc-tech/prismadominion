import { useState } from 'react'
import { DECKS } from '../data/decks'
import type { DeckInfo } from '../types'

interface DeckSelectProps {
  onSelect: (deckId: string, difficulty: 'easy' | 'hard') => void
  onBack: () => void
}

export function DeckSelectScreen({ onSelect, onBack }: DeckSelectProps) {
  const [selectedDeck, setSelectedDeck] = useState<DeckInfo | null>(null)
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy')

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      padding: 'clamp(12px, 3vw, 24px)',
      overflow: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn" onClick={onBack} style={{ padding: '6px 12px', fontSize: 12 }}>
          ← Back
        </button>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, letterSpacing: '0.1em' }}>
            Choose Your Faction
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Select a deck to lead into battle
          </div>
        </div>
      </div>

      {/* Deck cards */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap',
        justifyContent: 'center', flex: 1,
      }}>
        {DECKS.map(deck => (
          <DeckCard
            key={deck.id}
            deck={deck}
            isSelected={selectedDeck?.id === deck.id}
            onClick={() => setSelectedDeck(deck)}
          />
        ))}
      </div>

      {/* Difficulty + confirm */}
      {selectedDeck && (
        <div style={{
          marginTop: 24,
          padding: 20,
          borderRadius: 12,
          border: `1px solid ${selectedDeck.color}44`,
          background: `${selectedDeck.color}0d`,
          display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
        }}>
          <div style={{ fontFamily: 'Cinzel, serif', color: selectedDeck.color, fontSize: 16 }}>
            {selectedDeck.name} selected
          </div>

          {/* Difficulty */}
          <div style={{ display: 'flex', gap: 12 }}>
            {(['easy', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  border: `1.5px solid ${difficulty === d ? selectedDeck.color : 'rgba(255,255,255,0.15)'}`,
                  background: difficulty === d ? `${selectedDeck.color}22` : 'transparent',
                  color: difficulty === d ? selectedDeck.color : 'var(--text-muted)',
                  fontFamily: 'Exo 2, sans-serif',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  textTransform: 'capitalize', letterSpacing: '0.05em',
                  transition: 'all 0.15s',
                }}
              >
                {d === 'easy' ? '🌙 Easy' : '🔥 Hard'}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={() => onSelect(selectedDeck.id, difficulty)}
            style={{
              padding: '12px 40px', fontSize: 14,
              letterSpacing: '0.1em',
              border: `1px solid ${selectedDeck.color}`,
              color: selectedDeck.color,
            }}
          >
            ⚔  ENTER BATTLE
          </button>
        </div>
      )}
    </div>
  )
}

function DeckCard({ deck, isSelected, onClick }: {
  deck: DeckInfo; isSelected: boolean; onClick: () => void
}) {
  const energyIcons: Record<string, string> = {
    solara: '✦', glacis: '❄', ignis: '◆', verdis: '✿', aether: '◈'
  }

  return (
    <div
      onClick={onClick}
      style={{
        width: 'clamp(160px, 28vw, 200px)',
        padding: 20,
        borderRadius: 12,
        border: `1.5px solid ${isSelected ? deck.color : 'rgba(255,255,255,0.12)'}`,
        background: isSelected ? `${deck.color}15` : 'var(--bg-card)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
        boxShadow: isSelected ? `0 0 20px ${deck.color}44` : 'none',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        border: `2px solid ${deck.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, color: deck.color,
        background: `${deck.color}15`,
        boxShadow: isSelected ? `0 0 16px ${deck.color}44` : 'none',
        margin: '0 auto',
      }}>
        {energyIcons[deck.energyType]}
      </div>

      {/* Name */}
      <div style={{
        textAlign: 'center',
        fontFamily: 'Cinzel, serif',
        fontSize: 14, fontWeight: 600,
        color: isSelected ? deck.color : 'var(--text)',
      }}>
        {deck.name}
      </div>

      {/* Faction */}
      <div style={{
        textAlign: 'center',
        fontSize: 11, color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        {deck.faction}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 12, color: 'var(--text-muted)',
        textAlign: 'center', lineHeight: 1.5,
      }}>
        {deck.description}
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12,
        fontSize: 11, color: 'var(--text-dim)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 8,
      }}>
        <span>30 cards</span>
        <span>·</span>
        <span style={{ color: deck.color }}>{deck.energyType}</span>
      </div>
    </div>
  )
}
