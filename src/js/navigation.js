import { getFocusableElements, prefersReducedMotion } from './utils.js';

const SCROLL_OFFSET_EXTRA = 12;
const SCROLL_THRESHOLD = 24;
const DESKTOP_BREAKPOINT = 1024;

const initNavigation = () => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav-menu]');
  const panel = document.querySelector('[data-nav-panel]');
  const backdrop = document.querySelector('[data-nav-backdrop]');
  const closeBtn = document.querySelector('[data-nav-close]');
  const main = document.querySelector('#main');
  const footer = document.querySelector('.site-footer');
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const scrollLinks = document.querySelectorAll('[data-scroll-link]');

  if (!header || !toggle || !nav || !panel) return;

  let scrollLockY = 0;

  const isDesktop = () => window.innerWidth >= DESKTOP_BREAKPOINT;

  const getScrollOffset = () => header.offsetHeight + SCROLL_OFFSET_EXTRA;

  const updateHeaderMetrics = () => {
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  };

  const scrollToSection = (target, href) => {
    const top = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();

    window.scrollTo({
      top,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });

    if (href) history.replaceState(null, '', href);
  };

  const setInertState = (element, isInert) => {
    if (!element) return;
    element.toggleAttribute('aria-hidden', isInert);
    if ('inert' in element) {
      element.inert = isInert;
    }
  };

  const lockScroll = () => {
    scrollLockY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollLockY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
  };

  const unlockScroll = () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, scrollLockY);
  };

  const setMenuOpen = (isOpen) => {
    const isMobileMenu = isOpen && !isDesktop();

    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    nav.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);

    if (isMobileMenu) {
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-labelledby', 'nav-dialog-title');
      backdrop?.removeAttribute('aria-hidden');
      lockScroll();
    } else {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-modal');
      panel.removeAttribute('aria-labelledby');
      backdrop?.setAttribute('aria-hidden', 'true');
      if (!isOpen && document.body.style.position === 'fixed') unlockScroll();
    }

    setInertState(main, isMobileMenu);
    setInertState(footer, isMobileMenu);
  };

  const closeMenu = (returnFocus = false) => {
    setMenuOpen(false);
    if (returnFocus) toggle.focus();
  };

  const openMenu = () => {
    setMenuOpen(true);
    if (!isDesktop()) {
      closeBtn?.focus();
    }
  };

  const setActiveLink = () => {
    const scrollPos = window.scrollY + getScrollOffset() + 48;
    let currentId = 'hero';

    document.querySelectorAll('main section[id]').forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('is-active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  let scrollTicking = false;

  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;

    requestAnimationFrame(() => {
      header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
      setActiveLink();
      updateHeaderMetrics();
      scrollTicking = false;
    });
  };

  const handleAnchorClick = (event, link) => {
    const href = link.getAttribute('href');
    if (!href?.startsWith('#')) return;

    event.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;

    closeMenu();
    scrollToSection(target, href);
  };

  toggle.addEventListener('click', () => {
    if (toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu(true);
    } else {
      openMenu();
    }
  });

  closeBtn?.addEventListener('click', () => closeMenu(true));

  backdrop?.addEventListener('click', () => closeMenu(true));

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => handleAnchorClick(event, link));
  });

  scrollLinks.forEach((link) => {
    link.addEventListener('click', (event) => handleAnchorClick(event, link));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu(true);
      return;
    }

    if (event.key !== 'Tab' || toggle.getAttribute('aria-expanded') !== 'true' || isDesktop()) return;

    const focusable = [closeBtn, ...getFocusableElements(panel)].filter(Boolean);
    if (focusable.length < 2) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    updateHeaderMetrics();
    if (isDesktop() && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  backdrop?.setAttribute('aria-hidden', 'true');

  header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  updateHeaderMetrics();
  setActiveLink();
  window.addEventListener('scroll', onScroll, { passive: true });
};

export default initNavigation;
