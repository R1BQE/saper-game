/**
 * Озвучка и уведомления (для NVDA и UI)
 */
import { getConfig, getBoard, getCursor, getStartTime } from './game-state.js';
import { playSound } from './audio.js';

const { size, minesCount, letters } = getConfig();
let liveRegion = null;

export function initAnnouncer(liveElement) {
    liveRegion = liveElement;
}

export function announce(text) {
    if (!liveRegion) return;
    liveRegion.textContent = "";
    setTimeout(() => {
        liveRegion.textContent = text;
    }, 10);
}

export function getCellText(x, y) {
    const board = getBoard();
    const c = board[y][x];
    const coord = letters[x] + (y + 1);

    if (c.defused) {
        return coord + " обезврежено";
    }
    if (c.open) {
        if (c.adjacent === 0) {
            return coord + " мин рядом нет";
        }
        return coord + " рядом мин " + c.adjacent;
    }
    return coord + " закрыто";
}

export function speakCurrentCell() {
    const { x, y } = getCursor();
    announce(getCellText(x, y));
}

export function getElapsedTime() {
    const startTime = getStartTime();
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remain = seconds % 60;
    return minutes + " мин " + remain + " сек";
}

export function announceTime() {
    announce("Время игры " + getElapsedTime());
}

export function announceGameStart() {
    announce("Игра началась");
}

export function announceLose(message) {
    const time = getElapsedTime();
    announce(message + ". Игра окончена. Время " + time);
}

export function announceWin() {
    const time = getElapsedTime();
    announce("Победа. Время " + time);
    playSound("win");
}