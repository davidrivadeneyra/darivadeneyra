precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uSpeed;
uniform float uWarpStrength;
uniform float uNoiseScale;
uniform float uBrightness;
uniform float uGrainStrength;
uniform float uMouseInfluence;
uniform float uHover;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;

varying vec2 vUv;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(0.8, -0.6, 0.6, 0.8);

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = rotate * p * 2.05 + 17.13;
    amplitude *= 0.5;
  }

  return value;
}

float gaussianBlob(vec2 uv, vec2 position, float radius, float softness) {
  float distanceToCenter = length(uv - position);
  return exp(-pow(distanceToCenter / radius, 2.0) * softness);
}

vec2 aspectCorrect(vec2 uv, vec2 resolution) {
  vec2 corrected = uv;
  float aspect = resolution.x / max(resolution.y, 1.0);

  if (aspect > 1.0) {
    corrected.x = (uv.x - 0.5) * aspect + 0.5;
  } else {
    corrected.y = (uv.y - 0.5) / max(aspect, 0.001) + 0.5;
  }

  return corrected;
}

void main() {
  vec2 uv = vUv;
  vec2 correctedUv = aspectCorrect(uv, uResolution);
  float time = uTime * uSpeed;

  float fieldA = fbm(correctedUv * (2.4 + uNoiseScale * 3.6) + vec2(time * 0.36, -time * 0.19));
  float fieldB = fbm(correctedUv * (4.1 + uNoiseScale * 4.0) - vec2(time * 0.14, time * 0.31));
  vec2 warp = vec2(fieldA - 0.5, fieldB - 0.5) * uWarpStrength;

  vec2 mouse = aspectCorrect(uMouse, uResolution);
  float mouseGlow = gaussianBlob(correctedUv, mouse, 0.34, 2.8) * uHover;
  vec2 mouseWarp = (correctedUv - mouse) * mouseGlow * uMouseInfluence * 0.08;
  vec2 warpedUv = correctedUv + warp + mouseWarp;

  vec2 position1 = vec2(
    0.18 + sin(time * 0.31 + fieldB * 1.4) * 0.12,
    0.32 + cos(time * 0.24 + fieldA * 1.2) * 0.13
  );
  vec2 position2 = vec2(
    0.32 + cos(time * 0.22 + 1.7) * 0.16,
    0.18 + sin(time * 0.35 + fieldB) * 0.12
  );
  vec2 position3 = vec2(
    0.52 + sin(time * 0.18 + 2.4) * 0.15,
    0.48 + cos(time * 0.21 + fieldA * 1.6) * 0.16
  );
  vec2 position4 = vec2(
    0.74 + cos(time * 0.29 + 3.1) * 0.13,
    0.38 + sin(time * 0.20 + fieldB * 1.3) * 0.15
  );
  vec2 position5 = vec2(
    0.82 + sin(time * 0.17 + 4.2) * 0.11,
    0.72 + cos(time * 0.27 + fieldA) * 0.14
  );

  float scaleDrift = (fieldA - 0.5) * 0.05;
  float blob1 = gaussianBlob(warpedUv, position1, 0.38 + scaleDrift, 2.5) * 0.95;
  float blob2 = gaussianBlob(warpedUv, position2, 0.34 - scaleDrift, 2.8) * 0.9;
  float blob3 = gaussianBlob(warpedUv, position3, 0.42 + scaleDrift, 2.35) * 1.08;
  float blob4 = gaussianBlob(warpedUv, position4, 0.36, 2.65) * 0.96;
  float blob5 = gaussianBlob(warpedUv, position5, 0.39 - scaleDrift, 2.55) * 0.92;

  vec3 weightedColor =
    uColor1 * blob1 +
    uColor2 * blob2 +
    uColor3 * blob3 +
    uColor4 * blob4 +
    uColor5 * blob5;
  float totalWeight = max(blob1 + blob2 + blob3 + blob4 + blob5, 0.001);
  vec3 color = weightedColor / totalWeight;

  float diffuseGlow = blob3 * 0.26 + blob4 * 0.16 + blob5 * 0.12 + mouseGlow * 0.18;
  float vignette = smoothstep(1.15, 0.18, length(uv - 0.5));
  color *= uBrightness + diffuseGlow;
  color = mix(color * 0.82, color, vignette);

  float grain = hash(uv * uResolution + uTime * 19.0) - 0.5;
  color += grain * uGrainStrength;
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}

