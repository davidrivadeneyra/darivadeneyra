import * as THREE from "three";
import fragmentShader from "./gradient.frag.glsl?raw";
import vertexShader from "./gradient.vert.glsl?raw";
import type { AnimatedGradientOptions, GradientColors, GradientQuality } from "./types";

type GradientElement = HTMLElement & {
  gradientInstance?: {
    destroy: () => void;
  };
};

const DEFAULT_COLORS: GradientColors = [
  "#263D9B",
  "#39BFC8",
  "#FFD166",
  "#FF7657",
  "#FFAA62",
];

const QUALITY_DPR: Record<GradientQuality, number> = {
  low: 1,
  medium: 1.5,
  high: 2,
};

let lifecycleListenersBound = false;

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseQuality(value: string | undefined): GradientQuality {
  return value === "low" || value === "high" ? value : "medium";
}

function parseColors(value: string | undefined): GradientColors {
  if (!value) return DEFAULT_COLORS;

  try {
    const parsed = JSON.parse(value);
    if (
      Array.isArray(parsed) &&
      parsed.length === 5 &&
      parsed.every((color) => typeof color === "string")
    ) {
      return parsed as GradientColors;
    }
  } catch {
    return DEFAULT_COLORS;
  }

  return DEFAULT_COLORS;
}

function getOptions(element: HTMLElement): AnimatedGradientOptions {
  return {
    colors: parseColors(element.dataset.colors),
    speed: parseNumber(element.dataset.speed, 0.08),
    warpStrength: parseNumber(element.dataset.warpStrength, 0.18),
    noiseScale: parseNumber(element.dataset.noiseScale, 0.5),
    brightness: parseNumber(element.dataset.brightness, 1.1),
    grainStrength: parseNumber(element.dataset.grainStrength, 0.04),
    interactive: parseBoolean(element.dataset.interactive, true),
    mouseInfluence: parseNumber(element.dataset.mouseInfluence, 0.2),
    paused: parseBoolean(element.dataset.paused, false),
    quality: parseQuality(element.dataset.quality),
  };
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

class AnimatedGradient {
  private readonly container: GradientElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly options: AnimatedGradientOptions;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.OrthographicCamera;
  private readonly geometry: THREE.PlaneGeometry;
  private readonly material: THREE.ShaderMaterial;
  private readonly mesh: THREE.Mesh;
  private readonly resizeObserver: ResizeObserver;
  private readonly intersectionObserver: IntersectionObserver;
  private readonly reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly interactionTarget: HTMLElement;
  private frameId = 0;
  private isVisible = true;
  private isDestroyed = false;
  private hasRenderedReducedMotionFrame = false;
  private targetMouse = new THREE.Vector2(0.5, 0.5);
  private currentMouse = new THREE.Vector2(0.5, 0.5);
  private targetHover = 0;
  private hover = 0;

  constructor(container: GradientElement, canvas: HTMLCanvasElement, options: AnimatedGradientOptions) {
    this.container = container;
    this.canvas = canvas;
    this.options = options;
    this.interactionTarget =
      container.parentElement instanceof HTMLElement ? container.parentElement : container;

    const colors = options.colors.map((color) => new THREE.Color(color));

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: this.currentMouse.clone() },
        uSpeed: { value: options.speed },
        uWarpStrength: { value: options.warpStrength },
        uNoiseScale: { value: options.noiseScale },
        uBrightness: { value: options.brightness },
        uGrainStrength: { value: options.grainStrength },
        uMouseInfluence: { value: options.mouseInfluence },
        uHover: { value: 0 },
        uColor1: { value: colors[0] },
        uColor2: { value: colors[1] },
        uColor3: { value: colors[2] },
        uColor4: { value: colors[3] },
        uColor5: { value: colors[4] },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);

    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.isVisible = entries.some((entry) => entry.isIntersecting);
      this.updateLoop();
    });
    this.intersectionObserver.observe(container);

    this.addListeners();
    this.resize();
    this.updateLoop();
  }

  destroy(): void {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.removeListeners();
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.container.dataset.initialized = "false";
    delete this.container.gradientInstance;
  }

  private addListeners(): void {
    this.interactionTarget.addEventListener("pointermove", this.handlePointerMove);
    this.interactionTarget.addEventListener("pointerenter", this.handlePointerEnter);
    this.interactionTarget.addEventListener("pointerleave", this.handlePointerLeave);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.reducedMotionQuery.addEventListener("change", this.handleReducedMotionChange);
  }

  private removeListeners(): void {
    this.interactionTarget.removeEventListener("pointermove", this.handlePointerMove);
    this.interactionTarget.removeEventListener("pointerenter", this.handlePointerEnter);
    this.interactionTarget.removeEventListener("pointerleave", this.handlePointerLeave);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.reducedMotionQuery.removeEventListener("change", this.handleReducedMotionChange);
  }

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.options.interactive) return;

    const rect = this.interactionTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    this.targetMouse.set(
      THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width, 0, 1),
      THREE.MathUtils.clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1),
    );
    this.targetHover = 1;
  };

  private handlePointerEnter = (): void => {
    if (this.options.interactive) this.targetHover = 1;
  };

  private handlePointerLeave = (): void => {
    this.targetHover = 0;
    this.targetMouse.set(0.5, 0.5);
  };

  private handleVisibilityChange = (): void => {
    this.updateLoop();
  };

  private handleReducedMotionChange = (): void => {
    this.hasRenderedReducedMotionFrame = false;
    this.updateLoop();
  };

  private resize(): void {
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const maxDpr = QUALITY_DPR[this.options.quality];

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    this.renderer.setSize(width, height, false);
    this.material.uniforms.uResolution.value.set(width, height);
    this.render();
  }

  private shouldAnimate(): boolean {
    return (
      !this.isDestroyed &&
      !this.options.paused &&
      this.isVisible &&
      !document.hidden &&
      !this.reducedMotionQuery.matches
    );
  }

  private updateLoop(): void {
    cancelAnimationFrame(this.frameId);

    if (this.reducedMotionQuery.matches) {
      if (!this.hasRenderedReducedMotionFrame) {
        this.hasRenderedReducedMotionFrame = true;
        this.render();
      }
      return;
    }

    if (this.shouldAnimate()) {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private tick = (time: number): void => {
    if (!this.shouldAnimate()) {
      this.updateLoop();
      return;
    }

    this.material.uniforms.uTime.value = time * 0.001;
    this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * 0.05;
    this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * 0.05;
    this.hover += (this.targetHover - this.hover) * 0.06;
    this.material.uniforms.uMouse.value.copy(this.currentMouse);
    this.material.uniforms.uHover.value = this.hover;
    this.render();
    this.frameId = requestAnimationFrame(this.tick);
  };

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}

export function initAnimatedGradients(): void {
  if (!supportsWebGL()) {
    document.querySelectorAll<HTMLElement>("[data-animated-gradient]").forEach((element) => {
      element.classList.add("is-fallback");
    });
    bindLifecycleListeners();
    return;
  }

  document.querySelectorAll<GradientElement>("[data-animated-gradient]").forEach((element) => {
    if (element.dataset.initialized === "true") return;

    const canvas = element.querySelector("canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return;

    element.dataset.initialized = "true";
    const instance = new AnimatedGradient(element, canvas, getOptions(element));
    element.gradientInstance = instance;
  });

  bindLifecycleListeners();
}

export function destroyAnimatedGradients(): void {
  document.querySelectorAll<GradientElement>("[data-animated-gradient]").forEach((element) => {
    element.gradientInstance?.destroy();
    element.dataset.initialized = "false";
  });
}

function bindLifecycleListeners(): void {
  if (lifecycleListenersBound) return;
  lifecycleListenersBound = true;

  document.addEventListener("astro:page-load", initAnimatedGradients);
  document.addEventListener("astro:before-swap", destroyAnimatedGradients);
}

