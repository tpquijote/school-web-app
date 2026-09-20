// js/games/balloon.js - Math Balloon Popping Game

import { sound } from '../core/audio.js';
import { levelSeeds, getRandomInt } from '../core/levels.js';
import { switchScreen } from '../core/utils.js';

export const balloonSettings = {
    mode: 'standard', // 'standard', 'reversed', or 'mixed'
    targetPops: 10,
    maxLives: 3,
    spawnIntervalMs: 2000,
    speedSeconds: 7.0
};

let gameState = {
    score: 0,
    lives: 3,
    currentGrade: 2,
    activeTarget: null, // { questionText, targetValue, correctBalloonText, isReversed }
    spawnTimer: null,
    balloons: [], // active DOM elements or tracking objects
    isRunning: false
};

const BALLOON_COLORS = [
    '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9f1c',
    '#a29bfe', '#00b4d8', '#1dd1a1', '#fd79a8'
];

/**
 * Extracts target value and display question string from a generated pair.
 * @param {Object} pair Level pair with value and texts array
 * @param {boolean} isReversed If true, question shows target value and balloons show expressions
 */
export function createTargetFromPair(pair, isReversed = false) {
    if (!pair || !pair.texts) return null;

    // Find expression text (contains arithmetic operators)
    const exprText = pair.texts.find(t => /[+\-×÷*\/]/.test(t)) || pair.texts[0];
    const numberText = pair.value.toString();

    if (isReversed) {
        return {
            questionText: numberText,
            targetValue: pair.value,
            correctBalloonText: exprText,
            isReversed: true
        };
    } else {
        return {
            questionText: exprText,
            targetValue: pair.value,
            correctBalloonText: numberText,
            isReversed: false
        };
    }
}

/**
 * Generates wrong balloon options that are distinct from correct answer
 */
export function generateWrongBalloonOptions(targetVal, isReversed, count = 3, grade = 2) {
    const options = [];
    const seed = levelSeeds[grade] || levelSeeds[2];

    let attempts = 0;
    while (options.length < count && attempts < 50) {
        attempts++;
        if (isReversed) {
            const wrongPair = seed.generatePair();
            if (wrongPair.value !== targetVal) {
                const expr = wrongPair.texts.find(t => /[+\-×÷*\/]/.test(t)) || wrongPair.texts[0];
                if (!options.includes(expr)) {
                    options.push(expr);
                }
            }
        } else {
            const offset = getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
            let wrongVal = targetVal + offset;
            if (wrongVal < 0) wrongVal = targetVal + getRandomInt(1, 6);
            if (wrongVal !== targetVal && !options.includes(wrongVal.toString())) {
                options.push(wrongVal.toString());
            }
        }
    }
    return options;
}

export function startBalloonGame(grade = 2) {
    stopBalloonGame();

    gameState.currentGrade = grade;
    gameState.score = 0;
    gameState.lives = balloonSettings.maxLives;
    gameState.isRunning = true;
    gameState.balloons = [];

    updateBalloonUI();
    nextQuestion();

    switchScreen('balloon-screen');

    // Start continuous balloon spawning timer
    gameState.spawnTimer = setInterval(() => {
        if (gameState.isRunning) {
            spawnBalloon();
        }
    }, balloonSettings.spawnIntervalMs);
}

export function stopBalloonGame() {
    gameState.isRunning = false;
    if (gameState.spawnTimer) {
        clearInterval(gameState.spawnTimer);
        gameState.spawnTimer = null;
    }

    // Clear balloon DOM elements
    const container = document.getElementById('balloon-container');
    if (container) {
        container.innerHTML = '';
    }
    gameState.balloons = [];
}

function nextQuestion() {
    const seed = levelSeeds[gameState.currentGrade] || levelSeeds[2];
    const pair = seed.generatePair();

    let isReversed = false;
    if (balloonSettings.mode === 'reversed') {
        isReversed = true;
    } else if (balloonSettings.mode === 'mixed') {
        isReversed = Math.random() < 0.5;
    }

    gameState.activeTarget = createTargetFromPair(pair, isReversed);

    const targetTextElem = document.getElementById('balloon-target-text');
    if (targetTextElem) {
        targetTextElem.textContent = gameState.activeTarget.questionText;
    }

    // Spawn initial set of balloons for immediate gameplay
    spawnInitialBalloons();
}

function spawnInitialBalloons() {
    const container = document.getElementById('balloon-container');
    if (container) container.innerHTML = '';

    // Spawn 1 correct balloon + 3 wrong balloons
    spawnBalloon(true);
    for (let i = 0; i < 3; i++) {
        spawnBalloon(false);
    }
}

function spawnBalloon(forceCorrect = null) {
    if (!gameState.isRunning || !gameState.activeTarget) return;

    const container = document.getElementById('balloon-container');
    if (!container) return;

    let isCorrect = forceCorrect;
    if (isCorrect === null) {
        // Ensure at least one correct balloon is active
        const hasCorrectActive = gameState.balloons.some(b => b.isCorrect && b.element.parentNode);
        isCorrect = !hasCorrectActive || Math.random() < 0.35;
    }

    let balloonText = '';
    if (isCorrect) {
        balloonText = gameState.activeTarget.correctBalloonText;
    } else {
        const wrongOpts = generateWrongBalloonOptions(
            gameState.activeTarget.targetValue,
            gameState.activeTarget.isReversed,
            1,
            gameState.currentGrade
        );
        balloonText = wrongOpts[0] || (gameState.activeTarget.targetValue + 1).toString();
    }

    const balloonElem = document.createElement('div');
    balloonElem.className = 'floating-balloon';

    // Random position across width safely inside viewport (8% to 80%)
    const posX = getRandomInt(8, 80);
    balloonElem.style.left = `${posX}%`;

    // Random color
    const color = BALLOON_COLORS[getRandomInt(0, BALLOON_COLORS.length - 1)];
    balloonElem.style.setProperty('--balloon-color', color);

    // Random speed variation
    const duration = balloonSettings.speedSeconds + (Math.random() * 2 - 1);
    balloonElem.style.animationDuration = `${duration}s`;

    // Font sizing based on text length
    let fontSizeClass = '';
    if (balloonText.length > 6) fontSizeClass = 'small-text';
    else if (balloonText.length > 4) fontSizeClass = 'medium-text';

    balloonElem.innerHTML = `
        <div class="balloon-body">
            <span class="balloon-text ${fontSizeClass}">${balloonText}</span>
        </div>
        <div class="balloon-string"></div>
    `;

    const balloonObj = {
        element: balloonElem,
        text: balloonText,
        isCorrect: isCorrect
    };

    balloonElem.addEventListener('click', (e) => {
        e.stopPropagation();
        handleBalloonClick(balloonObj);
    });

    // Remove element when animation ends (reached top)
    balloonElem.addEventListener('animationend', () => {
        if (balloonElem.parentNode) {
            balloonElem.parentNode.removeChild(balloonElem);
        }
        gameState.balloons = gameState.balloons.filter(b => b.element !== balloonElem);
    });

    container.appendChild(balloonElem);
    gameState.balloons.push(balloonObj);
}

function handleBalloonClick(balloonObj) {
    if (!gameState.isRunning || !balloonObj || !balloonObj.element.parentNode) return;

    const elem = balloonObj.element;

    if (balloonObj.isCorrect) {
        sound.playMatch();
        popBalloonAnim(elem, true);

        gameState.score++;
        updateBalloonUI();

        if (gameState.score >= balloonSettings.targetPops) {
            showBalloonWin();
        } else {
            nextQuestion();
        }
    } else {
        sound.playError();
        popBalloonAnim(elem, false);

        // Deduct 1 life for popping the wrong balloon
        gameState.lives--;
        updateBalloonUI();

        if (gameState.lives <= 0) {
            showBalloonGameOver();
        }
    }

    // Remove from active list
    gameState.balloons = gameState.balloons.filter(b => b.element !== elem);
}

function popBalloonAnim(element, isCorrect) {
    element.style.animationPlayState = 'paused';
    element.classList.add(isCorrect ? 'pop-correct' : 'pop-wrong');
    setTimeout(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }, 400);
}

function updateBalloonUI() {
    const scoreElem = document.getElementById('balloon-score');
    if (scoreElem) {
        scoreElem.textContent = `${gameState.score} / ${balloonSettings.targetPops}`;
    }

    const livesElem = document.getElementById('balloon-lives');
    if (livesElem) {
        let heartsHTML = '';
        for (let i = 0; i < balloonSettings.maxLives; i++) {
            if (i < gameState.lives) {
                heartsHTML += '<span class="heart">❤️</span>';
            } else {
                heartsHTML += '<span class="heart lost">🖤</span>';
            }
        }
        livesElem.innerHTML = heartsHTML;
    }
}

function showBalloonWin() {
    stopBalloonGame();
    sound.playWin();
    switchScreen('balloon-win-screen');
}

function showBalloonGameOver() {
    stopBalloonGame();
    sound.playError();
    switchScreen('balloon-gameover-screen');
}
