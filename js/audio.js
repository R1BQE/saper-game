/**
 * Звуковая система
 */
const sounds = {
    open: new Audio("sounds/open.mp3"),
    mine: new Audio("sounds/mine.mp3"),
    wrong: new Audio("sounds/wrong.mp3"),
    defuse: new Audio("sounds/defuse.mp3"),
    win: new Audio("sounds/win.mp3")
};

export function playSound(name) {
    if (name === "win") {
        stopWinSound();
    }
    if (!sounds[name]) {
        return;
    }
    sounds[name].currentTime = 0;
    sounds[name].play().catch(() => {});
}

/**
 * Глушит звук победы. Фанфары длятся несколько секунд, и без этого
 * они перекрывают речь и звуки новой партии, начатой сразу после победы.
 */
export function stopWinSound() {
    const win = sounds.win;
    if (!win) return;
    win.pause();
    win.currentTime = 0;
}

export function preloadSounds() {
    Object.values(sounds).forEach(sound => {
        sound.load();
    });
}