/**
 * Логика игрового поля: создание, мины, подсчёт чисел
 */
import { getConfig, getBoard, setBoard } from './game-state.js';

const { size, minesCount } = getConfig();

export function createBoard() {
    const newBoard = [];
    for (let y = 0; y < size; y++) {
        const row = [];
        for (let x = 0; x < size; x++) {
            row.push({
                mine: false,
                open: false,
                defused: false,
                adjacent: 0
            });
        }
        newBoard.push(row);
    }
    setBoard(newBoard);
    return newBoard;
}

export function placeMines() {
    const board = getBoard();
    let placed = 0;
    while (placed < minesCount) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        if (!board[y][x].mine) {
            board[y][x].mine = true;
            placed++;
        }
    }
}

function updateCellNumber(x, y) {
    const board = getBoard();
    const c = board[y][x];

    if (c.defused) {
        c.adjacent = 0;
        return;
    }
    if (c.mine) {
        return;
    }

    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                const near = board[ny][nx];
                if (near.mine && !near.defused) {
                    count++;
                }
            }
        }
    }
    c.adjacent = count;
}

export function calculateNumbers() {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            updateCellNumber(x, y);
        }
    }
}

export function recalculateAllNumbers() {
    calculateNumbers();
}