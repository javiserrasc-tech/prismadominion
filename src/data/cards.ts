import type { CardDef } from '../types'

// ═══════════════════════════════════════════════════════
//  PRISMA DOMINION — Complete Card Compendium (40 cards)
// ═══════════════════════════════════════════════════════

export const CARDS: Record<string, CardDef> = {

  // ─────────────────── SHARDS (10) ───────────────────

  'shard-solara-a': {
    id: 'shard-solara-a', name: 'Celestia Shrine', faction: 'Solara',
    type: 'shard', energyType: 'solara', cost: 0, keywords: [],
    text: 'Tap: Add 1 Solara energy.',
    flavor: 'Where dawn breaks eternal.'
  },
  'shard-solara-b': {
    id: 'shard-solara-b', name: "Heaven's Gate", faction: 'Solara',
    type: 'shard', energyType: 'solara', cost: 0, keywords: [],
    text: 'Tap: Add 1 Solara energy.',
    flavor: 'The light never fades here.'
  },
  'shard-glacis-a': {
    id: 'shard-glacis-a', name: 'Frost Sanctum', faction: 'Glacis',
    type: 'shard', energyType: 'glacis', cost: 0, keywords: [],
    text: 'Tap: Add 1 Glacis energy.',
    flavor: 'Still water, deep memory.'
  },
  'shard-glacis-b': {
    id: 'shard-glacis-b', name: 'Tidal Nexus', faction: 'Glacis',
    type: 'shard', energyType: 'glacis', cost: 0, keywords: [],
    text: 'Tap: Add 1 Glacis energy.',
    flavor: 'Beneath the tide, the truth.'
  },
  'shard-ignis-a': {
    id: 'shard-ignis-a', name: 'Ember Forge', faction: 'Ignis',
    type: 'shard', energyType: 'ignis', cost: 0, keywords: [],
    text: 'Tap: Add 1 Ignis energy.',
    flavor: 'Born in fire, refined in war.'
  },
  'shard-ignis-b': {
    id: 'shard-ignis-b', name: 'Crimson Citadel', faction: 'Ignis',
    type: 'shard', energyType: 'ignis', cost: 0, keywords: [],
    text: 'Tap: Add 1 Ignis energy.',
    flavor: 'Its walls have never cooled.'
  },
  'shard-verdis-a': {
    id: 'shard-verdis-a', name: 'Ancient Grove', faction: 'Verdis',
    type: 'shard', energyType: 'verdis', cost: 0, keywords: [],
    text: 'Tap: Add 1 Verdis energy.',
    flavor: 'Roots older than the Nexus itself.'
  },
  'shard-verdis-b': {
    id: 'shard-verdis-b', name: 'Canopy Nexus', faction: 'Verdis',
    type: 'shard', energyType: 'verdis', cost: 0, keywords: [],
    text: 'Tap: Add 1 Verdis energy.',
    flavor: 'Even machines bow to the canopy.'
  },
  'shard-aether-a': {
    id: 'shard-aether-a', name: 'Cyber Hub', faction: 'Aether',
    type: 'shard', energyType: 'aether', cost: 0, keywords: [],
    text: 'Tap: Add 1 Aether energy.',
    flavor: 'Infinite data flows through its core.'
  },
  'shard-aether-b': {
    id: 'shard-aether-b', name: 'Digital Rift', faction: 'Aether',
    type: 'shard', energyType: 'aether', cost: 0, keywords: [],
    text: 'Tap: Add 1 Aether energy.',
    flavor: 'A crack in reality — or is it a door?'
  },

  // ─────────────── CHAMPIONS: SOLARA (4) ───────────────

  'champ-seraphine': {
    id: 'champ-seraphine', name: 'Seraphine', faction: 'Celestians',
    type: 'champion', energyType: 'solara', cost: 3,
    atk: 3, def: 3, keywords: ['flying'],
    text: 'Flying. When Seraphine enters: gain 2 life.',
    flavor: 'Her wings carry the weight of every prayer.'
  },
  'champ-lumia': {
    id: 'champ-lumia', name: 'Lumia', faction: 'Celestians',
    type: 'champion', energyType: 'solara', cost: 2,
    atk: 2, def: 4, keywords: ['taunt'],
    text: 'Taunt. Enemies must attack Lumia first if able.',
    flavor: '"Come. I have been waiting."'
  },
  'champ-aria': {
    id: 'champ-aria', name: 'Aria', faction: 'Celestians',
    type: 'champion', energyType: 'solara', cost: 2,
    atk: 2, def: 2, keywords: [],
    text: 'When Aria attacks: deal 1 damage to any enemy champion.',
    flavor: 'Each arrow is a whispered blessing.'
  },
  'champ-aurora': {
    id: 'champ-aurora', name: 'Aurora', faction: 'Celestians',
    type: 'champion', energyType: 'solara', cost: 3,
    atk: 1, def: 5, keywords: ['taunt', 'regenerate'],
    text: 'Taunt. Regenerate: gain 1 life at the start of your turn.',
    flavor: 'She turns her back on no one.'
  },

  // ─────────────── CHAMPIONS: GLACIS (4) ───────────────

  'champ-marina': {
    id: 'champ-marina', name: 'Marina', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 2,
    atk: 2, def: 3, keywords: ['draw'],
    text: 'When Marina attacks: draw a card.',
    flavor: 'Her raids always leave questions in their wake.'
  },
  'champ-coral': {
    id: 'champ-coral', name: 'Coral', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 3,
    atk: 1, def: 4, keywords: ['freeze'],
    text: 'Freeze: when Coral attacks, tap target enemy champion. It skips its next untap.',
    flavor: 'She does not fight. She simply stops you.'
  },
  'champ-nami': {
    id: 'champ-nami', name: 'Nami', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 3,
    atk: 3, def: 2, keywords: ['bounce'],
    text: 'Bounce: when Nami enters, return target enemy champion to their hand.',
    flavor: 'The tide always takes back what it gave.'
  },
  'champ-mizuki': {
    id: 'champ-mizuki', name: 'Mizuki', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 2,
    atk: 1, def: 2, keywords: [],
    text: 'When Mizuki enters: draw 1 extra card.',
    flavor: 'She sees the river of fate before it bends.'
  },

  // ─────────────── CHAMPIONS: IGNIS (4) ────────────────

  'champ-pyra': {
    id: 'champ-pyra', name: 'Pyra', faction: 'Ignaras',
    type: 'champion', energyType: 'ignis', cost: 2,
    atk: 3, def: 2, keywords: ['rush'],
    text: 'Rush: can attack the turn it enters.',
    flavor: '"Wait for what?"'
  },
  'champ-igna': {
    id: 'champ-igna', name: 'Igna', faction: 'Ignaras',
    type: 'champion', energyType: 'ignis', cost: 3,
    atk: 4, def: 2, keywords: [],
    text: 'At the start of each of your turns: Igna gets +1 ATK and loses 1 DEF.',
    flavor: 'The longer the fight, the more dangerous she becomes.'
  },
  'champ-scarlet': {
    id: 'champ-scarlet', name: 'Scarlet', faction: 'Ignaras',
    type: 'champion', energyType: 'ignis', cost: 4,
    atk: 3, def: 3, keywords: ['flying', 'rebirth'],
    text: 'Flying. Rebirth: when Scarlet is destroyed, return her to the battlefield as 1/1.',
    flavor: 'You can kill a flame once. Twice is impossible.'
  },
  'champ-ember': {
    id: 'champ-ember', name: 'Ember', faction: 'Ignaras',
    type: 'champion', energyType: 'ignis', cost: 1,
    atk: 2, def: 1, keywords: ['rush'],
    text: 'Rush.',
    flavor: 'Small spark, big fire.'
  },

  // ─────────────── CHAMPIONS: VERDIS (4) ───────────────

  'champ-sylva': {
    id: 'champ-sylva', name: 'Sylva', faction: 'Sylvanas',
    type: 'champion', energyType: 'verdis', cost: 2,
    atk: 2, def: 4, keywords: ['regenerate'],
    text: 'Regenerate: gain 1 life at the start of your turn.',
    flavor: 'Every wound becomes a new root.'
  },
  'champ-fern': {
    id: 'champ-fern', name: 'Fern', faction: 'Sylvanas',
    type: 'champion', energyType: 'verdis', cost: 2,
    atk: 1, def: 3, keywords: ['harvest'],
    text: 'Harvest: when Fern enters, add 1 bonus energy this turn.',
    flavor: 'She asks the forest, and it provides.'
  },
  'champ-gaia': {
    id: 'champ-gaia', name: 'Gaia', faction: 'Sylvanas',
    type: 'champion', energyType: 'verdis', cost: 6,
    atk: 5, def: 5, keywords: ['trample'],
    text: 'Trample: excess combat damage carries over to the opponent.',
    flavor: 'When Gaia walks, the world remembers its age.'
  },
  'champ-ivy': {
    id: 'champ-ivy', name: 'Ivy', faction: 'Sylvanas',
    type: 'champion', energyType: 'verdis', cost: 3,
    atk: 3, def: 3, keywords: ['resilient'],
    text: 'Resilient: the first time Ivy would be destroyed each game, survive with 1 DEF instead.',
    flavor: 'Roots do not break. They bend and return.'
  },

  // ─────────────── CHAMPIONS: AETHER (4) ───────────────

  'champ-pixel': {
    id: 'champ-pixel', name: 'Pixel', faction: 'Nexborn',
    type: 'champion', energyType: 'aether', cost: 2,
    atk: 2, def: 2, keywords: ['stealth'],
    text: 'Stealth: cannot be blocked by champions with 1 ATK or less.',
    flavor: 'She walks between the packets.'
  },
  'champ-nova': {
    id: 'champ-nova', name: 'Nova', faction: 'Nexborn',
    type: 'champion', energyType: 'aether', cost: 2,
    atk: 3, def: 1, keywords: [],
    text: 'When Nova attacks: target enemy champion gets -1/-1 until end of turn.',
    flavor: 'A glitch in your armor is all she needs.'
  },
  'champ-glitch': {
    id: 'champ-glitch', name: 'Glitch', faction: 'Nexborn',
    type: 'champion', energyType: 'aether', cost: 3,
    atk: 1, def: 3, keywords: [],
    text: 'When your opponent casts an Art: deal 1 damage to them.',
    flavor: 'Every spell has a backdoor.'
  },
  'champ-exe': {
    id: 'champ-exe', name: 'Exe', faction: 'Nexborn',
    type: 'champion', energyType: 'aether', cost: 3,
    atk: 2, def: 2, keywords: ['flying'],
    text: 'Flying. When Exe deals combat damage to opponent: draw a card.',
    flavor: 'Access granted. Always.'
  },

  // ──────────────── ARTS / SPELLS (8) ──────────────────

  'art-holybeam': {
    id: 'art-holybeam', name: 'Holy Beam', faction: 'Solara',
    type: 'art', energyType: 'solara', cost: 2, keywords: [],
    text: 'Deal 3 damage to target champion.',
    flavor: 'The light does not forgive.'
  },
  'art-divineshield': {
    id: 'art-divineshield', name: 'Divine Shield', faction: 'Solara',
    type: 'art', energyType: 'solara', cost: 1, keywords: [],
    text: 'Target friendly champion gets +0/+3 until end of turn.',
    flavor: 'Faith made solid.'
  },
  'art-tidalcrash': {
    id: 'art-tidalcrash', name: 'Tidal Crash', faction: 'Glacis',
    type: 'art', energyType: 'glacis', cost: 3, keywords: [],
    text: 'Deal 2 damage to all enemy champions.',
    flavor: 'The ocean does not choose sides.'
  },
  'art-icelance': {
    id: 'art-icelance', name: 'Ice Lance', faction: 'Glacis',
    type: 'art', energyType: 'glacis', cost: 2, keywords: [],
    text: 'Tap target enemy champion. It skips its next untap phase.',
    flavor: 'Cold is just patience made physical.'
  },
  'art-fireball': {
    id: 'art-fireball', name: 'Fireball', faction: 'Ignis',
    type: 'art', energyType: 'ignis', cost: 3, keywords: [],
    text: 'Deal 4 damage to target champion or deal 4 damage to opponent.',
    flavor: 'No time for elegance.'
  },
  'art-blazingcharge': {
    id: 'art-blazingcharge', name: 'Blazing Charge', faction: 'Ignis',
    type: 'art', energyType: 'ignis', cost: 1, keywords: [],
    text: 'Target friendly champion gains Rush and +2/+0 until end of turn.',
    flavor: 'Do not hesitate. Hesitation is defeat.'
  },
  'art-naturesembrace': {
    id: 'art-naturesembrace', name: "Nature's Embrace", faction: 'Verdis',
    type: 'art', energyType: 'verdis', cost: 2, keywords: [],
    text: 'Target friendly champion gets +2/+2 until end of turn.',
    flavor: 'The forest gives freely to those who listen.'
  },
  'art-systemcrash': {
    id: 'art-systemcrash', name: 'System Crash', faction: 'Aether',
    type: 'art', energyType: 'aether', cost: 3, keywords: [],
    text: 'Destroy target non-Shard card on the battlefield.',
    flavor: 'Fatal error. Existence terminated.'
  },

  // ──────────────────── RELICS (2) ─────────────────────

  'relic-crystalamulet': {
    id: 'relic-crystalamulet', name: 'Crystal Amulet', faction: 'Solara',
    type: 'relic', energyType: 'solara', cost: 2, keywords: [],
    text: 'At the start of each of your turns, gain 1 bonus energy.',
    flavor: 'A gift from an age no one remembers.'
  },
  'relic-powercore': {
    id: 'relic-powercore', name: 'Power Core', faction: 'Aether',
    type: 'relic', energyType: 'aether', cost: 3, keywords: [],
    text: 'All your champions on the battlefield get +1/+0.',
    flavor: 'Upgrades, compliments of the Nexborn.'
  },
}

export function getCard(id: string): CardDef {
  const c = CARDS[id]
  if (!c) throw new Error(`Unknown card: ${id}`)
  return c
}
