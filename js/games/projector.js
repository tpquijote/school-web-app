// js/games/projector.js - Classroom Projector Mode (20-Operation Presentation Mode)

import { sound } from '../core/audio.js';
import { levelSeeds, grade2Settings } from '../core/levels.js';
import { switchScreen } from '../core/utils.js';

let projectorState = {
    questions: [],
    currentIndex: 0,
    timerInterval: null,
    timeRemaining: 13,
    timerLimit: 13,
    currentGrade: 2
};

export function startProjectorMode(grade = 2) {
    projectorState.currentGrade = grade;
    projectorState.currentIndex = 0;
    projectorState.timerLimit = grade2Settings.projectorTimerLimit || 13;
    projectorState.timeRemaining = projectorState.timerLimit;

    // Generate 20 arithmetic questions
    const seed = levelSeeds[grade] || levelSeeds[2];
    projectorState.questions = [];
    for (let i = 0; i < 20; i++) {
        const pair = seed.generatePair();
        // Equation text and correct answer
        const text = pair.texts[0].includes('+') || pair.texts[0].includes('-') || pair.texts[0].includes('×') || pair.texts[0].includes('÷') || pair.texts[0].includes('*') || pair.texts[0].includes('/')
            ? pair.texts[0]
            : pair.texts[1];
        projectorState.questions.push({
            id: i + 1,
            equation: text,
            answer: pair.value
        });
    }

    renderProjectorScreen();
    switchScreen('projector-screen');
    startQuestionTimer();
}

export function stopProjectorTimer() {
    if (projectorState.timerInterval) {
        clearInterval(projectorState.timerInterval);
        projectorState.timerInterval = null;
    }
}

function startQuestionTimer() {
    stopProjectorTimer();
    projectorState.timeRemaining = projectorState.timerLimit;
    updateAnimalTimerUI();

    projectorState.timerInterval = setInterval(() => {
        projectorState.timeRemaining--;
        updateAnimalTimerUI();

        if (projectorState.timeRemaining <= 0) {
            nextQuestion();
        }
    }, 1000);
}

function nextQuestion() {
    projectorState.currentIndex++;
    if (projectorState.currentIndex >= 20) {
        stopProjectorTimer();
        showProjectorSummaryScreen();
    } else {
        renderProjectorQuestion();
        startQuestionTimer();
    }
}

function renderProjectorScreen() {
    renderProjectorQuestion();
}

function renderProjectorQuestion() {
    const q = projectorState.questions[projectorState.currentIndex];
    const indexDisplay = document.getElementById('projector-q-index');
    const eqDisplay = document.getElementById('projector-equation');

    if (indexDisplay) indexDisplay.textContent = `${q.id} / 20`;
    if (eqDisplay) eqDisplay.textContent = `${q.equation} = ?`;
}

function updateAnimalTimerUI() {
    const frogsContainer = document.getElementById('projector-animal-timer');
    const timerText = document.getElementById('projector-timer-text');

    if (timerText) {
        timerText.textContent = `${projectorState.timeRemaining} mp`;
    }

    if (!frogsContainer) return;

    frogsContainer.innerHTML = '';
    const totalAnimals = projectorState.timerLimit;
    const remainingAnimals = projectorState.timeRemaining;

    // Render frog icons hopping away as time ticks down
    for (let i = 0; i < totalAnimals; i++) {
        const animalSpan = document.createElement('span');
        animalSpan.className = 'animal-icon';
        if (i < remainingAnimals) {
            animalSpan.textContent = '🐸';
            animalSpan.classList.add('active');
        } else {
            animalSpan.textContent = '🌊';
            animalSpan.classList.add('hopped');
        }
        frogsContainer.appendChild(animalSpan);
    }
}

function showProjectorSummaryScreen() {
    sound.playWin();

    const tableBody = document.getElementById('projector-summary-table-body');
    if (tableBody) {
        tableBody.innerHTML = '';
        projectorState.questions.forEach(q => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 10px 20px; font-weight: 700; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1);">${q.id}. ${q.equation} =</td>
                <td style="padding: 10px 20px; font-weight: 900; font-size: 1.4rem; color: #ffe66d; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">${q.answer}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    switchScreen('projector-win-screen');
}
