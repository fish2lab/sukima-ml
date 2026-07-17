import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './digital-002.module.css';

export default function DigitalDownload002() {
    return (
        <Layout
            title="Digital Collection - The Bookworm"
            description="Digital Download for The Bookworm × The Pachouli"
        >
            <div className={styles.pageContainer}>
                <div className={styles.mainWrapper}>

                    {/* Header */}
                    <header className={styles.headerSection}>
                        <h1 className={styles.mainTitle}>Digital Collection</h1>
                        <div className={styles.subTitle}>数字典藏 · The Bookworm × The Pachouli</div>
                    </header>

                    {/* Preview Grid */}
                    <div className={styles.previewGrid}>
                        <div className={styles.previewCard}>
                            <img src="/img/artworks/Variant_A.webp" alt="Variant A" width={1200} height={1600} fetchPriority="high" decoding="async" className={styles.previewImage} />
                            <div className={styles.cardLabel}>Variant A: The Weight of Knowledge</div>
                        </div>
                        <div className={styles.previewCard}>
                            <img src="/img/artworks/Variant_B.webp" alt="Variant B" width={1200} height={1607} fetchPriority="high" decoding="async" className={styles.previewImage} />
                            <div className={styles.cardLabel}>Variant B: The Forbidden Knowledge</div>
                        </div>
                        <div className={styles.previewCard}>
                            <img src="/img/artworks/Variant_special.webp" alt="Special" width={1200} height={1607} fetchPriority="high" decoding="async" className={styles.previewImage} />
                            <div className={styles.cardLabel}>Special: Barefoot Version</div>
                        </div>
                    </div>

                    {/* Download Section */}
                    <section className={styles.downloadSection}>
                        <h2 className={styles.downloadTitle}>Download Original Assets</h2>
                        <div className={styles.downloadButtons}>
                            <a href="/img/digital_Resource/Variant_A.png" download className={styles.downloadBtn}>
                                <span>Variant A (Original)</span>
                                <span className={styles.fileSize}>PNG · 18.7 MB</span>
                            </a>
                            <a href="/img/digital_Resource/Variant_B.png" download className={styles.downloadBtn}>
                                <span>Variant B (Original)</span>
                                <span className={styles.fileSize}>PNG · 23.8 MB</span>
                            </a>
                            <a href="/img/digital_Resource/Variant_special.png" download className={styles.downloadBtn}>
                                <span>Special Version</span>
                                <span className={styles.fileSize}>PNG · 23.8 MB</span>
                            </a>
                        </div>
                    </section>

                    {/* Letter of Thanks */}
                    <section className={styles.letterSection}>
                        <div className={styles.letterTitle}>A Letter from the Organizer</div>
                        <div className={styles.letterContent}>
                            <p>致每一位热爱东方与艺术的朋友：</p>
                            <p>
                                感谢你对《隙间月影 Sukima Moonlight》的关注。作为一个刚刚起步、单人运营的同人社团，你的每一次点击和浏览对我来说都弥足珍贵。
                            </p>
                            <p>
                                将高清数字原图直接放出，是一个很大胆的决定。在传统的商业逻辑里，这似乎是在“自断财路”。
                                但我始终相信，东方Project的魅力在于分享与共创，而真正喜爱这些作品的朋友，一定懂得其背后的价值。
                            </p>
                            <p>
                                这三幅作品，凝聚了画师青未Q老师精湛的笔触，也承载了我对“名画 × 东方”这一概念的无数次推敲与打磨。
                                如果你喜欢它们，希望你能将它们保存下来，作为壁纸、收藏，或是仅仅在某个时刻打开欣赏。
                            </p>
                            <p>
                                如果条件允许，也希望你能通过下方的“奉纳幻想”支持社团的运营。这笔资金将全部用于填补美术资源的成本，以及支持后续更多精彩作品的诞生。
                            </p>
                            <p>
                                愿幻想乡的月光，常伴你左右。
                            </p>
                            <p>
                                感谢各位的支持，让更多的世界名画能够浸入幻想的染缸，又再次穿越幻想与现实的界线，来到你我身边。
                            </p>
                        </div>
                        <div className={styles.signature}>
                            —— 苏心贤 (Su Xinxian)
                        </div>
                    </section>

                    {/* Payment Section */}
                    <section className={styles.paymentSection}>
                        <div className={styles.gentlemanAgreement}>
                            奉纳幻想 / Offering to Phantasm
                        </div>

                        <div className={styles.priceTag}>
                            ¥ 6.48
                        </div>

                        <p style={{ color: '#666' }}>
                            相当于食堂的一顿早餐，或是给大小姐的一杯红茶钱。
                        </p>

                        <div className={styles.qrContainer}>
                            <div className={styles.qrCard}>
                                <img src="/img/alipay_receiveMoney.webp" alt="Alipay" width={922} height={964} loading="lazy" decoding="async" className={styles.qrImage} />
                                <div className={styles.qrLabel}>支付宝 (Alipay)</div>
                            </div>
                            <div className={styles.qrCard}>
                                <img src="/img/wechat_receiveMoney.webp" alt="WeChat" width={924} height={966} loading="lazy" decoding="async" className={styles.qrImage} />
                                <div className={styles.qrLabel}>微信支付 (WeChat)</div>
                            </div>
                        </div>

                        <div className={styles.freeNotice}>
                            <strong>✨ 特别说明：</strong> 如果你已经购买了（或打算购买）本作品的实物版（艺术微喷），
                            <br />
                            这份数字典藏是<strong>免费赠送</strong>给你的，请勿重复付款。
                        </div>
                    </section>

                </div>
            </div>
        </Layout>
    );
}
