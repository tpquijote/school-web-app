// js/levels.js

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
        description: "Összeadás/kivonás 100-ig, alap szorzás",
        generatePair: () => {
            // Decide operation type: 70% add/sub, 30% mul
            const isMul = Math.random() < 0.3;
            let target;
            
            const generateExpression = (val, forceMul = false) => {
                if (Math.random() < 0.3) return val.toString();
                
                if (forceMul || isMul) {
                    // Try to find factors
                    const factors = [];
                    for(let i=1; i<=10; i++) {
                        if (val % i === 0 && val / i <= 10) {
                            factors.push([i, val/i]);
                        }
                    }
                    if (factors.length > 0) {
                        const [a, b] = factors[getRandomInt(0, factors.length-1)];
                        return `${a} * ${b}`;
                    }
                }
                
                // Fallback to add/sub
                const isAdd = Math.random() > 0.5;
                if (isAdd) {
                    const a = getRandomInt(0, val);
                    const b = val - a;
                    return `${a} + ${b}`;
                } else {
                    const maxAdd = 100 - val;
                    const b = getRandomInt(0, maxAdd);
                    const a = val + b;
                    return `${a} - ${b}`;
                }
            };

            if (isMul) {
                const a = getRandomInt(1, 10);
                const b = getRandomInt(1, 10);
                target = a * b;
            } else {
                target = getRandomInt(0, 100);
            }
            
            let exp1 = generateExpression(target, isMul);
            let exp2 = generateExpression(target, isMul);
            if (exp1 === target.toString() && exp2 === target.toString()) {
                exp1 = `${target} + 0`;
            }
            
            return { value: target, texts: [exp1, exp2] };
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
