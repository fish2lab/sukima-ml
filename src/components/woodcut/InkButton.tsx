import React, { useState, type ButtonHTMLAttributes, type CSSProperties, type FocusEvent, type PointerEvent, type ReactNode } from 'react';
import clsx from 'clsx';
import Link, { type Props as LinkProps } from '@docusaurus/Link';
import RoughBorder from './RoughBorder';
import { useJitterTick } from './hooks';
import styles from './InkButton.module.css';

interface InkButtonBase {
  children: ReactNode;
  /** outline（默认）：墨框空心，悬停时被墨涂满、字变纸色；solid：实心墨块，悬停时像被按下去 */
  variant?: 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  seed?: number;
  className?: string;
  style?: CSSProperties;
}

/** 链接：to 站内路径（自动加 baseUrl），href 外链（新窗口打开） */
export type InkButtonLinkProps = InkButtonBase &
  Omit<LinkProps, keyof InkButtonBase | 'to' | 'href'> &
  ({ to: string; href?: undefined } | { href: string; to?: undefined });

/** 按钮：不给 to / href 时是 <button type="button"> */
export type InkButtonButtonProps = InkButtonBase &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof InkButtonBase> & { to?: undefined; href?: undefined };

export type InkButtonProps = InkButtonLinkProps | InkButtonButtonProps;

const isLink = (p: InkButtonProps): p is InkButtonLinkProps => p.to !== undefined || p.href !== undefined;

const NOMINAL = { sm: [120, 36], md: [168, 46], lg: [232, 58] } as const;

/** 木刻毛边的按钮。悬停或键盘聚焦时边框抖动（8 次/秒）。 */
export default function InkButton(props: InkButtonProps): ReactNode {
  const [hot, setHot] = useState(false);
  const jitter = useJitterTick(hot);
  const { children, variant = 'outline', size = 'md', seed = 7, className, style } = props;
  const nominal = NOMINAL[size];
  const deco = (
    <>
      <span className={styles.fill} aria-hidden="true" />
      {variant === 'solid' ? (
        <RoughBorder variant="fill" amp={1.1} seed={seed} jitter={jitter} nominal={nominal} className={styles.edge} />
      ) : (
        <RoughBorder variant="line" weight={size === 'lg' ? 2.6 : 2.2} amp={0.5} seed={seed} jitter={jitter} nominal={nominal} className={styles.edge} />
      )}
      <span className={styles.label}>{children}</span>
    </>
  );
  const common = {
    className: clsx(styles.button, className),
    style,
    'data-variant': variant,
    'data-size': size,
  };

  if (isLink(props)) {
    const { children: _c, variant: _v, size: _s, seed: _seed, className: _cn, style: _st, onPointerEnter, onPointerLeave, onFocus, onBlur, ...linkProps } = props;
    return (
      <Link
        {...linkProps}
        {...common}
        onPointerEnter={(e: PointerEvent<HTMLAnchorElement>) => {
          setHot(true);
          onPointerEnter?.(e);
        }}
        onPointerLeave={(e: PointerEvent<HTMLAnchorElement>) => {
          setHot(false);
          onPointerLeave?.(e);
        }}
        onFocus={(e: FocusEvent<HTMLAnchorElement>) => {
          setHot(true);
          onFocus?.(e);
        }}
        onBlur={(e: FocusEvent<HTMLAnchorElement>) => {
          setHot(false);
          onBlur?.(e);
        }}>
        {deco}
      </Link>
    );
  }
  const { children: _c, variant: _v, size: _s, seed: _seed, className: _cn, style: _st, to: _to, href: _href, onPointerEnter, onPointerLeave, onFocus, onBlur, type = 'button', ...buttonProps } = props;
  return (
    <button
      {...buttonProps}
      {...common}
      type={type}
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
      {deco}
    </button>
  );
}
