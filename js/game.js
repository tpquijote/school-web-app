// js/game.js

// Constants for tile rendering
const TILE_WIDTH = 80;  // slightly larger than CSS width for spacing
const TILE_HEIGHT = 100;
const TILE_OFFSET_X = -6; // pseudo 3D effect offset per layer (moves left)
const TILE_OFFSET_Y = -6; // moves up, matching the CSS box-shadow which goes right-down

// Game State
let currentLevel = null;
let activeTiles = [];
let selectedTile = null;
let pairsLeft = 0;
let lastGradePlayed = null;

// New Duel Game State
let activeMode = 'mahjong'; // 'mahjong' or 'duel' or 'conquest' or 'race'
let activeGrade = 2;
let playerScores = [0, 0];
let currentPlayer = 0; // 0 = P1 (Blue), 1 = P2 (Red)
let duelCards = [];
let selectedCards = [];
let isProcessingTurn = false;

// New Conquest Game State
let conquestTiles = [];
let selectedConquestTiles = [];
let conquestLives = [3, 3]; // lives for player 1 and 2
let conquestTimerInterval = null;
let conquestTimeRemaining = 30;
let conquestTimerActive = false;

// New Race Game State
let racePlayers = [{ position: 0 }, { position: 0 }];
let currentRaceQuestion = null;
let raceDiceRolled = false;
let rolledDiceValue = 0;
let raceOrientation = 'wide';

// DOM Elements
const screens = {
    mainMenu: document.getElementById('main-menu'),
    settings: document.getElementById('settings-screen'),
    game: document.getElementById('game-screen'),
    duel: document.getElementById('duel-screen'),
    conquest: document.getElementById('conquest-screen'),
    race: document.getElementById('race-screen'),
    win: document.getElementById('win-screen'),
    duelWin: document.getElementById('duel-win-screen'),
    conquestWin: document.getElementById('conquest-win-screen'),
    raceWin: document.getElementById('race-win-screen'),
    tug: document.getElementById('tug-screen'),
    tugWin: document.getElementById('tug-win-screen'),
    carRace: document.getElementById('car-race-screen'),
    carRaceWin: document.getElementById('car-race-win-screen')
};

const gameBoard = document.getElementById('game-board');
const gradeDisplay = document.getElementById('grade-display');
const pairsLeftDisplay = document.getElementById('pairs-left');
const messageArea = document.getElementById('message-area');

// New Duel DOM Elements
const duelTurnDisplay = document.getElementById('duel-turn-display');
const player1ScoreDisplay = document.getElementById('player1-score');
const player2ScoreDisplay = document.getElementById('player2-score');
const player1Card = document.getElementById('player1-card');
const player2Card = document.getElementById('player2-card');
const duelWinnerTitle = document.getElementById('duel-winner-title');
const duelWinnerText = document.getElementById('duel-winner-text');
const duelP1FinalScore = document.getElementById('duel-p1-final-score');
const duelP2FinalScore = document.getElementById('duel-p2-final-score');
const duelPairsLeftDisplay = document.getElementById('duel-pairs-left');
const selectedModeDisplay = document.getElementById('selected-mode-display');

// New Conquest DOM Elements
const conquestTurnDisplay = document.getElementById('conquest-turn-display');
const conquestPlayer1ScoreDisplay = document.getElementById('conquest-player1-score');
const conquestPlayer2ScoreDisplay = document.getElementById('conquest-player2-score');
const conquestPlayer1Card = document.getElementById('conquest-player1-card');
const conquestPlayer2Card = document.getElementById('conquest-player2-card');
const conquestWinnerTitle = document.getElementById('conquest-winner-title');
const conquestWinnerText = document.getElementById('conquest-winner-text');
const conquestP1FinalScore = document.getElementById('conquest-p1-final-score');
const conquestP2FinalScore = document.getElementById('conquest-p2-final-score');
const conquestPairsLeftDisplay = document.getElementById('conquest-pairs-left');
const conquestBoard = document.getElementById('conquest-board');

// Settings Elements
const limitSlider = document.getElementById('limit-slider');
const limitVal = document.getElementById('limit-val');
const memoryTimeSlider = document.getElementById('memory-time-slider');
const memoryTimeVal = document.getElementById('memory-time-val');
const opButtons = document.querySelectorAll('.op-toggle-btn');
const startGameBtn = document.getElementById('start-game-btn');
const settingsBackBtn = document.getElementById('settings-back-btn');
const winBackToMenuBtn = document.getElementById('win-back-to-menu-btn');

// Mode Selection Buttons Listeners
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        activeMode = e.target.dataset.mode;
        activeGrade = 2;
        
        // Show/hide memory time settings depending on game mode
        const memoryTimeGroup = document.getElementById('memory-time-group');
        if (memoryTimeGroup) {
            memoryTimeGroup.style.display = (activeMode === 'duel') ? 'flex' : 'none';
        }
        
        // Show/hide conquest timer options
        const conquestOptionsGroup = document.getElementById('conquest-options-group');
        if (conquestOptionsGroup) {
            conquestOptionsGroup.style.display = (activeMode === 'conquest') ? 'flex' : 'none';
        }
        
        // Show/hide race options
        const raceOptionsGroup = document.getElementById('race-options-group');
        if (raceOptionsGroup) {
            raceOptionsGroup.style.display = (activeMode === 'race') ? 'flex' : 'none';
        }
        
        // Show/hide tug options
        const tugOptionsGroup = document.getElementById('tug-options-group');
        if (tugOptionsGroup) {
            tugOptionsGroup.style.display = (activeMode === 'tug') ? 'flex' : 'none';
        }
        
        // Show/hide car race options
        const carRaceOptionsGroup = document.getElementById('car-race-options-group');
        if (carRaceOptionsGroup) {
            carRaceOptionsGroup.style.display = (activeMode === 'carRace') ? 'flex' : 'none';
        }
        
        switchScreen('settings');
    });
});

// Settings Slider Listeners
if (limitSlider && limitVal) {
    limitSlider.addEventListener('input', (e) => {
        limitVal.textContent = e.target.value;
    });
}

if (memoryTimeSlider && memoryTimeVal) {
    memoryTimeSlider.addEventListener('input', (e) => {
        memoryTimeVal.textContent = parseFloat(e.target.value).toFixed(1);
    });
}

// Conquest timer toggle listener
const conquestTimerEnable = document.getElementById('conquest-timer-enable');
const conquestTimerSliderContainer = document.getElementById('conquest-timer-slider-container');
const conquestTimerSlider = document.getElementById('conquest-timer-slider');
const conquestTimerVal = document.getElementById('conquest-timer-val');

if (conquestTimerEnable && conquestTimerSliderContainer) {
    conquestTimerEnable.addEventListener('change', () => {
        conquestTimerSliderContainer.style.display = conquestTimerEnable.checked ? 'block' : 'none';
    });
}

if (conquestTimerSlider && conquestTimerVal) {
    conquestTimerSlider.addEventListener('input', (e) => {
        conquestTimerVal.textContent = e.target.value;
    });
}

// Settings Operator Toggle Listeners
opButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const activeOps = document.querySelectorAll('.op-toggle-btn.active');
        if (activeOps.length === 0) {
            btn.classList.add('active');
            showMessage('Legalább egy műveletet ki kell választani!', '#ff6b6b');
        }
    });
});

// Start Game from Settings Listener
if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        const limit = parseInt(limitSlider.value);
        const ops = [];
        document.querySelectorAll('.op-toggle-btn.active').forEach(btn => {
            ops.push(btn.dataset.op);
        });
        
        window.grade2Settings.limit = limit;
        window.grade2Settings.ops = ops;
        if (memoryTimeSlider) {
            window.grade2Settings.memoryTime = parseFloat(memoryTimeSlider.value);
        } else {
            window.grade2Settings.memoryTime = 2.0;
        }
        
        // Conquest timer settings
        const cTimerEnable = document.getElementById('conquest-timer-enable');
        const cTimerSlider = document.getElementById('conquest-timer-slider');
        window.grade2Settings.conquestTimerEnabled = cTimerEnable ? cTimerEnable.checked : false;
        window.grade2Settings.conquestTimerLimit = cTimerSlider ? parseInt(cTimerSlider.value) : 30;
        
        if (activeMode === 'mahjong') {
            startGame(2);
        } else if (activeMode === 'duel') {
            startDuel(2);
        } else if (activeMode === 'conquest') {
            startConquest(2);
        } else if (activeMode === 'race') {
            startRace(2);
        } else if (activeMode === 'tug') {
            startTug(tugPlayerCount, 2);
        } else if (activeMode === 'carRace') {
            startCarRace(carRacePlayerCount, 2);
        }
    });
}

// Navigation Back Buttons Listeners
document.getElementById('back-btn').addEventListener('click', () => switchScreen('settings'));
document.getElementById('duel-back-btn').addEventListener('click', () => switchScreen('settings'));
document.getElementById('conquest-back-btn').addEventListener('click', () => {
    stopConquestTimer();
    switchScreen('settings');
});
document.getElementById('race-back-btn').addEventListener('click', () => switchScreen('settings'));
const tugBackBtn = document.getElementById('tug-back-btn');
if (tugBackBtn) {
    tugBackBtn.addEventListener('click', () => switchScreen('settings'));
}
if (settingsBackBtn) settingsBackBtn.addEventListener('click', showMainMenu);
if (winBackToMenuBtn) winBackToMenuBtn.addEventListener('click', showMainMenu);
document.getElementById('duel-win-back-to-menu-btn').addEventListener('click', showMainMenu);
document.getElementById('conquest-win-back-to-menu-btn').addEventListener('click', () => {
    stopConquestTimer();
    showMainMenu();
});
document.getElementById('race-win-back-to-menu-btn').addEventListener('click', showMainMenu);
const tugWinBackToMenuBtn = document.getElementById('tug-win-back-to-menu-btn');
if (tugWinBackToMenuBtn) {
    tugWinBackToMenuBtn.addEventListener('click', showMainMenu);
}

const carRaceBackBtn = document.getElementById('car-race-back-btn');
if (carRaceBackBtn) {
    carRaceBackBtn.addEventListener('click', () => switchScreen('settings'));
}

const carRaceWinBackToMenuBtn = document.getElementById('car-race-win-back-to-menu-btn');
if (carRaceWinBackToMenuBtn) {
    carRaceWinBackToMenuBtn.addEventListener('click', showMainMenu);
}

const carRacePlayAgainBtn = document.getElementById('car-race-play-again-btn');
if (carRacePlayAgainBtn) {
    carRacePlayAgainBtn.addEventListener('click', () => {
        startCarRace(carRacePlayerCount, lastGradePlayed || 2);
    });
}

document.querySelectorAll('.player-count-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.player-count-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        carRacePlayerCount = parseInt(e.target.dataset.count) || 2;
    });
});

document.querySelectorAll('.tug-player-count-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tug-player-count-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        tugPlayerCount = parseInt(e.target.dataset.count) || 2;
    });
});


// Orientation toggle button listeners
const orientationWideBtn = document.getElementById('orientation-wide-btn');
const orientationTallBtn = document.getElementById('orientation-tall-btn');

if (orientationWideBtn && orientationTallBtn) {
    orientationWideBtn.addEventListener('click', () => {
        raceOrientation = 'wide';
        orientationWideBtn.classList.add('active');
        orientationTallBtn.classList.remove('active');
    });
    orientationTallBtn.addEventListener('click', () => {
        raceOrientation = 'tall';
        orientationTallBtn.classList.add('active');
        orientationWideBtn.classList.remove('active');
    });
}

// Conquest Pass Button Listener
const conquestPassBtn = document.getElementById('conquest-pass-btn');
if (conquestPassBtn) {
    conquestPassBtn.addEventListener('click', () => {
        if (isProcessingTurn) return;
        conquestPassTurn();
    });
}

// Race Roll Button & Dice Face Listeners
const raceRollBtn = document.getElementById('race-roll-btn');
if (raceRollBtn) {
    raceRollBtn.addEventListener('click', handleRaceDiceRoll);
}
const raceDiceFace = document.getElementById('race-dice-face');
if (raceDiceFace) {
    raceDiceFace.addEventListener('click', handleRaceDiceRoll);
}

// Play Again Listener
document.getElementById('play-again-btn').addEventListener('click', () => {
    startGame(2);
});
document.getElementById('duel-play-again-btn').addEventListener('click', () => {
    startDuel(2);
});
document.getElementById('conquest-play-again-btn').addEventListener('click', () => {
    startConquest(2);
});
document.getElementById('race-play-again-btn').addEventListener('click', () => {
    startRace(2);
});
const tugPlayAgainBtn = document.getElementById('tug-play-again-btn');
if (tugPlayAgainBtn) {
    tugPlayAgainBtn.addEventListener('click', () => {
        startTug(tugPlayerCount, lastGradePlayed || 2);
    });
}

// Race Submit Event Listeners
const raceSubmitBtn = document.getElementById('race-submit-btn');
if (raceSubmitBtn) {
    raceSubmitBtn.addEventListener('click', handleRaceSubmit);
}
const raceAnswerInput = document.getElementById('race-answer-input');
if (raceAnswerInput) {
    raceAnswerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleRaceSubmit();
        }
    });
}

// Custom numeric keypad event listeners
const raceKeypad = document.getElementById('race-keypad');
if (raceKeypad && raceAnswerInput) {
    raceKeypad.addEventListener('click', (e) => {
        const btn = e.target.closest('.keypad-btn');
        if (!btn) return;
        e.preventDefault();
        
        const val = btn.getAttribute('data-val');
        if (val === 'back') {
            raceAnswerInput.value = raceAnswerInput.value.slice(0, -1);
        } else if (val === '-') {
            if (raceAnswerInput.value.startsWith('-')) {
                raceAnswerInput.value = raceAnswerInput.value.slice(1);
            } else {
                raceAnswerInput.value = '-' + raceAnswerInput.value;
            }
        } else if (val !== null) {
            if (raceAnswerInput.value.length < 5) {
                raceAnswerInput.value += val;
            }
        }
        raceAnswerInput.focus();
    });
    
    // Prevent mouse/pointer down on keypad buttons from stealing focus from input
    raceKeypad.querySelectorAll('.keypad-btn').forEach(btn => {
        const preventDev = (e) => e.preventDefault();
        btn.addEventListener('pointerdown', preventDev);
        btn.addEventListener('mousedown', preventDev);
    });
}
function normalizeExpression(text) {
    text = text.trim();
    const hasOperator = /[+\*×/÷\-]/.test(text);
    if (!hasOperator) {
        return null;
    }
    
    let normalized = text.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
    
    if (normalized.includes('+')) {
        const parts = normalized.split('+').map(Number);
        if (parts.length === 2 && !parts.some(isNaN)) {
            parts.sort((a, b) => a - b);
            return `${parts[0]}+${parts[1]}`;
        }
    } else if (normalized.includes('*')) {
        const parts = normalized.split('*').map(Number);
        if (parts.length === 2 && !parts.some(isNaN)) {
            parts.sort((a, b) => a - b);
            return `${parts[0]}*${parts[1]}`;
        }
    }
    
    return normalized;
}

function generateUniquePairs(levelConfig, count) {
    const pairs = [];
    const generatedExpressions = new Set();
    const generatedTrivialValues = new Set();
    let consecutiveFailures = 0;
    
    // First pass: try to generate unique pairs where at least one text is an expression (not trivial number-number)
    while (pairs.length < count && consecutiveFailures < 800) {
        const pair = levelConfig.generatePair();
        const norm1 = normalizeExpression(pair.texts[0]);
        const norm2 = normalizeExpression(pair.texts[1]);
        
        const isTrivial = (norm1 === null && norm2 === null);
        
        if (isTrivial) {
            consecutiveFailures++;
            continue;
        }
        
        let hasDupExp = false;
        if (norm1 && generatedExpressions.has(norm1)) hasDupExp = true;
        if (norm2 && generatedExpressions.has(norm2)) hasDupExp = true;
        if (norm1 && norm2 && norm1 === norm2) hasDupExp = true;
        
        if (!hasDupExp) {
            if (norm1) generatedExpressions.add(norm1);
            if (norm2) generatedExpressions.add(norm2);
            pairs.push(pair);
            consecutiveFailures = 0;
        } else {
            consecutiveFailures++;
        }
    }
    
    // Second pass: if we haven't reached count, allow trivial pairs if target is unique, or additional unique expression pairs
    if (pairs.length < count) {
        consecutiveFailures = 0;
        while (pairs.length < count && consecutiveFailures < 400) {
            const pair = levelConfig.generatePair();
            const norm1 = normalizeExpression(pair.texts[0]);
            const norm2 = normalizeExpression(pair.texts[1]);
            
            const isTrivial = (norm1 === null && norm2 === null);
            
            if (isTrivial) {
                if (!generatedTrivialValues.has(pair.value)) {
                    generatedTrivialValues.add(pair.value);
                    pairs.push(pair);
                    consecutiveFailures = 0;
                } else {
                    consecutiveFailures++;
                }
            } else {
                let hasDupExp = false;
                if (norm1 && generatedExpressions.has(norm1)) hasDupExp = true;
                if (norm2 && generatedExpressions.has(norm2)) hasDupExp = true;
                if (norm1 && norm2 && norm1 === norm2) hasDupExp = true;
                
                if (!hasDupExp) {
                    if (norm1) generatedExpressions.add(norm1);
                    if (norm2) generatedExpressions.add(norm2);
                    pairs.push(pair);
                    consecutiveFailures = 0;
                } else {
                    consecutiveFailures++;
                }
            }
        }
    }
    
    return pairs;
}

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function showMainMenu() {
    stopConquestTimer();
    switchScreen('mainMenu');
    activeTiles = [];
    gameBoard.innerHTML = '';
    duelCards = [];
    document.getElementById('duel-board').innerHTML = '';
    conquestTiles = [];
    if (conquestBoard) conquestBoard.innerHTML = '';
    
    // Clear race board
    racePlayers = [{ position: 0 }, { position: 0 }];
    const board = document.getElementById('race-board');
    if (board) board.innerHTML = '';
}

function showMessage(text, color = 'var(--accent-color)') {
    messageArea.textContent = text;
    messageArea.style.color = color;
    messageArea.classList.add('show');
    setTimeout(() => {
        messageArea.classList.remove('show');
    }, 2000);
}

function startGame(grade) {
    lastGradePlayed = grade;
    currentLevel = levelSeeds[grade];
    gradeDisplay.textContent = currentLevel.name;
    
    // Generate tiles
    activeTiles = generateTiles(currentLevel);
    pairsLeft = activeTiles.length / 2;
    pairsLeftDisplay.textContent = pairsLeft;
    
    renderBoard();
    updateFreeStatus();
    switchScreen('game');
}

function getMahjongLayout(numPairs) {
    const layout = [];
    if (numPairs >= 26) {
        // Full 52-tile layout
        // Layer 0: 6x6 with corners removed (32 tiles)
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                if ((r === 0 || r === 5) && (c === 0 || c === 5)) continue;
                layout.push({ l: 0, r: r, c: c });
            }
        }
        // Layer 1: 4x4 centered (16 tiles)
        for (let r = 1; r <= 4; r++) {
            for (let c = 1; c <= 4; c++) {
                layout.push({ l: 1, r: r, c: c });
            }
        }
        // Layer 2: 2x2 centered (4 tiles)
        for (let r = 2; r <= 3; r++) {
            for (let c = 2; c <= 3; c++) {
                layout.push({ l: 2, r: r, c: c });
            }
        }
    } else if (numPairs >= 18) {
        // 36-tile layout
        // Layer 0: 6x6 with corners removed (32 tiles)
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                if ((r === 0 || r === 5) && (c === 0 || c === 5)) continue;
                layout.push({ l: 0, r: r, c: c });
            }
        }
        // Layer 1: 2x2 centered (4 tiles)
        for (let r = 2; r <= 3; r++) {
            for (let c = 2; c <= 3; c++) {
                layout.push({ l: 1, r: r, c: c });
            }
        }
    } else if (numPairs >= 12) {
        // 24-tile layout
        // Layer 0: 4x4 square (16 tiles)
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                layout.push({ l: 0, r: r, c: c });
            }
        }
        // Layer 1: 2x2 centered (4 tiles)
        for (let r = 1; r <= 2; r++) {
            for (let c = 1; c <= 2; c++) {
                layout.push({ l: 1, r: r, c: c });
            }
        }
        // Layer 2: 2x2 centered (4 tiles)
        for (let r = 1; r <= 2; r++) {
            for (let c = 1; c <= 2; c++) {
                layout.push({ l: 2, r: r, c: c });
            }
        }
    } else if (numPairs >= 8) {
        // 16-tile layout
        // Layer 0: 4x4 square (16 tiles)
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                layout.push({ l: 0, r: r, c: c });
            }
        }
    } else {
        // 8-tile layout (4 pairs)
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 4; c++) {
                layout.push({ l: 0, r: r, c: c });
            }
        }
    }
    return layout;
}

function generateTiles(levelConfig) {
    // Generate up to 26 unique pairs
    const maxPairs = 26;
    const uniquePairs = generateUniquePairs(levelConfig, maxPairs);
    
    // Choose actual number of pairs based on what was generated
    let numPairs = uniquePairs.length;
    
    // Snap numPairs to a standard layout size: 26, 18, 12, 8, or 4
    if (numPairs >= 26) {
        numPairs = 26;
    } else if (numPairs >= 18) {
        numPairs = 18;
    } else if (numPairs >= 12) {
        numPairs = 12;
    } else if (numPairs >= 8) {
        numPairs = 8;
    } else {
        numPairs = 4;
    }
    
    const layout = getMahjongLayout(numPairs);
    const getSlotAt = (slots, l, r, c) => slots.find(s => s.l === l && s.r === r && s.c === c);
    
    let attempts = 0;
    while (attempts < 100) {
        attempts++;
        let unassignedSlots = layout.map((pos, index) => ({
            ...pos,
            id: `slot_${index}`
        }));
        
        const assignedTiles = [];
        let success = true;
        
        for (let i = 0; i < numPairs; i++) {
            // Find slots that are "free" in the current partially-built board
            const freeSlots = unassignedSlots.filter(t => {
                const topBlocked = getSlotAt(unassignedSlots, t.l + 1, t.r, t.c);
                const leftBlocked = getSlotAt(unassignedSlots, t.l, t.r, t.c - 1);
                const rightBlocked = getSlotAt(unassignedSlots, t.l, t.r, t.c + 1);
                return !topBlocked && (!leftBlocked || !rightBlocked);
            });
            
            if (freeSlots.length < 2) {
                success = false;
                break;
            }
            
            // Pick 2 random free slots
            const idx1 = Math.floor(Math.random() * freeSlots.length);
            let idx2 = Math.floor(Math.random() * freeSlots.length);
            while (idx1 === idx2) {
                idx2 = Math.floor(Math.random() * freeSlots.length);
            }
            
            const slot1 = freeSlots[idx1];
            const slot2 = freeSlots[idx2];
            
            const pair = uniquePairs[i % uniquePairs.length];
            
            // Assign values to the selected slots
            assignedTiles.push({
                ...slot1,
                id: `t_${i}_A`,
                value: pair.value,
                text: pair.texts[0],
                pairId: i,
                isFree: false
            });
            
            assignedTiles.push({
                ...slot2,
                id: `t_${i}_B`,
                value: pair.value,
                text: pair.texts[1],
                pairId: i,
                isFree: false
            });
            
            // Remove these slots from the unassigned pool (simulating that they were "matched" and removed)
            unassignedSlots = unassignedSlots.filter(s => s.id !== slot1.id && s.id !== slot2.id);
        }
        
        if (success) {
            return assignedTiles;
        }
    }
    
    console.error("Failed to generate layout after 100 attempts!");
    return [];
}

function renderBoard() {
    gameBoard.innerHTML = '';
    
    // Calculate board dimensions to center it
    let maxR = 0, maxC = 0;
    activeTiles.forEach(t => {
        if (t.r > maxR) maxR = t.r;
        if (t.c > maxC) maxC = t.c;
    });
    
    const boardWidth = (maxC + 1) * TILE_WIDTH;
    const boardHeight = (maxR + 1) * TILE_HEIGHT;
    
    gameBoard.style.width = `${boardWidth}px`;
    gameBoard.style.height = `${boardHeight}px`;
    
    // Render each tile
    activeTiles.forEach(t => {
        const el = document.createElement('div');
        el.className = 'tile locked'; // default locked, updated later
        el.id = t.id;
        el.textContent = t.text;
        
        // Position based on l, r, c
        // Top-left origin. Add offsets for 3D effect based on layer 'l'
        const left = (t.c * TILE_WIDTH) + (t.l * TILE_OFFSET_X);
        const top = (t.r * TILE_HEIGHT) + (t.l * TILE_OFFSET_Y);
        
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.zIndex = t.l * 10; // Layers stack on top
        
        el.addEventListener('click', () => onTileClick(t));
        
        t.element = el;
        gameBoard.appendChild(el);
    });
}

function getTileAt(l, r, c) {
    return activeTiles.find(t => t.l === l && t.r === r && t.c === c);
}

function updateFreeStatus() {
    activeTiles.forEach(t => {
        // A tile is free if:
        // 1. No tile directly on top (l+1, r, c)
        // 2. Either no tile on left (l, r, c-1) OR no tile on right (l, r, c+1)
        
        const topBlocked = getTileAt(t.l + 1, t.r, t.c);
        const leftBlocked = getTileAt(t.l, t.r, t.c - 1);
        const rightBlocked = getTileAt(t.l, t.r, t.c + 1);
        
        t.isFree = !topBlocked && (!leftBlocked || !rightBlocked);
        
        // Update visual state
        if (t.isFree) {
            t.element.classList.remove('locked');
            t.element.classList.add('free');
        } else {
            t.element.classList.add('locked');
            t.element.classList.remove('free');
            t.element.classList.remove('selected'); // Just in case it was selected and got covered (shouldn't happen in normal play)
        }
    });
}

function onTileClick(tile) {
    if (!tile.isFree) return;
    
    // Play a tiny click sound (optional, ignoring for now as it requires assets)
    
    if (selectedTile) {
        if (selectedTile.id === tile.id) {
            // Deselect
            selectedTile.element.classList.remove('selected');
            selectedTile = null;
            return;
        }
        
        // Check for match
        if (selectedTile.value === tile.value) {
            // Match found!
            handleMatch(selectedTile, tile);
        } else {
            // No match
            handleWrongMatch(selectedTile, tile);
        }
    } else {
        // Select this tile
        selectedTile = tile;
        tile.element.classList.add('selected');
    }
}

function handleMatch(tile1, tile2) {
    tile1.element.classList.add('matched');
    tile2.element.classList.add('matched');
    
    showMessage('Helyes!', '#4ecdc4');
    
    // Remove from activeTiles
    activeTiles = activeTiles.filter(t => t.id !== tile1.id && t.id !== tile2.id);
    selectedTile = null;
    
    pairsLeft--;
    pairsLeftDisplay.textContent = pairsLeft;
    
    // Wait for animation to finish before removing elements entirely or updating free status
    setTimeout(() => {
        if (tile1.element.parentNode) tile1.element.parentNode.removeChild(tile1.element);
        if (tile2.element.parentNode) tile2.element.parentNode.removeChild(tile2.element);
        
        updateFreeStatus();
        
        if (pairsLeft === 0) {
            setTimeout(() => switchScreen('win'), 500);
        }
    }, 500);
}

function handleWrongMatch(tile1, tile2) {
    tile2.element.classList.add('wrong-match');
    tile1.element.classList.remove('selected');
    
    showMessage('Próbáld újra!', '#ff6b6b');
    
    setTimeout(() => {
        tile2.element.classList.remove('wrong-match');
    }, 400);
    
    selectedTile = null;
}

// ==========================================
// 2-Player Math Memory Game (Duel) Logic
// ==========================================

function startDuel(grade) {
    lastGradePlayed = grade;
    currentLevel = levelSeeds[grade];
    document.getElementById('duel-grade-display').textContent = currentLevel.name;
    
    // Reset duel state
    playerScores = [0, 0];
    currentPlayer = 0;
    selectedCards = [];
    isProcessingTurn = false;
    
    player1ScoreDisplay.textContent = '0';
    player2ScoreDisplay.textContent = '0';
    player1Card.classList.add('active');
    player2Card.classList.remove('active');
    updateDuelTurnDisplay();
    
    // Determine desired board size based on difficulty/limit to avoid duplicates
    let desiredPairs = 18; // default 6x6 (36 cards)
    const limit = (grade === 2) ? window.grade2Settings.limit : 100;
    if (grade === 1 || (grade === 2 && limit <= 20)) {
        desiredPairs = 8; // 4x4 (16 cards)
    }
    
    // Generate unique pairs
    const uniquePairs = generateUniquePairs(currentLevel, desiredPairs);
    let numPairs = uniquePairs.length;
    
    // Snap and set layout grid template columns
    const duelBoard = document.getElementById('duel-board');
    if (numPairs >= 18) {
        numPairs = 18;
        duelBoard.style.gridTemplateColumns = 'repeat(6, 1fr)';
    } else if (numPairs >= 12) {
        numPairs = 12;
        duelBoard.style.gridTemplateColumns = 'repeat(6, 1fr)';
    } else if (numPairs >= 8) {
        numPairs = 8;
        duelBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
    } else {
        numPairs = 4;
        duelBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
    
    // Generate pairs array
    const pairs = [];
    for (let i = 0; i < numPairs; i++) {
        const pair = uniquePairs[i % uniquePairs.length];
        pairs.push({
            id: `c_${i}_A`,
            pairId: i,
            value: pair.value,
            text: pair.texts[0],
            isCaptured: false
        });
        pairs.push({
            id: `c_${i}_B`,
            pairId: i,
            value: pair.value,
            text: pair.texts[1],
            isCaptured: false
        });
    }
    
    // Shuffle the cards using Fisher-Yates
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    
    duelCards = pairs;
    pairsLeft = numPairs;
    duelPairsLeftDisplay.textContent = `Párok: ${pairsLeft}`;
    
    renderDuelBoard();
    switchScreen('duel');
}

function renderDuelBoard() {
    const duelBoard = document.getElementById('duel-board');
    duelBoard.innerHTML = '';
    
    duelCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.id = card.id;
        
        const innerEl = document.createElement('div');
        innerEl.className = 'card-inner';
        
        const frontEl = document.createElement('div');
        frontEl.className = 'card-front';
        frontEl.textContent = card.text;
        
        const backEl = document.createElement('div');
        backEl.className = 'card-back';
        backEl.textContent = '?';
        
        innerEl.appendChild(frontEl);
        innerEl.appendChild(backEl);
        cardEl.appendChild(innerEl);
        
        cardEl.addEventListener('click', () => onCardClick(card, cardEl));
        
        card.element = cardEl;
        duelBoard.appendChild(cardEl);
    });
}

function onCardClick(card, cardEl) {
    if (isProcessingTurn) return;
    if (card.isCaptured) return;
    if (selectedCards.includes(card)) return; // already flipped
    
    // Flip card
    cardEl.classList.add('flipped');
    selectedCards.push(card);
    
    if (selectedCards.length === 2) {
        isProcessingTurn = true;
        checkDuelMatch();
    }
}

function checkDuelMatch() {
    const [card1, card2] = selectedCards;
    
    if (card1.value === card2.value) {
        // Success match!
        setTimeout(() => {
            card1.isCaptured = true;
            card2.isCaptured = true;
            
            card1.element.classList.add('captured', currentPlayer === 0 ? 'p1-captured' : 'p2-captured');
            card2.element.classList.add('captured', currentPlayer === 0 ? 'p1-captured' : 'p2-captured');
            
            playerScores[currentPlayer]++;
            player1ScoreDisplay.textContent = playerScores[0];
            player2ScoreDisplay.textContent = playerScores[1];
            
            showDuelMessage('Helyes!', currentPlayer === 0 ? 'var(--player1-color)' : 'var(--player2-color)');
            
            pairsLeft--;
            duelPairsLeftDisplay.textContent = `Párok: ${pairsLeft}`;
            
            selectedCards = [];
            isProcessingTurn = false;
            
            if (pairsLeft === 0) {
                setTimeout(showDuelWin, 800);
            }
        }, 500); // Wait for the 3D flip animation to finish
    } else {
        // Incorrect match
        setTimeout(() => {
            card1.element.classList.add('wrong-match');
            card2.element.classList.add('wrong-match');
            showDuelMessage('Próbáld újra!', '#ff6b6b');
            
            const delay = (window.grade2Settings.memoryTime || 2.0) * 1000;
            setTimeout(() => {
                card1.element.classList.remove('flipped', 'wrong-match');
                card2.element.classList.remove('flipped', 'wrong-match');
                
                // Pass turn
                currentPlayer = currentPlayer === 0 ? 1 : 0;
                updateDuelTurnDisplay();
                
                selectedCards = [];
                isProcessingTurn = false;
            }, delay); // Show wrong match outline, then flip back
        }, 600); // Wait for flip animation
    }
}

function updateDuelTurnDisplay() {
    if (currentPlayer === 0) {
        duelTurnDisplay.textContent = 'Kék Játékos jön';
        duelTurnDisplay.className = 'turn-indicator turn-p1';
        player1Card.classList.add('active');
        player2Card.classList.remove('active');
    } else {
        duelTurnDisplay.textContent = 'Piros Játékos jön';
        duelTurnDisplay.className = 'turn-indicator turn-p2';
        player1Card.classList.remove('active');
        player2Card.classList.add('active');
    }
}

function showDuelMessage(text, color = 'var(--accent-color)') {
    const msgArea = document.getElementById('duel-message-area');
    msgArea.textContent = text;
    msgArea.style.color = color;
    msgArea.classList.add('show');
    setTimeout(() => {
        msgArea.classList.remove('show');
    }, 1500);
}

function showDuelWin() {
    const p1Score = playerScores[0];
    const p2Score = playerScores[1];
    
    duelP1FinalScore.textContent = p1Score;
    duelP2FinalScore.textContent = p2Score;
    
    if (p1Score > p2Score) {
        duelWinnerTitle.textContent = 'Kék Játékos Győzött!';
        duelWinnerText.textContent = `Gratulálok! Kék Játékos nyert ${p1Score} - ${p2Score} arányban!`;
    } else if (p2Score > p1Score) {
        duelWinnerTitle.textContent = 'Piros Játékos Győzött!';
        duelWinnerText.textContent = `Gratulálok! Piros Játékos nyert ${p2Score} - ${p1Score} arányban!`;
    } else {
        duelWinnerTitle.textContent = 'Döntetlen!';
        duelWinnerText.textContent = `Szép játék! Az állás döntetlen lett: ${p1Score} - ${p2Score}.`;
    }
    
    switchScreen('duelWin');
}

// ==========================================
// Connect-4 Math Conquest Game Logic
// ==========================================

function startConquest(grade) {
    lastGradePlayed = grade;
    currentLevel = levelSeeds[grade];
    
    const gradeDisplayEl = document.getElementById('conquest-grade-display');
    if (gradeDisplayEl) {
        gradeDisplayEl.textContent = currentLevel.name;
    }
    
    // Reset state
    playerScores = [0, 0];
    currentPlayer = 0;
    selectedConquestTiles = [];
    isProcessingTurn = false;
    pairsLeft = 18; // 6x6 board = 36 cells = 18 pairs
    conquestLives = [3, 3];
    
    // Reset UI
    if (conquestPlayer1ScoreDisplay) conquestPlayer1ScoreDisplay.textContent = '0';
    if (conquestPlayer2ScoreDisplay) conquestPlayer2ScoreDisplay.textContent = '0';
    if (conquestPlayer1Card) conquestPlayer1Card.classList.add('active');
    if (conquestPlayer2Card) conquestPlayer2Card.classList.remove('active');
    updateConquestTurnDisplay();
    if (conquestPairsLeftDisplay) {
        conquestPairsLeftDisplay.textContent = `Hátralévő helyek: ${pairsLeft * 2}`;
    }
    
    // Setup lives and timer UI
    const timerEnabled = window.grade2Settings.conquestTimerEnabled;
    const timerLimit = window.grade2Settings.conquestTimerLimit || 30;
    
    const timerContainer = document.getElementById('conquest-timer-container');
    const p1Lives = document.getElementById('conquest-player1-lives');
    const p2Lives = document.getElementById('conquest-player2-lives');
    
    if (timerEnabled) {
        if (timerContainer) timerContainer.style.display = 'flex';
        if (p1Lives) p1Lives.style.display = 'flex';
        if (p2Lives) p2Lives.style.display = 'flex';
        resetConquestHearts(0);
        resetConquestHearts(1);
    } else {
        if (timerContainer) timerContainer.style.display = 'none';
        if (p1Lives) p1Lives.style.display = 'none';
        if (p2Lives) p2Lives.style.display = 'none';
    }
    
    // Generate unique pairs
    const uniquePairs = generateUniquePairs(currentLevel, 18);
    const numPairs = uniquePairs.length;
    
    // Build 18 pairs (36 tiles total)
    const pairs = [];
    for (let i = 0; i < 18; i++) {
        const pair = uniquePairs[i % numPairs];
        pairs.push({
            pairId: i,
            value: pair.value,
            text: pair.texts[0]
        });
        pairs.push({
            pairId: i,
            value: pair.value,
            text: pair.texts[1]
        });
    }
    
    // Shuffle using Fisher-Yates
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    
    // Set 6x6 grid coordinates
    conquestTiles = [];
    for (let i = 0; i < pairs.length; i++) {
        const r = Math.floor(i / 6);
        const c = i % 6;
        conquestTiles.push({
            id: `conq_${r}_${c}`,
            row: r,
            col: c,
            value: pairs[i].value,
            text: pairs[i].text,
            claimedBy: null, // null, 0 (P1), 1 (P2)
            element: null
        });
    }
    
    renderConquestBoard();
    switchScreen('conquest');
    
    // Start timer if enabled (after screen is shown)
    if (timerEnabled) {
        startConquestTimer(timerLimit);
    }
}

function renderConquestBoard() {
    if (!conquestBoard) return;
    conquestBoard.innerHTML = '';
    
    conquestTiles.forEach(tile => {
        const tileEl = document.createElement('div');
        tileEl.className = 'conquest-tile';
        tileEl.id = tile.id;
        tileEl.textContent = tile.text;
        
        if (tile.claimedBy === 0) {
            tileEl.classList.add('claimed-p1');
        } else if (tile.claimedBy === 1) {
            tileEl.classList.add('claimed-p2');
        }
        
        tileEl.addEventListener('click', () => onConquestTileClick(tile, tileEl));
        
        tile.element = tileEl;
        conquestBoard.appendChild(tileEl);
    });
}

function onConquestTileClick(tile, tileEl) {
    if (isProcessingTurn) return;
    if (tile.claimedBy !== null) return;
    
    // Toggle selection
    if (selectedConquestTiles.includes(tile)) {
        tileEl.classList.remove('selected-p1', 'selected-p2');
        selectedConquestTiles = selectedConquestTiles.filter(t => t !== tile);
        return;
    }
    
    // Add to selection
    if (currentPlayer === 0) {
        tileEl.classList.add('selected-p1');
    } else {
        tileEl.classList.add('selected-p2');
    }
    selectedConquestTiles.push(tile);
    
    if (selectedConquestTiles.length === 2) {
        isProcessingTurn = true;
        checkConquestMatch();
    }
}

function checkConquestMatch() {
    const [tile1, tile2] = selectedConquestTiles;
    
    if (tile1.value === tile2.value) {
        // Match found!
        tile1.claimedBy = currentPlayer;
        tile2.claimedBy = currentPlayer;
        
        tile1.element.classList.remove('selected-p1', 'selected-p2');
        tile2.element.classList.remove('selected-p1', 'selected-p2');
        
        tile1.element.classList.add(currentPlayer === 0 ? 'claimed-p1' : 'claimed-p2');
        tile2.element.classList.add(currentPlayer === 0 ? 'claimed-p1' : 'claimed-p2');
        
        playerScores[currentPlayer] += 2;
        if (conquestPlayer1ScoreDisplay) conquestPlayer1ScoreDisplay.textContent = playerScores[0];
        if (conquestPlayer2ScoreDisplay) conquestPlayer2ScoreDisplay.textContent = playerScores[1];
        
        showConquestMessage('Helyes!', currentPlayer === 0 ? 'var(--player1-color)' : 'var(--player2-color)');
        
        pairsLeft--;
        if (conquestPairsLeftDisplay) {
            conquestPairsLeftDisplay.textContent = `Hátralévő helyek: ${pairsLeft * 2}`;
        }
        
        // Check Connect-4 Win
        const winLine = checkConquestWin(currentPlayer);
        
        if (winLine) {
            winLine.forEach(pos => {
                const winningTile = conquestTiles.find(t => t.row === pos.r && t.col === pos.c);
                if (winningTile && winningTile.element) {
                    winningTile.element.classList.add('winning-line');
                }
            });
            
            setTimeout(() => {
                stopConquestTimer();
                showConquestWin(currentPlayer);
                selectedConquestTiles = [];
                isProcessingTurn = false;
            }, 1500);
        } else if (pairsLeft === 0) {
            // Full board, tie-breaker based on claimed cell score
            setTimeout(() => {
                stopConquestTimer();
                showConquestWin(null);
                selectedConquestTiles = [];
                isProcessingTurn = false;
            }, 1000);
        } else {
            // Pass turn
            currentPlayer = currentPlayer === 0 ? 1 : 0;
            updateConquestTurnDisplay();
            resetConquestTimer();
            
            selectedConquestTiles = [];
            isProcessingTurn = false;
        }
    } else {
        // Mismatch
        tile1.element.classList.add('wrong-match');
        tile2.element.classList.add('wrong-match');
        showConquestMessage('Hibás párosítás!', '#ff6b6b');
        
        setTimeout(() => {
            tile1.element.classList.remove('selected-p1', 'selected-p2', 'wrong-match');
            tile2.element.classList.remove('selected-p1', 'selected-p2', 'wrong-match');
            
            // Pass turn anyway for Connect-4 blocking rules
            currentPlayer = currentPlayer === 0 ? 1 : 0;
            updateConquestTurnDisplay();
            resetConquestTimer();
            
            selectedConquestTiles = [];
            isProcessingTurn = false;
        }, 1000);
    }
}

function updateConquestTurnDisplay() {
    if (!conquestTurnDisplay) return;
    if (currentPlayer === 0) {
        conquestTurnDisplay.textContent = 'Kék Játékos jön';
        conquestTurnDisplay.className = 'turn-indicator turn-p1';
        if (conquestPlayer1Card) conquestPlayer1Card.classList.add('active');
        if (conquestPlayer2Card) conquestPlayer2Card.classList.remove('active');
    } else {
        conquestTurnDisplay.textContent = 'Piros Játékos jön';
        conquestTurnDisplay.className = 'turn-indicator turn-p2';
        if (conquestPlayer1Card) conquestPlayer1Card.classList.remove('active');
        if (conquestPlayer2Card) conquestPlayer2Card.classList.add('active');
    }
}

function showConquestMessage(text, color = 'var(--accent-color)') {
    const msgArea = document.getElementById('conquest-message-area');
    if (!msgArea) return;
    msgArea.textContent = text;
    msgArea.style.color = color;
    msgArea.classList.add('show');
    setTimeout(() => {
        msgArea.classList.remove('show');
    }, 1500);
}

function checkConquestWin(playerIndex) {
    const R = 6;
    const C = 6;
    
    // Create 2D grid matrix representation of board claims
    const grid = Array(R).fill(null).map(() => Array(C).fill(null));
    conquestTiles.forEach(tile => {
        grid[tile.row][tile.col] = tile.claimedBy;
    });
    
    // Check horizontal lines
    for (let r = 0; r < R; r++) {
        for (let c = 0; c <= C - 4; c++) {
            if (grid[r][c] === playerIndex &&
                grid[r][c+1] === playerIndex &&
                grid[r][c+2] === playerIndex &&
                grid[r][c+3] === playerIndex) {
                return [
                    { r: r, c: c },
                    { r: r, c: c+1 },
                    { r: r, c: c+2 },
                    { r: r, c: c+3 }
                ];
            }
        }
    }
    
    // Check vertical lines
    for (let r = 0; r <= R - 4; r++) {
        for (let c = 0; c < C; c++) {
            if (grid[r][c] === playerIndex &&
                grid[r+1][c] === playerIndex &&
                grid[r+2][c] === playerIndex &&
                grid[r+3][c] === playerIndex) {
                return [
                    { r: r, c: c },
                    { r: r+1, c: c },
                    { r: r+2, c: c },
                    { r: r+3, c: c }
                ];
            }
        }
    }
    
    // Check diagonal down-right (\)
    for (let r = 0; r <= R - 4; r++) {
        for (let c = 0; c <= C - 4; c++) {
            if (grid[r][c] === playerIndex &&
                grid[r+1][c+1] === playerIndex &&
                grid[r+2][c+2] === playerIndex &&
                grid[r+3][c+3] === playerIndex) {
                return [
                    { r: r, c: c },
                    { r: r+1, c: c+1 },
                    { r: r+2, c: c+2 },
                    { r: r+3, c: c+3 }
                ];
            }
        }
    }
    
    // Check diagonal up-right (/)
    for (let r = 3; r < R; r++) {
        for (let c = 0; c <= C - 4; c++) {
            if (grid[r][c] === playerIndex &&
                grid[r-1][c+1] === playerIndex &&
                grid[r-2][c+2] === playerIndex &&
                grid[r-3][c+3] === playerIndex) {
                return [
                    { r: r, c: c },
                    { r: r-1, c: c+1 },
                    { r: r-2, c: c+2 },
                    { r: r-3, c: c+3 }
                ];
            }
        }
    }
    
    return null;
}

function showConquestWin(winnerIndex) {
    stopConquestTimer();
    const p1Score = playerScores[0];
    const p2Score = playerScores[1];
    
    if (conquestP1FinalScore) conquestP1FinalScore.textContent = p1Score;
    if (conquestP2FinalScore) conquestP2FinalScore.textContent = p2Score;
    
    let winner = winnerIndex;
    if (winner === null) {
        // Tie breaker based on scores
        if (p1Score > p2Score) winner = 0;
        else if (p2Score > p1Score) winner = 1;
        else winner = -1; // Tie
    }
    
    if (winner === 0) {
        if (conquestWinnerTitle) conquestWinnerTitle.textContent = 'Kék Játékos Győzött!';
        if (conquestWinnerText) conquestWinnerText.textContent = `Gratulálok! Kék Játékos nyert ${p1Score} - ${p2Score} arányban!`;
    } else if (winner === 1) {
        if (conquestWinnerTitle) conquestWinnerTitle.textContent = 'Piros Játékos Győzött!';
        if (conquestWinnerText) conquestWinnerText.textContent = `Gratulálok! Piros Játékos nyert ${p2Score} - ${p1Score} arányban!`;
    } else {
        if (conquestWinnerTitle) conquestWinnerTitle.textContent = 'Döntetlen!';
        if (conquestWinnerText) conquestWinnerText.textContent = `Szép játék! Az állás döntetlen lett: ${p1Score} - ${p2Score}.`;
    }
    
    switchScreen('conquestWin');
}

// ==========================================
// Conquest Timer & Lives Logic
// ==========================================

function startConquestTimer(limitSeconds) {
    stopConquestTimer();
    conquestTimeRemaining = limitSeconds;
    conquestTimerActive = true;
    updateConquestTimerUI(limitSeconds, limitSeconds);
    
    conquestTimerInterval = setInterval(() => {
        if (isProcessingTurn) return; // Pause during animations
        conquestTimeRemaining--;
        const limit = window.grade2Settings.conquestTimerLimit || 30;
        updateConquestTimerUI(conquestTimeRemaining, limit);
        if (conquestTimeRemaining <= 0) {
            loseConquestLife();
        }
    }, 1000);
}

function stopConquestTimer() {
    if (conquestTimerInterval) {
        clearInterval(conquestTimerInterval);
        conquestTimerInterval = null;
    }
    conquestTimerActive = false;
}

function resetConquestTimer() {
    if (!window.grade2Settings.conquestTimerEnabled) return;
    const limit = window.grade2Settings.conquestTimerLimit || 30;
    startConquestTimer(limit);
}

function updateConquestTimerUI(remaining, total) {
    const timerBar = document.getElementById('conquest-timer-bar');
    const timerText = document.getElementById('conquest-timer-text');
    const fraction = Math.max(0, remaining / total);
    
    if (timerBar) {
        timerBar.style.width = `${fraction * 100}%`;
        if (fraction <= 0.33) {
            timerBar.classList.add('warning');
        } else {
            timerBar.classList.remove('warning');
        }
    }
    if (timerText) {
        timerText.textContent = `${Math.max(0, remaining)} mp`;
    }
}

function resetConquestHearts(playerIndex) {
    const livesEl = document.getElementById(`conquest-player${playerIndex + 1}-lives`);
    if (!livesEl) return;
    const hearts = livesEl.querySelectorAll('.heart');
    hearts.forEach(h => {
        h.classList.remove('lost', 'lost-anim');
    });
}

function loseConquestLife() {
    // Stop ticking while we animate
    stopConquestTimer();
    isProcessingTurn = true;
    
    conquestLives[currentPlayer]--;
    const livesEl = document.getElementById(`conquest-player${currentPlayer + 1}-lives`);
    if (livesEl) {
        const hearts = livesEl.querySelectorAll('.heart');
        const lostCount = 3 - conquestLives[currentPlayer];
        const heartToAnimate = hearts[3 - lostCount]; // the one just lost
        if (heartToAnimate) {
            heartToAnimate.classList.add('lost-anim');
            setTimeout(() => {
                heartToAnimate.classList.remove('lost-anim');
                heartToAnimate.classList.add('lost');
            }, 500);
        }
    }
    
    const playerName = currentPlayer === 0 ? 'Kék Játékos' : 'Piros Játékos';
    
    if (conquestLives[currentPlayer] <= 0) {
        // This player is out of lives — the other player wins
        showConquestMessage(`${playerName} elvesztette az összes életét!`, '#ff6b6b');
        const winner = currentPlayer === 0 ? 1 : 0;
        setTimeout(() => {
            isProcessingTurn = false;
            showConquestWin(winner);
        }, 1800);
    } else {
        // Still has lives: show message, timer resets for same player
        const livesLeft = conquestLives[currentPlayer];
        showConquestMessage(`⏰ Lejárt az idő! ${playerName}nak ${livesLeft} élete maradt.`, '#ff9f1c');
        
        // Deselect any chosen tiles
        selectedConquestTiles.forEach(t => {
            if (t.element) t.element.classList.remove('selected-p1', 'selected-p2');
        });
        selectedConquestTiles = [];
        
        setTimeout(() => {
            isProcessingTurn = false;
            const limit = window.grade2Settings.conquestTimerLimit || 30;
            startConquestTimer(limit);
        }, 1800);
    }
}

function conquestPassTurn() {
    // Deselect any chosen tiles
    selectedConquestTiles.forEach(t => {
        if (t.element) t.element.classList.remove('selected-p1', 'selected-p2');
    });
    selectedConquestTiles = [];
    
    // Switch player
    currentPlayer = currentPlayer === 0 ? 1 : 0;
    updateConquestTurnDisplay();
    
    showConquestMessage('Passz! Következő játékos.', 'var(--accent-color)');
    
    // Reset timer for the new player
    resetConquestTimer();
}

/* ==========================================
   Matematikai Kaland (Math Race) Game Logic
   ========================================== */

const BOARD_SPECIALS = {
    4: { type: 'rocket', delta: 4, icon: '🚀' },
    14: { type: 'rocket', delta: 5, icon: '🚀' },
    25: { type: 'rocket', delta: 5, icon: '🚀' },
    9: { type: 'swamp', delta: -4, icon: '🐊' },
    20: { type: 'swamp', delta: -4, icon: '🐊' },
    31: { type: 'swamp', delta: -4, icon: '🐊' }
};

function getRaceSteps(answer) {
    if (answer === 0) return 1;
    if (answer % 10 === 0) return 10;
    return answer % 10;
}

function createPlayerFigureSVG(playerIndex) {
    const color1 = playerIndex === 0 ? '#00f2fe' : '#ff0844'; // teal/cyan vs red/coral
    const color2 = playerIndex === 0 ? '#4facfe' : '#ffb199';
    const gradId = `grad-${playerIndex}-${Math.floor(Math.random() * 100000)}`;
    return `
    <svg viewBox="0 0 24 32" class="pawn-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${color1}" />
                <stop offset="100%" stop-color="${color2}" />
            </linearGradient>
        </defs>
        <!-- Drop Shadow ellipse under base -->
        <ellipse cx="12" cy="28.5" rx="7.5" ry="2" fill="#000000" opacity="0.25" />
        <!-- Base of the pawn -->
        <ellipse cx="12" cy="28" rx="7.5" ry="2" fill="url(#${gradId})" />
        <!-- Pawn Body -->
        <path d="M 6 28 C 6 28 9 19 10 14.5 L 14 14.5 C 15 19 18 28 18 28 Z" fill="url(#${gradId})" />
        <!-- Head of the pawn -->
        <circle cx="12" cy="8.5" r="5" fill="url(#${gradId})" />
        <!-- Head Highlight -->
        <circle cx="10" cy="6.5" r="1.3" fill="#ffffff" opacity="0.65" />
        <!-- Body highlight curve -->
        <path d="M 8.5 24 C 8 20 9.5 17 10.5 15.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.4" />
        <!-- Collar/Neck ring -->
        <ellipse cx="12" cy="13.5" rx="4" ry="1.2" fill="#ffffff" opacity="0.35" />
    </svg>
    `;
}

function startRace(grade) {
    lastGradePlayed = grade;
    currentLevel = levelSeeds[grade];
    
    const gradeDisplayEl = document.getElementById('race-grade-display');
    if (gradeDisplayEl) {
        gradeDisplayEl.textContent = currentLevel.name;
    }
    
    // Reset State
    racePlayers = [{ position: 0 }, { position: 0 }];
    currentPlayer = 0;
    isProcessingTurn = false;
    currentRaceQuestion = null;
    raceDiceRolled = false;
    rolledDiceValue = 0;
    
    // Set up scorecards with SVG pawns
    const p1Avatar = document.querySelector('#race-player1-card .player-avatar');
    const p2Avatar = document.querySelector('#race-player2-card .player-avatar');
    if (p1Avatar) p1Avatar.innerHTML = createPlayerFigureSVG(0);
    if (p2Avatar) p2Avatar.innerHTML = createPlayerFigureSVG(1);
    
    // Reset UI
    const inputEl = document.getElementById('race-answer-input');
    if (inputEl) {
        inputEl.value = '';
        inputEl.disabled = false;
    }
    showRaceMessage('');
    updateRaceTurnDisplay();
    updateRaceScorecards();
    
    // Render Board and Setup Question
    renderRaceBoard();
    
    // Show dice phase, hide question
    showRaceDicePhase();
    
    switchScreen('race');
}

function renderRaceBoard() {
    const board = document.getElementById('race-board');
    if (!board) return;
    board.innerHTML = '';
    
    const isWide = (raceOrientation === 'wide');
    const cols = isWide ? 8 : 6;
    const rows = isWide ? 6 : 8;
    
    board.classList.remove('orientation-wide', 'orientation-tall');
    board.classList.add(isWide ? 'orientation-wide' : 'orientation-tall');
    
    for (let i = 0; i < 48; i++) {
        const tileEl = document.createElement('div');
        tileEl.className = 'race-tile';
        
        // Calculate winding row and column mapping dynamically
        const r = Math.floor(i / cols);
        const c = (r % 2 === 0) ? (i % cols) : ((cols - 1) - (i % cols));
        tileEl.style.gridRow = r + 1;
        tileEl.style.gridColumn = c + 1;
        
        // Tile number label (1-48)
        const numLabel = document.createElement('span');
        numLabel.className = 'tile-number';
        numLabel.textContent = i + 1;
        tileEl.appendChild(numLabel);
        
        // Custom decoration and icon
        if (i === 0) {
            tileEl.classList.add('tile-start');
            const icon = document.createElement('span');
            icon.className = 'tile-icon';
            icon.textContent = '🏁';
            tileEl.appendChild(icon);
        } else if (i === 47) {
            tileEl.classList.add('tile-finish');
            const icon = document.createElement('span');
            icon.className = 'tile-icon';
            icon.textContent = '🏆';
            tileEl.appendChild(icon);
        } else {
            const special = BOARD_SPECIALS[i];
            if (special) {
                tileEl.classList.add(`tile-${special.type}`);
                const icon = document.createElement('span');
                icon.className = 'tile-icon';
                icon.textContent = special.icon;
                tileEl.appendChild(icon);
            }
        }
        
        // Tokens container
        const tokenContainer = document.createElement('div');
        tokenContainer.className = 'token-container';
        
        if (racePlayers[0].position === i) {
            const p1Token = document.createElement('div');
            p1Token.className = 'player-token p1-token';
            p1Token.innerHTML = createPlayerFigureSVG(0);
            tokenContainer.appendChild(p1Token);
        }
        if (racePlayers[1].position === i) {
            const p2Token = document.createElement('div');
            p2Token.className = 'player-token p2-token';
            p2Token.innerHTML = createPlayerFigureSVG(1);
            tokenContainer.appendChild(p2Token);
        }
        
        tileEl.appendChild(tokenContainer);
        board.appendChild(tileEl);
    }
    
    // Draw the rocket and swamp connection lines
    drawRaceConnections();
}

function drawRaceConnections() {
    const board = document.getElementById('race-board');
    if (!board) return;
    
    // Remove old overlay if exists
    const oldOverlay = document.getElementById('race-svg-overlay');
    if (oldOverlay) {
        oldOverlay.remove();
    }
    
    // Create new SVG overlay
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("id", "race-svg-overlay");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "1";
    
    // Define markers for arrowheads
    const defs = document.createElementNS(svgNS, "defs");
    defs.innerHTML = `
        <marker id="arrow-rocket" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ffe66d" opacity="0.9" />
        </marker>
        <marker id="arrow-swamp" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ff6b6b" opacity="0.85" />
        </marker>
    `;
    svg.appendChild(defs);
    
    function getTileCoords(i) {
        const isWide = (raceOrientation === 'wide');
        const cols = isWide ? 8 : 6;
        const rows = isWide ? 6 : 8;
        const r = Math.floor(i / cols);
        const c = (r % 2 === 0) ? (i % cols) : ((cols - 1) - (i % cols));
        return {
            x: ((c + 0.5) / cols) * 100,
            y: ((r + 0.5) / rows) * 100
        };
    }
    
    for (const [key, special] of Object.entries(BOARD_SPECIALS)) {
        const startIdx = parseInt(key);
        const endIdx = startIdx + special.delta;
        
        const start = getTileCoords(startIdx);
        const end = getTileCoords(endIdx);
        
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const mx = (start.x + end.x) / 2;
        const my = (start.y + end.y) / 2;
        const len = Math.sqrt(dx * dx + dy * dy);
        
        const px = -dy / (len || 1);
        const py = dx / (len || 1);
        
        // Offset curve slightly to bend in a nice arc
        const curveOffset = special.type === 'rocket' ? 8 : -8;
        const cx = mx + px * curveOffset;
        const cy = my + py * curveOffset;
        
        const pathData = `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
        
        if (special.type === 'rocket') {
            // Glow path
            const glowPath = document.createElementNS(svgNS, "path");
            glowPath.setAttribute("d", pathData);
            glowPath.setAttribute("fill", "none");
            glowPath.setAttribute("stroke", "#ffe66d");
            glowPath.setAttribute("stroke-width", "3");
            glowPath.setAttribute("opacity", "0.35");
            svg.appendChild(glowPath);
            
            // Core dashed path
            const corePath = document.createElementNS(svgNS, "path");
            corePath.setAttribute("d", pathData);
            corePath.setAttribute("fill", "none");
            corePath.setAttribute("stroke", "#ffe66d");
            corePath.setAttribute("stroke-width", "1.2");
            corePath.setAttribute("stroke-dasharray", "4,3");
            corePath.setAttribute("opacity", "0.9");
            corePath.setAttribute("marker-end", "url(#arrow-rocket)");
            svg.appendChild(corePath);
        } else {
            // Swamp paths (solid red/coral)
            // Glow path
            const glowPath = document.createElementNS(svgNS, "path");
            glowPath.setAttribute("d", pathData);
            glowPath.setAttribute("fill", "none");
            glowPath.setAttribute("stroke", "#ff6b6b");
            glowPath.setAttribute("stroke-width", "3");
            glowPath.setAttribute("opacity", "0.3");
            svg.appendChild(glowPath);
            
            // Core solid path
            const corePath = document.createElementNS(svgNS, "path");
            corePath.setAttribute("d", pathData);
            corePath.setAttribute("fill", "none");
            corePath.setAttribute("stroke", "#ff6b6b");
            corePath.setAttribute("stroke-width", "1.2");
            corePath.setAttribute("opacity", "0.85");
            corePath.setAttribute("marker-end", "url(#arrow-swamp)");
            svg.appendChild(corePath);
        }
    }
    
    board.appendChild(svg);
}

function drawRaceQuestion() {
    let pair = null;
    let expr = '';
    let answer = 0;
    
    // Look for math expression containing an operator
    for (let attempts = 0; attempts < 100; attempts++) {
        pair = currentLevel.generatePair();
        const text0HasOp = /[+\-×÷]/.test(pair.texts[0]);
        const text1HasOp = /[+\-×÷]/.test(pair.texts[1]);
        
        if (text0HasOp) {
            expr = pair.texts[0];
            answer = pair.value;
            break;
        } else if (text1HasOp) {
            expr = pair.texts[1];
            answer = pair.value;
            break;
        }
    }
    
    if (!expr) {
        expr = "5 + 5";
        answer = 10;
    }
    
    currentRaceQuestion = {
        expression: expr,
        answer: answer,
        steps: getRaceSteps(answer)
    };
    
    // Display updates
    const questionTextEl = document.getElementById('race-question-text');
    if (questionTextEl) {
        questionTextEl.textContent = `${expr} = `;
    }
    
    const questionHeaderEl = document.getElementById('race-question-header');
    if (questionHeaderEl) {
        const playerName = currentPlayer === 0 ? 'Kék Játékos' : 'Piros Játékos';
        questionHeaderEl.textContent = `${playerName} feladata:`;
    }
    
    const inputEl = document.getElementById('race-answer-input');
    if (inputEl) {
        inputEl.value = '';
        inputEl.disabled = false;
        setTimeout(() => inputEl.focus(), 50);
    }
    
    const submitBtn = document.getElementById('race-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}

function handleRaceSubmit() {
    if (isProcessingTurn) return;
    if (!raceDiceRolled) return; // must roll first
    
    const inputEl = document.getElementById('race-answer-input');
    if (!inputEl) return;
    
    const userVal = parseInt(inputEl.value.trim());
    if (isNaN(userVal)) {
        showRaceMessage('Adj meg egy számot!', '#ff6b6b');
        return;
    }
    
    isProcessingTurn = true;
    inputEl.disabled = true;
    
    const submitBtn = document.getElementById('race-submit-btn');
    if (submitBtn) submitBtn.disabled = true;
    
    const correctAnswer = currentRaceQuestion.answer;
    // Use the dice roll result for steps, not the answer-based formula
    const steps = rolledDiceValue;
    
    if (userVal === correctAnswer) {
        showRaceMessage(`Helyes! Lépj előre ${steps} mezőt!`, '#ffe66d');
        
        setTimeout(() => {
            let currentPos = racePlayers[currentPlayer].position;
            let stepIndex = 0;
            
            function moveStep() {
                if (stepIndex < steps) {
                    currentPos++;
                    if (currentPos > 47) currentPos = 47;
                    
                    racePlayers[currentPlayer].position = currentPos;
                    renderRaceBoard();
                    updateRaceScorecards();
                    
                    stepIndex++;
                    if (currentPos === 47) {
                        setTimeout(() => {
                            showRaceWin(currentPlayer);
                        }, 600);
                    } else {
                        setTimeout(moveStep, 250);
                    }
                } else {
                    handleSpecialTileLanding(currentPlayer, currentPos);
                }
            }
            
            moveStep();
        }, 1000);
    } else {
        showRaceMessage(`Sajnos hibás! A helyes válasz: ${correctAnswer}. Nem lépsz előre.`, '#ff6b6b');
        
        setTimeout(() => {
            passRaceTurn();
        }, 2000);
    }
}

function handleSpecialTileLanding(playerIndex, pos) {
    const special = BOARD_SPECIALS[pos];
    if (special) {
        let newPos = pos + special.delta;
        if (newPos < 0) newPos = 0;
        if (newPos > 47) newPos = 47;
        
        const message = special.type === 'rocket' 
            ? `🚀 Rakéta! Csússz előre ${special.delta} mezőt!` 
            : `🐊 Mocsár! Csússz hátra ${Math.abs(special.delta)} mezőt!`;
            
        showRaceMessage(message, special.type === 'rocket' ? '#ffe66d' : '#ff6b6b');
        
        setTimeout(() => {
            racePlayers[playerIndex].position = newPos;
            renderRaceBoard();
            updateRaceScorecards();
            
            if (newPos === 47) {
                setTimeout(() => {
                    showRaceWin(playerIndex);
                }, 600);
            } else {
                setTimeout(() => {
                    passRaceTurn();
                }, 1200);
            }
        }, 1200);
    } else {
        setTimeout(() => {
            passRaceTurn();
        }, 800);
    }
}

function passRaceTurn() {
    currentPlayer = 1 - currentPlayer;
    updateRaceTurnDisplay();
    updateRaceScorecards();
    showRaceMessage('');
    isProcessingTurn = false;
    raceDiceRolled = false;
    rolledDiceValue = 0;
    showRaceDicePhase();
}

// ==========================================
// Race Dice Roll Logic
// ==========================================

function showRaceDicePhase() {
    // Reset dice
    raceDiceRolled = false;
    rolledDiceValue = 0;
    
    const mathSection = document.getElementById('race-math-section');
    const rollBtn = document.getElementById('race-roll-btn');
    const diceFace = document.getElementById('race-dice-face');
    const header = document.getElementById('race-question-header');
    
    if (mathSection) mathSection.style.display = 'none';
    if (rollBtn) {
        rollBtn.style.display = 'inline-block';
        rollBtn.disabled = false;
    }
    
    // Show empty dice face (placeholder)
    if (diceFace) {
        renderDiceFace(diceFace, null);
        diceFace.classList.add('clickable');
    }
    
    if (header) {
        const playerName = currentPlayer === 0 ? 'Kék Játékos' : 'Piros Játékos';
        header.textContent = `${playerName}: Dobd a kockát!`;
    }
}

function renderDiceFace(el, value) {
    el.innerHTML = '';
    
    if (value === null) {
        // Show '?' placeholder so the dice is clearly visible
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        const q = document.createElement('span');
        q.textContent = '?';
        q.style.cssText = 'font-size: 1.6rem; font-weight: 900; color: #aaa; font-family: Nunito, sans-serif; user-select: none;';
        el.appendChild(q);
        return;
    }
    
    el.style.display = '';
    el.style.alignItems = '';
    el.style.justifyContent = '';
    
    // Die dot patterns: positions in a 3x3 grid (0=top-left, 4=center, 8=bottom-right)
    const patterns = {
        1: [4],
        2: [2, 6],
        3: [2, 4, 6],
        4: [0, 2, 6, 8],
        5: [0, 2, 4, 6, 8],
        6: [0, 2, 3, 5, 6, 8]
    };
    const activeCells = patterns[value] || [];
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'dice-grid-cell';
        if (activeCells.includes(i)) {
            const dot = document.createElement('div');
            dot.className = 'dice-dot';
            cell.appendChild(dot);
        }
        el.appendChild(cell);
    }
}

function handleRaceDiceRoll() {
    if (isProcessingTurn) return;
    if (raceDiceRolled) return;
    
    const diceFace = document.getElementById('race-dice-face');
    const rollBtn = document.getElementById('race-roll-btn');
    
    if (rollBtn) rollBtn.disabled = true;
    if (diceFace) {
        diceFace.classList.add('rolling');
        diceFace.classList.remove('clickable');
    }
    
    // Animate rolling for 700ms, flash random numbers
    let animFrames = 0;
    const animInterval = setInterval(() => {
        const rand = Math.floor(Math.random() * 6) + 1;
        if (diceFace) renderDiceFace(diceFace, rand);
        animFrames++;
        if (animFrames >= 7) {
            clearInterval(animInterval);
            if (diceFace) diceFace.classList.remove('rolling');
            // Final result
            const result = Math.floor(Math.random() * 6) + 1;
            rolledDiceValue = result;
            raceDiceRolled = true;
            if (diceFace) {
                renderDiceFace(diceFace, result);
                // Trigger landing bounce animation
                diceFace.classList.add('landed');
                setTimeout(() => diceFace.classList.remove('landed'), 450);
            }
            // Now draw the question and reveal math section
            drawRaceQuestion();
            const mathSection = document.getElementById('race-math-section');
            if (mathSection) mathSection.style.display = 'block';
            if (rollBtn) rollBtn.style.display = 'none';
            
            const header = document.getElementById('race-question-header');
            if (header) {
                const playerName = currentPlayer === 0 ? 'Kék Játékos' : 'Piros Játékos';
                header.textContent = `${playerName} feladata: (${result} mező ha helyes)`;
            }
            
            const inputEl = document.getElementById('race-answer-input');
            if (inputEl) {
                inputEl.value = '';
                inputEl.disabled = false;
                setTimeout(() => inputEl.focus(), 50);
            }
            const submitBtn = document.getElementById('race-submit-btn');
            if (submitBtn) submitBtn.disabled = false;
        }
    }, 100);
}

function showRaceMessage(text, color = 'var(--accent-color)') {
    const messageEl = document.getElementById('race-message-area');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.style.color = color;
    }
}

function updateRaceScorecards() {
    const p1ScoreEl = document.getElementById('race-player1-score');
    const p2ScoreEl = document.getElementById('race-player2-score');
    
    if (p1ScoreEl) {
        const pos = racePlayers[0].position;
        p1ScoreEl.textContent = pos === 0 ? 'Mező: START' : `Mező: ${pos + 1}`;
    }
    if (p2ScoreEl) {
        const pos = racePlayers[1].position;
        p2ScoreEl.textContent = pos === 0 ? 'Mező: START' : `Mező: ${pos + 1}`;
    }
    
    const p1CardEl = document.getElementById('race-player1-card');
    const p2CardEl = document.getElementById('race-player2-card');
    
    if (p1CardEl && p2CardEl) {
        if (currentPlayer === 0) {
            p1CardEl.classList.add('active');
            p2CardEl.classList.remove('active');
        } else {
            p2CardEl.classList.add('active');
            p1CardEl.classList.remove('active');
        }
    }

    // Toggle player active indicators on dice elements
    const diceFaceEl = document.getElementById('race-dice-face');
    const rollBtnEl = document.getElementById('race-roll-btn');
    if (diceFaceEl) {
        if (currentPlayer === 0) {
            diceFaceEl.classList.add('p1-active');
            diceFaceEl.classList.remove('p2-active');
        } else {
            diceFaceEl.classList.add('p2-active');
            diceFaceEl.classList.remove('p1-active');
        }
    }
    if (rollBtnEl) {
        if (currentPlayer === 0) {
            rollBtnEl.classList.add('p1-active');
            rollBtnEl.classList.remove('p2-active');
        } else {
            rollBtnEl.classList.add('p2-active');
            rollBtnEl.classList.remove('p1-active');
        }
    }
}

function updateRaceTurnDisplay() {
    const turnEl = document.getElementById('race-turn-display');
    if (turnEl) {
        const playerName = currentPlayer === 0 ? 'Kék Játékos' : 'Piros Játékos';
        turnEl.textContent = `${playerName} jön`;
    }
}

function showRaceWin(winnerIndex) {
    const winnerName = winnerIndex === 0 ? 'Kék Játékos' : 'Piros Játékos';
    
    const titleEl = document.getElementById('race-winner-title');
    if (titleEl) {
        titleEl.textContent = `${winnerName} Győzött!`;
    }
    
    const textEl = document.getElementById('race-winner-text');
    if (textEl) {
        textEl.textContent = `Gratulálok! Elsőként értél a célba!`;
    }
    
    switchScreen('raceWin');
}

// ==========================================
// Kötélhúzás (Tug of War) Game Mode
// ==========================================

let tugPlayerCount = 2; // 2 or 4
let tugRopePosition = 0; // -4 (blue win) to +4 (red win)
let tugPlayerIndices = [0, 0, 0, 0];
let tugPlayerInputs = ['', '', '', ''];
let tugPlayerPenalties = [false, false, false, false];
let tugQuestions = []; // array of objects with {q1, q2, q3, q4}
let tugKeypadsInitialized = false;

function startTug(playerCount, grade) {
    tugPlayerCount = playerCount;
    lastGradePlayed = grade;
    currentLevel = levelSeeds[grade] || levelSeeds[2];
    
    const displayEl = document.getElementById('tug-grade-display');
    if (displayEl) {
        displayEl.textContent = `Kötélhúzás - ${currentLevel.name}`;
    }
    
    // Reset State
    tugRopePosition = 0;
    tugPlayerIndices = [0, 0, 0, 0];
    tugPlayerInputs = ['', '', '', ''];
    tugPlayerPenalties = [false, false, false, false];
    
    // Reset Team Labels
    const leftLabel = document.getElementById('tug-left-team-label');
    const rightLabel = document.getElementById('tug-right-team-label');
    if (leftLabel && rightLabel) {
        if (playerCount === 4) {
            leftLabel.textContent = '🔵 KÉK & SÁRGA (BAL)';
            rightLabel.textContent = 'PIROS & ZÖLD (JOBB) 🔴';
        } else {
            leftLabel.textContent = '🔵 KÉK JÁTÉKOS';
            rightLabel.textContent = 'PIROS JÁTÉKOS 🔴';
        }
    }
    
    // Clear inputs in UI and show/hide panels
    for (let p = 1; p <= 4; p++) {
        const inputEl = document.getElementById(`tug-p${p}-input`);
        if (inputEl) {
            inputEl.value = '';
            inputEl.classList.remove('error-shake', 'penalty-lock');
        }
        
        const card = document.getElementById(`tug-p${p}-card`);
        if (card) {
            card.classList.remove('active-pull');
            card.style.display = (p === 1 || p === 2 || (playerCount === 4 && (p === 3 || p === 4))) ? 'flex' : 'none';
        }
    }
    
    // Set player count class on container (for CSS scaling overrides)
    const tugPlayersContainer = document.getElementById('tug-players-container');
    if (tugPlayersContainer) {
        tugPlayersContainer.className = `tug-players-container players-${playerCount}`;
    }
    
    // Pre-generate questions
    tugQuestions = generateTugOfWarQuestions(grade);
    
    // Render first equations
    renderTugEquations();
    
    // Reset rope display
    updateRopeVisual();
    
    // Enable keypad keys
    enableTugKeypads();
    
    // One-time initialization of keypad click handlers
    if (!tugKeypadsInitialized) {
        initTugKeypads();
        tugKeypadsInitialized = true;
    }
    
    switchScreen('tug');
}

function generateSingleTugQuestion(grade) {
    let q;
    if (grade === 1) {
        // Addition/Subtraction up to 20
        const isAdd = Math.random() > 0.5;
        if (isAdd) {
            const targetVal = getRandomInt(5, 20);
            const a = getRandomInt(1, targetVal - 1);
            q = { expr: `${a} + ${targetVal - a}`, answer: targetVal };
        } else {
            const targetVal = getRandomInt(1, 15);
            const b = getRandomInt(1, 20 - targetVal);
            q = { expr: `${targetVal + b} - ${b}`, answer: targetVal };
        }
    } else if (grade === 2) {
        // Customizable settings
        const limit = window.grade2Settings.limit;
        const activeOps = window.grade2Settings.ops.length > 0 ? window.grade2Settings.ops : ['+'];
        const op = activeOps[Math.floor(Math.random() * activeOps.length)];
        
        if (op === '+') {
            const targetVal = getRandomInt(10, limit);
            const a = getRandomInt(1, targetVal - 1);
            q = { expr: `${a} + ${targetVal - a}`, answer: targetVal };
        } else if (op === '-') {
            const targetVal = getRandomInt(10, limit);
            const b = getRandomInt(1, Math.max(1, limit - targetVal));
            q = { expr: `${targetVal + b} - ${b}`, answer: targetVal };
        } else if (op === '*') {
            const maxVal = Math.min(10, limit);
            const a = getRandomInt(2, maxVal);
            const maxB = Math.floor(limit / a);
            const b = getRandomInt(1, maxB || 1);
            q = { expr: `${a} × ${b}`, answer: a * b };
        } else if (op === '/') {
            const maxDivisor = Math.min(10, limit);
            const b = getRandomInt(2, maxDivisor || 2);
            const maxTarget = Math.floor(limit / b);
            const qVal = getRandomInt(1, maxTarget || 1);
            q = { expr: `${qVal * b} ÷ ${b}`, answer: qVal };
        }
    } else if (grade === 3) {
        const opType = Math.random();
        if (opType < 0.35) {
            const isAdd = Math.random() > 0.5;
            if (isAdd) {
                const targetVal = getRandomInt(100, 1000);
                const a = getRandomInt(50, targetVal - 50);
                q = { expr: `${a} + ${targetVal - a}`, answer: targetVal };
            } else {
                const targetVal = getRandomInt(100, 1000);
                const b = getRandomInt(50, 1000 - targetVal);
                q = { expr: `${targetVal + b} - ${b}`, answer: targetVal };
            }
        } else if (opType < 0.7) {
            const a = getRandomInt(2, 10);
            const b = getRandomInt(2, 10);
            q = { expr: `${a} × ${b}`, answer: a * b };
        } else {
            const b = getRandomInt(2, 10);
            const qVal = getRandomInt(2, 10);
            q = { expr: `${qVal * b} ÷ ${b}`, answer: qVal };
        }
    } else {
        const opType = Math.random();
        if (opType < 0.35) {
            const isAdd = Math.random() > 0.5;
            if (isAdd) {
                const targetVal = getRandomInt(1000, 10000);
                const a = getRandomInt(100, targetVal - 100);
                q = { expr: `${a} + ${targetVal - a}`, answer: targetVal };
            } else {
                const targetVal = getRandomInt(1000, 10000);
                const b = getRandomInt(100, 10000 - targetVal);
                q = { expr: `${targetVal + b} - ${b}`, answer: targetVal };
            }
        } else if (opType < 0.7) {
            const a = getRandomInt(11, 50);
            const b = getRandomInt(2, 9);
            q = { expr: `${a} × ${b}`, answer: a * b };
        } else {
            const b = getRandomInt(2, 20);
            const qVal = getRandomInt(10, 50);
            q = { expr: `${qVal * b} ÷ ${b}`, answer: qVal };
        }
    }
    
    q.expr = q.expr.replace('*', '×').replace('/', '÷');
    return q;
}

function generateTugOfWarQuestions(grade, count = 100) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        questions.push({
            q1: generateSingleTugQuestion(grade),
            q2: generateSingleTugQuestion(grade),
            q3: generateSingleTugQuestion(grade),
            q4: generateSingleTugQuestion(grade)
        });
    }
    return questions;
}

function updateRopeVisual() {
    const flag = document.getElementById('tug-rope-flag');
    if (flag) {
        const pct = 50 + (tugRopePosition * 12.5);
        flag.style.left = `${pct}%`;
    }
    
    const nodes = document.querySelectorAll('.tug-node');
    nodes.forEach((node, idx) => {
        if (idx === (tugRopePosition + 4)) {
            node.classList.add('active-node');
        } else {
            node.classList.remove('active-node');
        }
    });
}

function renderTugEquations() {
    const activePlayers = [1, 2];
    if (tugPlayerCount === 4) {
        activePlayers.push(3, 4);
    }
    
    for (const p of activePlayers) {
        const scoreEl = document.getElementById(`tug-p${p}-score`);
        if (scoreEl) scoreEl.textContent = `Pont: ${tugPlayerIndices[p - 1]}`;
        
        const eqActive = document.getElementById(`tug-p${p}-eq-active`);
        const eqPrev = document.getElementById(`tug-p${p}-eq-prev`);
        const eqNext = document.getElementById(`tug-p${p}-eq-next`);
        
        const idx = tugPlayerIndices[p - 1];
        const playerQKey = `q${p}`;
        
        if (tugQuestions[idx]) {
            eqActive.textContent = tugQuestions[idx][playerQKey].expr;
        } else {
            eqActive.textContent = 'Kész!';
        }
        
        if (idx > 0) {
            const prevQ = tugQuestions[idx - 1][playerQKey];
            eqPrev.textContent = `${prevQ.expr} = ${prevQ.answer} ✓`;
            if (p === 1) eqPrev.style.color = 'var(--player1-color)';
            else if (p === 2) eqPrev.style.color = 'var(--player2-color)';
            else if (p === 3) eqPrev.style.color = '#ffe66d';
            else if (p === 4) eqPrev.style.color = '#1dd1a1';
        } else {
            eqPrev.textContent = '-';
            eqPrev.style.color = '';
        }
        
        if (tugQuestions[idx + 1]) {
            eqNext.textContent = tugQuestions[idx + 1][playerQKey].expr;
        } else {
            eqNext.textContent = '-';
        }
    }
}

function initTugKeypads() {
    for (let p = 1; p <= 4; p++) {
        const keys = document.querySelectorAll(`#tug-p${p}-keypad .tug-key`);
        keys.forEach(key => {
            key.addEventListener('click', () => {
                if (tugPlayerPenalties[p - 1]) return;
                const val = key.dataset.val;
                handleTugInput(p, val);
            });
        });
    }
}

function handleTugInput(playerNum, keyVal) {
    const inputEl = document.getElementById(`tug-p${playerNum}-input`);
    let inputStr = tugPlayerInputs[playerNum - 1];
    
    if (keyVal === 'back') {
        inputStr = inputStr.slice(0, -1);
    } else if (keyVal === '-') {
        if (inputStr === '') {
            inputStr = '-';
        }
    } else if (keyVal === 'ok') {
        submitTugAnswer(playerNum);
        return;
    } else if (inputStr.length < 5) {
        if (inputStr === '-' && keyVal === '0') {
            // avoid negative zero
        } else {
            inputStr += keyVal;
        }
    }
    tugPlayerInputs[playerNum - 1] = inputStr;
    if (inputEl) inputEl.value = inputStr;
    
    const card = document.getElementById(`tug-p${playerNum}-card`);
    if (inputStr !== '') {
        card.classList.add('active-pull');
    } else {
        card.classList.remove('active-pull');
    }
}

function submitTugAnswer(playerNum) {
    let inputStr = tugPlayerInputs[playerNum - 1];
    if (inputStr === '' || inputStr === '-') return;
    
    const idx = tugPlayerIndices[playerNum - 1];
    const currentQ = tugQuestions[idx]?.[`q${playerNum}`];
    if (!currentQ) return;
    
    const userVal = parseInt(inputStr);
    if (userVal === currentQ.answer) {
        tugPlayerIndices[playerNum - 1]++;
        tugPlayerInputs[playerNum - 1] = '';
        
        // Move rope: P1 & P3 Team Blue (Left, towards -4)
        // P2 & P4 Team Red (Right, towards +4)
        if (playerNum === 1 || playerNum === 3) {
            tugRopePosition = Math.max(-4, tugRopePosition - 1);
        } else {
            tugRopePosition = Math.min(4, tugRopePosition + 1);
        }
        updateRopeVisual();
        
        const inputEl = document.getElementById(`tug-p${playerNum}-input`);
        if (inputEl) inputEl.value = '';
        document.getElementById(`tug-p${playerNum}-card`).classList.remove('active-pull');
        
        renderTugEquations();
        checkTugWin();
    } else {
        triggerTugError(playerNum);
    }
}

function triggerTugError(playerNum) {
    tugPlayerPenalties[playerNum - 1] = true;
    const inputEl = document.getElementById(`tug-p${playerNum}-input`);
    if (inputEl) {
        inputEl.classList.add('error-shake', 'penalty-lock');
    }
    
    const keys = document.querySelectorAll(`#tug-p${playerNum}-keypad .tug-key`);
    keys.forEach(k => k.disabled = true);
    
    setTimeout(() => {
        tugPlayerPenalties[playerNum - 1] = false;
        tugPlayerInputs[playerNum - 1] = '';
        if (inputEl) {
            inputEl.value = '';
            inputEl.classList.remove('error-shake', 'penalty-lock');
        }
        keys.forEach(k => k.disabled = false);
        document.getElementById(`tug-p${playerNum}-card`).classList.remove('active-pull');
    }, 1000);
}

function enableTugKeypads() {
    const keys = document.querySelectorAll('.tug-key');
    keys.forEach(k => k.disabled = false);
}

function checkTugWin() {
    if (tugRopePosition === -4) {
        showTugWin(0);
    } else if (tugRopePosition === 4) {
        showTugWin(1);
    }
}

function showTugWin(winnerIndex) {
    let winnerName = '';
    if (winnerIndex === 0) {
        winnerName = tugPlayerCount === 4 ? 'Kék & Sárga Csapat' : 'Kék Játékos';
    } else {
        winnerName = tugPlayerCount === 4 ? 'Piros & Zöld Csapat' : 'Piros Játékos';
    }
    
    const titleEl = document.getElementById('tug-winner-title');
    if (titleEl) {
        titleEl.textContent = `${winnerName} Győzött!`;
    }
    
    const textEl = document.getElementById('tug-winner-text');
    if (textEl) {
        textEl.textContent = `Gratulálok! Sikeresen áthúztad a kötelet a térfeledre!`;
    }
    
    switchScreen('tugWin');
}

// ==========================================================================
// Autóverseny (Car Race) Game Mode Core Logic
// ==========================================================================

let carRacePlayerCount = 2; // default is 2
let carRacePlayerIndices = [0, 0, 0, 0]; // 0 to 10
let carRaceQuestions = []; // array of 10 equations
let carRacePlayerInputs = ['', '', '', ''];
let carRacePlayerPenalties = [false, false, false, false];
let carRaceKeypadsInitialized = false;

function startCarRace(playerCount, grade) {
    lastGradePlayed = grade;
    currentLevel = levelSeeds[grade] || levelSeeds[2];
    
    const displayEl = document.getElementById('car-race-grade-display');
    if (displayEl) {
        displayEl.textContent = `Autóverseny - ${currentLevel.name}`;
    }
    
    // Reset State
    carRacePlayerIndices = [0, 0, 0, 0];
    carRacePlayerInputs = ['', '', '', ''];
    carRacePlayerPenalties = [false, false, false, false];
    
    // Clear inputs and error classes
    for (let p = 1; p <= 4; p++) {
        const inputEl = document.getElementById(`car-p${p}-input`);
        if (inputEl) {
            inputEl.value = '';
            inputEl.classList.remove('error-shake', 'penalty-lock');
        }
        const card = document.getElementById(`car-p${p}-card`);
        if (card) {
            card.classList.remove('active-pull');
        }
        const car = document.getElementById(`car-p${p}`);
        if (car) {
            car.style.left = '0%';
            car.classList.remove('spin-out');
        }
    }
    
    // Show/hide tracks and player panels according to count
    const container = document.querySelector('.car-race-content-container');
    if (container) {
        container.className = `car-race-content-container players-${playerCount}`;
    }
    
    for (let p = 1; p <= 4; p++) {
        const lane = document.getElementById(`car-race-lane-${p}`);
        if (lane) {
            lane.style.display = (p <= playerCount) ? 'flex' : 'none';
        }
        const card = document.getElementById(`car-p${p}-card`);
        if (card) {
            card.style.display = (p <= playerCount) ? 'flex' : 'none';
        }
    }
    
    // Generate equations (10 steps to finish)
    carRaceQuestions = generateCarRaceQuestions(grade, 10);
    
    // Render initial equations
    renderCarRaceEquations();
    
    // Enable keypads
    enableCarRaceKeypads();
    
    // One-time initialization of keypad click handlers
    if (!carRaceKeypadsInitialized) {
        initCarRaceKeypads();
        carRaceKeypadsInitialized = true;
    }
    
    switchScreen('carRace');
}

function generateCarRaceQuestions(grade, count = 10) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        let q;
        if (grade === 1) {
            // Addition/subtraction up to 20
            const isAdd = Math.random() > 0.5;
            if (isAdd) {
                const targetVal = getRandomInt(5, 20);
                const a = getRandomInt(1, targetVal - 1);
                q = { expr: `${a} + ${targetVal - a}`, answer: targetVal };
            } else {
                const targetVal = getRandomInt(1, 15);
                const b = getRandomInt(1, 20 - targetVal);
                q = { expr: `${targetVal + b} - ${b}`, answer: targetVal };
            }
        } else if (grade === 2) {
            // customizable settings
            const limit = window.grade2Settings.limit;
            const activeOps = window.grade2Settings.ops.length > 0 ? window.grade2Settings.ops : ['+'];
            const op = activeOps[Math.floor(Math.random() * activeOps.length)];
            if (op === '+') {
                const targetVal = getRandomInt(10, limit);
                const a = getRandomInt(1, targetVal - 1);
                q = { expr: `${a} + ${targetVal - a}`, answer: targetVal };
            } else if (op === '-') {
                const targetVal = getRandomInt(10, limit);
                const b = getRandomInt(1, Math.max(1, limit - targetVal));
                q = { expr: `${targetVal + b} - ${b}`, answer: targetVal };
            } else if (op === '*') {
                const maxVal = Math.min(10, limit);
                const a = getRandomInt(2, maxVal);
                const maxB = Math.floor(limit / a);
                const b = getRandomInt(1, maxB || 1);
                q = { expr: `${a} × ${b}`, answer: a * b };
            } else if (op === '/') {
                const maxDivisor = Math.min(10, limit);
                const b = getRandomInt(2, maxDivisor || 2);
                const maxTarget = Math.floor(limit / b);
                const val = getRandomInt(1, maxTarget || 1);
                q = { expr: `${val * b} ÷ ${b}`, answer: val };
            }
        } else if (grade === 3) {
            const opType = Math.random();
            if (opType < 0.35) {
                const isAdd = Math.random() > 0.5;
                const targetVal = getRandomInt(100, 1000);
                if (isAdd) {
                    const a = getRandomInt(50, targetVal - 50);
                    q = { expr: `${a} + ${targetVal - a}`, answer: targetVal };
                } else {
                    const b = getRandomInt(50, 1000 - targetVal);
                    q = { expr: `${targetVal + b} - ${b}`, answer: targetVal };
                }
            } else if (opType < 0.7) {
                const a = getRandomInt(2, 10);
                const b = getRandomInt(2, 10);
                q = { expr: `${a} × ${b}`, answer: a * b };
            } else {
                const b = getRandomInt(2, 10);
                const val = getRandomInt(2, 10);
                q = { expr: `${val * b} ÷ ${b}`, answer: val };
            }
        } else {
            const opType = Math.random();
            if (opType < 0.35) {
                const isAdd = Math.random() > 0.5;
                const targetVal = getRandomInt(1000, 10000);
                if (isAdd) {
                    const a = getRandomInt(100, targetVal - 100);
                    q = { expr: `${a} + ${targetVal - a}`, answer: targetVal };
                } else {
                    const b = getRandomInt(100, 10000 - targetVal);
                    q = { expr: `${targetVal + b} - ${b}`, answer: targetVal };
                }
            } else if (opType < 0.7) {
                const a = getRandomInt(11, 50);
                const b = getRandomInt(2, 9);
                q = { expr: `${a} × ${b}`, answer: a * b };
            } else {
                const b = getRandomInt(2, 20);
                const val = getRandomInt(10, 50);
                q = { expr: `${val * b} ÷ ${b}`, answer: val };
            }
        }
        
        q.expr = q.expr.replace('*', '×').replace('/', '÷');
        questions.push(q);
    }
    return questions;
}

function renderCarRaceEquations() {
    for (let p = 1; p <= carRacePlayerCount; p++) {
        const idx = carRacePlayerIndices[p - 1];
        const scoreEl = document.getElementById(`car-p${p}-score`);
        if (scoreEl) {
            if (idx < 10) {
                scoreEl.textContent = `Kérdés: ${idx + 1} / 10`;
            } else {
                scoreEl.textContent = `Célba ért!`;
            }
        }
        
        const eqEl = document.getElementById(`car-p${p}-eq-active`);
        if (eqEl) {
            if (idx < 10) {
                eqEl.textContent = carRaceQuestions[idx].expr;
            } else {
                eqEl.textContent = '🏁 KÉSZ!';
            }
        }
    }
}

function initCarRaceKeypads() {
    for (let p = 1; p <= 4; p++) {
        const keypad = document.getElementById(`car-p${p}-keypad`);
        if (keypad) {
            const keys = keypad.querySelectorAll('.car-key');
            keys.forEach(key => {
                key.addEventListener('click', () => {
                    if (carRacePlayerPenalties[p - 1]) return;
                    const val = key.dataset.val;
                    handleCarRaceInput(p, val);
                });
            });
        }
    }
}

function handleCarRaceInput(playerNum, keyVal) {
    let inputStr = carRacePlayerInputs[playerNum - 1];
    const inputEl = document.getElementById(`car-p${playerNum}-input`);
    const card = document.getElementById(`car-p${playerNum}-card`);
    
    if (keyVal === 'back') {
        inputStr = inputStr.slice(0, -1);
    } else if (keyVal === '-') {
        if (inputStr === '') {
            inputStr = '-';
        }
    } else if (keyVal === 'ok') {
        submitCarRaceAnswer(playerNum);
        return;
    } else if (inputStr.length < 5) {
        if (inputStr === '-' && keyVal === '0') {
            // avoid negative zero
        } else {
            inputStr += keyVal;
        }
    }
    
    carRacePlayerInputs[playerNum - 1] = inputStr;
    if (inputEl) inputEl.value = inputStr;
    
    if (card) {
        if (inputStr !== '') {
            card.classList.add('active-pull');
        } else {
            card.classList.remove('active-pull');
        }
    }
}

function submitCarRaceAnswer(playerNum) {
    const pIndex = playerNum - 1;
    let inputStr = carRacePlayerInputs[pIndex];
    if (inputStr === '' || inputStr === '-') return;
    
    const idx = carRacePlayerIndices[pIndex];
    if (idx >= 10) return;
    
    const currentQ = carRaceQuestions[idx];
    const userVal = parseInt(inputStr);
    
    if (userVal === currentQ.answer) {
        carRacePlayerIndices[pIndex]++;
        carRacePlayerInputs[pIndex] = '';
        
        const inputEl = document.getElementById(`car-p${playerNum}-input`);
        if (inputEl) inputEl.value = '';
        
        const card = document.getElementById(`car-p${playerNum}-card`);
        if (card) card.classList.remove('active-pull');
        
        // Update car position
        const car = document.getElementById(`car-p${playerNum}`);
        if (car) {
            const pct = (carRacePlayerIndices[pIndex] / 10) * 100;
            car.style.left = `${pct}%`;
        }
        
        renderCarRaceEquations();
        checkCarRaceWin(playerNum);
    } else {
        triggerCarRaceError(playerNum);
    }
}

function triggerCarRaceError(playerNum) {
    const pIndex = playerNum - 1;
    carRacePlayerPenalties[pIndex] = true;
    
    const inputEl = document.getElementById(`car-p${playerNum}-input`);
    if (inputEl) {
        inputEl.classList.add('error-shake', 'penalty-lock');
    }
    
    // Disable keypad keys
    const keypad = document.getElementById(`car-p${playerNum}-keypad`);
    if (keypad) {
        const keys = keypad.querySelectorAll('.car-key');
        keys.forEach(k => k.disabled = true);
    }
    
    // Spin car
    const car = document.getElementById(`car-p${playerNum}`);
    if (car) {
        car.classList.add('spin-out');
    }
    
    setTimeout(() => {
        carRacePlayerPenalties[pIndex] = false;
        carRacePlayerInputs[pIndex] = '';
        if (inputEl) {
            inputEl.value = '';
            inputEl.classList.remove('error-shake', 'penalty-lock');
        }
        
        if (keypad) {
            const keys = keypad.querySelectorAll('.car-key');
            keys.forEach(k => k.disabled = false);
        }
        
        if (car) {
            car.classList.remove('spin-out');
        }
        
        const card = document.getElementById(`car-p${playerNum}-card`);
        if (card) card.classList.remove('active-pull');
    }, 2000); // 2 seconds lockout
}

function enableCarRaceKeypads() {
    for (let p = 1; p <= 4; p++) {
        const keypad = document.getElementById(`car-p${p}-keypad`);
        if (keypad) {
            const keys = keypad.querySelectorAll('.car-key');
            keys.forEach(k => k.disabled = false);
        }
    }
}

function checkCarRaceWin(playerNum) {
    const pIndex = playerNum - 1;
    if (carRacePlayerIndices[pIndex] === 10) {
        showCarRaceWin(playerNum);
    }
}

function showCarRaceWin(winnerNum) {
    const playerNames = ['Kék Játékos', 'Piros Játékos', 'Sárga Játékos', 'Zöld Játékos'];
    const winnerName = playerNames[winnerNum - 1];
    
    const titleEl = document.getElementById('car-race-winner-title');
    if (titleEl) {
        titleEl.textContent = `Győztes: ${winnerName}!`;
    }
    
    const textEl = document.getElementById('car-race-winner-text');
    if (textEl) {
        textEl.textContent = `Gratulálok! Sikeresen elsőként értél célba az autóddal!`;
    }
    
    switchScreen('carRaceWin');
}

