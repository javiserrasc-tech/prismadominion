import { useState } from 'react'
import { MenuScreen }        from './screens/MenuScreen'
import { DeckSelectScreen }  from './screens/DeckSelectScreen'
import { DeckBuilderScreen } from './screens/DeckBuilderScreen'
import { GameScreen }        from './screens/GameScreen'
import { DECKS }             from './data/decks'
import { CustomDeck, loadCustomDecks } from './utils/storage'
import type { AppScreen } from './types'

function randomAiDeck(playerDeckId: string): string {
  const allIds = [
    ...DECKS.map(d => d.id),
    ...loadCustomDecks().map(d => d.id),
  ]
  const others = allIds.filter(id => id !== playerDeckId)
  if (others.length === 0) return DECKS[0].id
  return others[Math.floor(Math.random() * others.length)]
}

export default function App() {
  const [screen,       setScreen]       = useState<AppScreen>('menu')
  const [playerDeckId, setPlayerDeckId] = useState('')
  const [aiDeckId,     setAiDeckId]     = useState('')
  const [isCustom,     setIsCustom]     = useState(false)
  const [difficulty,   setDifficulty]   = useState<'easy' | 'hard'>('easy')
  const [editingDeck,  setEditingDeck]  = useState<CustomDeck | undefined>(undefined)
  const [refreshKey,   setRefreshKey]   = useState(0)

  function handleDeckSelect(deckId: string, diff: 'easy' | 'hard', custom: boolean) {
    setPlayerDeckId(deckId)
    setAiDeckId(randomAiDeck(deckId))
    setDifficulty(diff)
    setIsCustom(custom)
    setScreen('game')
  }

  function handleNewDeck() {
    setEditingDeck(undefined)
    setScreen('deck-builder')
  }

  function handleEditDeck(deck: CustomDeck) {
    setEditingDeck(deck)
    setScreen('deck-builder')
  }

  function handleSaveDeck() {
    setRefreshKey(k => k + 1)
    setScreen('deck-select')
  }

  // Resolve deck IDs to actual card ID arrays (custom or predefined)
  function getPlayerDeckIds(): string[] {
    if (isCustom) {
      return loadCustomDecks().find(d => d.id === playerDeckId)?.deckIds ?? DECKS[0].deckIds
    }
    return DECKS.find(d => d.id === playerDeckId)?.deckIds ?? DECKS[0].deckIds
  }

  function getAiDeckIds(): string[] {
    const custom = loadCustomDecks().find(d => d.id === aiDeckId)
    if (custom) return custom.deckIds
    return DECKS.find(d => d.id === aiDeckId)?.deckIds ?? DECKS[1].deckIds
  }

  return (
    <>
      {screen === 'menu' && (
        <MenuScreen onStart={() => setScreen('deck-select')} />
      )}

      {screen === 'deck-select' && (
        <DeckSelectScreen
          onSelect={handleDeckSelect}
          onBack={() => setScreen('menu')}
          onNewDeck={handleNewDeck}
          onEditDeck={handleEditDeck}
          refreshKey={refreshKey}
        />
      )}

      {screen === 'deck-builder' && (
        <DeckBuilderScreen
          existingDeck={editingDeck}
          onSave={handleSaveDeck}
          onCancel={() => setScreen('deck-select')}
        />
      )}

      {screen === 'game' && playerDeckId && (
        <GameScreen
          playerDeckIds={getPlayerDeckIds()}
          aiDeckIds={getAiDeckIds()}
          playerDeckId={playerDeckId}
          aiDeckId={aiDeckId}
          difficulty={difficulty}
          onExit={() => setScreen('menu')}
        />
      )}
    </>
  )
}
