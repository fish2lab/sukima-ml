import React, { useState } from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import Layout from '@theme/Layout';

import StudioContactPanel from '../components/StudioContactPanel';
import StudioPicture from '../components/StudioPicture';
import StudioPricing from '../components/StudioPricing';
import { formatPrice, studioPricing, studioSpaces } from '../data/studioSpaces';
import styles from './ph.module.css';

const HERO_BASE = '/img/studio/generated/hero';
const BEHIND_SCENES_BASE = '/img/studio/generated/behind-the-scenes';

function BehindScenesReveal() {
  return (
    <section className={styles.revealSection} aria-label="Studio Phantasm 拍摄现场">
      <div className={styles.revealImageWrap}>
        <picture className={styles.revealImage}>
          <source media="(max-width: 900px)" srcSet={`${BEHIND_SCENES_BASE}-1280.webp`} />
          <img src={`${BEHIND_SCENES_BASE}-5440.webp`} alt="Studio Phantasm 外景拍摄现场" width="5440" loading="lazy" decoding="async" />
        </picture>
      </div>
      <div className={styles.revealLabel}>
        <span>BEHIND THE SCENES</span>
        <strong>空间在镜头前<br />真正开始工作。</strong>
      </div>
    </section>
  );
}

export default function StudioPhantasm() {
  const [shifted, setShifted] = useState(false);
  // 场地页和联系页链到 /ph#spaces；手写的 id 不会被 Docusaurus 的锚点检查收录，要自己登记
  useBrokenLinks().collectAnchor('spaces');

  return (
    <Layout noFooter wrapperClassName="phantasmPage" title="Studio Phantasm | 摄影棚与场地出租" description="Studio Phantasm 摄影棚与场地出租。五种可切换的拍摄空间。">
      <Head>
        <title>Studio Phantasm — 摄影棚与场地出租</title>
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:title" content="Studio Phantasm | 摄影棚与场地出租" />
        <meta property="og:description" content="五种空间，一处完成。Studio Phantasm 摄影棚与场地出租。" />
        <meta property="og:image" content={`${HERO_BASE}-1600.webp`} />
        <meta property="og:url" content="https://ph.sukima-ml.club/" />
        <link rel="canonical" href="https://ph.sukima-ml.club/" />
        <link rel="preload" as="image" href={`${HERO_BASE}-1600.webp`} fetchPriority="high" />
      </Head>

      <div className={styles.site}>
        <header className={styles.header}>
          <a className={styles.brand} href="#top" aria-label="Studio Phantasm 首页">
            <img src="/img/studio/phantasm-mark.svg" alt="" width="46" height="52" />
            <span>STUDIO PHANTASM</span>
          </a>
          <nav className={styles.primaryNav} aria-label="主导航">
            <a href="#spaces">场地</a>
            <a href="#pricing">价格</a>
            <a href="#studio-in-use">现场</a>
            <Link to="/ph/contact">联系</Link>
          </nav>
          <a className={styles.subsiteLink} href="https://th.sukima-ml.club" title="前往 Touhou 分站">TH.<span>TOUHOU</span></a>
        </header>

        <main id="top">
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroCard}>
              <StudioPicture base={HERO_BASE} alt="Studio Phantasm 外墙、木窗与彩色座椅" className={styles.heroImage} eager />
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>PHOTOGRAPHY · SPACE RENTAL</p>
                <h1 id="hero-title">让每一种想象<br />都有地方发生。</h1>
                <p className={styles.lede}>
                  五个独立场景在同一处现场，一次拍摄即可切换。面向摄影、影像与独立创作开放，白棚 {formatPrice(studioSpaces[0])} 起，{studioPricing.offer.minimumHours} 小时起租。
                </p>
                <a className={styles.cta} href="#spaces"><span>浏览场地</span><span aria-hidden="true">→</span></a>
              </div>
            </div>
          </section>

          <section className={styles.spaces} id="spaces" aria-labelledby="spaces-title">
            <div className={styles.sectionHeader}>
              <p className={styles.sectionLabel}>SPACES / 05</p>
              <h2 id="spaces-title">选择你的现场</h2>
            </div>

            <div className={styles.carouselViewport}>
              <div className={`${styles.carouselTrack} ${shifted ? styles.isShifted : ''}`}>
                {studioSpaces.map((space, index) => {
                  const isAdvanceCard = !shifted && index === 3;
                  const isReturnCard = shifted && index === 1;
                  const isHiddenCard = !shifted && index === 4;
                  return (
                    <Link
                      className={`${styles.spaceCard} ${isAdvanceCard ? styles.advanceCard : ''} ${isReturnCard ? styles.returnCard : ''} ${isHiddenCard ? styles.hiddenCard : ''}`}
                      key={space.slug}
                      to={`/ph/${space.slug}`}
                      onClick={(event) => {
                        if (window.matchMedia('(min-width: 901px)').matches && (isAdvanceCard || isReturnCard)) {
                          event.preventDefault();
                          setShifted(isAdvanceCard);
                        }
                      }}
                      aria-label={isAdvanceCard ? `展开${space.name}及下一场景` : isReturnCard ? '返回前三个场景' : `查看${space.name}`}
                    >
                      <div className={styles.cardImageWrap}>
                        <StudioPicture base={space.cover} alt={`${space.name}场地封面`} />
                        <span>{space.index}</span>
                        {(isAdvanceCard || isReturnCard) && <b aria-hidden="true">{isAdvanceCard ? '← CLICK TO SHIFT' : 'CLICK TO RETURN →'}</b>}
                      </div>
                      <div className={styles.cardCaption}>
                        <div>
                          <h3>{space.name}</h3>
                          <p>{space.englishName}</p>
                        </div>
                        <p>{space.area}<br /><strong>{formatPrice(space)}</strong></p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </section>

          <div className={styles.pricingWrap}>
            <StudioPricing id="pricing" />
          </div>

          <div id="studio-in-use"><BehindScenesReveal /></div>

          <section className={styles.booking}>
            <div><p className={styles.sectionLabel}>BOOKING / ENQUIRY</p><h2>告诉我们你的拍摄计划。</h2></div>
            <Link to="/ph/contact"><span>联系与预约</span><span aria-hidden="true">↗</span></Link>
          </section>

          <StudioContactPanel id="home-contact" />
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerBrand}><img src="/img/studio/phantasm-mark.svg" alt="" width="54" height="61" /><span>STUDIO<br />PHANTASM</span></div>
          <div className={styles.footerMeta}><Link to="/ph/contact">CONTACT</Link><a href="https://th.sukima-ml.club">TH. / TOUHOU</a><span>© {new Date().getFullYear()}</span></div>
        </footer>
      </div>
    </Layout>
  );
}
