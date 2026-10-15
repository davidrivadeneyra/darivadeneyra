import { navigate } from 'astro:transitions/client';
import gsap from 'gsap';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let isTransitioning = false;

function getElements() {
  const wrap = document.querySelector<HTMLElement>('[data-page-transition]');

  if (!wrap) return null;

  return {
    wrap,
    panel: wrap.querySelector<HTMLElement>('[data-transition-panel]'),
    title: wrap.querySelector<HTMLElement>('[data-transition-title]'),
    titleText: wrap.querySelector<HTMLElement>('[data-transition-title-text]')
  };
}

function destinationTitle(link: HTMLAnchorElement, url: URL) {
  const explicitTitle = link.dataset.transitionTitle?.trim();
  if (explicitTitle) return explicitTitle;

  if (url.pathname === '/work' || url.pathname === '/work/') return 'Work';
  if (url.pathname.startsWith('/work/')) {
    return decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) ?? 'Work')
      .replaceAll('-', ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }
  if (url.pathname === '/guia-de-estilos' || url.pathname === '/guia-de-estilos/') return 'Style Guide';
  return 'Home';
}

function canTransition(event: MouseEvent, link: HTMLAnchorElement, url: URL) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (link.target && link.target !== '_self') return false;
  if (link.hasAttribute('download') || url.origin !== window.location.origin) return false;
  if (!['http:', 'https:'].includes(url.protocol)) return false;

  const sameDocument = url.pathname === window.location.pathname && url.search === window.location.search;
  if (sameDocument) return false;

  return true;
}

function cover(title: string) {
  const elements = getElements();
  if (!elements?.panel || !elements.title || !elements.titleText) {
    return Promise.resolve();
  }

  elements.titleText.textContent = title;
  document.documentElement.classList.add('is-page-transitioning');

  const timeline = gsap.timeline();
  timeline.set(elements.wrap, { autoAlpha: 1 });
  timeline.set(elements.panel, { autoAlpha: 1, yPercent: 0 });
  timeline.set(elements.title, { autoAlpha: 1 });
  timeline.set(elements.titleText, { yPercent: 115 });
  timeline.to(elements.panel, { yPercent: -100, duration: 0.68, ease: 'power3.inOut' }, 0);
  timeline.to(elements.titleText, { yPercent: 0, duration: 0.48, ease: 'expo.out' }, 0.24);

  return new Promise<void>((resolve) => timeline.call(resolve));
}

function reveal() {
  if (!isTransitioning) return;

  const elements = getElements();
  if (!elements?.panel || !elements.title || !elements.titleText) {
    isTransitioning = false;
    document.documentElement.classList.remove('is-page-transitioning');
    return;
  }

  const timeline = gsap.timeline({
    onComplete: () => {
      gsap.set([elements.wrap, elements.panel, elements.title], { autoAlpha: 0 });
      gsap.set(elements.panel, { yPercent: 0 });
      gsap.set(elements.titleText, { yPercent: 115 });
      isTransitioning = false;
      document.documentElement.classList.remove('is-page-transitioning');
    }
  });

  timeline.to(elements.titleText, { yPercent: -130, duration: 0.55, ease: 'expo.inOut' }, 0);
  timeline.to(elements.panel, { yPercent: -200, duration: 0.68, ease: 'power3.inOut' }, 0.16);
}

document.addEventListener(
  'click',
  async (event) => {
    const mouseEvent = event as MouseEvent;
    const target = mouseEvent.target;
    const link = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!link || isTransitioning) return;

    const url = new URL(link.href, window.location.href);
    if (!canTransition(mouseEvent, link, url) || reducedMotion.matches) return;

    mouseEvent.preventDefault();
    isTransitioning = true;

    await cover(destinationTitle(link, url));
    await navigate(url.href);
  },
  { capture: true }
);

document.addEventListener('astro:page-load', reveal);

