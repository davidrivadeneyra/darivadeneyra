import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenis: Lenis | null = null;

function destroySmoothScroll() {
  lenis?.destroy();
  lenis = null;
}

function initSmoothScroll() {
  destroySmoothScroll();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  lenis = new Lenis({
    autoRaf: true,
    anchors: true
  });
}

initSmoothScroll();
document.addEventListener('astro:page-load', initSmoothScroll);
document.addEventListener('astro:before-swap', destroySmoothScroll);
