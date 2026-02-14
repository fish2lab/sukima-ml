import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Translate, { translate } from '@docusaurus/Translate';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useHistory, useLocation } from '@docusaurus/router';

import { artworks } from '../../data/galleryData';

// --- Constants ---
const YUKARI_BASE_WIDTH_PX = 750; // Increased to match new artwork width (500px / 0.666)

export default function MagicGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [direction, setDirection] = useState(0);
  const [generations, setGenerations] = useState<Record<string, number>>({});

  const history = useHistory();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [bubblePosition, setBubblePosition] = useState<{ top: string | number, left: string | number } | null>(null);

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

  // Pixel-perfect click detection & Dynamic Positioning
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imageRef.current;
    if (!img) return;

    // Create a canvas to check pixel transparency
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match the image's intrinsic size
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    canvas.width = w;
    canvas.height = h;

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);

    // Calculate click position relative to the image element
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale coordinates to match intrinsic size
    const scaleX = w / rect.width;
    const scaleY = h / rect.height;
    const pixelX = Math.floor(x * scaleX);
    const pixelY = Math.floor(y * scaleY);

    try {
      const pixelData = ctx.getImageData(0, 0, w, h).data;

      // Check clicked pixel alpha
      const clickedPixelIndex = (pixelY * w + pixelX) * 4;
      const alpha = pixelData[clickedPixelIndex + 3];

      // If opaque enough (e.g., > 10), trigger the info
      if (alpha > 10) {
        e.stopPropagation();

        // --- Calculate Dynamic Bounding Box for "Top Right" ---
        let minY = 0;
        let maxX = w;

        // Find Top-most opaque pixel (minY)
        // Scan each row
        topScan: for (let py = 0; py < h; py++) {
          for (let px = 0; px < w; px++) {
            if (pixelData[(py * w + px) * 4 + 3] > 10) {
              minY = py;
              break topScan;
            }
          }
        }

        // Find Right-most opaque pixel (maxX)
        // Scan each col from right
        rightScan: for (let px = w - 1; px >= 0; px--) {
          for (let py = 0; py < h; py++) {
            if (pixelData[(py * w + px) * 4 + 3] > 10) {
              maxX = px;
              break rightScan;
            }
          }
        }

        // Convert intrinsic coords back to CSS display coords
        // The container is relative, img is inside.
        // We want the bubble at (maxX, minY) relative to the container.

        // CSS Coordinates
        const cssTop = (minY / scaleY);
        const cssLeft = (maxX / scaleX);

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
      console.error("Failed to get pixel data:", err);
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

  const toggleInfo = (e) => {
    e.stopPropagation();
    setShowInfo(!showInfo);
  };

  // Helper to get key with generation
  const getKey = (item: typeof centerItem) => `${item.id}-${generations[item.id] || 0}`;

  // Tuned variants for "Gallery Walk" - Responsive & Spatial
  const cardVariants = {
    // Hidden "waiting" state for entering items
    enter: (dir: number) => ({
      x: dir > 0 ? '100vw' : '-100vw', // If moving Next (1), enters from Right (100vw). If Prev (-1), enters from Left.
      scale: 0.6,
      opacity: 0,
      zIndex: 5,
      rotateY: dir > 0 ? -45 : 45,
      transition: { duration: 1, ease: "easeInOut" as const }
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      zIndex: 30,
      filter: 'brightness(1)',
      rotateY: 0,
      transition: { duration: 1, ease: "easeInOut" as const },
    },
    left: {
      x: isMobile ? '-120%' : '-45vw',
      scale: 0.8,
      opacity: 0.6,
      zIndex: 10,
      filter: 'brightness(0.5) blur(2px)',
      rotateY: isMobile ? 0 : 30,
      transition: { duration: 1, ease: "easeInOut" as const },
    },
    right: {
      x: isMobile ? '120%' : '45vw',
      scale: 0.8,
      opacity: 0.6,
      zIndex: 10,
      filter: 'brightness(0.5) blur(2px)',
      rotateY: isMobile ? 0 : -30,
      transition: { duration: 1, ease: "easeInOut" as const },
    },
    // Exiting state for wrapping items
    exit: (dir: number) => ({
      x: dir > 0 ? '-100vw' : '100vw', // If moving Next (1), exits to Left (-100vw). If Prev (-1), exits to Right.
      scale: 0.6,
      opacity: 0,
      zIndex: 5,
      rotateY: dir > 0 ? 45 : -45,
      transition: { duration: 1, ease: "easeInOut" as const }
    })
  };

  // --- Sub-Component: The Realistic Frame ---
  const GalleryFrame = ({ artwork, isActive = false, onClick }: { artwork: any, isActive?: boolean, onClick?: React.MouseEventHandler<HTMLDivElement> }) => (
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
              src={useBaseUrl(artwork.imagePath)}
              alt={artwork.title}
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
      title={translate({ id: 'gallery.title', message: 'Magic Gallery' })}
      description={translate({ id: 'gallery.description', message: 'Explore our collection of Touhou Project characters merged with classic art masterpieces.' })}
    >
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": "Magic Gallery",
            "description": "A collection of Giclée art prints combining Touhou Project characters with classic masterpieces.",
            "publisher": {
              "@type": "Organization",
              "name": "Sukima Moonlight"
            }
          })}
        </script>
      </Head>
      {/* Whiter background, less grey */}
      <main
        className="relative w-full h-[100dvh] bg-[#fafafa] dark:bg-[#222] overflow-hidden flex flex-col items-center justify-center"
        onClick={() => setShowInfo(false)} // Close info if clicking background
      >

        {/* --- Background Atmosphere --- */}
        {/* Finer texture, lower opacity for subtle grain */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
          }}
        />
        {/* Subtle, softer spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.03)_60%,_rgba(0,0,0,0.1)_100%)] pointer-events-none" />


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
              src={useBaseUrl("/img/yukari.webp")}
              alt="Yukari Yakumo"
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
                      onClick={() => setShowInfo(false)}
                      className="absolute -top-1 -right-1 text-black/30 hover:text-black transition-colors"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>

                    <h3 className="font-serif font-bold text-lg text-gray-900 mb-1 leading-tight tracking-tight">
                      {translate({ id: centerItem.titleId, message: centerItem.title })}
                    </h3>
                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                      {translate({ id: centerItem.subtitleId, message: centerItem.subtitle })}
                    </div>

                    <p className="font-serif text-[0.95rem] text-gray-700 leading-relaxed italic">
                      “{translate({ id: centerItem.descId, message: centerItem.description })}”
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

          <button onClick={handlePrev} className="group p-4 transition-all">
            <ChevronLeft className="w-8 h-8 text-black/40 group-hover:text-black dark:text-white/40 dark:group-hover:text-white transition-colors" />
          </button>
          <button onClick={handleNext} className="group p-4 transition-all">
            <ChevronRight className="w-8 h-8 text-black/40 group-hover:text-black dark:text-white/40 dark:group-hover:text-white transition-colors" />
          </button>
        </div>

      </main>
    </Layout>
  );
}
