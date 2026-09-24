import React, { useMemo, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { circleMark } from './marks';
import styles from './InkCircleNum.module.css';

export interface InkCircleNumProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** 圈里的字：编号（一 二 三、1 2 3） */
  children: string | number;
  /** sm 2rem、md 2.6rem、lg 3.4rem */
  size?: 'sm' | 'md' | 'lg';
  seed?: number;
}

/**
 * 手画圈里的编号（题号、小节号）。圈是一笔毛笔圈，seed 决定形状；字是手写楷体。
 * 默认对读屏隐藏（编号的意思由旁边的标题说清楚）；要读出来时传 aria-hidden={false} 和 aria-label。
 */
export default function InkCircleNum({ children, size = 'md', seed = 5, className, ...rest }: InkCircleNumProps): ReactNode {
  const mark = useMemo(() => circleMark(seed), [seed]);
  return (
    <span aria-hidden="true" {...rest} className={clsx(styles.num, className)} data-size={size}>
      <svg className={styles.ring} viewBox={`0 0 ${mark.w} ${mark.h}`} focusable="false" aria-hidden="true">
        <path d={mark.d} fill="currentColor" />
      </svg>
      <span className={styles.label}>{children}</span>
    </span>
  );
}
