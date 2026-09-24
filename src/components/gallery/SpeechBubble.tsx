import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useJitterTick } from '../woodcut';
import { easeOutBack, type Pt } from '../woodcut/draw';
import { balloonPaths, crossPaths } from './balloon';
import styles from './SpeechBubble.module.css';

/** 气泡放在说话的人哪一边：right 右边（原 bubblePosition），left 左边，above 头顶上 */
export type BubbleSide = 'right' | 'left' | 'above';

export interface BubblePlace {
  side: BubbleSide;
  /** 气泡左边（相对定位父元素，像素） */
  left: number;
  /** 气泡宽 */
  width: number;
  /** right：气泡上沿；above：气泡下沿；left 不用（按尖的高度摆） */
  anchorTop: number;
  /** 尖指向的点（相对定位父元素） */
  tip: Pt;
}

export interface SpeechBubbleProps {
  id?: string;
  /** 对话框的读屏名称 */
  label: string;
  place: BubblePlace;
  /** 气泡下沿不能超过这里（父元素裁切时给父元素高度）；null 不限 */
  maxBottom: number | null;
  /** 关闭：returnFocus 为 true 时（Esc、×）由调用方把焦点还给打开它的按钮 */
  onClose: (returnFocus: boolean) => void;
  /** 从尖那一端弹出来（scale .6 → 1，easeOutBack，.25 秒）；减少动态时 false，直接出现 */
  pop: boolean;
  closeLabel: string;
  seed?: number;
  children: ReactNode;
}

const MARGIN = 10;

/**
 * 黑白漫画对话框（片子第 5 段 s5Bubble）：纸色底、粗墨线手画的超椭圆圆角方框、一个尖指向说话的人，墨色手写字。
 * role="dialog"，打开时焦点移进来，Esc 或手画的 × 关闭。框和尖是 SVG path，按 seed 生成。
 */
export default function SpeechBubble({ id, label, place, maxBottom, onClose, pop, closeLabel, seed = 51, children }: SpeechBubbleProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  const [hot, setHot] = useState(false);
  const jitter = useJitterTick(hot);
  const closeRef = useRef(onClose);
  useLayoutEffect(() => {
    closeRef.current = onClose;
  });

  // 量高度（字体加载、窗口变宽窄都会变）；绘制前量好，第一帧就是最终位置
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 量好高度、摆到最终位置之后再把焦点移进来
  const focusedRef = useRef(false);
  useEffect(() => {
    if (h <= 0 || focusedRef.current) return;
    focusedRef.current = true;
    ref.current?.focus();
  }, [h]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      closeRef.current(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  let top = place.side === 'right' ? place.anchorTop : place.side === 'above' ? place.anchorTop - h : place.tip[1] - h * 0.28;
  if (maxBottom != null) top = Math.min(top, maxBottom - h - MARGIN);
  top = Math.round(Math.max(MARGIN, top));
  const left = Math.round(place.left);
  const width = Math.round(place.width);
  const tx = Math.round(place.tip[0] - left);
  const ty = Math.round(place.tip[1] - top);
  const paths = useMemo(() => (h > 0 ? balloonPaths(width, h, [tx, ty], seed) : null), [width, h, tx, ty, seed]);
  const cross = useMemo(() => crossPaths(seed + 20 + jitter), [seed, jitter]);

  return (
    <motion.div
      ref={ref}
      id={id}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      className={styles.bubble}
      style={{ left, top, width, transformOrigin: `${tx}px ${ty}px` }}
      initial={pop ? { scale: 0.6 } : false}
      animate={{ scale: 1 }}
      transition={{ duration: 0.25, ease: (t: number) => easeOutBack(t) }}
      onClick={(e) => e.stopPropagation()}>
      {paths ? (
        <svg className={styles.shape} width={width} height={h} viewBox={`0 0 ${width} ${h}`} aria-hidden="true" focusable="false">
          <path className={styles.fill} d={paths.fill} />
          <path className={styles.line} d={paths.line} />
        </svg>
      ) : null}
      <button
        type="button"
        className={styles.close}
        aria-label={closeLabel}
        onClick={() => onClose(true)}
        onPointerEnter={() => setHot(true)}
        onPointerLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}>
        <svg viewBox="0 0 24 24" className={styles.cross} aria-hidden="true" focusable="false">
          <path d={cross} fill="currentColor" />
        </svg>
      </button>
      <div className={styles.body}>{children}</div>
    </motion.div>
  );
}
