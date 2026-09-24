import React, { useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { useJitterTick } from '../woodcut';
import { arrowPaths } from './balloon';
import styles from './InkArrow.module.css';

export interface InkArrowProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  /** prev 朝左，next 朝右 */
  dir: 'prev' | 'next';
  /** 读屏名称 */
  label: string;
  seed?: number;
}

/** 手画的木刻箭头按钮：一笔墨杆 + 一块带缺口的墨块箭头，悬停、键盘聚焦时边缘抖、往箭头方向挪一下。 */
export default function InkArrow({ dir, label, seed = 71, className, onPointerEnter, onPointerLeave, onFocus, onBlur, ...rest }: InkArrowProps): ReactNode {
  const [hot, setHot] = useState(false);
  const jitter = useJitterTick(hot);
  const paths = useMemo(() => arrowPaths(seed + jitter), [seed, jitter]);
  return (
    <button
      {...rest}
      type="button"
      className={clsx(styles.arrow, className)}
      data-dir={dir}
      aria-label={label}
      onPointerEnter={(e) => {
        setHot(true);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        setHot(false);
        onPointerLeave?.(e);
      }}
      onFocus={(e) => {
        setHot(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setHot(false);
        onBlur?.(e);
      }}>
      <svg className={styles.svg} viewBox="0 0 60 40" aria-hidden="true" focusable="false">
        <path d={paths.shaft} fill="currentColor" />
        <path d={paths.head} fill="currentColor" />
      </svg>
    </button>
  );
}
