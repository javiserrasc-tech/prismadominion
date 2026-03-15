// ═══════════════════════════════════════════════════════
//  PRISMA DOMINION — Custom Deck Storage (localStorage)
// ═══════════════════════════════════════════════════════

import type { EnergyType } from '../types'

export interface CustomDeck {
  id: string
  name: string
  energyType: EnergyType
  color: string
  deckIds: string[]      // flat array with duplicates (same as DeckInfo)
  createdAt: number
}

const STORAGE_KEY = 'prisma-dominion-custom-decks'

export function loadCustomDecks(): CustomDeck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CustomDeck[]
  } catch {
    return []
  }
}

export function saveCustomDeck(deck: CustomDeck): void {
  const all = loadCustomDecks()
  const idx = all.findIndex(d => d.id === deck.id)
  if (idx >= 0) {
    all[idx] = deck
  } else {
    all.push(deck)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function deleteCustomDeck(id: string): void {
  const all = loadCustomDecks().filter(d => d.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function generateDeckId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

// Deck validation rules
export const DECK_MIN = 40
export const DECK_MAX = 40
export const MAX_COPIES = 3

export function validateDeck(deckIds: string[]): string | null {
  if (deckIds.length !== DECK_MIN) return `Deck must be exactly ${DECK_MIN} cards (you have ${deckIds.length})`
  // Shards are not allowed in deck
  const shardInDeck = deckIds.find(id => id.startsWith('shard-'))
  if (shardInDeck) return `Shards cannot be in the deck (${shardInDeck})`
  const counts: Record<string, number> = {}
  for (const id of deckIds) {
    counts[id] = (counts[id] ?? 0) + 1
    if (counts[id] > MAX_COPIES) return `Max ${MAX_COPIES} copies per card (${id} has ${counts[id]})`
  }
  return null
}
