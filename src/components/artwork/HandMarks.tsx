import React, { createElement, type ReactNode } from 'react';
import clsx from 'clsx';
import { strokePathD, type Pt } from '@site/src/components/woodcut/draw';
import styles from './HandMarks.module.css';

/** 手画的墨色勾：一笔两折，两头收尖（片子 stroke 的画法），形状由 seed 固定，SSR 直接输出 */
const CHECK_D = strokePathD(
  [
    [4, 12.5],
    [9.2, 18.2],
    [20.5, 4.5],
  ],
  { w: 2.9, taper: 0.4, rough: 0.28, smooth: false, seed: 41 },
);

export function InkCheck({ className }: { className?: string }): ReactNode {
  return (
    <svg className={clsx(styles.check, className)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={CHECK_D} fill="currentColor" />
    </svg>
  );
}

/** 手画的圈：略扁、起笔和收笔错开一点（一笔没画圆），给步骤编号用 */
const CIRCLE_D = (() => {
  const pts: Pt[] = [];
  const n = 34;
  for (let i = 0; i <= n; i++) {
    const a = -1.9 + (i / n) * (Math.PI * 2 + 0.55);
    const r = 15.2 + Math.sin(a * 2.3 + 0.7) * 0.9 + (i / n) * 1.1;
    pts.push([20 + Math.cos(a) * r * 1.04, 20.5 + Math.sin(a) * r * 0.94]);
  }
  return strokePathD(pts, { w: 2.1, taper: 0.35, rough: 0.3, smooth: true, seed: 43 });
})();

export function HandCircle({ n, className }: { n: string; className?: string }): ReactNode {
  return (
    <span className={clsx(styles.circle, className)} aria-hidden="true">
      <svg className={styles.circleSvg} viewBox="0 0 40 40" focusable="false">
        <path d={CIRCLE_D} fill="currentColor" />
      </svg>
      <span className={styles.num}>{n}</span>
    </span>
  );
}

const NUMBERED = /^(\d+)\.\s*([\s\S]*)$/;

export interface StepTitleProps {
  /** 原来的整句标题，如「1. 扫码支付 / Payment」：开头的「1.」画成手画圈里的 1，读屏照读整句 */
  text: string;
  as?: 'h2' | 'h3';
  id?: string;
  className?: string;
}

/** 带圈序号的小标题（手写楷体）。没有「数字.」开头时原样输出 */
export function StepTitle({ text, as = 'h2', id, className }: StepTitleProps): ReactNode {
  const m = NUMBERED.exec(text);
  return createElement(
    as,
    { id, className: clsx(styles.step, className) },
    m ? (
      <>
        <HandCircle n={m[1]} />
        <span className="wc-sr-only">{`${m[1]}. `}</span>
        <span className={styles.stepText}>{m[2]}</span>
      </>
    ) : (
      <span className={styles.stepText}>{text}</span>
    ),
  );
}
