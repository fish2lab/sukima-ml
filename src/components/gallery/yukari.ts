/**
 * 八云紫立绘（/img/yukari.webp，1200 × 1569）的几何：命中测试的 alpha 表、讲解气泡往哪摆。
 * 只在浏览器的事件处理和 effect 里调用（要读 getBoundingClientRect）。
 */
import { clamp, type Pt } from '../woodcut/draw';
import type { BubblePlace } from './SpeechBubble';

export const YUKARI_IMAGE = { width: 1200, height: 1569 } as const;

/**
 * 立绘里不透明像素（alpha > 10）的外接框，四边各留 4px（实测 x 636–1179、y 844–1568）。
 * 按钮只盖这一块：透明的大片区域不挡住后面的画。换图要重新量。
 */
export const YUKARI_BOX = { x0: 632, y0: 840, x1: 1184, y1: 1569 } as const;

/** 读不到像素时（画布被污染等）用的实测值：头顶、最右、头那一段的左右、头顶往下 10% 图高那一行的左右 */
const YUKARI_SHAPE = { minY: 844, maxX: 1179, headLeft: 863, headRight: 1076, headRows: 116, rowLeft: 662, rowRight: 1054 } as const;

export type YukariHitMap = {
  width: number;
  height: number;
  alphaData: Uint8ClampedArray;
  minY: number;
  maxX: number;
};

/** 气泡定位用到的几个点，都是相对舞台（气泡的定位父元素）的 CSS 像素 */
export interface YukariAnchor {
  /** 原 bubblePosition：紫最右边的不透明像素再往右 20，头顶往下 10% 图高 */
  left: number;
  top: number;
  /** top 那一行紫的左右边 */
  rowLeft: number;
  rowRight: number;
  /** 头：最上面 16% 不透明高度里的左右边、头顶、中线 */
  headTop: number;
  headLeft: number;
  headRight: number;
  headMidY: number;
}

function rowExtent(h: YukariHitMap, py: number): [number, number] | null {
  const y = clamp(Math.round(py), 0, h.height - 1);
  let l = -1;
  let r = -1;
  for (let x = 0; x < h.width; x++) {
    if (h.alphaData[(y * h.width + x) * 4 + 3] > 10) {
      if (l < 0) l = x;
      r = x;
    }
  }
  return l < 0 ? null : [l, r];
}

/** 从 alpha 表算气泡的锚点（bubblePosition 的算法照旧，另外量出头和那一行的左右边给尖用） */
export function anchorFrom(h: YukariHitMap, rect: DOMRect, stage: DOMRect): YukariAnchor {
  const scaleX = h.width / rect.width;
  const scaleY = h.height / rect.height;
  const ox = rect.left - stage.left;
  const oy = rect.top - stage.top;
  const cssTop = h.minY / scaleY;
  const cssLeft = h.maxX / scaleX;
  const top = cssTop + rect.height * 0.1;
  const row = rowExtent(h, top * scaleY) ?? [h.maxX, h.maxX];
  const headRows = Math.max(1, Math.round((h.height - h.minY) * 0.16));
  let hl = h.width;
  let hr = 0;
  for (let y = h.minY; y < h.minY + headRows; y += 2) {
    const e = rowExtent(h, y);
    if (e) {
      hl = Math.min(hl, e[0]);
      hr = Math.max(hr, e[1]);
    }
  }
  if (hr < hl) {
    hl = h.maxX;
    hr = h.maxX;
  }
  return {
    left: ox + cssLeft + 20,
    top: oy + top,
    rowLeft: ox + row[0] / scaleX,
    rowRight: ox + row[1] / scaleX,
    headTop: oy + cssTop,
    headLeft: ox + hl / scaleX,
    headRight: ox + hr / scaleX,
    headMidY: oy + (h.minY + headRows / 2) / scaleY,
  };
}

/** 读不到像素时的锚点：用实测值 */
export function fallbackAnchor(rect: DOMRect, stage: DOMRect): YukariAnchor {
  const sx = rect.width / YUKARI_IMAGE.width;
  const sy = rect.height / YUKARI_IMAGE.height;
  const ox = rect.left - stage.left;
  const oy = rect.top - stage.top;
  const s = YUKARI_SHAPE;
  return {
    left: ox + s.maxX * sx + 20,
    top: oy + s.minY * sy + rect.height * 0.1,
    rowLeft: ox + s.rowLeft * sx,
    rowRight: ox + s.rowRight * sx,
    headTop: oy + s.minY * sy,
    headLeft: ox + s.headLeft * sx,
    headRight: ox + s.headRight * sx,
    headMidY: oy + (s.minY + s.headRows / 2) * sy,
  };
}

const M = 10;

/**
 * 气泡摆在哪：先照原来的 bubblePosition 摆在紫的右边（尖朝左指回她）；右边放不下（手机）就摆在她头的左边（尖朝右），
 * 左边也窄于 230px 就摆在头顶上（尖朝下）。
 */
export function placeBubble(a: YukariAnchor, stageW: number, stageH: number, narrow: boolean): BubblePlace {
  const u = Math.min(stageH / 840, stageW / 1440);
  const pref = narrow ? Math.min(320, stageW - 2 * M) : clamp(340 * u, 270, 380);
  if (a.left + pref <= stageW - M) {
    const tip: Pt = [a.rowRight + 10, a.top + 26];
    return { side: 'right', left: a.left, width: pref, anchorTop: a.top, tip };
  }
  const tipL: Pt = [a.headLeft - 8, a.headMidY];
  const right = tipL[0] - 26;
  const w = Math.min(pref, right - M);
  if (w >= 230) return { side: 'left', left: right - w, width: w, anchorTop: tipL[1], tip: tipL };
  const w3 = Math.min(pref, stageW - 2 * M);
  const cx = (a.headLeft + a.headRight) / 2;
  return {
    side: 'above',
    left: clamp(cx - w3 * 0.62, M, stageW - w3 - M),
    width: w3,
    anchorTop: a.headTop - 22,
    tip: [cx, a.headTop - 4],
  };
}
