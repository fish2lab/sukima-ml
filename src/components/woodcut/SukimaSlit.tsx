import React, { useCallback, useEffect, useLayoutEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { isMotionValue, useInView, type MotionValue } from 'framer-motion';
import { K, clamp, drawSlit, tick, type SlitColors } from './draw';
import { useMotionAllowed } from './hooks';
import styles from './SukimaSlit.module.css';

export interface SukimaSlitProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** 张开程度 0..1：0–.3 先划出一道线、两端系上蝴蝶结，.3–1 张开。可以传 MotionValue（滚动驱动时不触发 React 重渲染）。默认 1 */
  open?: number | MotionValue<number>;
  /** 宽，数字是像素，也可以是 CSS 长度；默认 100% */
  width?: number | string;
  /** 高；不给时按 aspect 算 */
  height?: number | string;
  /** 宽高比（不给 height 时用），默认 3.6（片子里缝长 752、宽 220，加上两端蝴蝶结） */
  aspect?: number;
  seed?: number;
  /** 眼睛只数，5–7，默认 7 */
  eyes?: number;
  /** 活着：边缘每秒抖 8 次、眼睛各看各的、偶尔眨眼。只在可见时动；减少动态时静止。默认 true */
  alive?: boolean;
  /** 眼睛平均多少秒换一次方向，默认 .9（片子里是 .28，网页上常驻，放慢） */
  glance?: number;
  /** 给读屏的说明；不给时是纯装饰（aria-hidden） */
  label?: string;
}

const FPS = 8;
const DPR_MAX = 2;
const VARS = ['--wc-slit', '--wc-slit-line', '--wc-slit-iris', '--wc-slit-bow', '--wc-slit-bow-line', '--wc-slit-rim'] as const;

function readColors(el: Element): SlitColors {
  const cs = getComputedStyle(el);
  const v = (name: (typeof VARS)[number], fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const rim = v('--wc-slit-rim', 'none');
  return {
    slit: v('--wc-slit', K.ink),
    line: v('--wc-slit-line', K.paper),
    iris: v('--wc-slit-iris', K.plum),
    bow: v('--wc-slit-bow', K.ink),
    bowLine: v('--wc-slit-bow-line', K.paper),
    rim: rim === 'none' || rim === 'transparent' ? null : rim,
  };
}

const cssLen = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v);

/**
 * 一道隙间（canvas）：黑色透镜形的缝，白色刮痕唇线，两端各一个小蝴蝶结，缝里 5–7 只睁开的眼睛（纸色眼白、暗紫瞳孔）。
 * 画布按 devicePixelRatio（最高 2）缩放，ResizeObserver 跟随容器尺寸；IntersectionObserver 只在可见时动。
 * 颜色从 CSS 变量 --wc-slit* 读，深色模式、黑场里自动描一圈纸色外沿。
 */
export default function SukimaSlit({
  open = 1,
  width = '100%',
  height,
  aspect = 3.6,
  seed = 17,
  eyes = 7,
  alive = true,
  glance = 0.9,
  label,
  className,
  style,
  ...rest
}: SukimaSlitProps): ReactNode {
  const rootRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const openRef = useRef(isMotionValue(open) ? open.get() : open);
  const sizeRef = useRef({ w: 0, h: 0 });
  const t0Ref = useRef(0);
  const frameRef = useRef(0);
  /** 画布现在是空的（缝合着时不必每拍都清一次） */
  const blankRef = useRef(true);
  const visible = useInView(rootRef, { amount: 0 });
  const allowed = useMotionAllowed();
  const moving = alive && allowed;
  const movingRef = useRef(moving);
  const params = useRef({ seed, eyes, glance });
  // 画法读 ref（interval 和 MotionValue 回调里拿到的总是最新参数）；layout effect 先于下面的 effect 执行
  useLayoutEffect(() => {
    movingRef.current = moving;
    params.current = { seed, eyes: clamp(Math.round(eyes), 0, 7), glance };
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const { w, h } = sizeRef.current;
    if (w < 2 || h < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    const o = clamp(openRef.current, 0, 1);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw; // 改尺寸会清空画布
      canvas.height = ph;
      blankRef.current = true;
    }
    if (o <= 0.001 && blankRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pw, ph);
    blankRef.current = o <= 0.001;
    if (blankRef.current) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const t = movingRef.current ? (performance.now() - t0Ref.current) / 1000 : 0;
    const { seed: sd, eyes: n, glance: gl } = params.current;
    // 蝴蝶结在两端占的地方：结的大小 = 22 × (缝半宽 / 110)，往外伸约 1.3 倍
    const HW = h * 0.43;
    const bow = 22 * (HW / 110);
    drawSlit(ctx, {
      cx: w / 2,
      cy: h / 2,
      halfLen: Math.max(4, w / 2 - bow * 1.35 - 3),
      halfWidth: HW,
      open: o,
      t,
      jitter: movingRef.current ? tick(t, FPS) : 0,
      seed: sd,
      eyes: n,
      glance: gl,
      alive: movingRef.current,
      colors: readColors(root),
    });
  }, []);

  const schedule = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      draw();
    });
  }, [draw]);

  // 尺寸
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    t0Ref.current = performance.now();
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.contentBoxSize?.[0];
      sizeRef.current = box ? { w: box.inlineSize, h: box.blockSize } : { w: entry.contentRect.width, h: entry.contentRect.height };
      draw();
    });
    ro.observe(root);
    return () => {
      ro.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [draw]);

  // 张开程度：数字或 MotionValue
  useEffect(() => {
    if (isMotionValue(open)) {
      openRef.current = open.get();
      schedule();
      return open.on('change', (v) => {
        openRef.current = v;
        schedule();
      });
    }
    openRef.current = open;
    schedule();
    return undefined;
  }, [open, schedule]);

  // 参数、能不能动变了就重画
  useEffect(() => {
    schedule();
  }, [seed, eyes, glance, moving, schedule]);

  // 抖：可见、能动时每秒 8 次
  useEffect(() => {
    if (!visible || !moving) return undefined;
    draw();
    const id = window.setInterval(draw, 1000 / FPS);
    return () => window.clearInterval(id);
  }, [visible, moving, draw]);

  // 深浅色切换时颜色变了
  useEffect(() => {
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, [schedule]);

  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  const box: CSSProperties = {
    width: cssLen(width),
    height: cssLen(height),
    aspectRatio: height === undefined ? String(aspect) : undefined,
    ...style,
  };
  return (
    <span ref={rootRef} {...a11y} {...rest} className={clsx(styles.slit, className)} style={box}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </span>
  );
}
