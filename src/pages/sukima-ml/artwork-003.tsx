import React from 'react';
import Layout from '@theme/Layout';
import styles from './artwork-003.module.css';

// 定义产品数据
const products = [
    {
        id: 'core-14',
        type: '仅画芯',
        name: '14寸画芯',
        spec: '14 inch',
        imageSize: '30 × 35 cm', // To be filled if known, or generic
        price: 69,
        note: '满印无留白',
    },
    {
        id: 'core-40-34',
        type: '仅画芯',
        name: '40×45cm画芯',
        spec: '',
        imageSize: '34.2×40cm',
        price: 99,
        note: '侧边2.5cm留白',
    },
    {
        id: 'core-50-45',
        type: '仅画芯',
        name: '45×50cm画芯',
        spec: '',
        imageSize: '43.4×45 cm',
        price: 139,
        note: '侧边2.5cm留白',
    },
    {
        id: 'framed-14',
        type: '装裱款',
        name: '装裱款 14寸',
        spec: '40x45cm Frame',
        imageSize: '30 × 35 cm',
        price: 288,
        note: '含40x45卡纸和相框',
        isRecommended: true,
        tag: 'Recommended',
        description: '300PPi，画面精细，载体小巧有质感',
    },
    {
        id: 'framed-40-34',
        type: '装裱款',
        name: '装裱款 34.2×40cm',
        spec: '50x45cm Frame',
        imageSize: '34.2×40 cm',
        price: 349,
        note: '含50x45卡纸和相框',
    },
];

export default function Artwork003() {
    // 默认按照价格从低到高排序，所以products[0]是最低价69
    const [selectedProduct, setSelectedProduct] = React.useState(products[0]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handlePurchaseClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const currentPrice = selectedProduct.price;
    const currentImage = '/img/artworks/artwork-003.webp';

    // Construct buy page URL with query parameters
    const buyPageUrl = `/buy?product=${encodeURIComponent('蓬莱宫娥')}&variant=${encodeURIComponent('Standard')}&spec=${encodeURIComponent(selectedProduct.name + (selectedProduct.spec ? ` (${selectedProduct.spec})` : ''))}&price=${currentPrice}`;

    return (
        <Layout
            title="《蓬莱宫娥》"
            description="辉夜&永远亭：我不是嫦娥"
        >
            <div className={styles.pageContainer}>
                <main className={styles.mainGrid}>

                    {/* 左侧：艺术展示区 */}
                    <div className={styles.visualColumn}>
                        <div className={styles.cardContainer}>
                            <div className={`${styles.artworkCard} ${styles.cardActive}`}>
                                <div className={styles.frameWrapper}>
                                    <img
                                        src={currentImage}
                                        alt="蓬莱宫娥"
                                        width={1200}
                                        height={1404}
                                        fetchPriority="high"
                                        decoding="async"
                                        className={styles.artworkImage}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.captionText}>
                            Fig 1. Las Meninas (The Maids of Honour) × Kaguya & Eientei, 2025.
                        </div>
                    </div>

                    {/* 右侧：信息交互区 */}
                    <div className={styles.infoColumn}>
                        <div className={styles.infoContent}>

                            <h1 className={styles.mainTitle}>
                                Las Meninas × Touhou Project<br />
                                <span className={styles.subTitleCn}>蓬莱宫娥</span>
                            </h1>

                            <div className={styles.artistMeta}>
                                <span className={styles.badge} style={{ marginRight: 10, backgroundColor: '#6a1b9a' }}>New Arrival</span>
                                <span>Artist: amibazh</span>
                            </div>

                            {/* 动态价格显示 */}
                            <div className={styles.priceTag}>
                                ¥ {currentPrice}.00
                            </div>

                            <div className={styles.dividerShort}></div>

                            <div className={styles.quoteBlock}>
                                <p>
                                    哈内姆勒 Photo RAG 308g (Hahnemühle)<br />
                                    博物馆级装裱
                                    <br />
                                    <a href="/giclee" className={styles.learnMoreLink}>点击了解更多工艺细节 →</a>
                                    <br /><br />
                                    画师主页：<a href="https://www.pixiv.net/users/1500528" target="_blank" rel="noopener noreferrer" style={{ color: '#6a1b9a', textDecoration: 'underline' }}>Pixiv @amibazh</a>
                                </p>
                            </div>

                            {/* 交互式价格表 */}
                            <div className={styles.specsContainer}>
                                <h3 className={styles.specTitle}>1. 选择规格 (Select Size)</h3>
                                <div className={styles.priceList}>
                                    {products.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className={`
                                                ${styles.priceItem} 
                                                ${item.isRecommended ? styles.recommendedItem : ''}
                                                ${selectedProduct.id === item.id ? styles.selected : ''}
                                            `}
                                            onClick={() => setSelectedProduct(item)}
                                        >
                                            <div className={styles.itemMainInfo}>
                                                <span className={styles.sizeLabel}>
                                                    {item.name} {item.spec && <span style={{ fontSize: '0.8em', color: '#666' }}>({item.spec})</span>}
                                                </span>
                                                <span className={styles.priceValue}>
                                                    ¥ {item.price}
                                                </span>
                                            </div>
                                            <div className={styles.itemTagRow}>
                                                <span className={styles.itemDescription}>
                                                    {item.type} · {item.imageSize !== 'Unknown' && `画面: ${item.imageSize} · `}{item.note}
                                                </span>
                                            </div>
                                            {(item.tag || item.description) && (
                                                <div className={styles.itemTagRow} style={{ marginTop: '4px' }}>
                                                    {item.tag && <span className={styles.badge} style={{ marginRight: '8px' }}>{item.tag}</span>}
                                                    {item.description && <span className={styles.itemDescription} style={{ display: 'inline', color: '#e65100' }}>{item.description}</span>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: '40px' }}>
                                <button className={styles.purchaseBtn} onClick={handlePurchaseClick}>
                                    收藏永恒 / Drink the Elixir
                                </button>
                                <p className={styles.smallNotice}>* 点击按钮扫码，备注规格</p>
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
                                    <img src={currentImage} alt="蓬莱宫娥" width={1200} height={1404} loading="lazy" decoding="async" className={styles.modalImage} />
                                </div>
                                <div className={styles.modalInfoSection}>
                                    <div>
                                        <h2 className={styles.modalTitle}>确认选购信息</h2>
                                        <div className={styles.modalDetailRow}>
                                            <span className={styles.modalDetailLabel}>作品:</span>
                                            <span>蓬莱宫娥 (Las Meninas)</span>
                                        </div>
                                        <div className={styles.modalDetailRow}>
                                            <span className={styles.modalDetailLabel}>规格:</span>
                                            <span>{selectedProduct.name}</span>
                                        </div>
                                        <div className={styles.modalDetailRow}>
                                            <span className={styles.modalDetailLabel}>配置:</span>
                                            <span>{selectedProduct.note}</span>
                                        </div>
                                        <div className={styles.modalPrice}>
                                            ¥ {currentPrice}.00
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
