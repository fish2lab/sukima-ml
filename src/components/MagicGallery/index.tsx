import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useHistory } from '@docusaurus/router';
import { translate } from '@docusaurus/Translate';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import { artworks, type Artwork } from '../../data/galleryData';
import {
    getArtworkIntroOriginal,
    getArtworkIntroTouhou,
    getArtworkTitle,
    getOriginalPaintingTitle,
} from '../../utils/galleryTranslations';

interface MagicGalleryProps {
    className?: string; // e.g., h-[80vh]
}

type DialogueState = 'idle' | 'intro_original' | 'intro_touhou' | 'options';

export default function MagicGallery({ className }: MagicGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(1);
    const [direction, setDirection] = useState(0);
    const [generations, setGenerations] = useState<Record<string, number>>({});

    // Dialogue System State
    const [dialogueStep, setDialogueStep] = useState<DialogueState>('idle');

    const history = useHistory();
    const { withBaseUrl } = useBaseUrlUtils();
    const shouldReduceMotion = useReducedMotion();
    const [isMobile, setIsMobile] = useState(false);
    const imageRef = React.useRef<HTMLImageElement>(null);
    const motionDuration = shouldReduceMotion ? 0.01 : 0.8;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset dialogue when changing artwork
    useEffect(() => {
        setDialogueStep('idle');
    }, [currentIndex]);

    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();
        if (dialogueStep === 'idle') {
            setDialogueStep('intro_original');
        }
    };

    const advanceDialogue = () => {
        if (dialogueStep === 'intro_original') setDialogueStep('intro_touhou');
        else if (dialogueStep === 'intro_touhou') setDialogueStep('options');
    };

    const getIndex = (index: number) => {
        const len = artworks.length;
        return ((index % len) + len) % len;
    };

    const handleNext = () => {
        setDirection(1);
        setDialogueStep('idle');
        const leftIndex = getIndex(currentIndex - 1);
        const leftId = artworks[leftIndex].id;
        setGenerations(prev => ({ ...prev, [leftId]: (prev[leftId] || 0) + 1 }));
        setCurrentIndex((prev) => prev + 1);
    };

    const handlePrev = () => {
        setDirection(-1);
        setDialogueStep('idle');
        const rightIndex = getIndex(currentIndex + 1);
        const rightId = artworks[rightIndex].id;
        setGenerations(prev => ({ ...prev, [rightId]: (prev[rightId] || 0) + 1 }));
        setCurrentIndex((prev) => prev - 1);
    };

    const centerItem = artworks[getIndex(currentIndex)];
    const leftItem = artworks[getIndex(currentIndex - 1)];
    const rightItem = artworks[getIndex(currentIndex + 1)];

    const getKey = (item: Artwork) => `${item.id}-${generations[item.id] || 0}`;

    // Tuned variants for "Gallery Walk"
    // Desktop: Frame width is 950px, so we offset by ~(50vw - 475px) + 45% of frame width to peek
    // This ensures adjacent cards peek regardless of viewport width
    // Unified Proportional Gallery Frame
    // Physical Ratio: 30(w) x 35(h) Canvas + 4 Mat + 1 Frame
    // Total: 40(w) x 45(h). Ratio: 40/45 (~0.888)
    // CSS Paddings (relative to container width):
    // Frame: 1/40 = 2.5%
    // Mat: 4/40 = 10%
    const GalleryFrame = ({
        src,
        label,
        tone,
        alt,
        width,
        height,
        color = "bg-[#1a1a1a]",
        priority = false,
    }: {
        src: string;
        label: string;
        tone: 'original' | 'fanwork';
        alt: string;
        width?: number;
        height?: number;
        color?: string;
        priority?: boolean;
    }) => (
        <div className={clsx(
            "relative w-full aspect-[40/45] flex items-center justify-center transition-transform duration-300 hover:scale-[1.01] shadow-2xl",
            color,
            "p-[2.5%]" // The Frame
        )}>
            {/* Label Tag */}
            <div className={clsx(
                "absolute -top-[5%] left-1/2 -translate-x-1/2 text-white text-[2.5cqw] md:text-[0.6vw] font-serif uppercase tracking-widest px-[4%] py-[1%] shadow-sm opacity-60 group-hover:opacity-100 transition-opacity z-20",
                tone === "original" ? "bg-white/90 text-black" : "bg-[#b71c1c]/90"
            )}>
                {label}
            </div>

            {/* Matting */}
            <div className="relative w-full h-full bg-[#fdfbf7] p-[10%] shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">
                {/* Inner Bevel Shadow */}
                <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.15)]" />

                {/* The Art */}
                <div className="relative z-10 w-full h-full flex items-center justify-center bg-white overflow-hidden">
                    <img
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        loading={priority ? 'eager' : 'lazy'}
                        decoding={priority ? 'sync' : 'async'}
                        fetchPriority={priority ? 'high' : 'low'}
                        sizes={isMobile ? '90vw' : '25vw'}
                        className="w-full h-full object-cover" // Crop to fit 30:35 ratio
                    />
                </div>
            </div>
        </div>
    );

    const cardVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? '130vw' : '-130vw',
            zIndex: 5,
            transition: { duration: motionDuration, ease: "easeInOut" as const }
        }),
        center: {
            x: 0,
            scale: 1,
            opacity: 1,
            zIndex: 30,
            filter: 'none',
            rotateY: 0,
            transition: { duration: motionDuration, ease: "easeInOut" as const },
        },
        left: {
            // Mobile: Hide/Exit to left? Actually user said "Don't show original".
            // Implementation: Mobile only shows ONE item (center). Previous/Next are logic only.
            // But if we want sliding animation on mobile, we need left/right to exist off-screen.
            x: isMobile ? '-100vw' : '-65vw',
            scale: 1,
            opacity: 1,
            zIndex: 10,
            filter: 'none',
            rotateY: 0,
            transition: { duration: motionDuration, ease: "easeInOut" as const },
        },
        right: {
            x: isMobile ? '100vw' : '65vw',
            scale: 1,
            opacity: 1,
            zIndex: 10,
            filter: 'none',
            rotateY: 0,
            transition: { duration: motionDuration, ease: "easeInOut" as const },
        },
        exit: (dir: number) => ({
            x: dir > 0 ? '-130vw' : '130vw',
            zIndex: 5,
            transition: { duration: motionDuration, ease: "easeInOut" as const }
        })
    };

    // --- Sub-Component: Art Group ---
    // Adapts to Mobile (Single) vs Desktop (Dual)
    const ArtGroup = ({ artwork, isActive = false }: { artwork: Artwork, isActive?: boolean }) => {
        const artworkTitle = getArtworkTitle(artwork);
        const originalLabel = translate({ id: 'gallery.label.original', message: '原作名画' });
        const fanworkLabel = translate({ id: 'gallery.label.fanwork', message: '东方Project同人' });

        if (isMobile) {
            // Mobile: Single Touhou Frame, 90vw total width
            return (
                <div className="w-[90vw] flex items-center justify-center">
                    <GalleryFrame
                        src={withBaseUrl(artwork.imagePath)}
                        label={fanworkLabel}
                        tone="fanwork"
                        alt={`${artworkTitle} - ${fanworkLabel}`}
                        width={artwork.imageWidth}
                        height={artwork.imageHeight}
                        priority={isActive}
                    />
                </div>
            );
        }

        // Desktop: Dual Frame, 50vw total width
        return (
            <div className="w-[50vw] flex items-center justify-between gap-4 md:gap-8 px-4 md:px-0">
                <div className="flex-1">
                    <GalleryFrame
                        src={withBaseUrl(artwork.originalImagePath)}
                        label={originalLabel}
                        tone="original"
                        alt={`${getOriginalPaintingTitle(artwork)} - ${originalLabel}`}
                        width={artwork.originalImageWidth}
                        height={artwork.originalImageHeight}
                        priority={isActive}
                    />
                </div>
                <div className="flex-1">
                    <GalleryFrame
                        src={withBaseUrl(artwork.imagePath)}
                        label={fanworkLabel}
                        tone="fanwork"
                        alt={`${artworkTitle} - ${fanworkLabel}`}
                        width={artwork.imageWidth}
                        height={artwork.imageHeight}
                        priority={isActive}
                    />
                </div>
            </div>
        );
    };

    return (
        <div
            className={clsx(
                "relative w-full overflow-hidden flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#222]",
                className
            )}
            onClick={() => setDialogueStep('idle')} // Close dialogue if clicking bg
        >

            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.1] mix-blend-multiply"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")` }}
                aria-hidden="true"
            />

            {/* Seamless Gradient removed - was causing visual issues in dark mode */}

            {/* --- The Stage --- */}
            <div className="relative w-full h-full flex items-center justify-center perspective-1500 scale-90 md:scale-100">

                {/* LAYER 1: The Carousel */}
                <div className="relative flex items-center justify-center z-20">
                    <AnimatePresence initial={false} mode='popLayout' custom={direction}>
                        {/* LEFT */}
                        <motion.div
                            key={getKey(leftItem)} custom={direction}
                            className="absolute cursor-pointer"
                            variants={cardVariants}
                            initial="enter" animate="left" exit="exit"
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        >
                            <ArtGroup artwork={leftItem} />
                        </motion.div>

                        {/* RIGHT */}
                        <motion.div
                            key={getKey(rightItem)} custom={direction}
                            className="absolute cursor-pointer"
                            variants={cardVariants}
                            initial="enter" animate="right" exit="exit"
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        >
                            <ArtGroup artwork={rightItem} />
                        </motion.div>

                        {/* CENTER */}
                        <motion.div
                            key={getKey(centerItem)} custom={direction}
                            className="absolute"
                            variants={cardVariants}
                            initial="enter" animate="center" exit="exit"
                        >
                            <ArtGroup artwork={centerItem} isActive={true} />
                        </motion.div>
                    </AnimatePresence>
                </div>



                {/* Navigation Buttons (Mobile) - Positioned higher now */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4 z-50 md:hidden">
                    <button
                        type="button"
                        onClick={handlePrev}
                        className="group p-2 bg-white/20 rounded-full backdrop-blur"
                        aria-label={translate({ id: 'gallery.nav.prev', message: 'Previous artwork' })}
                    >
                        <ChevronLeft className="text-black/60" aria-hidden="true" />
                    </button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 z-50 md:hidden">
                    <button
                        type="button"
                        onClick={handleNext}
                        className="group p-2 bg-white/20 rounded-full backdrop-blur"
                        aria-label={translate({ id: 'gallery.nav.next', message: 'Next artwork' })}
                    >
                        <ChevronRight className="text-black/60" aria-hidden="true" />
                    </button>
                </div>

            </div>

            {/* LAYER 2: Yukari Overlay (Anchored Bottom) - MOVED OUTSIDE SCALED STAGE */}
            {/* Using h-full items-end to anchor her feet to the bottom of the container */}
            <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center overflow-hidden">
                <img
                    ref={imageRef}
                    src={withBaseUrl("/img/yukari.webp")}
                    alt={translate({ id: 'gallery.yukari.alt', message: 'Yukari Yakumo' })}
                    width={1200}
                    height={1569}
                    loading="lazy"
                    decoding="async"
                    crossOrigin="anonymous"
                    className={clsx(
                        "w-auto h-[60vh] md:h-[95vh] object-contain transition-all duration-500 cursor-pointer origin-bottom",
                        dialogueStep !== 'idle' ? "brightness-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" : "brightness-100"
                    )}
                    style={{
                        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
                        // Mobile: 0 (grounded). Desktop: 25% (lowered) -> 0 (revealed)
                        transform: isMobile
                            ? (dialogueStep !== 'idle' ? "translateY(5px) scale(1.02)" : "translateY(0)")
                            : (dialogueStep !== 'idle' ? "translateY(0) scale(1.02)" : "translateY(25%)"),
                        pointerEvents: isMobile ? 'none' : 'auto',
                    }}
                    onClick={!isMobile ? handleImageClick : undefined}
                />
            </div>

            {/* Mobile Trigger Zone (Bottom 1/3) */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[35%] z-40 cursor-pointer md:hidden"
                role="button"
                tabIndex={0}
                aria-label={translate({ id: 'gallery.dialogue.open', message: 'Open Yukari dialogue' })}
                onClick={handleImageClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setDialogueStep('intro_original');
                    }
                }}
            />

            {/* LAYER 3: Galgame Dialogue Box - FIXED Bottom Overlay */}
            <AnimatePresence>
                {dialogueStep !== 'idle' && (
                    <motion.div
                        initial={{ y: 300, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 300, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 z-[100] h-[220px] bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center items-end pb-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full max-w-4xl mx-4 bg-black/80 backdrop-blur-md border-t border-white/20 p-6 rounded-t-2xl shadow-2xl">

                            {/* Character Name Tag */}
                            <div className="absolute -top-5 left-8 bg-[#b71c1c] text-white px-8 py-1 text-xl font-bold font-serif shadow-lg skew-x-[-15deg] border border-white/20">
                                <span className="skew-x-[15deg] block">
                                    {translate({ id: 'gallery.yukari.name', message: '八云 紫' })}
                                </span>
                            </div>

                            <div className="flex flex-col h-full justify-between" onClick={advanceDialogue}>
                                {/* Text Content */}
                                <div className="text-white/90 font-serif text-xl leading-relaxed mt-2 min-h-[80px]">
                                    {dialogueStep === 'intro_original' && (
                                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                            {getArtworkIntroOriginal(centerItem)}
                                        </motion.p>
                                    )}
                                    {dialogueStep === 'intro_touhou' && (
                                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                            {getArtworkIntroTouhou(centerItem)}
                                        </motion.p>
                                    )}
                                    {dialogueStep === 'options' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
                                            <p className="text-gray-300">
                                                {translate({ id: 'gallery.dialogue.nextAction', message: '接下来怎么做？' })}
                                            </p>
                                            <div className="flex flex-col md:flex-row flex-wrap gap-4 mt-2">
                                                <button type="button" className="flex-1 min-w-[200px] bg-white/10 hover:bg-[#b71c1c] border border-white/30 px-4 py-3 rounded text-left transition-colors flex items-center gap-3 group text-white"
                                                    onClick={() => history.push('/giclee')}>
                                                    <span className="bg-white/20 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">A</span>
                                                    <span className="group-hover:translate-x-1 transition-transform">
                                                        {translate({ id: 'gallery.dialogue.option.giclee', message: '鉴赏“再现”的魔术 (Giclee)' })}
                                                    </span>
                                                </button>
                                                <button type="button" className="flex-1 min-w-[200px] bg-white/10 hover:bg-[#b71c1c] border border-white/30 px-4 py-3 rounded text-left transition-colors flex items-center gap-3 group text-white"
                                                    onClick={() => history.push(centerItem.link)}>
                                                    <span className="bg-white/20 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">B</span>
                                                    <span className="group-hover:translate-x-1 transition-transform">
                                                        {translate({ id: 'gallery.dialogue.option.purchase', message: '收藏这份“境界” (Purchase)' })}
                                                    </span>
                                                </button>
                                                <button type="button" className="flex-1 min-w-[200px] bg-white/10 hover:bg-gray-800 border border-white/30 px-4 py-3 rounded text-left transition-colors flex items-center gap-3 group text-white"
                                                    onClick={() => setDialogueStep('idle')}>
                                                    <span className="bg-white/20 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">C</span>
                                                    <span className="group-hover:translate-x-1 transition-transform">
                                                        {translate({ id: 'gallery.dialogue.option.close', message: '假装无事发生 (Close)' })}
                                                    </span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Prompt */}
                                {dialogueStep !== 'options' && (
                                    <div className="text-right text-sm text-gray-500 animate-pulse">
                                        {translate({ id: 'gallery.dialogue.continue', message: '▶ 点击继续' })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
