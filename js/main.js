/**
 * Точка входа: инициализация всех модулей и запуск игры
 */
import { initRenderer } from './ui-renderer.js';
import { initInputHandler } from './input-handler.js';
import { initAnnouncer } from './announcer.js';
import { preloadSounds } from './audio.js';
import { startGame } from './game-flow.js';

// DOM элементы
const visual = document.getElementById('visual');
const live = document.getElementById('live');
const statusDiv = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

// Инициализация модулей
function init() {
    // Предзагрузка звуков
    preloadSounds();

    // Инициализация рендерера
    initRenderer(visual, statusDiv, restartBtn);

    // Инициализация озвучки
    initAnnouncer(live);

    // Инициализация ввода
    initInputHandler(visual);

    // Кнопки
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    // Фокус на стартовой кнопке
    startBtn.focus();
}

// Запуск при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}