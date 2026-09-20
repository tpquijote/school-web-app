// js/game.js - Main Application Entry Point & Event Controller

import { grade2Settings } from './core/levels.js';
import { switchScreen } from './core/utils.js';
import { initMahjongGame } from './games/mahjong.js';
import { startDuel } from './games/duel.js';
import { startConquest, passConquestTurn, stopConquestTimer } from './games/conquest.js';
import { startRace, rollRaceDice } from './games/race.js';
import { startTug } from './games/tug.js';
import { startCarRace } from './games/carrace.js';

let selectedMode = 'mahjong';
let selectedGrade = 2;

document.addEventListener('DOMContentLoaded', () => {
    // Grade Selection Buttons
    document.querySelectorAll('.grade-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const grade = parseInt(e.currentTarget.getAttribute('data-grade'), 10);
            if (grade) {
                selectedGrade = grade;
                document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            }
        });
    });

    // Main Menu Buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectedMode = e.currentTarget.getAttribute('data-mode');
            
            // Show mode-specific settings
            const mahjongGroup = document.getElementById('mahjong-options-group');
            const memoryGroup = document.getElementById('memory-time-group');
            const conquestGroup = document.getElementById('conquest-options-group');
            const raceGroup = document.getElementById('race-options-group');
            const tugGroup = document.getElementById('tug-options-group');
            const carGroup = document.getElementById('car-race-options-group');
            
            if (mahjongGroup) mahjongGroup.style.display = selectedMode === 'mahjong' ? 'block' : 'none';
            if (memoryGroup) memoryGroup.style.display = selectedMode === 'duel' ? 'block' : 'none';
            if (conquestGroup) conquestGroup.style.display = selectedMode === 'conquest' ? 'block' : 'none';
            if (raceGroup) raceGroup.style.display = selectedMode === 'race' ? 'block' : 'none';
            if (tugGroup) tugGroup.style.display = selectedMode === 'tug' ? 'block' : 'none';
            if (carGroup) carGroup.style.display = selectedMode === 'carRace' ? 'block' : 'none';
            
            switchScreen('settings-screen');
        });
    });

    // Settings Controls
    const mahjongTileSlider = document.getElementById('mahjong-tile-slider');
    const mahjongTileVal = document.getElementById('mahjong-tile-val');
    const mahjongPairVal = document.getElementById('mahjong-pair-val');
    if (mahjongTileSlider) {
        mahjongTileSlider.addEventListener('input', (e) => {
            const tiles = parseInt(e.target.value, 10);
            const pairs = Math.floor(tiles / 2);
            grade2Settings.mahjongPairs = pairs;
            if (mahjongTileVal) mahjongTileVal.textContent = tiles;
            if (mahjongPairVal) mahjongPairVal.textContent = pairs;
        });
    }

    const limitSlider = document.getElementById('limit-slider');
    const limitVal = document.getElementById('limit-val');
    if (limitSlider) {
        limitSlider.addEventListener('input', (e) => {
            grade2Settings.limit = parseInt(e.target.value, 10);
            if (limitVal) limitVal.textContent = grade2Settings.limit;
        });
    }

    document.querySelectorAll('.op-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('active');
            
            const activeOps = [];
            document.querySelectorAll('.op-toggle-btn.active').forEach(b => {
                activeOps.push(b.getAttribute('data-op'));
            });
            grade2Settings.ops = activeOps;
        });
    });

    const memorySlider = document.getElementById('memory-time-slider');
    const memoryVal = document.getElementById('memory-time-val');
    if (memorySlider) {
        memorySlider.addEventListener('input', (e) => {
            grade2Settings.memoryTime = parseFloat(e.target.value);
            if (memoryVal) memoryVal.textContent = grade2Settings.memoryTime.toFixed(1);
        });
    }

    const conquestEnable = document.getElementById('conquest-timer-enable');
    const conquestSliderContainer = document.getElementById('conquest-timer-slider-container');
    if (conquestEnable) {
        conquestEnable.addEventListener('change', (e) => {
            grade2Settings.conquestTimerEnabled = e.target.checked;
            if (conquestSliderContainer) {
                conquestSliderContainer.style.display = e.target.checked ? 'block' : 'none';
            }
        });
    }

    const conquestSlider = document.getElementById('conquest-timer-slider');
    const conquestVal = document.getElementById('conquest-timer-val');
    if (conquestSlider) {
        conquestSlider.addEventListener('input', (e) => {
            grade2Settings.conquestTimerLimit = parseInt(e.target.value, 10);
            if (conquestVal) conquestVal.textContent = grade2Settings.conquestTimerLimit;
        });
    }

    // Tug & Car Race Player Count Selectors
    let selectedTugPlayers = 2;
    document.querySelectorAll('.tug-player-count-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tug-player-count-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            selectedTugPlayers = parseInt(e.currentTarget.getAttribute('data-count'), 10);
        });
    });

    let selectedCarPlayers = 2;
    document.querySelectorAll('.player-count-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.player-count-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            selectedCarPlayers = parseInt(e.currentTarget.getAttribute('data-count'), 10);
        });
    });

    // Start Game Button
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            if (selectedMode === 'mahjong') initMahjongGame(selectedGrade);
            else if (selectedMode === 'duel') startDuel(selectedGrade);
            else if (selectedMode === 'conquest') startConquest(selectedGrade);
            else if (selectedMode === 'race') startRace(selectedGrade);
            else if (selectedMode === 'tug') startTug(selectedGrade, selectedTugPlayers);
            else if (selectedMode === 'carRace') startCarRace(selectedGrade, selectedCarPlayers);
        });
    }

    // Back Buttons
    const backMenuButtons = [
        'settings-back-btn', 'back-btn', 'duel-back-btn', 'conquest-back-btn',
        'race-back-btn', 'tug-back-btn', 'car-race-back-btn',
        'win-back-to-menu-btn', 'duel-win-back-to-menu-btn', 'conquest-win-back-to-menu-btn',
        'race-win-back-to-menu-btn', 'tug-win-back-to-menu-btn', 'car-race-win-back-to-menu-btn'
    ];
    backMenuButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.addEventListener('click', () => {
            stopConquestTimer();
            switchScreen('main-menu');
        });
    });

    // Play Again Buttons
    document.getElementById('play-again-btn')?.addEventListener('click', () => initMahjongGame(selectedGrade));
    document.getElementById('duel-play-again-btn')?.addEventListener('click', () => startDuel(selectedGrade));
    document.getElementById('conquest-play-again-btn')?.addEventListener('click', () => startConquest(selectedGrade));
    document.getElementById('race-play-again-btn')?.addEventListener('click', () => startRace(selectedGrade));
    document.getElementById('tug-play-again-btn')?.addEventListener('click', () => startTug(selectedGrade, selectedTugPlayers));
    document.getElementById('car-race-play-again-btn')?.addEventListener('click', () => startCarRace(selectedGrade, selectedCarPlayers));

    // Special Game Buttons
    document.getElementById('conquest-pass-btn')?.addEventListener('click', passConquestTurn);
    document.getElementById('race-roll-btn')?.addEventListener('click', rollRaceDice);
});
