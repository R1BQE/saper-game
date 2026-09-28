/**
 * Обработка ввода: клавиатура, мышь, тач
 */
import { getConfig, getCursor, setCursor, isGameOver } from './game-state.js';
import { openCell, defuseCell } from './game-flow.js';
import { drawVisual, focusGame } from './ui-renderer.js';
import { speakCurrentCell, announceTime } from './announcer.js';

const { size } = getConfig();

const HOLD_MS = 500;
const MOVE_TOLERANCE_PX = 12;

let touchStartTime = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;
let lastTouchEnd = 0;
let visualContainer = null;

function cellFromEvent(e) {
    const el = e.target && e.target.closest ? e.target.closest('.cell') : null;
    if (el) return el;
    const a = document.activeElement;
    return a && a.closest ? a.closest('.cell') : null;
}

export function initInputHandler(visualEl) {
    visualContainer = visualEl;
    setupKeyboard();
    setupMouse();
    setupTouch();
}

function setupKeyboard() {
    const game = document.getElementById('game');
    if (!game) return;

    game.addEventListener('keydown', (e) => {
        if (isGameOver()) return;

        const ctrl = e.ctrlKey;
        let { x: cursorX, y: cursorY } = getCursor();
        let moved = false;

        switch (e.key.toLowerCase()) {
            case 'arrowright':
                if (ctrl) {
                    cursorX = size - 1;
                } else if (cursorX < size - 1) {
                    cursorX++;
                }
                moved = true;
                break;

            case 'arrowleft':
                if (ctrl) {
                    cursorX = 0;
                } else if (cursorX > 0) {
                    cursorX--;
                }
                moved = true;
                break;

            case 'arrowdown':
                if (ctrl) {
                    cursorY = size - 1;
                } else if (cursorY < size - 1) {
                    cursorY++;
                }
                moved = true;
                break;

            case 'arrowup':
                if (ctrl) {
                    cursorY = 0;
                } else if (cursorY > 0) {
                    cursorY--;
                }
                moved = true;
                break;

            case ' ':
                openCell();
                e.preventDefault();
                break;

            case 'enter':
                defuseCell();
                e.preventDefault();
                break;

            case 'p':
            case 'з':
                speakCurrentCell();
                e.preventDefault();
                break;

            case 't':
            case 'е':
                announceTime();
                e.preventDefault();
                break;
        }

        if (moved) {
            setCursor(cursorX, cursorY);
            drawVisual();
            speakCurrentCell();
            e.preventDefault();
        }
    });
}

function setupMouse() {
    if (!visualContainer) return;

    visualContainer.addEventListener('click', (e) => {
        if (isGameOver()) return;
        // После тач-жеста браузер шлёт синтетический click — не даём ему открыть
        // клетку второй раз поверх уже обработанного касания
        if (Date.now() - lastTouchEnd < 700) {
            e.preventDefault();
            return;
        }
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const x = parseInt(cell.dataset.x, 10);
        const y = parseInt(cell.dataset.y, 10);
        setCursor(x, y);
        openCell();
        drawVisual();
        speakCurrentCell();
    });

    visualContainer.addEventListener('contextmenu', (e) => {
        if (isGameOver()) return;
        const cell = e.target.closest('.cell');
        if (!cell) return;

        e.preventDefault();
        const x = parseInt(cell.dataset.x, 10);
        const y = parseInt(cell.dataset.y, 10);
        setCursor(x, y);
        defuseCell();
        drawVisual();
        speakCurrentCell();
    });
}

function setupTouch() {
    if (!visualContainer) return;

    visualContainer.addEventListener('touchstart', (e) => {
        if (isGameOver()) return;
        const touch = e.changedTouches[0];
        if (!touch) return;

        touchStartTime = Date.now();
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchMoved = false;
    }, { passive: true });

    visualContainer.addEventListener('touchmove', (e) => {
        const touch = e.changedTouches[0];
        if (!touch) return;

        const dx = Math.abs(touch.clientX - touchStartX);
        const dy = Math.abs(touch.clientY - touchStartY);
        if (dx > MOVE_TOLERANCE_PX || dy > MOVE_TOLERANCE_PX) {
            touchMoved = true;
        }
    }, { passive: true });

    visualContainer.addEventListener('touchcancel', (e) => {
        // Жест забрал скринридер или система — своё действие не выполняем
        touchMoved = true;
        touchStartTime = 0;
    }, { passive: true });

    visualContainer.addEventListener('touchend', (e) => {
        if (isGameOver()) return;

        const heldFor = Date.now() - touchStartTime;
        const moved = touchMoved;

        touchStartTime = 0;
        touchMoved = false;
        lastTouchEnd = Date.now();

        // Порог по минимальной длительности убран: настоящие короткие тапы
        // (40–80 мс) отсекались вместе с синтетическими событиями.
        if (moved) return;

        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = el ? el.closest('.cell') : null;
        if (!cell) return;

        const x = parseInt(cell.dataset.x, 10);
        const y = parseInt(cell.dataset.y, 10);
        setCursor(x, y);
        drawVisual();

        if (heldFor >= HOLD_MS) {
            defuseCell();
        } else {
            openCell();
        }

        drawVisual();
        speakCurrentCell();
    }, { passive: true });
}

export function focusGameElement() {
    focusGame();
}