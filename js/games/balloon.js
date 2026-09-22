// js/games/balloon.js - Floating Balloon Game ("Lufi")

import { sound } from '../core/audio.js';
import { levelSeeds, grade2Settings } from '../core/levels.js';
import { generateUniquePairs, switchScreen } from '../core/utils.js';

let balloonState = {
    currentGrade: 2,
    targetValue: null,
    targetText: '',
    correctAnswer: '',
    score: 0,
    targetScore: 10,
    balloons: [],
    animationFrameId: null,
    direction: 'up', // 'up' or 'down'
    isReverse: false // false: equation at top, balloons have numbers; true: number at top, balloons have equations
};

export function startBalloonGame(grade = 2) {
    balloonState.currentGrade = grade;
    balloonState.score = 0;
    balloonState.targetScore = 10;
    balloonState.direction = grade2Settings.balloonDirection || 'up';
    balloonState.isReverse = grade2Settings.balloonReverse || false;

    updateScoreUI();
    spawnNextTarget();
    switchScreen('balloon-screen');
    startBalloonLoop();
}

export function stopBalloonGame() {
    if (balloonState.animationFrameId) {
        cancelAnimationFrame(balloonState.animationFrameId);
        balloonState.animationFrameId = null;
    }
    clearBalloons();
}

function clearBalloons() {
    const container = document.getElementById('balloon-arena');
    if (container) container.innerHTML = '';
    balloonState.balloons = [];
}

function spawnNextTarget() {
    const seed = levelSeeds[balloonState.currentGrade] || levelSeeds[2];
    const pair = seed.generatePair();

    if (!balloonState.isReverse) {
        // Standard: Top shows equation, balloons show candidates
        balloonState.targetText = pair.texts[0].includes('+') || pair.texts[0].includes('-') || pair.texts[0].includes('×') || pair.texts[0].includes('÷') || pair.texts[0].includes('*') || pair.texts[0].includes('/')
            ? pair.texts[0]
            : pair.texts[1];
        balloonState.correctAnswer = pair.value.toString();
    } else {
        // Reverse: Top shows target value, balloons show equations
        balloonState.targetText = pair.value.toString();
        balloonState.correctAnswer = pair.texts[0].includes('+') || pair.texts[0].includes('-') || pair.texts[0].includes('×') || pair.texts[0].includes('÷') || pair.texts[0].includes('*') || pair.texts[0].includes('/')
            ? pair.texts[0]
            : pair.texts[1];
    }

    const targetElem = document.getElementById('balloon-target-display');
    if (targetElem) targetElem.textContent = `${balloonState.targetText} = ?`;

    clearBalloons();
    spawnBalloonWave();
}

function spawnBalloonWave() {
    const container = document.getElementById('balloon-arena');
    if (!container) return;

    const seed = levelSeeds[balloonState.currentGrade] || levelSeeds[2];
    const candidateTexts = [balloonState.correctAnswer];

    // Generate 3 distractor values
    while (candidateTexts.length < 4) {
        const fakePair = seed.generatePair();
        const fakeVal = balloonState.isReverse
            ? (fakePair.texts[0].includes('+') || fakePair.texts[0].includes('-') ? fakePair.texts[0] : fakePair.texts[1])
            : fakePair.value.toString();

        if (!candidateTexts.includes(fakeVal)) {
            candidateTexts.push(fakeVal);
        }
    }

    // Shuffle options
    candidateTexts.sort(() => Math.random() - 0.5);

    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#1dd1a1', '#a29bfe', '#fdcb6e'];
    const arenaWidth = container.clientWidth || 800;
    const arenaHeight = container.clientHeight || 500;

    candidateTexts.forEach((text, i) => {
        const balloonElem = document.createElement('div');
        balloonElem.className = 'floating-balloon';
        balloonElem.style.background = colors[i % colors.length];
        balloonElem.textContent = text;

        const posX = 50 + (i * (arenaWidth - 120) / 4) + Math.random() * 20;
        const startY = balloonState.direction === 'up' ? arenaHeight + 80 : -100;
        const speed = 1.2 + Math.random() * 0.8;

        const balloonObj = {
            element: balloonElem,
            text: text,
            x: posX,
            y: startY,
            speed: speed,
            isCorrect: text === balloonState.correctAnswer
        };

        balloonElem.style.left = `${balloonObj.x}px`;
        balloonElem.style.top = `${balloonObj.y}px`;

        balloonElem.addEventListener('click', () => onBalloonClick(balloonObj));
        container.appendChild(balloonElem);
        balloonState.balloons.push(balloonObj);
    });
}

function startBalloonLoop() {
    stopBalloonGame();

    const container = document.getElementById('balloon-arena');
    const arenaHeight = container ? container.clientHeight || 500 : 500;

    function loop() {
        balloonState.balloons.forEach(b => {
            if (balloonState.direction === 'up') {
                b.y -= b.speed;
                if (b.y < -120) {
                    b.y = arenaHeight + 80; // Loop back
                }
            } else {
                b.y += b.speed;
                if (b.y > arenaHeight + 120) {
                    b.y = -100; // Loop back
                }
            }
            b.element.style.top = `${b.y}px`;
        });

        balloonState.animationFrameId = requestAnimationFrame(loop);
    }

    balloonState.animationFrameId = requestAnimationFrame(loop);
}

function onBalloonClick(balloon) {
    if (balloon.isCorrect) {
        sound.playMatch();
        popAnimation(balloon.element);

        balloonState.score++;
        updateScoreUI();

        if (balloonState.score >= balloonState.targetScore) {
            stopBalloonGame();
            sound.playWin();
            switchScreen('balloon-win-screen');
        } else {
            setTimeout(() => {
                spawnNextTarget();
            }, 400);
        }
    } else {
        sound.playError();
        balloon.element.classList.add('wrong-pop');
        setTimeout(() => balloon.element.classList.remove('wrong-pop'), 400);
    }
}

function popAnimation(elem) {
    elem.style.transform = 'scale(1.5)';
    elem.style.opacity = '0';
    elem.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
}

function updateScoreUI() {
    const scoreElem = document.getElementById('balloon-score');
    if (scoreElem) scoreElem.textContent = `${balloonState.score} / ${balloonState.targetScore}`;
}
