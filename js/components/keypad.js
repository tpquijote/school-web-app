// js/components/keypad.js

/**
 * Handles numeric keypad input events for specified input fields and container buttons.
 * Cleans up old listeners if re-initialized to prevent duplicate handler invocation.
 */
export function setupKeypadHandler(keypadContainer, inputElem, onOkCallback) {
    if (!keypadContainer) return;

    if (keypadContainer._keypadListener) {
        keypadContainer.removeEventListener('click', keypadContainer._keypadListener);
    }

    const listener = (e) => {
        const btn = e.target.closest('button, .keypad-btn, .car-key, .tug-key, [data-val]');
        if (!btn) return;

        const val = btn.getAttribute('data-val');
        if (!val) return;

        let currentVal = inputElem ? (inputElem.value || '') : '';

        if (val === 'back') {
            currentVal = currentVal.slice(0, -1);
        } else if (val === '-') {
            if (currentVal.startsWith('-')) {
                currentVal = currentVal.slice(1);
            } else {
                currentVal = '-' + currentVal;
            }
        } else if (val === 'ok') {
            if (typeof onOkCallback === 'function') {
                onOkCallback(currentVal);
            }
            return;
        } else {
            // Digits 0-9
            if (currentVal.length < 5) {
                currentVal += val;
            }
        }

        if (inputElem) {
            inputElem.value = currentVal;
            inputElem.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    keypadContainer._keypadListener = listener;
    keypadContainer.addEventListener('click', listener);
}
