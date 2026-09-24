/**
 * 木刻画具：BX 短片（/Users/fish2lab/Project/BX）画法的 TypeScript 移植。
 *
 *   animation/engine/core.js   rng、hash、noise1、缓动、sm、settle、spline
 *   animation/kit.js           K、rough、block、stroke、scratch、outline、eyeLines、tick、writeP
 *   animation/scenes/2-sukima.js  s2CrackPts、s2Lips、s2Bow、s2Eyes、s2Tear、s2SweepY、s2Hang
 *
 * 全部是纯函数：同样的参数永远画出同样的形状。seed 决定形状；只有「抖」的时候才给 seed 加上 tick()。
 * 几何函数返回点列；画法有两套：
 *   - Canvas2D：block / stroke / scratch / outline / eyeLines / drawSlit，只在浏览器里调用；
 *   - SVG path 字符串：pathD / roughPathD / strokePathD，SSR 也能算，给木刻毛边用。
 * 坐标单位是 CSS 像素（片子里是 1920×1080 的逻辑单位，数值照搬时按比例缩放）。
 *
 * 本文件不 import 任何东西，scripts/woodcut/make-grain.mjs 也直接用它（Node 的类型擦除）。
 * 所以只写可擦除的 TS：不用 enum、namespace、参数属性。
 */

export type Pt = [number, number];
export type Poly = Pt[];

// ===================== 颜色 =====================

/** BX kit.js 的颜色表 K，加第 2 段隙间月影的墙纸与展签卡片色。 */
export const K = {
  ink: '#161412',
  ink2: '#24211e',
  paper: '#ebe5d8',
  paper2: '#e2dbcc',
  card: '#f3efe6',
  g1: '#cdc6b8',
  g2: '#8e887d',
  g3: '#4b4741',
  plum: '#4B2A63',
  stamp: '#a3342c',
  /** SUKIMA_PAPER：隙间页面（画廊墙）的纸 */
  wall: '#F7F6F4',
  /** S2.C.card：墙上的展签卡片、卡纸衬 */
  wallCard: '#FCFBF9',
} as const;

// ===================== 数 =====================

export const TAU = Math.PI * 2;
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const clamp = (x: number, a: number, b: number): number => Math.max(a, Math.min(b, x));

/** 带种子的随机数发生器（mulberry32），返回 0..1。 */
export function rng(seed: number): () => number {
  let a = (seed * 1000003) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 一个整数 → 0..1，无状态。 */
export function hash(k: number, seed = 0): number {
  let a = (Math.imul(k | 0, 0x9e3779b1) + Math.imul((seed * 4096) | 0, 0x85ebca77)) | 0;
  a ^= a >>> 15;
  a = Math.imul(a, 0x2c1b3c6d);
  a ^= a >>> 12;
  a = Math.imul(a, 0x297a2d39);
  a ^= a >>> 15;
  return (a >>> 0) / 4294967296;
}

/** 一维值噪声，-1..1，x 每走 1 个单位一个起伏。 */
export function noise1(x: number, seed = 1): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, u);
}

export type Ease = (t: number) => number;
export const easeIO: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeIn: Ease = (t) => t * t * t;
export const easeOutQuint: Ease = (t) => 1 - Math.pow(1 - t, 5);
export const easeInOutSine: Ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeOutBack = (t: number, s = 1.70158): number =>
  1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

/** 时刻 a 到 b 之间的 0..1（带缓动）。 */
export const sm = (a: number, b: number, t: number, e: Ease = easeIO): number =>
  e(clamp((t - a) / (b - a), 0, 1));

/** t0 之后的衰减晃动（落地、到位的余振）。t0 之前为 0。 */
export function settle(
  t: number,
  t0 = 0,
  o: { amp?: number; freq?: number; decay?: number; phase?: number } = {},
): number {
  const { amp = 1, freq = 3, decay = 4, phase = 0 } = o;
  const u = t - t0;
  return u <= 0 ? 0 : amp * Math.exp(-decay * u) * Math.sin(TAU * freq * u + phase);
}

/** 手绘的「抖」：每秒换 fps 次种子，同一拍内不变。加到 seed 上，边缘就会轻轻地抖。 */
export const tick = (t: number, fps = 8): number => Math.floor(t * fps + 1e-6) * 17;

/** 逐字写出的进度 0..1：从 t0 起每字 per 秒（片子里 zh() 的 p 参数）。 */
export const writeP = (t: number, t0: number, str: string, per = 0.09): number =>
  clamp((t - t0) / (per * Math.max(1, [...str.replace(/\n/g, '')].length)), 0, 1);

// ===================== 几何 =====================

export function rectPts(x: number, y: number, w: number, h: number): Poly {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
}

export function ellPts(cx: number, cy: number, rx: number, ry: number, rot = 0, n = 44): Poly {
  const out: Poly = [];
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const x = rx * Math.cos(a);
    const y = ry * Math.sin(a);
    out.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return out;
}

/** 局部坐标 → 画面坐标：原点 (x, y)，缩放 s，旋转 rot，dir = -1 左右翻转。 */
export function tf(x: number, y: number, s: number, rot = 0, dir = 1): (u: number, v: number) => Pt {
  const ca = Math.cos(rot);
  const sa = Math.sin(rot);
  return (u, v) => {
    const X = u * s * dir;
    const Y = v * s;
    return [x + X * ca - Y * sa, y + X * sa + Y * ca];
  };
}

export const mapPts = (F: (u: number, v: number) => Pt, pts: readonly Pt[]): Poly => pts.map((p) => F(p[0], p[1]));

/** 折线每隔 step 插一个点。close 时首尾相接。 */
export function densify(pts: readonly Pt[], step = 4, close = true): Poly {
  const out: Poly = [];
  const n = pts.length;
  const segs = close ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const m = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < m; k++) out.push([lerp(a[0], b[0], k / m), lerp(a[1], b[1], k / m)]);
  }
  if (!close && n) out.push([pts[n - 1][0], pts[n - 1][1]]);
  return out;
}

/** Catmull-Rom 曲线穿过各点，大约每 step 取一个点。 */
export function spline(pts: readonly Pt[], step = 5, close = false): Poly {
  if (pts.length < 3) {
    const [a, b] = pts;
    const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    return Array.from({ length: n + 1 }, (_, k): Pt => [lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
  }
  const len = pts.length;
  const P = (i: number): Pt => (close ? pts[(i + len) % len] : pts[clamp(i, 0, len - 1)]);
  const out: Poly = [];
  const segs = close ? len : len - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1);
    const p1 = P(i);
    const p2 = P(i + 1);
    const p3 = P(i + 2);
    const n = Math.max(2, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (p2[0] - p0[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (p2[1] - p0[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  const last = close ? out[0] : pts[len - 1];
  out.push([last[0], last[1]]);
  return out;
}

function ringArea(p: readonly Pt[]): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
}

/** 闭合轮廓沿外法线推出 f(k, 弧长) 个单位（负数向内）。 */
export function offsetRing(q: readonly Pt[], f: (k: number, s: number) => number): Poly {
  const n = q.length;
  const sg = ringArea(q) > 0 ? 1 : -1;
  const out: Poly = new Array(n);
  let s = 0;
  for (let k = 0; k < n; k++) {
    if (k) s += Math.hypot(q[k][0] - q[k - 1][0], q[k][1] - q[k - 1][1]);
    const a = q[(k + n - 1) % n];
    const b = q[(k + 1) % n];
    const tx = b[0] - a[0];
    const ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    const d = f(k, s);
    out[k] = [q[k][0] + ((sg * ty) / l) * d, q[k][1] - ((sg * tx) / l) * d];
  }
  return out;
}

// ===================== 木刻墨块与线 =====================

export interface RoughOptions {
  /** 边缘起伏幅度 */
  amp?: number;
  /** 起伏的长度 */
  freq?: number;
  /** 长刺的概率（每个采样点） */
  spike?: number;
  /** 刺长 */
  spikeLen?: number;
  seed?: number;
  /** 采样间距 */
  step?: number;
  /** false 保留尖角（方框、书脊） */
  smooth?: boolean;
}

/** 木刻刀口的毛边偏移量：rough() 和 SVG 边条共用的一条公式。 */
export function roughOffset(k: number, s: number, o: RoughOptions = {}): number {
  const { amp = 2.2, freq = 14, spike = 0, spikeLen = 10, seed = 1 } = o;
  const base = amp * (0.8 * noise1(s / freq, seed) + 0.35 * noise1(s / (freq * 0.27), seed + 5));
  return base + (spike && hash(k, seed + 11) < spike ? spikeLen * (0.3 + 0.7 * hash(k, seed + 12)) : 0);
}

/** 闭合轮廓 → 木刻刀口一样的毛边轮廓。 */
export function rough(pts: readonly Pt[], o: RoughOptions = {}): Poly {
  const { step = 3, smooth = true } = o;
  let base: Poly = smooth && pts.length > 3 ? spline(pts, 4, true) : pts.map((p): Pt => [p[0], p[1]]);
  if (base.length > 2) {
    const f = base[0];
    const l = base[base.length - 1];
    if (Math.hypot(f[0] - l[0], f[1] - l[1]) < 0.01) base = base.slice(0, -1);
  }
  const q = densify(base, step, true);
  return offsetRing(q, (k, s) => roughOffset(k, s, o));
}

export interface StrokeOptions {
  /** 线宽 */
  w?: number;
  /** 0..1 画出一部分（笔头收尖，像正在写） */
  p?: number;
  seed?: number;
  /** 两头收尖的长度占全长的比例 */
  taper?: number;
  /** 线宽起伏 */
  rough?: number;
  /** 0..1 飞白（断续的空隙） */
  dry?: number;
  smooth?: boolean;
  close?: boolean;
  /** 沿线的线宽倍数（弧长比例 0..1） */
  wfn?: ((u: number) => number) | null;
  /** 两头不收尖（拼成方框的边条用） */
  flat?: boolean;
  /** 采样间距（默认 3，和片子一样） */
  step?: number;
}

/** 一笔 → 若干个多边形（飞白会把一笔断成几段）。两侧边缘各自粗糙，两头收尖。 */
export function strokePolys(pts: readonly Pt[], o: StrokeOptions = {}): Poly[] {
  const { w = 4, p = 1, seed = 1, taper = 0.3, rough: rg = 0.22, dry = 0, smooth = true, close = false, wfn = null, flat = false, step = 3 } = o;
  if (p <= 0 || pts.length < 2) return [];
  const q = smooth && pts.length > 2 ? spline(pts, step, close) : densify(pts, step, close);
  const s: number[] = [0];
  for (let i = 1; i < q.length; i++) s.push(s[i - 1] + Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]));
  const L = s[s.length - 1];
  if (L < 0.5) return [];
  const end = L * clamp(p, 0, 1);
  const tl = Math.max(w, (L * taper) / 2);
  const polys: Poly[] = [];
  let left: Poly = [];
  let right: Poly = [];
  const flush = () => {
    if (left.length > 1) polys.push(left.concat(right.reverse()));
    left = [];
    right = [];
  };
  for (let i = 0; i < q.length && s[i] <= end + 1e-6; i++) {
    const m = s[i];
    const a = q[Math.max(0, i - 1)];
    const b = q[Math.min(q.length - 1, i + 1)];
    const tx = b[0] - a[0];
    const ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    const nx = -ty / l;
    const ny = tx / l;
    if (dry && noise1(m / 22, seed + 3) + 0.45 * noise1(m / 6, seed + 4) > 1.05 - dry * 1.3) {
      flush();
      continue;
    }
    const prof = flat || (close && p >= 1) ? 1 : Math.sqrt(clamp(Math.min(m / tl, (end - m) / tl), 0, 1)) * 0.88 + 0.12;
    const hw = (w / 2) * prof * (wfn ? wfn(m / L) : 1);
    const kl = hw * (1 + rg * noise1(m / 7, seed));
    const kr = hw * (1 + rg * noise1(m / 7, seed + 9));
    left.push([q[i][0] + nx * kl, q[i][1] + ny * kl]);
    right.push([q[i][0] - nx * kr, q[i][1] - ny * kr]);
  }
  flush();
  return polys;
}

// ===================== Canvas2D =====================

type Ctx = CanvasRenderingContext2D;

export function polyPath(pts: readonly Pt[], close = true): Path2D {
  const p = new Path2D();
  pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])));
  if (close) p.closePath();
  return p;
}

export function fillPoly(c: Ctx, pts: readonly Pt[], color: string, alpha = 1): void {
  if (pts.length < 3 || alpha <= 0) return;
  c.save();
  c.globalAlpha *= alpha;
  c.fillStyle = color;
  c.fill(polyPath(pts));
  c.restore();
}

export interface BlockOptions extends RoughOptions {
  alpha?: number;
}

/** 一块木刻墨块。返回 Path2D，可以拿去 clip。（片子里的 grain 底纹在网页上由 CSS 纸纹负责，这里不画。） */
export function block(c: Ctx, pts: readonly Pt[], color: string, o: BlockOptions = {}): Path2D {
  const path = polyPath(rough(pts, o));
  c.save();
  c.globalAlpha *= o.alpha ?? 1;
  c.fillStyle = color;
  c.fill(path);
  c.restore();
  return path;
}

export interface PaintStrokeOptions extends StrokeOptions {
  color?: string;
  alpha?: number;
}

/** 一笔：填充成多边形。 */
export function stroke(c: Ctx, pts: readonly Pt[], o: PaintStrokeOptions = {}): void {
  const polys = strokePolys(pts, o);
  if (!polys.length) return;
  c.save();
  c.globalAlpha *= o.alpha ?? 1;
  c.fillStyle = o.color ?? K.ink;
  for (const poly of polys) c.fill(polyPath(poly));
  c.restore();
}

/** 黑底上的白色刮痕线（stroke 的浅色版，默认带一点飞白）。 */
export function scratch(c: Ctx, pts: readonly Pt[], o: PaintStrokeOptions = {}): void {
  stroke(c, pts, { w: 3, color: K.paper, dry: 0.18, taper: 0.45, ...o });
}

/** 闭合轮廓描一圈粗糙的线。 */
export function outline(c: Ctx, pts: readonly Pt[], o: PaintStrokeOptions = {}): void {
  stroke(c, pts, { close: true, taper: 0, ...o });
}

export interface EyeOptions {
  /** 0..1 眼皮线画出的进度 */
  lid?: number;
  /** 0 紧闭、.4 半睁、1 全睁 */
  open?: number;
  /** 瞳孔方向 [-1..1, -1..1] */
  look?: readonly [number, number];
  /** 瞳孔颜色 */
  iris?: string;
  /** 线宽 */
  w?: number;
  seed?: number;
  rot?: number;
  /** 眼白与眼皮刮痕线的颜色 */
  color?: string;
  /** 眼白里上眼皮那道暗线的颜色 */
  lidColor?: string;
}

/** 觉之瞳：只有眼皮线和睫毛，没有眉毛。(x, y) 眼的中心，r 眼的半宽。 */
export function eyeLines(c: Ctx, x: number, y: number, r: number, o: EyeOptions = {}): void {
  const { lid = 1, open = 0, look = [0, 0], iris = K.ink, w = r * 0.08, seed = 1, rot = 0, color = K.paper, lidColor = K.ink } = o;
  const T = tf(x, y - r * 0.14, r, rot);
  const up = (u: number) => lerp(0.2, -0.42, open) * (1 - u * u);
  const lo = (u: number) => 0.2 * (1 - u * u);
  const xs = Array.from({ length: 13 }, (_, k) => -1 + k / 6);
  if (open > 0.02) {
    const sclera: Poly = [...xs.map((u): Pt => [u, up(u)]), ...xs.slice().reverse().map((u): Pt => [u, lo(u)])];
    const path = polyPath(mapPts(T, sclera));
    c.save();
    c.fillStyle = color;
    c.fill(path);
    c.clip(path);
    const [ix, iy] = T(look[0] * 0.32, 0.02 + look[1] * 0.08);
    c.fillStyle = iris;
    c.beginPath();
    c.arc(ix, iy, r * 0.3, 0, TAU);
    c.fill();
    c.fillStyle = color;
    c.beginPath();
    c.arc(ix + r * 0.08, iy - r * 0.09, r * 0.07, 0, TAU);
    c.fill();
    stroke(c, mapPts(T, xs.map((u): Pt => [u, up(u) + 0.03])), { w: w * 1.5, color: lidColor, seed: seed + 2, taper: 0.2 });
    c.restore();
  }
  stroke(c, mapPts(T, xs.map((u): Pt => [u, open > 0.02 ? up(u) : lo(u)])), {
    w: w * (1.2 + (1 - open) * 0.3),
    color,
    p: lid,
    seed: seed + 3,
    taper: 0.35,
  });
  if (open < 0.5) {
    for (let k = 0; k < 5; k++) {
      const u = -0.62 + k * 0.31;
      const a = lid * 5 - k;
      if (a <= 0) continue;
      const b: Pt = [u, lo(u)];
      const d: Pt = [u * 1.25, lo(u) + 0.26 * (1 - Math.abs(u) * 0.4)];
      stroke(c, mapPts(T, [b, d]), { w: w * 0.75, color, p: clamp(a, 0, 1) * (1 - open * 2), seed: seed + 10 + k, taper: 0.6, smooth: false });
    }
  }
}

// ===================== SVG path =====================

/** 数字 → 最短写法：去掉整数部分的 0（0.3 → .3，-0.3 → -.3）。 */
const fmt = (v: number, precision: number): string => {
  const f = 10 ** precision;
  const r = Math.round(v * f) / f;
  if (r === 0) return '0';
  return String(r).replace(/^(-?)0\./, '$1.');
};

/** 点列 → SVG path 字符串（M 绝对坐标 + l 相对坐标；在取整后的坐标上求差，不会累积误差）。 */
export function pathD(pts: readonly Pt[], close = true, precision = 1): string {
  if (!pts.length) return '';
  const f = 10 ** precision;
  const R = (v: number) => Math.round(v * f);
  let px = R(pts[0][0]);
  let py = R(pts[0][1]);
  let d = `M${fmt(px / f, precision)} ${fmt(py / f, precision)}l`;
  const parts: string[] = [];
  for (let i = 1; i < pts.length; i++) {
    const x = R(pts[i][0]);
    const y = R(pts[i][1]);
    if (x === px && y === py) continue;
    parts.push(`${fmt((x - px) / f, precision)} ${fmt((y - py) / f, precision)}`);
    px = x;
    py = y;
  }
  // 负号本身就能分隔两个数，前面的空格省掉；.5 这种以点开头的数前面仍要留空格
  d += parts.join(' ').replace(/ -/g, '-');
  return close ? `${d}z` : d;
}

/** 毛边轮廓的 SVG path。 */
export const roughPathD = (pts: readonly Pt[], o: RoughOptions = {}, precision = 1): string => pathD(rough(pts, o), true, precision);

/** 一笔的 SVG path（飞白断开的几段合成一个 path）。 */
export const strokePathD = (pts: readonly Pt[], o: StrokeOptions = {}, precision = 1): string =>
  strokePolys(pts, o)
    .map((poly) => pathD(poly, true, precision))
    .join('');

// ===================== 隙间（第 2 段） =====================

export interface Crack {
  /** 一侧唇线（从 a 到 b） */
  L: Poly;
  /** 另一侧唇线 */
  R: Poly;
  /** 中线 */
  mid: Poly;
}

/** s2CrackPts：透镜形的隙间，从尖 a 到尖 b。hw 中间的半宽，bend 中线的弯度；pow 越小两头越圆，wob 边缘起伏。 */
export function crackPts(a: Pt, b: Pt, hw: number, seed: number, bend = 0, o: { pow?: number; wob?: number } = {}): Crack {
  const { pow = 0.7, wob = 0.16 } = o;
  const n = 56;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const L: Poly = [];
  const R: Poly = [];
  const mid: Poly = [];
  for (let k = 0; k <= n; k++) {
    const v = k / n;
    const s = Math.sin(v * Math.PI);
    const w = hw * Math.pow(s, pow) * (1 + wob * noise1(v * 7, seed));
    const off = bend * s + 3 * noise1(v * 4, seed + 2) * s;
    const x = a[0] + dx * v + nx * off;
    const y = a[1] + dy * v + ny * off;
    mid.push([x, y]);
    L.push([x + nx * w, y + ny * w]);
    R.push([x - nx * w, y - ny * w]);
  }
  return { L, R, mid };
}

/** s2Lips：隙间两侧唇线内侧的白色刮痕。inset 是刮痕离唇边的距离。 */
export function lips(c: Ctx, q: Crack, seed: number, w = 2.2, color: string = K.paper, inset = 3.2): void {
  const n = q.mid.length - 1;
  const k0 = Math.round(n * 0.07);
  const k1 = n - k0;
  [q.L, q.R].forEach((side, j) => {
    const pts: Poly = [];
    for (let k = k0; k <= k1; k++) {
      const m = q.mid[k];
      const e = side[k];
      const d = Math.hypot(e[0] - m[0], e[1] - m[1]);
      const f = d > 1 ? Math.max(0, d - inset) / d : 0;
      pts.push([lerp(m[0], e[0], f), lerp(m[1], e[1], f)]);
    }
    scratch(c, pts, { w, seed: seed + j * 7, dry: 0.12, taper: 0.4, color });
  });
}

/** s2Bow：隙间一端系的小蝴蝶结。(x, y) 是结，s 是大小；fill 结的颜色，line 结上的刮痕颜色。 */
export function bow(c: Ctx, x: number, y: number, s: number, seed: number, rot = 0, fill: string = K.ink, line: string = K.paper): void {
  if (s < 1) return;
  const T = tf(x, y, s, rot);
  for (const d of [-1, 1]) {
    block(c, mapPts(T, [[0, 0], [d * 0.5, -0.58], [d * 1.05, -0.64], [d * 1.22, -0.22], [d * 0.98, 0.12], [d * 0.42, 0.14]]), fill, {
      amp: s * 0.025,
      freq: 8,
      seed: seed + d,
    });
    scratch(c, mapPts(T, [[d * 0.3, -0.16], [d * 0.7, -0.42], [d * 0.98, -0.32]]), { w: Math.max(1.2, s * 0.06), seed: seed + 4 + d, dry: 0.1, color: line });
  }
  stroke(c, mapPts(T, [[-0.05, 0.08], [-0.3, 0.62], [-0.52, 1.18]]), { w: s * 0.17, color: fill, seed: seed + 7, taper: 0.5 });
  stroke(c, mapPts(T, [[0.05, 0.08], [0.26, 0.66], [0.4, 1.22]]), { w: s * 0.17, color: fill, seed: seed + 8, taper: 0.5 });
  fillPoly(c, mapPts(T, ellPts(0, 0, 0.22, 0.2, 0, 14)), fill);
}

/** S2EYES：隙间里的眼睛。沿缝的位置 u（占缝半长）、横穿缝的位置 v（占缝半宽）、眼的半宽（片子里缝半宽 110 时的单位）。 */
export const SLIT_EYES: ReadonlyArray<readonly [number, number, number]> = [
  [-0.08, -0.52, 70],
  [0.4, -0.18, 58],
  [-0.46, -0.06, 54],
  [0.08, 0.22, 76],
  [-0.28, 0.58, 50],
  [0.46, 0.52, 46],
  [-0.72, 0.28, 42],
];

/** 片子第 2 段的节奏（秒）：划线、张开、扫过、合上；原作停；展签翻出。 */
export const SWEEP_TIMING = { hold: 0.35, line: 0.2, open: 0.25, sweep: 0.7, close: 0.25, card: 0.3 } as const;

/** s2SweepY：隙间扫到的高度。progress 0..1，从画的上沿外 pad 扫到下沿外 pad（easeIO）。 */
export const sweepY = (progress: number, top: number, height: number, pad = 30): number =>
  lerp(top - pad, top + height + pad, easeIO(clamp(progress, 0, 1)));

/** s2Hang：画框在挂绳上的晃动角（弧度）。t0 到位时刻；峰值约 ±1.5°，两秒内停稳。 */
export const hangAngle = (t: number, t0 = 0): number => settle(t, t0, { amp: -0.044, freq: 1.1, decay: 2.6 });

export interface SlitColors {
  /** 缝（墨） */
  slit: string;
  /** 唇线刮痕、眼白 */
  line: string;
  /** 瞳孔 */
  iris: string;
  /** 两端蝴蝶结 */
  bow: string;
  /** 蝴蝶结上的刮痕 */
  bowLine: string;
  /** 缝外沿的描边；黑底上用纸色描一圈才看得见，null 不描 */
  rim: string | null;
}

export interface SlitParams {
  cx: number;
  cy: number;
  /** 缝的半长（尖到中心） */
  halfLen: number;
  /** 张满时中间的半宽 */
  halfWidth: number;
  /** 0..1：0–.3 先划出一道线，.3–1 张开 */
  open: number;
  /** 秒，眼睛换方向、眨眼按它算 */
  t: number;
  /** tick() 的值，加在 seed 上（抖） */
  jitter: number;
  seed: number;
  /** 眼睛只数 0..7 */
  eyes: number;
  /** 眼睛平均多少秒换一个方向看 */
  glance: number;
  /** false：眼睛不动、不眨 */
  alive: boolean;
  colors: SlitColors;
}

/** 缝的张开程度拆成两段：先划线（len 0..1），再张开（width 0..1）。 */
export function slitPhase(open: number): { len: number; width: number; bows: number } {
  return {
    len: easeOutQuint(clamp(open / 0.3, 0, 1)),
    width: easeOut(clamp((open - 0.3) / 0.7, 0, 1)),
    bows: easeOutBack(clamp((open - 0.02) / 0.26, 0, 1)),
  };
}

/** s2Tear + s2Eyes：画一道隙间。缝是墨色透镜，唇线是白色刮痕，两端系蝴蝶结，缝里的眼睛各看各的，偶尔眨一下。 */
export function drawSlit(c: Ctx, P: SlitParams): void {
  const { cx, cy, halfLen: hl, halfWidth: HW, seed, jitter: sd, colors: C } = P;
  if (P.open <= 0.001 || hl < 2 || HW < 1) return;
  const k = HW / 110;
  const ph = slitPhase(P.open);
  const hw = HW * ph.width;
  const tilt = 6 * (hl / 376) * ph.len;
  const a: Pt = [cx - hl * ph.len, cy + tilt];
  const b: Pt = [cx + hl * ph.len, cy - tilt];
  if (hw < Math.max(1.5, 3 * k)) {
    stroke(c, [a, b], { w: Math.max(1.6, 4 * k), color: C.slit, seed: seed + sd, taper: 0.25, rough: 0.2 });
  } else {
    const q = crackPts(a, b, hw, seed + sd, 0, { pow: 0.7, wob: 0.1 });
    const ring = rough([...q.L, ...q.R.slice().reverse()], { amp: Math.max(0.6, 1.1 * k), freq: 9, seed: seed + 1 + sd, smooth: false });
    const path = polyPath(ring);
    c.save();
    c.fillStyle = C.slit;
    c.fill(path);
    c.clip(path);
    for (let j = 0; j < Math.min(P.eyes, SLIT_EYES.length); j++) {
      const [u, v, r] = SLIT_EYES[j];
      let op = easeOut(clamp((ph.width - 0.25 - j * 0.05) / 0.45, 0, 1));
      if (P.alive && hash(Math.floor(P.t * 8), seed + 70 + j) < 1 / 45) op = Math.min(op, 0.06);
      if (op <= 0.02) continue;
      const period = P.glance * (0.6 + 0.8 * hash(j, seed + 90));
      const ang = (P.alive ? hash(Math.floor((P.t + j * 0.37) / period), seed + j) : hash(j, seed + 50)) * TAU;
      eyeLines(c, cx + u * hl, cy + v * hw, r * 0.5 * k, {
        open: op,
        look: [Math.cos(ang) * 0.9, Math.sin(ang) * 0.9],
        color: C.line,
        iris: C.iris,
        lidColor: C.slit,
        seed: seed + j * 5 + sd,
        rot: (hash(j, seed) - 0.5) * 0.24,
      });
    }
    c.restore();
    lips(c, q, seed + 3 + sd, Math.max(1.1, lerp(3, 5, ph.width) * k), C.line, Math.max(1.5, 3.2 * k));
    if (C.rim) outline(c, ring, { w: Math.max(1.2, 2.2 * k), color: C.rim, seed: seed + 5 + sd, smooth: false, rough: 0.3 });
  }
  const bk = 22 * k * ph.bows;
  bow(c, a[0], a[1], bk, seed + 40 + sd, -0.1, C.bow, C.bowLine);
  bow(c, b[0], b[1], bk, seed + 50 + sd, 0.1, C.bow, C.bowLine);
}
