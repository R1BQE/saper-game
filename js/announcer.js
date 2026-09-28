/**
 * Озвучка и уведомления (для NVDA и UI)
 */
import { getConfig, getBoard, getCursor, getStartTime } from './game-state.js';
import { playSound } from './audio.js';

const { size, minesCount, letters } = getConfig();
let liveRegion = null;
let timerRegion = null;

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

/**
 * Короткий формат для счётчика на экране: «12:05».
 * Устный формат «12 мин 5 сек» в строке, которая меняется каждую секунду,
 * слишком длинный — держим его только для речи и итога партии.
 */
export function getElapsedText() {
    const startTime = getStartTime();
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remain = seconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(remain).padStart(2, "0");
}

export function announceTime() {
    announce("Время игры " + getElapsedTime());
}

/**
 * Отдельный канал для таймера на экране: он обновляется каждую секунду,
 * и через общую live-область это превратилось бы в бесконечный поток
 * объявлений, который у скринридера глушит всё остальное.
 */
export function announceTimer(text) {
    if (!timerRegion) return;
    timerRegion.textContent = text;
}

export function initTimerDisplay(el) {
    timerRegion = el;
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