import React, { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { translate } from '@docusaurus/Translate';
import { HandTitle, InkButton, InkRule } from '@site/src/components/woodcut';
import type { TicketView } from '@site/src/data/artworkOffers';
import Ticket from './Ticket';
import styles from './TicketDialog.module.css';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
const OPENER = 'button, a[href]';

export interface TicketDialogProps {
  ticket: TicketView;
  onClose: () => void;
  /** 打开弹窗的购买按钮（或包着它的元素）：关闭后焦点回到这里 */
  returnFocus: RefObject<HTMLElement | null>;
}

/**
 * 确认票据弹窗：黑场上一张纸色票据，等宽字列出作品、规格、价格；「前往购买页面」去 /buy，「再想想」关闭。
 * role="dialog" + aria-modal；Esc 关闭；Tab 在弹窗里循环；关闭后焦点回到购买按钮。只在客户端打开，不参与 SSR。
 * 黑场是 position: fixed，直接渲染在页面里（祖先没有 transform，不需要 portal）。
 */
export default function TicketDialog({ ticket, onClose, returnFocus }: TicketDialogProps): ReactNode {
  const dialogRef = useRef<HTMLDivElement>(null);
  const downOnBackdrop = useRef(false);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = returnFocus.current;
    const { body } = document;
    const overflow = body.style.overflow;
    body.style.overflow = 'hidden';
    const focusables = (): HTMLElement[] => (dialog ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)) : []);
    (focusables()[0] ?? dialog)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialog) return;
      const list = focusables();
      if (!list.length) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && dialog.contains(active);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.overflow = overflow;
      const target = opener && (opener.matches(OPENER) ? opener : opener.querySelector<HTMLElement>(OPENER));
      target?.focus();
    };
  }, [returnFocus]);

  return (
    <div
      className={styles.backdrop}
      data-wc-tone="ink"
      onPointerDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (downOnBackdrop.current && e.target === e.currentTarget) onClose();
      }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={styles.dialog}>
        <Ticket
          head={
            <HandTitle as="h2" size="section" id={titleId} per={0.03} className={styles.title}>
              {ticket.title}
            </HandTitle>
          }>
          <dl className={`${styles.rows} wc-mono`}>
            {ticket.rows.map(([label, value]) => (
              <div key={label} className={styles.row}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <InkRule weight="hair" dry={0.2} length={380} decorative className={styles.rule} />
          <p className={`${styles.total} wc-mono`}>{ticket.price}</p>
          <div className={styles.actions}>
            <InkButton to={ticket.href} variant="solid">
              {ticket.confirm}
            </InkButton>
            <button type="button" className={styles.cancel} onClick={onClose}>
              {translate({ id: 'artwork.ticket.cancel', message: '再想想', description: '作品详情页确认票据上关闭弹窗的文字按钮' })}
            </button>
          </div>
        </Ticket>
      </div>
    </div>
  );
}
