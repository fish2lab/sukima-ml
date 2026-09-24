/**
 * 手画的小记号（圈、竖线、×、刻度）的 SVG path。几何全部来自木刻画具 draw.ts（README「draw.ts：画具」），
 * 按 seed 算出来，SSR 直接输出，同样的 seed 永远同一个形状。
 */
import { TAU, rng, strokePathD, type Pt } from '../woodcut/draw';

export interface Mark {
  d: string;
  w: number;
  h: number;
}

/** 手画的圈：从左上起笔，多绕约 1/8 圈收笔，半径略有漂移，首尾不重合（像用毛笔圈了一下） */
export function circleMark(seed: number, size = 48, weight = 2.6): Mark {
  const r = rng(seed);
  const c = size / 2;
  const R = size / 2 - weight * 1.6;
  const a0 = -Math.PI * (0.62 + 0.22 * r());
  const turns = 1.1 + 0.08 * r();
  const n = 40;
  const tilt = (r() - 0.5) * 0.5;
  const pts: Pt[] = [];
  for (let i = 0; i <= Math.round(n * turns); i++) {
    const t = i / n;
    const a = a0 + t * TAU;
    const drift = 0.95 + 0.07 * t + 0.025 * Math.sin(a * 2 + seed);
    const x = R * 1.04 * drift * Math.cos(a);
    const y = R * 0.93 * drift * Math.sin(a);
    pts.push([c + x * Math.cos(tilt) - y * Math.sin(tilt), c + x * Math.sin(tilt) + y * Math.cos(tilt)]);
  }
  return { d: strokePathD(pts, { w: weight, taper: 0.28, rough: 0.3, seed, step: 2 }), w: size, h: size };
}

/** 一道竖着的木刻粗线（引用块左边那道）：长 len、粗 weight，拉伸时只沿长度方向拉 */
export function barMark(seed: number, len = 240, weight = 6): Mark {
  const w = weight + 2;
  const mid = w / 2;
  const pts: Pt[] = [
    [mid, 1],
    [mid + 0.5, len * 0.35],
    [mid - 0.4, len * 0.7],
    [mid, len - 1],
  ];
  return { d: strokePathD(pts, { w: weight, taper: 0.05, rough: 0.35, seed, step: 3 }), w, h: len };
}

/** 手画的 ×：两笔，略弯 */
export function crossMark(seed: number, size = 24, weight = 2.8): Mark {
  const p = weight + 1.5;
  const q = size - p;
  const a: Pt[] = [
    [p, p],
    [size / 2 + 0.6, size / 2 - 0.4],
    [q, q + 0.5],
  ];
  const b: Pt[] = [
    [q, p + 0.5],
    [size / 2 - 0.3, size / 2 + 0.5],
    [p + 0.5, q],
  ];
  return {
    d: strokePathD(a, { w: weight, taper: 0.3, rough: 0.3, seed }) + strokePathD(b, { w: weight, taper: 0.3, rough: 0.3, seed: seed + 7 }),
    w: size,
    h: size,
  };
}

/** 尺子上的一根刻度（竖线，高 20、宽 4 的格子里，拉伸时只沿长度方向拉） */
export function tickMark(seed: number, weight = 2): Mark {
  const r = rng(seed);
  const pts: Pt[] = [
    [2 + (r() - 0.5) * 0.4, 0.5],
    [2 + (r() - 0.5) * 0.4, 19.5],
  ];
  return { d: strokePathD(pts, { w: weight, taper: 0.12, rough: 0.3, seed, step: 1 }), w: 4, h: 20 };
}

/**
 * 票据侧边打孔缺口的描边：一段半圆弧，圆心在格子左边的中点、半径 r，向右鼓出（右侧缺口用 CSS 水平翻转）。
 * 格子宽 r + 3、高 2r + 6，弧两端各伸出一点，接上票据外沿的墨线。
 */
export function notchMark(seed: number, r = 13, weight = 1.6): Mark {
  const h = 2 * r + 6;
  const cy = h / 2;
  const pts: Pt[] = [];
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI;
    pts.push([r * Math.cos(a) + 0.4, cy + r * Math.sin(a)]);
  }
  return { d: strokePathD(pts, { w: weight, taper: 0.08, rough: 0.3, seed, step: 1.5 }), w: r + 3, h };
}

/** 把一个记号变成 CSS 能用的 url()（给 mask-image 用；颜色由 background 决定） */
export function markUrl({ d, w, h }: Mark): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${d}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
