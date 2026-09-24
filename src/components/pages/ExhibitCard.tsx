import React, { createElement, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { RoughBorder } from '../woodcut';
import styles from './ExhibitCard.module.css';

export interface ExhibitCardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'aside' | 'li';
  /** 墙上的平灰投影，默认 true */
  shadow?: boolean;
  /** 描边粗细（像素），默认 1.4 */
  line?: number;
  seed?: number;
  /** 毛边的标称尺寸，填和实际卡片差不多的数 */
  nominal?: readonly [number, number];
  children?: ReactNode;
}

/**
 * 不翻动的展签卡：卡纸白底、木刻毛边外沿、一圈细墨线、墙上平灰投影（和 LabelCard 同一套画法）。
 * 给考卷、说明小卡这类不该每次进视口都翻一下、或内容会变的地方用；要翻出来的展签用 LabelCard。
 */
export default function ExhibitCard({
  as = 'div',
  shadow = true,
  line = 1.4,
  seed = 61,
  nominal = [420, 300],
  className,
  children,
  ...rest
}: ExhibitCardProps): ReactNode {
  return createElement(
    as,
    { ...rest, className: clsx(styles.card, className), 'data-shadow': shadow ? undefined : 'false' },
    <RoughBorder variant="fill" amp={0.8} freq={30} seed={seed} nominal={nominal} className={styles.paper} />,
    <RoughBorder variant="line" weight={line} amp={0.45} seed={seed + 1} nominal={nominal} className={styles.line} />,
    <div className={styles.body}>{children}</div>,
  );
}
