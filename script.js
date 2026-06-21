(function () {
  "use strict";

  const HEART_TONES = ['#C84B5A', '#F7C6C7', '#E18A95', '#A53847', '#D98C95'];

  function makeHeartSvg(size, fill) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 32 29');
    svg.setAttribute('class', 'heart-icon');
    svg.style.width = size + 'px';
    svg.style.height = (size * (29 / 32)) + 'px';
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#heart-shape');
    use.style.fill = fill;
    svg.appendChild(use);
    return svg;
  }

  /* ============ Cœurs SVG flottants en fond ============ */
  const bgHearts = document.getElementById('bgHearts');

  function spawnBgHeart() {
    const size = 10 + Math.random() * 26;
    const fill = HEART_TONES[Math.floor(Math.random() * HEART_TONES.length)];
    const svg = makeHeartSvg(size, fill);
    svg.classList.add('bg-heart');
    svg.style.left = Math.random() * 100 + '%';
    const duration = 7 + Math.random() * 14;
    svg.style.animationDuration = duration + 's';
    svg.style.animationDelay = (Math.random() * 6) + 's';
    svg.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
    svg.style.setProperty('--rot', (Math.random() * 50 - 10) + 'deg');
    svg.style.setProperty('--maxop', (0.3 + Math.random() * 0.5).toFixed(2));
    bgHearts.appendChild(svg);
  }

  for (let i = 0; i < 22; i++) spawnBgHeart();

  /* ============ Éléments communs ============ */
  const titleEl = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitleEl');
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const mainContent = document.getElementById('mainContent');
  const gameCatch = document.getElementById('gameCatch');
  const gamePop = document.getElementById('gamePop');
  const successScreen = document.getElementById('successScreen');

  /* Pulsation douce et continue du titre */
  anime({
    targets: titleEl,
    scale: [1, 1.035],
    duration: 1900,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine'
  });

  /* ============ Logique du bouton "Non" qui fuit ============ */
  let noScale = 1;
  let yesScale = 1;
  const NO_SHRINK_STEP = 0.12;
  const NO_DISAPPEAR_THRESHOLD = 0.18;
  const YES_MAX_SCALE = 1.9;
  const YES_GROW_STEP = 0.09;

  let isFleeing = false;
  let hasEscapedOnce = false;
  let noVisible = true;
  let onQuestionScreen = true;

  function lockNoBtnPosition() {
    const rect = noBtn.getBoundingClientRect();
    noBtn.style.position = 'fixed';
    noBtn.style.margin = '0';
    noBtn.style.left = rect.left + 'px';
    noBtn.style.top = rect.top + 'px';
    hasEscapedOnce = true;
  }

  function fleeNoButton() {
    if (!onQuestionScreen || isFleeing || !noVisible) return;
    isFleeing = true;

    if (!hasEscapedOnce) lockNoBtnPosition();

    noScale = noScale - NO_SHRINK_STEP;

    if (yesScale < YES_MAX_SCALE) {
      yesScale = Math.min(YES_MAX_SCALE, yesScale + YES_GROW_STEP);
      anime({ targets: yesBtn, scale: yesScale, rotate: '-1.4deg', duration: 420, easing: 'easeOutBack' });
    }

    if (noScale <= NO_DISAPPEAR_THRESHOLD) {
      noVisible = false;
      isFleeing = false;
      anime({
        targets: noBtn,
        scale: 0,
        opacity: 0,
        duration: 320,
        easing: 'easeInBack',
        complete: () => { noBtn.classList.add('gone'); }
      });
      return;
    }

    const rect = noBtn.getBoundingClientRect();
    const margin = 10;
    const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxY = Math.max(margin, window.innerHeight - rect.height - margin);
    const newX = margin + Math.random() * (maxX - margin);
    const newY = margin + Math.random() * (maxY - margin);

    anime({
      targets: noBtn,
      left: newX,
      top: newY,
      scale: noScale,
      rotate: hasEscapedOnce ? '0deg' : '1.6deg',
      duration: 560,
      easing: 'easeOutElastic(1, 0.7)',
      complete: () => { isFleeing = false; }
    });
  }

  function resetNoYesButtons() {
    anime.remove(noBtn);
    anime.remove(yesBtn);

    noScale = 1;
    yesScale = 1;
    isFleeing = false;
    hasEscapedOnce = false;
    noVisible = true;
    noBtn.classList.remove('gone');
    noBtn.style.position = '';
    noBtn.style.left = '';
    noBtn.style.top = '';
    noBtn.style.margin = '';
    noBtn.style.transform = 'scale(0) rotate(1.6deg)';
    noBtn.style.opacity = '0';
    yesBtn.style.transform = 'scale(0) rotate(-1.4deg)';
    yesBtn.style.opacity = '0';

    anime({ targets: yesBtn, scale: 1, opacity: 1, rotate: '-1.4deg', duration: 420, delay: 120, easing: 'easeOutBack' });
    anime({ targets: noBtn, scale: 1, opacity: 1, rotate: '1.6deg', duration: 420, delay: 220, easing: 'easeOutBack' });
  }

  const PROXIMITY_RADIUS = 110;

  function checkProximity(clientX, clientY) {
    if (!onQuestionScreen || !noVisible) return;
    const rect = noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(clientX - cx, clientY - cy);
    if (dist < PROXIMITY_RADIUS) fleeNoButton();
  }

  window.addEventListener('mousemove', (e) => checkProximity(e.clientX, e.clientY));

  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    fleeNoButton();
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      checkProximity(t.clientX, t.clientY);
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!hasEscapedOnce || !onQuestionScreen || !noVisible) return;
    const rect = noBtn.getBoundingClientRect();
    const margin = 10;
    const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxY = Math.max(margin, window.innerHeight - rect.height - margin);
    const curLeft = parseFloat(noBtn.style.left) || 0;
    const curTop = parseFloat(noBtn.style.top) || 0;
    noBtn.style.left = Math.min(curLeft, maxX) + 'px';
    noBtn.style.top = Math.min(curTop, maxY) + 'px';
  });

  /* ============ Séquence complète : questions + mini-jeux + fin ============ */
  const subtitles = [
    "(prends ton temps, mais pas trop 😌)",
    "(c'est officiel, y'a pas de retour en arrière après ça 👀)",
    "(je commence à stresser un peu là 😅)",
    "(dernière chance de me dire la vérité 💗)"
  ];
  const steps = [
    "Veux-tu être ma copine, Anahit ? 💕",
    "Es-tu vraiment sûre ? 🥺",
    "Mais vraiment vraiment sûre ?! 😳",
    "Genre sûre sûre sûre ?!! 💗"
  ];

  const sequence = [
    { type: 'question', text: steps[0], sub: subtitles[0] },
    { type: 'gameCatch' },
    { type: 'question', text: steps[1], sub: subtitles[1] },
    { type: 'gamePop' },
    { type: 'question', text: steps[2], sub: subtitles[2] },
    { type: 'question', text: steps[3], sub: subtitles[3] },
    { type: 'final' }
  ];
  let seqIndex = 0;

  const screenEls = { question: mainContent, gameCatch: gameCatch, gamePop: gamePop, final: successScreen };

  function showScreen(el) {
    el.hidden = false;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.92)';
    anime({
      targets: el,
      opacity: [0, 1],
      scale: [0.92, 1],
      duration: 480,
      easing: 'easeOutCubic'
    });
  }

  function hideScreen(el, onDone) {
    anime({
      targets: el,
      opacity: [1, 0],
      scale: [1, 0.95],
      duration: 230,
      easing: 'easeInCubic',
      complete: () => {
        el.hidden = true;
        el.style.opacity = '';
        el.style.transform = '';
        if (onDone) onDone();
      }
    });
  }

  function renderCurrent(previousEl) {
    const item = sequence[seqIndex];
    const nextEl = screenEls[item.type];
    onQuestionScreen = (item.type === 'question');

    const reveal = () => {
      if (item.type === 'question') {
        titleEl.textContent = item.text;
        subtitleEl.textContent = item.sub;
        resetNoYesButtons();
      } else if (item.type === 'gameCatch') {
        startGameCatch();
      } else if (item.type === 'gamePop') {
        startGamePop();
      } else if (item.type === 'final') {
        startFinale();
      }
      showScreen(nextEl);
    };

    if (previousEl && !previousEl.hidden) {
      hideScreen(previousEl, reveal);
    } else {
      reveal();
    }
  }

  function goToNext() {
    const item = sequence[seqIndex];
    const currentEl = screenEls[item.type];
    seqIndex++;
    renderCurrent(currentEl);
  }

  yesBtn.addEventListener('click', () => {
    if (!onQuestionScreen) return;
    goToNext();
  });

  /* ============ Mini-jeu : attrape les cœurs ============ */
  const catchArea = document.getElementById('catchArea');
  const basket = document.getElementById('basket');
  const catchCounter = document.getElementById('catchCounter');

  let catchHearts = [];
  let caughtCount = 0;
  let catchSpawnInterval = null;
  let catchRaf = null;

  function updateCatchCounter() {
    catchCounter.textContent = `${caughtCount} / 5 cœurs attrapés`;
  }

  function onCatchPointerMove(e) {
    const rect = catchArea.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(24, Math.min(rect.width - 24, x));
    basket.style.left = x + 'px';
  }

  function onCatchTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      e.preventDefault();
      onCatchPointerMove(e.touches[0]);
    }
  }

  function spawnFallingHeart() {
    const size = 24 + Math.random() * 10;
    const fill = HEART_TONES[Math.floor(Math.random() * HEART_TONES.length)];
    const svg = makeHeartSvg(size, fill);
    svg.classList.add('falling-heart');
    const areaWidth = catchArea.clientWidth;
    const x = 20 + Math.random() * Math.max(20, areaWidth - 40);
    svg.style.left = x + 'px';
    catchArea.appendChild(svg);
    catchHearts.push({ el: svg, top: 0, speed: 1.5 + Math.random() * 1.3 });
  }

  function rectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  function catchLoop() {
    const areaHeight = catchArea.clientHeight;
    const basketRect = basket.getBoundingClientRect();

    for (let i = catchHearts.length - 1; i >= 0; i--) {
      const h = catchHearts[i];
      h.top += h.speed;
      h.el.style.top = h.top + 'px';

      if (h.top > areaHeight + 20) {
        h.el.remove();
        catchHearts.splice(i, 1);
        continue;
      }

      const heartRect = h.el.getBoundingClientRect();
      if (rectsOverlap(heartRect, basketRect)) {
        h.el.remove();
        catchHearts.splice(i, 1);
        caughtCount++;
        updateCatchCounter();
        anime({ targets: basket, scale: [1.3, 1], translateX: '-50%', duration: 280, easing: 'easeOutElastic(1, .6)' });

        if (caughtCount >= 5) {
          stopGameCatch();
          setTimeout(goToNext, 550);
          return;
        }
      }
    }

    catchRaf = requestAnimationFrame(catchLoop);
  }

  function startGameCatch() {
    caughtCount = 0;
    catchHearts.forEach((h) => h.el.remove());
    catchHearts = [];
    updateCatchCounter();
    basket.style.left = '50%';
    catchArea.addEventListener('pointermove', onCatchPointerMove);
    catchArea.addEventListener('touchmove', onCatchTouchMove, { passive: false });
    catchSpawnInterval = setInterval(spawnFallingHeart, 650);
    catchRaf = requestAnimationFrame(catchLoop);
  }

  function stopGameCatch() {
    clearInterval(catchSpawnInterval);
    cancelAnimationFrame(catchRaf);
    catchArea.removeEventListener('pointermove', onCatchPointerMove);
    catchArea.removeEventListener('touchmove', onCatchTouchMove);
    catchHearts.forEach((h) => h.el.remove());
    catchHearts = [];
  }

  /* ============ Mini-jeu : pop les cœurs ============ */
  const popArea = document.getElementById('popArea');
  const popCounter = document.getElementById('popCounter');
  const BUBBLE_COUNT = 14;
  let popRemaining = 0;

  function updatePopCounter() {
    popCounter.textContent = popRemaining > 0
      ? `${popRemaining} cœur${popRemaining > 1 ? 's' : ''} à éclater`
      : 'Tout éclaté !';
  }

  function onPopBubble(e) {
    e.preventDefault();
    const el = e.currentTarget;
    if (el.classList.contains('popped')) return;
    el.classList.add('popped');
    popRemaining--;
    updatePopCounter();
    setTimeout(() => el.remove(), 260);

    if (popRemaining <= 0) {
      setTimeout(goToNext, 550);
    }
  }

  function startGamePop() {
    popArea.innerHTML = '';
    popRemaining = BUBBLE_COUNT;
    updatePopCounter();

    const rect = popArea.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight * 0.5;

    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const size = 26 + Math.random() * 18;
      const fill = HEART_TONES[Math.floor(Math.random() * HEART_TONES.length)];
      const svg = makeHeartSvg(size, fill);
      svg.classList.add('bubble');
      const x = 16 + Math.random() * Math.max(20, w - 50);
      const y = 16 + Math.random() * Math.max(20, h - 50);
      svg.style.left = x + 'px';
      svg.style.top = y + 'px';
      svg.style.animationDelay = (Math.random() * 2) + 's';
      svg.addEventListener('pointerdown', onPopBubble);
      svg.addEventListener('touchstart', onPopBubble, { passive: false });
      popArea.appendChild(svg);
    }
  }

  /* ============ Finale : confetti cœurs + pluie de cœurs/photos ============ */
  let heartShape = null;

  function fireConfetti() {
    if (!heartShape && confetti.shapeFromPath) {
      heartShape = confetti.shapeFromPath({
        path: 'M16 29C16 29 2 18.6 2 9.7C2 4.3 6.1 1 10.6 1C13.1 1 15.1 2.5 16 5C16.9 2.5 18.9 1 21.4 1C25.9 1 30 4.3 30 9.7C30 18.6 16 29 16 29Z'
      });
    }
    const opts = {
      particleCount: 70,
      spread: 100,
      startVelocity: 38,
      gravity: 0.85,
      scalar: 1.4,
      colors: ['#C84B5A', '#F7C6C7', '#A53847', '#FFF5EE'],
      shapes: heartShape ? [heartShape] : undefined
    };
    confetti(Object.assign({}, opts, { origin: { x: 0.25, y: 0.4 } }));
    confetti(Object.assign({}, opts, { origin: { x: 0.75, y: 0.4 } }));
    setTimeout(() => confetti(Object.assign({}, opts, { origin: { x: 0.5, y: 0.3 }, particleCount: 100 })), 250);
  }

  function startFinale() {
    fireConfetti();

    const photos = ['images/photo1.png', 'images/photo2.png'];

    function spawnRainHeart() {
      const isPhoto = Math.random() < 0.12;

      if (isPhoto) {
        const wrapper = document.createElement('div');
        wrapper.className = 'rain-heart photo-wrapper';
        wrapper.style.left = Math.random() * 100 + '%';
        const duration = 3.6 + Math.random() * 2.4;
        wrapper.style.animationDuration = duration + 's';
        wrapper.style.setProperty('--dx', (Math.random() * 50 - 25) + 'px');
        wrapper.style.setProperty('--rot', (Math.random() * 50 - 25) + 'deg');
        wrapper.style.setProperty('--maxop', '1');
        wrapper.addEventListener('animationend', () => wrapper.remove());

        const inner = document.createElement('div');
        inner.className = 'heart-photo';
        inner.style.backgroundImage = `url(${photos[Math.floor(Math.random() * photos.length)]})`;
        const scale = 0.6 + Math.random() * 0.5;
        inner.style.transform = `scale(${scale})`;

        wrapper.appendChild(inner);
        successScreen.appendChild(wrapper);
      } else {
        const size = 16 + Math.random() * 26;
        const fill = HEART_TONES[Math.floor(Math.random() * HEART_TONES.length)];
        const svg = makeHeartSvg(size, fill);
        svg.classList.add('rain-heart');
        svg.style.left = Math.random() * 100 + '%';
        const duration = 2 + Math.random() * 2.6;
        svg.style.animationDuration = duration + 's';
        svg.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
        svg.style.setProperty('--rot', (Math.random() * 360) + 'deg');
        svg.style.setProperty('--maxop', (0.7 + Math.random() * 0.3).toFixed(2));
        svg.addEventListener('animationend', () => svg.remove());
        successScreen.appendChild(svg);
      }
    }

    for (let i = 0; i < 18; i++) spawnRainHeart();
    setInterval(spawnRainHeart, 170);
  }

  /* ============ Écran d'accueil + musique ============ */
  const coverScreen = document.getElementById('coverScreen');
  const coverHeart = document.getElementById('coverHeart');
  const soundToggle = document.getElementById('soundToggle');
  const bgMusic = document.getElementById('bgMusic');
  const MUSIC_START_TIME = 197; // 3:17

  anime({
    targets: coverHeart,
    scale: [1, 1.15],
    duration: 750,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine'
  });

  /* Amplification du son via Web Audio API (gain x2, au-delà du volume HTML max) */
  let audioCtx = null;
  let gainNode = null;

  function setupAudioBoost() {
    if (audioCtx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioCtx = new AudioCtx();
    const source = audioCtx.createMediaElementSource(bgMusic);
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 2.0;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  }

  function startMusic() {
    setupAudioBoost();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    bgMusic.loop = true;
    bgMusic.volume = 1.0;
    const seekTo197 = () => { bgMusic.currentTime = MUSIC_START_TIME; };
    if (bgMusic.readyState >= 1) {
      seekTo197();
    } else {
      bgMusic.addEventListener('loadedmetadata', seekTo197, { once: true });
    }
    bgMusic.play().catch(() => {});
  }

  soundToggle.addEventListener('click', () => {
    bgMusic.muted = !bgMusic.muted;
    soundToggle.textContent = bgMusic.muted ? '🔇' : '🔊';
  });

  coverScreen.addEventListener('click', () => {
    startMusic();
    soundToggle.hidden = false;
    anime.remove(coverHeart);
    anime({
      targets: coverScreen,
      opacity: [1, 0],
      scale: [1, 0.95],
      duration: 280,
      easing: 'easeInCubic',
      complete: () => {
        coverScreen.hidden = true;
        renderCurrent(null);
      }
    });
  }, { once: true });
})();
