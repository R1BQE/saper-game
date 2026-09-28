/**
 * Основной игровой поток: старт, открытие клеток, разминирование, победа/поражение
 */
import { getConfig, getBoard, getCursor, isGameOver, setGameOver, resetGameState, setStartTime } from './game-state.js';
import { createBoard, placeMines, calculateNumbers, recalculateAllNumbers } from './board-logic.js';
import { drawVisual, updateStatus, setHeading, showRestartButton, hideRestartButton, hideIntro, showGame } from './ui-renderer.js';
import { focusGameElement } from './input-handler.js';
import { playSound, stopWinSound } from './audio.js';
import { speakCurrentCell, announceGameStart, announceLose, announceWin, getElapsedTime, getElapsedText, announceTimer } from './announcer.js';

const { size, minesCount, letters } = getConfig();

let timerId = null;

/**
 * Секундный счётчик на экране. Нужен, чтобы время было видно в любой
 * момент, а не только в конце партии: на телефоне достаточно увести палец
 * вверх, и цифра перед глазами. Обновление идёт раз в секунду и только
 * тогда, когда текст реально изменился.
 */
function startTimer() {
    stopTimer();
    timerId = setInterval(() => {
        announceTimer('Время: ' + getElapsedText());
    }, 1000);
}

function stopTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}

export function startGame() {
    stopWinSound();
    hideIntro();
    showGame();
    hideRestartButton();
    updateStatus('');
    setHeading('Сапёр');

    resetGameState();
    setStartTime(Date.now());

    createBoard();
    placeMines();
    calculateNumbers();

    drawVisual();
    focusGameElement();
    speakCurrentCell();
    announceGameStart();
    announceTimer('Время: ' + getElapsedText());
    startTimer();
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
        lose('Мина в ' + letters[cursorX] + (cursorY + 1),
             'Вы открыли клетку ' + letters[cursorX] + (cursorY + 1) +
             ', а в ней мина.');
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
        lose('Ошибка разминирования ' + letters[cursorX] + (cursorY + 1),
             'Вы разминировали клетку ' + letters[cursorX] + (cursorY + 1) +
             ', но мины там не было.');
        return;
    }

    c.defused = true;
    recalculateAllNumbers();
    playSound('defuse');
    drawVisual();
    speakCurrentCell();
    checkWin();
}

function lose(shortMessage, detail) {
    setGameOver(true);
    stopTimer();
    revealMines();

    const time = getElapsedTime();
    const sentences = (detail + ' Игра окончена. Ваше время: ' + time + '.')
        .split(/(?<=[.!?])\s+/)
        .map((s2) => '• ' + s2)
        .join('\n');
    updateStatus(sentences);
    setHeading('Поражение');
    drawVisual();
    showRestartButton();

    announceLose(shortMessage);
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
        stopTimer();

        const time = getElapsedTime();
        updateStatus('• Все ' + minesCount + ' мин разминированы.\n• Ваше время: ' + time + '.');
        setHeading('Победа');
        drawVisual();
        showRestartButton();

        announceWin();
    }
}