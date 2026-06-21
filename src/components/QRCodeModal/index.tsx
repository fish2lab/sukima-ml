import React, { useEffect } from 'react';
import styles from './styles.module.css';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title?: string;
  imageAlt?: string;
}

export default function QRCodeModal({ isOpen, onClose, imageSrc, title, imageAlt = 'QQ群二维码' }: QRCodeModalProps) {
  const titleId = 'qr-code-modal-title';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {title && <h3 id={titleId} className={styles.modalTitle}>{title}</h3>}
        <img
          src={imageSrc}
          alt={imageAlt}
          className={styles.qrImage}
          width={1200}
          height={2133}
          loading="lazy"
          decoding="async"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
