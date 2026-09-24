import React, { type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { InkRule, RoughBorder } from '@site/src/components/woodcut';
import styles from './Ticket.module.css';

export interface TicketProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 票头（撕线上面） */
  head: ReactNode;
  /** 票身（撕线下面） */
  children: ReactNode;
  seed?: number;
}

/**
 * 一张纸色票据：木刻刀口的纸边、撕线（飞白的细墨线）两头各打一个半圆缺口。
 * 缺口的颜色读 --ticket-hole（放票据的那块底色）；投影读 --ticket-shade，默认墙上的平灰投影。
 */
export default function Ticket({ head, children, seed = 51, className, ...rest }: TicketProps): ReactNode {
  return (
    <div {...rest} className={clsx(styles.ticket, className)} data-wc-tone="paper">
      <RoughBorder variant="fill" amp={0.8} freq={26} seed={seed} nominal={[420, 380]} className={styles.edge} />
      <RoughBorder variant="line" weight={1.2} amp={0.35} seed={seed + 1} nominal={[420, 380]} className={styles.line} />
      <div className={styles.head}>{head}</div>
      <div className={styles.perf} aria-hidden="true">
        <span className={styles.hole} data-side="left" />
        <InkRule weight="hair" dry={0.55} taper={0} length={380} decorative className={styles.perfLine} />
        <span className={styles.hole} data-side="right" />
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
