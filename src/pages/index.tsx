import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { InkRule, LabelCard } from '../components/woodcut';
import HomeHero from '../components/home/HomeHero';
import GalleryWall from '../components/home/GalleryWall';
import EndlesslyTicket from '../components/home/EndlesslyTicket';

import styles from './index.module.css';

// 四个入口
interface NavigationItem {
  title: string;
  description: ReactNode;
  link: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'GALLERY',
    link: '/sukima-ml',
    description: <Translate id="home.module.gallery.desc">Browse our collection of Touhou Project × Classic Art mashups.</Translate>,
  },
  {
    title: 'ABOUT',
    link: '/about',
    description: <Translate id="home.module.about.desc">Learn about the Sukima Moonlight circle and our philosophy.</Translate>,
  },
  {
    title: 'BLOG',
    link: '/blog',
    description: <Translate id="home.module.blog.desc">Read about our creative process, updates, and thoughts.</Translate>,
  },
  {
    title: 'PHANTASM',
    link: 'https://ph.sukima-ml.club',
    description: <Translate id="home.module.phantasm.desc">Studio rental for photography, film, and independent production.</Translate>,
  },
];

// 入口卡：墙上的一张展签，左上角编号；悬停、键盘聚焦时被墨涂满、字变纸色
interface ModuleBlockProps extends NavigationItem {
  index: number;
}

function ModuleBlock({ title, description, link, index }: ModuleBlockProps): ReactNode {
  const formattedIndex = (index + 1).toString().padStart(2, '0');

  return (
    <Link to={link} className={styles.moduleBlock}>
      <span className={clsx(styles.moduleNumber, 'wc-mono')} aria-hidden="true">
        {formattedIndex}
      </span>
      <LabelCard as="div" title={title} lines={[description]} seed={51 + index * 7} nominal={[280, 300]} className={styles.moduleCard} />
      <span className={styles.arrowIcon} aria-hidden="true">
        →
      </span>
    </Link>
  );
}

// 主页组件
export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const heroLogoUrl = useBaseUrl('/img/sukima-ml.svg');
  const organizationLogoUrl = useBaseUrl('/img/new.webp', { absolute: true });
  const socialImageUrl = useBaseUrl('/img/artworks/Variant_B.webp', { absolute: true });
  const homeDescription = translate({
    id: 'home.description',
    message: '隙间月影（Sukima Moonlight）以艺术微喷工艺，将东方Project角色与世界名画重新相遇。',
  });

  return (
    <Layout
      title={`${siteConfig.title}`}
      description={homeDescription}>
      <Head>
        <link rel="preload" as="image" href={heroLogoUrl} fetchPriority="high" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "隙间月影 | Sukima Moonlight",
            "url": "https://sukima-ml.club",
            "inLanguage": ["zh-Hans", "en"],
            "description": homeDescription,
            "publisher": {
              "@type": "Organization",
              "name": "Sukima Moonlight",
              "url": "https://sukima-ml.club",
              "logo": organizationLogoUrl,
              "sameAs": [
                "https://github.com/fish2lab",
                "https://x.com/fish2lab",
                "https://space.bilibili.com/368984327",
                "https://fcsu.dev"
              ]
            },
            "image": socialImageUrl
          })}
        </script>
      </Head>

      <main className={styles.mainContainer} data-wc-tone="wall">

        {/* 1. 开场：隙间张开，升起 Logo 和「名画与东方的邂逅」 */}
        <HomeHero logoUrl={heroLogoUrl} />

        {/* 2. 画廊墙：四幅画，隙间扫过把名画换成东方版 */}
        <GalleryWall />

        {/* 3. Endlessly 17 票据 */}
        <div className={styles.ticketSection}>
          <EndlesslyTicket />
        </div>

        {/* 4. 四个入口 */}
        <section className={styles.modulesSection} aria-labelledby="home-modules-heading">
          <h2 id="home-modules-heading" className="wc-sr-only">
            <Translate id="home.modules.heading" description="首页四个入口的标题（只给读屏）">
              四个入口
            </Translate>
          </h2>
          <div className={styles.modulesGrid}>
            {navigationItems.map((item, index) => (
              <ModuleBlock
                key={item.title}
                index={index}
                title={item.title}
                link={item.link}
                description={item.description}
              />
            ))}
          </div>
        </section>

        {/* 5. 墙根：品牌落款 */}
        <footer className={styles.homeFooter}>
          <InkRule weight="bold" length={1120} seed={13} decorative className={styles.footerRule} />
          <p className={styles.footerLine}>
            <span className={styles.footerMark}>隙間月影 · SUKIMA MOONLIGHT</span>
            <span className={styles.footerText}>
              <Translate id="footer.text">隙间月影 Sukima Moonlight - 为东方带来更有文化底蕴的制品</Translate>
            </span>
          </p>
        </footer>

      </main>
    </Layout>
  );
}
