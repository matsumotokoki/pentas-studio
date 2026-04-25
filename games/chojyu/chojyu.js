(() => {
  const body = document.body;
  const opening = document.getElementById('opening');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const finishIntro = () => {
    body.classList.remove('is-intro-active');
    body.classList.add('is-intro-done');
  };

  if (reduceMotion) {
    finishIntro();
  } else {
    const timer = window.setTimeout(finishIntro, 2400);
    const skipIntro = () => {
      window.clearTimeout(timer);
      finishIntro();
    };

    opening.addEventListener('click', skipIntro, { once: true });
    window.addEventListener('wheel', skipIntro, { once: true, passive: true });
    window.addEventListener('touchstart', skipIntro, { once: true, passive: true });
    window.addEventListener('keydown', skipIntro, { once: true });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px'
    });

    revealItems.forEach((item) => observer.observe(item));
  }

  const navToggle = document.querySelector('.nav-toggle');
  const navPanel = document.getElementById('globalNavPanel');
  const ctaRoot = document.querySelector('[data-cta]');
  const ctaToggle = document.querySelector('.fixed-cta__toggle');
  const ctaPanel = document.getElementById('reservePanel');

  const setExpanded = (trigger, target, expanded, className) => {
    if (!trigger || !target) return;
    trigger.setAttribute('aria-expanded', String(expanded));
    target.classList.toggle(className, expanded);
  };

  if (navToggle && navPanel) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      setExpanded(navToggle, navPanel, !expanded, 'is-open');
      document.body.classList.toggle('is-nav-open', !expanded);
    });

    navPanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        setExpanded(navToggle, navPanel, false, 'is-open');
        document.body.classList.remove('is-nav-open');
      });
    });
  }

  if (ctaToggle && ctaPanel) {
    ctaToggle.addEventListener('click', () => {
      const expanded = ctaToggle.getAttribute('aria-expanded') === 'true';
      setExpanded(ctaToggle, ctaPanel, !expanded, 'is-open');
      ctaRoot?.classList.toggle('is-open', !expanded);
    });

    ctaPanel.addEventListener('click', () => {
      setExpanded(ctaToggle, ctaPanel, false, 'is-open');
      ctaRoot?.classList.remove('is-open');
    });
  }

  document.addEventListener('click', (event) => {
    if (navToggle && navPanel && !navToggle.closest('.site-header')?.contains(event.target)) {
      setExpanded(navToggle, navPanel, false, 'is-open');
      document.body.classList.remove('is-nav-open');
    }

    if (ctaToggle && ctaRoot && !ctaRoot.contains(event.target)) {
      setExpanded(ctaToggle, ctaPanel, false, 'is-open');
      ctaRoot.classList.remove('is-open');
    }
  });

  const stage = document.getElementById('characterStage');
  const normalImage = document.getElementById('characterNormal');
  const hungerImage = document.getElementById('characterHunger');
  const name = document.getElementById('characterName');
  const role = document.getElementById('characterRole');
  const description = document.getElementById('characterDescription');
  const panel = document.querySelector('.character-panel');
  const stateButtons = Array.from(document.querySelectorAll('.character-state button'));
  const characterButtons = Array.from(document.querySelectorAll('.character-thumb'));
  let currentState = 'normal';
  let switchTimer = null;

  const renderState = () => {
    stage.classList.toggle('is-hunger', currentState === 'hunger');
    stateButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.state === currentState);
    });
  };

  const animateCharacterChange = (update, options = {}) => {
    const { duration = 180, animatePanel = true } = options;
    window.clearTimeout(switchTimer);
    stage.classList.add('is-switching');
    if (animatePanel) {
      panel?.classList.add('is-switching');
    }

    switchTimer = window.setTimeout(() => {
      update();
      window.requestAnimationFrame(() => {
        stage.classList.remove('is-switching');
        if (animatePanel) {
          panel?.classList.remove('is-switching');
        }
      });
    }, duration);
  };

  const setCharacter = (button) => {
    characterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    normalImage.src = button.dataset.normal;
    normalImage.alt = `${button.dataset.name} 通常状態`;
    hungerImage.src = button.dataset.hunger;
    hungerImage.alt = `${button.dataset.name} 飢餓状態`;
    name.textContent = button.dataset.name;
    role.textContent = button.dataset.role;
    description.innerHTML = `
      <strong>${button.dataset.descriptionStrong}</strong>
      <p>${button.dataset.descriptionBody1}</p>
      <p>${button.dataset.descriptionBody2}</p>
    `;
  };

  stateButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.state === currentState) return;
      animateCharacterChange(() => {
        currentState = button.dataset.state;
        renderState();
      }, { duration: 140, animatePanel: false });
    });
  });

  characterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.classList.contains('is-active')) return;
      animateCharacterChange(() => {
        currentState = 'normal';
        setCharacter(button);
        renderState();
      });
    });
  });

  renderState();
})();
