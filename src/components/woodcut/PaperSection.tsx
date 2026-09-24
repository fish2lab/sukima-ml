import React, { createElement, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import RoughBorder from './RoughBorder';
import styles from './PaperSection.module.css';

/** paper 暖白纸（#ebe5d8）、wall 隙间页面的画廊墙（#F7F6F4）、ink 黑场（墨底、纸色字、白刮痕线） */
export type Tone = 'paper' | 'wall' | 'ink';

export interface PaperSectionProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'header' | 'footer' | 'article' | 'aside' | 'main';
  /** 底色，默认 paper。深色模式下 paper / wall 也变成墨底 */
  tone?: Tone;
  /** 版心宽：narrow 720、normal 1120（默认）、wide 1360、full 满宽（手机和桌面左右留白不同） */
  width?: 'narrow' | 'normal' | 'wide' | 'full';
  /** 上下留白：none、sm、md（默认）、lg（桌面和手机两套） */
  space?: 'none' | 'sm' | 'md' | 'lg';
  /** 上沿 / 下沿做成木刻刀口的毛边（盖到相邻段落上 3–5px），默认 none */
  edge?: 'none' | 'top' | 'bottom' | 'both';
  seed?: number;
  /** 版心那层 div 的 className */
  innerClassName?: string;
}

const EDGE_SIDES = { top: 'top', bottom: 'bottom', both: 'x' } as const;

/**
 * 一段纸墙或黑场：统一的底色、纸纹、版心宽度和留白。
 * 设了 data-wc-tone，里面所有 --wc-* 颜色变量跟着这一段的底色走（黑场里的字、线、按钮自动变纸色）。
 */
export default function PaperSection({
  as = 'section',
  tone = 'paper',
  width = 'normal',
  space = 'md',
  edge = 'none',
  seed = 11,
  innerClassName,
  className,
  children,
  ...rest
}: PaperSectionProps): ReactNode {
  return createElement(
    as,
    {
      ...rest,
      className: clsx(styles.section, className),
      'data-wc-tone': tone,
      'data-space': space,
    },
    edge !== 'none' ? (
      <RoughBorder variant="fill" sides={EDGE_SIDES[edge]} amp={2.2} freq={16} spike={0.012} spikeLen={5} seed={seed} nominal={[1280, 400]} className={styles.edge} />
    ) : null,
    <div className={clsx(styles.inner, innerClassName)} data-width={width}>
      {children}
    </div>,
  );
}
