// ===== Globals & State =====
let currentScreen = 0;
let userName = '';
let quizScore = 0;
let currentQuizQuestion = 0;
let treasuresFound = 0; // repurposed as hits for Glitch Smash
let memoryMatches = 0;
let memoryMoves = 0;
let flippedCards = [];
let soundEnabled = true;
let hackTimer = 45; // Glitch Smash round time (increased from 30s to 45s)
let hackAttempts = 0; // counts successful hits
let glitchMisses = 0; // counts misses
let glitchActiveIndex = -1;
let glitchInterval;
let memoryTimer = 15;
let memoryTimerInterval;
let hackTimerInterval;
let speechRecognition;
let speechRecognized = false;
let wishesCompleted = false; // track if the candle activity is completed
let isNavigating = false; // prevent rapid multiple navigations

const screens = [
    'welcome', 'name-input', 'age-game', 'treasure-hunt', 
    'quiz', 'memory-game', 'secret-message', 'wishes', 'celebration'
];

const quizQuestions = [
    {
        question: "Life mein success ka sabse achha tarika kya hai?",
        options: ["Naye experiences gain karna", "Comfort zone mein rehna", "Challenges se bachna", "Safe khel ke rehna"],
        correct: 0
    },
    {
        question: "Sabse zyada respect kaun si achievement unlock karti hai?",
        options: ["Fake ban ke fit in karna", "Apne aap ko true rakhna", "Crowd follow karna", "Responsibility se bachna"],
        correct: 1
    },
    {
        question: "Dimag ke liye ultimate power-up kya hai?",
        options: ["Pura din TV dekhna", "Naye skills sikhna", "Books se bachna", "Uninformed rehna"],
        correct: 1
    },
    {
        question: "Apni full potential kaise unlock karte hai?",
        options: ["Bahane banake", "Goals set karke hard work karna", "Easily give up karna", "Dusro ko blame karna"],
        correct: 1
    },
    {
        question: "Legendary status ka secret kya hai?",
        options: ["Follower banna", "Leader banna aur dusro ki help karna", "Sirf apne baare mein sochna", "Kabhi risk nahi lena"],
        correct: 1
    }
];

// ===== App Init =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Show loading screen for 3 seconds
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('main-content').classList.remove('hidden');
            createProgressDots();
            updateProgressDots();
            initializeEffects();
            
            // Setup event listeners after DOM is ready and visible
            setupEventListeners();
        }, 500);
    }, 3000);

    createConfetti();
}

// ===== Visual Effects =====
function initializeEffects() {
    createMatrixRain();
    createNeonParticles();
    startDancingCharacters();
}

function createMatrixRain() {
    const matrixContainer = document.querySelector('.matrix-rain');
    if (!matrixContainer) return;
    
    for (let i = 0; i < 5; i++) {
        const rain = document.createElement('div');
        rain.style.position = 'absolute';
        rain.style.top = '-100%';
        rain.style.left = Math.random() * 100 + '%';
        rain.style.color = '#00ff41';
        rain.style.fontFamily = 'Courier New, monospace';
        rain.style.fontSize = '12px';
        rain.style.opacity = '0.3';
        rain.style.animation = `matrix-fall ${10 + Math.random() * 10}s linear infinite`;
        rain.style.animationDelay = Math.random() * 5 + 's';
        rain.textContent = '01010101010101010101';
        matrixContainer.appendChild(rain);
    }
}

function createNeonParticles() {
    const particlesContainer = document.querySelector('.neon-particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = i % 2 === 0 ? '#00ff41' : '#ff0080';
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = `0 0 10px ${i % 2 === 0 ? '#00ff41' : '#ff0080'}`;
        particle.style.top = Math.random() * 100 + '%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animation = `floatParticles ${8 + Math.random() * 4}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 8 + 's';
        particlesContainer.appendChild(particle);
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    console.log('Event listeners setup complete');

    // Global Enter key guard: allow only in specific text inputs; block elsewhere
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter') return;
        const t = e.target;
        const isTextField = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
        const allowedIds = ['birthday-name', 'cipher-input', 'manual-input'];
        const isAllowedTarget = isTextField && allowedIds.includes(t.id);
        // If navigating or not an allowed text field, swallow Enter to avoid accidental button clicks
        if (isNavigating || !isAllowedTarget) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    // Name input
    const submitBtn = document.getElementById('submit-name');
    const nameInput = document.getElementById('birthday-name');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', handleNameSubmit);
    }
    if (nameInput) {
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleNameSubmit();
            }
        });
    }

    // Age game
    setupAgeGame();

    // Quiz
    setupQuiz();

    // Memory game is initialized when its screen becomes active

    // Secret message
    document.getElementById('check-cipher').addEventListener('click', checkCipher);
    document.getElementById('cipher-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); checkCipher(); }
    });

    // Birthday wishes
    document.getElementById('start-listening').addEventListener('click', startSpeechRecognition);
    document.getElementById('candle-flame').addEventListener('click', blowOutCandle);

    // Final celebration
    document.getElementById('restart-adventure').addEventListener('click', restartAdventure);

    // Initial hint on welcome CTA
    const startBtn = document.getElementById('start-adventure');
    if (startBtn) showPointerHint(startBtn);
}

function createProgressDots() {
    const dotsContainer = document.querySelector('.progress-dots');
    dotsContainer.innerHTML = '';
    
    screens.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (index === 0) dot.classList.add('active');
        dotsContainer.appendChild(dot);
    });
}

function updateProgressDots() {
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentScreen);
    });
}

// ===== Navigation & Screens =====
function nextScreen() {
    console.log('nextScreen called, currentScreen:', currentScreen, 'screens.length:', screens.length);
    if (isNavigating) return;
    if (currentScreen < screens.length - 1) {
        isNavigating = true;
        const currentScreenEl = document.getElementById(screens[currentScreen]);
    // Stop any active game timers when leaving a screen
    stopActiveGameTimers();
        currentScreen++;
        const nextScreenEl = document.getElementById(screens[currentScreen]);

        console.log('Moving from:', screens[currentScreen - 1], 'to:', screens[currentScreen]);

        currentScreenEl.classList.remove('active');
        currentScreenEl.classList.add('prev');
        
        setTimeout(() => {
            // Clear any inline transforms/opacities that could persist from back navigation
            nextScreenEl.style.transform = '';
            nextScreenEl.style.opacity = '';
            nextScreenEl.classList.remove('prev');
            nextScreenEl.classList.add('active');
            updateProgressDots();
            // Initialize screen-specific logic after activation
            onScreenEnter(currentScreen);
            // Release the navigation lock after animation completes
            setTimeout(() => { isNavigating = false; }, 600);
        }, 100);
    }
}

// Make nextScreen globally accessible
window.nextScreen = nextScreen;

function prevScreen() {
    if (isNavigating) return;
    if (currentScreen > 0) {
        isNavigating = true;
        const currentScreenEl = document.getElementById(screens[currentScreen]);
        currentScreen--;
        const prevScreenEl = document.getElementById(screens[currentScreen]);

        currentScreenEl.classList.remove('active');
        currentScreenEl.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            prevScreenEl.classList.remove('prev');
            // Clear any inline transforms/opacities before showing previous screen
            prevScreenEl.style.transform = '';
            prevScreenEl.style.opacity = '';
            prevScreenEl.classList.add('active');
            updateProgressDots();
            onScreenEnter(currentScreen);
            // release lock after transition
            setTimeout(() => { isNavigating = false; }, 600);
        }, 100);
    }
}

function handleNameSubmit() {
    const nameInput = document.getElementById('birthday-name');
    userName = nameInput.value.trim();
    
    if (userName) {
    // Prevent repeated submissions via Enter
    const submitBtn = document.getElementById('submit-name');
    if (submitBtn) submitBtn.disabled = true;
    if (nameInput) nameInput.disabled = true;
        playSuccessSound();
        nextScreen();
    } else {
        nameInput.placeholder = "Please apna naam enter karo! 😊";
        nameInput.classList.add('shake');
        setTimeout(() => nameInput.classList.remove('shake'), 500);
    }
}

function setupAgeGame() {
    let step = 1;
    const ageSteps = document.querySelector('.age-steps');
    const ageResult = document.getElementById('age-result');
    const ageNextBtn = document.getElementById('age-next');

    ageSteps.addEventListener('click', (e) => {
        if (e.target.classList.contains('age-btn')) {
            step++;
            
            const messages = [
                "🔍 BRAINWAVES ANALYZE KAR RAHA HUN...",
                "🎯 ANALYSIS COMPLETE! RESULT READY!"
            ];

            if (step <= messages.length) {
                e.target.textContent = messages[step - 1];
                
                if (step === messages.length) {
                    setTimeout(() => {
                        ageResult.innerHTML = `
                            <h3>🔥 LEGENDARY STATUS CONFIRM! 🔥</h3>
                            <p>Age sirf ek number hai - tum MAXIMUM AWESOME level pe operate kar rahe ho!</p>
                            <p>Tumhari power level 9000 se upar hai! ⚡</p>
                            <p>Ready ho next challenge ke liye? Let's go! 🚀</p>
                        `;
                        ageResult.classList.remove('hidden');
                        playSuccessSound();
                        // Show delayed NEXT button after 5 seconds
                        setTimeout(() => {
                            if (ageNextBtn) {
                                ageNextBtn.classList.remove('hidden');
                                ageNextBtn.onclick = () => {
                                    ageNextBtn.classList.add('hidden');
                                    nextScreen();
                                };
                                showPointerHint(ageNextBtn);
                            }
                        }, 5000);
                    }, 1500);
                }
            }
        }
    });
}

// Tutorial pointer hint utility
function showPointerHint(targetEl) {
    if (!targetEl) return;
    // Avoid duplicates
    if (targetEl.querySelector('.pointer-hint')) return;
    const hint = document.createElement('div');
    hint.className = 'pointer-hint';
    hint.textContent = '👉';
    if (getComputedStyle(targetEl).position === 'static') {
        targetEl.style.position = 'relative';
    }
    targetEl.appendChild(hint);
    const remove = () => { if (hint && hint.parentNode) hint.parentNode.removeChild(hint); };
    targetEl.addEventListener('click', remove, { once: true });
    setTimeout(remove, 8000);
}

// ===== Game: Glitch Smash =====
function setupGlitchSmash() {
    const grid = document.getElementById('glitch-grid');
    const holes = grid ? grid.querySelectorAll('.glitch-hole') : [];
    // If grid not present (screen not active), do nothing
    if (!grid || !document.getElementById('treasure-hunt').classList.contains('active')) return;
    const progressFill = document.querySelector('.progress-fill');
    const hackTimeEl = document.getElementById('hack-time');
    const attemptsEl = document.getElementById('hack-attempts');
    const hitsTargetEl = document.getElementById('hits-target');
    const missesEl = document.getElementById('misses');
    const messageEl = document.getElementById('hack-message');

    const hitsTarget = 8; // goal
    hitsTargetEl && (hitsTargetEl.textContent = String(hitsTarget));

    // Reset state
    treasuresFound = 0; // hits
    hackAttempts = 0;
    glitchMisses = 0;
    glitchActiveIndex = -1;
    attemptsEl && (attemptsEl.textContent = '0');
    missesEl && (missesEl.textContent = '0');
    progressFill && (progressFill.style.width = '0%');
    messageEl && (messageEl.innerHTML = '');

    // Reset timer to 45s
    hackTimer = 45;
    hackTimeEl && (hackTimeEl.textContent = hackTimer);
    hackTimeEl && (hackTimeEl.style.color = '#00ff41');
    hackTimeEl && (hackTimeEl.style.animation = 'none');

    // Clear previous intervals if any
    if (hackTimerInterval) clearInterval(hackTimerInterval);
    if (glitchInterval) clearInterval(glitchInterval);

    // Accept input only while target is active
    let acceptingInput = false;

    // Wire hole clicks
    holes.forEach((hole, index) => {
        hole.onclick = () => {
            if (hackTimer <= 0) return;
            // Only count during valid window to avoid late clicks being punished
            if (!acceptingInput) return;

            if (hole.classList.contains('active')) {
                // HIT
                acceptingInput = false;
                hackAttempts++;
                treasuresFound = hackAttempts;
                attemptsEl && (attemptsEl.textContent = String(hackAttempts));
                playSuccessSound();
                // Clear active visual
                hole.classList.remove('active');
                glitchActiveIndex = -1;
                // Progress update
                const progress = Math.min(100, (hackAttempts / hitsTarget) * 100);
                progressFill && (progressFill.style.width = progress + '%');
                if (hackAttempts >= hitsTarget) {
                    endGlitchSmash(true);
                }
            } else {
                // MISS (clicked wrong hole during active window)
                acceptingInput = false;
                glitchMisses++;
                missesEl && (missesEl.textContent = String(glitchMisses));
                playErrorSound();
                // Deactivate any hole if wrong clicked
                holes.forEach(h => h.classList.remove('active'));
                glitchActiveIndex = -1;
                if (glitchMisses >= 5) {
                    endGlitchSmash(false, '⚠️ Too many misses!');
                }
            }
        };
    });

    // Appear cycle for glitches
    const appear = () => {
        // clear previous active
        holes.forEach(h => h.classList.remove('active'));
        acceptingInput = false;
        // pick new index
        glitchActiveIndex = Math.floor(Math.random() * holes.length);
        const hole = holes[glitchActiveIndex];
        if (hole) {
            hole.classList.add('active');
            acceptingInput = true;
            // auto-miss if not clicked within window
        setTimeout(() => {
                if (hole.classList.contains('active') && hackTimer > 0) {
                    // miss due to timeout
                    hole.classList.remove('active');
                    glitchActiveIndex = -1;
                    if (acceptingInput) {
                        acceptingInput = false;
                        glitchMisses++;
                        missesEl && (missesEl.textContent = String(glitchMisses));
                    }
                    if (glitchMisses >= 5) {
                        endGlitchSmash(false, '⚠️ Too many misses!');
                    }
                }
        }, 1300); // 1.3s reaction window (increased from 0.9s)
        }
    };

    // Start cycles
    glitchInterval = setInterval(appear, 1500); // slower spawn: every 1.5s (was 1s)
    appear();

    // Start timer
    hackTimerInterval = setInterval(() => {
        hackTimer--;
        hackTimeEl && (hackTimeEl.textContent = hackTimer);
        if (hackTimer <= 10) {
            hackTimeEl && (hackTimeEl.style.color = '#ff0080');
            hackTimeEl && (hackTimeEl.style.animation = 'pulse 0.5s infinite');
        }
        if (hackTimer <= 0) {
            endGlitchSmash(hackAttempts >= hitsTarget);
        }
    }, 1000);

    function endGlitchSmash(success, reason = '') {
        if (hackTimerInterval) clearInterval(hackTimerInterval);
        if (glitchInterval) clearInterval(glitchInterval);
        holes.forEach(h => h.classList.remove('active'));
        glitchActiveIndex = -1;
        if (success) {
            messageEl && (messageEl.innerHTML = '<span style="color:#00ff41;">🧹 SYSTEM CLEAN! Glitches defeated!</span>');
            setTimeout(() => nextScreen(), 1200);
        } else {
            messageEl && (messageEl.innerHTML = `<span style="color:#ff0080;">⏳ Game over. ${reason} Try again!</span>`);
            setTimeout(() => setupGlitchSmash(), 1500);
        }
    }
}

// ===== Game: Quiz =====
function setupQuiz() {
    showQuizQuestion();
}

function showQuizQuestion() {
    if (currentQuizQuestion < quizQuestions.length) {
        const question = quizQuestions[currentQuizQuestion];
        const questionEl = document.getElementById('quiz-question');
        const optionsEl = document.getElementById('quiz-options');
        const resultEl = document.getElementById('quiz-result');
        const nextBtn = document.getElementById('next-question');
        
        questionEl.textContent = question.question;
        optionsEl.innerHTML = '';
        resultEl.innerHTML = '';
        nextBtn.classList.add('hidden');
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.addEventListener('click', () => handleQuizAnswer(index, button));
            optionsEl.appendChild(button);
        });
    } else {
        finishQuiz();
    }
}

function handleQuizAnswer(selectedIndex, button) {
    const question = quizQuestions[currentQuizQuestion];
    const allButtons = document.querySelectorAll('.option-btn');
    const resultEl = document.getElementById('quiz-result');
    const nextBtn = document.getElementById('next-question');
    
    allButtons.forEach(btn => btn.disabled = true);
    
    if (selectedIndex === question.correct) {
        button.classList.add('correct');
        quizScore++;
        resultEl.innerHTML = '<span style="color: #00ff41;">🔥 SAHI! Tum mast kar rahe ho!</span>';
        playSuccessSound();
    } else {
        button.classList.add('incorrect');
        allButtons[question.correct].classList.add('correct');
        resultEl.innerHTML = '<span style="color: #ff0080;">⚡ Achhi koshish! Optimal choice highlight ho gaya hai.</span>';
        playErrorSound();
    }
    
    document.getElementById('score').textContent = quizScore;
    
    currentQuizQuestion++;
    if (currentQuizQuestion < quizQuestions.length) {
        nextBtn.classList.remove('hidden');
        nextBtn.onclick = () => {
            setTimeout(showQuizQuestion, 300);
        };
    } else {
        setTimeout(() => {
            finishQuiz();
        }, 2000);
    }
}

function finishQuiz() {
    const resultEl = document.getElementById('quiz-result');
    const percentage = (quizScore / quizQuestions.length) * 100;
    
    let message = '';
    if (percentage === 100) {
        message = '🏆 FLAWLESS VICTORY! Tum ek strategic mastermind ho!';
    } else if (percentage >= 80) {
        message = '⚡ EXCELLENT! Tumhara wisdom level legendary hai!';
    } else if (percentage >= 60) {
        message = '🎯 SOLID PERFORMANCE! Tum fast level up kar rahe ho!';
    } else {
        message = '🚀 RESPECTABLE ATTEMPT! Har challenge tumhe stronger banata hai!';
    }
    
    resultEl.innerHTML = `<h3>${message}</h3>`;
    
    setTimeout(() => {
        nextScreen();
    }, 3000);
}

// ===== Game: Memory =====
function setupMemoryGame() {
    const memoryBoard = document.getElementById('memory-board');
    const memoryTimeEl = document.getElementById('memory-time');
    
    // Clear existing cards
    memoryBoard.innerHTML = '';
    
    // Reset timer to 45 seconds for 3x3 grid
    memoryTimer = 45;
    memoryTimeEl.textContent = memoryTimer;
    
    // Create card pairs (4 pairs + 1 bomb = 9 cards total)
    const cardPairs = [
        { type: 'gaming', emoji: '🎮' },
        { type: 'gaming', emoji: '🎮' },
        { type: 'fire', emoji: '🔥' },
        { type: 'fire', emoji: '🔥' },
        { type: 'crown', emoji: '👑' },
        { type: 'crown', emoji: '👑' },
        { type: 'rocket', emoji: '🚀' },
        { type: 'rocket', emoji: '🚀' }
    ];
    
    // Add bomb at random position
    const bombPosition = Math.floor(Math.random() * 9);
    cardPairs.splice(bombPosition, 0, { type: 'bomb', emoji: '💣' });
    
    // Shuffle remaining cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    
    // Create HTML cards
    cardPairs.forEach((cardData, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.card = cardData.type;
        card.dataset.clicking = 'false'; // Initialize click state
        
        if (cardData.type === 'bomb') {
            card.dataset.bombClicks = '0';
        }
        
        card.innerHTML = `
            <div class="card-front">${cardData.emoji}</div>
            <div class="card-back">❓</div>
        `;
        
        // Add click event listener
        card.addEventListener('click', function(event) {
            // Prevent multiple rapid clicks
            if (this.dataset.clicking === 'true') {
                return;
            }
            
            // Check if card can be clicked
            if (this.classList.contains('flipped') || this.classList.contains('matched') || flippedCards.length >= 2) {
                return;
            }
            
            // Mark as being clicked to prevent rapid clicks
            this.dataset.clicking = 'true';
            
            // Handle bomb logic
            if (this.dataset.card === 'bomb') {
                let bombClicks = parseInt(this.dataset.bombClicks) + 1;
                this.dataset.bombClicks = bombClicks;
                
                const bombHitsEl = document.getElementById('bomb-hits');
                bombHitsEl.textContent = bombClicks;
                
                this.classList.add('flipped');
                playErrorSound();
                
                if (bombClicks >= 2) {
                    clearInterval(memoryTimerInterval);
                    showMessage('💥 BOMB EXPLODED! Neural sync challenge restart ho raha hai!');
                    setTimeout(() => {
                        resetMemoryGame();
                    }, 2000);
                    return;
                } else {
                    setTimeout(() => {
                        this.classList.remove('flipped');
                        this.dataset.clicking = 'false'; // Reset clicking state
                    }, 1000);
                    return;
                }
            }
            
            // Regular card logic
            this.classList.add('flipped');
            flippedCards.push(this);
            
            if (flippedCards.length === 2) {
                memoryMoves++;
                document.getElementById('moves').textContent = memoryMoves;
                
                // Disable all cards temporarily while checking match
                const allCards = document.querySelectorAll('.memory-card');
                allCards.forEach(c => c.dataset.clicking = 'true');
                
                setTimeout(() => {
                    checkMemoryMatch();
                    // Re-enable cards after match check
                    allCards.forEach(c => {
                        if (!c.classList.contains('matched')) {
                            c.dataset.clicking = 'false';
                        }
                    });
                }, 1000);
            } else {
                // Reset clicking state for single card
                setTimeout(() => {
                    this.dataset.clicking = 'false';
                }, 100);
            }
            
            playClickSound();
        });
        
        memoryBoard.appendChild(card);
    });
    
    // Add bomb click tracking
    document.getElementById('bomb-hits').textContent = '0';
    
    // Start memory timer
    memoryTimerInterval = setInterval(() => {
        memoryTimer--;
        memoryTimeEl.textContent = memoryTimer;
        
        if (memoryTimer <= 10) {
            memoryTimeEl.style.color = '#ff0080';
            memoryTimeEl.style.animation = 'pulse 0.5s infinite';
        }
        
        if (memoryTimer <= 0) {
            clearInterval(memoryTimerInterval);
            showMessage('⏰ Time up! Memory challenge failed. Try again!');
            setTimeout(() => {
                resetMemoryGame();
            }, 2000);
        }
    }, 1000);
}

function resetMemoryGame() {
    // Reset variables
    memoryMatches = 0;
    memoryMoves = 0;
    memoryTimer = 45;
    flippedCards = [];
    
    // Clear any existing timer
    if (memoryTimerInterval) {
        clearInterval(memoryTimerInterval);
    }
    
    // Reset UI
    document.getElementById('memory-time').textContent = memoryTimer;
    document.getElementById('memory-time').style.color = '#00ff41';
    document.getElementById('memory-time').style.animation = 'none';
    document.getElementById('matches').textContent = '0';
    document.getElementById('moves').textContent = '0';
    document.getElementById('bomb-hits').textContent = '0';
    
    // Reset all existing cards click states
    document.querySelectorAll('.memory-card').forEach(card => {
        card.classList.remove('flipped', 'matched');
        card.dataset.clicking = 'false';
        card.dataset.bombClicks = '0';
    });
    
    // Restart game (this will regenerate cards with new bomb position)
    setupMemoryGame();
}

function checkMemoryMatch() {
    const [card1, card2] = flippedCards;
    
    // Safety check
    if (!card1 || !card2) {
        flippedCards = [];
        return;
    }
    
    if (card1.dataset.card === card2.dataset.card) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.dataset.clicking = 'true'; // Keep matched cards unclickable
        card2.dataset.clicking = 'true';
        
        memoryMatches++;
        document.getElementById('matches').textContent = memoryMatches;
        playSuccessSound();
        
        // Need 4 matches in 3x3 grid (excluding bomb)
        if (memoryMatches === 4) {
            clearInterval(memoryTimerInterval);
            setTimeout(() => {
                showMessage('🧩 NEURAL SYNC COMPLETE! Saare patterns match ho gaye!');
                setTimeout(() => nextScreen(), 2000);
            }, 500);
        }
    } else {
        // Cards don't match - flip them back
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.dataset.clicking = 'false'; // Re-enable clicking
            card2.dataset.clicking = 'false';
        }, 500);
        playErrorSound();
    }
    
    // Clear flipped cards array
    flippedCards = [];
}

// ===== Challenge: Secret Message =====
function checkCipher() {
    const input = document.getElementById('cipher-input').value.toLowerCase().trim();
    const result = document.getElementById('cipher-result');
    
    if (input === 'happy birthday' || input === 'happy birthday!') {
        result.innerHTML = '<span style="color: #00ff41;">🔥 DECRYPTION SUCCESSFUL! Tumne code crack kar diya!</span>';
        playSuccessSound();
        
        setTimeout(() => {
            nextScreen();
        }, 2000);
    } else {
        result.innerHTML = '<span style="color: #ff0080;">🔍 Encryption abhi bhi active hai. Phir try karo! (Hint: A=1, B=2...)</span>';
        playErrorSound();
    }
}

// ===== Wishes (Mic + Candle) =====
function startSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // Stop any existing recognition first
        if (speechRecognition) {
            try {
                speechRecognition.stop();
                speechRecognition = null;
            } catch (e) {
                // Ignore errors when stopping
            }
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechRecognition = new SpeechRecognition();
        
        speechRecognition.lang = 'hi-IN'; // Hindi language
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;
        
        const micStatus = document.getElementById('mic-status');
        const speechResult = document.getElementById('speech-result');
        const startButton = document.getElementById('start-listening');
        
        // Reset UI state
        micStatus.textContent = 'Mic: LISTENING... 🎙️';
        micStatus.style.color = '#ff0080';
        startButton.textContent = '🎙️ LISTENING...';
        startButton.disabled = true;
        startButton.classList.add('listening');
        
        speechRecognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase();
            speechResult.textContent = `Suna gaya: "${transcript}"`;
            
            if (transcript.includes('happy birthday') || transcript.includes('हैप्पी बर्थडे')) {
                speechRecognized = true;
                speechResult.innerHTML = '<span style="color: #00ff41;">✅ Perfect! Ab candle pe tap karo!</span>';
                document.getElementById('wish-instruction').textContent = '🔥 Great! Ab candle tap karo power-up activate karne ke liye!';
                playSuccessSound();
                // Hint on candle after recognition
                const flameEl = document.getElementById('candle-flame');
                showPointerHint(flameEl);
            } else {
                speechResult.innerHTML = '<span style="color: #ff0080;">❌ "Happy Birthday" bolne ki koshish karo!</span>';
                playErrorSound();
            }
            
            // Reset button state
            resetMicButton();
        };
        
        speechRecognition.onerror = function(event) {
            console.log('Speech recognition error:', event.error);
            
            if (event.error === 'not-allowed') {
                speechResult.innerHTML = '<span style="color: #ff0080;">🎙️ Microphone permission denied. Please allow mic access!</span>';
            } else if (event.error === 'no-speech') {
                speechResult.innerHTML = '<span style="color: #ff0080;">🎙️ Koi awaaz nahi suni. Phir try karo!</span>';
            } else {
                speechResult.innerHTML = '<span style="color: #ff0080;">🎙️ Mic issue hai. Manual me "Happy Birthday" type karo!</span>';
                addManualInput();
            }
            
            // Reset button state
            resetMicButton();
        };
        
        speechRecognition.onend = function() {
            // Always reset button when recognition ends
            resetMicButton();
        };
        
        // Start recognition with error handling
        try {
            speechRecognition.start();
        } catch (error) {
            console.log('Error starting speech recognition:', error);
            speechResult.innerHTML = '<span style="color: #ff0080;">🎙️ Mic start nahi hua. Button phir se press karo!</span>';
            resetMicButton();
        }
    } else {
        alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }
}

function resetMicButton() {
    const micStatus = document.getElementById('mic-status');
    const startButton = document.getElementById('start-listening');
    
    micStatus.textContent = 'Mic: OFF';
    micStatus.style.color = '#ffffff';
    startButton.textContent = '🎙️ PHIR SE TRY KARO';
    startButton.disabled = false;
    startButton.classList.remove('listening');
    
    // Clean up recognition instance
    if (speechRecognition) {
        try {
            speechRecognition = null;
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}

function addManualInput() {
    // Check if manual input already exists
    if (document.querySelector('#manual-input')) {
        return;
    }
    
    const manualInput = document.createElement('input');
    manualInput.type = 'text';
    manualInput.id = 'manual-input';
    manualInput.placeholder = 'Type "Happy Birthday" here...';
    manualInput.style.margin = '10px';
    manualInput.style.padding = '10px';
    manualInput.style.borderRadius = '8px';
    manualInput.style.border = '2px solid #00ff41';
    manualInput.style.background = 'rgba(0,0,0,0.8)';
    manualInput.style.color = '#00ff41';
    manualInput.style.display = 'block';
    manualInput.style.width = '100%';
    manualInput.style.maxWidth = '300px';
    
    manualInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            const value = manualInput.value.toLowerCase();
            if (value.includes('happy birthday')) {
                speechRecognized = true;
                document.getElementById('speech-result').innerHTML = '<span style="color: #00ff41;">✅ Perfect! Ab candle pe tap karo!</span>';
                document.getElementById('wish-instruction').textContent = '🔥 Great! Ab candle tap karo power-up activate karne ke liye!';
                manualInput.style.display = 'none';
                playSuccessSound();
            } else {
                manualInput.style.borderColor = '#ff0080';
                manualInput.placeholder = 'Please type "Happy Birthday"';
            }
        }
    });
    
    document.querySelector('.mic-controls').appendChild(manualInput);
}

function blowOutCandle() {
    if (!speechRecognized) {
        showMessage('Pehle "Happy Birthday" bolo, phir candle blow out karo! 🎙️');
        return;
    }
    
    const flame = document.getElementById('candle-flame');
    const wishMessage = document.getElementById('wish-message');
    
    flame.classList.add('blown-out');
    flame.style.animation = 'none';
    
    // Create smoke effect
    createSmokeEffect();
    
    wishMessage.classList.remove('hidden');
    playSuccessSound();
    
    // Start playing Happy Birthday MP3 song after power-up ritual completes
    startHappyBirthdaySong();
    // Mark wishes activity as completed
    wishesCompleted = true;
    
    setTimeout(() => {
        nextScreen();
    }, 3000);
}

function createSmokeEffect() {
    const candle = document.querySelector('.candle-group');
    for (let i = 0; i < 10; i++) {
        const smoke = document.createElement('div');
        smoke.style.position = 'absolute';
        smoke.style.width = '4px';
        smoke.style.height = '4px';
        smoke.style.background = '#888';
        smoke.style.borderRadius = '50%';
        smoke.style.top = '-10px';
        smoke.style.left = '50%';
        smoke.style.transform = 'translateX(-50%)';
        smoke.style.animation = `smoke-rise 2s ease-out forwards`;
        smoke.style.animationDelay = `${i * 0.1}s`;
        candle.appendChild(smoke);
        
        setTimeout(() => smoke.remove(), 2000);
    }
}

// Reset the wishes (candle) activity so user can redo it
function resetWishesScreen() {
    // Stop song and remove indicator if present
    const happyBdaySong = document.getElementById('happy-bday-song');
    if (happyBdaySong) {
        try { happyBdaySong.pause(); happyBdaySong.currentTime = 0; } catch {}
    }
    const indicator = document.getElementById('song-indicator');
    if (indicator) indicator.remove();

    // Reset UI texts and states
    const micStatus = document.getElementById('mic-status');
    const startButton = document.getElementById('start-listening');
    const speechResult = document.getElementById('speech-result');
    const wishInstruction = document.getElementById('wish-instruction');
    if (micStatus) { micStatus.textContent = 'Mic: OFF'; micStatus.style.color = '#ffffff'; }
    if (startButton) { startButton.textContent = '🎙️ PHIR SE TRY KARO'; startButton.disabled = false; startButton.classList.remove('listening'); }
    if (speechResult) { speechResult.textContent = ''; }
    if (wishInstruction) { wishInstruction.textContent = '🎙️ Pehle "Happy Birthday" bolo, phir candle pe tap karo!'; }

    // Reset recognition and completion flags
    speechRecognized = false;
    wishesCompleted = false;

    // Reset candle visuals
    const flame = document.getElementById('candle-flame');
    const wishMessage = document.getElementById('wish-message');
    if (flame) {
        flame.classList.remove('blown-out');
        flame.style.animation = 'flicker 0.5s infinite alternate';
    }
    if (wishMessage) { wishMessage.classList.add('hidden'); }
}

function startHappyBirthdaySong() {
    const happyBdaySong = document.getElementById('happy-bday-song');
    if (happyBdaySong) {
        // Set volume to a comfortable level
        happyBdaySong.volume = 0.7;
        
        // Play the Happy Birthday MP3
        happyBdaySong.play().then(() => {
            console.log('Happy Birthday song started playing');
            showMessage('🎵 Happy Birthday song shuru ho gaya! 🎵');
            
            // Add visual indicator
            const songIndicator = document.createElement('div');
            songIndicator.id = 'song-indicator';
            songIndicator.innerHTML = '🎵 Now Playing: Happy Birthday Song 🎵';
            songIndicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(45deg, #ff0080, #8000ff);
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                font-family: 'Orbitron', monospace;
                font-weight: 600;
                font-size: 14px;
                z-index: 9999;
                animation: pulseGlow 2s ease-in-out infinite;
                box-shadow: 0 4px 20px rgba(255, 0, 128, 0.5);
            `;
            document.body.appendChild(songIndicator);
            
        }).catch(error => {
            console.log('Could not play Happy Birthday song:', error);
            showMessage('🎵 Happy Birthday! (Place Happy Bday.mp3 file in folder) 🎵');
        });
        
        // Add event listener to know when song ends
        happyBdaySong.addEventListener('ended', () => {
            console.log('Happy Birthday song finished');
            const indicator = document.getElementById('song-indicator');
            if (indicator) {
                indicator.remove();
            }
        });
        
        // Remove indicator if song is paused/stopped
        happyBdaySong.addEventListener('pause', () => {
            const indicator = document.getElementById('song-indicator');
            if (indicator) {
                indicator.remove();
            }
        });
        
    } else {
        showMessage('🎵 Happy Birthday! (Audio element not found) 🎵');
    }
}

function showFinalCelebration() {
    const personalMessage = document.getElementById('personal-message');
    personalMessage.innerHTML = `
        <h3>🔥 LEGENDARY STATUS ACHIEVE! ${userName.toUpperCase()}! 🔥</h3>
        <p>Tumne is epic birthday quest ko true champion ki tarah dominate kiya hai!</p>
        <p>Tumhare strategy, memory, aur problem-solving skills bilkul next level hai.</p>
        <p>Is naye saal mein tumhe aur bhi victories, adventures, aur epic moments mile!</p>
        <p>Level up karte raho aur naye challenges conquer karo! ⚡</p>
    `;
    
    // Setup sound controls
    setupCelebrationSounds();
    
    // Start celebration animations
    startCelebrationAnimations();
    
    // Start dancing characters
    createDancingCharacters();
    
    // Add more confetti for celebration
    createConfetti();
    setTimeout(() => createConfetti(), 1000);
    setTimeout(() => createConfetti(), 2000);
    setTimeout(() => createConfetti(), 3000);
    
    // Don't auto-play synthesized song since MP3 should be playing
    // The MP3 song from power-up ritual continues playing here
    console.log('Final celebration screen loaded - MP3 should be playing');
    // Ensure the celebration screen element is fully visible
    const celebrationEl = document.getElementById('celebration');
    if (celebrationEl) {
        celebrationEl.classList.remove('prev');
        celebrationEl.style.opacity = '';
        celebrationEl.style.transform = '';
    }

    // Add a Back to Candle button (avoid duplicates)
    if (!document.getElementById('back-to-wishes')) {
        const backBtn = document.createElement('button');
        backBtn.id = 'back-to-wishes';
        backBtn.textContent = '⬅️ Back to Candle';
        backBtn.style.cssText = `
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 10001;
            padding: 10px 16px;
            border-radius: 10px;
            border: 2px solid #00ff41;
            background: rgba(0,0,0,0.6);
            color: #00ff41;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 255, 65, 0.2);
        `;
        backBtn.addEventListener('click', () => {
            backBtn.remove();
            if (typeof prevScreen === 'function') {
                prevScreen(); // celebration -> wishes
                setTimeout(() => resetWishesScreen(), 150);
            }
        });
        document.body.appendChild(backBtn);
    }
}

// ===== Audio: Celebration SFX =====
function setupCelebrationSounds() {
    const playBirthdayBtn = document.getElementById('play-birthday-song');
    const playApplauseBtn = document.getElementById('play-applause');
    const playCheersBtn = document.getElementById('play-cheers');
    
    if (playBirthdayBtn) {
        playBirthdayBtn.addEventListener('click', playBirthdaySong);
    }
    if (playApplauseBtn) {
        playApplauseBtn.addEventListener('click', playApplause);
    }
    if (playCheersBtn) {
        playCheersBtn.addEventListener('click', playCheers);
    }
}

function playBirthdaySong() {
    // Check if MP3 song is available and play/restart it
    const happyBdaySong = document.getElementById('happy-bday-song');
    
    if (happyBdaySong) {
        // If MP3 exists, play or restart it
        happyBdaySong.currentTime = 0; // Restart from beginning
        happyBdaySong.volume = 0.7;
        
        happyBdaySong.play().then(() => {
            showCelebrationMessage("🎵 Happy Birthday MP3 bajaya ja raha hai! 🎵");
        }).catch(error => {
            console.log('Could not play MP3, falling back to synthesized song');
            playSynthesizedBirthdaySong();
        });
        return;
    }
    
    // Fallback to synthesized song if MP3 not available
    playSynthesizedBirthdaySong();
}

function playSynthesizedBirthdaySong() {
    // Create a synthesized happy birthday melody using Web Audio API
    if (!window.AudioContext && !window.webkitAudioContext) {
        // Fallback: Show message if Web Audio API not supported
        showCelebrationMessage("🎵 Happy Birthday song bajega! 🎵");
        return;
    }
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [
        {freq: 261.63, duration: 0.5}, // C
        {freq: 261.63, duration: 0.5}, // C  
        {freq: 293.66, duration: 1},   // D
        {freq: 261.63, duration: 1},   // C
        {freq: 349.23, duration: 1},   // F
        {freq: 329.63, duration: 2},   // E
        {freq: 261.63, duration: 0.5}, // C
        {freq: 261.63, duration: 0.5}, // C
        {freq: 293.66, duration: 1},   // D
        {freq: 261.63, duration: 1},   // C
        {freq: 392.00, duration: 1},   // G
        {freq: 349.23, duration: 2}    // F
    ];
    
    let currentTime = audioContext.currentTime;
    
    notes.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(note.freq, currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);
        
        currentTime += note.duration;
    });
    
    showCelebrationMessage("🎵 Synthesized Happy Birthday melody playing! 🎵");
}

function playApplause() {
    if (!window.AudioContext && !window.webkitAudioContext) {
        showCelebrationMessage("👏 Wah! Zabardast performance! 👏");
        return;
    }
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // White noise-based applause
    for (let i = 0; i < 10; i++) {
        const bufferSize = audioContext.sampleRate * 0.3;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let j = 0; j < bufferSize; j++) {
            output[j] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        whiteNoise.buffer = buffer;
        filter.type = 'bandpass';
        filter.frequency.value = 1000 + Math.random() * 2000;
        
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime + i * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + i * 0.1 + 0.3);
        
        whiteNoise.start(audioContext.currentTime + i * 0.1);
        whiteNoise.stop(audioContext.currentTime + i * 0.1 + 0.3);
    }
    
    showCelebrationMessage("👏 Sabash! Taaliyan bajj rahi hain! 👏");
}

function playCheers() {

    const cheersEl = document.getElementById('cheers-sound');
    let played = false;
    if (cheersEl) {
        try {
            if (!cheersEl._boostedCtx) {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const src = ctx.createMediaElementSource(cheersEl);
                const gain = ctx.createGain();
                src.connect(gain);
                gain.connect(ctx.destination);
                cheersEl._boostedCtx = ctx;
                cheersEl._boostedGain = gain;
            }
            cheersEl._boostedGain.gain.value = 8.0;
            if (cheersEl._boostedCtx.state === 'suspended') {
                cheersEl._boostedCtx.resume().catch(() => {});
            }
            cheersEl.currentTime = 0;
            cheersEl.play().then(() => { played = true; }).catch(() => {});
        } catch (e) {
            cheersEl.volume = 1.0;
            try { cheersEl.currentTime = 0; cheersEl.play().then(() => { played = true; }); } catch {}
        }
    }
    if (!played && (window.AudioContext || window.webkitAudioContext)) {
        // Tiny synthesized cheer burst as a last resort
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        } catch {}
    }
    showCelebrationMessage("🥳 Hip Hip Hooray! Birthday Superstar! 🥳");
    triggerExtraFireworks();
}

function showCelebrationMessage(message) {
    // Create temporary message overlay
    const messageDiv = document.createElement('div');
    messageDiv.className = 'celebration-toast';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(45deg, #ff0080, #8000ff);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-family: 'Orbitron', monospace;
        font-weight: 600;
        font-size: 16px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(255, 0, 128, 0.5);
        animation: slideInDown 0.5s ease-out, fadeOut 0.5s ease-in 2.5s forwards;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

function startCelebrationAnimations() {
    // Add staggered animation delays to badges
    const badges = document.querySelectorAll('.badge');
    badges.forEach((badge, index) => {
        setTimeout(() => {
            badge.style.animation = 'bounceIn 0.6s ease-out forwards';
        }, index * 200);
    });
    
    // Add dancing animation to letters after a delay
    setTimeout(() => {
        const letters = document.querySelectorAll('.dance-letter');
        letters.forEach(letter => {
            letter.style.animation = 'letterDance 2s ease-in-out infinite';
        });
    }, 1000);
}

function triggerExtraFireworks() {
    // Create additional firework elements
    const fireworksContainer = document.querySelector('.fireworks-container');
    if (!fireworksContainer) return;
    
    for (let i = 0; i < 6; i++) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            top: ${Math.random() * 80}%;
            left: ${Math.random() * 80}%;
            animation: fireworkExplode 2s ease-out;
        `;
        
        fireworksContainer.appendChild(firework);
        
        setTimeout(() => {
            if (firework.parentNode) {
                firework.parentNode.removeChild(firework);
            }
        }, 2000);
    }
}

function startDancingCharacters() {
    // Only start dancing characters if on celebration screen
    if (currentScreen === screens.length - 1) {
        createDancingCharacters();
    }
}

function createDancingCharacters() {
    const celebrationScreen = document.getElementById('celebration');
    if (!celebrationScreen) return;
    
    // Create container for dancing characters if it doesn't exist
    let dancingContainer = celebrationScreen.querySelector('.dancing-characters');
    if (!dancingContainer) {
        dancingContainer = document.createElement('div');
        dancingContainer.className = 'dancing-characters';
        dancingContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        celebrationScreen.appendChild(dancingContainer);
    }
    
    // Array of different dancing characters - EXPANDED with more face emojis
    const characters = [
        '🤖', '🕺', '💃', '🤺', '🚶‍♂️', '🏃‍♀️', '🧙‍♂️', '🦾', '🦿', '👾',
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉',
        '😊', '😇', '🥰', '😍', '�', '😘', '😗', '😚', '😋', '😛',
        '😜', '�', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
        '�', '�', '🙄', '😬', '�', '�', '�', '�', '�', '�',
        '🎭', '🎪', '🎨', '🎯', '🎲', '🎳', '🎵', '🎶', '🎸', '🥳',
        '👻', '🎃', '🎈', '🎁', '🎀', '⭐', '💫', '✨', '🔥', '💥',
        '🚀', '🛸', '🌟', '💎', '👑', '🏆', '🎊', '🎉', '🥇', '🏅'
    ];
    
    // Stick figure representations using text - EXPANDED
    const stickFigures = [
        'o/|\\', 'o\\|/', 'o-|-', 'o/|/', 'o\\|\\', 'o|o|', '/o\\', '\\o/',
        '\\o/', '/o\\', 'o^o', 'o-o', 'o~o', 'o*o', 'o@o', 'o#o',
        'ᕕ( ᐛ )ᕗ', '\\(^o^)/', '(ノ◕ヮ◕)ノ', 'ヽ(°〇°)ﾉ', '┌(・。・)┘', '♪┏(・o･)┛♪'
    ];
    
    // Robot ASCII representations - EXPANDED
    const robotFigures = [
        '▢◊▢', '♦▢♦', '◘▣◘', '▣♦▣', '◊▢◊', '♠▢♠',
        '【◉】', '〖●〗', '╫◎╫', '≡○≡', '◈▼◈', '◇■◇',
        '▲●▲', '►◄', '◄►', '▼▲', '●○●', '○●○'
    ];
    
    setInterval(() => {
        // Increased spawn rate for more characters (60% chance)
        if (Math.random() < 0.6) {
            spawnDancingCharacter(dancingContainer, characters, stickFigures, robotFigures);
        }
    }, 500); // Check every 500ms for faster spawning
}

function spawnDancingCharacter(container, characters, stickFigures, robotFigures) {
    const characterType = Math.random();
    let characterText = '';
    let fontSize = '24px';
    let color = '#00ff41';
    
    // Disco color palette
    const discoColors = [
        '#ff0080', '#ff8000', '#80ff00', '#0080ff', '#8000ff',
        '#ff0040', '#40ff00', '#0040ff', '#ff4080', '#4080ff',
        '#ffff00', '#ff00ff', '#00ffff', '#ff6600', '#6600ff'
    ];
    
    // 40% emoji, 30% stick figure, 30% robot
    if (characterType < 0.4) {
        characterText = characters[Math.floor(Math.random() * characters.length)];
        fontSize = Math.random() * 20 + 24 + 'px'; // 24-44px
        color = discoColors[Math.floor(Math.random() * discoColors.length)];
    } else if (characterType < 0.7) {
        characterText = stickFigures[Math.floor(Math.random() * stickFigures.length)];
        fontSize = Math.random() * 10 + 18 + 'px'; // 18-28px
        color = discoColors[Math.floor(Math.random() * discoColors.length)];
    } else {
        characterText = robotFigures[Math.floor(Math.random() * robotFigures.length)];
        fontSize = Math.random() * 8 + 16 + 'px'; // 16-24px
        color = discoColors[Math.floor(Math.random() * discoColors.length)];
    }
    
    const character = document.createElement('div');
    character.className = 'dancing-character';
    character.textContent = characterText;
    
    // Random animation type
    const animationType = Math.floor(Math.random() * 4);
    const animations = ['slideLeftToRight', 'slideRightToLeft', 'popAndDance', 'bounceInOut'];
    const animationName = animations[animationType];
    
    // Random starting position
    const startY = Math.random() * 70 + 15; // 15% to 85% from top
    const duration = Math.random() * 2 + 1.5; // 1.5-3.5 seconds for faster movement
    
    // Add sparkle effect randomly
    const hasSparkle = Math.random() < 0.3;
    const sparkleEffect = hasSparkle ? `, sparkle ${duration * 0.5}s ease-in-out infinite` : '';
    
    character.style.cssText = `
        position: absolute;
        font-family: 'Fredoka One', cursive;
        font-size: ${fontSize};
        font-weight: bold;
        color: ${color};
        text-shadow: 
            0 0 10px ${color},
            0 0 20px ${color},
            0 0 30px ${color};
        top: ${startY}%;
        animation: ${animationName} ${duration}s ease-in-out${sparkleEffect};
        z-index: 2;
        pointer-events: none;
        filter: drop-shadow(0 0 5px ${color});
    `;
    
    // Set initial position based on animation type
    if (animationName === 'slideLeftToRight') {
        character.style.left = '-100px';
    } else if (animationName === 'slideRightToLeft') {
        character.style.right = '-100px';
    } else {
        character.style.left = Math.random() * 80 + 10 + '%';
    }
    
    container.appendChild(character);
    
    // Remove character after animation completes
    setTimeout(() => {
        if (character.parentNode) {
            character.parentNode.removeChild(character);
        }
    }, duration * 1000 + 500);
}

function restartAdventure() {
    // Reset all variables
    currentScreen = 0;
    userName = '';
    quizScore = 0;
    currentQuizQuestion = 0;
    treasuresFound = 0;
    memoryMatches = 0;
    memoryMoves = 0;
    flippedCards = [];
    
    // Reset UI elements
    document.getElementById('birthday-name').value = '';
    document.getElementById('birthday-name').disabled = false;
    const submitBtn = document.getElementById('submit-name');
    if (submitBtn) submitBtn.disabled = false;
    document.getElementById('score').textContent = '0';
    document.getElementById('matches').textContent = '0';
    document.getElementById('moves').textContent = '0';
    document.getElementById('cipher-input').value = '';
    
    // Reset Glitch Smash
    const progress = document.querySelector('.progress-fill');
    if (progress) progress.style.width = '0%';
    const msg = document.getElementById('hack-message');
    if (msg) msg.textContent = '';
    const timeEl = document.getElementById('hack-time');
    if (timeEl) { timeEl.textContent = '45'; timeEl.style.color = '#00ff41'; timeEl.style.animation = 'none'; }
    const hitEl = document.getElementById('hack-attempts');
    if (hitEl) hitEl.textContent = '0';
    const missEl = document.getElementById('misses');
    if (missEl) missEl.textContent = '0';
    
    // Reset memory game
    document.querySelectorAll('.memory-card').forEach(card => {
        card.classList.remove('flipped', 'matched');
        card.dataset.clicking = 'false';
        card.dataset.bombClicks = '0';
    });
    
    // Clear timers
    if (memoryTimerInterval) {
        clearInterval(memoryTimerInterval);
    }
    if (hackTimerInterval) {
        clearInterval(hackTimerInterval);
    }
    if (glitchInterval) {
        clearInterval(glitchInterval);
    }
    
    // Stop Happy Birthday MP3 song if playing
    const happyBdaySong = document.getElementById('happy-bday-song');
    if (happyBdaySong) {
        happyBdaySong.pause();
        happyBdaySong.currentTime = 0;
    }
    // Remove back-to-wishes button if present
    const backBtn = document.getElementById('back-to-wishes');
    if (backBtn) backBtn.remove();
    
    // Remove song indicator if present
    const songIndicator = document.getElementById('song-indicator');
    if (songIndicator) {
        songIndicator.remove();
    }
    
    // Clean up dancing characters
    const dancingContainer = document.querySelector('.dancing-characters');
    if (dancingContainer) {
        dancingContainer.remove();
    }
    
    // Reset speech recognition
    speechRecognized = false;
    wishesCompleted = false;
    
    // Reset candle
    const flame = document.getElementById('candle-flame');
    flame.classList.remove('blown-out');
    flame.style.animation = 'flicker 0.5s infinite alternate';
    
    // Hide result elements
    document.querySelectorAll('.hidden').forEach(el => el.classList.add('hidden'));
    
    // Show first screen
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active', 'prev');
    });
    document.getElementById('welcome').classList.add('active');
    
    updateProgressDots();
    // Do not start games yet; they will start when screens are visited
}

function createConfetti() {
    const container = document.querySelector('.confetti-container') || document.querySelector('.matrix-rain');
    if (!container) return;
    
    const colors = ['#00ff41', '#ff0080', '#00d4aa', '#ff8c00', '#0080ff', '#ff4000'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        container.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 5000);
    }
}

function showMessage(text) {
    const message = document.createElement('div');
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.background = 'rgba(255, 255, 255, 0.95)';
    message.style.padding = '20px';
    message.style.borderRadius = '15px';
    message.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    message.style.fontSize = '18px';
    message.style.fontWeight = '600';
    message.style.color = '#333';
    message.style.zIndex = '10000';
    message.style.animation = 'fadeInUp 0.5s ease';
    message.textContent = text;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 500);
    }, 2000);
}

function playSuccessSound() {
    if (soundEnabled) {
        // Create a simple success sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

function playErrorSound() {
    if (soundEnabled) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
}

function playClickSound() {
    if (soundEnabled) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// Add CSS animation for smoke
const smokeStyle = document.createElement('style');
smokeStyle.textContent = `
    @keyframes smoke-rise {
        0% {
            opacity: 0.8;
            transform: translateX(-50%) translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-30px) scale(1.5);
        }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(smokeStyle);

// Update celebration when reaching final screen
const originalNextScreen = nextScreen;
nextScreen = function() {
    // Block navigation from wishes until completed
    if (screens[currentScreen] === 'wishes' && !wishesCompleted) {
        showMessage('Complete the mic + candle activity before continuing!');
        return;
    }
    if (currentScreen === screens.length - 2) {
        // About to show celebration screen
        setTimeout(showFinalCelebration, 100);
    }
    originalNextScreen();
    // After navigation, show contextual hints
    setTimeout(() => {
        const currentId = screens[currentScreen];
        if (currentId === 'name-input') {
            const submit = document.getElementById('submit-name');
            showPointerHint(submit);
        } else if (currentId === 'age-game') {
            const analyzeBtn = document.querySelector('.age-btn');
            showPointerHint(analyzeBtn);
        } else if (currentId === 'secret-message') {
            const decryptBtn = document.getElementById('check-cipher');
            showPointerHint(decryptBtn);
        } else if (currentId === 'wishes') {
            const micBtn = document.getElementById('start-listening');
            showPointerHint(micBtn);
        }
    }, 200);
};

// Initialize screen-specific features only when screen becomes active
function onScreenEnter(index) {
    const id = screens[index];
    if (id === 'treasure-hunt') {
        setupGlitchSmash();
    } else if (id === 'memory-game') {
        setupMemoryGame();
    }
}

// Clear any running game timers/intervals when navigating away
function stopActiveGameTimers() {
    if (memoryTimerInterval) {
        clearInterval(memoryTimerInterval);
        memoryTimerInterval = null;
    }
    if (hackTimerInterval) {
        clearInterval(hackTimerInterval);
        hackTimerInterval = null;
    }
    if (glitchInterval) {
        clearInterval(glitchInterval);
        glitchInterval = null;
    }
    // Clean up any floating UI from celebration when navigating away
    const backBtn = document.getElementById('back-to-wishes');
    if (backBtn && screens[currentScreen] !== 'celebration') {
        backBtn.remove();
    }
}
