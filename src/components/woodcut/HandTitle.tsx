import React, { createElement, useMemo, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { useReveal } from './hooks';
import { layoutWriting } from './text';
import WrittenText from './WrittenText';
import styles from './HandTitle.module.css';

export type HandTitleTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';

export interface HandTitleProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** 标题文字（纯文本；'\n' 换行） */
  children: string;
  /** 标签，默认 h2 */
  as?: HandTitleTag;
  /** 字号档：display 首屏大标题、title 页面标题（默认）、section 段落标题、inherit 跟随父元素 */
  size?: 'display' | 'title' | 'section' | 'inherit';
  /** 每字秒数，默认 .04（片子 .03–.05） */
  per?: number;
  /** 进入视口后等多少秒再开始写，默认 0 */
  delay?: number;
  seed?: number;
  /** 字的倾斜和上下错位，1 默认，0 端正 */
  wobble?: number;
  /** false：不做逐字写出，直接显示 */
  write?: boolean;
}

const HEADING = new Set<HandTitleTag>(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/**
 * 手写楷体标题。进入视口时逐字写出（片子 writeP 的节奏）；SSR 输出完整文字，搜索引擎照常收录。
 * 读屏：标题用 aria-label 读整句，逐字的 span 对读屏隐藏。
 */
export default function HandTitle({
  children,
  as = 'h2',
  size = 'title',
  per = 0.04,
  delay = 0,
  seed = 3,
  wobble = 1,
  write = true,
  className,
  style,
  ...rest
}: HandTitleProps): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const count = useMemo(() => layoutWriting(children, seed, wobble).count, [children, seed, wobble]);
  const state = useReveal(ref, delay + count * per, { enabled: write });
  const heading = HEADING.has(as);
  return createElement(
    as,
    {
      ...rest,
      ref,
      className: clsx(styles.title, className),
      'data-size': size,
      'data-wc-reveal': state,
      'aria-label': heading ? children : undefined,
      style: { '--wc-per': `${per}s`, '--wc-delay': `${delay}s`, ...style } as CSSProperties,
    },
    <WrittenText text={children} seed={seed} wobble={wobble} />,
    heading ? null : <span className="wc-sr-only">{children}</span>,
  );
}
