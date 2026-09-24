import React, { createElement, useMemo, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { useInView } from 'framer-motion';
import RoughBorder from './RoughBorder';
import { useJitterTick, useReveal } from './hooks';
import { layoutWriting } from './text';
import WrittenText from './WrittenText';
import styles from './Caption.module.css';

export interface CaptionProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** 标签文字，短（片子要求 12 字以内） */
  children: string;
  /** 标签，默认 span */
  as?: 'span' | 'p' | 'div' | 'h2' | 'h3' | 'h4';
  size?: 'sm' | 'md' | 'lg';
  /** 进入视口时框从左往右展开、字逐字打出（片子 caption：展开 .2 秒，每字 .06 秒） */
  write?: boolean;
  /** 每字秒数，默认 .06 */
  per?: number;
  /** 框一直轻轻地抖（6 次/秒，片子的字幕框）；只在视口里抖 */
  jitter?: boolean;
  seed?: number;
}

const NOMINAL = { sm: [110, 34], md: [150, 44], lg: [210, 60] } as const;
const WEIGHT = { sm: 1.7, md: 2.2, lg: 2.8 } as const;
const HEADING = new Set(['h2', 'h3', 'h4']);

/**
 * 片子左上角那种白底黑框的「展签」小标签：卡纸白底、粗墨框、手写字。深浅色模式下都是白底黑字（和片子黑场里的字幕一样）。
 */
export default function Caption({
  children,
  as = 'span',
  size = 'md',
  write = false,
  per = 0.06,
  jitter = false,
  seed = 3,
  className,
  style,
  ...rest
}: CaptionProps): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const count = useMemo(() => layoutWriting(children, seed, 0.5).count, [children, seed]);
  const state = useReveal(ref, 0.12 + count * per, { enabled: write });
  const visible = useInView(ref, { amount: 0 });
  const tick = useJitterTick(jitter && visible && state !== 'pending', 6);
  const heading = HEADING.has(as);
  return createElement(
    as,
    {
      ...rest,
      ref,
      className: clsx(styles.caption, className),
      'data-size': size,
      'data-wc-reveal': state,
      'aria-label': write && heading ? children : undefined,
      style: { '--wc-per': `${per}s`, '--wc-delay': '0.12s', ...style } as CSSProperties,
    },
    <span className={styles.box} aria-hidden="true">
      <RoughBorder variant="fill" amp={1} freq={30} seed={seed} jitter={tick} nominal={NOMINAL[size]} />
      <RoughBorder variant="line" weight={WEIGHT[size]} amp={0.5} seed={seed + 1} jitter={tick} nominal={NOMINAL[size]} className={styles.frame} />
    </span>,
    write ? <WrittenText text={children} seed={seed} wobble={0.5} className={styles.label} /> : <span className={styles.label}>{children}</span>,
    write && !heading ? <span className="wc-sr-only">{children}</span> : null,
  );
}
