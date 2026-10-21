'use client';

/**
 * Motion driver for the "acknowledgement sequence" (styles/motion.css).
 *
 * Sections marked [data-reveal] that start BELOW the fold are armed once: their
 * animatable parts get the class `rv`, a stagger index (--rv-i) and a variant
 * (data-rv: rise | start | fade). When a section enters the viewport it gets
 * .is-visible and the CSS plays the sequence. Doing the matching here, once,
 * keeps the stylesheet to cheap single-class selectors (long :is() lists made
 * every element pay on every style recalc).
 *
 * Sections already on screen at load are never armed, so nothing visible
 * flickers; without JS or with reduced motion nothing is ever hidden.
 * Re-runs on every client navigation (the new page brings new sections).
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

type Variant = 'rise' | 'start' | 'fade';

/** Containers whose children are acknowledged one after another. */
const LISTS: Array<[selector: string, variant: Variant]> = [
  ['.svc-index', 'rise'],
  ['.commitments', 'rise'],
  ['.scope', 'rise'],
  ['.caps', 'rise'],
  ['.faq', 'rise'],
  ['.related', 'rise'],
  ['.principles', 'rise'],
  ['.exchange', 'start'],
  ['.svc-panel__list', 'start'],
  ['.steps-line', 'fade'],
];
const LIST_SELECTOR = LISTS.map(([s]) => s).join(',');

const mark = (el: Element, variant: Variant, index: number, baseMs: number): void => {
  const node = el as HTMLElement;
  node.classList.add('rv');
  node.dataset.rv = variant;
  node.style.setProperty('--rv-i', String(Math.min(index, 6)));
  node.style.setProperty('--rv-base', `${baseMs}ms`);
};

const arm = (section: HTMLElement): void => {
  section.querySelectorAll('.rail__head').forEach((head) =>
    Array.from(head.children).forEach((c, i) => mark(c, c.classList.contains('clause-no') ? 'start' : 'rise', i, 0)),
  );
  section.querySelectorAll('.rail__body').forEach((body) =>
    Array.from(body.children).forEach((c) => {
      if (!c.matches(LIST_SELECTOR)) mark(c, 'rise', 0, 140);
    }),
  );
  for (const [selector, variant] of LISTS) {
    section.querySelectorAll(selector).forEach((list) => Array.from(list.children).forEach((c, i) => mark(c, variant, i, 160)));
  }
  section.querySelectorAll('.svc-panel__head, .cta-band__inner').forEach((group) =>
    Array.from(group.children).forEach((c, i) => mark(c, 'rise', i, 0)),
  );
  section.dataset.armed = '';
};

export const MotionInit = () => {
  const pathname = usePathname();
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (sections.length === 0) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      sections.forEach((s) => s.classList.add('is-visible'));
      return;
    }
    // Arm only what is still below the fold; on-screen sections show as they are.
    for (const s of sections) {
      if (s.getBoundingClientRect().top >= window.innerHeight) arm(s);
      else s.classList.add('is-visible');
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
    sections.forEach((s) => {
      if (!s.classList.contains('is-visible')) io.observe(s);
    });
    // Fail-safe: anything above the viewport bottom is revealed even if the
    // observer never saw it intersect (anchor jumps, fast scroll, find-in-page).
    const revealPassed = (): void => {
      for (const s of sections) {
        if (!s.classList.contains('is-visible') && s.getBoundingClientRect().top < window.innerHeight) {
          s.classList.add('is-visible');
          io.unobserve(s);
        }
      }
    };
    let frame = 0;
    const onScroll = (): void => {
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          revealPassed();
        });
      }
    };
    const revealAll = (): void => document.documentElement.classList.add('reveal-done');
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
