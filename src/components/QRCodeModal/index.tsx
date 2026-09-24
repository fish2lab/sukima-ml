import React, { useId, useMemo, useRef, type ReactNode } from 'react';
import { InkFrame, InkRule, RoughBorder } from '../woodcut';
import InkClose from '../pages/InkClose';
import { notchMark } from '../pages/marks';
import { useDialog } from '../pages/useDialog';
import styles from './styles.module.css';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title?: string;
  imageAlt?: string;
}

/** 二维码图片的实际尺寸（static/img/groupQRcode.webp） */
const QR_W = 1200;
const QR_H = 2133;

/**
 * 票据样式的二维码弹窗：纸色卡、木刻毛边、上下两联之间一道撕线和两侧打孔缺口，二维码装在小 InkFrame 里原样显示。
 * 手画 × / Esc / 点遮罩关闭；打开时焦点锁在票据里，关闭后回到打开前的元素（useDialog）。
 */
export default function QRCodeModal({ isOpen, onClose, imageSrc, title, imageAlt = 'QQ群二维码' }: QRCodeModalProps): ReactNode {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const notch = useMemo(() => notchMark(71), []);
  useDialog(isOpen, onClose, dialogRef, closeRef);

  if (!isOpen) return null;

  const notchSvg = (side: 'left' | 'right') => (
    <svg
      className={styles.notch}
      data-side={side}
      viewBox={`0 0 ${notch.w} ${notch.h}`}
      style={{ width: notch.w, height: notch.h }}
      aria-hidden="true"
      focusable="false">
      <path d={notch.d} fill="currentColor" />
    </svg>
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.cut}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : imageAlt}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}>
        <div className={styles.ticket}>
          <RoughBorder variant="fill" amp={1} freq={24} seed={73} nominal={[336, 640]} className={styles.paper} />
          <RoughBorder variant="line" weight={1.8} amp={0.5} seed={74} nominal={[336, 640]} className={styles.line} />
          <div className={styles.stub}>
            {title ? (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            ) : (
              <span />
            )}
            <InkClose ref={closeRef} onClick={onClose} seed={17} />
          </div>
          <div className={styles.perf} aria-hidden="true">
            {notchSvg('left')}
            <InkRule weight="hair" dry={0.55} taper={0} length={280} seed={75} decorative className={styles.tear} />
            {notchSvg('right')}
          </div>
          <div className={styles.body}>
            <div className={styles.qr}>
              <InkFrame size="sm" seed={77} nominal={[260, 470]}>
                <img src={imageSrc} alt={imageAlt} width={QR_W} height={QR_H} loading="eager" decoding="async" />
              </InkFrame>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
