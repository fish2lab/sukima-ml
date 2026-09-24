import React, { createElement, useEffect, useMemo, useRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { motion, useInView, useMotionValue } from 'framer-motion';
import RoughBorder from './RoughBorder';
import { hangAngle, strokePathD, type Pt } from './draw';
import { lineStrip } from './edges';
import { motionAllowedNow } from './hooks';
import styles from './InkFrame.module.css';

export interface InkFrameProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** 画心：通常是一张 <img>（宽 100%）或 <picture> */
  children: ReactNode;
  /** 外层标签，默认 figure；放进 <button> 这类只能装行内内容的地方时用 span */
  as?: 'figure' | 'div' | 'span';
  /** 框宽和卡纸衬的档：sm / md（默认）/ lg，都按屏幕宽度自适应 */
  size?: 'sm' | 'md' | 'lg';
  /** 挂绳：从上方挂画轨斜拉到画框两个上角（片子 s2Bay） */
  hang?: boolean;
  /** 挂画轨：只在 hang 时有效，默认画一段，比画框宽出两边各 14% */
  rail?: boolean;
  /** 进入视口时在挂绳上轻轻晃一下（片子 s2Hang：峰值约 ±1.5°，两秒内停稳） */
  swing?: boolean;
  /** 这个值变了就再晃一下（例如轮播换页） */
  swingKey?: string | number;
  /** 墙上的平灰投影，默认 true */
  shadow?: boolean;
  /** 图注（仅 as="figure" 时输出 figcaption） */
  caption?: ReactNode;
  seed?: number;
  /** 毛边的标称尺寸 [宽, 高]（像素），填和实际画框差不多的数，默认 [420, 540] */
  nominal?: readonly [number, number];
}

/** 四角的斜接缝（片子 s2Frame：从外角往里的一道白刮痕）。viewBox 是 26×26 的框宽方块 */
const CORNERS: ReadonlyArray<readonly [string, Pt, Pt]> = [
  ['tl', [4, 4], [23, 23]],
  ['tr', [22, 4], [3, 23]],
  ['br', [22, 22], [3, 3]],
  ['bl', [4, 22], [23, 3]],
];

/**
 * 木刻粗黑框：外沿木刻毛边，框上一道断续的白刻线、四角斜接缝，里面衬白卡纸，画心外一圈细灰线，墙上一块平的灰投影。
 * 可选挂绳、挂画轨，进入视口时晃一下。大图片本身不加任何滤镜。
 */
export default function InkFrame({
  children,
  as = 'figure',
  size = 'md',
  hang = false,
  rail,
  swing = false,
  swingKey,
  shadow = true,
  caption,
  seed = 21,
  nominal = [420, 540],
  className,
  ...rest
}: InkFrameProps): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const rotate = useMotionValue(0);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const showRail = hang && (rail ?? true);

  useEffect(() => {
    if (!swing || !inView || !motionAllowedNow()) return undefined;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = (now - t0) / 1000;
      if (t >= 2.4) {
        rotate.set(0);
        return;
      }
      rotate.set((hangAngle(t) * 180) / Math.PI);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      rotate.set(0);
    };
  }, [swing, inView, swingKey, rotate]);

  const corners = useMemo(
    () => CORNERS.map(([key, a, b], j) => [key, strokePathD([a, b], { w: 1.8, taper: 0.2, rough: 0.3, smooth: false, seed: seed + 10 + j })] as const),
    [seed],
  );
  const railStrips = useMemo(
    () =>
      showRail
        ? [
            lineStrip({ length: 900, weight: 4.5, amp: 0.6, freq: 80, roughness: 0.18, seed: seed + 30 }),
            lineStrip({ length: 900, weight: 1.4, amp: 0.4, freq: 80, roughness: 0.3, dry: 0.3, seed: seed + 31 }),
          ]
        : null,
    [showRail, seed],
  );

  const inner = (
    <>
      {railStrips ? (
        <span className={styles.rail} aria-hidden="true">
          {railStrips.map((s, j) => (
            <svg key={j} className={styles.railSvg} viewBox={`0 0 ${s.length} ${s.thickness}`} preserveAspectRatio="none" style={{ height: s.thickness }} focusable="false">
              <path d={s.d} fill="currentColor" />
            </svg>
          ))}
        </span>
      ) : null}
      <motion.span className={styles.swing} style={{ rotate }}>
        {hang ? (
          <span className={styles.cords} aria-hidden="true">
            <svg className={styles.cordSvg} viewBox="0 0 100 13" preserveAspectRatio="none" focusable="false">
              <path d="M24.2 0L2.9 13M75.8 0L97.1 13" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className={styles.hook} style={{ left: '24.2%' }} />
            <span className={styles.hook} style={{ left: '75.8%' }} />
          </span>
        ) : null}
        <span className={styles.body}>
          <RoughBorder variant="fill" amp={1.5} freq={16} seed={seed + 1} nominal={nominal} />
          <RoughBorder variant="line" weight={1.5} amp={0.4} dry={0.5} roughness={0.4} inset="calc(var(--fw) * 0.35)" seed={seed + 2} nominal={nominal} opacity={0.55} className={styles.scratch} />
          <span className={styles.corners} aria-hidden="true">
            {corners.map(([key, d]) => (
              <svg key={key} className={styles.corner} data-corner={key} viewBox="0 0 26 26" preserveAspectRatio="none" focusable="false">
                <path d={d} fill="currentColor" />
              </svg>
            ))}
          </span>
          <span className={styles.mat}>
            <RoughBorder variant="fill" amp={0.7} freq={26} seed={seed + 3} nominal={nominal} />
            <span className={styles.art}>
              {children}
              <RoughBorder variant="line" weight={1.3} amp={0.3} inset={-0.5} seed={seed + 4} nominal={nominal} className={styles.artLine} />
            </span>
          </span>
        </span>
      </motion.span>
      {caption && as === 'figure' ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </>
  );

  return createElement(
    as,
    {
      ...rest,
      ref,
      className: clsx(styles.frame, className),
      'data-size': size,
      'data-hang': hang || undefined,
      'data-shadow': shadow ? undefined : 'false',
    },
    inner,
  );
}
