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

  const energyIcons: Record<string, string> = {
    solara: '✦', glacis: '❄', ignis: '◆', verdis: '✿', aether: '◈'
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      padding: 'clamp(10px,2vw,20px)',
      overflow: 'hidden', gap: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button className="btn" onClick={onBack} style={{ padding: '5px 12px', fontSize: 11 }}>← Back</button>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, letterSpacing: '0.1em', color: 'var(--accent)' }}>
            Choose Your Faction
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Select a deck and difficulty</div>
        </div>
      </div>

      {/* Deck grid */}
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap',
        justifyContent: 'center', flex: 1, overflowY: 'auto',
        alignContent: 'flex-start', paddingBottom: 8,
      }}>
        {DECKS.map(deck => (
          <div
            key={deck.id}
            onClick={() => setSelectedDeck(deck)}
            style={{
              width: 'clamp(130px, 18vw, 160px)',
              padding: 14,
              borderRadius: 14,
              border: `1.5px solid ${selectedDeck?.id === deck.id ? deck.color : 'rgba(200,160,255,0.15)'}`,
              background: selectedDeck?.id === deck.id ? `${deck.color}18` : 'var(--bg-card)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              transform: selectedDeck?.id === deck.id ? 'scale(1.03)' : 'scale(1)',
              boxShadow: selectedDeck?.id === deck.id ? `0 0 20px ${deck.color}44` : 'none',
              display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
            }}
          >
            {/* Sigil */}
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              border: `2px solid ${deck.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: deck.color,
              background: `${deck.color}18`,
              boxShadow: selectedDeck?.id === deck.id ? `0 0 16px ${deck.color}55` : 'none',
            }}>
              {energyIcons[deck.energyType]}
            </div>

            {/* Name */}
            <div style={{
              textAlign: 'center', fontFamily: 'Cinzel, serif',
              fontSize: 12, fontWeight: 600,
              color: selectedDeck?.id === deck.id ? deck.color : 'var(--text)',
            }}>
              {deck.name}
            </div>

            {/* Faction */}
            <div style={{
              fontSize: 10, color: 'var(--text-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center',
            }}>
              {deck.faction}
            </div>

            {/* Description */}
            <div style={{
              fontSize: 10, color: 'var(--text-muted)',
              textAlign: 'center', lineHeight: 1.4,
            }}>
              {deck.description}
            </div>

            {/* Bottom strip */}
            <div style={{
              fontSize: 10, color: deck.color,
              borderTop: `1px solid ${deck.color}33`,
              paddingTop: 6, width: '100%', textAlign: 'center',
              letterSpacing: '0.1em',
            }}>
              30 cards
            </div>
          </div>
        ))}
      </div>

      {/* Confirm area */}
      {selectedDeck && (
        <div style={{
          flexShrink: 0,
          padding: '14px 20px',
          borderRadius: 14,
          border: `1px solid ${selectedDeck.color}44`,
          background: `${selectedDeck.color}0d`,
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ fontFamily: 'Cinzel, serif', color: selectedDeck.color, fontSize: 13 }}>
            {selectedDeck.name}
          </div>

          {/* Difficulty */}
          <div style={{ display: 'flex', gap: 8, marginLeft: 4 }}>
            {(['easy', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  padding: '6px 16px', borderRadius: 20,
                  border: `1.5px solid ${difficulty === d ? selectedDeck.color : 'rgba(200,160,255,0.2)'}`,
                  background: difficulty === d ? `${selectedDeck.color}22` : 'transparent',
                  color: difficulty === d ? selectedDeck.color : 'var(--text-muted)',
                  fontFamily: 'Exo 2, sans-serif', fontWeight: 700,
                  fontSize: 11, cursor: 'pointer',
                  textTransform: 'capitalize', letterSpacing: '0.06em',
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
              marginLeft: 'auto', padding: '8px 28px', fontSize: 12,
              borderColor: selectedDeck.color, color: selectedDeck.color,
            }}
          >
            ⚔ ENTER BATTLE
          </button>
        </div>
      )}
    </div>
  )
}
