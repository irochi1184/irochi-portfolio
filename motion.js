(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];

  // Header depth while scrolling.
  const header = qs('.site-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Site-wide scroll reveal with staggered timing.
  const revealTargets = [
    ...qsa('.pick-up .pickup-card'),
    ...qsa('.works-section .section-heading'),
    ...qsa('.gallery .work-card'),
    ...qsa('.about-section .section-heading'),
    ...qsa('.about-section .about-card'),
    ...qsa('.commission-section .section-heading'),
    ...qsa('.price-grid .price-card'),
    ...qsa('.commission-grid > *'),
    ...qsa('.contact-card')
  ];

  revealTargets.forEach((el, i) => {
    el.classList.add('motion-reveal');
    if (el.matches('.gallery .work-card, .price-card')) {
      el.style.setProperty('--motion-delay', `${(i % 6) * 55}ms`);
    }
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('motion-in'));
  }

  // Pointer-following ambient light + subtle hero perspective.
  const heroVisual = qs('.hero-editorial-visual');
  if (!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let raf = 0;
    window.addEventListener('pointermove', (event) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        document.body.style.setProperty('--pointer-x', `${event.clientX}px`);
        document.body.style.setProperty('--pointer-y', `${event.clientY}px`);
      });
    }, { passive: true });

    heroVisual?.addEventListener('pointermove', (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.setProperty('--hero-rx', `${(-ny * 2.8).toFixed(2)}deg`);
      heroVisual.style.setProperty('--hero-ry', `${(nx * 3.6).toFixed(2)}deg`);
    });
    heroVisual?.addEventListener('pointerleave', () => {
      heroVisual.style.setProperty('--hero-rx', '0deg');
      heroVisual.style.setProperty('--hero-ry', '0deg');
    });
  }

  // Spotlight that follows pointer inside key cards.
  const spotlightCards = qsa('.work-card, .price-card, .pickup-card, .about-card');
  spotlightCards.forEach(card => {
    card.addEventListener('pointermove', (event) => {
      if (reduceMotion) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
    });
  });

  // Button/link magnetic nudge on capable pointer devices.
  if (!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    qsa('.button, .hero-editorial-link, .filter').forEach(el => {
      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 4;
        el.style.translate = `${x}px ${y}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  }

  // Filter transitions: fade cards instead of snapping.
  qsa('.filter').forEach(button => {
    button.addEventListener('click', () => {
      qsa('.gallery .work-card').forEach(card => {
        card.animate([
          { opacity: .45, transform: 'translateY(6px) scale(.99)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 320, easing: 'cubic-bezier(.22,.61,.36,1)' });
      });
    });
  });

  // A small number of ambient sparkles gives movement to otherwise empty areas.
  if (!reduceMotion) {
    const colors = [
      'rgba(106,215,201,.62)',
      'rgba(255,185,216,.54)',
      'rgba(255,229,156,.56)'
    ];
    const count = window.innerWidth < 720 ? 7 : 12;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'motion-sparkle';
      dot.style.left = `${5 + Math.random() * 90}%`;
      dot.style.top = `${10 + Math.random() * 82}%`;
      dot.style.setProperty('--spark-size', `${3 + Math.random() * 5}px`);
      dot.style.setProperty('--spark-speed', `${10 + Math.random() * 8}s`);
      dot.style.setProperty('--spark-delay', `${-Math.random() * 8}s`);
      dot.style.setProperty('--spark-x', `${-28 + Math.random() * 56}px`);
      dot.style.setProperty('--spark-color', colors[i % colors.length]);
      document.body.appendChild(dot);
    }
  }

  // Smooth anchor transitions with a light visual response.
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = qs(id);
      if (!target || reduceMotion) return;
      setTimeout(() => {
        target.animate([
          { filter: 'brightness(1.02)' },
          { filter: 'brightness(1)' }
        ], { duration: 520, easing: 'ease-out' });
      }, 360);
    });
  });
})();
