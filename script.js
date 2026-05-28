const monkeyContainer = document.getElementById('monkey-container');
const monkey = document.getElementById('monkey');
const speedSlider = document.getElementById('speed-slider');
const musicToggle = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');

let isSpinning = true;
let isDragging = false;
let isSnapping = false;
let hasDragged = false;
let startX, startY;
let translateX = 0, translateY = 0;

// Wander (Running around) state
let wanderX = 0, wanderY = 0;
let wanderVelX = (Math.random() - 0.5) * 4;
let wanderVelY = (Math.random() - 0.5) * 4;

// Initialize spin
monkey.classList.add('spinning');

// --- Spinning Control ---
const updateSpinState = () => {
    const speed = parseFloat(speedSlider.value);
    if (isSpinning && speed > 0) {
        monkey.classList.add('spinning');
        monkey.style.animationPlayState = 'running';
    } else if (isSpinning && speed === 0) {
        monkey.classList.add('spinning');
        monkey.style.animationPlayState = 'paused';
    } else {
        monkey.classList.remove('spinning');
    }
};

monkey.addEventListener('click', (e) => {
    if (hasDragged) return;

    isSpinning = !isSpinning;
    updateSpinState();
});

const updateSpeed = (val) => {
    const speed = parseFloat(val);
    if (speed > 0) {
        const duration = 5 / speed;
        document.documentElement.style.setProperty('--spin-speed', `${duration}s`);
    }
    updateSpinState();
};

speedSlider.addEventListener('input', (e) => {
    updateSpeed(e.target.value);
});

// Initialize speed
updateSpeed(speedSlider.value);

// --- Music Control ---
musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play().catch(err => console.error("Audio play failed:", err));
        musicToggle.textContent = 'Pause Dramatic Music';
    } else {
        bgMusic.pause();
        musicToggle.textContent = 'Play Dramatic Music';
    }
});

// --- Running Around (Wandering) & Animation Loop ---
const animate = () => {
    if (!isDragging && !isSnapping) {
        wanderX += wanderVelX;
        wanderY += wanderVelY;

        const bounceMargin = 150;
        const limitX = window.innerWidth / 2 - bounceMargin;
        const limitY = window.innerHeight / 2 - bounceMargin;

        if (Math.abs(wanderX) > limitX) {
            wanderVelX *= -1;
            wanderX = Math.sign(wanderX) * limitX;
        }
        if (Math.abs(wanderY) > limitY) {
            wanderVelY *= -1;
            wanderY = Math.sign(wanderY) * limitY;
        }

        translateX = wanderX;
        translateY = wanderY;
        monkeyContainer.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }
    requestAnimationFrame(animate);
};

animate();

// --- Dragging Logic ---
const startDrag = (e) => {
    if (isSnapping) return;
    isDragging = true;
    hasDragged = false;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    startX = clientX - translateX;
    startY = clientY - translateY;

    monkeyContainer.style.transition = 'none';
};

const doDrag = (e) => {
    if (!isDragging) return;

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    const newTranslateX = clientX - startX;
    const newTranslateY = clientY - startY;

    if (Math.abs(newTranslateX - (clientX - startX)) > 5 || Math.abs(newTranslateY - (clientY - startY)) > 5) {
        // This check was a bit redundant but kept for safety
    }

    // Simplified hasDragged check
    if (!hasDragged && (Math.abs(newTranslateX - wanderX) > 10 || Math.abs(newTranslateY - wanderY) > 10)) {
        hasDragged = true;
    }

    translateX = newTranslateX;
    translateY = newTranslateY;

    monkeyContainer.style.transform = `translate(${translateX}px, ${translateY}px)`;
};

const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    isSnapping = true;

    // Snap back to center
    translateX = 0;
    translateY = 0;
    wanderX = 0;
    wanderY = 0;

    monkeyContainer.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    monkeyContainer.style.transform = `translate(0px, 0px)`;

    setTimeout(() => {
        isSnapping = false;
        // Randomize direction again
        wanderVelX = (Math.random() - 0.5) * 6;
        wanderVelY = (Math.random() - 0.5) * 6;
    }, 500);
};

// Mouse events
monkeyContainer.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', doDrag);
window.addEventListener('mouseup', stopDrag);

// Touch events
monkeyContainer.addEventListener('touchstart', startDrag);
window.addEventListener('touchmove', doDrag, { passive: false });
window.addEventListener('touchend', stopDrag);
