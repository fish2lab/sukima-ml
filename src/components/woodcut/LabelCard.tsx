import React, { createElement, useMemo, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import RoughBorder from './RoughBorder';
import { SWEEP_TIMING } from './draw';
import { useReveal } from './hooks';
import { layoutWriting } from './text';
import WrittenText from './WrittenText';
import styles from './LabelCard.module.css';

export interface LabelCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  as?: 'aside' | 'div' | 'section' | 'article' | 'figcaption';
  /** 作品名：大号手写字，翻出后逐字写出 */
  title?: string;
  /** 作品名的标签，默认 h3 */
  titleAs?: 'h2' | 'h3' | 'h4' | 'p';
  /** 作品名下面的几行（原作、角色 · 画师……），逐行写出 */
  lines?: readonly ReactNode[];
  /** 规格，贴在卡片底部，在价格上面 */
  spec?: ReactNode;
  /** 价格，贴在卡片底部，大号 */
  price?: ReactNode;
  /** 其余内容，放在 lines 之后 */
  children?: ReactNode;
  /** 进入视口时以左边为轴翻出来，默认 true */
  flip?: boolean;
  seed?: number;
  /** 毛边的标称尺寸，默认 [420, 340] */
  nominal?: readonly [number, number];
}

/** 片子 s2Card 的节奏：翻出 .3 秒（easeOutBack），之后作品名每字 .03 秒；其余各行在翻出后 .2 / .35 / .45 / .55 秒起写 */
const T = { flip: SWEEP_TIMING.card, per: 0.03, rows: [0.2, 0.35, 0.45, 0.55], wipe: 0.28 } as const;
const rowDelay = (k: number) => T.flip + (T.rows[Math.min(k, T.rows.length - 1)] + Math.max(0, k - (T.rows.length - 1)) * 0.1);

/**
 * 美术馆展签式的白卡片：细墨描边、墙上一块平的灰投影。进入视口时以左边为轴翻出来，然后逐行写字。
 * 深色模式下是墨底卡片、纸色字、纸色细线。
 */
export default function LabelCard({
  as = 'aside',
  title,
  titleAs = 'h3',
  lines = [],
  spec,
  price,
  children,
  flip = true,
  seed = 31,
  nominal = [420, 340],
  className,
  style,
  ...rest
}: LabelCardProps): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const titleCount = useMemo(() => (title ? layoutWriting(title, seed, 0.6).count : 0), [title, seed]);
  let k = 0;
  const lineDelays = lines.map(() => rowDelay(k++));
  const extraDelay = children != null ? rowDelay(k++) : 0;
  const specDelay = spec != null ? rowDelay(k++) : 0;
  const priceDelay = price != null ? rowDelay(k++) : 0;
  const duration = Math.max(T.flip + titleCount * T.per, (k ? rowDelay(k - 1) : 0) + T.wipe);
  const state = useReveal(ref, duration, { enabled: flip });
  const row = (d: number) => ({ '--d': `${d.toFixed(2)}s` }) as CSSProperties;

  return createElement(
    as,
    {
      ...rest,
      ref,
      className: clsx(styles.card, className),
      'data-wc-reveal': state,
      style: { '--wc-per': `${T.per}s`, '--wc-delay': `${T.flip}s`, ...style } as CSSProperties,
    },
    <RoughBorder variant="fill" amp={0.8} freq={30} seed={seed + 1} nominal={nominal} className={styles.paper} />,
    <RoughBorder variant="line" weight={1.4} amp={0.4} seed={seed + 2} nominal={nominal} className={styles.line} />,
    <div className={styles.body}>
      {title
        ? createElement(titleAs, { className: styles.title, 'aria-label': titleAs === 'p' ? undefined : title }, [
            <WrittenText key="w" text={title} seed={seed} wobble={0.6} />,
            titleAs === 'p' ? (
              <span key="s" className="wc-sr-only">
                {title}
              </span>
            ) : null,
          ])
        : null}
      {lines.map((line, j) => (
        <p key={j} className={clsx(styles.row, styles.meta)} data-row={j} style={row(lineDelays[j])}>
          {line}
        </p>
      ))}
      {children != null ? (
        <div className={styles.row} style={row(extraDelay)}>
          {children}
        </div>
      ) : null}
      {spec != null || price != null ? (
        <div className={styles.foot}>
          {spec != null ? (
            <p className={clsx(styles.row, styles.spec)} style={row(specDelay)}>
              {spec}
            </p>
          ) : null}
          {price != null ? (
            <p className={clsx(styles.row, styles.price)} style={row(priceDelay)}>
              {price}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>,
  );
}
