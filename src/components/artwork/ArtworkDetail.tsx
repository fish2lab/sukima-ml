import React, { Fragment, useMemo, useRef, useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import { HandTitle, InkButton, InkFrame, InkRule, LabelCard, PaperSection, SweepReveal } from '@site/src/components/woodcut';
import { artworks } from '@site/src/data/galleryData';
import { getOriginalPaintingTitle } from '@site/src/utils/galleryTranslations';
import { initialSelection, viewOffer, type ArtworkOffer, type DigitalOffer, type Selection, type TextSection } from '@site/src/data/artworkOffers';
import DigitalDetail from './DigitalDetail';
import PriceList from './PriceList';
import RichText from './RichText';
import TicketDialog from './TicketDialog';
import VariantPicker from './VariantPicker';
import styles from './ArtworkDetail.module.css';

export interface ArtworkDetailProps {
  /** src/data/artworkOffers.ts 里的一项：实体作品（artworkOffers）或数字作品（digitalOffers） */
  offer: ArtworkOffer | DigitalOffer;
}

/**
 * 作品详情页模板（负责卖）。页面只写：<ArtworkDetail offer={artworkOffers['001']} />。
 * 实体作品：上半纸墙，左边挂着的木刻画框里隙间把原作扫成东方版，右边一张大展签；
 * 下半左边价目表 + 购买按钮（确认票据弹窗），右边材质说明。数字作品见 DigitalDetail。
 */
export default function ArtworkDetail({ offer }: ArtworkDetailProps): ReactNode {
  return offer.kind === 'digital' ? <DigitalDetail offer={offer} /> : <PrintDetail offer={offer} />;
}

function sectionHeading(s: TextSection): string | undefined {
  if (s.heading) return s.heading;
  if (s.headingKey === 'material') return translate({ id: 'artwork.section.material', message: '材质说明', description: '作品详情页材质段落的小标题' });
  if (s.headingKey === 'artist') return translate({ id: 'artwork.section.artist', message: '画师', description: '作品详情页画师主页段落的小标题' });
  return undefined;
}

function PrintDetail({ offer }: { offer: ArtworkOffer }): ReactNode {
  const art = artworks.find((a) => a.id === offer.id);
  const [sel, setSel] = useState<Selection>(() => initialSelection(offer));
  const [open, setOpen] = useState(false);
  const buyRef = useRef<HTMLSpanElement>(null);
  const view = useMemo(() => viewOffer(offer, sel), [offer, sel]);

  const original = art ? getOriginalPaintingTitle(art) : '';
  const facts = art
    ? [
        translate({ id: 'artwork.label.original', message: '原作：{name}', description: '作品详情页展签：原作名' }, { name: original }),
        translate({ id: 'artwork.label.character', message: '角色：{name}', description: '作品详情页展签：画中的东方角色' }, { name: art.touhouCharacter }),
        translate({ id: 'artwork.label.artist', message: '画师：{name}', description: '作品详情页展签：画师' }, { name: art.artist }),
      ]
    : [];

  return (
    <Layout title={offer.seo.title} description={offer.seo.description}>
      <PaperSection tone="wall" width="wide" space="md" innerClassName={styles.heroGrid}>
        <figure className={styles.visual}>
          <div className={styles.frameBox}>
            {art ? (
              <SweepReveal
                key={view.image.src}
                from={{ src: art.originalImagePath, alt: facts[0], width: art.originalImageWidth, height: art.originalImageHeight }}
                to={view.image}
                frame={{ hang: true, swing: true, size: 'lg', nominal: [560, 720] }}
                priority
              />
            ) : (
              <InkFrame as="div" hang swing size="lg" nominal={[560, 720]}>
                <img src={view.image.src} alt={view.image.alt} width={view.image.width} height={view.image.height} fetchPriority="high" decoding="async" />
              </InkFrame>
            )}
          </div>
          <figcaption className={styles.caption}>{view.caption}</figcaption>
        </figure>

        <LabelCard
          as="div"
          className={styles.label}
          nominal={[500, 620]}
          spec={view.specLabel}
          price={
            <>
              {view.priceText}
              {view.priceNote ? <span className={styles.priceNote}> {view.priceNote}</span> : null}
            </>
          }>
          <p className={styles.kicker}>{offer.heading.en}</p>
          <HandTitle as="h1" size="title" delay={0.45} className={styles.title}>
            {offer.heading.zh}
          </HandTitle>
          {facts.length ? (
            <ul className={styles.facts}>
              {facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : null}
          <p className={styles.meta}>
            {offer.badge ? <span className={styles.stamp}>{offer.badge}</span> : null}
            {offer.metaLines.map((l, i) => (
              <Fragment key={l}>
                {i > 0 ? <br /> : null}
                {l}
              </Fragment>
            ))}
          </p>
          {offer.intro ? (
            <p className={styles.intro}>
              <RichText rich={offer.intro} />
            </p>
          ) : null}
        </LabelCard>
      </PaperSection>

      <PaperSection tone="wall" width="wide" space="md" innerClassName={styles.shopGrid}>
        <div className={styles.order}>
          <PriceList title={offer.specTitle} rows={view.rows} onSelect={(id) => setSel((s) => ({ ...s, specId: id }))}>
            {offer.costNote ? (
              <p className={styles.costNote}>
                {offer.costNote.map((l, i) => (
                  <Fragment key={l}>
                    {i > 0 ? <br /> : null}
                    {l}
                  </Fragment>
                ))}
              </p>
            ) : null}
          </PriceList>

          {offer.variants && view.variant ? (
            <VariantPicker
              title={offer.variants.title}
              hint={offer.variants.hint}
              view={view.variant}
              onVariant={(variant) => setSel((s) => ({ ...s, variant }))}
              onSpecial={(special) => setSel((s) => ({ ...s, special }))}
            />
          ) : null}

          <div className={styles.purchase}>
            <span ref={buyRef} className={styles.buyWrap}>
              {view.digitalHref ? (
                <InkButton to={view.digitalHref} variant="solid" size="lg" className={styles.buy}>
                  {view.button}
                </InkButton>
              ) : (
                <InkButton variant="solid" size="lg" className={styles.buy} aria-haspopup="dialog" onClick={() => setOpen(true)}>
                  {view.button}
                </InkButton>
              )}
            </span>
            <p className={styles.notice}>{view.notice}</p>
          </div>
        </div>

        <div className={styles.notes}>
          {offer.sections.map((s, i) => {
            const heading = sectionHeading(s);
            return (
              <Fragment key={i}>
                <InkRule weight="thin" dry={0.25} seed={80 + i} length={520} className={styles.rule} />
                <section className={styles.note}>
                  {heading ? (
                    <HandTitle as="h2" size="section" per={0.03} className={styles.noteTitle}>
                      {heading}
                    </HandTitle>
                  ) : null}
                  {s.paragraphs.map((p, j) => (
                    <p key={j} className={styles.para}>
                      <RichText rich={p} />
                    </p>
                  ))}
                </section>
              </Fragment>
            );
          })}
        </div>
      </PaperSection>

      {open && view.ticket ? <TicketDialog ticket={view.ticket} onClose={() => setOpen(false)} returnFocus={buyRef} /> : null}
    </Layout>
  );
}
