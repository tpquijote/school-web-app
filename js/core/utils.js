// js/core/utils.js

export function switchScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
    }
}

export function normalizeExpression(str) {
    if (!str) return '';
    return str.replace(/\s+/g, '').replace(/\*/g, '×').replace(/\//g, '÷');
}

export function generateUniquePairs(seed, count) {
    const pairs = [];
    const usedExprs = new Set();

    for (let i = 0; i < count; i++) {
        let pair;
        let attempts = 0;
        let found = false;

        while (attempts < 100) {
            pair = seed.generatePair();
            const norm1 = normalizeExpression(pair.texts[0]);
            const norm2 = normalizeExpression(pair.texts[1]);

            if (!usedExprs.has(norm1) && !usedExprs.has(norm2)) {
                usedExprs.add(norm1);
                usedExprs.add(norm2);
                pairs.push(pair);
                found = true;
                break;
            }
            attempts++;
        }

        if (!found) {
            // Fallback if target range is exhausted (e.g., Grade 1 up to 20)
            pairs.push(seed.generatePair());
        }
    }

    return pairs;
}
