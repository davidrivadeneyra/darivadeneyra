export type GradientQuality = "low" | "medium" | "high";

export type GradientColors = [string, string, string, string, string];

export interface AnimatedGradientProps {
  colors?: GradientColors;
  speed?: number;
  warpStrength?: number;
  noiseScale?: number;
  brightness?: number;
  grainStrength?: number;
  interactive?: boolean;
  mouseInfluence?: number;
  paused?: boolean;
  quality?: GradientQuality;
  class?: string;
}

export interface AnimatedGradientOptions {
  colors: GradientColors;
  speed: number;
  warpStrength: number;
  noiseScale: number;
  brightness: number;
  grainStrength: number;
  interactive: boolean;
  mouseInfluence: number;
  paused: boolean;
  quality: GradientQuality;
}

