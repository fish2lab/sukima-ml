/**
 * 漫画对话框的几何：BX 短片第 5 段 `s5BalloonPts` / `s5Bubble`（animation/scenes/5-win.js）的移植。
 * 超椭圆（指数 4.5）的圆角方框，朝说话的人伸出一个尖；边缘用木刻毛边（片子 block 的 amp 1.2、freq 18），
 * 外面再描一圈粗墨线。全部是纯函数，输出 SVG path 字符串，SSR 也能算。
 */
import { TAU, clamp, pathD, rough, strokePathD, type Poly, type Pt } from '../woodcut/draw';

/** 片子里的超椭圆指数 */
export const BALLOON_N = 4.5;

/** 超椭圆上参数角 a 处的点（片子 s5BalloonPts 里的 on） */
export function superPt(cx: number, cy: number, rx: number, ry: number, a: number, n = BALLOON_N): Pt {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  return [cx + rx * Math.sign(ca) * Math.pow(Math.abs(ca), 2 / n), cy + ry * Math.sign(sa) * Math.pow(Math.abs(sa), 2 / n)];
}

const tipAngle = (cx: number, cy: number, rx: number, ry: number, tip: Pt): number => Math.atan2((tip[1] - cy) / ry, (tip[0] - cx) / rx);

/**
 * 片子 s5BalloonPts：超椭圆轮廓，在朝 tip 的参数角 ± half 处断开，接上尖。
 * 和片子的差别只有取点顺序：从尖根部的一侧绕一整圈到另一侧再接尖，half 再小也不会漏掉尖。
 * tip 为 null 时是没有尖的圆角方框。
 */
export function balloonPts(cx: number, cy: number, rx: number, ry: number, tip: Pt | null, n = BALLOON_N, half = 0.17, samples = 72): Poly {
  if (!tip) return Array.from({ length: samples }, (_, k): Pt => superPt(cx, cy, rx, ry, -Math.PI + (k / samples) * TAU, n));
  const at = tipAngle(cx, cy, rx, ry, tip);
  const span = TAU - 2 * half;
  const steps = Math.max(12, Math.round((samples * span) / TAU));
  const out: Poly = [];
  for (let k = 0; k <= steps; k++) out.push(superPt(cx, cy, rx, ry, at + half + (span * k) / steps, n));
  out.push([tip[0], tip[1]]);
  return out;
}

/**
 * 尖根部在参数角上的半宽：让根部两点的距离约等于 2 × base 像素。
 * 片子的气泡只有一行字（ry ≈ 55），固定用 .17；网页上的气泡高矮不定，按像素定根部宽度，尖不会随气泡变胖。
 */
export function tailHalf(cx: number, cy: number, rx: number, ry: number, tip: Pt, base: number, n = BALLOON_N): number {
  const at = tipAngle(cx, cy, rx, ry, tip);
  let lo = 0.002;
  let hi = 0.8;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const a = superPt(cx, cy, rx, ry, at - mid, n);
    const b = superPt(cx, cy, rx, ry, at + mid, n);
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 2 * base) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** tip 离轮廓太近（在框里或贴着框）时不画尖 */
function tipOutside(cx: number, cy: number, rx: number, ry: number, tip: Pt, n = BALLOON_N): boolean {
  const u = Math.abs((tip[0] - cx) / rx);
  const v = Math.abs((tip[1] - cy) / ry);
  return Math.pow(u, n) + Math.pow(v, n) > 1.25;
}

export interface BalloonPaths {
  /** 纸色底（带木刻毛边的外沿） */
  fill: string;
  /** 沿外沿描的一圈粗墨线 */
  line: string;
}

export interface BalloonOptions {
  /** 墨线宽，默认 3.2 */
  lineWidth?: number;
  /** 尖根部的半宽（像素）；默认按气泡大小取 9–16 */
  base?: number;
}

/**
 * 一个 w × h 的对话框（坐标原点在框的左上角），尖指向 tip（同一坐标系，可以在框外任何方向）。
 * 同样的参数和 seed 永远是同一个形状。
 */
export function balloonPaths(w: number, h: number, tip: Pt | null, seed: number, o: BalloonOptions = {}): BalloonPaths {
  const { lineWidth = 3.2 } = o;
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2;
  const ry = h / 2;
  const t = tip && tipOutside(cx, cy, rx, ry, tip) ? tip : null;
  const base = o.base ?? clamp(Math.min(w, h) * 0.06, 9, 16);
  const half = t ? tailHalf(cx, cy, rx, ry, t, base) : 0;
  const edge = rough(balloonPts(cx, cy, rx, ry, t, BALLOON_N, half), { smooth: false, amp: 1.2, freq: 18, seed });
  // 墨线从尖的对面起笔，首尾在平的一边上接起来（接缝不落在尖上）
  const k0 = Math.floor(edge.length / 2);
  const ring = edge.slice(k0).concat(edge.slice(0, k0));
  ring.push(ring[0]);
  const line = strokePathD(ring, { w: lineWidth, flat: true, smooth: false, rough: 0.3, seed: seed + 7 });
  return { fill: pathD(edge), line };
}

/** 手画的 ×（24 × 24） */
export function crossPaths(seed: number): string {
  const o = { w: 2.6, taper: 0.3, rough: 0.35, smooth: false } as const;
  return (
    strokePathD(
      [
        [5, 5.5],
        [19, 18.5],
      ],
      { ...o, seed },
    ) +
    strokePathD(
      [
        [18.5, 5],
        [5.5, 19],
      ],
      { ...o, seed: seed + 3 },
    )
  );
}

/** 手画的木刻箭头（朝右，60 × 40）：一笔杆 + 一块带缺口的墨块箭头 */
export function arrowPaths(seed: number): { shaft: string; head: string } {
  return {
    shaft: strokePathD(
      [
        [5, 20.5],
        [21, 19.2],
        [40, 20.4],
      ],
      { w: 5, taper: 0.12, rough: 0.35, seed },
    ),
    head: pathD(
      rough(
        [
          [56, 20],
          [35, 6.5],
          [40.5, 20],
          [35, 33.5],
        ],
        { smooth: false, amp: 0.9, freq: 9, seed: seed + 3 },
      ),
    ),
  };
}
