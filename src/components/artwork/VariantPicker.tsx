import React, { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { InkFrame, RoughBorder } from '@site/src/components/woodcut';
import type { Rich, VariantOptionView, VariantView } from '@site/src/data/artworkOffers';
import { InkCheck, StepTitle } from './HandMarks';
import RichText from './RichText';
import styles from './VariantPicker.module.css';

export interface VariantPickerProps {
  /** 「2. 选择款式 (Select Variant)」 */
  title: string;
  hint: Rich;
  view: VariantView;
  onVariant: (code: 'A' | 'B') => void;
  onSpecial: (checked: boolean) => void;
}

function Option({ o }: { o: VariantOptionView }): ReactNode {
  return (
    <>
      <span className={styles.thumb}>
        <InkFrame as="span" size="sm" nominal={[150, 200]} seed={o.code === 'A' ? 71 : 73}>
          <img src={o.image.src} alt={o.image.alt} width={o.image.width} height={o.image.height} loading="lazy" decoding="async" draggable={false} />
        </InkFrame>
      </span>
      <span className={styles.text}>
        <span className={styles.mark} aria-hidden="true">
          {o.selected ? <InkCheck /> : null}
        </span>
        <span className={styles.words}>
          <span className={`${styles.label} wc-mono`}>{o.label}</span>
          <span className={styles.name}>{o.displayName}</span>
        </span>
      </span>
    </>
  );
}

/**
 * 002 的款式选择：两款各一张小画（在小木刻框里），点画或点字切换；B 款下面是裸足版开关。
 * 套装、数字版两款都包含：两张都打勾、不能单选（不是 radio，只是列出来）。
 */
export default function VariantPicker({ title, hint, view, onVariant, onSpecial }: VariantPickerProps): ReactNode {
  const titleId = useId();
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>, i: number) => {
    const next = ['ArrowDown', 'ArrowRight'].includes(e.key) ? i + 1 : ['ArrowUp', 'ArrowLeft'].includes(e.key) ? i - 1 : null;
    if (next !== null) {
      e.preventDefault();
      const k = (next + view.options.length) % view.options.length;
      onVariant(view.options[k].code);
      refs.current[k]?.focus();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onVariant(view.options[i].code);
    }
  };

  return (
    <div className={styles.picker} data-wc-tone="paper">
      <RoughBorder variant="fill" amp={0.9} freq={30} seed={67} nominal={[560, 420]} className={styles.edge} />
      <StepTitle text={title} id={titleId} className={styles.title} />
      <p className={styles.hint}>
        <RichText rich={hint} />
      </p>
      {view.locked ? (
        <ul className={styles.options} aria-labelledby={titleId}>
          {view.options.map((o) => (
            <li key={o.code} className={styles.option} data-selected="">
              <Option o={o} />
            </li>
          ))}
        </ul>
      ) : (
        <div role="radiogroup" aria-labelledby={titleId} className={styles.options}>
          {view.options.map((o, i) => (
            <div
              key={o.code}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="radio"
              aria-checked={o.selected}
              tabIndex={o.selected ? 0 : -1}
              className={styles.option}
              data-selected={o.selected ? '' : undefined}
              data-interactive=""
              onClick={() => onVariant(o.code)}
              onKeyDown={(e) => onKeyDown(e, i)}>
              <Option o={o} />
            </div>
          ))}
        </div>
      )}
      {view.special.visible ? (
        <button type="button" role="checkbox" aria-checked={view.special.checked} className={styles.toggle} onClick={() => onSpecial(!view.special.checked)}>
          <span className={styles.box} aria-hidden="true">
            {view.special.checked ? <InkCheck /> : null}
          </span>
          <span>{view.special.label}</span>
        </button>
      ) : null}
      {view.notices.map((n) => (
        <p key={n} className={styles.notice}>
          {n}
        </p>
      ))}
    </div>
  );
}
