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
    if (!sounds[name]) {
        return;
    }
    sounds[name].currentTime = 0;
    sounds[name].play().catch(() => {});
}

export function preloadSounds() {
    Object.values(sounds).forEach(sound => {
        sound.load();
    });
}