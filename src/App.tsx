import { useState } from 'react'
import { MenuScreen } from './screens/MenuScreen'
import { DeckSelectScreen } from './screens/DeckSelectScreen'
import { GameScreen } from './screens/GameScreen'
import { DECKS } from './data/decks'
import type { AppScreen } from './types'

function randomAiDeck(playerDeckId: string): string {
  const others = DECKS.filter(d => d.id !== playerDeckId)
  return others[Math.floor(Math.random() * others.length)].id
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('menu')
  const [playerDeckId, setPlayerDeckId] = useState<string>('')
  const [aiDeckId, setAiDeckId] = useState<string>('')
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy')

  const handleDeckSelect = (deckId: string, diff: 'easy' | 'hard') => {
    setPlayerDeckId(deckId)
    setAiDeckId(randomAiDeck(deckId))
    setDifficulty(diff)
    setScreen('game')
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
        />
      )}
      {screen === 'game' && playerDeckId && (
        <GameScreen
          playerDeckId={playerDeckId}
          aiDeckId={aiDeckId}
          difficulty={difficulty}
          onExit={() => setScreen('menu')}
        />
      )}
    </>
  )
}
