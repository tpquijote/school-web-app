import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { levelSeeds, gameLayout, grade2Settings } from '../js/core/levels.js';

describe('Level Generators ES Module (js/core/levels.js)', () => {
    test('levelSeeds object is defined for grades 1-4', () => {
        assert.ok(levelSeeds, 'levelSeeds should be defined');
        assert.ok(levelSeeds[1], 'Grade 1 should be defined');
        assert.ok(levelSeeds[2], 'Grade 2 should be defined');
        assert.ok(levelSeeds[3], 'Grade 3 should be defined');
        assert.ok(levelSeeds[4], 'Grade 4 should be defined');
    });

    test('Grade 1 pair generation outputs valid structure and values within 20', () => {
        for (let i = 0; i < 20; i++) {
            const pair = levelSeeds[1].generatePair();
            assert.ok(typeof pair.value === 'number', 'Value should be a number');
            assert.ok(pair.value >= 0 && pair.value <= 20, 'Value should be between 0 and 20');
            assert.equal(pair.texts.length, 2, 'Should generate 2 text representations');
        }
    });

    test('Grade 2 settings limit is respected', () => {
        grade2Settings.limit = 50;
        grade2Settings.ops = ['+'];
        for (let i = 0; i < 20; i++) {
            const pair = levelSeeds[2].generatePair();
            assert.ok(pair.value <= 50, `Value ${pair.value} should be <= 50`);
        }
    });

    test('Grade 2 settings limit works for 500 and 1000', () => {
        grade2Settings.limit = 500;
        grade2Settings.ops = ['+', '-'];
        for (let i = 0; i < 20; i++) {
            const pair = levelSeeds[2].generatePair();
            assert.ok(pair.value <= 500, `Value ${pair.value} should be <= 500`);
        }

        grade2Settings.limit = 1000;
        for (let i = 0; i < 20; i++) {
            const pair = levelSeeds[2].generatePair();
            assert.ok(pair.value <= 1000, `Value ${pair.value} should be <= 1000`);
        }
    });

    test('Mahjong layout generator outputs 52 tiles', () => {
        assert.ok(Array.isArray(gameLayout), 'gameLayout should be an array');
        assert.equal(gameLayout.length, 52, 'gameLayout should have 52 tiles');
    });
});
