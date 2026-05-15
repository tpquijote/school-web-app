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

// DOM Elements
const screens = {
    mainMenu: document.getElementById('main-menu'),
    game: document.getElementById('game-screen'),
    win: document.getElementById('win-screen')
};

const gameBoard = document.getElementById('game-board');
const gradeDisplay = document.getElementById('grade-display');
const pairsLeftDisplay = document.getElementById('pairs-left');
const messageArea = document.getElementById('message-area');

// Event Listeners
document.querySelectorAll('.grade-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const grade = parseInt(e.target.dataset.grade);
        startGame(grade);
    });
});

document.getElementById('back-btn').addEventListener('click', showMainMenu);
document.getElementById('play-again-btn').addEventListener('click', showMainMenu);

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function showMainMenu() {
    switchScreen('mainMenu');
    activeTiles = [];
    gameBoard.innerHTML = '';
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

function generateTiles(levelConfig) {
    const layout = gameLayout; // from levels.js
    
    // Create a working copy of the layout to simulate removing tiles backwards
    let unassignedSlots = layout.map((pos, index) => ({
        ...pos,
        id: `slot_${index}`
    }));
    
    const assignedTiles = [];
    const numPairs = layout.length / 2;
    
    // Helper to find a slot in our working copy
    const getSlotAt = (slots, l, r, c) => slots.find(s => s.l === l && s.r === r && s.c === c);
    
    for (let i = 0; i < numPairs; i++) {
        // Find slots that are "free" in the current partially-built board
        const freeSlots = unassignedSlots.filter(t => {
            const topBlocked = getSlotAt(unassignedSlots, t.l + 1, t.r, t.c);
            const leftBlocked = getSlotAt(unassignedSlots, t.l, t.r, t.c - 1);
            const rightBlocked = getSlotAt(unassignedSlots, t.l, t.r, t.c + 1);
            return !topBlocked && (!leftBlocked || !rightBlocked);
        });
        
        if (freeSlots.length < 2) {
            console.error("Deadlock in generation! Layout might be invalid.");
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
        
        // Generate pair values
        const pair = levelConfig.generatePair();
        
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
    
    return assignedTiles;
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
