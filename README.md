# Szám-Játékok (Math Games)

An interactive, multi-mode educational mathematics game collection designed for elementary school students (Grades 1–4). Built as a modern, dependency-free vanilla JavaScript web application.

---

## 🎮 Game Modes Included
1. **Szám-Mahjong (Math Mahjong)**: Clear 3D matching math tiles.
2. **Szám-Memória Párbaj (Memory Duel)**: 2-player turn-based card memory battle.
3. **Szám-Hódítók (Connect-4 Math Conquest)**: Strategic 2-player 6x6 grid conquer game.
4. **Matematikai Kaland (Math Race)**: 36-space board race game with interactive 3D dice.
5. **Kötélhúzás (Speed-Matek Tug of War)**: Multi-player speed math tug-of-war battle.
6. **Autóverseny (Speed Duel Car Race)**: Multi-player racing lanes powered by equation solving speed.

---

## 🚀 How to Set Up Public Web Hosting (GitHub Pages)

Because this project is a pure static web app (HTML, CSS, ES modules), it can be hosted for free on **GitHub Pages** in under 1 minute:

1. Push your repository to GitHub.
2. In your GitHub repository, click on **Settings** (top menu).
3. In the left sidebar, under *Code and automation*, click **Pages**.
4. Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
5. Under **Branch**, select `main` (or `master`) branch and set the folder to `/ (root)`.
6. Click **Save**.
7. GitHub will generate your free public URL (e.g. `https://<username>.github.io/<repo-name>/`).

---

## 🧪 Testing in GitHub

### Automated Testing (CI)
This repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`). Every time code is pushed or a pull request is opened, GitHub automatically runs:
1. `npm test` - Executes unit tests in `tests/levels.test.js`.
2. `node skills/validate-levels.cjs` - Validates arithmetic expression generation across Grades 1–4.
3. `node skills/check-modules.cjs` - Verifies file layout and component module integrity.

You can view test results under the **Actions** tab on your GitHub repository.

### Local Testing
To run tests locally:
```bash
# Run unit tests
npm test

# Run level generator validation skill
node skills/validate-levels.cjs

# Run module structure check
node skills/check-modules.cjs
```

To run the web app locally, start any static web server in the root folder:
```bash
npx http-server -p 8080 .
```
Then open `http://localhost:8080` in your web browser.

---

## 📄 Documentation
- **`AGENTS.md`**: Directives and conventions for AI developer agents (like Jules or AMI).
- **`docs/SPECIFICATIONS.md`**: Detailed technical specifications, arithmetic rule limits, and game mechanics.
