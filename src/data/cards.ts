import type { CardDef } from '../types'

// ═══════════════════════════════════════════════════════
//  PRISMA DOMINION — Card Compendium
//  100 cartas + 10 shards = 110 entradas
//  20 por facción: 10 champions · 7 arts · 3 relics
// ═══════════════════════════════════════════════════════

export const CARDS: Record<string, CardDef> = {

  // ══════════════════════════════════════════════════
  //  SHARDS (10) — energía, gratis, 1 por turno
  // ══════════════════════════════════════════════════

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

  // ══════════════════════════════════════════════════
  //  ✦ SOLARA — Celestians
  //  Luz divina, protección, vida, alas
  // ══════════════════════════════════════════════════

  // ── Champions (10) ──────────────────────────────

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
  'champ-celestia': {
    id: 'champ-celestia', name: 'Celestia', faction: 'Celestians',
    type: 'champion', energyType: 'solara', cost: 5,
    atk: 4, def: 4, keywords: ['flying', 'taunt'],
    text: 'Flying. Taunt. When Celestia enters: gain 3 life.',
    flavor: 'The High Goddess descends only when all hope has faded.'
  },
  'champ-prism': {
    id: 'champ-prism', name: 'Prism', faction: 'Celestians',
    type: 'champion', energyType: 'solara', cost: 1,
    atk: 1, def: 2, keywords: [],
    text: 'When Prism enters: draw 1 card.',
    flavor: 'She refracts the light of destiny into a thousand possibilities.'
  },
  'champ-solenne': {
    id: 'champ-solenne', name: 'Solenne', faction: 'Celestians',
    type: 'champion', energyType: 'solara', cost: 3,
    atk: 2, def: 3, keywords: ['flying', 'regenerate'],
    text: 'Flying. Regenerate: gain 1 life at the start of your turn.',
    flavor: 'She soars above sorrow, healing with every wingbeat.'
  },
  'champ-radiance': {
    id: 'champ-radiance', name: 'Radiance', faction: 'Celestians',
    type: 'champion', energyType: 'solara', cost: 4,
    atk: 3, def: 4, keywords: ['taunt', 'resilient'],
    text: 'Taunt. Resilient: survives the first lethal hit.',
    flavor: 'She has stood at the gates of oblivion and refused to fall.'
  },
  'champ-dawn': {
    id: 'champ-dawn', name: 'Dawn', faction: 'Celestians',
    type: 'champion', energyType: 'solara', cost: 2,
    atk: 3, def: 1, keywords: ['rush'],
    text: 'Rush. When Dawn attacks: gain 1 life.',
    flavor: 'First light strikes fast and leaves warmth in its wake.'
  },
  'champ-solara-prime': {
    id: 'champ-solara-prime', name: 'Solara Prime', faction: 'Celestians',
    type: 'champion', energyType: 'solara', cost: 7,
    atk: 6, def: 6, keywords: ['flying', 'taunt', 'regenerate'],
    text: 'Flying. Taunt. Regenerate. When Solara Prime enters: gain 5 life.',
    flavor: 'The goddess in her true form. The sun kneels before her.'
  },

  // ── Arts (7) ────────────────────────────────────

  'art-holybeam': {
    id: 'art-holybeam', name: 'Holy Beam', faction: 'Solara',
    type: 'art', energyType: 'solara', cost: 2, keywords: [],
    text: 'Deal 3 damage to target champion or opponent.',
    flavor: 'The light does not forgive.'
  },
  'art-divineshield': {
    id: 'art-divineshield', name: 'Divine Shield', faction: 'Solara',
    type: 'art', energyType: 'solara', cost: 1, keywords: [],
    text: 'Target friendly champion gets +0/+3 until end of turn.',
    flavor: 'Faith made solid.'
  },
  'art-healinglight': {
    id: 'art-healinglight', name: 'Healing Light', faction: 'Solara',
    type: 'art', energyType: 'solara', cost: 2, keywords: [],
    text: 'Gain 4 life.',
    flavor: 'She places her palm over the wound and hums. Done.'
  },
  'art-purify': {
    id: 'art-purify', name: 'Purify', faction: 'Solara',
    type: 'art', energyType: 'solara', cost: 1, keywords: [],
    text: 'Target friendly champion loses all debuffs and gains +0/+2 until end of turn.',
    flavor: 'No curse survives contact with genuine light.'
  },
  'art-radiantstrike': {
    id: 'art-radiantstrike', name: 'Radiant Strike', faction: 'Solara',
    type: 'art', energyType: 'solara', cost: 3, keywords: [],
    text: 'Deal 2 damage to all enemy champions.',
    flavor: 'The battlefield turns white for just a moment.'
  },
  'art-blessing': {
    id: 'art-blessing', name: 'Blessing', faction: 'Solara',
    type: 'art', energyType: 'solara', cost: 2, keywords: [],
    text: 'Target friendly champion gets +2/+2 until end of turn.',
    flavor: 'A goddess whispers your name, and suddenly you are invincible.'
  },
  'art-solarflare': {
    id: 'art-solarflare', name: 'Solar Flare', faction: 'Solara',
    type: 'art', energyType: 'solara', cost: 4, keywords: [],
    text: 'Deal 5 damage to target champion or opponent.',
    flavor: 'The sun, condensed into a single merciless point.'
  },

  // ── Relics (3) ──────────────────────────────────

  'relic-crystalamulet': {
    id: 'relic-crystalamulet', name: 'Crystal Amulet', faction: 'Solara',
    type: 'relic', energyType: 'solara', cost: 2, keywords: [],
    text: 'At the start of each of your turns: gain 1 bonus energy.',
    flavor: 'A gift from an age no one remembers.'
  },
  'relic-halocrown': {
    id: 'relic-halocrown', name: 'Halo Crown', faction: 'Solara',
    type: 'relic', energyType: 'solara', cost: 3, keywords: [],
    text: 'All your champions on the battlefield get +0/+2.',
    flavor: 'To wear it is to become a little more than human.'
  },
  'relic-sacredbanner': {
    id: 'relic-sacredbanner', name: 'Sacred Banner', faction: 'Solara',
    type: 'relic', energyType: 'solara', cost: 2, keywords: [],
    text: 'At the start of your turn: gain 1 life for each friendly champion on the battlefield.',
    flavor: 'They rally to the light. The light heals them in return.'
  },

  // ══════════════════════════════════════════════════
  //  ❄ GLACIS — Frostborne
  //  Hielo, marea, control, conocimiento
  // ══════════════════════════════════════════════════

  // ── Champions (10) ──────────────────────────────

  'champ-marina': {
    id: 'champ-marina', name: 'Marina', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 2,
    atk: 2, def: 3, keywords: ['draw'],
    text: 'When Marina attacks unblocked: draw a card.',
    flavor: 'Her raids always leave questions in their wake.'
  },
  'champ-coral': {
    id: 'champ-coral', name: 'Coral', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 3,
    atk: 1, def: 4, keywords: ['freeze'],
    text: 'Freeze: when Coral attacks, tap target enemy. It skips its next untap.',
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
  'champ-blizzara': {
    id: 'champ-blizzara', name: 'Blizzara', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 4,
    atk: 2, def: 5, keywords: ['freeze', 'taunt'],
    text: 'Taunt. Freeze: when Blizzara attacks, tap target enemy. It skips its next untap.',
    flavor: 'She invites you to attack first. You will regret it.'
  },
  'champ-sleet': {
    id: 'champ-sleet', name: 'Sleet', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 2,
    atk: 2, def: 2, keywords: ['draw'],
    text: 'When Sleet attacks unblocked: draw a card.',
    flavor: 'She slips through defenses like rain through fingers.'
  },
  'champ-aqua': {
    id: 'champ-aqua', name: 'Aqua', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 3,
    atk: 3, def: 3, keywords: ['flying'],
    text: 'Flying. When Aqua enters: deal 1 damage to all enemy champions.',
    flavor: 'She arrives on the storm and leaves on the wave.'
  },
  'champ-tempest': {
    id: 'champ-tempest', name: 'Tempest', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 5,
    atk: 4, def: 3, keywords: ['bounce', 'draw'],
    text: 'Bounce: when Tempest enters, return target enemy to hand. When Tempest attacks unblocked: draw a card.',
    flavor: 'The storm takes, and the storm gives — always in that order.'
  },
  'champ-frost': {
    id: 'champ-frost', name: 'Frost', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 1,
    atk: 1, def: 2, keywords: ['stealth'],
    text: 'Stealth: cannot be blocked by champions with ATK 1 or less.',
    flavor: 'She leaves no footprint. Only cold.'
  },
  'champ-thalassa': {
    id: 'champ-thalassa', name: 'Thalassa', faction: 'Frostborne',
    type: 'champion', energyType: 'glacis', cost: 6,
    atk: 5, def: 4, keywords: ['trample', 'freeze'],
    text: 'Trample. Freeze: when Thalassa attacks, tap target enemy. It skips its next untap.',
    flavor: 'The deep ocean does not ask permission to move.'
  },

  // ── Arts (7) ────────────────────────────────────

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
  'art-whirlpool': {
    id: 'art-whirlpool', name: 'Whirlpool', faction: 'Glacis',
    type: 'art', energyType: 'glacis', cost: 2, keywords: [],
    text: 'Return target enemy champion to their hand.',
    flavor: 'The spiral takes everything. The spiral returns nothing.'
  },
  'art-frozentime': {
    id: 'art-frozentime', name: 'Frozen Time', faction: 'Glacis',
    type: 'art', energyType: 'glacis', cost: 4, keywords: [],
    text: 'Tap all enemy champions. They each skip their next untap.',
    flavor: 'For a heartbeat, even time held its breath.'
  },
  'art-insight': {
    id: 'art-insight', name: 'Insight', faction: 'Glacis',
    type: 'art', energyType: 'glacis', cost: 2, keywords: [],
    text: 'Draw 2 cards.',
    flavor: 'Two paths diverged in the data stream. She took both.'
  },
  'art-blizzard': {
    id: 'art-blizzard', name: 'Blizzard', faction: 'Glacis',
    type: 'art', energyType: 'glacis', cost: 3, keywords: [],
    text: 'Deal 1 damage to all enemy champions and tap them.',
    flavor: 'The cold does not kill outright. It simply makes everything slower.'
  },
  'art-countercurrent': {
    id: 'art-countercurrent', name: 'Countercurrent', faction: 'Glacis',
    type: 'art', energyType: 'glacis', cost: 2, keywords: [],
    text: 'Deal 3 damage to target tapped enemy champion.',
    flavor: 'Strike hardest when they are already drowning.'
  },

  // ── Relics (3) ──────────────────────────────────

  'relic-frostwatch': {
    id: 'relic-frostwatch', name: 'Frostwatch Tower', faction: 'Glacis',
    type: 'relic', energyType: 'glacis', cost: 3, keywords: [],
    text: 'At the start of your turn: tap target enemy champion. It skips its next untap.',
    flavor: 'From the tower, the whole battlefield is visible. And frozen.'
  },
  'relic-tidecallerorb': {
    id: 'relic-tidecallerorb', name: "Tidecaller's Orb", faction: 'Glacis',
    type: 'relic', energyType: 'glacis', cost: 2, keywords: [],
    text: 'At the start of your turn: draw 1 extra card.',
    flavor: 'The orb shows the next wave before it arrives.'
  },
  'relic-arcticthrone': {
    id: 'relic-arcticthrone', name: 'Arctic Throne', faction: 'Glacis',
    type: 'relic', energyType: 'glacis', cost: 4, keywords: [],
    text: 'All your champions on the battlefield get +1/+2.',
    flavor: 'To sit on the throne of ice is to become something colder and stronger.'
  },

  // ══════════════════════════════════════════════════
  //  ◆ IGNIS — Ignaras
  //  Fuego, rush, agresión, caos
  // ══════════════════════════════════════════════════

  // ── Champions (10) ──────────────────────────────

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
    text: 'Flying. Rebirth: when Scarlet is destroyed, return her as 1/1.',
    flavor: 'You can kill a flame once. Twice is impossible.'
  },
  'champ-ember': {
    id: 'champ-ember', name: 'Ember', faction: 'Ignaras',
    type: 'champion', energyType: 'ignis', cost: 1,
    atk: 2, def: 1, keywords: ['rush'],
    text: 'Rush.',
    flavor: 'Small spark, big fire.'
  },
  'champ-inferna': {
    id: 'champ-inferna', name: 'Inferna', faction: 'Ignaras',
    type: 'champion', energyType: 'ignis', cost: 4,
    atk: 4, def: 3, keywords: ['rush', 'flying'],
    text: 'Rush. Flying. When Inferna attacks: deal 1 damage to the opponent.',
    flavor: 'She does not descend from the sky. She erupts from it.'
  },
  'champ-cinder': {
    id: 'champ-cinder', name: 'Cinder', faction: 'Ignaras',
    type: 'champion', energyType: 'ignis', cost: 2,
    atk: 3, def: 1, keywords: ['rush'],
    text: 'Rush. When Cinder is destroyed: deal 2 damage to the opponent.',
    flavor: 'Even dying, she burns you.'
  },
  'champ-blaze': {
    id: 'champ-blaze', name: 'Blaze', faction: 'Ignaras',
    type: 'champion', energyType: 'ignis', cost: 3,
    atk: 3, def: 2, keywords: ['trample'],
    text: 'Trample: excess combat damage hits the opponent.',
    flavor: 'She does not stop for walls.'
  },
  'champ-volcanic': {
    id: 'champ-volcanic', name: 'Volcanic', faction: 'Ignaras',
    type: 'champion', energyType: 'ignis', cost: 5,
    atk: 5, def: 3, keywords: ['trample', 'rush'],
    text: 'Rush. Trample.',
    flavor: 'Every eruption is just the planet losing its patience.'
  },
  'champ-spark': {
    id: 'champ-spark', name: 'Spark', faction: 'Ignaras',
    type: 'champion', energyType: 'ignis', cost: 1,
    atk: 1, def: 1, keywords: ['rush', 'harvest'],
    text: 'Rush. Harvest: when Spark enters, add 1 bonus energy this turn.',
    flavor: 'Quick, cheap, and gone before you notice the damage.'
  },
  'champ-magmara': {
    id: 'champ-magmara', name: 'Magmara', faction: 'Ignaras',
    type: 'champion', energyType: 'ignis', cost: 6,
    atk: 6, def: 4, keywords: ['trample', 'rebirth'],
    text: 'Trample. Rebirth: when destroyed, return as 1/1.',
    flavor: 'She is the mountain itself — and mountains do not die.'
  },

  // ── Arts (7) ────────────────────────────────────

  'art-fireball': {
    id: 'art-fireball', name: 'Fireball', faction: 'Ignis',
    type: 'art', energyType: 'ignis', cost: 3, keywords: [],
    text: 'Deal 4 damage to target champion or opponent.',
    flavor: 'No time for elegance.'
  },
  'art-blazingcharge': {
    id: 'art-blazingcharge', name: 'Blazing Charge', faction: 'Ignis',
    type: 'art', energyType: 'ignis', cost: 1, keywords: [],
    text: 'Target friendly champion gains Rush and +2/+0 until end of turn.',
    flavor: 'Do not hesitate. Hesitation is defeat.'
  },
  'art-ignite': {
    id: 'art-ignite', name: 'Ignite', faction: 'Ignis',
    type: 'art', energyType: 'ignis', cost: 1, keywords: [],
    text: 'Deal 2 damage to target champion.',
    flavor: 'The smallest spark is enough when aimed correctly.'
  },
  'art-inferno': {
    id: 'art-inferno', name: 'Inferno', faction: 'Ignis',
    type: 'art', energyType: 'ignis', cost: 4, keywords: [],
    text: 'Deal 3 damage to all enemy champions.',
    flavor: 'The battlefield does not burn. It becomes the fire.'
  },
  'art-heatwave': {
    id: 'art-heatwave', name: 'Heat Wave', faction: 'Ignis',
    type: 'art', energyType: 'ignis', cost: 2, keywords: [],
    text: 'All your champions get +2/+0 until end of turn.',
    flavor: 'The temperature rises. So does the aggression.'
  },
  'art-eruption': {
    id: 'art-eruption', name: 'Eruption', faction: 'Ignis',
    type: 'art', energyType: 'ignis', cost: 3, keywords: [],
    text: 'Deal 2 damage to the opponent and 2 damage to target enemy champion.',
    flavor: 'The mountain chose both targets at once.'
  },
  'art-phoenixcall': {
    id: 'art-phoenixcall', name: 'Phoenix Call', faction: 'Ignis',
    type: 'art', energyType: 'ignis', cost: 4, keywords: [],
    text: 'Return target champion from your graveyard to your hand.',
    flavor: 'Death is a suggestion Ignaras champions tend to ignore.'
  },

  // ── Relics (3) ──────────────────────────────────

  'relic-forgeoffury': {
    id: 'relic-forgeoffury', name: 'Forge of Fury', faction: 'Ignis',
    type: 'relic', energyType: 'ignis', cost: 2, keywords: [],
    text: 'All your champions on the battlefield get +2/+0.',
    flavor: 'Every weapon here was forged in anger. Every one was worth it.'
  },
  'relic-embercrown': {
    id: 'relic-embercrown', name: 'Ember Crown', faction: 'Ignis',
    type: 'relic', energyType: 'ignis', cost: 3, keywords: [],
    text: 'At the start of your turn: deal 1 damage to a random enemy champion.',
    flavor: 'The crown burns. The queen does not notice.'
  },
  'relic-wardrum': {
    id: 'relic-wardrum', name: 'War Drum', faction: 'Ignis',
    type: 'relic', energyType: 'ignis', cost: 2, keywords: [],
    text: 'At the start of your turn: gain 1 bonus energy.',
    flavor: 'The beat accelerates. So do they.'
  },

  // ══════════════════════════════════════════════════
  //  ✿ VERDIS — Sylvanas
  //  Naturaleza, vida, resistencia, tierra
  // ══════════════════════════════════════════════════

  // ── Champions (10) ──────────────────────────────

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
    text: 'Resilient: the first time Ivy would be destroyed, survive with 1 DEF instead.',
    flavor: 'Roots do not break. They bend and return.'
  },
  'champ-briar': {
    id: 'champ-briar', name: 'Briar', faction: 'Sylvanas',
    type: 'champion', energyType: 'verdis', cost: 2,
    atk: 2, def: 3, keywords: ['resilient'],
    text: 'Resilient. When Briar enters: gain 1 life.',
    flavor: 'You can trim thorns. They grow back sharper.'
  },
  'champ-thorn': {
    id: 'champ-thorn', name: 'Thorn', faction: 'Sylvanas',
    type: 'champion', energyType: 'verdis', cost: 3,
    atk: 3, def: 3, keywords: [],
    text: 'When Thorn blocks and is damaged: deal 2 damage to the attacker.',
    flavor: 'She does not swing first. She makes you regret swinging at all.'
  },
  'champ-willow': {
    id: 'champ-willow', name: 'Willow', faction: 'Sylvanas',
    type: 'champion', energyType: 'verdis', cost: 2,
    atk: 1, def: 4, keywords: ['taunt', 'regenerate'],
    text: 'Taunt. Regenerate: gain 1 life at the start of your turn.',
    flavor: 'She bends in every storm. She has never broken.'
  },
  'champ-verdant': {
    id: 'champ-verdant', name: 'Verdant', faction: 'Sylvanas',
    type: 'champion', energyType: 'verdis', cost: 4,
    atk: 3, def: 4, keywords: ['harvest', 'trample'],
    text: 'Harvest: when Verdant enters, add 1 bonus energy. Trample.',
    flavor: 'The jungle itself walks in her shadow.'
  },
  'champ-moss': {
    id: 'champ-moss', name: 'Moss', faction: 'Sylvanas',
    type: 'champion', energyType: 'verdis', cost: 1,
    atk: 1, def: 3, keywords: ['taunt'],
    text: 'Taunt.',
    flavor: 'Small, quiet, impossibly difficult to remove.'
  },
  'champ-worldtree': {
    id: 'champ-worldtree', name: 'World Tree', faction: 'Sylvanas',
    type: 'champion', energyType: 'verdis', cost: 7,
    atk: 5, def: 7, keywords: ['taunt', 'regenerate', 'resilient'],
    text: 'Taunt. Regenerate. Resilient. When World Tree enters: gain 4 life.',
    flavor: 'She is not a champion. She is a biome.'
  },

  // ── Arts (7) ────────────────────────────────────

  'art-naturesembrace': {
    id: 'art-naturesembrace', name: "Nature's Embrace", faction: 'Verdis',
    type: 'art', energyType: 'verdis', cost: 2, keywords: [],
    text: 'Target friendly champion gets +2/+2 until end of turn.',
    flavor: 'The forest gives freely to those who listen.'
  },
  'art-entangle': {
    id: 'art-entangle', name: 'Entangle', faction: 'Verdis',
    type: 'art', energyType: 'verdis', cost: 2, keywords: [],
    text: 'Tap target enemy champion. It skips its next untap phase.',
    flavor: 'Roots do not ask. Roots simply hold.'
  },
  'art-regrowth': {
    id: 'art-regrowth', name: 'Regrowth', faction: 'Verdis',
    type: 'art', energyType: 'verdis', cost: 2, keywords: [],
    text: 'Return target champion from your graveyard to your hand.',
    flavor: 'In the forest, nothing truly dies. It just waits.'
  },
  'art-overgrowth': {
    id: 'art-overgrowth', name: 'Overgrowth', faction: 'Verdis',
    type: 'art', energyType: 'verdis', cost: 3, keywords: [],
    text: 'All your champions get +1/+2 until end of turn.',
    flavor: 'The forest decided to grow faster today.'
  },
  'art-sporecloud': {
    id: 'art-sporecloud', name: 'Spore Cloud', faction: 'Verdis',
    type: 'art', energyType: 'verdis', cost: 3, keywords: [],
    text: 'Deal 1 damage to all enemy champions and tap them.',
    flavor: 'Breathe it in. Sleep now.'
  },
  'art-ancientrite': {
    id: 'art-ancientrite', name: 'Ancient Rite', faction: 'Verdis',
    type: 'art', energyType: 'verdis', cost: 3, keywords: [],
    text: 'Gain 2 life for each friendly champion on the battlefield.',
    flavor: 'The older the ritual, the more the land remembers.'
  },
  'art-verdantstorm': {
    id: 'art-verdantstorm', name: 'Verdant Storm', faction: 'Verdis',
    type: 'art', energyType: 'verdis', cost: 4, keywords: [],
    text: 'Deal 3 damage to target champion and gain 3 life.',
    flavor: 'The forest strikes. The forest heals. Both happen at once.'
  },

  // ── Relics (3) ──────────────────────────────────

  'relic-druidicaltar': {
    id: 'relic-druidicaltar', name: 'Druidic Altar', faction: 'Verdis',
    type: 'relic', energyType: 'verdis', cost: 2, keywords: [],
    text: 'At the start of your turn: gain 2 life.',
    flavor: 'The ritual takes three seconds. The healing lasts a lifetime.'
  },
  'relic-canopyshield': {
    id: 'relic-canopyshield', name: 'Canopy Shield', faction: 'Verdis',
    type: 'relic', energyType: 'verdis', cost: 3, keywords: [],
    text: 'All your champions on the battlefield get +0/+2.',
    flavor: 'The canopy does not ask if you deserve its protection.'
  },
  'relic-rootnetwork': {
    id: 'relic-rootnetwork', name: 'Root Network', faction: 'Verdis',
    type: 'relic', energyType: 'verdis', cost: 2, keywords: [],
    text: 'At the start of your turn: gain 1 bonus energy.',
    flavor: 'Below the surface, everything is connected. Everything feeds everything.'
  },

  // ══════════════════════════════════════════════════
  //  ◈ AETHER — Nexborn
  //  Ciberespacio, sigilo, hackeo, datos
  // ══════════════════════════════════════════════════

  // ── Champions (10) ──────────────────────────────

  'champ-pixel': {
    id: 'champ-pixel', name: 'Pixel', faction: 'Nexborn',
    type: 'champion', energyType: 'aether', cost: 2,
    atk: 2, def: 2, keywords: ['stealth'],
    text: 'Stealth: cannot be blocked by champions with ATK 1 or less.',
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
    atk: 2, def: 2, keywords: ['flying', 'draw'],
    text: 'Flying. When Exe attacks unblocked: draw a card.',
    flavor: 'Access granted. Always.'
  },
  'champ-cipher': {
    id: 'champ-cipher', name: 'Cipher', faction: 'Nexborn',
    type: 'champion', energyType: 'aether', cost: 3,
    atk: 2, def: 3, keywords: ['stealth', 'draw'],
    text: 'Stealth. When Cipher attacks unblocked: draw a card.',
    flavor: 'No message she carries has ever been intercepted.'
  },
  'champ-vector': {
    id: 'champ-vector', name: 'Vector', faction: 'Nexborn',
    type: 'champion', energyType: 'aether', cost: 2,
    atk: 3, def: 1, keywords: ['rush', 'stealth'],
    text: 'Rush. Stealth.',
    flavor: 'She finds the gap before you know it exists.'
  },
  'champ-binary': {
    id: 'champ-binary', name: 'Binary', faction: 'Nexborn',
    type: 'champion', energyType: 'aether', cost: 4,
    atk: 3, def: 3, keywords: ['flying'],
    text: 'Flying. When Binary deals combat damage to the opponent: draw a card.',
    flavor: 'Zero or one. Attack or withdraw. She never hesitates on the choice.'
  },
  'champ-daemon': {
    id: 'champ-daemon', name: 'Daemon', faction: 'Nexborn',
    type: 'champion', energyType: 'aether', cost: 3,
    atk: 2, def: 4, keywords: [],
    text: 'When Daemon enters: return target enemy champion to their hand.',
    flavor: 'She runs in the background. You never see her until the crash.'
  },
  'champ-hex': {
    id: 'champ-hex', name: 'Hex', faction: 'Nexborn',
    type: 'champion', energyType: 'aether', cost: 2,
    atk: 1, def: 3, keywords: ['stealth'],
    text: 'Stealth. When Hex enters: deal 2 damage to target enemy champion.',
    flavor: 'She arrives as a virus. She leaves as a scar.'
  },
  'champ-null': {
    id: 'champ-null', name: 'Null', faction: 'Nexborn',
    type: 'champion', energyType: 'aether', cost: 5,
    atk: 4, def: 4, keywords: ['flying', 'resilient'],
    text: 'Flying. Resilient. When Null enters: destroy target enemy relic.',
    flavor: 'Error: entity not found. Exception: everything.'
  },

  // ── Arts (7) ────────────────────────────────────

  'art-systemcrash': {
    id: 'art-systemcrash', name: 'System Crash', faction: 'Aether',
    type: 'art', energyType: 'aether', cost: 3, keywords: [],
    text: 'Destroy target non-Shard card on the battlefield.',
    flavor: 'Fatal error. Existence terminated.'
  },
  'art-datadrain': {
    id: 'art-datadrain', name: 'Data Drain', faction: 'Aether',
    type: 'art', energyType: 'aether', cost: 2, keywords: [],
    text: 'Deal 2 damage to target champion and draw 1 card.',
    flavor: 'She takes their strength and files it under her name.'
  },
  'art-overclock': {
    id: 'art-overclock', name: 'Overclock', faction: 'Aether',
    type: 'art', energyType: 'aether', cost: 1, keywords: [],
    text: 'Target friendly champion gets +2/+0 and Rush until end of turn.',
    flavor: 'Push past the limit. Deal with the heat later.'
  },
  'art-ghostprotocol': {
    id: 'art-ghostprotocol', name: 'Ghost Protocol', faction: 'Aether',
    type: 'art', energyType: 'aether', cost: 3, keywords: [],
    text: 'All your champions gain Stealth until end of turn.',
    flavor: 'They were there. Then they were not. Then they attacked.'
  },
  'art-nullpointer': {
    id: 'art-nullpointer', name: 'Null Pointer', faction: 'Aether',
    type: 'art', energyType: 'aether', cost: 2, keywords: [],
    text: 'Deal 3 damage to target tapped enemy champion.',
    flavor: 'Pointing at nothing is, apparently, very dangerous.'
  },
  'art-reboot': {
    id: 'art-reboot', name: 'Reboot', faction: 'Aether',
    type: 'art', energyType: 'aether', cost: 3, keywords: [],
    text: 'Return target champion from your graveyard to your hand.',
    flavor: 'Loading previous state. All losses restored.'
  },
  'art-firewall': {
    id: 'art-firewall', name: 'Firewall', faction: 'Aether',
    type: 'art', energyType: 'aether', cost: 2, keywords: [],
    text: 'Target friendly champion gets +0/+4 until end of turn.',
    flavor: 'The wall does not burn. The wall is the fire.'
  },

  // ── Relics (3) ──────────────────────────────────

  'relic-powercore': {
    id: 'relic-powercore', name: 'Power Core', faction: 'Aether',
    type: 'relic', energyType: 'aether', cost: 3, keywords: [],
    text: 'All your champions on the battlefield get +1/+0.',
    flavor: 'Upgrades, compliments of the Nexborn.'
  },
  'relic-neurallink': {
    id: 'relic-neurallink', name: 'Neural Link', faction: 'Aether',
    type: 'relic', energyType: 'aether', cost: 2, keywords: [],
    text: 'At the start of your turn: draw 1 extra card.',
    flavor: 'The link is always open. The data never stops.'
  },
  'relic-quantumcore': {
    id: 'relic-quantumcore', name: 'Quantum Core', faction: 'Aether',
    type: 'relic', energyType: 'aether', cost: 3, keywords: [],
    text: 'All your champions on the battlefield get +1/+1.',
    flavor: 'In superposition: winning and losing simultaneously. Until you measure.'
  },
}

export function getCard(id: string): CardDef {
  const c = CARDS[id]
  if (!c) throw new Error(`Unknown card: ${id}`)
  return c
}
