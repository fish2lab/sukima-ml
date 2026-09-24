import React, { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import clsx from 'clsx';
import { animate, isMotionValue, motion, useInView, useMotionValue, useTransform, type AnimationPlaybackControls, type MotionValue } from 'framer-motion';
import { translate } from '@docusaurus/Translate';
import InkFrame, { type InkFrameProps } from './InkFrame';
import SukimaSlit from './SukimaSlit';
import { SWEEP_TIMING, clamp, easeIO, lerp } from './draw';
import { motionAllowedNow } from './hooks';
import styles from './SweepReveal.module.css';

export interface SweepImage {
  src: string;
  alt: string;
  /** 原图像素宽高（写进 <img>，给浏览器算比例） */
  width: number;
  height: number;
  srcSet?: string;
  sizes?: string;
}

export interface SweepRevealProps {
  /** 原作（名画） */
  from: SweepImage;
  /** 东方版 */
  to: SweepImage;
  /**
   * 外部驱动的进度 0..1：0 是原作，1 是东方版且缝已合上。中间依次是：划线、张开、扫过、合上（按片子 1.4 秒的时间比例）。
   * 传 MotionValue（如 framer-motion 的 useScroll + useTransform）做滚动驱动；传了就不再自动播放，也不能点击切换。
   */
  progress?: number | MotionValue<number>;
  /** 进入视口时自动扫一次，默认 true（没有 progress 时） */
  autoPlay?: boolean;
  /** 进入视口后原作停多久再撕开，默认 .35 秒（片子） */
  delay?: number;
  /** 点击 / 回车在原作和东方版之间来回切，默认 true（没有 progress 时） */
  interactive?: boolean;
  /** 画心宽高比，默认用 to 的宽高；两张图都按 cover 铺满 */
  aspectRatio?: number;
  /** 画框：true（默认）用 InkFrame；false 不要框；也可以传 InkFrame 的参数 */
  frame?: boolean | Omit<InkFrameProps, 'children' | 'as'>;
  seed?: number;
  /** 缝里的眼睛只数，默认 7 */
  eyes?: number;
  /** 切换按钮的读屏名称（配合 aria-pressed：按下 = 显示东方版），默认「显示东方版」 */
  toggleLabel?: string;
  /** 切换时回调（点击和自动播放都会触发） */
  onToggle?: (showing: 'from' | 'to') => void;
  /** 图片加载：默认 lazy；首屏大图传 priority */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

const T = SWEEP_TIMING;
const OPEN_END = T.line + T.open;
const SWEEP_END = OPEN_END + T.sweep;
const TOTAL = SWEEP_END + T.close;
/** 缝扫过画的上沿外、下沿外各多出的比例（片子：画高 640，多 30） */
const PAD = 30 / 640;

/** 时间线上 u 秒时缝的张开程度（SukimaSlit 的 open：0–.3 划线，.3–1 张开） */
function openAt(u: number): number {
  if (u <= 0) return 0;
  if (u < T.line) return (0.3 * u) / T.line;
  if (u < OPEN_END) return 0.3 + (0.7 * (u - T.line)) / T.open;
  if (u < SWEEP_END) return 1;
  return clamp(1 - (u - SWEEP_END) / T.close, 0, 1);
}

/** u 秒时缝中线的位置（占画高的比例；s2SweepY） */
const sweepAt = (u: number): number => lerp(-PAD, 1 + PAD, easeIO(clamp((u - OPEN_END) / T.sweep, 0, 1)));

/**
 * 原作和东方版叠在同一个画框里。一道横向的隙间从画的上沿扫到下沿，扫过的部分已经是东方版；
 * 两张图的分界线始终藏在缝的中线上（片子 s2Frame / s2Tear / s2SweepY）。
 * 图片是普通 <img>，用 clip-path 切换，不在 canvas 上画照片。画心有固定宽高比，不引起布局跳动。
 */
export default function SweepReveal({
  from,
  to,
  progress,
  autoPlay = true,
  delay = T.hold,
  interactive,
  aspectRatio,
  frame = true,
  seed = 23,
  eyes = 7,
  toggleLabel,
  onToggle,
  priority = false,
  className,
  style,
  id,
}: SweepRevealProps): ReactNode {
  const rootRef = useRef<HTMLElement>(null);
  const controlled = progress !== undefined;
  const canToggle = !controlled && (interactive ?? true);
  const internal = useMotionValue(typeof progress === 'number' ? progress : 0);
  const p = isMotionValue(progress) ? progress : internal;
  const open = useTransform(p, (v) => openAt(v * TOTAL));
  const y = useTransform(p, (v) => `${(sweepAt(v * TOTAL) * 100).toFixed(3)}%`);
  const clip = useTransform(p, (v) => `inset(0 0 ${((1 - clamp(sweepAt(v * TOTAL), 0, 1)) * 100).toFixed(3)}% 0)`);
  const [showing, setShowing] = useState<'from' | 'to'>('from');
  const [ready, setReady] = useState(false);
  const inView = useInView(rootRef, { once: true, amount: 0.5 });
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const touched = useRef(false);
  const onToggleRef = useRef(onToggle);
  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  const run = useCallback(
    (target: 0 | 1) => {
      const next = target ? 'to' : 'from';
      setShowing(next);
      onToggleRef.current?.(next);
      anim.current?.stop();
      if (!motionAllowedNow()) {
        internal.set(target);
        return;
      }
      // 时间线上的缓动由 openAt / sweepAt 负责，这里匀速走
      const dist = Math.abs(target - internal.get());
      anim.current = animate(internal, target, { duration: TOTAL * dist, ease: 'linear' });
    },
    [internal],
  );

  useEffect(() => {
    setReady(true);
    return () => anim.current?.stop();
  }, []);

  useEffect(() => {
    if (typeof progress === 'number') internal.set(progress);
  }, [progress, internal]);

  // 自动播放：进入视口、原作停 delay 秒后扫一次；减少动态时一开始就是东方版
  useEffect(() => {
    if (controlled || !autoPlay || touched.current) return undefined;
    if (!motionAllowedNow()) {
      if (internal.get() < 1) run(1);
      return undefined;
    }
    if (!inView) return undefined;
    const tid = window.setTimeout(() => {
      if (!touched.current) run(1);
    }, delay * 1000);
    return () => window.clearTimeout(tid);
  }, [controlled, autoPlay, inView, delay, internal, run]);

  const ratio = aspectRatio ?? to.width / to.height;
  const loading = priority ? 'eager' : 'lazy';
  const picture = (
    <span className={styles.pic} style={{ aspectRatio: String(ratio) }}>
      <span className={styles.clip}>
        <img className={styles.img} src={from.src} srcSet={from.srcSet} sizes={from.sizes} alt={from.alt} width={from.width} height={from.height} loading={loading} decoding="async" draggable={false} fetchPriority={priority ? 'high' : undefined} />
        <motion.img
          className={clsx(styles.img, styles.to)}
          style={{ clipPath: clip }}
          src={to.src}
          srcSet={to.srcSet}
          sizes={to.sizes}
          alt={to.alt}
          width={to.width}
          height={to.height}
          loading={loading}
          decoding="async"
          draggable={false}
        />
      </span>
      <motion.span className={styles.track} style={{ y }} aria-hidden="true">
        <span className={styles.slitBox}>
          <SukimaSlit open={open} width="100%" height="100%" seed={seed} eyes={eyes} />
        </span>
      </motion.span>
    </span>
  );
  const frameProps = typeof frame === 'object' ? frame : {};
  const body = frame ? (
    <InkFrame as="span" {...frameProps}>
      {picture}
    </InkFrame>
  ) : (
    picture
  );

  const common = {
    id,
    className: clsx(styles.root, className),
    style,
    'data-autoplay': !controlled && autoPlay ? '' : undefined,
    'data-ready': ready ? '' : undefined,
  };
  if (canToggle) {
    return (
      <button
        {...common}
        ref={rootRef as React.RefObject<HTMLButtonElement>}
        type="button"
        aria-pressed={showing === 'to'}
        aria-label={toggleLabel ?? translate({ id: 'woodcut.sweep.toggle', message: '显示东方版', description: 'SweepReveal 切换按钮的读屏名称（按下 = 显示东方版）' })}
        onClick={() => {
          touched.current = true;
          run(showing === 'to' ? 0 : 1);
        }}>
        {body}
      </button>
    );
  }
  return (
    <div {...common} ref={rootRef as React.RefObject<HTMLDivElement>}>
      {body}
    </div>
  );
}
