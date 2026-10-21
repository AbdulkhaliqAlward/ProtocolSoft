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
import { usePathname } from 'next/navigation';

export const MotionInit = () => {
  // Re-scan on every client navigation: the new page brings new sections.
  const pathname = usePathname();
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
    // Fail-safe: anything already above the viewport bottom is revealed even if
    // the observer never saw it intersect (anchor jumps, fast scroll, find-in-
    // page skip straight past it). Printing reveals everything.
    const revealPassed = () => {
      for (const el of els) {
        if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      }
    };
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        revealPassed();
      });
    };
    revealPassed(); // deep links / restored scroll positions load mid-page
    const revealAll = () => document.documentElement.classList.add('reveal-done');
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('beforeprint', revealAll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('beforeprint', revealAll);
      window.cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [pathname]);
  return null;
};
