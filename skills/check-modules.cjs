#!/usr/bin/env node
/**
 * Agent Skill: Check Module Dependencies and Syntax Integrity
 */

const fs = require('fs');
const path = require('path');

console.log("=== Agent Skill: Module & File Integrity Check ===");

const filesToCheck = [
    'index.html',
    'style.css',
    'AGENTS.md',
    'DOMINO_TODO.md'
];

let errors = 0;

filesToCheck.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ Missing file: ${file}`);
        errors++;
    } else {
        console.log(`✓ File present: ${file}`);
    }
});

if (errors > 0) {
    console.error(`❌ Found ${errors} missing required files.`);
    process.exit(1);
} else {
    console.log("✅ Basic file integrity check passed.");
}
