import React, { useEffect, useRef, type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import { animate, useMotionValue } from 'framer-motion';
import { Caption, HandTitle, InkRule, SukimaSlit, useReveal } from '@site/src/components/woodcut';
import styles from './HomeHero.module.css';

/** 开场的总时长（秒）：挂画轨 .1–.55 → 隙间划线、张开 .35–.8 → Logo 升起 .8–1.3 → 标题 1.0 起写 → 副题 1.45 起写 → 往下滚提示 2.2 */
const HERO_DURATION = 2.6;

export interface HomeHeroProps {
  /** 社团 Logo（/img/sukima-ml.svg，页面 Head 里已 preload） */
  logoUrl: string;
}

/**
 * 首页开场，占满一屏：暖白纸墙，顶部挂画轨从左往右画出；正中一道细线张开成带眼睛的隙间，
 * 隙间里升起社团 Logo，下面手写「名画与东方的邂逅」。片子第 2 段开头（BX animation/scenes/2-sukima.js）。
 * 进场节奏由 useReveal 驱动（html[data-wc-motion='on'] 时才先藏）；减少动态时一开始就是最终画面。
 */
export default function HomeHero({ logoUrl }: HomeHeroProps): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const state = useReveal(ref, HERO_DURATION, { amount: 0 });
  const open = useMotionValue(0);

  useEffect(() => {
    if (state === 'pending') return undefined;
    if (state !== 'play') {
      open.set(1);
      return undefined;
    }
    // SukimaSlit 的 open：0–.3 划出一道线、系上蝴蝶结，.3–1 张开
    const controls = animate(open, [0, 0.3, 1], { duration: 0.45, times: [0, 0.44, 1], ease: ['linear', 'easeOut'], delay: 0.35 });
    return () => controls.stop();
  }, [state, open]);

  const label = translate({ id: 'home.hero.label', message: '隙间月影', description: '首页开场左上角的小展签' });
  const title = translate({ id: 'home.hero.title', message: '名画与东方的邂逅', description: '首页开场的手写大标题（h1）' });
  const subtitle = translate({
    id: 'home.hero.subtitle',
    message: 'Where Classic Art Meets Touhou',
    description: '首页大标题下面的副题；中文站是英文，英文站换成中文，两种语言各占一行',
  });

  return (
    <header ref={ref} className={styles.hero} data-wc-reveal={state}>
      <Caption className={styles.label} write>
        {label}
      </Caption>

      <div className={styles.rail} aria-hidden="true">
        <InkRule className={styles.railLine} weight={4.5} length={1440} seed={31} decorative />
        <InkRule className={styles.railLine} weight="hair" dry={0.3} length={1440} seed={32} decorative />
      </div>

      <div className={styles.center}>
        <div className={styles.riseClip}>
          <div className={styles.rise}>
            <Link to="/giclee" className={styles.logoLink}>
              <img
                src={logoUrl}
                alt="Gap of the Moon"
                className={styles.logo}
                width={200}
                height={120}
                loading="eager"
                decoding="sync"
                fetchPriority="high"
              />
              <span className={styles.logoCaption}>
                <Translate id="home.hero.caption">我们选择的工艺——艺术微喷</Translate>
              </span>
            </Link>
          </div>
        </div>

        <div className={styles.slitBox}>
          <SukimaSlit open={open} aspect={4.2} eyes={7} seed={17} />
        </div>

        <HandTitle as="h1" size="display" per={0.06} delay={1} className={styles.title}>
          {title}
        </HandTitle>
        <HandTitle as="p" size="section" per={0.025} delay={1.45} wobble={0.6} className={styles.subtitle}>
          {subtitle}
        </HandTitle>
      </div>

      <div className={clsx(styles.hint, 'wc-mono')} aria-hidden="true">
        <Translate id="home.hero.scrollHint">SCROLL</Translate> <span className={styles.hintArrow}>▼</span>
      </div>
    </header>
  );
}
