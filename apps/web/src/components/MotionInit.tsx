'use client';

/**
 * Scroll-entrance enhancer (§13 motion): observes [data-reveal] elements once,
 * adds .is-visible when a group enters the viewport, then unobserves — no
 * re-animation on scroll-back. Content renders fully visible without JS (the
 * hidden state only applies under html.js, set pre-paint by the bootstrap
 * script), and prefers-reduced-motion shows everything immediately via CSS.
 * Renders nothing.
 */
import { useEffect } from 'react';

export const MotionInit = () => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (els.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
};
