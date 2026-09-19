// js/games/race.js

import { sound } from '../core/audio.js';
import { levelSeeds } from '../core/levels.js';
import { setupKeypadHandler } from '../components/keypad.js';
import { switchScreen } from '../core/utils.js';

const BOARD_SPECIALS = {
    4: { type: 'rocket', delta: 4, icon: '🚀' },
    14: { type: 'rocket', delta: 5, icon: '🚀' },
    25: { type: 'rocket', delta: 5, icon: '🚀' },
    9: { type: 'swamp', delta: -4, icon: '🐊' },
    20: { type: 'swamp', delta: -4, icon: '🐊' },
    31: { type: 'swamp', delta: -4, icon: '🐊' }
};

let raceState = {
    positions: { 1: 0, 2: 0 },
    currentPlayer: 1,
    rolledValue: 0,
    currentPair: null,
    currentGrade: 2
};

function getQuestionText(pair) {
    if (!pair || !pair.texts) return '';
    const expr = pair.texts.find(t => /[+\-×÷*\/]/.test(t));
    return expr || pair.texts[0];
}

export function startRace(grade = 2) {
    raceState.currentGrade = grade;
    raceState.positions = { 1: 0, 2: 0 };
    raceState.currentPlayer = 1;
    raceState.rolledValue = 0;
    raceState.currentPair = null;

    const seed = levelSeeds[grade] || levelSeeds[2];
    const gradeDisplay = document.getElementById('race-grade-display');
    if (gradeDisplay) gradeDisplay.textContent = seed.name;

    updateRaceBoard();
    updateRaceTurn();

    const mathSection = document.getElementById('race-math-section');
    if (mathSection) mathSection.style.display = 'none';

    const rollBtn = document.getElementById('race-roll-btn');
    if (rollBtn) rollBtn.style.display = 'inline-block';

    const keypad = document.getElementById('race-keypad');
    const input = document.getElementById('race-answer-input');
    setupKeypadHandler(keypad, input, submitRaceAnswer);

    const submitBtn = document.getElementById('race-submit-btn');
    if (submitBtn) {
        submitBtn.onclick = submitRaceAnswer;
    }

    if (input) {
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                submitRaceAnswer();
            }
        };
    }

    switchScreen('race-screen');
}

function updateRaceBoard() {
    const board = document.getElementById('race-board');
    if (!board) return;

    board.innerHTML = '';
    for (let i = 0; i < 36; i++) {
        const space = document.createElement('div');
        space.className = 'race-tile';

        const special = BOARD_SPECIALS[i];
        if (special) {
            space.classList.add(`tile-${special.type}`);
        }

        if (i === 0) space.classList.add('tile-start');
        if (i === 35) space.classList.add('tile-finish');

        let label = (i + 1).toString();
        if (i === 0) label = "START";
        if (i === 35) label = "CÉL 🏁";

        let tokensHtml = '';
        if (raceState.positions[1] === i) tokensHtml += '<span class="p1-token">🟦</span>';
        if (raceState.positions[2] === i) tokensHtml += '<span class="p2-token">🟥</span>';

        space.innerHTML = `
            <div class="tile-number">${label} ${special ? `<span class="tile-icon">${special.icon}</span>` : ''}</div>
            <div class="token-container">${tokensHtml}</div>
        `;

        board.appendChild(space);
    }

    const p1Score = document.getElementById('race-player1-score');
    const p2Score = document.getElementById('race-player2-score');
    if (p1Score) p1Score.textContent = `Mező: ${raceState.positions[1] === 0 ? 'START' : raceState.positions[1] + 1}`;
    if (p2Score) p2Score.textContent = `Mező: ${raceState.positions[2] === 0 ? 'START' : raceState.positions[2] + 1}`;
}

function updateRaceTurn() {
    const turnDisplay = document.getElementById('race-turn-display');
    const p1Card = document.getElementById('race-player1-card');
    const p2Card = document.getElementById('race-player2-card');
    const questionHeader = document.getElementById('race-question-header');

    const pName = raceState.currentPlayer === 1 ? "Kék Játékos" : "Piros Játékos";
    if (questionHeader) questionHeader.textContent = `${pName} következik`;

    if (raceState.currentPlayer === 1) {
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

export function rollRaceDice() {
    sound.playDice();
    const diceFace = document.getElementById('race-dice-face');

    let rollCount = 0;
    const interval = setInterval(() => {
        const rand = Math.floor(Math.random() * 6) + 1;
        if (diceFace) diceFace.textContent = rand;
        rollCount++;

        if (rollCount >= 10) {
            clearInterval(interval);
            raceState.rolledValue = Math.floor(Math.random() * 6) + 1;
            if (diceFace) diceFace.textContent = raceState.rolledValue;

            // Show math question
            const seed = levelSeeds[raceState.currentGrade] || levelSeeds[2];
            raceState.currentPair = seed.generatePair();

            const qText = document.getElementById('race-question-text');
            if (qText) qText.textContent = `${getQuestionText(raceState.currentPair)} = `;

            const input = document.getElementById('race-answer-input');
            if (input) input.value = '';

            const rollBtn = document.getElementById('race-roll-btn');
            if (rollBtn) rollBtn.style.display = 'none';

            const mathSection = document.getElementById('race-math-section');
            if (mathSection) mathSection.style.display = 'block';
        }
    }, 50);
}

export function submitRaceAnswer() {
    const input = document.getElementById('race-answer-input');
    if (!input || !raceState.currentPair) return;

    const userVal = parseInt(input.value, 10);
    const expected = raceState.currentPair.value;

    if (userVal === expected) {
        sound.playMatch();
        let newPos = raceState.positions[raceState.currentPlayer] + raceState.rolledValue;

        // Handle special board space rocket/swamp delta
        const special = BOARD_SPECIALS[newPos];
        if (special) {
            newPos = Math.max(0, Math.min(35, newPos + special.delta));
        }

        if (newPos >= 35) {
            raceState.positions[raceState.currentPlayer] = 35;
            updateRaceBoard();
            showRaceWin();
            return;
        } else {
            raceState.positions[raceState.currentPlayer] = newPos;
        }
    } else {
        sound.playError();
    }

    updateRaceBoard();

    // Reset UI for next turn
    const mathSection = document.getElementById('race-math-section');
    if (mathSection) mathSection.style.display = 'none';

    const rollBtn = document.getElementById('race-roll-btn');
    if (rollBtn) rollBtn.style.display = 'inline-block';

    raceState.currentPlayer = raceState.currentPlayer === 1 ? 2 : 1;
    updateRaceTurn();
}

function showRaceWin() {
    sound.playWin();
    const title = document.getElementById('race-winner-title');
    const text = document.getElementById('race-winner-text');

    const pName = raceState.currentPlayer === 1 ? "Kék Játékos" : "Piros Játékos";
    if (title) title.textContent = `${pName} Nyert!`;
    if (text) text.textContent = "Sikeresen beértél a célba!";

    switchScreen('race-win-screen');
}
