import React, { memo, useMemo, type CSSProperties, type ReactNode } from 'react';
import clsx from 'clsx';
import { fillStrip, lineStrip, type Side, type Strip } from './edges';
import styles from './RoughBorder.module.css';

/** all 四边；x 上下两边；y 左右两边；或单独一边 */
export type RoughSides = 'all' | 'x' | 'y' | Side;

export interface RoughBorderProps {
  /**
   * line：沿盒子边描一圈木刻毛边线（片子的 outline）；
   * fill：给同色的实心块加木刻刀口的外沿（片子的 block 毛边），color 要和块的底色一样。
   */
  variant?: 'line' | 'fill';
  /** line 的线宽（像素），默认 2 */
  weight?: number;
  /** 起伏幅度（像素）。line 是中线的起伏，默认 .6；fill 是外沿平均伸出多少，默认 1.2 */
  amp?: number;
  /** 起伏的长度（像素，按标称尺寸）。line 默认 40，fill 默认 14 */
  freq?: number;
  /** line 的线宽起伏，默认 .3 */
  roughness?: number;
  /** line 的飞白 0..1，默认 0 */
  dry?: number;
  /** fill 的长刺概率，默认 0 */
  spike?: number;
  /** fill 的刺长（像素），默认 4 */
  spikeLen?: number;
  seed?: number;
  /** 「抖」：useJitterTick() 的返回值，加在 seed 上；0 = 形状固定 */
  jitter?: number;
  /** 标称尺寸 [宽, 高]（像素）。毛边按这个长度生成，再沿边拉伸到实际长度；填和实际尺寸差不多的数就行 */
  nominal?: readonly [number, number];
  /** line 的中线离盒子边向内多少（数字是像素，也可以是 CSS 长度，如 'calc(var(--fw) * .35)'）；负数向外 */
  inset?: number | string;
  sides?: RoughSides;
  /** 颜色，默认 currentColor */
  color?: string;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
}

const SIDES: Record<RoughSides, readonly Side[]> = {
  all: ['top', 'right', 'bottom', 'left'],
  x: ['top', 'bottom'],
  y: ['left', 'right'],
  top: ['top'],
  right: ['right'],
  bottom: ['bottom'],
  left: ['left'],
};
const SIDE_SEED: Record<Side, number> = { top: 0, right: 101, bottom: 202, left: 303 };
const horizontal = (s: Side) => s === 'top' || s === 'bottom';
const len = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);
const r2 = (v: number) => Math.round(v * 100) / 100;

interface Piece {
  side: Side;
  strip: Strip;
  pos: CSSProperties;
}

/**
 * 木刻毛边：绝对定位盖在父元素上（父元素要 position: relative），每条边一个 SVG，aria-hidden。
 * 同样的参数和 seed 永远是同一个形状；SSR 直接输出。
 */
function RoughBorder({
  variant = 'line',
  weight = 2,
  amp,
  freq,
  roughness = 0.3,
  dry = 0,
  spike = 0,
  spikeLen = 4,
  seed = 1,
  jitter = 0,
  nominal = [240, 160],
  inset = 0,
  sides = 'all',
  color,
  opacity,
  className,
  style,
}: RoughBorderProps): ReactNode {
  const [nw, nh] = nominal;
  const pieces = useMemo((): Piece[] => {
    const list = SIDES[sides];
    if (variant === 'fill') {
      const a = amp ?? 1.2;
      const ext = r2(a);
      return list.map((side) => {
        const h = horizontal(side);
        const strip = fillStrip({ length: (h ? nw : nh) + 2 * ext, amp: a, freq: freq ?? 14, spike, spikeLen, seed: seed + jitter + SIDE_SEED[side] }, side);
        const out = `${-strip.anchor}px`;
        const pos: CSSProperties = h
          ? { left: -ext, width: `calc(100% + ${2 * ext}px)`, height: strip.thickness, [side]: out }
          : { top: -ext, height: `calc(100% + ${2 * ext}px)`, width: strip.thickness, [side]: out };
        return { side, strip, pos };
      });
    }
    const a = amp ?? 0.6;
    const ins = len(inset);
    const half = weight / 2;
    return list.map((side) => {
      const h = horizontal(side);
      const strip = lineStrip({ length: (h ? nw : nh) + weight, weight, amp: a, freq: freq ?? 40, roughness, dry, seed: seed + jitter + SIDE_SEED[side] }, side);
      const along = `calc(100% - 2 * (${ins}) + ${weight}px)`;
      const start = `calc(${ins} - ${half}px)`;
      const across = `calc(${ins} - ${strip.anchor}px)`;
      const pos: CSSProperties = h
        ? { left: start, width: along, height: strip.thickness, [side]: across }
        : { top: start, height: along, width: strip.thickness, [side]: across };
      return { side, strip, pos };
    });
  }, [variant, weight, amp, freq, roughness, dry, spike, spikeLen, seed, jitter, nw, nh, inset, sides]);

  return (
    <span className={clsx(styles.rb, className)} aria-hidden="true" style={{ color, opacity, ...style }}>
      {pieces.map(({ side, strip, pos }) => (
        <svg
          key={side}
          className={styles.strip}
          style={pos}
          viewBox={horizontal(side) ? `0 0 ${r2(strip.length)} ${r2(strip.thickness)}` : `0 0 ${r2(strip.thickness)} ${r2(strip.length)}`}
          preserveAspectRatio="none"
          focusable="false">
          <path d={strip.d} fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}

export default memo(RoughBorder);
