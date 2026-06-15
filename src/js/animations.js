import { prefersReducedMotion } from './utils.js';

const initAnimations = () => {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  if (prefersReducedMotion()) {
    elements.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.15,
    }
  );

  elements.forEach((el) => observer.observe(el));
};

export default initAnimations;
