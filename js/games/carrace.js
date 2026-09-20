// js/games/carrace.js

import { sound } from '../core/audio.js';
import { levelSeeds } from '../core/levels.js';
import { setupKeypadHandler } from '../components/keypad.js';
import { switchScreen } from '../core/utils.js';

let carRaceState = {
    playerCount: 2,
    players: {},
    currentGrade: 2,
    targetQuestions: 10
};

function getQuestionText(pair) {
    if (!pair || !pair.texts) return '';
    const expr = pair.texts.find(t => /[+\-×÷*\/]/.test(t));
    return expr || pair.texts[0];
}

export function startCarRace(grade = 2, playerCount = 2) {
    carRaceState.currentGrade = grade;
    carRaceState.playerCount = playerCount;

    const activePlayerIds = [];
    for (let i = 1; i <= playerCount; i++) activePlayerIds.push(i);

    const seed = levelSeeds[grade] || levelSeeds[2];

    carRaceState.players = {};
    activePlayerIds.forEach(pId => {
        carRaceState.players[pId] = {
            id: pId,
            progress: 0, // 0 to 10
            isPenalized: false,
            currentPair: seed.generatePair()
        };
    });

    // Toggle player cards & lanes visibility
    [1, 2, 3, 4].forEach(pId => {
        const card = document.getElementById(`car-p${pId}-card`);
        const lane = document.getElementById(`car-race-lane-${pId}`);
        if (activePlayerIds.includes(pId)) {
            if (card) card.style.display = 'block';
            if (lane) lane.style.display = 'flex';
            setupCarPlayerKeypad(pId);
            updateCarPlayerUI(pId);
        } else {
            if (card) card.style.display = 'none';
            if (lane) lane.style.display = 'none';
        }
    });

    updateCarPositions();
    switchScreen('car-race-screen');
}

function setupCarPlayerKeypad(pId) {
    const keypad = document.getElementById(`car-p${pId}-keypad`);
    const input = document.getElementById(`car-p${pId}-input`);

    setupKeypadHandler(keypad, input, (val) => submitCarAnswer(pId, val));
}

function updateCarPlayerUI(pId) {
    const player = carRaceState.players[pId];
    if (!player) return;

    const eqActive = document.getElementById(`car-p${pId}-eq-active`);
    if (eqActive) eqActive.textContent = getQuestionText(player.currentPair);

    const scoreElem = document.getElementById(`car-p${pId}-score`);
    if (scoreElem) scoreElem.textContent = `Kérdés: ${player.progress + 1} / ${carRaceState.targetQuestions}`;

    const input = document.getElementById(`car-p${pId}-input`);
    if (input) input.value = '';
}

function submitCarAnswer(pId, userValStr) {
    const player = carRaceState.players[pId];
    if (!player || player.isPenalized) return;
    if (!userValStr || userValStr.trim() === '' || userValStr === '-') return;

    const userVal = parseInt(userValStr, 10);
    const expected = player.currentPair.value;

    if (userVal === expected) {
        sound.playMatch();
        player.progress++;

        updateCarPositions();

        if (player.progress >= carRaceState.targetQuestions) {
            showCarRaceWin(pId);
            return;
        }

        const seed = levelSeeds[carRaceState.currentGrade] || levelSeeds[2];
        player.currentPair = seed.generatePair();
        updateCarPlayerUI(pId);
    } else {
        sound.playError();
        triggerCarPenalty(pId);
    }
}

function triggerCarPenalty(pId) {
    const player = carRaceState.players[pId];
    if (!player) return;

    player.isPenalized = true;

    const input = document.getElementById(`car-p${pId}-input`);
    if (input) {
        input.value = '';
        input.classList.add('error-shake', 'penalty-lock');
    }

    const car = document.getElementById(`car-p${pId}`);
    if (car) {
        car.classList.add('spin-out');
    }

    setTimeout(() => {
        player.isPenalized = false;
        if (input) {
            input.classList.remove('error-shake', 'penalty-lock');
        }
        if (car) {
            car.classList.remove('spin-out');
        }
    }, 2000);
}

function updateCarPositions() {
    Object.values(carRaceState.players).forEach(p => {
        const car = document.getElementById(`car-p${p.id}`);
        if (car) {
            const pct = (p.progress / carRaceState.targetQuestions) * 90; // 0% to 90%
            car.style.left = `${pct}%`;
        }
    });
}

function showCarRaceWin(winnerId) {
    sound.playWin();
    const title = document.getElementById('car-race-winner-title');
    const text = document.getElementById('car-race-winner-text');

    const names = { 1: "Kék Játékos", 2: "Piros Játékos", 3: "Sárga Játékos", 4: "Zöld Játékos" };
    const wName = names[winnerId] || `Játékos ${winnerId}`;

    if (title) title.textContent = `${wName} Nyert!`;
    if (text) text.textContent = "Elsőként értél át a célvonalon!";

    switchScreen('car-race-win-screen');
}
