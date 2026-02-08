document.addEventListener('DOMContentLoaded', () => {
    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');
    const proposalContent = document.getElementById('proposal-content');
    const successMessage = document.getElementById('success-message');
    const mainContainer = document.querySelector('.main-container');

    const characterContainer = document.querySelector('.character-container');
    const elephantSvg = document.getElementById('elephant-svg');
    const questionSection = document.querySelector('.question-section');

    // Valid state management
    let resetTimer = null;
    let isCelebrating = false;

    // Emotion Management via CSS Classes
    function setEmotion(emotionType) {
        // Reset all emotions first
        characterContainer.classList.remove('excited', 'sad', 'angry', 'love');
        if (emotionType !== 'default') { // Add new emotion class if passed (except 'default')
            characterContainer.classList.add(emotionType);
        }

        // Clear any pending reset
        if (resetTimer) {
            clearTimeout(resetTimer);
            resetTimer = null;
        }
    }

    function resetEmotionDelayed(delay = 1000) {
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            setEmotion('default');
        }, delay);
    }

    // --- Mouse Tracking & Proximity Logic ---
    document.addEventListener('mousemove', (e) => {
        if (isCelebrating) return;

        // 1. Move Elephant Head (Subtle Parallax on SVG)
        const x = (window.innerWidth / 2 - e.clientX) / 30; // gentler
        const y = (window.innerHeight / 2 - e.clientY) / 30;
        if (elephantSvg) elephantSvg.style.transform = `translate(${x}px, ${y}px)`;

        // 2. Proximity Check
        const yesRect = yesBtn.getBoundingClientRect();
        const noRect = noBtn.getBoundingClientRect();

        const yesCenter = { x: yesRect.left + yesRect.width / 2, y: yesRect.top + yesRect.height / 2 };
        const noCenter = { x: noRect.left + noRect.width / 2, y: noRect.top + noRect.height / 2 };

        const distYes = Math.hypot(e.clientX - yesCenter.x, e.clientY - yesCenter.y);
        const distNo = Math.hypot(e.clientX - noCenter.x, e.clientY - noCenter.y);

        // Decide Emotion based on distance
        // Priority: Hovering buttons (handled by listeners) > Proximity

        // Only override if not currently in a "forced" state (like angry from a recent jump)
        // Check if we are currently hovering a button? Actually, listeners handle that best.
        // We act as the "default" state provider when not hovering.

        // Start from neutral
        if (!characterContainer.classList.contains('angry') && !characterContainer.classList.contains('love')) {
            if (distYes < 200) {
                if (!characterContainer.classList.contains('excited')) setEmotion('excited');
            } else if (distNo < 200) {
                if (!characterContainer.classList.contains('sad')) setEmotion('sad');
            } else {
                // If far from both, revert to default
                if (characterContainer.classList.contains('excited') || characterContainer.classList.contains('sad')) {
                    setEmotion('default');
                }
            }
        }
    });

    // --- Floating Hearts Background ---
    function createHeart() {
        // ... (existing helper if needed, but we keep the interval logic below)
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.style.left = Math.random() * 100 + "vw";
        // ... rest same
        heart.style.animationDuration = Math.random() * 2 + 3 + "s";
        document.querySelector('.heart-bg').appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 5000);
    }

    setInterval(createHeart, 300);

    // --- "No" Button Interaction ---
    const funnyMessages = [
        "Are you sure? 😢",
        "Be my Valentine? 🥺",
        "Don't break my heart! 💔",
        "I have chocolates! 🍫",
        "Pretty please? 🌹",
        "Think again! 🤔",
        "Look at the other button! 👉",
        "I'll be so sad... 😿",
        "You can't say no! 🚫"
    ];

    let yesScale = 1;

    function moveNoButton() {
        if (isCelebrating) return;

        // CRITICAL FIX: Move button to body to escape container stacking context
        if (noBtn.parentNode !== document.body) {
            const rect = noBtn.getBoundingClientRect();
            document.body.appendChild(noBtn);
            noBtn.style.position = 'fixed';
            noBtn.style.left = rect.left + 'px';
            noBtn.style.top = rect.top + 'px';
        }

        // Quick "Grab" or "Run Away" effect
        setEmotion('angry');

        // Move button
        const btnRect = noBtn.getBoundingClientRect();
        const safeMargin = 20;
        const maxX = window.innerWidth - btnRect.width - safeMargin;
        const maxY = window.innerHeight - btnRect.height - safeMargin;

        const randomX = Math.max(safeMargin, Math.floor(Math.random() * maxX));
        const randomY = Math.max(safeMargin, Math.floor(Math.random() * maxY));

        noBtn.style.position = 'fixed';
        noBtn.style.left = randomX + 'px';
        noBtn.style.top = randomY + 'px';
        noBtn.style.zIndex = '9999';

        const randomRotation = Math.random() * 40 - 20;
        noBtn.style.transform = `rotate(${randomRotation}deg)`;

        // Funny text
        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        noBtn.textContent = randomMessage;

        // Grow Yes button
        yesScale += 0.2;
        yesBtn.style.transform = `scale(${yesScale})`;

        // Reset to default after a delay to show the anger/shock
        resetEmotionDelayed(1500);
    }

    noBtn.addEventListener('mouseover', moveNoButton);
    noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); });
    noBtn.addEventListener('click', (e) => { e.preventDefault(); moveNoButton(); });

    // --- Character Emotion Logic - Listeners ---

    // Yes Button Hover -> Excited
    yesBtn.addEventListener('mouseenter', () => {
        setEmotion('excited');
    });

    yesBtn.addEventListener('mouseleave', () => {
        setEmotion('default');
    });

    // No Button Hover -> Sad (handled by moveNoButton as angry/shock, but we can add sad if just hovering close)
    // The proximity check handles the "sad" approach. 
    // The "move" handles the interaction.

    // --- "Yes" Button Interaction ---
    yesBtn.addEventListener('click', () => {
        isCelebrating = true;
        setEmotion('love');

        // Lock UI
        yesBtn.replaceWith(yesBtn.cloneNode(true));
        noBtn.style.display = 'none';

        triggerConfetti();

        // Animate out question
        proposalContent.classList.add('fade-out');

        setTimeout(() => {
            proposalContent.style.display = 'none';
            successMessage.classList.remove('hidden');
            successMessage.style.display = 'block';
            fireHeartConfetti();
        }, 500);
    });

    function triggerConfetti() {
        // Simple confetti from canvas-confetti
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // multiple origins
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        // Also fire some hearts specifically
        fireHeartConfetti();
    }

    function fireHeartConfetti() {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            shapes: ['heart'],
            colors: ['#d15a5a', '#ffb7b2', '#ff9a9e']
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }
});
