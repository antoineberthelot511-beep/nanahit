'use client';

import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    (async () => {
      const anime = ((await import('animejs')) as any).default;
      const confetti = ((await import('canvas-confetti')) as any).default;

      const HEART_TONES = ['#C84B5A', '#F7C6C7', '#E18A95', '#A53847', '#D98C95'];

      function makeHeartSvg(size: number, fill: string): SVGSVGElement {
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
      const bgHearts = document.getElementById('bgHearts')!;

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
      const titleEl = document.getElementById('title') as HTMLElement;
      const subtitleEl = document.getElementById('subtitleEl') as HTMLElement;
      const noBtn = document.getElementById('noBtn') as HTMLButtonElement;
      const yesBtn = document.getElementById('yesBtn') as HTMLButtonElement;
      const mainContent = document.getElementById('mainContent') as HTMLElement;
      const gamePop = document.getElementById('gamePop') as HTMLElement;
      const successScreen = document.getElementById('successScreen') as HTMLElement;

      /* Pulsation douce et continue du titre */
      anime({
        targets: titleEl,
        scale: [1, 1.035],
        duration: 1900,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
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
            complete: () => { noBtn.classList.add('gone'); },
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
          complete: () => { isFleeing = false; },
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

      function checkProximity(clientX: number, clientY: number) {
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
        "(dernière chance de me dire la vérité 💗)",
      ];
      const steps = [
        "Veux-tu être ma copine, Anahit ? 💕",
        "Es-tu vraiment sûre ? 🥺",
        "Mais vraiment vraiment sûre ?! 😳",
        "Genre sûre sûre sûre ?!! 💗",
      ];

      const sequence = [
        { type: 'question', text: steps[0], sub: subtitles[0] },
        { type: 'question', text: steps[1], sub: subtitles[1] },
        { type: 'question', text: steps[2], sub: subtitles[2] },
        { type: 'question', text: steps[3], sub: subtitles[3] },
        { type: 'final' },
      ];
      let seqIndex = 0;

      const screenEls: Record<string, HTMLElement> = {
        question: mainContent,
        final: successScreen,
      };

      function showScreen(el: HTMLElement) {
        el.hidden = false;
        el.style.opacity = '0';
        el.style.transform = 'scale(0.92)';
        anime({ targets: el, opacity: [0, 1], scale: [0.92, 1], duration: 480, easing: 'easeOutCubic' });
      }

      function hideScreen(el: HTMLElement, onDone: () => void) {
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
            onDone();
          },
        });
      }

      function renderCurrent(previousEl: HTMLElement | null) {
        const item = sequence[seqIndex];
        const nextEl = screenEls[item.type];
        onQuestionScreen = (item.type === 'question');

        const reveal = () => {
          if (item.type === 'question') {
            titleEl.textContent = item.text!;
            subtitleEl.textContent = item.sub!;
            resetNoYesButtons();
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

      /* ============ Finale : confetti cœurs + pluie de cœurs/photos ============ */
      let heartShape: any = null;

      function fireConfetti() {
        if (!heartShape && confetti.shapeFromPath) {
          heartShape = confetti.shapeFromPath({
            path: 'M16 27.5C13.6 25.3 2 15.6 2 8.7C2 4.1 5.7 1 10 1C13 1 15.4 3 16 5.8C16.6 3 19 1 22 1C26.3 1 30 4.1 30 8.7C30 15.6 18.4 25.3 16 27.5Z',
          });
        }
        const opts = {
          particleCount: 70,
          spread: 100,
          startVelocity: 38,
          gravity: 0.85,
          scalar: 1.4,
          colors: ['#C84B5A', '#F7C6C7', '#A53847', '#FFF5EE'],
          shapes: heartShape ? [heartShape] : undefined,
        };
        confetti(Object.assign({}, opts, { origin: { x: 0.25, y: 0.4 } }));
        confetti(Object.assign({}, opts, { origin: { x: 0.75, y: 0.4 } }));
        setTimeout(() => confetti(Object.assign({}, opts, { origin: { x: 0.5, y: 0.3 }, particleCount: 100 })), 250);
      }

      function startFinale() {
        fireConfetti();

        const photos = ['/photo1.png', '/photo2.png'];

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
            inner.style.transform = `scale(${0.6 + Math.random() * 0.5})`;

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
      const coverScreen = document.getElementById('coverScreen') as HTMLElement;
      const coverHeart = document.getElementById('coverHeart') as HTMLElement;
      const soundToggle = document.getElementById('soundToggle') as HTMLButtonElement;
      const bgMusic = document.getElementById('bgMusic') as HTMLVideoElement;
      const MUSIC_START_TIME = 197;

      /* webkit-playsinline requis pour vieux Safari iOS */
      bgMusic.setAttribute('webkit-playsinline', '');

      anime({
        targets: coverHeart,
        scale: [1, 1.15],
        duration: 750,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
      });

      let seekApplied = false;

      bgMusic.addEventListener('loadedmetadata', () => {
        if (!seekApplied) {
          if (MUSIC_START_TIME < bgMusic.duration) {
            bgMusic.currentTime = MUSIC_START_TIME;
          }
          seekApplied = true;
        }
      });

      bgMusic.addEventListener('error', () => {
        console.error('[Audio] Erreur de chargement :', bgMusic.error);
      });

      let soundOn = true;

      function setIcon() {
        soundToggle.textContent = soundOn ? '🔊' : '🔇';
      }
      setIcon();

      function applyMuteState() {
        bgMusic.muted = !soundOn;
      }

      function attemptPlay() {
        bgMusic.loop = true;
        bgMusic.volume = 1.0;
        bgMusic.muted = !soundOn;

        const playPromise = bgMusic.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch((err: Error) => {
            console.warn('[Audio] play() rejeté :', err.message);
          });
        }
      }

      function toggleSound() {
        soundOn = !soundOn;
        applyMuteState();
        if (soundOn && bgMusic.paused) attemptPlay();
        setIcon();
      }

      soundToggle.addEventListener('click', toggleSound);
      soundToggle.addEventListener('touchend', (e) => {
        e.preventDefault();
        toggleSound();
      }, { passive: false });

      coverScreen.addEventListener('click', () => {
        attemptPlay();
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
          },
        });
      }, { once: true });
    })();
  }, []);

  return (
    <>
      <div className="paper-texture" />

      <svg className="sprite-defs" aria-hidden="true">
        <defs>
          <symbol id="heart-shape" viewBox="0 0 32 29">
            <path d="M16 27.5C13.6 25.3 2 15.6 2 8.7C2 4.1 5.7 1 10 1C13 1 15.4 3 16 5.8C16.6 3 19 1 22 1C26.3 1 30 4.1 30 8.7C30 15.6 18.4 25.3 16 27.5Z" />
          </symbol>
          {/* coordonnées normalisées 0→1 : s'adapte à toute taille sans couture */}
          <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.95 C0.5,0.95 0.05,0.65 0.05,0.35 C0.05,0.18 0.2,0.08 0.33,0.13 C0.41,0.16 0.47,0.24 0.5,0.3 C0.53,0.24 0.59,0.16 0.67,0.13 C0.8,0.08 0.95,0.18 0.95,0.35 C0.95,0.65 0.5,0.95 0.5,0.95 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="bg-hearts" id="bgHearts" />

      <section className="cover" id="coverScreen">
        <div className="cover-heart" id="coverHeart">
          <svg viewBox="0 0 32 29" className="heart-icon">
            <use href="#heart-shape" />
          </svg>
        </div>
        <p className="cover-text">Clique pour commencer 💕</p>
      </section>

      {/* vidéo cachée — contourne le mode silencieux iOS (audio seul bloqué, vidéo non) */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        id="bgMusic"
        src="/music/song.mp4"
        preload="auto"
        loop
        playsInline
        style={{ position: 'fixed', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
      />
      <button className="sound-toggle" id="soundToggle" aria-label="Couper le son" hidden>
        🔊
      </button>

      <main className="stage">
        <section className="container" id="mainContent" hidden>
          <h1 className="title" id="title">
            Veux-tu être ma copine, Anahit ? 💕
          </h1>
          <p className="subtitle" id="subtitleEl">
            (prends ton temps, mais pas trop 😌)
          </p>
          <div className="buttons">
            <button className="btn yes" id="yesBtn">Oui</button>
            <button className="btn no" id="noBtn">Non</button>
          </div>
        </section>

        <section className="success" id="successScreen" hidden>
          <h1 className="big-message">OUIII T&apos;AS ACCEPTÉ !!! 🎉❤️</h1>
        </section>
      </main>

      <p className="signature">avec amour ✦</p>
    </>
  );
}
