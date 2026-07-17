import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './digital-001.module.css';

export default function DigitalDownload001() {
    return (
        <Layout
            title="Digital Collection - Portrait of the Gap Sage"
            description="Digital Download for Portrait of the Gap Sage"
        >
            <div className={styles.pageContainer}>
                <div className={styles.mainWrapper}>

                    {/* Header */}
                    <header className={styles.headerSection}>
                        <h1 className={styles.mainTitle}>Digital Collection</h1>
                        <div className={styles.subTitle}>数字典藏 · 戴珍珠耳环的八云紫</div>
                    </header>

                    {/* Preview Grid */}
                    <div className={styles.previewGrid}>
                        <div className={styles.previewCard}>
                            <img src="/img/digital_Resource/artwork-001.webp" alt="Portrait of the Gap Sage" width={1200} height={1404} fetchPriority="high" decoding="async" className={styles.previewImage} />
                            <div className={styles.cardLabel}>Portrait of the Gap Sage</div>
                        </div>
                    </div>

                    {/* Download Section */}
                    <section className={styles.downloadSection}>
                        <h2 className={styles.downloadTitle}>Download Original Assets</h2>
                        <div className={styles.downloadButtons}>
                            <a href="/img/digital_Resource/artwork-001.jpg" download className={styles.downloadBtn}>
                                <span>Original Artwork (JPG)</span>
                                <span className={styles.fileSize}>JPG · 9.5 MB</span>
                            </a>
                        </div>
                    </section>

                    {/* Letter of Thanks */}
                    <section className={styles.letterSection}>
                        <div className={styles.letterTitle}>A Letter from the Organizer</div>
                        <div className={styles.letterContent}>
                            <p>致每一位热爱东方与艺术的朋友：</p>
                            <p>
                                这是《隙间月影 Sukima Moonlight》社团的<strong>第一份制品</strong>。
                            </p>
                            <p>
                                它的诞生，源于一个简单的脑洞：“如果维米尔生活在幻想乡，他会画谁？”<br />
                                八云紫，这位穿梭于隙间的大贤者，她的神秘与优雅，与《戴珍珠耳环的少女》中那回眸一瞥的神韵不谋而合。
                            </p>
                            <p>
                                特别感谢画师 <strong><a href="https://space.bilibili.com/308844850" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>真菌_isomer</a></strong> 老师。
                                是他精湛的笔触，将这个跨越时空的幻想变成了现实。
                            </p>
                            <p>
                                将这份“初心”以数字典藏的形式分享出来，既是对画师的致敬，也是对所有支持者的感谢。
                                无论你是购买了实体微喷，还是仅仅下载了这张图片，你都是这个社团成长历史的一部分。
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
