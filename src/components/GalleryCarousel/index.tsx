import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import styles from './styles.module.css';

export interface ArtworkItem {
  id: string;
  title: string;
  description: string;
  originalPainting: string;
  touhouCharacter: string;
  originalImagePath: string; // 原作图片路径
  imagePath: string; // 同人作品图片路径
  imageAlt: string;
  artist?: string;
  createdDate?: string;
  link?: string; // Optional link for the fanart
  badge?: string; // Optional badge (e.g. Visual Mockup)
}

export interface GalleryCarouselProps {
  artworks: ArtworkItem[];
  autoPlay?: boolean;
  interval?: number;
}

// Reusable Frame Component
const FramedImage = ({ src, alt, onError, isLoading = false }: {
  src: string;
  alt: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  isLoading?: boolean;
}) => (
  <div className="w-full h-full bg-[#111] p-[3%] flex ring-1 ring-white/10 ring-inset shadow-md">
    <div className="w-full h-full bg-[#fdfbf7] p-[10%] shadow-[inset_0_1px_4px_rgba(0,0,0,0.4)] flex flex-col relative overflow-hidden">
      <div className="relative w-full h-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)] bg-gray-200">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">Loading...</div>
        ) : (
          <>
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover block"
              onError={onError}
              loading="lazy"
            />
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] pointer-events-none" />
          </>
        )}
      </div>
    </div>
  </div>
);

export default function GalleryCarousel(props: GalleryCarouselProps): ReactNode {
  const { artworks } = props;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate the maximum index (one artwork at a time)
  const maxIndex = Math.max(0, artworks.length - 1);

  // Navigate to the next artwork
  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Navigate to the previous artwork
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Handle empty artworks array
  if (!artworks || artworks.length === 0) {
    return (
      <div className={styles.galleryCarousel}>
        <div className={styles.emptyState}>
          <p>暂无作品展示</p>
        </div>
      </div>
    );
  }

  const currentArtwork = artworks[currentIndex];
  const showControls = artworks.length > 1;

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, maxIndex]);

  return (
    <div
      className={styles.galleryCarousel}
      role="region"
      aria-label="作品展示轮播"
    >
      <div className={styles.carouselContainer}>
        {/* Left navigation button */}
        {showControls && (
          <button
            className={styles.carouselButton}
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="上一组作品"
            type="button"
          >
            ←
          </button>
        )}

        {/* Artwork display area - 左侧原作，右侧同人 */}
        <div
          className={styles.artworkContainer}
          aria-live="polite"
          aria-atomic="true"
        >
          <ArtworkComparisonCard artwork={currentArtwork} />
        </div>

        {/* Right navigation button */}
        {showControls && (
          <button
            className={styles.carouselButton}
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            aria-label="下一组作品"
            type="button"
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}

// Artwork Comparison Card Component - 左侧原作，右侧同人
interface ArtworkComparisonCardProps {
  artwork: ArtworkItem;
}

function ArtworkComparisonCard({ artwork }: ArtworkComparisonCardProps): ReactNode {
  const [originalError, setOriginalError] = useState(false);
  const [fanartError, setFanartError] = useState(false);

  // 判断是否有链接
  const hasOriginalLink = artwork.originalPainting === '戴珍珠耳环的少女';
  // Use explicit link if provided, otherwise fallback to hardcoded check
  const fanartLink = artwork.link || (artwork.touhouCharacter.includes('戴珍珠耳环的17岁少女') ? '/artwork-001' : null);

  return (
    <div className={styles.comparisonCard}>
      {/* 左侧：原作 */}
      <div className={styles.imageSection}>
        {hasOriginalLink ? (
          <a
            href="https://zh.wikipedia.org/wiki/%E6%88%B4%E7%8F%8D%E7%8F%A0%E8%80%B3%E7%92%B0%E7%9A%84%E5%B0%91%E5%A5%B3#"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.imageContainer}
          >
            {originalError ? (
              <div className={styles.imagePlaceholder}>
                <p>原作图片加载失败</p>
              </div>
            ) : (
              <FramedImage
                src={artwork.originalImagePath}
                alt={`原作：${artwork.originalPainting}`}
                onError={() => setOriginalError(true)}
              />
            )}
          </a>
        ) : (
          <div className={styles.imageContainer}>
            {originalError ? (
              <div className={styles.imagePlaceholder}>
                <p>原作图片加载失败</p>
              </div>
            ) : (
              <FramedImage
                src={artwork.originalImagePath}
                alt={`原作：${artwork.originalPainting}`}
                onError={() => setOriginalError(true)}
              />
            )}
          </div>
        )}
        <div className={styles.imageLabel}>
          <span className={styles.labelTag}>原作</span>
          <h4 className={styles.imageName}>{artwork.originalPainting}</h4>
        </div>
      </div>

      {/* 中间：箭头或分隔符 */}
      <div className={styles.separator}>
        <span className={styles.arrow}>→</span>
      </div>

      {/* 右侧：同人作品 */}
      <div className={styles.imageSection}>
        {fanartLink ? (
          <a
            href={fanartLink}
            className={styles.imageContainer}
          >
            {fanartError ? (
              <div className={styles.imagePlaceholder}>
                <p>同人作品图片加载失败</p>
              </div>
            ) : (
              <>
                <FramedImage
                  src={artwork.imagePath}
                  alt={artwork.imageAlt}
                  onError={() => setFanartError(true)}
                />
                {artwork.badge && (
                  <span className={styles.badgeOverlay}>{artwork.badge}</span>
                )}
              </>
            )}
          </a>
        ) : (
          <div className={styles.imageContainer}>
            {fanartError ? (
              <div className={styles.imagePlaceholder}>
                <p>同人作品图片加载失败</p>
              </div>
            ) : (
              <>
                <FramedImage
                  src={artwork.imagePath}
                  alt={artwork.imageAlt}
                  onError={() => setFanartError(true)}
                />
                {artwork.badge && (
                  <span className={styles.badgeOverlay}>{artwork.badge}</span>
                )}
              </>
            )}
          </div>
        )}
        <div className={styles.imageLabel}>
          <span className={styles.labelTag}>同人创作</span>
          <h4 className={styles.imageName}>{artwork.touhouCharacter}</h4>
        </div>
      </div>

      {/* 底部：作品信息 */}
      <div className={styles.artworkInfo}>
        <h3 className={styles.artworkTitle}>{artwork.title}</h3>
        <p className={styles.artworkDescription}>{artwork.description}</p>
      </div>
    </div>
  );
}
