document.addEventListener('DOMContentLoaded', () => {
  // GSAP Setup
  gsap.registerPlugin(TextPlugin, ScrollTrigger);

  // Constants & Elements
  const card = document.getElementById('card');
  const openBtn = document.getElementById('open');
  const closeBtn = document.getElementById('close');
  const loader = document.getElementById('loader');
  const musicBtn = document.getElementById('music-toggle');
  const audio = document.getElementById('bg-music');
  const cardWrapper = document.getElementById('card-wrapper');
  const cursorLight = document.querySelector('.cursor-light');
  const sfxPaper = document.getElementById('sfx-paper');
  const sfxCandle = document.getElementById('sfx-candle');
  const endingScene = document.getElementById('ending-scene');
  const replayBtn = document.getElementById('replay-btn');
  const heartTrigger = document.getElementById('heart-trigger');
  const signature = document.getElementById('signature');

  let isMusicPlaying = false;
  let isCardOpen = false;

  const colors = ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffc8dd', '#fb6f92'];

  // 1. LOADING SCREEN
  window.addEventListener('load', () => {
    const tl = gsap.timeline();
    tl.to('.progress', { width: '100%', duration: 1.5, ease: 'power2.inOut' })
      .to(loader, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          loader.style.display = 'none';
          startEntranceAnimations();
        }
      });
  });

  function startEntranceAnimations() {
    gsap.timeline()
      .from('.main-title', { y: 50, opacity: 0, duration: 1.2, ease: 'power4.out' })
      .from('.cake-container', { scale: 0, opacity: 0, duration: 1, ease: 'back.out(1.7)' }, "-=0.8")
      .from('.card-controls', { y: 20, opacity: 0, duration: 0.8 }, "-=0.5")
      .from('.audio-player', { x: -20, opacity: 0, duration: 0.8 }, "-=0.8");
  }

  // 2. 3D INTERACTION (Desktop & Mobile)
  const handleMove = (x, y) => {
    const rx = (window.innerHeight / 2 - y) / 30;
    const ry = (x - window.innerWidth / 2) / 30;

    gsap.to(card, {
      rotationX: isCardOpen ? rx / 2 : rx,
      rotationY: isCardOpen ? (ry / 2) + 15 : ry, // Slight offset when open
      duration: 0.5,
      ease: 'power2.out'
    });

    // Move light source
    gsap.to(cursorLight, {
      left: x,
      top: y,
      duration: 0.2
    });

    // Suble orb reaction
    gsap.to('.orb-1', { x: ry * 2, y: rx * 2, duration: 2 });
    gsap.to('.orb-2', { x: -ry * 2, y: -rx * 2, duration: 2 });
  };

  document.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));

  // Mobile Orientation
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (!isCardOpen) {
        const x = (e.gamma || 0) * 2; // Left to right
        const y = (e.beta || 0) * 2;  // Front to back
        handleMove(window.innerWidth / 2 + x, window.innerHeight / 2 + y);
      }
    });
  }

  // 3. CARD OPEN/CLOSE WITH STORY FLOW
  const openCard = () => {
    isCardOpen = true;
    card.classList.add('is-open');
    sfxPaper.currentTime = 0;
    sfxPaper.play().catch(() => { });
    sfxCandle.play().catch(() => { });

    // Cinematic Story Timeline
    const storyTl = gsap.timeline();

    storyTl.to(card, { rotationY: -180, duration: 1.5, ease: 'power4.inOut' })
      .fromTo('.wish-title',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        "-=0.5"
      );

    // Typing effect for paragraphs
    const paragraphs = document.querySelectorAll('.wish-text p');
    paragraphs.forEach((p, i) => {
      const text = p.innerText;
      p.innerText = '';
      storyTl.to(p, {
        text: text,
        duration: text.length * 0.03,
        ease: 'none'
      }, i === 0 ? "-=0.2" : "+=0.1");
    });

    // Signature Animation
    storyTl.fromTo('#signature',
      { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'back.out(2)' },
      "+=0.5"
    ).add(() => {
      heartTrigger.classList.add('heart-pulse');
      // Trigger ending after some time
      setTimeout(showFinalEnding, 10000);
    });
  };

  const closeCard = () => {
    isCardOpen = false;
    card.classList.remove('is-open');
    sfxPaper.currentTime = 0;
    sfxPaper.play().catch(() => { });
    sfxCandle.pause();
    gsap.to(card, { rotationY: 0, duration: 1.2, ease: 'power3.inOut' });
  };

  openBtn.addEventListener('click', openCard);
  closeBtn.addEventListener('click', closeCard);

  // 4. MICRO-INTERACTIONS
  heartTrigger.addEventListener('click', () => {
    gsap.to(heartTrigger, {
      scale: 2,
      color: '#ff0000',
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        const msg = document.createElement('div');
        msg.innerText = "You are my everything! ✨";
        msg.style.cssText = `
          position: fixed; top: 50%; left: 50%; 
          transform: translate(-50%, -50%); 
          color: white; background: var(--primary); 
          padding: 15px 30px; border-radius: 50px; 
          z-index: 3000; font-weight: 600;
        `;
        document.body.appendChild(msg);
        gsap.from(msg, { scale: 0, opacity: 0, duration: 0.5 });
        gsap.to(msg, { y: -50, opacity: 0, delay: 2, duration: 1, onComplete: () => msg.remove() });

        if (navigator.vibrate) navigator.vibrate(50);
      }
    });

    // Extra Sparkles
    for (let i = 0; i < 15; i++) createSparkle(window.innerWidth / 2, window.innerHeight / 2);
  });

  // 5. FINAL SCENE
  function showFinalEnding() {
    if (!isCardOpen) return;
    endingScene.classList.add('active');
    gsap.from('.ending-content > *', {
      y: 30,
      opacity: 0,
      stagger: 0.3,
      duration: 1,
      delay: 0.5
    });
  }

  replayBtn.addEventListener('click', () => {
    endingScene.classList.remove('active');
  });

  // 6. UTILITIES (Particles & Sparkles)
  function createParticles() {
    const container = document.getElementById('particles-container');
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `position: absolute; width: ${Math.random() * 4 + 2}px; height: ${Math.random() * 4 + 2}px; background: white; opacity: ${Math.random() * 0.4 + 0.1}; border-radius: 50%; top: ${Math.random() * 100}%; left: ${Math.random() * 100}%; pointer-events: none;`;
      container.appendChild(p);
      animateParticle(p);
    }
  }

  function animateParticle(p) {
    gsap.to(p, {
      y: "-=150",
      x: `+=${Math.random() * 60 - 30}`,
      opacity: 0,
      duration: Math.random() * 4 + 3,
      ease: 'none',
      onComplete: () => {
        p.style.top = '110%';
        p.style.left = `${Math.random() * 100}%`;
        p.style.opacity = Math.random() * 0.4 + 0.1;
        animateParticle(p);
      }
    });
  }

  function createSparkle(x, y) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    document.body.appendChild(s);
    const size = Math.random() * 8 + 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    gsap.set(s, { x, y, width: size, height: size, backgroundColor: color, borderRadius: '50%', position: 'absolute', pointerEvents: 'none', zIndex: 9999 });
    gsap.to(s, { x: x + (Math.random() * 300 - 150), y: y + (Math.random() * 300 - 150), opacity: 0, scale: 0, duration: Math.random() * 1.5 + 0.5, ease: 'power2.out', onComplete: () => s.remove() });
  }

  createParticles();
  document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') {
      for (let i = 0; i < 6; i++) createSparkle(e.pageX, e.pageY);
    }
  });

  // Music Control
  musicBtn.addEventListener('click', () => {
    const text = musicBtn.querySelector('.music-text');
    if (!isMusicPlaying) {
      audio.play().catch(e => console.log("Audio play blocked", e));
      text.textContent = 'Pause Music';
      musicBtn.classList.add('playing');
      isMusicPlaying = true;
    } else {
      audio.pause();
      text.textContent = 'Play Music';
      musicBtn.classList.remove('playing');
      isMusicPlaying = false;
    }
  });
});

