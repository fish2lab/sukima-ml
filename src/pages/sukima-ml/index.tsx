import React, { memo, useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import clsx from 'clsx';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import { useHistory, useLocation } from '@docusaurus/router';

import { artworks, type Artwork } from '../../data/galleryData';
import {
  getArtworkDescription,
  getArtworkSubtitle,
  getArtworkTitle,
  getOriginalPaintingTitle,
} from '../../utils/galleryTranslations';
import { Caption, InkButton, InkFrame, InkRule, LabelCard, motionAllowedNow, useMotionAllowed } from '../../components/woodcut';
import {
  InkArrow,
  SpeechBubble,
  YukariStand,
  anchorFrom,
  fallbackAnchor,
  placeBubble,
  type YukariAnchor,
  type YukariHitMap,
} from '../../components/gallery';
import styles from './index.module.css';

const COUNT = artworks.length;
const wrap = (i: number) => ((i % COUNT) + COUNT) % COUNT;
/** 最瘦的一幅的宽高比：手机上墙的高度按它留，换幅时墙不跳 */
const AR_MIN = Math.min(...artworks.map((a) => a.imageWidth / a.imageHeight));
/** 镜头沿墙横移（片子 S2.T.move .7 秒，easeIO 三次缓入缓出） */
const MOVE_S = 0.7;
const MOVE_EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
/** 手机左右滑的阈值 */
const SWIPE_PX = 60;

/**
 * pos：镜头停在墙上第几个开间（可以一直加减，第 pos 个开间挂 artworks[wrap(pos)]）；
 * from：正在从哪个开间移过来（移动中两个开间都在墙上），null 表示停着。
 */
type View = { pos: number; from: number | null };

const counterLabel = (i: number) =>
  translate({ id: 'gallery.counter', message: '第 {current} 幅，共 {total} 幅' }, { current: i + 1, total: COUNT });

// --- 墙上的一个开间：挂画轨下面用挂绳挂着一幅画 ---
// 定义在模块级并 memo：换幅时停着的那一幅不重挂载（<img> 不重载、晃动不重放）。
interface BayProps {
  artwork: Artwork;
  slot: number;
  /** 镜头停在这一幅上（移动中的两幅都不算） */
  settled: boolean;
  /** 每到位一次加一：到位时在挂绳上晃一下 */
  swingKey: number;
  /** 首屏的那一幅：fetchpriority=high */
  priority: boolean;
  src: string;
  viewDetails: string;
}

const Bay = memo(function Bay({ artwork, slot, settled, swingKey, priority, src, viewDetails }: BayProps): ReactNode {
  const title = getArtworkTitle(artwork);
  return (
    <div
      className={styles.bay}
      data-wc-tone="wall"
      role="group"
      aria-label={counterLabel(wrap(slot))}
      inert={!settled}
      style={{ left: `${slot * 100}%`, '--ar': (artwork.imageWidth / artwork.imageHeight).toFixed(4) } as CSSProperties}>
      <div className={styles.frameSlot}>
        <InkFrame hang rail={false} swing={settled} swingKey={swingKey} seed={21 + Number(artwork.id) * 6} nominal={[480, 620]}>
          <Link to={artwork.link} className={styles.artLink} draggable={false}>
            <img
              src={src}
              alt={title}
              width={artwork.imageWidth}
              height={artwork.imageHeight}
              loading="eager"
              decoding="async"
              fetchPriority={priority ? 'high' : 'auto'}
              draggable={false}
            />
            <span className={styles.hint}>
              <Caption size="sm">{viewDetails}</Caption>
            </span>
          </Link>
        </InkFrame>
      </div>
    </div>
  );
});

export default function MagicGallery(): ReactNode {
  const [view, setView] = useState<View>({ pos: 0, from: null });
  const [arrivals, setArrivals] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [bubbleAnchor, setBubbleAnchor] = useState<YukariAnchor | null>(null);
  const [narrow, setNarrow] = useState(false);
  const [stageSize, setStageSize] = useState<{ w: number; h: number } | null>(null);

  const history = useHistory();
  const location = useLocation();
  const { withBaseUrl } = useBaseUrlUtils();
  const motionOK = useMotionAllowed();
  const bubbleId = useId();

  const stageRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const yukariButtonRef = useRef<HTMLButtonElement>(null);
  const hitMapRef = useRef<YukariHitMap | null>(null);
  const movingRef = useRef(false);
  const moveTimerRef = useRef(0);
  const dragEndAtRef = useRef(-Infinity);
  const prefetchedRef = useRef(new Set<string>());

  const index = wrap(view.pos);
  const centerItem = artworks[index];
  const moving = view.from !== null;

  // 手机布局（和 Infima 的断点一致）：左右滑换幅
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 996px)');
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setStageSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(moveTimerRef.current), []);

  // 换幅：镜头沿墙横移 .7 秒，下一幅在右边（或左边）一个开间，移过来后晃一下；减少动态时直接切换
  const go = useCallback((dir: 1 | -1) => {
    if (movingRef.current) return;
    setShowInfo(false);
    if (!motionAllowedNow()) {
      setView((v) => ({ pos: v.pos + dir, from: null }));
      setArrivals((a) => a + 1);
      return;
    }
    movingRef.current = true;
    setView((v) => ({ pos: v.pos + dir, from: v.pos }));
    moveTimerRef.current = window.setTimeout(() => {
      movingRef.current = false;
      setView((v) => ({ pos: v.pos, from: null }));
      setArrivals((a) => a + 1);
    }, MOVE_S * 1000 + 30);
  }, []);

  const jumpTo = useCallback((target: number) => {
    window.clearTimeout(moveTimerRef.current);
    movingRef.current = false;
    setShowInfo(false);
    setView({ pos: target, from: null });
    setArrivals((a) => a + 1);
  }, []);

  const handleNext = useCallback(() => go(1), [go]);
  const handlePrev = useCallback(() => go(-1), [go]);

  // 快要换到的两幅先取图（只在要换幅的时候取：悬停、聚焦箭头，手指按上墙）
  const prefetch = useCallback(() => {
    for (const d of [-1, 1]) {
      const src = withBaseUrl(artworks[wrap(index + d)].imagePath);
      if (prefetchedRef.current.has(src)) continue;
      prefetchedRef.current.add(src);
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    }
  }, [index, withBaseUrl]);

  // Handle Redirection from Test
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const featuredId = params.get('featured');
    if (featuredId) {
      const index = artworks.findIndex(a => a.id === featuredId);
      if (index !== -1) {
        jumpTo(index);
        // Optional: clean up URL
        history.replace(location.pathname);
      }
    }
  }, [location, history, jumpTo]);

  // 键盘左右键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      go(e.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const getYukariHitMap = (img: HTMLImageElement): YukariHitMap | null => {
    const cached = hitMapRef.current;
    if (cached && cached.width === img.naturalWidth && cached.height === img.naturalHeight) {
      return cached;
    }

    // Cache a single alpha map so clicks don't re-scan the whole character image.
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    const width = img.naturalWidth;
    const height = img.naturalHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0);

    const alphaData = ctx.getImageData(0, 0, width, height).data;
    let minY = 0;
    let maxX = width;

    topScan: for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        if (alphaData[(py * width + px) * 4 + 3] > 10) {
          minY = py;
          break topScan;
        }
      }
    }

    rightScan: for (let px = width - 1; px >= 0; px--) {
      for (let py = 0; py < height; py++) {
        if (alphaData[(py * width + px) * 4 + 3] > 10) {
          maxX = px;
          break rightScan;
        }
      }
    }

    hitMapRef.current = { width, height, alphaData, minY, maxX };
    return hitMapRef.current;
  };

  const measureAnchor = (img: HTMLImageElement, stage: HTMLElement): YukariAnchor => {
    const rect = img.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    try {
      const hitMap = getYukariHitMap(img);
      if (hitMap) return anchorFrom(hitMap, rect, stageRect);
    } catch (err) {
      console.error('Failed to get pixel data:', err);
    }
    return fallbackAnchor(rect, stageRect);
  };

  // Pixel-perfect click detection & dynamic positioning.
  const handleYukariClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const img = imageRef.current;
    const stage = stageRef.current;
    if (!img || !stage) return;
    if (performance.now() - dragEndAtRef.current < 300) return;

    // 键盘（回车、空格）按下时没有指针坐标：直接讲解
    if (e.detail === 0) {
      e.stopPropagation();
      setBubbleAnchor(measureAnchor(img, stage));
      setShowInfo(true);
      return;
    }

    try {
      const hitMap = getYukariHitMap(img);
      if (!hitMap) return;

      const rect = img.getBoundingClientRect();
      const scaleX = hitMap.width / rect.width;
      const scaleY = hitMap.height / rect.height;
      const pixelX = Math.floor((e.clientX - rect.left) * scaleX);
      const pixelY = Math.floor((e.clientY - rect.top) * scaleY);

      if (pixelX < 0 || pixelX >= hitMap.width || pixelY < 0 || pixelY >= hitMap.height) {
        return;
      }

      const clickedPixelIndex = (pixelY * hitMap.width + pixelX) * 4;
      const alpha = hitMap.alphaData[clickedPixelIndex + 3];

      // If opaque enough (e.g., > 10), trigger the info
      if (alpha > 10) {
        e.stopPropagation();
        setBubbleAnchor(anchorFrom(hitMap, rect, stage.getBoundingClientRect()));
        setShowInfo(true);
      } else {
        // If transparent, forward the click to the element behind
        const button = e.currentTarget;
        button.style.pointerEvents = 'none';
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
        button.style.pointerEvents = '';

        if (elementBelow && elementBelow instanceof HTMLElement) {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: e.clientX,
            clientY: e.clientY
          });
          elementBelow.dispatchEvent(clickEvent);
        }
      }
    } catch (err) {
      console.error('Failed to get pixel data:', err);
      e.stopPropagation();
      setBubbleAnchor(fallbackAnchor(img.getBoundingClientRect(), stage.getBoundingClientRect()));
      setShowInfo(prev => !prev);
    }
  };

  // 气泡开着时舞台变了大小（转屏、拉窗口）：重新量锚点
  useEffect(() => {
    if (!showInfo) return;
    const img = imageRef.current;
    const stage = stageRef.current;
    if (!img || !stage) return;
    const rect = img.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const hitMap = hitMapRef.current;
    setBubbleAnchor(hitMap ? anchorFrom(hitMap, rect, stageRect) : fallbackAnchor(rect, stageRect));
  }, [stageSize, showInfo]);

  const closeBubble = useCallback((returnFocus: boolean) => {
    setShowInfo(false);
    if (returnFocus) yukariButtonRef.current?.focus({ preventScroll: true });
  }, []);

  const onDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    dragEndAtRef.current = performance.now();
    if (info.offset.x <= -SWIPE_PX) go(1);
    else if (info.offset.x >= SWIPE_PX) go(-1);
  };

  const slots = view.from !== null ? [view.from, view.pos] : [view.pos];
  const viewDetails = translate({ id: 'gallery.viewDetails', message: 'View Details' });
  const title = getArtworkTitle(centerItem);

  return (
    <Layout
      title={translate({ id: 'gallery.title', message: '作品集' })}
      description={translate({ id: 'gallery.description', message: '探索东方Project角色与世界名画相遇的艺术微喷作品集。' })}
    >
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": translate({ id: 'gallery.title', message: '作品集' }),
            "url": withBaseUrl('/sukima-ml', { absolute: true }),
            "description": translate({ id: 'gallery.description', message: '探索东方Project角色与世界名画相遇的艺术微喷作品集。' }),
            "image": artworks.map((artwork) => withBaseUrl(artwork.imagePath, { absolute: true })),
            "associatedMedia": artworks.map((artwork) => ({
              "@type": "ImageObject",
              "name": getArtworkTitle(artwork),
              "caption": getArtworkDescription(artwork),
              "contentUrl": withBaseUrl(artwork.imagePath, { absolute: true }),
              "creator": artwork.artist,
            })),
            "publisher": {
              "@type": "Organization",
              "name": "Sukima Moonlight"
            }
          })}
        </script>
      </Head>
      <main
        className={styles.page}
        data-wc-tone="wall"
        style={{ '--ar-min': AR_MIN.toFixed(4) } as CSSProperties}
        onClick={() => setShowInfo(false)} // Close info if clicking background
      >
        <h1 className="wc-sr-only">{translate({ id: 'gallery.title', message: '作品集' })}</h1>

        {/* --- 展厅：一面画廊墙，镜头沿墙移动 --- */}
        <section ref={stageRef} className={styles.stage} aria-label={translate({ id: 'gallery.wall.label', message: '作品展厅' })}>
          <div className={styles.wall}>
            <motion.div
              className={styles.drag}
              drag={narrow ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={motionOK ? 0.18 : 0}
              dragMomentum={false}
              dragSnapToOrigin
              onDragEnd={onDragEnd}
              onPointerDown={narrow ? prefetch : undefined}
              onClickCapture={(e) => {
                // 刚滑完的那一下不算点画
                if (performance.now() - dragEndAtRef.current < 300) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}>
              <div
                className={styles.track}
                style={{
                  transform: `translateX(${-view.pos * 100}%)`,
                  transition: moving ? `transform ${MOVE_S}s ${MOVE_EASE}` : 'none',
                  willChange: moving ? 'transform' : undefined,
                }}>
                {slots.map((slot) => (
                  <Bay
                    key={slot}
                    artwork={artworks[wrap(slot)]}
                    slot={slot}
                    settled={!moving && slot === view.pos}
                    swingKey={arrivals}
                    priority={slot === 0}
                    src={withBaseUrl(artworks[wrap(slot)].imagePath)}
                    viewDetails={viewDetails}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* 挂画轨和踢脚线是连续的横线，镜头横移时看起来不动，画在墙外面一层 */}
          <div className={styles.rail} aria-hidden="true">
            <InkRule decorative weight={4.5} length={1440} taper={0} seed={61} style={{ margin: 0 }} />
            <InkRule decorative weight={1.4} dry={0.3} length={1440} taper={0} seed={62} style={{ margin: 0 }} />
          </div>
          <div className={styles.floor} aria-hidden="true">
            <InkRule decorative weight="bold" length={1440} taper={0} seed={63} className={styles.skirting} style={{ margin: 0 }} />
            <InkRule decorative weight={1.6} dry={0.25} length={1440} taper={0} seed={64} className={styles.floorLine} style={{ margin: 0 }} />
          </div>

          <YukariStand
            src={withBaseUrl('/img/yukari.webp')}
            alt={translate({ id: 'gallery.yukari.alt', message: 'Yukari Yakumo' })}
            label={translate({ id: 'gallery.yukari.ask', message: '听八云紫讲解这幅画' })}
            expanded={showInfo}
            controls={bubbleId}
            imageRef={imageRef}
            buttonRef={yukariButtonRef}
            onClick={handleYukariClick}
            className={styles.stand}
            slitClassName={styles.slit}
          />

          <p className={clsx(styles.counter, 'wc-mono')} aria-live="polite" aria-atomic="true">
            <span aria-hidden="true">
              {index + 1} / {COUNT}
            </span>
            <span className="wc-sr-only">{counterLabel(index)}</span>
          </p>

          {/* Info Pop-up：黑白漫画对话框，尖指向紫 */}
          {showInfo && bubbleAnchor && stageSize ? (
            <SpeechBubble
              id={bubbleId}
              label={translate({ id: 'gallery.bubble.label', message: '八云紫的讲解：{title}' }, { title })}
              place={placeBubble(bubbleAnchor, stageSize.w, stageSize.h, narrow)}
              maxBottom={narrow ? null : stageSize.h}
              onClose={closeBubble}
              pop={motionOK}
              closeLabel={translate({ id: 'theme.common.close', message: 'Close' })}
              seed={51 + index * 13}>
              <h3 className={styles.bubbleTitle}>{title}</h3>
              <div className={styles.bubbleSubtitle}>{getArtworkSubtitle(centerItem)}</div>
              <p className={styles.bubbleText}>“{getArtworkDescription(centerItem)}”</p>
              <div className={styles.bubbleArtist}>— {centerItem.artist}</div>
            </SpeechBubble>
          ) : null}
        </section>

        {/* 上一幅 / 下一幅：桌面在画框两侧，手机在画的下方两侧 */}
        <div className={styles.nav}>
          <InkArrow
            dir="prev"
            seed={71}
            className={styles.navPrev}
            label={translate({ id: 'gallery.nav.prev', message: 'Previous artwork' })}
            onClick={handlePrev}
            onPointerEnter={prefetch}
            onFocus={prefetch}
          />
          <InkArrow
            dir="next"
            seed={83}
            className={styles.navNext}
            label={translate({ id: 'gallery.nav.next', message: 'Next artwork' })}
            onClick={handleNext}
            onPointerEnter={prefetch}
            onFocus={prefetch}
          />
        </div>

        {/* 展签：桌面在画的右下，手机在画的下方；换幅时旧的收起，到位后新的翻出 */}
        <div className={styles.labelSlot} style={{ '--ar': (centerItem.imageWidth / centerItem.imageHeight).toFixed(4) } as CSSProperties}>
          <AnimatePresence initial={false} mode="wait">
            {!moving ? (
              <motion.div
                key={`${centerItem.id}-${view.pos}`}
                className={styles.labelWrap}
                style={{ originX: 0 }}
                exit={motionOK ? { scaleX: 0, transition: { duration: 0.18, ease: [0.55, 0, 1, 0.45] } } : { opacity: 0, transition: { duration: 0 } }}>
                <LabelCard
                  title={title}
                  titleAs="h2"
                  seed={31 + index * 7}
                  nominal={[340, 420]}
                  lines={[
                    getArtworkSubtitle(centerItem),
                    translate({ id: 'gallery.label.originalLine', message: '原作：{painting}' }, { painting: getOriginalPaintingTitle(centerItem) }),
                    translate({ id: 'gallery.label.characterLine', message: '角色：{character}' }, { character: centerItem.touhouCharacter }),
                    translate({ id: 'gallery.label.artistLine', message: '画师：{artist}' }, { artist: centerItem.artist }),
                  ]}>
                  <div className={styles.labelAction}>
                    <InkButton to={centerItem.link} size="sm">
                      {translate({ id: 'gallery.label.view', message: '看这幅' })}
                    </InkButton>
                  </div>
                </LabelCard>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </Layout>
  );
}
