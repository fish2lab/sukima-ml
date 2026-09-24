import React, { type ReactNode } from 'react';
import Layout from '@theme/Layout';
import { HandTitle, InkFrame, InkRule, LabelCard, PaperSection, RoughBorder } from '@site/src/components/woodcut';
import type { DigitalOffer } from '@site/src/data/artworkOffers';
import RichText from './RichText';
import styles from './ArtworkDetail.module.css';

/**
 * 数字作品页（ArtworkDetail 的数字版变体）：没有原作对照，只把图挂进木刻画框；
 * 右边展签写标题和下载列表；下面是主催的信和「奉纳幻想」付款（两张收款码各在一个小画框里，原样显示）。
 */
export default function DigitalDetail({ offer }: { offer: DigitalOffer }): ReactNode {
  const [main, ...others] = offer.previews;
  const { letter, payment } = offer;
  return (
    <Layout title={offer.seo.title} description={offer.seo.description}>
      <PaperSection tone="wall" width="wide" space="md" innerClassName={styles.heroGrid}>
        <div className={styles.visual}>
          {main ? (
            <div className={styles.frameBox}>
              <InkFrame hang swing size="lg" caption={main.label} nominal={[560, 720]}>
                <img src={main.image.src} alt={main.image.alt} width={main.image.width} height={main.image.height} fetchPriority="high" decoding="async" />
              </InkFrame>
            </div>
          ) : null}
          {others.length ? (
            <div className={styles.moreFrames}>
              {others.map((p, i) => (
                <InkFrame key={p.image.src} size="md" caption={p.label} nominal={[260, 340]} seed={25 + i}>
                  <img src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} loading="lazy" decoding="async" />
                </InkFrame>
              ))}
            </div>
          ) : null}
        </div>

        <LabelCard as="div" className={styles.label} nominal={[500, 460]}>
          <HandTitle as="h1" size="title" delay={0.45} className={styles.title}>
            {offer.title}
          </HandTitle>
          <p className={styles.kicker}>{offer.subtitle}</p>
          <h2 className={styles.smallTitle}>{offer.downloadTitle}</h2>
          <ul className={styles.downloads}>
            {offer.downloads.map((d, i) => (
              <li key={d.href}>
                <a href={d.href} download className={styles.download}>
                  <RoughBorder variant="line" weight={1.8} amp={0.45} seed={91 + i} nominal={[420, 56]} className={styles.downloadEdge} />
                  <span className={styles.downloadLabel}>{d.label}</span>
                  <span className={`${styles.downloadSize} wc-mono`}>{d.size}</span>
                </a>
              </li>
            ))}
          </ul>
        </LabelCard>
      </PaperSection>

      <PaperSection tone="wall" width="narrow" space="md">
        <article className={styles.letter} data-wc-tone="paper">
          <RoughBorder variant="fill" amp={0.9} freq={30} seed={97} nominal={[720, 900]} className={styles.letterEdge} />
          <HandTitle as="h2" size="section" per={0.03} className={styles.noteTitle}>
            {letter.title}
          </HandTitle>
          {letter.paragraphs.map((p, i) => (
            <p key={i} className={styles.para}>
              <RichText rich={p} />
            </p>
          ))}
          <p className={styles.signature}>{letter.signature}</p>
        </article>

        <InkRule weight="thin" dry={0.25} seed={99} className={styles.bigRule} />

        <section className={styles.payment}>
          <HandTitle as="h2" size="section" per={0.03} className={styles.noteTitle}>
            {payment.heading}
          </HandTitle>
          <p className={styles.bigPrice}>{`¥ ${payment.price}`}</p>
          <p className={styles.payNote}>{payment.note}</p>
          <div className={styles.qrRow}>
            {payment.qr.map((q, i) => (
              <InkFrame key={q.image.src} size="sm" caption={q.label} nominal={[200, 210]} seed={33 + i} className={styles.qr}>
                <img src={q.image.src} alt={q.image.alt} width={q.image.width} height={q.image.height} loading="lazy" decoding="async" />
              </InkFrame>
            ))}
          </div>
          <p className={styles.free}>
            <RichText rich={payment.free} />
          </p>
        </section>
      </PaperSection>
    </Layout>
  );
}
