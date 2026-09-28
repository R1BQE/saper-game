/**
 * Рендеринг игрового поля (CSS Grid)
 */
import { getConfig, getBoard, getCursor, isGameOver } from './game-state.js';
import { getCellText } from './announcer.js';

const { size, letters } = getConfig();

let visualContainer = null;
let statusDiv = null;
let restartBtn = null;

export function initRenderer(visualEl, statusEl, restartEl) {
    visualContainer = visualEl;
    statusDiv = statusEl;
    restartBtn = restartEl;
}

export function drawVisual() {
    if (!visualContainer) return;

    visualContainer.innerHTML = '';
    visualContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    const board = getBoard();
    const { x: cursorX, y: cursorY } = getCursor();

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const c = board[y][x];
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            // ARIA для скринридеров
            // Клетка должна быть фокусируемой: без этого скринридер не может
            // навести на неё фокус, и активация не вырабатывает click.
            cell.setAttribute('role', 'button');
            cell.dataset.label = getCellText(x, y);
            cell.setAttribute('aria-label', cell.dataset.label);
            cell.setAttribute('tabindex', '0');

            if (c.defused) {
                cell.classList.add('defused');
                cell.textContent = '🚩';
                cell.setAttribute('aria-label', getCellText(x, y) + ', флажок');
            } else if (c.open) {
                cell.classList.add('open');
                if (c.mine) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else if (c.adjacent === 0) {
                    cell.classList.add('empty');
                    cell.textContent = '·';
                } else {
                    cell.classList.add('num-' + c.adjacent);
                    cell.textContent = c.adjacent.toString();
                }
            } else {
                cell.classList.add('closed');
                cell.textContent = '';
            }

            // Курсор
            if (x === cursorX && y === cursorY) {
                cell.classList.add('cursor');
                cell.setAttribute('aria-current', 'true');
            }

            visualContainer.appendChild(cell);
        }
    }
}

export function updateStatus(text) {
    if (statusDiv) {
        statusDiv.textContent = text;
    }
}

export function showRestartButton() {
    if (restartBtn) {
        restartBtn.hidden = false;
        restartBtn.focus();
    }
}

export function hideRestartButton() {
    if (restartBtn) {
        restartBtn.hidden = true;
    }
}

export function hideIntro() {
    const intro = document.getElementById('intro');
    if (intro) intro.hidden = true;
}

export function showGame() {
    const game = document.getElementById('game');
    if (game) game.hidden = false;
}

export function focusGame() {
    const game = document.getElementById('game');
    if (game) game.focus();
}