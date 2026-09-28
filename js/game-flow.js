/**
 * Основной игровой поток: старт, открытие клеток, разминирование, победа/поражение
 */
import { getConfig, getBoard, getCursor, isGameOver, setGameOver, resetGameState, setStartTime } from './game-state.js';
import { createBoard, placeMines, calculateNumbers, recalculateAllNumbers } from './board-logic.js';
import { drawVisual, updateStatus, showRestartButton, hideRestartButton, hideIntro, showGame } from './ui-renderer.js';
import { focusGameElement } from './input-handler.js';
import { playSound } from './audio.js';
import { speakCurrentCell, announceGameStart, announceLose, announceWin, getElapsedTime } from './announcer.js';

const { size, minesCount, letters } = getConfig();

export function startGame() {
    hideIntro();
    showGame();
    hideRestartButton();
    updateStatus('');

    resetGameState();
    setStartTime(Date.now());

    createBoard();
    placeMines();
    calculateNumbers();

    drawVisual();
    focusGameElement();
    speakCurrentCell();
    announceGameStart();
}

export function openCell() {
    const { x: cursorX, y: cursorY } = getCursor();
    const board = getBoard();
    const c = board[cursorY][cursorX];

    if (c.open || c.defused) {
        return;
    }

    if (c.mine) {
        playSound('mine');
        lose('Мина в ' + letters[cursorX] + (cursorY + 1));
        return;
    }

    c.open = true;
    playSound('open');
    drawVisual();
    speakCurrentCell();
    checkWin();
}

export function defuseCell() {
    const { x: cursorX, y: cursorY } = getCursor();
    const board = getBoard();
    const c = board[cursorY][cursorX];

    if (c.open || c.defused) {
        return;
    }

    if (!c.mine) {
        playSound('wrong');
        lose('Ошибка разминирования ' + letters[cursorX] + (cursorY + 1));
        return;
    }

    c.defused = true;
    recalculateAllNumbers();
    playSound('defuse');
    drawVisual();
    speakCurrentCell();
    checkWin();
}

function lose(message) {
    setGameOver(true);
    revealMines();
    drawVisual();

    const time = getElapsedTime();
    updateStatus('Игра окончена. Время: ' + time);
    showRestartButton();

    announceLose(message);
}

function revealMines() {
    const board = getBoard();
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const c = board[y][x];
            if (c.mine && !c.defused) {
                c.open = true;
            }
        }
    }
}

export function checkWin() {
    const board = getBoard();
    let safe = 0;
    let defused = 0;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const c = board[y][x];
            if (!c.mine && c.open) {
                safe++;
            }
            if (c.mine && c.defused) {
                defused++;
            }
        }
    }

    const totalSafe = (size * size) - minesCount;

    if (safe === totalSafe && defused === minesCount) {
        setGameOver(true);

        const time = getElapsedTime();
        updateStatus('Победа. Время: ' + time);
        showRestartButton();

        announceWin();
    }
}