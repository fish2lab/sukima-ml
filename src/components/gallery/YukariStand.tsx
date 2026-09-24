import React, { useEffect, useRef, type CSSProperties, type MouseEventHandler, type ReactNode, type Ref } from 'react';
import clsx from 'clsx';
import { animate, useMotionValue } from 'framer-motion';
import { SukimaSlit, useReveal } from '../woodcut';
import { easeIn, easeOut } from '../woodcut/draw';
import { YUKARI_BOX, YUKARI_IMAGE } from './yukari';
import styles from './YukariStand.module.css';

export interface YukariStandProps {
  src: string;
  alt: string;
  /** 按钮的读屏名称 */
  label: string;
  /** 讲解气泡开着 */
  expanded: boolean;
  /** 气泡的 id（aria-controls） */
  controls?: string;
  imageRef: Ref<HTMLImageElement>;
  buttonRef: Ref<HTMLButtonElement>;
  onClick: MouseEventHandler<HTMLButtonElement>;
  /** 立绘外接框的位置和大小（页面定：left / right、bottom、width、height）；框的下沿就是她站的地面 */
  className?: string;
  /** 隙间的位置和宽度（页面定）；缝的中线要和框的下沿对齐 */
  slitClassName?: string;
}

/** 升起的节奏（秒）：缝 0–.3 张开，她 .2–.6 升起（CSS 动画），缝 .6–.8 合上 */
const RISE = { total: 0.8, open: 0.3, close: 0.6 } as const;

const BW = YUKARI_BOX.x1 - YUKARI_BOX.x0;
const BH = YUKARI_BOX.y1 - YUKARI_BOX.y0;
/** 整张立绘相对外接框的位置（百分比），img 和投影共用 */
const IMAGE_BOX: CSSProperties = {
  left: `${((-YUKARI_BOX.x0 / BW) * 100).toFixed(4)}%`,
  top: `${((-YUKARI_BOX.y0 / BH) * 100).toFixed(4)}%`,
  width: `${((YUKARI_IMAGE.width / BW) * 100).toFixed(4)}%`,
  aspectRatio: `${YUKARI_IMAGE.width} / ${YUKARI_IMAGE.height}`,
};

/**
 * 八云紫（彩色立绘，保持原色）站在画前：进页面时从地上一道横向隙间里升起来（一次，约 .8 秒），之后只剩她站着。
 * 立绘后面一道很淡的墨色平投影（遮罩剪影，不用滤镜、不发光）。
 * 点击区域只是不透明像素的外接框；框里透明处的点击由页面的命中测试转给后面的元素。
 */
export default function YukariStand({ src, alt, label, expanded, controls, imageRef, buttonRef, onClick, className, slitClassName }: YukariStandProps): ReactNode {
  const boxRef = useRef<HTMLDivElement>(null);
  const state = useReveal(boxRef, RISE.total, { amount: 0.1 });
  const open = useMotionValue(0);

  useEffect(() => {
    if (state !== 'play') return undefined;
    const controlsAnim = animate(open, [0, 1, 1, 0], {
      duration: RISE.total,
      times: [0, RISE.open / RISE.total, RISE.close / RISE.total, 1],
      ease: [easeOut, 'linear', easeIn],
    });
    return () => controlsAnim.stop();
  }, [state, open]);

  const rising = state === 'pending' || state === 'play';
  const mask = `url("${src}")`;

  return (
    <>
      {rising ? (
        <div className={clsx(styles.slit, slitClassName)} aria-hidden="true">
          <SukimaSlit open={open} width="100%" aspect={4} eyes={6} seed={29} glance={0.5} />
        </div>
      ) : null}
      <div
        ref={boxRef}
        className={clsx(styles.stand, className)}
        data-wc-reveal={state}
        style={{ aspectRatio: `${BW} / ${BH}` }}>
        <div className={styles.riser}>
          <span className={styles.shade} aria-hidden="true" style={{ ...IMAGE_BOX, WebkitMaskImage: mask, maskImage: mask }} />
          <button
            ref={buttonRef}
            type="button"
            className={styles.hit}
            aria-label={label}
            aria-haspopup="dialog"
            aria-expanded={expanded}
            aria-controls={expanded ? controls : undefined}
            onClick={onClick}>
            <img
              ref={imageRef}
              src={src}
              alt={alt}
              width={YUKARI_IMAGE.width}
              height={YUKARI_IMAGE.height}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              crossOrigin="anonymous"
              draggable={false}
              className={styles.img}
              style={IMAGE_BOX}
            />
          </button>
        </div>
      </div>
    </>
  );
}
