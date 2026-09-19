// js/games/tug.js

import { sound } from '../core/audio.js';
import { levelSeeds } from '../core/levels.js';
import { setupKeypadHandler } from '../components/keypad.js';
import { switchScreen } from '../core/utils.js';

let tugState = {
    playerCount: 2, // 2 or 4
    ropePos: 0, // -4 (Left win) to +4 (Right win)
    players: {},
    currentGrade: 2
};

function getQuestionText(pair) {
    if (!pair || !pair.texts) return '';
    // Find expression text (containing arithmetic operator + - * / x ÷)
    const expr = pair.texts.find(t => /[+\-×÷*\/]/.test(t));
    return expr || pair.texts[0];
}

export function startTug(grade = 2, playerCount = 2) {
    tugState.currentGrade = grade;
    tugState.playerCount = playerCount;
    tugState.ropePos = 0;

    const activePlayerIds = playerCount === 4 ? [1, 2, 3, 4] : [1, 2];
    const seed = levelSeeds[grade] || levelSeeds[2];

    tugState.players = {};
    activePlayerIds.forEach(pId => {
        tugState.players[pId] = {
            id: pId,
            score: 1,
            currentPair: seed.generatePair()
        };
    });

    const p3Card = document.getElementById('tug-p3-card');
    const p4Card = document.getElementById('tug-p4-card');

    if (playerCount === 4) {
        if (p3Card) p3Card.style.display = 'block';
        if (p4Card) p4Card.style.display = 'block';
    } else {
        if (p3Card) p3Card.style.display = 'none';
        if (p4Card) p4Card.style.display = 'none';
    }

    activePlayerIds.forEach(pId => {
        setupPlayerKeypad(pId);
        updatePlayerQuestionUI(pId);
    });

    updateRopeUI();
    switchScreen('tug-screen');
}

function setupPlayerKeypad(pId) {
    const keypad = document.getElementById(`tug-p${pId}-keypad`);
    const input = document.getElementById(`tug-p${pId}-input`);

    setupKeypadHandler(keypad, input, (val) => submitTugAnswer(pId, val));
}

function updatePlayerQuestionUI(pId) {
    const player = tugState.players[pId];
    if (!player) return;

    const eqActive = document.getElementById(`tug-p${pId}-eq-active`);
    if (eqActive) eqActive.textContent = getQuestionText(player.currentPair);

    const scoreElem = document.getElementById(`tug-p${pId}-score`);
    if (scoreElem) scoreElem.textContent = `Kérdés: ${player.score}`;

    const input = document.getElementById(`tug-p${pId}-input`);
    if (input) input.value = '';
}

function submitTugAnswer(pId, userValStr) {
    const player = tugState.players[pId];
    if (!player) return;

    const userVal = parseInt(userValStr, 10);
    const expected = player.currentPair.value;

    if (userVal === expected) {
        sound.playMatch();
        player.score++;

        // Blue team (p1, p3) pulls left (-1), Red team (p2, p4) pulls right (+1)
        if (pId === 1 || pId === 3) {
            tugState.ropePos--;
        } else {
            tugState.ropePos++;
        }

        const seed = levelSeeds[tugState.currentGrade] || levelSeeds[2];
        player.currentPair = seed.generatePair();
        updatePlayerQuestionUI(pId);
        updateRopeUI();

        if (tugState.ropePos <= -4 || tugState.ropePos >= 4) {
            showTugWin();
        }
    } else {
        sound.playError();
        const input = document.getElementById(`tug-p${pId}-input`);
        if (input) input.value = '';
    }
}

function updateRopeUI() {
    const flag = document.getElementById('tug-rope-flag');
    if (!flag) return;

    // ropePos is between -4 and +4
    const pct = 50 + (tugState.ropePos / 4) * 40; // 10% to 90%
    flag.style.left = `${pct}%`;
}

function showTugWin() {
    sound.playWin();
    const title = document.getElementById('tug-winner-title');
    const text = document.getElementById('tug-winner-text');

    if (tugState.ropePos <= -4) {
        if (title) title.textContent = "A Kék Csapat Nyert!";
        if (text) text.textContent = "Sikeresen áthúztátok a kötelet!";
    } else {
        if (title) title.textContent = "A Piros Csapat Nyert!";
        if (text) text.textContent = "Sikeresen áthúztátok a kötelet!";
    }

    switchScreen('tug-win-screen');
}
