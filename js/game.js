// js/game.js - Main Application Entry Point & Event Controller

import { grade2Settings } from './core/levels.js';
import { switchScreen } from './core/utils.js';
import { initMahjongGame } from './games/mahjong.js';
import { startDuel } from './games/duel.js';
import { startConquest, passConquestTurn } from './games/conquest.js';
import { startRace, rollRaceDice } from './games/race.js';
import { startTug } from './games/tug.js';
import { startCarRace } from './games/carrace.js';

let selectedMode = 'mahjong';

document.addEventListener('DOMContentLoaded', () => {
    // Main Menu Buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectedMode = e.currentTarget.getAttribute('data-mode');
            
            // Show mode-specific settings
            const memoryGroup = document.getElementById('memory-time-group');
            const conquestGroup = document.getElementById('conquest-options-group');
            const raceGroup = document.getElementById('race-options-group');
            const tugGroup = document.getElementById('tug-options-group');
            const carGroup = document.getElementById('car-race-options-group');
            
            if (memoryGroup) memoryGroup.style.display = selectedMode === 'duel' ? 'block' : 'none';
            if (conquestGroup) conquestGroup.style.display = selectedMode === 'conquest' ? 'block' : 'none';
            if (raceGroup) raceGroup.style.display = selectedMode === 'race' ? 'block' : 'none';
            if (tugGroup) tugGroup.style.display = selectedMode === 'tug' ? 'block' : 'none';
            if (carGroup) carGroup.style.display = selectedMode === 'carRace' ? 'block' : 'none';
            
            switchScreen('settings-screen');
        });
    });

    // Settings Controls
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
            const op = e.currentTarget.getAttribute('data-op');
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
            if (selectedMode === 'mahjong') initMahjongGame(2);
            else if (selectedMode === 'duel') startDuel(2);
            else if (selectedMode === 'conquest') startConquest(2);
            else if (selectedMode === 'race') startRace(2);
            else if (selectedMode === 'tug') startTug(2, selectedTugPlayers);
            else if (selectedMode === 'carRace') startCarRace(2, selectedCarPlayers);
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
        if (btn) btn.addEventListener('click', () => switchScreen('main-menu'));
    });

    // Play Again Buttons
    document.getElementById('play-again-btn')?.addEventListener('click', () => initMahjongGame(2));
    document.getElementById('duel-play-again-btn')?.addEventListener('click', () => startDuel(2));
    document.getElementById('conquest-play-again-btn')?.addEventListener('click', () => startConquest(2));
    document.getElementById('race-play-again-btn')?.addEventListener('click', () => startRace(2));
    document.getElementById('tug-play-again-btn')?.addEventListener('click', () => startTug(2, selectedTugPlayers));
    document.getElementById('car-race-play-again-btn')?.addEventListener('click', () => startCarRace(2, selectedCarPlayers));

    // Special Game Buttons
    document.getElementById('conquest-pass-btn')?.addEventListener('click', passConquestTurn);
    document.getElementById('race-roll-btn')?.addEventListener('click', rollRaceDice);
});
