import React, { Fragment, useCallback, useEffect, useRef, useSyncExternalStore, type CSSProperties, type FocusEvent, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import useBaseUrl, { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import Translate, { translate } from '@docusaurus/Translate';
import { InkButton, InkRule, LabelCard, SweepReveal, motionAllowedNow, type SweepImage } from '@site/src/components/woodcut';
import { clamp, easeIO, easeOutBack, lerp } from '@site/src/components/woodcut/draw';
import { artworks, type Artwork } from '@site/src/data/galleryData';
import { getArtworkSubtitle, getArtworkTitle, getOriginalPaintingTitle } from '@site/src/utils/galleryTranslations';
import styles from './GalleryWall.module.css';

/*
 * 首页画廊墙：片子第 2 段（BX animation/scenes/2-sukima.js）的网页版。四幅画（galleryData 的顺序），每幅一个开间。
 *
 * 桌面（≥ 1024px、没有要求减少动态、html[data-wc-motion='on']）：framer-motion 官方的 sticky + useScroll + useTransform 横向滚动。
 *   整段高 560vh，里面一块 sticky 的舞台；往下滚时镜头沿墙横移，一屏一个开间，画在左、展签在右。
 *   滚动时间线（单位：一个开间的停留 DWELL）：开间 0 停 → 横移 → 开间 1 停 → … → 开间 3 停 → 拉远 → 整面墙停。
 *   每个开间停留期间：原作停到 15% → 隙间 15%–60% 从上往下扫完并合上 → 东方版停到 70% → 展签 70%–90% 以左边为轴翻出。
 *   全部直接由滚动位置算出（useTransform），不加 spring，滚动跟手。
 * 手机 / 平板 / 减少动态：竖排，每个开间约一屏，画在上、展签在下；进入视口自动扫一次，点画来回切（SweepReveal 自带）；开间之间一道 InkRule。
 *
 * 布局由 CSS 媒体查询决定（SSR 就对），滚动驱动的 MotionValue 只在水合后、useWallMode() 为真时接上。
 */

const N = artworks.length;
const DWELL = 1;
const MOVE = 0.4;
const ZOOM = 0.6;
const WIDE = 0.5;
const ZOOM_AT = N * DWELL + (N - 1) * MOVE;
const TOTAL = ZOOM_AT + ZOOM + WIDE;
/** 拉远后四个开间并排占屏宽 92%（片子 S2.WIDE.zoom ≈ .245） */
const WIDE_SCALE = 0.92 / N;
/** 开间内的节奏（占这个开间停留进度的比例） */
const SWEEP_FROM = 0.15;
const SWEEP_TO = 0.6;
const FLIP_FROM = 0.7;
const FLIP_TO = 0.9;

const bayStart = (k: number): number => k * (DWELL + MOVE);

/** 时间线 t 处的镜头：cx 是屏幕中心对着墙上哪里（单位：开间宽），zoom 是缩放 */
function camera(t: number): { cx: number; zoom: number } {
  if (t >= ZOOM_AT) {
    const e = easeIO(clamp((t - ZOOM_AT) / ZOOM, 0, 1));
    return { cx: lerp(N - 0.5, N / 2, e), zoom: Math.exp(Math.log(WIDE_SCALE) * e) };
  }
  const k = clamp(Math.floor(t / (DWELL + MOVE)), 0, N - 1);
  const u = (t - bayStart(k) - DWELL) / MOVE;
  return { cx: k + 0.5 + (u > 0 && k < N - 1 ? easeIO(clamp(u, 0, 1)) : 0), zoom: 1 };
}

/** 墙（宽 N 个开间）的 translateX，按墙自身宽度的百分比；transform-origin 在墙的左边中点 */
function wallX(p: number): string {
  const { cx, zoom } = camera(p * TOTAL);
  return `${(((0.5 - cx * zoom) / N) * 100).toFixed(4)}%`;
}

const wallScale = (p: number): number => camera(p * TOTAL).zoom;

// ---------- 桌面横向模式的开关（SSR 和水合那一帧是 false） ----------

const WALL_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

function subscribeWall(cb: () => void): () => void {
  const mq = window.matchMedia(WALL_QUERY);
  mq.addEventListener('change', cb);
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-wc-motion'] });
  return () => {
    mq.removeEventListener('change', cb);
    mo.disconnect();
  };
}

const wallNow = (): boolean => window.matchMedia(WALL_QUERY).matches && motionAllowedNow();
const wallOnServer = (): boolean => false;

function useWallMode(): boolean {
  return useSyncExternalStore(subscribeWall, wallNow, wallOnServer);
}

// ---------- 一个开间 ----------

/** 「真菌_isomer (Bilibili: 308844850)」→ ['真菌_isomer', '(Bilibili: 308844850)'] */
function splitArtist(artist: string): [string, string | null] {
  const m = /^(.*?)\s*(\([^()]*\))\s*$/.exec(artist);
  return m && m[1] ? [m[1], m[2]] : [artist, null];
}

interface BayProps {
  artwork: Artwork;
  index: number;
  wall: boolean;
  progress: MotionValue<number>;
  onKeyboardFocus: (index: number) => void;
}

function Bay({ artwork: a, index: k, wall, progress, onKeyboardFocus }: BayProps): ReactNode {
  const title = getArtworkTitle(a);
  const originalTitle = getOriginalPaintingTitle(a);
  const [artistName, artistHandle] = splitArtist(a.artist);

  const local = useTransform(progress, (p) => clamp((p * TOTAL - bayStart(k)) / DWELL, 0, 1));
  const sweep = useTransform(local, [SWEEP_FROM, SWEEP_TO], [0, 1], { clamp: true });
  const flip = useTransform(local, (v) => easeOutBack(clamp((v - FLIP_FROM) / (FLIP_TO - FLIP_FROM), 0, 1)));

  const from: SweepImage = {
    src: useBaseUrl(a.originalImagePath),
    alt: translate({ id: 'home.gallery.altOriginal', message: '原作：{name}', description: '画廊墙上原作图片的 alt' }, { name: originalTitle }),
    width: a.originalImageWidth,
    height: a.originalImageHeight,
  };
  const to: SweepImage = {
    src: useBaseUrl(a.imagePath),
    alt: translate({ id: 'home.gallery.altTouhou', message: '东方版：{title}', description: '画廊墙上东方版图片的 alt' }, { title }),
    width: a.imageWidth,
    height: a.imageHeight,
  };

  const lines: ReactNode[] = [
    getArtworkSubtitle(a),
    <>
      <span className={styles.key}>
        <Translate id="home.gallery.original" description="画廊墙展签：原作">
          原作
        </Translate>
      </span>
      {originalTitle}
    </>,
    <>
      <span className={styles.key}>
        <Translate id="home.gallery.character" description="画廊墙展签：角色">
          角色
        </Translate>
      </span>
      {a.touhouCharacter}
    </>,
    <>
      <span className={styles.key}>
        <Translate id="home.gallery.artist" description="画廊墙展签：画师">
          画师
        </Translate>
      </span>
      {artistName}
      {artistHandle ? <small className={styles.handle}>{artistHandle}</small> : null}
    </>,
  ];

  const onFocus = (e: FocusEvent<HTMLElement>) => {
    if (e.target instanceof Element && e.target.matches(':focus-visible')) onKeyboardFocus(k);
  };

  return (
    <article className={styles.bay} style={{ '--ar': (a.imageWidth / a.imageHeight).toFixed(4) } as CSSProperties} onFocus={wall ? onFocus : undefined}>
      <div className={styles.frameCol}>
        <SweepReveal
          from={from}
          to={to}
          progress={wall ? sweep : undefined}
          frame={{ hang: true, swing: true, seed: 21 + k * 9 }}
          seed={23 + k * 13}
          toggleLabel={translate({ id: 'home.gallery.toggle', message: '显示东方版：{title}', description: '画廊墙上原作 / 东方版切换按钮的读屏名称' }, { title })}
        />
      </div>
      <motion.div className={styles.cardCol} style={wall ? { scaleX: flip } : undefined}>
        <LabelCard as="div" title={title} lines={lines} flip={!wall} seed={31 + k * 11}>
          <div className={styles.cta}>
            <InkButton to={a.link} aria-label={translate({ id: 'home.gallery.viewLabel', message: '看这幅：{title}', description: '「看这幅」按钮的读屏名称' }, { title })}>
              <Translate id="home.gallery.view" description="画廊墙展签上进详情页的按钮">
                看这幅
              </Translate>
            </InkButton>
          </div>
        </LabelCard>
      </motion.div>
    </article>
  );
}

// ---------- 整面墙 ----------

export default function GalleryWall(): ReactNode {
  const wall = useWallMode();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, wallX);
  const scale = useTransform(scrollYProgress, wallScale);
  const { withBaseUrl } = useBaseUrlUtils();

  // 横向模式：画廊离视口还有一屏时把八张图先取回来，开间横移进来时不空着
  useEffect(() => {
    const section = sectionRef.current;
    if (!wall || !section) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        for (const a of artworks) {
          for (const src of [a.originalImagePath, a.imagePath]) {
            const img = new Image();
            img.decoding = 'async';
            img.src = withBaseUrl(src);
          }
        }
      },
      { rootMargin: '0px 0px 100% 0px' },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [wall, withBaseUrl]);

  // 横向模式下用键盘 Tab 到某个开间的按钮：滚到这个开间展签已经翻出的位置
  const showBay = useCallback((k: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const distance = section.offsetHeight - window.innerHeight;
    const t = bayStart(k) + DWELL * 0.95;
    window.scrollTo({ top: top + (t / TOTAL) * distance, behavior: 'instant' });
  }, []);

  return (
    <section ref={sectionRef} className={styles.gallery} aria-labelledby="home-gallery-heading">
      <h2 id="home-gallery-heading" className="wc-sr-only">
        <Translate id="home.gallery.heading" description="首页画廊墙的标题（只给读屏）">
          墙上的四幅画
        </Translate>
      </h2>
      <div className={styles.stage} style={{ '--bays': N } as CSSProperties}>
        <motion.div key={wall ? 'wall' : 'stack'} className={styles.wall} data-wc-tone="wall" style={wall ? { x, scale } : undefined}>
          {artworks.map((a, k) => (
            <Fragment key={a.id}>
              {k > 0 ? <InkRule className={styles.rule} length={960} dry={0.15} seed={5 + k} /> : null}
              <Bay artwork={a} index={k} wall={wall} progress={scrollYProgress} onKeyboardFocus={showBay} />
            </Fragment>
          ))}
          <InkRule className={styles.skirting} weight="bold" length={N * 1440} seed={9} decorative />
        </motion.div>
      </div>
    </section>
  );
}
