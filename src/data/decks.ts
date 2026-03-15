import type { DeckInfo } from '../types'

// ═══════════════════════════════════════════════════════
//  PRISMA DOMINION — 5 Mazos predefinidos
//  30 cartas cada uno (12 shards + 18 no-shards)
// ═══════════════════════════════════════════════════════

const r = (id: string, n: number) => Array(n).fill(id)

export const DECKS: DeckInfo[] = [

  // ──────────────────────────────────────────────
  //  ✦ SOLARA SANCTUM — Defensiva, vida, protección
  // ──────────────────────────────────────────────
  {
    id: 'solara-sanctum',
    name: 'Solara Sanctum',
    faction: 'Celestians',
    energyType: 'solara',
    color: '#ffd166',
    description: 'Diosas de luz. Gana vida, protege aliadas y supera al enemigo por resistencia.',
    deckIds: [
      ...r('shard-solara-a', 7),
      ...r('shard-solara-b', 5),
      // Champions ×10
      ...r('champ-aurora',    2),
      ...r('champ-lumia',     2),
      ...r('champ-aria',      2),
      ...r('champ-seraphine', 2),
      ...r('champ-willow',    1),   // aliada de apoyo
      ...r('champ-dawn',      1),
      // Arts ×6
      ...r('art-holybeam',    2),
      ...r('art-divineshield',2),
      ...r('art-healinglight',1),
      ...r('art-blessing',    1),
      // Relics ×2
      ...r('relic-crystalamulet', 1),
      ...r('relic-sacredbanner',  1),
    ]
    // 12 shards + 10 champs + 6 arts + 2 relics = 30
  },

  // ──────────────────────────────────────────────
  //  ◆ IGNIS BLAZE — Agresiva, rush, quema
  // ──────────────────────────────────────────────
  {
    id: 'ignis-blaze',
    name: 'Ignis Blaze',
    faction: 'Ignaras',
    energyType: 'ignis',
    color: '#ff6b8a',
    description: 'Guerreras del fuego. Ataca desde el primer turno y no dejes de quemar.',
    deckIds: [
      ...r('shard-ignis-a', 7),
      ...r('shard-ignis-b', 5),
      // Champions ×10
      ...r('champ-ember',    3),
      ...r('champ-spark',    2),
      ...r('champ-pyra',     2),
      ...r('champ-cinder',   2),
      ...r('champ-blaze',    1),
      // Arts ×6
      ...r('art-blazingcharge', 2),
      ...r('art-ignite',        2),
      ...r('art-fireball',      1),
      ...r('art-heatwave',      1),
      // Relics ×2
      ...r('relic-forgeoffury', 1),
      ...r('relic-wardrum',     1),
    ]
  },

  // ──────────────────────────────────────────────
  //  ❄ GLACIS CONTROL — Control, freeze, robo
  // ──────────────────────────────────────────────
  {
    id: 'glacis-control',
    name: 'Glacis Control',
    faction: 'Frostborne',
    energyType: 'glacis',
    color: '#06d6f7',
    description: 'Dominio total. Paraliza enemigas, roba cartas y gana en el juego tardío.',
    deckIds: [
      ...r('shard-glacis-a', 7),
      ...r('shard-glacis-b', 5),
      // Champions ×10
      ...r('champ-mizuki',  2),
      ...r('champ-frost',   2),
      ...r('champ-marina',  2),
      ...r('champ-coral',   2),
      ...r('champ-sleet',   1),
      ...r('champ-nami',    1),
      // Arts ×6
      ...r('art-icelance',      2),
      ...r('art-insight',       2),
      ...r('art-countercurrent',1),
      ...r('art-whirlpool',     1),
      // Relics ×2
      ...r('relic-tidecallerorb', 1),
      ...r('relic-frostwatch',    1),
    ]
  },

  // ──────────────────────────────────────────────
  //  ✿ VERDIS GROWTH — Naturaleza, vida, resistencia
  // ──────────────────────────────────────────────
  {
    id: 'verdis-growth',
    name: 'Verdis Growth',
    faction: 'Sylvanas',
    energyType: 'verdis',
    color: '#7ae582',
    description: 'El bosque eterno. Bloquea, regenera y aplasta con criaturas enormes.',
    deckIds: [
      ...r('shard-verdis-a', 7),
      ...r('shard-verdis-b', 5),
      // Champions ×10
      ...r('champ-moss',    2),
      ...r('champ-willow',  2),
      ...r('champ-sylva',   2),
      ...r('champ-briar',   2),
      ...r('champ-fern',    1),
      ...r('champ-ivy',     1),
      // Arts ×6
      ...r('art-naturesembrace', 2),
      ...r('art-entangle',       2),
      ...r('art-overgrowth',     1),
      ...r('art-ancientrite',    1),
      // Relics ×2
      ...r('relic-druidicaltar', 1),
      ...r('relic-canopyshield', 1),
    ]
  },

  // ──────────────────────────────────────────────
  //  ◈ AETHER PROTOCOL — Sigilo, hackeo, velocidad
  // ──────────────────────────────────────────────
  {
    id: 'aether-protocol',
    name: 'Aether Protocol',
    faction: 'Nexborn',
    energyType: 'aether',
    color: '#c77dff',
    description: 'Fantasmas digitales. Ataca sin ser bloqueada, roba cartas y destruye permanentes.',
    deckIds: [
      ...r('shard-aether-a', 7),
      ...r('shard-aether-b', 5),
      // Champions ×10
      ...r('champ-vector', 2),
      ...r('champ-pixel',  2),
      ...r('champ-hex',    2),
      ...r('champ-nova',   2),
      ...r('champ-cipher', 1),
      ...r('champ-exe',    1),
      // Arts ×6
      ...r('art-overclock',     2),
      ...r('art-datadrain',     2),
      ...r('art-nullpointer',   1),
      ...r('art-systemcrash',   1),
      // Relics ×2
      ...r('relic-neurallink',  1),
      ...r('relic-powercore',   1),
    ]
  },
]

export const DECK_MAP: Record<string, DeckInfo> = Object.fromEntries(
  DECKS.map(d => [d.id, d])
)
