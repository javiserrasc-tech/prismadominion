import type { DeckInfo } from '../types'

// ═══════════════════════════════════════════════════════
//  PRISMA DOMINION — Predefined Decks (30 cards each)
// ═══════════════════════════════════════════════════════

const repeat = (id: string, n: number) => Array(n).fill(id)

export const DECKS: DeckInfo[] = [
  {
    id: 'solara-sanctum',
    name: 'Solara Sanctum',
    faction: 'Celestians',
    energyType: 'solara',
    color: '#f5a623',
    description: 'Defensive goddesses of light. Gain life, protect allies, outlast the enemy.',
    deckIds: [
      ...repeat('shard-solara-a', 8),
      ...repeat('shard-solara-b', 4),
      ...repeat('champ-aurora', 3),
      ...repeat('champ-lumia', 3),
      ...repeat('champ-aria', 3),
      ...repeat('champ-seraphine', 3),
      ...repeat('art-holybeam', 4),
      ...repeat('art-divineshield', 2),
    ]
    // 12 shards + 12 champions + 6 arts = 30
  },
  {
    id: 'ignis-blaze',
    name: 'Ignis Blaze',
    faction: 'Ignaras',
    energyType: 'ignis',
    color: '#e84040',
    description: 'Relentless fire warriors. Attack fast, attack hard, never stop burning.',
    deckIds: [
      ...repeat('shard-ignis-a', 8),
      ...repeat('shard-ignis-b', 4),
      ...repeat('champ-ember', 4),
      ...repeat('champ-pyra', 3),
      ...repeat('champ-igna', 3),
      ...repeat('champ-scarlet', 2),
      ...repeat('art-fireball', 4),
      ...repeat('art-blazingcharge', 2),
    ]
    // 12 shards + 12 champions + 6 arts = 30
  },
  {
    id: 'glacis-control',
    name: 'Glacis Control',
    faction: 'Frostborne',
    energyType: 'glacis',
    color: '#4a90d9',
    description: 'Masters of control and information. Freeze enemies, draw cards, dominate the late game.',
    deckIds: [
      ...repeat('shard-glacis-a', 8),
      ...repeat('shard-glacis-b', 4),
      ...repeat('champ-mizuki', 3),
      ...repeat('champ-marina', 3),
      ...repeat('champ-coral', 3),
      ...repeat('champ-nami', 3),
      ...repeat('art-tidalcrash', 4),
      ...repeat('art-icelance', 2),
    ]
    // 12 shards + 12 champions + 6 arts = 30
  },
]

export const DECK_MAP: Record<string, DeckInfo> = Object.fromEntries(DECKS.map(d => [d.id, d]))
