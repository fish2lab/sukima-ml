import React, { useRef, type ReactNode } from 'react';
import InkClose from './InkClose';
import { useDialog } from './useDialog';
import styles from './Lightbox.module.css';

export interface LightboxImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface LightboxProps {
  /** null 时关闭 */
  image: LightboxImage | null;
  onClose: () => void;
  /** 对话框的读屏名称，默认用图片的 alt */
  label?: string;
}

/**
 * 看大图：墨色遮罩上一张纸，实拍原样显示（不加滤镜），右上角手画 ×。
 * Esc / 点遮罩 / × 关闭，焦点锁在框里，关闭后回到打开它的那张图（useDialog）。
 */
export default function Lightbox({ image, onClose, label }: LightboxProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useDialog(image !== null, onClose, ref, closeRef);
  if (!image) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={ref}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={label ?? image.alt}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}>
        <div className={styles.bar}>
          <InkClose ref={closeRef} onClick={onClose} seed={29} />
        </div>
        <img className={styles.image} src={image.src} alt={image.alt} width={image.width} height={image.height} decoding="async" />
      </div>
    </div>
  );
}
