# ◈ Prisma Dominion

**Chronicle of the Five Goddesses** — A browser card battle game (PWA) inspired by TCG mechanics.

100% original IP. No copyright issues. Deploy freely.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📦 Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Vite** (auto-detected)
4. Click Deploy — done!

The `vercel.json` handles SPA routing automatically.

---

## 🃏 Game Rules (Quick Reference)

### Turn Structure
1. **Untap** — All your cards untap
2. **Draw** — Draw 1 card (take 2 damage if deck is empty)
3. **Main Phase** — Play cards (shards, champions, arts, relics)
4. **Combat** — Declare attackers → opponent assigns blockers → resolve
5. **End Turn** — Pass to opponent

### Card Types
| Type | Cost | Play Limit |
|------|------|-----------|
| **Shard** | Free | 1 per turn |
| **Champion** | Energy | Unlimited |
| **Art** | Energy | Unlimited (instant effects) |
| **Relic** | Energy | Unlimited (persistent effects) |

### Energy
- Each untapped Shard on your battlefield = 1 energy
- Tap Shards to pay for cards

### Keywords
| Keyword | Effect |
|---------|--------|
| Rush | Can attack the turn it's played |
| Flying | Only blocked by Flying creatures |
| Taunt | Enemies must attack this first |
| Trample | Excess damage hits opponent |
| Freeze | When attacks: tap enemy, skip their untap |
| Draw | When attacks unblocked: draw a card |
| Bounce | On enter: return target enemy champion to hand |
| Regenerate | Gain 1 life at start of your turn |
| Harvest | On enter: add 1 bonus energy this turn |
| Resilient | Survive lethal damage once per game |
| Stealth | Cannot be blocked by ATK ≤ 1 |
| Rebirth | On destroy: return as 1/1 |

---

## 🗂 Project Structure

```
prisma-dominion/
├── src/
│   ├── types.ts              # All TypeScript types
│   ├── styles.css            # Global dark anime styles
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Screen router
│   ├── data/
│   │   ├── cards.ts          # 40 card definitions
│   │   └── decks.ts          # 3 predefined decks (30 cards each)
│   ├── game/
│   │   └── engine.ts         # All game logic, rules, combat
│   ├── components/
│   │   └── CardComponent.tsx # Card visuals (hand + battlefield)
│   └── screens/
│       ├── MenuScreen.tsx    # Title screen
│       ├── DeckSelectScreen.tsx # Deck + difficulty picker
│       └── GameScreen.tsx    # Full battle board
├── public/                   # Static assets
├── index.html
├── vite.config.ts            # Vite + PWA plugin
├── tsconfig.json
├── vercel.json               # SPA routing
└── package.json
```

---

## 🎴 Factions

| Faction | Energy | Style |
|---------|--------|-------|
| **Solara Sanctum** | ✦ Solara | Defensive · Healing · Life gain |
| **Ignis Blaze** | ◆ Ignis | Aggressive · Rush · Burn |
| **Glacis Control** | ❄ Glacis | Control · Draw · Freeze |

---

## 🔧 Adding Cards

Edit `src/data/cards.ts` — add a new entry to `CARDS`:

```ts
'champ-mycard': {
  id: 'champ-mycard',
  name: 'My Champion',
  faction: 'MyFaction',
  type: 'champion',
  energyType: 'verdis',
  cost: 3,
  atk: 3, def: 3,
  keywords: ['rush', 'flying'],
  text: 'Rush. Flying.',
  flavor: 'Flavor text here.',
}
```

Then add it to a deck in `src/data/decks.ts`.

---

## 📱 PWA

This app installs as a PWA on mobile (Android/iOS) and desktop Chrome/Edge.
The `vite-plugin-pwa` handles the service worker automatically.

---

## ⚖️ Legal

All card names, faction names, lore, and artwork concepts are 100% original.
No Wizards of the Coast IP is used. The game mechanics (tap, untap, combat, stack)
are not copyrightable and are used freely.
