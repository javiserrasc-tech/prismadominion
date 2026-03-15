// ═══════════════════════════════════════════════════════
//  PRISMA DOMINION — Core Types
// ═══════════════════════════════════════════════════════

export type EnergyType = 'solara' | 'glacis' | 'ignis' | 'verdis' | 'aether'
export type CardType = 'champion' | 'art' | 'relic' | 'shard'
export type Keyword =
  | 'rush'       // can attack turn played
  | 'flying'     // only blocked by flying
  | 'taunt'      // must be attacked first
  | 'trample'    // excess damage hits opponent
  | 'freeze'     // when attacks: tap target enemy, skip their untap
  | 'draw'       // when attacks: draw a card
  | 'bounce'     // on enter: return target enemy to hand
  | 'regenerate' // at start of your turn: gain 1 life
  | 'harvest'    // on enter: add 1 extra energy this turn
  | 'resilient'  // survive lethal damage once
  | 'stealth'    // can't be blocked by ATK ≤ 1
  | 'rebirth'    // on destroy: return as 1/1

export interface CardDef {
  id: string
  name: string
  faction: string         // lore faction name
  type: CardType
  energyType: EnergyType
  cost: number
  atk?: number
  def?: number
  keywords: Keyword[]
  text: string
  flavor?: string
}

export interface BattleCard {
  uid: string             // unique instance id (cardId + Math.random())
  defId: string           // reference to CardDef
  tapped: boolean
  summonSick: boolean     // true when just played; cleared at untap unless rush
  attacking: boolean      // declared as attacker this combat
  resilientUsed: boolean  // once-per-game resilient
  rebirthDone: boolean    // once-per-card rebirth
  bonusAtk: number        // temporary (cleared at end of turn)
  bonusDef: number
  frozenTurns: number     // how many untap phases to skip
  rushThisTurn: boolean   // gained rush via art
}

export type GamePhase =
  | 'player-shard'        // Player picks which color shard to place this turn
  | 'player-main'         // Player's main phase: play cards, declare attack, end turn
  | 'player-attackers'    // Player picks attackers
  | 'player-blockers'     // Player assigns blockers (when AI attacked)
  | 'combat-resolve'      // Auto-resolve combat (brief flash)
  | 'ai-turn'             // AI does everything (with delays in component)
  | 'game-over'

export interface PlayerState {
  life: number
  hand: CardDef[]
  deck: CardDef[]
  battlefield: BattleCard[]
  graveyard: CardDef[]
  shardsPlaced: number   // how many shards on battlefield (max 10)
  extraEnergy: number    // from harvest, relics, etc.
}

export interface CombatState {
  attackerUids: string[]
  blockerMap: Record<string, string>   // attackerUid → blockerUid
  source: 'player' | 'ai'
}

export interface GameState {
  phase: GamePhase
  turn: number
  activePlayer: 'player' | 'ai'
  player: PlayerState
  ai: PlayerState
  combat: CombatState | null
  log: string[]
  winner: 'player' | 'ai' | null
  difficulty: 'easy' | 'hard'
  pendingSpell: { defId: string; needsFriendlyTarget: boolean; needsEnemyTarget: boolean } | null
  selectedBlockerFor: string | null    // attackerUid player is assigning a blocker to
}

// ═══════════════════════════════════════════════════
//  App Screen State
// ═══════════════════════════════════════════════════

export type AppScreen = 'menu' | 'deck-select' | 'deck-builder' | 'game'

export interface DeckInfo {
  id: string
  name: string
  faction: string
  energyType: EnergyType
  description: string
  color: string
  deckIds: string[]
}
