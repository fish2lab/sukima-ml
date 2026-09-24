/**
 * 木刻毛边的 SVG 边条：每条边单独一个 SVG，只沿边的长度方向拉伸（preserveAspectRatio="none"），
 * 厚度方向 1:1，所以毛边的起伏和线宽在任何尺寸下都是真实的像素值；SSR 直接输出，不用量尺寸。
 * 形状只由参数和 seed 决定。
 */
import { noise1, pathD, roughOffset, strokePolys, type Poly, type Pt } from './draw';

export type Side = 'top' | 'right' | 'bottom' | 'left';

export interface Strip {
  /** SVG path */
  d: string;
  /** 条的长度（viewBox 的长边） */
  length: number;
  /** 条的厚度（像素，viewBox 的短边） */
  thickness: number;
  /** line：线中心离条的外沿多远；fill：毛边最远伸出块外多少 */
  anchor: number;
}

export interface LineStripOptions {
  /** 标称长度（像素）；显示时沿长度拉伸到实际长度 */
  length: number;
  /** 线宽 */
  weight: number;
  /** 中线起伏的幅度 */
  amp?: number;
  /** 中线起伏的长度 */
  freq?: number;
  /** 线宽起伏（片子 outline 用 .3） */
  roughness?: number;
  /** 飞白 0..1 */
  dry?: number;
  /** 两头收尖占全长的比例；0 两头平齐（拼方框用） */
  taper?: number;
  seed?: number;
}

export interface FillStripOptions {
  length: number;
  /** 毛边平均伸出块外的距离 */
  amp: number;
  freq?: number;
  /** 长刺的概率 */
  spike?: number;
  spikeLen?: number;
  seed?: number;
  /** 条伸进块里多深（盖住块的直边） */
  depth?: number;
}

/** 横条（上沿朝外）→ 某条边：bottom 上下翻转，left / right 转成竖条，外侧朝左 / 朝右。 */
function orient(poly: Poly, side: Side, thickness: number): Poly {
  switch (side) {
    case 'top':
      return poly;
    case 'bottom':
      return poly.map(([x, y]): Pt => [x, thickness - y]);
    case 'left':
      return poly.map(([x, y]): Pt => [y, x]);
    case 'right':
      return poly.map(([x, y]): Pt => [thickness - y, x]);
  }
}

/** 一笔毛边线，沿着 side 那条边。 */
export function lineStrip(o: LineStripOptions, side: Side = 'top'): Strip {
  const { length: L, weight: w, amp = 0.6, freq = 40, roughness = 0.3, dry = 0, taper = 0, seed = 1 } = o;
  const thickness = Math.ceil(w * (1 + roughness) + 2.4 * amp + 2);
  const c = thickness / 2;
  // 采样间距 5px：线宽起伏（波长 7）采得粗一点，像刀刻；SSR 的 path 也短一半
  const step = 5;
  const at = (x: number) => c + amp * (0.8 * noise1(x / freq, seed + 21) + 0.35 * noise1(x / (freq * 0.27), seed + 22));
  const pts: Pt[] = [];
  for (let x = 0; x < L; x += step) pts.push([x, at(x)]);
  pts.push([L, at(L)]);
  // 点已经按 step 取好；densify 的步长放大一点，免得浮点误差把每段再切成两半
  const d = strokePolys(pts, { w, rough: roughness, dry, seed, smooth: false, flat: taper <= 0, taper, step: step * 1.25 })
    .map((p) => pathD(orient(p, side, thickness)))
    .join('');
  return { d, length: L, thickness, anchor: c };
}

/** 墨块的一条边：外沿是木刻刀口的毛边，内沿平直、伸进块里 depth。 */
export function fillStrip(o: FillStripOptions, side: Side = 'top'): Strip {
  const { length: L, amp, freq = 14, spike = 0, spikeLen = 4, seed = 1, depth = 2 } = o;
  const step = 4;
  const offs: Array<[number, number]> = [];
  const at = (k: number, x: number) => Math.max(0, amp + roughOffset(k, x, { amp, freq, spike, spikeLen, seed }));
  let k = 0;
  for (let x = 0; x < L; x += step, k++) offs.push([x, at(k, x)]);
  offs.push([L, at(k, L)]);
  const out = Math.ceil(Math.max(...offs.map((p) => p[1]))) + 0.5;
  const thickness = out + depth;
  const poly: Poly = [[0, thickness], ...offs.map(([x, off]): Pt => [x, out - off]), [L, thickness]];
  return { d: pathD(orient(poly, side, thickness)), length: L, thickness, anchor: out };
}
