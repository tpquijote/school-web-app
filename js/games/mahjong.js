// js/games/mahjong.js

import { sound } from '../core/audio.js';
import { levelSeeds, gameLayout } from '../core/levels.js';
import { generateUniquePairs, switchScreen } from '../core/utils.js';

let gameState = {
    tiles: [],
    selectedTile: null,
    pairsLeft: 0,
    currentGrade: 2
};

export function initMahjongGame(grade = 2) {
    gameState.currentGrade = grade;
    gameState.selectedTile = null;

    const seed = levelSeeds[grade] || levelSeeds[2];
    const totalTiles = gameLayout.length; // 52
    const numPairs = totalTiles / 2; // 26

    const generatedPairs = generateUniquePairs(seed, numPairs);

    const tileValues = [];
    generatedPairs.forEach(p => {
        tileValues.push({ val: p.value, text: p.texts[0] });
        tileValues.push({ val: p.value, text: p.texts[1] });
    });

    // Shuffle tile values
    for (let i = tileValues.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tileValues[i], tileValues[j]] = [tileValues[j], tileValues[i]];
    }

    gameState.tiles = gameLayout.map((pos, idx) => ({
        id: idx,
        l: pos.l,
        r: pos.r,
        c: pos.c,
        val: tileValues[idx].val,
        text: tileValues[idx].text,
        isFree: false,
        isRemoved: false
    }));

    gameState.pairsLeft = numPairs;
    updateFreeStatus();

    const gradeDisplay = document.getElementById('grade-display');
    if (gradeDisplay) gradeDisplay.textContent = seed.name;

    const pairsLeftDisplay = document.getElementById('pairs-left');
    if (pairsLeftDisplay) pairsLeftDisplay.textContent = gameState.pairsLeft;

    renderBoard();
    switchScreen('game-screen');
}

function updateFreeStatus() {
    gameState.tiles.forEach(t => {
        if (t.isRemoved) {
            t.isFree = false;
            return;
        }

        const hasAbove = gameState.tiles.some(other =>
            !other.isRemoved &&
            other.l === t.l + 1 &&
            other.r === t.r &&
            other.c === t.c
        );

        if (hasAbove) {
            t.isFree = false;
            return;
        }

        const hasLeft = gameState.tiles.some(other =>
            !other.isRemoved &&
            other.l === t.l &&
            other.r === t.r &&
            other.c === t.c - 1
        );

        const hasRight = gameState.tiles.some(other =>
            !other.isRemoved &&
            other.l === t.l &&
            other.r === t.r &&
            other.c === t.c + 1
        );

        t.isFree = !(hasLeft && hasRight);
    });
}

function renderBoard() {
    const board = document.getElementById('game-board');
    if (!board) return;

    board.innerHTML = '';

    const layerOffsets = [
        { x: 0, y: 0 },
        { x: -6, y: -6 },
        { x: -12, y: -12 }
    ];

    let maxRight = 0;
    let maxBottom = 0;

    gameState.tiles.forEach(t => {
        if (t.isRemoved) return;

        const offset = layerOffsets[t.l] || { x: 0, y: 0 };
        const left = t.c * 82 + offset.x;
        const top = t.r * 102 + offset.y;

        if (left + 90 > maxRight) maxRight = left + 90;
        if (top + 110 > maxBottom) maxBottom = top + 110;

        const tileElem = document.createElement('div');
        tileElem.className = 'tile';
        if (t.isFree) tileElem.classList.add('free');
        if (gameState.selectedTile && gameState.selectedTile.id === t.id) {
            tileElem.classList.add('selected');
        }

        tileElem.style.left = `${left}px`;
        tileElem.style.top = `${top}px`;
        tileElem.style.zIndex = t.l * 10 + t.r;

        tileElem.textContent = t.text;

        tileElem.addEventListener('click', () => onTileClick(t));
        board.appendChild(tileElem);
    });

    board.style.width = `${maxRight || 500}px`;
    board.style.height = `${maxBottom || 600}px`;
}

function onTileClick(tile) {
    if (!tile.isFree || tile.isRemoved) return;

    sound.playSelect();

    if (!gameState.selectedTile) {
        gameState.selectedTile = tile;
        renderBoard();
        return;
    }

    if (gameState.selectedTile.id === tile.id) {
        gameState.selectedTile = null;
        renderBoard();
        return;
    }

    if (gameState.selectedTile.val === tile.val) {
        handleMatch(gameState.selectedTile, tile);
    } else {
        handleWrongMatch(gameState.selectedTile, tile);
    }
}

function handleMatch(t1, t2) {
    sound.playMatch();
    t1.isRemoved = true;
    t2.isRemoved = true;
    gameState.selectedTile = null;
    gameState.pairsLeft--;

    const pairsLeftDisplay = document.getElementById('pairs-left');
    if (pairsLeftDisplay) pairsLeftDisplay.textContent = gameState.pairsLeft;

    updateFreeStatus();
    renderBoard();

    if (gameState.pairsLeft === 0) {
        sound.playWin();
        switchScreen('win-screen');
    }
}

function handleWrongMatch(t1, t2) {
    sound.playError();

    const board = document.getElementById('game-board');
    if (board) {
        board.classList.add('shake');
        setTimeout(() => board.classList.remove('shake'), 400);
    }

    gameState.selectedTile = null;
    renderBoard();
}
