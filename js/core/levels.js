// js/core/levels.js

export const grade2Settings = {
    limit: 100,
    ops: ['+', '-', '*', '/'],
    memoryTime: 2.0,
    conquestTimerEnabled: false,
    conquestTimerLimit: 30
};

// Expose settings on window for backwards compatibility if needed
if (typeof window !== 'undefined') {
    window.grade2Settings = grade2Settings;
}

export const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const levelSeeds = {
    1: {
        name: "1. Osztály",
        description: "Összeadás és kivonás 20-ig",
        generatePair: () => {
            const target = getRandomInt(0, 20);
            
            const generateExpression = (val) => {
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
            const limit = grade2Settings.limit;
            const activeOps = grade2Settings.ops.length > 0 ? grade2Settings.ops : ['+'];
            
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
            const opType = Math.random();
            let target;
            
            if (opType < 0.3) {
                target = getRandomInt(0, 1000);
                const a = getRandomInt(0, target);
                const b = target - a;
                return { value: target, texts: [`${a} + ${b}`, Math.random() > 0.5 ? target.toString() : `${target+10} - 10`] };
            } else if (opType < 0.7) {
                const a = getRandomInt(1, 10);
                const b = getRandomInt(1, 10);
                target = a * b;
                return { value: target, texts: [`${a} * ${b}`, target.toString()] };
            } else {
                const b = getRandomInt(1, 10);
                target = getRandomInt(1, 10);
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
                target = getRandomInt(1000, 10000);
                const a = getRandomInt(0, target);
                return { value: target, texts: [`${a} + ${target - a}`, target.toString()] };
            } else if (opType < 0.6) {
                const a = getRandomInt(11, 50);
                const b = getRandomInt(2, 9);
                target = a * b;
                return { value: target, texts: [`${a} * ${b}`, target.toString()] };
            } else {
                const b = getRandomInt(2, 20);
                target = getRandomInt(10, 50);
                const a = target * b;
                return { value: target, texts: [`${a} / ${b}`, target.toString()] };
            }
        }
    }
};

export function generateLayoutGrid() {
    const layout = [];
    
    for(let r=0; r<6; r++) {
        for(let c=0; c<6; c++) {
            if ((r===0||r===5) && (c===0||c===5)) continue; 
            layout.push({l: 0, r: r, c: c});
        }
    }

    for(let r=1; r<=4; r++) {
        for(let c=1; c<=4; c++) {
            layout.push({l: 1, r: r, c: c});
        }
    }

    for(let r=2; r<=3; r++) {
        for(let c=2; c<=3; c++) {
            layout.push({l: 2, r: r, c: c});
        }
    }
    
    return layout;
}

export const gameLayout = generateLayoutGrid();

if (typeof window !== 'undefined') {
    window.levelSeeds = levelSeeds;
    window.gameLayout = gameLayout;
}
