import React, { useMemo, useRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { useInView } from 'framer-motion';
import { lineStrip } from './edges';
import { useJitterTick } from './hooks';
import styles from './InkRule.module.css';

export interface InkRuleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 粗细：hair 1.4px、thin 2.6px（默认）、bold 5px，或直接给像素 */
  weight?: 'hair' | 'thin' | 'bold' | number;
  seed?: number;
  /** 飞白 0..1，默认 0 */
  dry?: number;
  /** 两头收尖的比例，默认 .1；0 两头平齐 */
  taper?: number;
  /** 中线上下起伏（像素），默认按粗细 */
  amp?: number;
  /** 标称长度（像素），默认 720；线按这个长度生成再拉伸到实际宽度 */
  length?: number;
  /** 颜色，默认 currentColor */
  color?: string;
  /** true：纯装饰，对读屏隐藏；默认 false，是 role="separator" 的分隔线 */
  decorative?: boolean;
  /** 在视口里时一直轻轻地抖（8 次/秒） */
  jitter?: boolean;
}

const WEIGHTS = { hair: 1.4, thin: 2.6, bold: 5 } as const;

/** 木刻毛边的分隔线：一笔两头略收尖的墨线，线宽和中线都有起伏。 */
export default function InkRule({
  weight = 'thin',
  seed = 5,
  dry = 0,
  taper = 0.1,
  amp,
  length = 720,
  color,
  decorative = false,
  jitter = false,
  className,
  style,
  ...rest
}: InkRuleProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0 });
  const tick = useJitterTick(jitter && inView);
  const w = typeof weight === 'number' ? weight : WEIGHTS[weight];
  const strip = useMemo(
    () => lineStrip({ length, weight: w, amp: amp ?? Math.max(0.5, w * 0.35), freq: 60, roughness: 0.28, dry, taper, seed: seed + tick }),
    [length, w, amp, dry, taper, seed, tick],
  );
  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'separator', 'aria-orientation': 'horizontal' as const };
  return (
    <div ref={ref} {...a11y} {...rest} className={clsx(styles.rule, className)} style={{ height: strip.thickness, color, ...style }}>
      <svg className={styles.svg} viewBox={`0 0 ${strip.length} ${strip.thickness}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d={strip.d} fill="currentColor" />
      </svg>
    </div>
  );
}
