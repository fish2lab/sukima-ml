import React from 'react';
import Layout from '@theme/Layout';
import styles from './artwork-002.module.css';

// 定义产品数据
const products = [
    {
        id: 'digital-set',
        type: '数字典藏',
        name: 'Digital Set (3 PNGs)',
        spec: '4K+ Resolution',
        imageSize: 'Original Source',
        priceA: 6.48,
        priceB: 6.48,
        note: '含3张高清原图',
        isDigital: true
    },
    {
        id: 'core-8',
        type: '仅画芯',
        name: '8寸 (套装)',
        spec: '15 × 20 cm',
        imageSize: '15 × 20 cm',
        priceA: 45,
        priceB: 45,
        note: '满印，无白边',
        priceNote: '(2张)'
    },
    {
        id: 'core-16',
        type: '仅画芯',
        name: '16寸',
        spec: '30 × 40 cm',
        imageSize: '30 × 40 cm',
        priceA: 70,
        priceB: 78,
        note: '满印，无白边'
    },
    {
        id: 'core-18',
        type: '仅画芯',
        name: '18寸',
        spec: '35 × 45 cm',
        imageSize: '30 × 40 cm',
        priceA: 85,
        priceB: 90,
        note: '四周留白2.5cm'
    },
    {
        id: 'framed-14',
        type: '画框尺寸: 16寸',
        name: '14寸 & 装裱',
        spec: '',
        imageSize: '25 × 33.4 cm',
        priceA: 210,
        priceB: 215,
        note: '含卡纸'
    },
    {
        id: 'framed-16',
        type: '画框尺寸: 40 × 50 cm',
        name: '16寸 & 装裱',
        spec: '',
        imageSize: '30 × 40 cm',
        priceA: 280,
        priceB: 288,
        note: '含20寸卡纸'
    },
    {
        id: 'framed-20',
        type: '画框尺寸: 60 × 50 cm',
        name: '20寸 & 装裱',
        spec: '',
        imageSize: '50 × 37.5 cm',
        priceA: 368,
        priceB: 378,
        note: '含卡纸'
    }
];

export default function Artwork002() {
    const [activeVariant, setActiveVariant] = React.useState<'A' | 'B'>('A');
    const [selectedProduct, setSelectedProduct] = React.useState(products[2]); // Default to 16寸 (index 2 now)
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const isDigital = selectedProduct.isDigital;

    const currentPrice = activeVariant === 'A' ? selectedProduct.priceA : selectedProduct.priceB;
    const variantName = activeVariant === 'A' ? 'The Weight of Knowledge' : 'The Forbidden Knowledge';
    const variantImage = activeVariant === 'A' ? '/img/artworks/Variant_A.webp' : '/img/artworks/Variant_B.webp';

    const handlePurchaseClick = () => {
        if (isDigital) {
            window.location.href = '/sukima-ml/digital-002';
            return;
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const [isSpecial, setIsSpecial] = React.useState(false);

    // Special logic for 8-inch set or Digital Set: it includes both variants
    const isSet = selectedProduct.id === 'core-8' || isDigital;

    // Determine the effective variant B name and image based on special state
    const variantBName = isSpecial ? 'The Forbidden Knowledge (Special)' : 'The Forbidden Knowledge';
    const variantBImage = isSpecial ? '/img/artworks/Variant_special.webp' : '/img/artworks/Variant_B.webp';

    // If it's the set, we display a combined name or logic
    // Note: Set currently assumes standard B. If special is allowed in set, logic needs adjustment.
    // Assuming Set = Standard A + Standard B for now unless requested otherwise.
    const displayVariantName = isSet
        ? (isDigital ? 'All Variants (A + B + Special)' : (isSpecial ? 'The Weight of Knowledge + The Forbidden Knowledge (Special)' : 'The Weight of Knowledge + The Forbidden Knowledge'))
        : (activeVariant === 'A' ? 'The Weight of Knowledge' : variantBName);

    const displayVariantCode = isSet
        ? (isDigital ? 'Digital Collection' : (isSpecial ? 'Set (A + Special)' : 'Set (A + B)'))
        : (activeVariant === 'A' ? 'A' : (isSpecial ? 'Special' : 'B'));

    const currentImage = activeVariant === 'A' ? '/img/artworks/Variant_A.webp' : variantBImage;

    // Construct buy page URL with query parameters
    const buyPageUrl = `/buy?product=The Bookworm&variant=${encodeURIComponent(displayVariantCode)}&spec=${encodeURIComponent(selectedProduct.name + (selectedProduct.spec ? ` (${selectedProduct.spec})` : ''))}&price=${currentPrice}`;

    return (
        <Layout
            title="《The Bookworm》"
            description="帕秋莉&小恶魔同人"
        >
            <div className={styles.pageContainer}>
                <main className={styles.mainGrid}>

                    {/* 左侧：艺术展示区 */}
                    <div className={styles.visualColumn}>
                        <div className={styles.cardContainer}>
                            {/* Card A: The Weight of Knowledge */}
                            <div
                                className={`${styles.artworkCard} ${activeVariant === 'A' || isSet ? styles.cardActive : styles.cardInactiveLeft}`}
                                style={isSet ? { transform: 'translateX(-10%) scale(0.95)', zIndex: 10 } : {}}
                                onClick={() => setActiveVariant('A')}
                            >
                                <div className={styles.frameWrapper}>
                                    <img
                                        src="/img/artworks/Variant_A.webp"
                                        alt="The Weight of Knowledge"
                                        width={1200}
                                        height={1600}
                                        fetchPriority="high"
                                        decoding="async"
                                        className={styles.artworkImage}
                                    />
                                </div>
                                <div className={styles.cardLabel}>Variant A: The Weight of Knowledge</div>
                            </div>

                            {/* Card B: The Forbidden Knowledge */}
                            <div
                                className={`${styles.artworkCard} ${activeVariant === 'B' || isSet ? styles.cardActive : styles.cardInactiveRight}`}
                                style={isSet ? { transform: 'translateX(10%) scale(0.95)', zIndex: 10 } : {}}
                                onClick={() => setActiveVariant('B')}
                            >
                                <div className={styles.frameWrapper}>
                                    <img
                                        src={variantBImage}
                                        alt={variantBName}
                                        width={1200}
                                        height={1607}
                                        fetchPriority="high"
                                        decoding="async"
                                        className={styles.artworkImage}
                                    />
                                </div>
                                <div className={styles.cardLabel}>Variant B: {variantBName}</div>
                            </div>
                        </div>

                        <div className={styles.captionText}>
                            Fig 2. The Bookworm × {isSet ? 'Both Variants' : displayVariantName}, 2025.
                        </div>
                    </div>

                    {/* 右侧：信息交互区 */}
                    <div className={styles.infoColumn}>
                        <div className={styles.infoContent}>

                            <h1 className={styles.mainTitle}>
                                The Bookworm × The Pachouli<br />
                                <span className={styles.subTitleCn}>书虫与知识的魔女</span>
                            </h1>

                            <div className={styles.artistMeta}>
                                <span className={styles.badge}>Dual Version</span>
                                <span style={{ marginLeft: '10px' }}>Touhou Project · Giclée</span>
                            </div>

                            {/* 动态价格显示 */}
                            <div className={styles.priceTag}>
                                ¥ {Number.isInteger(currentPrice) ? `${currentPrice}.00` : currentPrice}
                                {selectedProduct.priceNote && <span className={styles.priceNote}> {selectedProduct.priceNote}</span>}
                            </div>

                            <div className={styles.dividerShort}></div>

                            <div className={styles.quoteBlock}>
                                <p>
                                    收藏级画芯（EPSON 9580 & 哈内姆勒摄影纸）<br />
                                    博物馆级装裱（铝合金框+卡纸+影像级高透亚克力面板+铝皮复合背板）
                                    <br />
                                    <a href="/giclee" className={styles.learnMoreLink}>点击了解更多工艺细节 →</a>
                                    <br /><br />
                                    画师主页：<a href="https://space.bilibili.com/520458415" target="_blank" rel="noopener noreferrer" style={{ color: '#6a1b9a', textDecoration: 'underline' }}>Bilibili @青未Q</a>
                                    <br /><br />
                                    <strong>点击画作或下方选项可切换异画版本。</strong>
                                </p>
                            </div>

                            {/* 交互式价格表 */}
                            <div className={styles.specsContainer}>
                                <h3 className={styles.specTitle}>1. 选择规格 (Select Size)</h3>
                                <div className={styles.priceList}>
                                    {products.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`
                                                ${styles.priceItem} 
                                                ${selectedProduct.id === item.id ? styles.selected : ''}
                                            `}
                                            onClick={() => setSelectedProduct(item)}
                                        >
                                            <div className={styles.itemMainInfo}>
                                                <span className={styles.sizeLabel}>
                                                    {item.name} {item.spec && <span style={{ fontSize: '0.8em', color: '#666' }}>({item.spec})</span>}
                                                </span>
                                                <span className={styles.priceValue}>
                                                    ¥ {activeVariant === 'A' ? item.priceA : item.priceB}
                                                </span>
                                            </div>
                                            <div className={styles.itemTagRow}>
                                                <span className={styles.itemDescription}>
                                                    {item.type} · 画面: {item.imageSize} · {item.note}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 款式选择 */}
                            <div className={styles.specsContainer} style={{ marginTop: '30px' }}>
                                <h3 className={styles.specTitle}>2. 选择款式 (Select Variant)</h3>
                                <div className={styles.variantToggleContainer}>
                                    <div
                                        className={`${styles.variantOption} ${activeVariant === 'A' || isSet ? styles.variantSelected : ''}`}
                                        onClick={() => !isSet && setActiveVariant('A')}
                                        style={isSet ? { cursor: 'default', borderColor: '#000' } : {}}
                                    >
                                        <span className={styles.variantLabel}>Variant A</span>
                                        <span className={styles.variantName}>The Weight of Knowledge</span>
                                    </div>
                                    <div
                                        className={`${styles.variantOption} ${activeVariant === 'B' || isSet ? styles.variantSelected : ''}`}
                                        onClick={() => !isSet && setActiveVariant('B')}
                                        style={isSet ? { cursor: 'default', borderColor: '#000' } : {}}
                                    >
                                        <span className={styles.variantLabel}>Variant B</span>
                                        <span className={styles.variantName}>The Forbidden Knowledge</span>
                                    </div>
                                </div>

                                {/* Special Version Toggle for Variant B */}
                                {((!isSet && activeVariant === 'B') || isSet) && (
                                    <div
                                        className={`${styles.specialToggle} ${isSpecial ? styles.specialToggleActive : ''}`}
                                        onClick={() => setIsSpecial(!isSpecial)}
                                    >
                                        <div className={styles.checkbox}>
                                            {isSpecial && <span className={styles.checkMark}>✓</span>}
                                        </div>
                                        <span className={styles.specialLabel}>
                                            裸足版本 (Barefoot Version)
                                        </span>
                                    </div>
                                )}

                                {isSet && !isDigital && <p className={styles.smallNotice} style={{ marginTop: '10px', color: '#e65100' }}>* 8寸套装包含 A款 与 B款 各一张</p>}
                                {isDigital && <p className={styles.smallNotice} style={{ marginTop: '10px', color: '#6a1b9a' }}>* 数字典藏包含所有款式的高清原图 (A + B + Special)</p>}
                            </div>

                            <div style={{ marginTop: '40px' }}>
                                <button className={styles.purchaseBtn} onClick={handlePurchaseClick}>
                                    {isDigital ? '获取数字版 / GET DIGITAL COPY' : '学习知识 / ACQUIRE KNOWLEDGE'}
                                </button>
                                <p className={styles.smallNotice}>* 点击按钮扫码，备注款式与规格</p>
                            </div>

                        </div>
                    </div>
                </main>

                {/* Purchase Modal */}
                {isModalOpen && (
                    <div className={styles.modalOverlay} onClick={handleCloseModal}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <button className={styles.modalCloseBtn} onClick={handleCloseModal}>×</button>
                            <div className={styles.modalGrid}>
                                <div className={styles.modalImageSection}>
                                    {isSet ? (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <img src="/img/artworks/Variant_A.webp" alt="Variant A" width={1200} height={1600} loading="lazy" decoding="async" className={styles.modalImage} style={{ width: '50%' }} />
                                            <img src={variantBImage} alt="Variant B" width={1200} height={1607} loading="lazy" decoding="async" className={styles.modalImage} style={{ width: '50%' }} />
                                        </div>
                                    ) : (
                                        <img src={currentImage} alt={displayVariantName} loading="lazy" decoding="async" className={styles.modalImage} />
                                    )}
                                </div>
                                <div className={styles.modalInfoSection}>
                                    <div>
                                        <h2 className={styles.modalTitle}>确认选购信息</h2>
                                        <div className={styles.modalDetailRow}>
                                            <span className={styles.modalDetailLabel}>作品:</span>
                                            <span>The Bookworm</span>
                                        </div>
                                        <div className={styles.modalDetailRow}>
                                            <span className={styles.modalDetailLabel}>款式:</span>
                                            <span>{displayVariantCode}</span>
                                        </div>
                                        <div className={styles.modalDetailRow}>
                                            <span className={styles.modalDetailLabel}>规格:</span>
                                            <span>{selectedProduct.name}</span>
                                        </div>
                                        <div className={styles.modalDetailRow}>
                                            <span className={styles.modalDetailLabel}>尺寸:</span>
                                            <span>{selectedProduct.spec || selectedProduct.imageSize}</span>
                                        </div>
                                        <div className={styles.modalPrice}>
                                            ¥ {Number.isInteger(currentPrice) ? `${currentPrice}.00` : currentPrice}
                                        </div>
                                    </div>
                                    <a href={buyPageUrl} className={styles.confirmPurchaseBtn}>
                                        前往购买页面 / Proceed to Buy
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
