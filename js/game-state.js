/**
 * Состояние игры
 */
import { CONFIG } from './constants.js';

export let board = [];
export let cursorX = 0;
export let cursorY = 0;
export let gameOver = false;
export let startTime = 0;

export function resetGameState() {
    board = [];
    cursorX = 0;
    cursorY = 0;
    gameOver = false;
    startTime = Date.now();
}

export function getBoard() {
    return board;
}

export function setBoard(newBoard) {
    board = newBoard;
}

export function getCursor() {
    return { x: cursorX, y: cursorY };
}

export function setCursor(x, y) {
    cursorX = x;
    cursorY = y;
}

export function isGameOver() {
    return gameOver;
}

export function setGameOver(value) {
    gameOver = value;
}

export function getStartTime() {
    return startTime;
}

export function setStartTime(time) {
    startTime = time;
}

export function getConfig() {
    return { ...CONFIG };
}