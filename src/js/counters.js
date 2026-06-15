import { formatNumber, prefersReducedMotion } from './utils.js';

const parseCounterValue = (element) => {
  const fromData = Number(element.dataset.counterTarget);
  const suffix = element.dataset.counterSuffix || '';

  if (!Number.isNaN(fromData)) {
    return { target: fromData, suffix };
  }

  const text = element.textContent.trim();
  const match = text.match(/^([\d,]+)(.*)$/);
  if (!match) return null;

  const target = Number(match[1].replace(/,/g, ''));
  if (Number.isNaN(target)) return null;

  return { target, suffix: match[2] || suffix };
};

const animateCounter = (element, target, suffix, duration) => {
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const value = Math.floor(target * eased);
    element.textContent = `${formatNumber(value)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = `${formatNumber(target)}${suffix}`;
    }
  };

  requestAnimationFrame(step);
};

const initCounters = () => {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const runCounter = (counter) => {
    if (counter.dataset.animated === 'true') return;

    const parsed = parseCounterValue(counter);
    if (!parsed) return;

    const { target, suffix } = parsed;
    const finalText = `${formatNumber(target)}${suffix}`;

    counter.dataset.animated = 'true';

    const label = counter.closest('.impact-card')?.querySelector('.impact-label')?.textContent?.trim();
    if (label) {
      counter.setAttribute('aria-label', `${finalText} ${label}`);
    }

    if (prefersReducedMotion()) {
      counter.textContent = finalText;
      return;
    }

    counter.textContent = `0${suffix}`;
    animateCounter(counter, target, suffix, 2000);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((counter) => observer.observe(counter));
};

export default initCounters;
