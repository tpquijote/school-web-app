const fs = require('fs');
const path = require('path');

console.log("=== Agent Skill: Module & File Integrity Check ===");

const filesToCheck = [
    'index.html',
    'style.css',
    'AGENTS.md',
    'DOMINO_TODO.md',
    'js/game.js',
    'js/core/audio.js',
    'js/core/levels.js',
    'js/core/utils.js',
    'js/components/keypad.js',
    'js/games/mahjong.js',
    'js/games/duel.js',
    'js/games/conquest.js',
    'js/games/race.js',
    'js/games/tug.js',
    'js/games/carrace.js'
];

let allPassed = true;

filesToCheck.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
        console.log(`✓ File present: ${file}`);
    } else {
        console.error(`✗ Missing required file: ${file}`);
        allPassed = false;
    }
});

if (allPassed) {
    console.log("✅ File structure integrity check passed.");
} else {
    console.error("❌ File structure check failed!");
    process.exit(1);
}
