// js/games/conquest.js

import { sound } from '../core/audio.js';
import { levelSeeds, grade2Settings } from '../core/levels.js';
import { generateUniquePairs, switchScreen } from '../core/utils.js';

let conquestState = {
    board: [],
    currentPlayer: 1,
    scores: { 1: 0, 2: 0 },
    timerInterval: null,
    timeLeft: 30,
    currentGrade: 2
};

export function startConquest(grade = 2) {
    conquestState.currentGrade = grade;
    conquestState.currentPlayer = 1;
    conquestState.scores = { 1: 0, 2: 0 };

    if (conquestState.timerInterval) clearInterval(conquestState.timerInterval);

    const seed = levelSeeds[grade] || levelSeeds[2];
    const generatedPairs = generateUniquePairs(seed, 36);

    conquestState.board = generatedPairs.map((pair, idx) => ({
        id: idx,
        val: pair.value,
        text: pair.texts[0],
        owner: null // null, 1 (Blue), 2 (Red)
    }));

    const gradeDisplay = document.getElementById('conquest-grade-display');
    if (gradeDisplay) gradeDisplay.textContent = seed.name;

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
        slot.className = 'conquest-slot';
        if (cell.owner === 1) slot.classList.add('p1');
        if (cell.owner === 2) slot.classList.add('p2');

        slot.textContent = cell.text;
        slot.addEventListener('click', () => onConquestTileClick(cell));
        board.appendChild(slot);
    });
}

function onConquestTileClick(cell) {
    if (cell.owner !== null) return;

    cell.owner = conquestState.currentPlayer;
    sound.playMatch();
    conquestState.scores[conquestState.currentPlayer]++;

    renderConquestBoard();

    if (checkConquestWin()) {
        showConquestWin();
        return;
    }

    conquestState.currentPlayer = conquestState.currentPlayer === 1 ? 2 : 1;
    updateConquestTurnDisplay();

    if (grade2Settings.conquestTimerEnabled) {
        startConquestTimer();
    }
}

function startConquestTimer() {
    if (conquestState.timerInterval) clearInterval(conquestState.timerInterval);
    conquestState.timeLeft = grade2Settings.conquestTimerLimit || 30;

    const timerBar = document.getElementById('conquest-timer-bar');
    const timerText = document.getElementById('conquest-timer-text');

    if (timerText) timerText.textContent = `${conquestState.timeLeft} másodperc`;
    if (timerBar) timerBar.style.width = '100%';

    conquestState.timerInterval = setInterval(() => {
        conquestState.timeLeft--;
        if (timerText) timerText.textContent = `${conquestState.timeLeft} másodperc`;
        if (timerBar) {
            const pct = (conquestState.timeLeft / (grade2Settings.conquestTimerLimit || 30)) * 100;
            timerBar.style.width = `${pct}%`;
        }

        if (conquestState.timeLeft <= 0) {
            clearInterval(conquestState.timerInterval);
            sound.playError();
            // Pass turn
            conquestState.currentPlayer = conquestState.currentPlayer === 1 ? 2 : 1;
            updateConquestTurnDisplay();
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

function showConquestWin() {
    if (conquestState.timerInterval) clearInterval(conquestState.timerInterval);
    sound.playWin();

    const title = document.getElementById('conquest-winner-title');
    const text = document.getElementById('conquest-winner-text');
    const p1Final = document.getElementById('conquest-p1-final-score');
    const p2Final = document.getElementById('conquest-p2-final-score');

    if (p1Final) p1Final.textContent = conquestState.scores[1];
    if (p2Final) p2Final.textContent = conquestState.scores[2];

    if (conquestState.scores[1] > conquestState.scores[2]) {
        if (title) title.textContent = "Kék Játékos Nyert!";
        if (text) text.textContent = "Gratulálunk a területhódításhoz!";
    } else if (conquestState.scores[2] > conquestState.scores[1]) {
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
    conquestState.currentPlayer = conquestState.currentPlayer === 1 ? 2 : 1;
    updateConquestTurnDisplay();
    if (grade2Settings.conquestTimerEnabled) {
        startConquestTimer();
    }
}
