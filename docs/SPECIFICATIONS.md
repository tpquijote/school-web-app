# System & Feature Specifications - Szám-Játékok

This document details the feature specifications, mathematical logic, and game rules for all interactive games in the application.

---

## 1. Grade Arithmetic & Settings Framework (`levels.js`)

The arithmetic engine generates pairs of matching mathematical representations (`value` and matching expressions/numbers in `texts: [exp1, exp2]`).

### Grade Configurations
- **Grade 1 (1. Osztály)**:
  - Scope: Addition and subtraction up to 20.
  - Generates expressions like `5 + 3`, `14 - 6`, or bare numbers `8`.
- **Grade 2 (2. Osztály - Customizable)**:
  - **Number Limit**: Customizable slider (10 to 100, step 10, default 100).
  - **Allowed Operations**: Choice of `+`, `-`, `×`, `÷`.
  - **Memory Card Flip Time**: 0.5s to 5.0s (default 2.0s).
  - **Conquest Turn Timer**: Optional toggle (10s to 60s, default 30s).
- **Grade 3 (3. Osztály)**:
  - Multiplication/Division up to 10x10; Addition/Subtraction up to 1000.
- **Grade 4 (4. Osztály)**:
  - Advanced operations; Addition/Subtraction up to 10,000; two-digit multiplication and division.

---

## 2. Game Modes Specifications

### Game Mode 1: Szám-Mahjong (Math Mahjong)
- **Goal**: Clear the 3D Mahjong tile pyramid by pairing tiles with equal mathematical values.
- **Board Layout**: 52 tiles in 3 stacked grid layers (32 base layer, 16 middle layer, 4 top layer).
- **Rules**:
  - A tile is **clickable** only if it is free (no tile directly on top of it, AND at least one side—left or right—is unblocked).
  - Selecting two matching free tiles removes them with feedback animation.

### Game Mode 2: Szám-Memória Párbaj (Memory Duel)
- **Goal**: 2-player turn-based card memory matching game.
- **Board Layout**: 36 flipped face-down cards (18 pairs).
- **Rules**:
  - Players take turns flipping 2 cards.
  - If values match, the player scores +1 point and gets an extra turn.
  - If values do not match, cards flip back after the configurable memory timer.

### Game Mode 3: Szám-Hódítók (Connect-4 Math Conquest)
- **Goal**: 2-player Connect-4 styled strategic grid control.
- **Board Layout**: 6x6 grid of math equations (36 slots).
- **Rules**:
  - A player selects an uncaptured equation and must answer correctly within the optional turn timer.
  - Correct answers capture the cell in the player's color (Blue/Red).
  - Extra lives / pass mechanics allow competitive play. First to connect 4 in a row (horizontal, vertical, or diagonal) wins.

### Game Mode 4: Matematikai Kaland (Math Race Board Game)
- **Goal**: Race along a 36-space winding path to reach the finish.
- **Board Layout**: 36 path spaces with start and finish indicators.
- **Rules**:
  - Player rolls a 3D animated die (1-6).
  - Correctly answering a math equation advances the player token by the rolled count.
  - First player to reach or pass space 36 wins.

### Game Mode 5: Kötélhúzás (Speed-Matek Tug of War)
- **Goal**: Tug-of-war tugging battle for 2 or 4 players.
- **Rope Track**: 9 nodes (-4 to +4).
- **Rules**:
  - Players simultaneously solve equations using touch keypads.
  - Submitting a correct answer pulls the rope knot 1 position toward the player's side.
  - Reaching node -4 or +4 wins the match immediately.

### Game Mode 6: Autóverseny (Speed Duel Car Race)
- **Goal**: 2 to 4 player simultaneous race over 10 questions.
- **Track Layout**: Parallel race lanes with moving car avatars.
- **Rules**:
  - Each player has an individual equation and custom touch keypad.
  - First to answer 10 questions correctly wins the car race.

### Game Mode 7: Lufi-Matek (Math Balloon Popping)
- **Goal**: Pop 10 balloons containing correct mathematical answers or expressions as they float upward from bottom to top.
- **Rules**:
  - **Modes**:
    - **Standard (Normál)**: Target equation displayed at top panel, balloons float up with numbers. Pop the balloon with the matching result.
    - **Reversed (Fordított)**: Target number displayed at top panel, balloons float up with equations. Pop the balloon with the matching equation value.
    - **Mixed (Vegyes)**: Randomly alternates between standard and reversed targets.
  - Correct balloon pop increases score and triggers pop animation + match sound.
  - Incorrect balloon pop triggers error sound + shake effect without advancing score.
  - First player to reach 10 correct balloon pops wins the game.

---

## 3. UI Keypad Component Specifications
- **Touch Numeric Keypad**:
  - Custom touch-friendly virtual keypad layout (`1-9`, `0`, `-` for negative numbers, `⌫` for backspace, `Ok` for submission).
  - Prevents native mobile soft keyboard popup on tablets/mobiles for consistent touch input UX.
