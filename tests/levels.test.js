import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { levelSeeds, gameLayout, generateLayoutGrid, grade2Settings } from '../js/core/levels.js';

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

    test('Mahjong layout generator outputs 52 tiles by default and respects pairCount parameter', () => {
        assert.ok(Array.isArray(gameLayout), 'gameLayout should be an array');
        assert.equal(gameLayout.length, 52, 'gameLayout default should have 52 tiles');

        const layout10 = generateLayoutGrid(10);
        assert.equal(layout10.length, 20, 'generateLayoutGrid(10) should have 20 tiles');

        const layout16 = generateLayoutGrid(16);
        assert.equal(layout16.length, 32, 'generateLayoutGrid(16) should have 32 tiles');
    });
});
