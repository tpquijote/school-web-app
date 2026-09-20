// js/games/conquest.js

import { sound } from '../core/audio.js';
import { levelSeeds, grade2Settings } from '../core/levels.js';
import { generateUniquePairs, switchScreen } from '../core/utils.js';

let conquestState = {
    board: [],
    selectedTiles: [],
    currentPlayer: 1,
    scores: { 1: 0, 2: 0 },
    timerInterval: null,
    timeLeft: 30,
    currentGrade: 2,
    isProcessing: false,
    pairsLeft: 18
};

export function stopConquestTimer() {
    if (conquestState.timerInterval) {
        clearInterval(conquestState.timerInterval);
        conquestState.timerInterval = null;
    }
}

export function startConquest(grade = 2) {
    conquestState.currentGrade = grade;
    conquestState.currentPlayer = 1;
    conquestState.scores = { 1: 0, 2: 0 };
    conquestState.selectedTiles = [];
    conquestState.isProcessing = false;
    conquestState.pairsLeft = 18;

    stopConquestTimer();

    const seed = levelSeeds[grade] || levelSeeds[2];
    const generatedPairs = generateUniquePairs(seed, 18);

    const tileList = [];
    generatedPairs.forEach((pair, pairIdx) => {
        tileList.push({ pairId: pairIdx, val: pair.value, text: pair.texts[0], owner: null });
        tileList.push({ pairId: pairIdx, val: pair.value, text: pair.texts[1], owner: null });
    });

    // Shuffle Fisher-Yates
    for (let i = tileList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tileList[i], tileList[j]] = [tileList[j], tileList[i]];
    }

    conquestState.board = tileList.map((tile, idx) => ({
        ...tile,
        id: idx,
        row: Math.floor(idx / 6),
        col: idx % 6
    }));

    const gradeDisplay = document.getElementById('conquest-grade-display');
    if (gradeDisplay) gradeDisplay.textContent = seed.name;

    const pairsDisplay = document.getElementById('conquest-pairs-left');
    if (pairsDisplay) pairsDisplay.textContent = `Hátralévő helyek: ${conquestState.board.filter(c => c.owner === null).length}`;

    updateConquestTurnDisplay();
    renderConquestBoard();

    const timerContainer = document.getElementById('conquest-timer-container');
    if (grade2Settings.conquestTimerEnabled) {
        if (timerContainer) timerContainer.style.display = 'block';
        startConquestTimer();
    } else {
        if (timerContainer) timerContainer.style.display = 'none';
    }

    switchScreen('conquest-screen');
}

function updateConquestTurnDisplay() {
    const turnDisplay = document.getElementById('conquest-turn-display');
    const p1Card = document.getElementById('conquest-player1-card');
    const p2Card = document.getElementById('conquest-player2-card');

    if (conquestState.currentPlayer === 1) {
        if (turnDisplay) {
            turnDisplay.textContent = "Kék Játékos jön";
            turnDisplay.style.background = "#4834d4";
        }
        if (p1Card) p1Card.classList.add('active');
        if (p2Card) p2Card.classList.remove('active');
    } else {
        if (turnDisplay) {
            turnDisplay.textContent = "Piros Játékos jön";
            turnDisplay.style.background = "#eb4d4b";
        }
        if (p2Card) p2Card.classList.add('active');
        if (p1Card) p1Card.classList.remove('active');
    }
}

function renderConquestBoard() {
    const board = document.getElementById('conquest-board');
    if (!board) return;

    board.innerHTML = '';
    conquestState.board.forEach(cell => {
        const slot = document.createElement('div');
        slot.className = 'conquest-tile';
        if (cell.owner === 1) slot.classList.add('claimed-p1');
        if (cell.owner === 2) slot.classList.add('claimed-p2');
        if (conquestState.selectedTiles.some(t => t.id === cell.id)) {
            slot.classList.add(conquestState.currentPlayer === 1 ? 'selected-p1' : 'selected-p2');
        }

        slot.textContent = cell.text;
        slot.addEventListener('click', () => onConquestTileClick(cell));
        board.appendChild(slot);
    });

    const pairsDisplay = document.getElementById('conquest-pairs-left');
    if (pairsDisplay) pairsDisplay.textContent = `Hátralévő helyek: ${conquestState.board.filter(c => c.owner === null).length}`;
}

function onConquestTileClick(cell) {
    if (conquestState.isProcessing || cell.owner !== null) return;

    // Toggle selection
    const selIdx = conquestState.selectedTiles.findIndex(t => t.id === cell.id);
    if (selIdx !== -1) {
        conquestState.selectedTiles.splice(selIdx, 1);
        sound.playSelect();
        renderConquestBoard();
        return;
    }

    conquestState.selectedTiles.push(cell);
    sound.playSelect();
    renderConquestBoard();

    if (conquestState.selectedTiles.length === 2) {
        checkConquestMatch();
    }
}

function checkConquestMatch() {
    conquestState.isProcessing = true;
    const [t1, t2] = conquestState.selectedTiles;

    if (t1.val === t2.val) {
        sound.playMatch();
        t1.owner = conquestState.currentPlayer;
        t2.owner = conquestState.currentPlayer;
        conquestState.scores[conquestState.currentPlayer] += 2;

        conquestState.selectedTiles = [];
        renderConquestBoard();

        if (checkConquestWin()) {
            showConquestWin(conquestState.currentPlayer);
            return;
        }

        conquestState.isProcessing = false;
        // Turn passes to next player
        conquestState.currentPlayer = conquestState.currentPlayer === 1 ? 2 : 1;
        updateConquestTurnDisplay();
        if (grade2Settings.conquestTimerEnabled) {
            startConquestTimer();
        }
    } else {
        sound.playError();
        showConquestMessage("Hibás párosítás!", "#ff6b6b");

        setTimeout(() => {
            conquestState.selectedTiles = [];
            conquestState.isProcessing = false;
            conquestState.currentPlayer = conquestState.currentPlayer === 1 ? 2 : 1;
            updateConquestTurnDisplay();
            renderConquestBoard();
            if (grade2Settings.conquestTimerEnabled) {
                startConquestTimer();
            }
        }, 1000);
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

function startConquestTimer() {
    stopConquestTimer();
    conquestState.timeLeft = grade2Settings.conquestTimerLimit || 30;

    const timerBar = document.getElementById('conquest-timer-bar');
    const timerText = document.getElementById('conquest-timer-text');

    if (timerText) timerText.textContent = `${conquestState.timeLeft} másodperc`;
    if (timerBar) timerBar.style.width = '100%';

    conquestState.timerInterval = setInterval(() => {
        if (conquestState.isProcessing) return;
        conquestState.timeLeft--;
        if (timerText) timerText.textContent = `${conquestState.timeLeft} másodperc`;
        if (timerBar) {
            const pct = (conquestState.timeLeft / (grade2Settings.conquestTimerLimit || 30)) * 100;
            timerBar.style.width = `${pct}%`;
        }

        if (conquestState.timeLeft <= 0) {
            stopConquestTimer();
            sound.playError();
            showConquestMessage("Lejárt az idő! Passz.", "#ff9f1c");
            conquestState.selectedTiles = [];
            conquestState.currentPlayer = conquestState.currentPlayer === 1 ? 2 : 1;
            updateConquestTurnDisplay();
            renderConquestBoard();
            startConquestTimer();
        }
    }, 1000);
}

function checkConquestWin() {
    const grid = Array(6).fill(null).map(() => Array(6).fill(null));
    conquestState.board.forEach((cell, idx) => {
        const r = Math.floor(idx / 6);
        const c = idx % 6;
        grid[r][c] = cell.owner;
    });

    const p = conquestState.currentPlayer;

    // Check rows, cols, diagonals for 4 in a row
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            if (grid[r][c] !== p) continue;

            // Horizontal
            if (c + 3 < 6 && grid[r][c+1] === p && grid[r][c+2] === p && grid[r][c+3] === p) return true;
            // Vertical
            if (r + 3 < 6 && grid[r+1][c] === p && grid[r+2][c] === p && grid[r+3][c] === p) return true;
            // Diagonal Down-Right
            if (r + 3 < 6 && c + 3 < 6 && grid[r+1][c+1] === p && grid[r+2][c+2] === p && grid[r+3][c+3] === p) return true;
            // Diagonal Up-Right
            if (r - 3 >= 0 && c + 3 < 6 && grid[r-1][c+1] === p && grid[r-2][c+2] === p && grid[r-3][c+3] === p) return true;
        }
    }

    // Check if board full
    const full = conquestState.board.every(cell => cell.owner !== null);
    return full;
}

function showConquestWin(connect4Winner = null) {
    stopConquestTimer();
    sound.playWin();

    const title = document.getElementById('conquest-winner-title');
    const text = document.getElementById('conquest-winner-text');
    const p1Final = document.getElementById('conquest-p1-final-score');
    const p2Final = document.getElementById('conquest-p2-final-score');

    if (p1Final) p1Final.textContent = conquestState.scores[1];
    if (p2Final) p2Final.textContent = conquestState.scores[2];

    let winner = connect4Winner;
    if (winner === null) {
        if (conquestState.scores[1] > conquestState.scores[2]) winner = 1;
        else if (conquestState.scores[2] > conquestState.scores[1]) winner = 2;
    }

    if (winner === 1) {
        if (title) title.textContent = "Kék Játékos Nyert!";
        if (text) text.textContent = "Gratulálunk a területhódításhoz!";
    } else if (winner === 2) {
        if (title) title.textContent = "Piros Játékos Nyert!";
        if (text) text.textContent = "Gratulálunk a területhódításhoz!";
    } else {
        if (title) title.textContent = "Döntetlen!";
        if (text) text.textContent = "Egyenlő területet hódítottatok meg!";
    }

    switchScreen('conquest-win-screen');
}

export function passConquestTurn() {
    sound.playSelect();
    conquestState.selectedTiles = [];
    conquestState.currentPlayer = conquestState.currentPlayer === 1 ? 2 : 1;
    updateConquestTurnDisplay();
    renderConquestBoard();
    if (grade2Settings.conquestTimerEnabled) {
        startConquestTimer();
    }
}
