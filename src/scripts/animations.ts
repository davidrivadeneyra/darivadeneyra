import { gsap } from 'gsap';

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function initAnimations() {
  if (reduceMotionQuery.matches) return;

  gsap.fromTo(
    '[data-animate="button-main"]',
    { autoAlpha: 0, y: 8 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.45,
      ease: 'power2.out',
      stagger: 0.06,
      overwrite: 'auto'
    }
  );
}

initAnimations();
document.addEventListener('astro:page-load', initAnimations);
