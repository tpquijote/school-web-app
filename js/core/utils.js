// js/core/utils.js

export function normalizeExpression(exprStr) {
    if (typeof exprStr !== 'string') return exprStr;
    return exprStr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
}

export function generateUniquePairs(seed, count) {
    const pairs = [];
    const usedExprs = new Set();
    let attempts = 0;
    const maxAttempts = count * 200;

    while (pairs.length < count && attempts < maxAttempts) {
        attempts++;
        const pair = seed.generatePair();
        if (!pair || !pair.texts || pair.texts.length < 2) continue;

        const norm1 = normalizeExpression(pair.texts[0]);
        const norm2 = normalizeExpression(pair.texts[1]);

        if (usedExprs.has(norm1) || usedExprs.has(norm2)) {
            continue;
        }

        usedExprs.add(norm1);
        usedExprs.add(norm2);
        pairs.push(pair);
    }

    if (pairs.length < count) {
        console.warn(`generateUniquePairs: could only generate ${pairs.length}/${count} unique pairs`);
        while (pairs.length < count) {
            pairs.push(seed.generatePair());
        }
    }

    return pairs;
}

export function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
    }
}
