import { gsap } from 'gsap';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initAnimations() {
  document.querySelectorAll('[data-local-time]').forEach((node) => {
    node.textContent = `${new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())} Peru Time`;
  });

  if (reduceMotion.matches) return;

  gsap.fromTo('[data-animate="header"]', { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' });
  gsap.fromTo('[data-animate="hero"] > *', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 });
  document.querySelectorAll<HTMLElement>('[data-animate="project-card"], [data-animate="image-card"]').forEach((card) => {
    const media = card.querySelector('.project-card__media img, .project-card__media video, .case-next__card img, .case-next__card video');
    if (!media) return;
    card.addEventListener('mouseenter', () => gsap.to(media, { scale: 1.025, duration: 0.45, ease: 'power2.out' }));
    card.addEventListener('mouseleave', () => gsap.to(media, { scale: 1, duration: 0.45, ease: 'power2.out' }));
  });
}

initAnimations();
document.addEventListener('astro:page-load', initAnimations);
