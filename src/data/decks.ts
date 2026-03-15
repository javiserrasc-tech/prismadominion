import type { DeckInfo } from '../types'

// ═══════════════════════════════════════════════════════
//  PRISMA DOMINION — 5 Mazos predefinidos
//  40 cartas cada uno — SIN shards (se colocan durante el juego)
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
      // Champions ×18
      ...r('champ-aurora',       3),
      ...r('champ-lumia',        3),
      ...r('champ-aria',         3),
      ...r('champ-seraphine',    3),
      ...r('champ-dawn',         3),
      ...r('champ-prism',        3),
      // Arts ×16
      ...r('art-holybeam',       3),
      ...r('art-divineshield',   3),
      ...r('art-healinglight',   3),
      ...r('art-blessing',       3),
      ...r('art-radiantstrike',  2),
      ...r('art-purify',         2),
      // Relics ×6
      ...r('relic-crystalamulet',2),
      ...r('relic-sacredbanner', 2),
      ...r('relic-halocrown',    2),
    ]
    // 18 + 16 + 6 = 40
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
    description: 'Guerreras del fuego. Ataca desde el primer turno y no pares de quemar.',
    deckIds: [
      // Champions ×18
      ...r('champ-ember',        3),
      ...r('champ-spark',        3),
      ...r('champ-pyra',         3),
      ...r('champ-cinder',       3),
      ...r('champ-blaze',        3),
      ...r('champ-volcanic',     3),
      // Arts ×16
      ...r('art-blazingcharge',  3),
      ...r('art-ignite',         3),
      ...r('art-fireball',       3),
      ...r('art-heatwave',       3),
      ...r('art-eruption',       2),
      ...r('art-inferno',        2),
      // Relics ×6
      ...r('relic-forgeoffury',  2),
      ...r('relic-wardrum',      2),
      ...r('relic-embercrown',   2),
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
      // Champions ×18
      ...r('champ-mizuki',       3),
      ...r('champ-frost',        3),
      ...r('champ-marina',       3),
      ...r('champ-coral',        3),
      ...r('champ-sleet',        3),
      ...r('champ-nami',         3),
      // Arts ×16
      ...r('art-icelance',       3),
      ...r('art-insight',        3),
      ...r('art-countercurrent', 3),
      ...r('art-whirlpool',      3),
      ...r('art-blizzard',       2),
      ...r('art-tidalcrash',     2),
      // Relics ×6
      ...r('relic-tidecallerorb',2),
      ...r('relic-frostwatch',   2),
      ...r('relic-arcticthrone', 2),
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
      // Champions ×18
      ...r('champ-moss',         3),
      ...r('champ-willow',       3),
      ...r('champ-sylva',        3),
      ...r('champ-briar',        3),
      ...r('champ-fern',         3),
      ...r('champ-ivy',          3),
      // Arts ×16
      ...r('art-naturesembrace', 3),
      ...r('art-entangle',       3),
      ...r('art-overgrowth',     3),
      ...r('art-ancientrite',    3),
      ...r('art-regrowth',       2),
      ...r('art-sporecloud',     2),
      // Relics ×6
      ...r('relic-druidicaltar', 2),
      ...r('relic-canopyshield', 2),
      ...r('relic-rootnetwork',  2),
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
      // Champions ×18
      ...r('champ-vector',       3),
      ...r('champ-pixel',        3),
      ...r('champ-hex',          3),
      ...r('champ-nova',         3),
      ...r('champ-cipher',       3),
      ...r('champ-exe',          3),
      // Arts ×16
      ...r('art-overclock',      3),
      ...r('art-datadrain',      3),
      ...r('art-nullpointer',    3),
      ...r('art-systemcrash',    3),
      ...r('art-ghostprotocol',  2),
      ...r('art-firewall',       2),
      // Relics ×6
      ...r('relic-neurallink',   2),
      ...r('relic-powercore',    2),
      ...r('relic-quantumcore',  2),
    ]
  },
]

export const DECK_MAP: Record<string, DeckInfo> = Object.fromEntries(
  DECKS.map(d => [d.id, d])
)
