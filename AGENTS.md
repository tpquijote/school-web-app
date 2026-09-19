# AGENTS.md - Agent Guide & Guidelines

This document provides concise context and standards for AI agents (Claude, Codex, Gemini, Jules, etc.) working on this repository.

---

## 1. Project Overview & Tech Stack
- **Project Name**: Szám-Játékok (Math Games Platform)
- **Tech Stack**: HTML5, CSS3, ES6 JavaScript Modules (Vanilla JS, no heavy framework required to keep runtime lightweight and web-standard compliant), Node.js for tests/scripts.
- **Languages**:
  - **Codebase & Specs**: English (variable names, functions, comments, docs, commit messages).
  - **User Interface**: Hungarian (labels, game titles, player messages).

---

## 2. Directory & Architecture Structure
- `index.html`: Entry point for web app (`<script type="module" src="js/game.js"></script>`).
- `style.css`: Design system and global game styles.
- `js/`: Modularized JavaScript modules:
  - `js/core/`: Math expression generators (`levels.js`), audio, game engine utilities (`utils.js`).
  - `js/components/`: Reusable UI elements (e.g., custom touch numeric keypad `keypad.js`).
  - `js/games/`: Game controllers for Mahjong (`mahjong.js`), Duel (`duel.js`), Conquest (`conquest.js`), Race (`race.js`), Tug of War (`tug.js`), Car Race (`carrace.js`).
- `docs/`: System specifications and feature documentation.
- `skills/`: CLI tools and helper scripts for AI agents to run, test, and inspect the codebase.
- `tests/`: Automated unit and feature tests.

---

## 3. Agent Skills & Tooling
Agents can execute CLI helper tools located in `skills/` via bash commands:
- `node skills/validate-levels.cjs`: Validates equation generation and level seed math ranges across grades 1-4.
- `node skills/check-modules.cjs`: Checks ES module export/import integrity and detects missing files.
- `npm test`: Runs the automated test suite.

---

## 4. Coding Conventions & Best Practices
1. **AI-Friendly Code Structure**: Keep functions single-purpose, avoid massive monolithic files, export clear modular interfaces.
2. **Pure Math Functions**: Isolate math logic (`levels.js`) from DOM manipulation so it remains testable in Node.js environments without DOM dependencies.
3. **No Direct Artifact Edits**: Edit source ES modules, never build outputs if bundlers are introduced.
4. **Testing**: Always run `npm test` or the relevant agent skill after editing JS or math logic.
