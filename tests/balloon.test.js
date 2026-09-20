// tests/balloon.test.js - Unit tests for Balloon Game logic

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { createTargetFromPair, generateWrongBalloonOptions } from '../js/games/balloon.js';

describe('Balloon Game Logic (js/games/balloon.js)', () => {
    test('Balloon Game - createTargetFromPair standard mode', () => {
        const pair = {
            value: 12,
            texts: ['5 + 7', '12']
        };

        const target = createTargetFromPair(pair, false);
        assert.strictEqual(target.questionText, '5 + 7');
        assert.strictEqual(target.targetValue, 12);
        assert.strictEqual(target.correctBalloonText, '12');
        assert.strictEqual(target.isReversed, false);
    });

    test('Balloon Game - createTargetFromPair reversed mode', () => {
        const pair = {
            value: 12,
            texts: ['5 + 7', '12']
        };

        const target = createTargetFromPair(pair, true);
        assert.strictEqual(target.questionText, '12');
        assert.strictEqual(target.targetValue, 12);
        assert.strictEqual(target.correctBalloonText, '5 + 7');
        assert.strictEqual(target.isReversed, true);
    });

    test('Balloon Game - generateWrongBalloonOptions standard mode', () => {
        const wrongOptions = generateWrongBalloonOptions(12, false, 3, 2);
        assert.strictEqual(wrongOptions.length, 3);
        assert.ok(!wrongOptions.includes('12'));
    });

    test('Balloon Game - generateWrongBalloonOptions reversed mode', () => {
        const wrongOptions = generateWrongBalloonOptions(12, true, 3, 2);
        assert.strictEqual(wrongOptions.length, 3);
        wrongOptions.forEach(opt => {
            assert.ok(/[+\-×÷*\/]/.test(opt));
        });
    });
});
