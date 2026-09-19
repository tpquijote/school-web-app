// js/games/duel.js

import { sound } from '../core/audio.js';
import { levelSeeds, grade2Settings } from '../core/levels.js';
import { generateUniquePairs, switchScreen } from '../core/utils.js';

let duelState = {
    cards: [],
    flippedCards: [],
    scores: { 1: 0, 2: 0 },
    currentPlayer: 1,
    isProcessing: false,
    pairsLeft: 18,
    currentGrade: 2
};

export function startDuel(grade = 2) {
    duelState.currentGrade = grade;
    duelState.scores = { 1: 0, 2: 0 };
    duelState.currentPlayer = 1;
    duelState.isProcessing = false;
    duelState.flippedCards = [];

    const seed = levelSeeds[grade] || levelSeeds[2];
    const numPairs = 18;
    const generatedPairs = generateUniquePairs(seed, numPairs);

    const cardList = [];
    generatedPairs.forEach((pair, pairIdx) => {
        cardList.push({ pairId: pairIdx, val: pair.value, text: pair.texts[0], isFlipped: false, capturedBy: null });
        cardList.push({ pairId: pairIdx, val: pair.value, text: pair.texts[1], isFlipped: false, capturedBy: null });
    });

    // Shuffle
    for (let i = cardList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardList[i], cardList[j]] = [cardList[j], cardList[i]];
    }

    duelState.cards = cardList.map((c, idx) => ({ ...c, id: idx }));
    duelState.pairsLeft = numPairs;

    const p1Score = document.getElementById('player1-score');
    const p2Score = document.getElementById('player2-score');
    if (p1Score) p1Score.textContent = '0';
    if (p2Score) p2Score.textContent = '0';

    const gradeDisplay = document.getElementById('duel-grade-display');
    if (gradeDisplay) gradeDisplay.textContent = seed.name;

    const pairsLeftDisplay = document.getElementById('duel-pairs-left');
    if (pairsLeftDisplay) pairsLeftDisplay.textContent = `Párok: ${duelState.pairsLeft}`;

    updateDuelTurnDisplay();
    renderDuelBoard();
    switchScreen('duel-screen');
}

function updateDuelTurnDisplay() {
    const turnDisplay = document.getElementById('duel-turn-display');
    const p1Card = document.getElementById('player1-card');
    const p2Card = document.getElementById('player2-card');

    if (duelState.currentPlayer === 1) {
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

function renderDuelBoard() {
    const board = document.getElementById('duel-board');
    if (!board) return;

    board.innerHTML = '';
    duelState.cards.forEach(card => {
        const cardElem = document.createElement('div');
        cardElem.className = 'card';
        if (card.isFlipped) cardElem.classList.add('flipped');
        if (card.capturedBy !== null) {
            cardElem.classList.add('captured');
            cardElem.classList.add(card.capturedBy === 1 ? 'p1-captured' : 'p2-captured');
        }

        cardElem.innerHTML = `
            <div class="card-inner">
                <div class="card-back">?</div>
                <div class="card-front">${card.text}</div>
            </div>
        `;

        cardElem.addEventListener('click', () => onCardClick(card));
        board.appendChild(cardElem);
    });
}

function onCardClick(card) {
    if (duelState.isProcessing || card.isFlipped || card.capturedBy !== null) return;

    sound.playSelect();
    card.isFlipped = true;
    duelState.flippedCards.push(card);
    renderDuelBoard();

    if (duelState.flippedCards.length === 2) {
        checkDuelMatch();
    }
}

function checkDuelMatch() {
    duelState.isProcessing = true;
    const [c1, c2] = duelState.flippedCards;

    if (c1.val === c2.val) {
        sound.playMatch();
        c1.capturedBy = duelState.currentPlayer;
        c2.capturedBy = duelState.currentPlayer;
        duelState.scores[duelState.currentPlayer]++;
        duelState.pairsLeft--;

        const p1Score = document.getElementById('player1-score');
        const p2Score = document.getElementById('player2-score');
        if (duelState.currentPlayer === 1 && p1Score) p1Score.textContent = duelState.scores[1];
        if (duelState.currentPlayer === 2 && p2Score) p2Score.textContent = duelState.scores[2];

        const pairsLeftDisplay = document.getElementById('duel-pairs-left');
        if (pairsLeftDisplay) pairsLeftDisplay.textContent = `Párok: ${duelState.pairsLeft}`;

        duelState.flippedCards = [];
        duelState.isProcessing = false;
        renderDuelBoard();

        if (duelState.pairsLeft === 0) {
            showDuelWin();
        }
    } else {
        sound.playError();
        const flipDelay = (grade2Settings.memoryTime || 2.0) * 1000;

        setTimeout(() => {
            c1.isFlipped = false;
            c2.isFlipped = false;
            duelState.flippedCards = [];
            duelState.currentPlayer = duelState.currentPlayer === 1 ? 2 : 1;
            updateDuelTurnDisplay();
            renderDuelBoard();
            duelState.isProcessing = false;
        }, flipDelay);
    }
}

function showDuelWin() {
    sound.playWin();
    const winnerTitle = document.getElementById('duel-winner-title');
    const winnerText = document.getElementById('duel-winner-text');
    const p1Final = document.getElementById('duel-p1-final-score');
    const p2Final = document.getElementById('duel-p2-final-score');

    if (p1Final) p1Final.textContent = duelState.scores[1];
    if (p2Final) p2Final.textContent = duelState.scores[2];

    if (duelState.scores[1] > duelState.scores[2]) {
        if (winnerTitle) winnerTitle.textContent = "Kék Játékos Nyert!";
        if (winnerText) winnerText.textContent = "Gratulálunk a győzelemhez!";
    } else if (duelState.scores[2] > duelState.scores[1]) {
        if (winnerTitle) winnerTitle.textContent = "Piros Játékos Nyert!";
        if (winnerText) winnerText.textContent = "Gratulálunk a győzelemhez!";
    } else {
        if (winnerTitle) winnerTitle.textContent = "Döntetlen!";
        if (winnerText) winnerText.textContent = "Egyenlő pontszámot értetek el!";
    }

    switchScreen('duel-win-screen');
}
