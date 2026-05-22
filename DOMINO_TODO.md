# Domino Arithmetic Game - Concept & Implementation TODO

This document tracks ideas and architecture proposals for introducing a new **Domino Arithmetic (Dominó Aritmetika)** game to the platform.

---

## 1. Game Concept: Domino Arithmetic

Instead of matching standard pip numbers, players match domino tiles by resolving math equations or values:
- **Tile Structure**: Each domino has two halves. Each half can contain either a **simple number** (e.g., `8`) or an **arithmetic expression** (e.g., `12 - 4`, `2 × 4`).
- **Match Criteria**: A connection is valid if the value on the touching half of the placed domino matches the value of the target domino half (e.g., a tile side with `8` connects to `12 - 4` or another `8`).
- **Difficulty Scaling**:
  - **Grade 1-2**: Addition & Subtraction up to 20 (e.g., `5 + 3` or `14 - 6`).
  - **Grade 3-4**: Addition & Subtraction up to 100, simple multiplication/division (e.g., `7 × 8` or `45 ÷ 5`).
  - **Grade 5+**: Mixed operations, potential negative results, order of operations.

---

## 2. Visual Directions & UX

To fit the platform's high-end aesthetic:
- **Premium Tile Design**:
  - Glassmorphic domino tiles with subtle border gradients and inner drop-shadows.
  - A clean vertical or horizontal dividing line with metallic styling.
  - Custom typography (Nunito / Outfit) with contrasting colors for equations vs. answers.
- **Board Layout**:
  - A scrollable/zoomable 2D board where dominoes can be placed horizontally or vertically, forming a winding chain.
  - Glowing highlight drop-zones showing valid positions where the selected tile can be placed.
- **Interactions**:
  - **Touch & Drag**: Smooth drag-and-drop tiles for touch screens.
  - **Tap-to-Place**: For accessibility, clicking a tile in the hand highlights valid spots on the board; clicking a spot animates the tile into place.

---

## 3. Architecture & Modularization Plan

As the number of games grows, maintaining everything in a single `index.html` / `style.css` / `js/game.js` becomes difficult. We should separate and modularize:

```
math-mahjong/
├── index.html                  # Main Landing Hub (Select Game)
├── assets/                     # Shared logo, sound, or icon assets
├── games/
│   ├── mahjong/
│   │   ├── index.html          # Isolated Mahjong game page
│   │   ├── style.css
│   │   └── mahjong.js
│   ├── race/
│   │   ├── index.html          # Isolated Math Race board game page
│   │   ├── style.css
│   │   └── race.js
│   └── domino/
│       ├── index.html          # New Domino game page
│       ├── style.css
│       └── domino.js
└── shared/
    ├── css/
    │   └── common.css          # Design system variables, buttons, screens
    └── js/
        ├── levels.js           # Shared grade arithmetic seed generators
        └── ui-components.js    # Shared custom elements (e.g., custom-keypad)
```

### Transition Steps:
1. **Extract Math Race & Mahjong**: Move current HTML views and JS logic into their own directories under `/games/` for better code isolation and prevent CSS class name collisions.
2. **Standardize Shared Logic**: Externalize math equation generation (`js/levels.js`) so any game can query a standard mathematical generator by grade and operations.
3. **Common Keypad Component**: Turn the custom touch-screen keypad into a reusable module or Web Component that can be imported easily by any input field in any game.
