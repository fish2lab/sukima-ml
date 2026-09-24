import React, { useMemo, type BlockquoteHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { barMark } from './marks';
import styles from './InkQuote.module.css';

export interface InkQuoteProps extends BlockquoteHTMLAttributes<HTMLQuoteElement> {
  children: ReactNode;
  seed?: number;
  /** 墨线的标称长度（像素），填和引用块差不多的高度 */
  nominal?: number;
}

/** 引用块：左边一道木刻粗墨线（两头略收、线宽有起伏），正文次要色。 */
export default function InkQuote({ children, seed = 9, nominal = 200, className, ...rest }: InkQuoteProps): ReactNode {
  const bar = useMemo(() => barMark(seed, nominal), [seed, nominal]);
  return (
    <blockquote {...rest} className={clsx(styles.quote, className)}>
      <svg className={styles.bar} viewBox={`0 0 ${bar.w} ${bar.h}`} preserveAspectRatio="none" style={{ width: bar.w }} aria-hidden="true" focusable="false">
        <path d={bar.d} fill="currentColor" />
      </svg>
      {children}
    </blockquote>
  );
}
