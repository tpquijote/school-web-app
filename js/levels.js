// js/levels.js

// Global settings for 2nd Grade
window.grade2Settings = {
    limit: 100,
    ops: ['+', '-', '*', '/'], // default all operations
    memoryTime: 2.0, // default memory flip-back time
    conquestTimerEnabled: false,
    conquestTimerLimit: 30
};

// Helper functions to generate random numbers
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// This object contains the "seeds" or configurations for each grade
const levelSeeds = {
    1: {
        name: "1. Osztály",
        description: "Összeadás és kivonás 20-ig",
        // Function to generate a pair of matching tiles (e.g. ['5 + 3', '8'] or ['10 - 2', '4 + 4'])
        generatePair: () => {
            const target = getRandomInt(0, 20);
            
            const generateExpression = (val) => {
                // 50% chance to just show the number if it's not the first tile, to make it easier
                if (Math.random() < 0.3) return val.toString();
                
                const isAdd = Math.random() > 0.5;
                if (isAdd) {
                    const a = getRandomInt(0, val);
                    const b = val - a;
                    return `${a} + ${b}`;
                } else {
                    const maxAdd = 20 - val;
                    const b = getRandomInt(0, maxAdd);
                    const a = val + b;
                    return `${a} - ${b}`;
                }
            };
            
            // Ensure at least one is an expression, not just a bare number
            let exp1 = generateExpression(target);
            let exp2 = generateExpression(target);
            if (exp1 === target.toString() && exp2 === target.toString()) {
                exp1 = `${target} + 0`;
            }
            
            return {
                value: target,
                texts: [exp1, exp2]
            };
        }
    },
    
    2: {
        name: "2. Osztály",
        description: "Testreszabható műveletek",
        generatePair: () => {
            const limit = window.grade2Settings.limit;
            const activeOps = window.grade2Settings.ops.length > 0 ? window.grade2Settings.ops : ['+'];
            
            // Choose a primary operation to determine the target value
            const primaryOp = activeOps[Math.floor(Math.random() * activeOps.length)];
            
            let target = 0;
            if (primaryOp === '+' || primaryOp === '-') {
                target = getRandomInt(0, limit);
            } else if (primaryOp === '*') {
                const maxA = Math.min(10, limit);
                const a = getRandomInt(1, maxA);
                const maxB = Math.floor(limit / a);
                const b = getRandomInt(1, maxB || 1);
                target = a * b;
            } else if (primaryOp === '/') {
                const maxDivisor = Math.min(10, limit);
                const b = getRandomInt(2, maxDivisor || 2);
                const maxTarget = Math.floor(limit / b);
                target = getRandomInt(1, maxTarget || 1);
            }
            
            // Helper to generate expression of a given type for a target
            const generateExpression = (val, opType) => {
                if (opType === '+') {
                    const a = getRandomInt(0, val);
                    const b = val - a;
                    return `${a} + ${b}`;
                } else if (opType === '-') {
                    const maxB = limit - val;
                    const b = getRandomInt(0, maxB);
                    const a = val + b;
                    return `${a} - ${b}`;
                } else if (opType === '*') {
                    const factors = [];
                    for (let i = 1; i <= 10; i++) {
                        if (val % i === 0 && val / i <= 10) {
                            factors.push([i, val / i]);
                        }
                    }
                    if (factors.length > 0) {
                        const [a, b] = factors[getRandomInt(0, factors.length - 1)];
                        return `${a} × ${b}`;
                    }
                    const fallbackOps = activeOps.filter(o => o !== '*');
                    if (fallbackOps.length > 0) {
                        return generateExpression(val, fallbackOps[getRandomInt(0, fallbackOps.length - 1)]);
                    }
                    return val.toString();
                } else if (opType === '/') {
                    const validDivisors = [];
                    for (let d = 2; d <= 10; d++) {
                        if (val * d <= limit) {
                            validDivisors.push(d);
                        }
                    }
                    if (validDivisors.length > 0) {
                        const d = validDivisors[getRandomInt(0, validDivisors.length - 1)];
                        return `${val * d} ÷ ${d}`;
                    }
                    const fallbackOps = activeOps.filter(o => o !== '/');
                    if (fallbackOps.length > 0) {
                        return generateExpression(val, fallbackOps[getRandomInt(0, fallbackOps.length - 1)]);
                    }
                    return val.toString();
                }
                return val.toString();
            };
            
            const rand = Math.random();
            const op1 = activeOps[getRandomInt(0, activeOps.length - 1)];
            const op2 = activeOps[getRandomInt(0, activeOps.length - 1)];
            
            let text1, text2;
            if (rand < 0.15) {
                text1 = target.toString();
                text2 = generateExpression(target, op2);
            } else if (rand < 0.3) {
                text1 = generateExpression(target, op1);
                text2 = target.toString();
            } else {
                text1 = generateExpression(target, op1);
                text2 = generateExpression(target, op2);
            }
            
            if (text1 === text2) {
                const fallbackOps = activeOps.filter(o => o !== op2);
                if (fallbackOps.length > 0) {
                    text2 = generateExpression(target, fallbackOps[getRandomInt(0, fallbackOps.length - 1)]);
                } else {
                    text2 = target.toString();
                }
            }
            
            return { value: target, texts: [text1, text2] };
        }
    },

    3: {
        name: "3. Osztály",
        description: "Szorzótábla, összeadás/kivonás 1000-ig",
        generatePair: () => {
            const opType = Math.random(); // 0.3 add/sub, 0.4 mul, 0.3 div
            let target;
            
            if (opType < 0.3) {
                // Add/sub up to 1000
                target = getRandomInt(0, 1000);
                const a = getRandomInt(0, target);
                const b = target - a;
                return { value: target, texts: [`${a} + ${b}`, Math.random() > 0.5 ? target.toString() : `${target+10} - 10`] }; // Simplified second exp
            } else if (opType < 0.7) {
                // Mul up to 10x10
                const a = getRandomInt(1, 10);
                const b = getRandomInt(1, 10);
                target = a * b;
                return { value: target, texts: [`${a} * ${b}`, target.toString()] };
            } else {
                // Div
                const b = getRandomInt(1, 10);
                target = getRandomInt(1, 10); // result
                const a = target * b;
                return { value: target, texts: [`${a} / ${b}`, target.toString()] };
            }
        }
    },

    4: {
        name: "4. Osztály",
        description: "Nagyobb számok, összetett műveletek",
        generatePair: () => {
            const opType = Math.random();
            let target;
            
            if (opType < 0.3) {
                // Add/sub up to 10000
                target = getRandomInt(1000, 10000);
                const a = getRandomInt(0, target);
                return { value: target, texts: [`${a} + ${target - a}`, target.toString()] };
            } else if (opType < 0.6) {
                // Advanced Mul (e.g. 25 * 4, 12 * 5)
                const a = getRandomInt(11, 50);
                const b = getRandomInt(2, 9);
                target = a * b;
                return { value: target, texts: [`${a} * ${b}`, target.toString()] };
            } else {
                // Advanced Div
                const b = getRandomInt(2, 20);
                target = getRandomInt(10, 50);
                const a = target * b;
                return { value: target, texts: [`${a} / ${b}`, target.toString()] };
            }
        }
    }
};

// Basic Layout Seed - Defines the 3D grid [layer, row, col]
// A simple pyramid layout for kids (not too many tiles)
const simpleLayoutTemplate = [
    // Layer 0 (Bottom) - 4x4
    [0,0,0], [0,0,1], [0,0,2], [0,0,3],
    [0,1,0], [0,1,1], [0,1,2], [0,1,3],
    [0,2,0], [0,2,1], [0,2,2], [0,2,3],
    [0,3,0], [0,3,1], [0,3,2], [0,3,3], // 16 tiles
    
    // Layer 1 - 2x2 centered
    [1,1,1], [1,1,2],
    [1,2,1], [1,2,2], // 4 tiles
    
    // Layer 2 - 2x1 centered
    [2,1.5,1.5], [2,1.5, 2.5] // wait, coordinates must align. Let's use simpler integer coordinates that overlap by half.
];

// Let's build a programmatic layout generator to easily adjust tile count.
// Mahjong tiles overlap. If tile is at (x,y), it blocks (x,y), (x+1,y), (x,y+1), (x+1,y+1) if we use half-steps.
// For simplicity, let's just use a full-grid system where a tile is 1x1.
// A tile at (l, r, c) is blocked if there's a tile at (l+1, r, c).
// It is "free" if either (l, r, c-1) is empty OR (l, r, c+1) is empty.
// This is a simplified "blocky" mahjong which works perfectly.

function generateLayoutGrid() {
    const layout = [];
    
    // Layer 0: 6x6 square (36 tiles)
    for(let r=0; r<6; r++) {
        for(let c=0; c<6; c++) {
            // Leave corners empty to make it look nicer
            if ((r===0||r===5) && (c===0||c===5)) continue; 
            layout.push({l: 0, r: r, c: c});
        }
    } // 36 - 4 = 32 tiles

    // Layer 1: 4x4 square centered (16 tiles)
    for(let r=1; r<=4; r++) {
        for(let c=1; c<=4; c++) {
            layout.push({l: 1, r: r, c: c});
        }
    } // 16 tiles

    // Layer 2: 2x2 square centered (4 tiles)
    for(let r=2; r<=3; r++) {
        for(let c=2; c<=3; c++) {
            layout.push({l: 2, r: r, c: c});
        }
    } // 4 tiles
    
    // Total: 32 + 16 + 4 = 52 tiles. 52 is an even number, perfect for 26 pairs.
    return layout;
}

const gameLayout = generateLayoutGrid();
