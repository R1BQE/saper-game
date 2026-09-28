/**
 * Рендеринг игрового поля (CSS Grid)
 */
import { getConfig, getBoard, getCursor, isGameOver } from './game-state.js';
import { getCellText } from './announcer.js';

const { size, letters } = getConfig();

let visualContainer = null;
let statusDiv = null;
let restartBtn = null;
let homeBtn = null;

export function initRenderer(visualEl, statusEl, restartEl, homeEl) {
    visualContainer = visualEl;
    statusDiv = statusEl;
    restartBtn = restartEl;
    homeBtn = homeEl;
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

/**
 * Заголовок над полем. Одна и та же зона служит двум целям: до партии —
 * название игры, после партии — результат. Так результат оказывается
 * первым, что попадает в фокус чтения, и не нужно искать его под полем.
 */
export function setHeading(text) {
    const h = document.getElementById('gameHeading');
    if (h) h.textContent = text;
}

/**
 * Обе кнопки после партии показываются вместе. Фокус уходит на «главную»:
 * перезагрузка возвращает экран в исходное состояние целиком, вместе с
 * правилами. Если кнопки главной на странице нет — фокус на «новую партию».
 */
export function showRestartButton() {
    if (restartBtn) restartBtn.hidden = false;
    if (homeBtn) homeBtn.hidden = false;

    const target = homeBtn || restartBtn;
    if (target) {
        target.focus();
    }
}

export function hideRestartButton() {
    if (restartBtn) {
        restartBtn.hidden = true;
    }
    if (homeBtn) {
        homeBtn.hidden = true;
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