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

## 🚀 Public Web Deployment (GitHub Pages: Live & Preview)

The project includes an automated GitHub Pages deployment workflow (`.github/workflows/deploy.yml`) that deploys both **Live** and **Preview** endpoints in a single site artifact:

- **Live Version**: Available at root URL:
  `https://<username>.github.io/<repo-name>/`
- **Preview / Test Version**: Available at the `/preview/` subpath:
  `https://<username>.github.io/<repo-name>/preview/`

### How to Enable GitHub Pages
1. Go to your repository on GitHub -> **Settings**.
2. In the left menu under *Code and automation*, click **Pages**.
3. Under **Build and deployment** -> **Source**, select **GitHub Actions**.

---

## 🧪 Testing

### Automated CI Testing
The CI workflow (`.github/workflows/ci.yml`) is configured for manual execution (`workflow_dispatch`) under the Actions tab.

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
