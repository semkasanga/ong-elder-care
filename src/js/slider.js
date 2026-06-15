import { prefersReducedMotion } from './utils.js';

const initSlider = () => {
  const slider = document.querySelector('[data-slider]');
  if (!slider) return;

  const track = slider.querySelector('[data-slider-track]');
  const slides = Array.from(slider.querySelectorAll('[data-slider-slide]'));
  const prevBtn = slider.querySelector('[data-slider-prev]');
  const nextBtn = slider.querySelector('[data-slider-next]');
  const dotsContainer = slider.querySelector('[data-slider-dots]');
  const statusEl = slider.querySelector('[data-slider-status]');

  if (!track || !slides.length || !prevBtn || !nextBtn) return;

  let current = 0;
  let touchStartX = 0;

  slider.setAttribute('tabindex', '0');

  const announceSlide = (index) => {
    if (!statusEl) return;
    const slide = slides[index];
    const source = slide.querySelector('.testimonial-source')?.textContent?.trim();
    const role = slide.querySelector('.testimonial-role')?.textContent?.trim();
    const detail = source || role || `commitment ${index + 1}`;
    statusEl.textContent = `Showing ${detail}, ${index + 1} of ${slides.length}`;
  };

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const isActive = i === current;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    if (dotsContainer) {
      dotsContainer.querySelectorAll('[data-slider-dot]').forEach((dot, i) => {
        dot.classList.toggle('is-active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
        dot.setAttribute('tabindex', i === current ? '0' : '-1');
      });
    }

    announceSlide(current);
  };

  if (dotsContainer) {
    slides.forEach((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot';
      dot.dataset.sliderDot = '';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to commitment ${i + 1}`);
      if (slide.id) dot.setAttribute('aria-controls', slide.id);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(current - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(current + 1);
    }
  });

  track.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (event) => {
    const diff = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) < 50) return;
    goTo(diff > 0 ? current - 1 : current + 1);
  }, { passive: true });

  if (!prefersReducedMotion()) {
    slider.classList.add('has-transition');
  }

  goTo(0);
};

export default initSlider;
