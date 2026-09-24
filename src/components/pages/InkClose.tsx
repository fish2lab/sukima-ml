import React, { forwardRef, useMemo, useState, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { translate } from '@docusaurus/Translate';
import { useJitterTick } from '../woodcut';
import { crossMark } from './marks';
import styles from './InkClose.module.css';

export interface InkCloseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  seed?: number;
}

/** 手画 × 的关闭按钮（44×44 触控区）。悬停、键盘聚焦时两笔轻轻地抖。 */
const InkClose = forwardRef<HTMLButtonElement, InkCloseProps>(function InkClose(
  { seed = 13, className, onPointerEnter, onPointerLeave, onFocus, onBlur, type = 'button', ...rest },
  ref,
) {
  const [hot, setHot] = useState(false);
  const tick = useJitterTick(hot);
  const mark = useMemo(() => crossMark(seed + tick), [seed, tick]);
  return (
    <button
      ref={ref}
      type={type}
      aria-label={translate({ id: 'pages.dialog.close', message: '关闭' })}
      {...rest}
      className={clsx(styles.close, className)}
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
      <svg className={styles.icon} viewBox={`0 0 ${mark.w} ${mark.h}`} aria-hidden="true" focusable="false">
        <path d={mark.d} fill="currentColor" />
      </svg>
    </button>
  );
});

export default InkClose;
