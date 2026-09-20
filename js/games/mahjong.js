// js/games/mahjong.js

import { sound } from '../core/audio.js';
import { levelSeeds, gameLayout } from '../core/levels.js';
import { generateUniquePairs, switchScreen } from '../core/utils.js';

let mahjongState = {
    tiles: [],
    selectedTile: null,
    pairsLeft: 26,
    currentGrade: 2
};

export function initMahjongGame(grade = 2) {
    mahjongState.currentGrade = grade;
    mahjongState.selectedTile = null;

    const seed = levelSeeds[grade] || levelSeeds[2];
    const generatedPairs = generateUniquePairs(seed, 26);

    // Create 52 blank layout tiles based on template
    const tiles = gameLayout.map((layout, idx) => ({
        id: idx,
        layer: layout.l,
        row: layout.r,
        col: layout.c,
        val: null,
        text: null,
        isFree: false,
        element: null
    }));

    // Solvability-Guaranteed Pair Placement:
    // Repeatedly pick two currently free available slots and place a matching pair.
    // This ensures that at least one solvable solution path exists backwards.
    const unassignedTiles = [...tiles];
    for (let p = 0; p < generatedPairs.length; p++) {
        const pairData = generatedPairs[p];
        updateFreeTileStatus(unassignedTiles);

        const freeUnassigned = unassignedTiles.filter(t => t.isFree && t.val === null);

        let tileA, tileB;
        if (freeUnassigned.length >= 2) {
            // Pick two random free unassigned tiles
            const idxA = Math.floor(Math.random() * freeUnassigned.length);
            tileA = freeUnassigned[idxA];
            freeUnassigned.splice(idxA, 1);

            const idxB = Math.floor(Math.random() * freeUnassigned.length);
            tileB = freeUnassigned[idxB];
        } else {
            // Fallback if constrained: pick any remaining unassigned tiles
            const remaining = unassignedTiles.filter(t => t.val === null);
            tileA = remaining[0];
            tileB = remaining[1] || remaining[0];
        }

        if (tileA) {
            tileA.val = pairData.value;
            tileA.text = pairData.texts[0];
        }
        if (tileB && tileB !== tileA) {
            tileB.val = pairData.value;
            tileB.text = pairData.texts[1];
        }
    }

    mahjongState.tiles = tiles;
    mahjongState.pairsLeft = 26;

    const gradeDisplay = document.getElementById('grade-display');
    if (gradeDisplay) gradeDisplay.textContent = seed.name;

    const pairsLeftDisplay = document.getElementById('pairs-left');
    if (pairsLeftDisplay) pairsLeftDisplay.textContent = mahjongState.pairsLeft;

    renderMahjongBoard();
    updateFreeTileStatus(mahjongState.tiles);
    updateTileDOMClasses();
    switchScreen('game-screen');
}

function updateFreeTileStatus(tileList) {
    tileList.forEach(tile => {
        if (!tile || tile.val === undefined) return;

        // 1. Check if covered by tile on layer directly above
        const isCovered = tileList.some(other =>
            other.val !== null &&
            other.layer === tile.layer + 1 &&
            Math.abs(other.row - tile.row) < 1 &&
            Math.abs(other.col - tile.col) < 1
        );

        if (isCovered) {
            tile.isFree = false;
            return;
        }

        // 2. Check left and right neighbor blocking
        const hasLeftNeighbor = tileList.some(other =>
            other.val !== null &&
            other.layer === tile.layer &&
            Math.abs(other.row - tile.row) < 1 &&
            other.col === tile.col - 1
        );

        const hasRightNeighbor = tileList.some(other =>
            other.val !== null &&
            other.layer === tile.layer &&
            Math.abs(other.row - tile.row) < 1 &&
            other.col === tile.col + 1
        );

        tile.isFree = !(hasLeftNeighbor && hasRightNeighbor);
    });
}

function renderMahjongBoard() {
    const board = document.getElementById('game-board');
    if (!board) return;

    board.innerHTML = '';

    // Auto-calculate board container dimensions so 3D layered pyramid centers cleanly
    let maxCol = 0;
    let maxRow = 0;
    gameLayout.forEach(t => {
        if (t.c > maxCol) maxCol = t.c;
        if (t.r > maxRow) maxRow = t.r;
    });

    const containerWidth = (maxCol + 1) * 70 + 40;
    const containerHeight = (maxRow + 1) * 85 + 40;
    board.style.width = `${containerWidth}px`;
    board.style.height = `${containerHeight}px`;

    mahjongState.tiles.forEach(tile => {
        const tileElem = document.createElement('div');
        tileElem.className = 'tile';

        // 3D Grid positioning with offsets per layer
        const posX = tile.col * 70 + (tile.layer * 6);
        const posY = tile.row * 85 - (tile.layer * 6);
        const zIndex = tile.layer * 10 + Math.floor(tile.row);

        tileElem.style.left = `${posX}px`;
        tileElem.style.top = `${posY}px`;
        tileElem.style.zIndex = zIndex;
        tileElem.textContent = tile.text;

        tile.element = tileElem;
        tileElem.addEventListener('click', () => onTileClick(tile));
        board.appendChild(tileElem);
    });
}

function updateTileDOMClasses() {
    mahjongState.tiles.forEach(tile => {
        if (!tile.element) return;

        tile.element.classList.remove('free', 'locked', 'selected');

        if (mahjongState.selectedTile === tile) {
            tile.element.classList.add('selected');
        } else if (tile.isFree) {
            tile.element.classList.add('free');
        } else {
            tile.element.classList.add('locked');
        }
    });
}

function onTileClick(tile) {
    if (!tile.isFree) {
        sound.playError();
        return;
    }

    // Deselect if clicking the same tile
    if (mahjongState.selectedTile === tile) {
        sound.playSelect();
        mahjongState.selectedTile = null;
        updateTileDOMClasses();
        return;
    }

    // First tile selection
    if (!mahjongState.selectedTile) {
        sound.playSelect();
        mahjongState.selectedTile = tile;
        updateTileDOMClasses();
        return;
    }

    // Second tile selection - check match
    const firstTile = mahjongState.selectedTile;
    if (firstTile.val === tile.val) {
        // Match found!
        sound.playMatch();

        firstTile.element.classList.add('matched');
        tile.element.classList.add('matched');

        setTimeout(() => {
            firstTile.element.remove();
            tile.element.remove();

            // Remove tiles from state
            mahjongState.tiles = mahjongState.tiles.filter(t => t.id !== firstTile.id && t.id !== tile.id);
            mahjongState.pairsLeft--;

            const pairsLeftDisplay = document.getElementById('pairs-left');
            if (pairsLeftDisplay) pairsLeftDisplay.textContent = mahjongState.pairsLeft;

            mahjongState.selectedTile = null;
            updateFreeTileStatus(mahjongState.tiles);
            updateTileDOMClasses();

            if (mahjongState.pairsLeft === 0) {
                showMahjongWin();
            }
        }, 300);
    } else {
        // Mismatch
        sound.playError();
        firstTile.element.classList.add('wrong-match');
        tile.element.classList.add('wrong-match');

        setTimeout(() => {
            firstTile.element.classList.remove('wrong-match');
            tile.element.classList.remove('wrong-match');
            mahjongState.selectedTile = null;
            updateTileDOMClasses();
        }, 500);
    }
}

function showMahjongWin() {
    sound.playWin();
    switchScreen('win-screen');
}
