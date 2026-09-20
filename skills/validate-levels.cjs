#!/usr/bin/env node
/**
 * Agent Skill: Validate Level Seeds and Equation Generators
 * Ensures that level math generators produce valid pairs and expressions without runtime errors.
 */

const fs = require('fs');
const path = require('path');

console.log("=== Agent Skill: Level Generator Validation ===");

async function validate() {
    const levelsModule = await import('../js/core/levels.js');
    const levelSeeds = levelsModule.levelSeeds;

    if (!levelSeeds) {
        console.error("Failed to find levelSeeds object");
        process.exit(1);
    }

    let hasError = false;
    for (const grade of [1, 2, 3, 4]) {
        const seed = levelSeeds[grade];
        if (!seed) {
            console.error(`Grade ${grade} seed missing!`);
            hasError = true;
            continue;
        }

        console.log(`Testing Grade ${grade}: ${seed.name}`);
        for (let i = 0; i < 50; i++) {
            try {
                const pair = seed.generatePair();
                if (!pair || pair.value === undefined || !Array.isArray(pair.texts) || pair.texts.length < 2) {
                    console.error(`Grade ${grade} generated invalid pair:`, pair);
                    hasError = true;
                    break;
                }
            } catch (e) {
                console.error(`Error in Grade ${grade} pair generation:`, e.message);
                hasError = true;
                break;
            }
        }
    }

    if (hasError) {
        console.error("❌ Level generator validation failed.");
        process.exit(1);
    } else {
        console.log("✅ All level generators validated successfully!");
    }
}

validate();
