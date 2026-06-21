import React, { useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Translate, { translate } from '@docusaurus/Translate';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import { useHistory, useLocation } from '@docusaurus/router';

import { artworks, type Artwork } from '../../data/galleryData';
import {
  getArtworkDescription,
  getArtworkSubtitle,
  getArtworkTitle,
} from '../../utils/galleryTranslations';

type BubblePosition = { top: string | number, left: string | number };
type YukariHitMap = {
  width: number;
  height: number;
  alphaData: Uint8ClampedArray;
  minY: number;
  maxX: number;
};

export default function MagicGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [direction, setDirection] = useState(0);
  const [generations, setGenerations] = useState<Record<string, number>>({});

  const history = useHistory();
  const location = useLocation();
  const { withBaseUrl } = useBaseUrlUtils();
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const hitMapRef = useRef<YukariHitMap | null>(null);
  const [bubblePosition, setBubblePosition] = useState<BubblePosition | null>(null);
  const motionDuration = shouldReduceMotion ? 0.01 : 1;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Redirection from Test
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const featuredId = params.get('featured');
    if (featuredId) {
      const index = artworks.findIndex(a => a.id === featuredId);
      if (index !== -1) {
        setCurrentIndex(index);
        // Optional: clean up URL
        history.replace(location.pathname);
      }
    }
  }, [location, history]);

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

  // Pixel-perfect click detection & dynamic positioning.
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imageRef.current;
    if (!img) return;

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

        const cssTop = hitMap.minY / scaleY;
        const cssLeft = hitMap.maxX / scaleX;

        setBubblePosition({
          top: cssTop + (rect.height * 0.1),
          left: cssLeft + 20
        });

        setShowInfo(true);
      } else {
        // If transparent, forward the click to the element behind
        img.style.pointerEvents = 'none';
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
        img.style.pointerEvents = 'auto';

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
      setShowInfo(prev => !prev);
    }
  };

  const getIndex = (index: number) => {
    const len = artworks.length;
    return ((index % len) + len) % len;
  };

  const handleNext = () => {
    setDirection(1);
    setShowInfo(false);

    // Logic: Left item (index - 1) wraps to becoming Right.
    // We increment its generation to force re-mount at new position.
    const leftIndex = getIndex(currentIndex - 1);
    const leftId = artworks[leftIndex].id;

    setGenerations(prev => ({
      ...prev,
      [leftId]: (prev[leftId] || 0) + 1
    }));

    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    setShowInfo(false);

    // Logic: Right item (index + 1) wraps to becoming Left.
    const rightIndex = getIndex(currentIndex + 1);
    const rightId = artworks[rightIndex].id;

    setGenerations(prev => ({
      ...prev,
      [rightId]: (prev[rightId] || 0) + 1
    }));

    setCurrentIndex((prev) => prev - 1);
  };

  const centerItem = artworks[getIndex(currentIndex)];
  const leftItem = artworks[getIndex(currentIndex - 1)];
  const rightItem = artworks[getIndex(currentIndex + 1)];

  const handleCenterClick = () => {
    history.push(centerItem.link);
  };

  // Helper to get key with generation
  const getKey = (item: Artwork) => `${item.id}-${generations[item.id] || 0}`;

  // Tuned variants for "Gallery Walk" - Responsive & Spatial
  const cardVariants = {
    // Hidden "waiting" state for entering items
    enter: (dir: number) => ({
      x: dir > 0 ? '100vw' : '-100vw', // If moving Next (1), enters from Right (100vw). If Prev (-1), enters from Left.
      scale: 0.6,
      opacity: 0,
      zIndex: 5,
      rotateY: dir > 0 ? -45 : 45,
      transition: { duration: motionDuration, ease: "easeInOut" as const }
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      zIndex: 30,
      filter: 'brightness(1)',
      rotateY: 0,
      transition: { duration: motionDuration, ease: "easeInOut" as const },
    },
    left: {
      x: isMobile ? '-120%' : '-45vw',
      scale: 0.8,
      opacity: 0.6,
      zIndex: 10,
      filter: 'brightness(0.5) blur(2px)',
      rotateY: isMobile ? 0 : 30,
      transition: { duration: motionDuration, ease: "easeInOut" as const },
    },
    right: {
      x: isMobile ? '120%' : '45vw',
      scale: 0.8,
      opacity: 0.6,
      zIndex: 10,
      filter: 'brightness(0.5) blur(2px)',
      rotateY: isMobile ? 0 : -30,
      transition: { duration: motionDuration, ease: "easeInOut" as const },
    },
    // Exiting state for wrapping items
    exit: (dir: number) => ({
      x: dir > 0 ? '-100vw' : '100vw', // If moving Next (1), exits to Left (-100vw). If Prev (-1), exits to Right.
      scale: 0.6,
      opacity: 0,
      zIndex: 5,
      rotateY: dir > 0 ? 45 : -45,
      transition: { duration: motionDuration, ease: "easeInOut" as const }
    })
  };

  // --- Sub-Component: The Realistic Frame ---
  const GalleryFrame = ({
    artwork,
    isActive = false,
    onClick,
  }: {
    artwork: Artwork;
    isActive?: boolean;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
  }) => (
    <div
      onClick={onClick}
      className={clsx(
        "relative bg-white transition-all duration-500",
        "w-[80vw] h-[108vw] md:w-[500px] md:h-[675px]", // Responsive Dimensions
        isActive ? "cursor-pointer" : ""
      )}>

      {/* 1. Wall Drop Shadow */}
      <div
        className="absolute inset-0 z-[-1]"
        style={{
          boxShadow: isActive
            ? '0 30px 60px -10px rgba(0, 0, 0, 0.6), 0 15px 25px -5px rgba(0, 0, 0, 0.4)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
        }}
      />

      {/* 2. Black Aluminum Frame */}
      <div className="w-full h-full bg-[#111] p-[2%] md:p-[10px] flex ring-1 ring-white/10 ring-inset">

        {/* 3. The White Matting - Adaptive Padding */}
        <div className="w-full h-full bg-[#fdfbf7] p-[8%] md:p-[45px] shadow-[inset_0_1px_4px_rgba(0,0,0,0.4)] flex flex-col relative overflow-hidden">

          {/* 4. The Artwork - Full height of container minus matting */}
          <div className="relative w-full h-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)] bg-gray-200">
            <img
              src={withBaseUrl(artwork.imagePath)}
              alt={getArtworkTitle(artwork)}
              width={artwork.imageWidth}
              height={artwork.imageHeight}
              loading={isActive ? 'eager' : 'lazy'}
              decoding={isActive ? 'sync' : 'async'}
              fetchPriority={isActive ? 'high' : 'low'}
              sizes="(max-width: 768px) 80vw, 500px"
              className="w-full h-full object-cover block"
            />
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] pointer-events-none" />

            {/* Click Hint Overlay (Only on Hover of Active) */}
            {isActive && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <span className="bg-black/70 text-white px-4 py-2 rounded-full text-sm tracking-widest uppercase backdrop-blur-md hidden md:block">
                  <Translate id="gallery.viewDetails">View Details</Translate>
                </span>
              </div>
            )}
          </div>

          {/* REMOVED: Label text to maximize space */}
        </div>
      </div>
    </div>
  );

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
      {/* Whiter background, less grey */}
      <main
        className="relative w-full h-[calc(100dvh-var(--ifm-navbar-height))] bg-[#fafafa] dark:bg-[#222] overflow-hidden flex flex-col items-center justify-center"
        onClick={() => setShowInfo(false)} // Close info if clicking background
      >

        {/* --- Background Atmosphere --- */}
        {/* Finer texture, lower opacity for subtle grain */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
          }}
          aria-hidden="true"
        />
        {/* Subtle, softer spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.03)_60%,_rgba(0,0,0,0.1)_100%)] pointer-events-none" aria-hidden="true" />


        {/* REMOVED: Header */}


        {/* --- The Stage --- */}
        {/* Use vw/vh for full immersion */}
        <div className="relative w-full h-full flex items-center justify-center perspective-1500">

          {/* LAYER 1: The Carousel */}
          <div className="relative flex items-center justify-center">

            <AnimatePresence initial={false} mode='popLayout' custom={direction}>

              {/* LEFT */}
              <motion.div
                key={getKey(leftItem)}
                custom={direction}
                className="absolute cursor-pointer"
                variants={cardVariants}
                initial="enter" animate="left" exit="exit"
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              >
                <GalleryFrame artwork={leftItem} />
              </motion.div>

              {/* RIGHT */}
              <motion.div
                key={getKey(rightItem)}
                custom={direction}
                className="absolute cursor-pointer"
                variants={cardVariants}
                initial="enter" animate="right" exit="exit"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
              >
                <GalleryFrame artwork={rightItem} />
              </motion.div>

              {/* CENTER */}
              <motion.div
                key={getKey(centerItem)}
                custom={direction}
                className="absolute"
                variants={cardVariants}
                initial="enter" animate="center" exit="exit"
              >
                <GalleryFrame
                  artwork={centerItem}
                  isActive={true}
                  onClick={(e) => { e.stopPropagation(); handleCenterClick(); }}
                />
              </motion.div>

            </AnimatePresence>
          </div>


          {/* LAYER 2: Yukari Overlay */}
          {/*
             Updated Width: 750px (to support 500px artwork width)
             500px / 750px = 0.666 (2/3)
          */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none w-[150%] md:w-[750px] flex justify-center items-center">

            {/* Character Image - PIXEL PERFECT CLICK DETECTION */}
            <img
              ref={imageRef}
              src={withBaseUrl("/img/yukari.webp")}
              alt={translate({ id: 'gallery.yukari.alt', message: 'Yukari Yakumo' })}
              width={1200}
              height={1569}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              crossOrigin="anonymous"
              className="w-full h-auto drop-shadow-2xl transition-transform cursor-help"
              style={{
                filter: "drop-shadow(5px 15px 25px rgba(0,0,0,0.4))",
                transform: "translateY(10%)",
                pointerEvents: 'auto', // Enable clicks on the image itself
              }}
              onClick={handleImageClick}
            />

            {/* Info Pop-up (Elegant Speech Bubble) */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10, x: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute z-50 w-[260px] md:w-[280px] bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-white/40 skew-x-0"
                  style={{
                    pointerEvents: 'auto',
                    top: bubblePosition ? bubblePosition.top : '15%',
                    left: bubblePosition ? bubblePosition.left : undefined,
                    right: bubblePosition ? undefined : '5%', // Fallback if no position calc (e.g. before first click or error)
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Bubble Tail (CSS Triangle) - Pointing towards Yukari's head (Left-ish) */}
                  <div className="absolute top-[20px] -left-[12px] w-0 h-0 border-t-[10px] border-t-transparent border-r-[15px] border-r-white/90 border-b-[10px] border-b-transparent drop-shadow-[-2px_0_1px_rgba(0,0,0,0.05)]" />

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowInfo(false)}
                      className="absolute -top-1 -right-1 text-black/30 hover:text-black transition-colors"
                      aria-label={translate({ id: 'theme.common.close', message: 'Close' })}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>

                    <h3 className="font-serif font-bold text-lg text-gray-900 mb-1 leading-tight tracking-tight">
                      {getArtworkTitle(centerItem)}
                    </h3>
                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                      {getArtworkSubtitle(centerItem)}
                    </div>

                    <p className="font-serif text-[0.95rem] text-gray-700 leading-relaxed italic">
                      “{getArtworkDescription(centerItem)}”
                    </p>

                    <div className="mt-3 text-[10px] text-gray-400 font-medium text-right font-sans">
                      — {centerItem.artist}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* Navigation - Minimalist (Hidden on Desktop) */}
        <div className="absolute bottom-8 flex gap-20 z-50 md:hidden">

          <button
            type="button"
            onClick={handlePrev}
            className="group p-4 transition-all"
            aria-label={translate({ id: 'gallery.nav.prev', message: 'Previous artwork' })}
          >
            <ChevronLeft className="w-8 h-8 text-black/40 group-hover:text-black dark:text-white/40 dark:group-hover:text-white transition-colors" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="group p-4 transition-all"
            aria-label={translate({ id: 'gallery.nav.next', message: 'Next artwork' })}
          >
            <ChevronRight className="w-8 h-8 text-black/40 group-hover:text-black dark:text-white/40 dark:group-hover:text-white transition-colors" aria-hidden="true" />
          </button>
        </div>

      </main>
    </Layout>
  );
}
