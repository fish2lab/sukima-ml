import React from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';

import { formatPrice, studioPricing } from '../data/studioSpaces';
import styles from './StudioPricing.module.css';

type Props = {
  id?: string;
  /** 场地页传入当前场地 slug：标题改为该场地的开业价，价目表里对应行加重。 */
  highlightSlug?: string;
};

const { offer, priceRows, rules, contact } = studioPricing;

export default function StudioPricing({ id, highlightSlug }: Props) {
  const space = highlightSlug ? studioPricing.spaces.find((item) => item.slug === highlightSlug) : undefined;
  const titleId = `${id ?? 'studio'}-pricing-title`;
  const brokenLinks = useBrokenLinks();
  if (id) brokenLinks.collectAnchor(id);
  const subject = encodeURIComponent(space ? `Studio Phantasm ${space.name}预约` : 'Studio Phantasm 场地预约');

  return (
    <section className={styles.pricing} id={id} aria-labelledby={titleId}>
      <header className={styles.heading}>
        <p>
          <span>{offer.label}</span>
          <span>{offer.audience} · {offer.minimumHours} 小时起租</span>
          <span>开业价有效期 {offer.validity}</span>
        </p>
        {space ? (
          <h2 id={titleId} className={styles.priceTitle}>
            <span>{formatPrice(space)}</span>
            <small>{space.name} · {space.area} · 开业价</small>
          </h2>
        ) : (
          <h2 id={titleId}>价格与预约</h2>
        )}
      </header>

      <ul className={styles.table}>
        {priceRows.map((row) => {
          const active = Boolean(highlightSlug && row.slugs.includes(highlightSlug));
          return (
            <li key={row.name} className={active ? styles.activeRow : undefined}>
              <div className={styles.rowName}>
                <strong>{row.name}</strong>
                <span>{row.detail}</span>
              </div>
              <p className={styles.rowPrice}>
                {row.price}
                {row.unit && <span>{row.unit}</span>}
              </p>
            </li>
          );
        })}
      </ul>

      <ol className={styles.rules}>
        {rules.map((rule) => (
          <li key={rule.index}>
            <span>{rule.index}</span>
            <h3>{rule.title}</h3>
            <p>{rule.body}</p>
          </li>
        ))}
      </ol>

      <a className={styles.cta} href={`mailto:${contact.email}?subject=${subject}`}>
        <span>邮件预约</span>
        <span>{contact.email} ↗</span>
      </a>
    </section>
  );
}
