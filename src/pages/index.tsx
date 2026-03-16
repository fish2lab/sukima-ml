import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import React, { useState, useEffect } from 'react';
import MagicGalleryComponent from '../components/MagicGallery';


import styles from './index.module.css';



// 占位数据：导航按钮
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
    link: 'https://fcsu.dev',
    description: <Translate id="home.module.phantasm.desc">Medium format photography with Fujifilm GFX100S.</Translate>,
  },
];

// ASCII码动态展示组件 + Phase Phantasm 入口
type ASCIIPhase = 'counting' | 'complete' | 'phantasm';

function ASCIIDemo() {
  const text = "Endlessly 17 year old~";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cumulativeSum, setCumulativeSum] = useState(0);
  const [currentCharASCII, setCurrentCharASCII] = useState(0);
  const [phase, setPhase] = useState<ASCIIPhase>('counting');

  // Counting Effect
  useEffect(() => {
    if (phase === 'counting') {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          const charCode = text.charCodeAt(currentIndex);
          setCurrentCharASCII(charCode);
          setCumulativeSum(prev => prev + charCode);
          setCurrentIndex(prev => prev + 1);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        // Counting finished
        setPhase('complete');
      }
    }
  }, [phase, currentIndex, text.length]);

  // Transition Effect: Complete -> Phantasm
  useEffect(() => {
    if (phase === 'complete') {
      const timer = setTimeout(() => setPhase('phantasm'), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Reset Effect: Phantasm -> Counting
  useEffect(() => {
    if (phase === 'phantasm') {
      // Reset after 5 seconds
      const timer = setTimeout(() => {
        setCurrentIndex(0);
        setCumulativeSum(0);
        setCurrentCharASCII(0);
        setPhase('counting');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const numberString = cumulativeSum.toString().padStart(4, '0');

  // Calculate opacity
  const progress = currentIndex / text.length;
  const counterOpacity = phase === 'counting' ? 1 - (progress * 0.8) : (phase === 'complete' ? 0.2 : 0);

  return (
    <div className={styles.asciiDemo} style={{ position: 'relative' }}>
      {/* Counter Content */}
      <div style={{
        opacity: phase === 'phantasm' ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: phase === 'phantasm' ? 'none' : 'auto'
      }}>
        <div className={styles.asciiText} style={{ opacity: counterOpacity, transition: 'opacity 0.3s ease' }}>
          <span className={styles.quote}>"</span>
          {text.split('').map((char, index) => (
            <span
              key={index}
              className={clsx(
                styles.asciiChar,
                index < currentIndex && styles.revealed,
                index === currentIndex - 1 && styles.current
              )}
            >
              {char}
            </span>
          ))}
          <span className={styles.quote}>"</span>
        </div>

        <div className={styles.currentCharInfo} style={{ opacity: counterOpacity, transition: 'opacity 0.3s ease' }}>
          {currentIndex === 0 ? (
            "./start.sh"
          ) : currentIndex <= text.length ? (
            `'${text[currentIndex - 1]}' → ASCII ${currentCharASCII}`
          ) : (
            "./done"
          )}
        </div>

        <div className={styles.counterContainer} style={{ opacity: counterOpacity, transition: 'opacity 0.3s ease' }}>
          <div className={styles.counterValue}>
            {numberString.split('').map((digit, i) => (
              <span key={i} className={styles.counterDigit}>{digit}</span>
            ))}
          </div>
          <div className={styles.counterLabel}>CUMULATIVE ASCII SUM</div>
        </div>

        <div className={styles.asciiComplete}>
          <div className={styles.messageContent}>
            {phase === 'counting' ? (
              <div className={styles.interimMessage} style={{ opacity: counterOpacity, transition: 'opacity 0.3s ease' }}>
                <span className={styles.blinkingCursor}>_</span> Calculating age...
              </div>
            ) : (
              <div className={styles.completeMessage}>
                Expected Age &ge; <span style={{ textDecoration: 'underline' }}>{cumulativeSum}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#999' }}>(Source: ASCII Sum Check)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phase Phantasm Link */}
      <Link
        to="https://fcsu.dev"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%', // Center strictly
          transform: 'translate(-50%, -50%)',
          opacity: phase === 'phantasm' ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: phase === 'phantasm' ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'inherit',
          width: '100%', // Ensure it can center its content
          textAlign: 'center'
        }}
      >
        <div style={{
          fontFamily: '"Courier New", monospace',
          fontSize: '1rem',
          marginBottom: '1rem',
          color: '#666',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          [ <Translate id="home.ascii.clickToSee">Click to See</Translate> ]
        </div>
        <div style={{
          fontFamily: '"Times New Roman", serif',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          letterSpacing: '0.1em',
          fontWeight: 400,
          borderBottom: '2px solid #b71c1c',
          paddingBottom: '0.5rem',
          marginBottom: '1rem',
          color: '#b71c1c',
        }}>
          <Translate id="home.ascii.statePhantasm">State Phantasm</Translate>
        </div>
        <div style={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.8rem',
          color: '#999',
          letterSpacing: '0.1em',
        }}>
          <Translate id="home.ascii.photographyBy">Photography by Organizer</Translate>
        </div>
      </Link>
    </div>
  );
}

// 模块介绍砖块组件
function ModuleBlock({ title, description, link, index }) {
  const formattedIndex = (index + 1).toString().padStart(2, '0');

  return (
    <Link to={link} className={styles.moduleBlock}>
      <div className={styles.moduleNumber}>{formattedIndex}</div>
      <h3 className={styles.moduleTitle}>{title}</h3>
      <div className={styles.moduleDesc}>{description}</div>
      <div className={styles.arrowIcon}>→</div>
    </Link>
  );
}

// 主页组件
export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Gap of the Moon - Touhou Project x Classic Art Giclée Prints. Discover the fusion of world masterpieces and Touhou characters.">
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "隙间月影 | Sukima Moonlight",
            "url": "https://sukima-ml.club",
            "description": "Where Classic Art Meets Touhou. High-quality Gicleè art prints.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://sukima-ml.club/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Head>

      <main className={styles.mainContainer}>

        {/* 1. Hero Section: Split Screen */}
        <div className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <Link to="/giclee" className={styles.heroLogoWrapper}>
              <img
                src={useBaseUrl("/img/sukima-ml.svg")}
                alt="Gap of the Moon"
                className={styles.heroLogo}
              />
              <div className={styles.heroLogoCaption}>
                <Translate id="home.hero.caption">我们选择的工艺——艺术微喷</Translate>
              </div>
            </Link>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.asciiContainer}>
              <ASCIIDemo />
            </div>
          </div>
        </div>

        {/* 2. Gallery Section: Full Width */}
        <div className={styles.gallerySection}>
          <div className={styles.galleryContainer}>
            {/* Replaced old carousel with MagicGallery */}
            <MagicGalleryComponent className="h-[80vh]" />
          </div>
        </div>

        {/* 3. Navigation Modules: Grid */}
        <div className={styles.modulesSection}>
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

        {/* 4. Footer */}
        <footer className={styles.homeFooter}>
          <div className={styles.footerContent}>
            <p className={styles.footerText}>
              🌟 <Translate id="footer.text">隙间月影 Sukima Moonlight - 为东方带来更有文化底蕴的制品</Translate>
            </p>
            <div className={styles.socialLinks}>
              <Link to="https://fcsu.dev">Leader's Site</Link>
              <Link to="https://github.com/FinnClair-Su">GitHub</Link>
              <Link to="/about">About</Link>
            </div>
          </div>
        </footer>

      </main>
    </Layout>
  );
}
