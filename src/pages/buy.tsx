import React from 'react';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import styles from './buy.module.css';

import { useLocation } from '@docusaurus/router';

export default function BuyPage() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const product = searchParams.get('product');
    const variant = searchParams.get('variant');
    const spec = searchParams.get('spec');
    const price = searchParams.get('price');

    const hasPreFill = product && variant && spec;

    return (
        <Layout
            title={translate({ id: 'buy.title', message: '购买指引 / Purchase Guide' })}
            description={translate({ id: 'buy.description', message: '隙间月影制品购买指引与付款方式' })}
        >
            <div className={styles.pageContainer}>
                <div className={styles.contentWrapper}>
                    <h1 className={styles.title}>
                        <Translate id="buy.heading">奉纳信仰 / OFFER FAITH</Translate>
                    </h1>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Translate id="buy.payment.title">1. 扫码支付 / Payment</Translate>
                        </h2>
                        <div className={styles.paymentMethods}>
                            <div className={styles.qrCard}>
                                <img
                                    src="/img/alipay_receiveMoney.webp"
                                    alt={translate({ id: 'buy.payment.alipay.alt', message: 'Alipay payment QR code' })}
                                    className={styles.qrImage}
                                    width={922}
                                    height={964}
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className={styles.qrLabel}><Translate id="buy.payment.alipay">支付宝 (Alipay)</Translate></div>
                            </div>
                            <div className={styles.qrCard}>
                                <img
                                    src="/img/IMG_0944.webp"
                                    alt={translate({ id: 'buy.payment.wechat.alt', message: 'WeChat Pay payment QR code' })}
                                    className={styles.qrImage}
                                    width={1200}
                                    height={1182}
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className={styles.qrLabel}><Translate id="buy.payment.wechat">微信支付 (WeChat)</Translate></div>
                            </div>
                        </div>
                        {hasPreFill && price && (
                            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '1.2rem', fontWeight: 'bold', color: '#b71c1c' }}>
                                <Translate id="buy.payment.amount" values={{ price }}>
                                    {'待支付金额: ¥ {price}.00'}
                                </Translate>
                            </div>
                        )}
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Translate id="buy.contact.title">2. 联系方式 / Contact</Translate>
                        </h2>
                        <div className={styles.contactInfo}>
                            <p><Translate id="buy.contact.emailFirst">推荐发邮件给我，使用你的任意邮箱，包括QQ邮箱均可，确认信息和快递单号都会通过邮件回信给出。</Translate></p>
                            <p><Translate id="buy.contact.afterPayment">发送购买邮件后，请添加社团交流群。我会以邮件回复确认订单并提供快递运输信息，若遇到问题请邮件联系或在群中发起私聊联系主催。</Translate></p>

                            <div className={styles.emailList}>
                                <span className={`${styles.emailItem} ${styles.primary}`}>
                                    <Translate id="buy.contact.to">To: kanade271828@icloud.com (推荐/Recommended)</Translate>
                                </span>
                                <span className={`${styles.emailItem} ${styles.secondary}`}>
                                    <Translate id="buy.contact.cc">Cc: kanade271828@gmail.com (备选/Backup)</Translate>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Translate id="buy.template.title">3. 邮件填写模板 / Email Template</Translate>
                        </h2>
                        <div className={styles.templateBox}>
                            <span className={styles.copyHint}><Translate id="buy.template.copyHint">请复制下方内容 / Copy below</Translate></span>

                            {hasPreFill ? (
                                <>
                                    <p><strong><Translate id="buy.template.subjectLabel">邮件标题：</Translate></strong><Translate id="buy.template.prefill.subject" values={{ product, spec }}>{'【{product}购买】你的QQ号 + {spec}'}</Translate></p>
                                    <p><strong><Translate id="buy.template.bodyLabel">邮件正文：</Translate></strong></p>
                                    <p><Translate id="buy.template.specs">购买规格</Translate></p>
                                    <p><Translate id="buy.template.product" values={{ product }}>{'作品：{product}'}</Translate></p>
                                    <p><Translate id="buy.template.variant" values={{ variant }}>{'款式：{variant}'}</Translate></p>
                                    <p><Translate id="buy.template.spec" values={{ spec }}>{'规格：{spec}'}</Translate></p>
                                    <p><Translate id="buy.template.quantityOne">数量：1</Translate></p>
                                    <p>--------------------------------</p>
                                    <p><Translate id="buy.template.shipping">收货信息：</Translate></p>
                                    <p><Translate id="buy.template.name">姓名：</Translate></p>
                                    <p><Translate id="buy.template.phone">电话：</Translate></p>
                                    <p><Translate id="buy.template.address">地址：</Translate></p>
                                </>
                            ) : (
                                <>
                                    <p><strong><Translate id="buy.template.subjectLabel">邮件标题：</Translate></strong><Translate id="buy.template.default.subject">【某某制品购买】你的QQ号+尺寸</Translate></p>
                                    <p><strong><Translate id="buy.template.bodyLabel">邮件正文：</Translate></strong></p>
                                    <p><Translate id="buy.template.specs">购买规格</Translate></p>
                                    <p><Translate id="buy.template.size">尺寸：（例如：14寸）</Translate></p>
                                    <p><Translate id="buy.template.style">样式：（需要留白 / 无边框满印）</Translate></p>
                                    <p><Translate id="buy.template.quantity">数量：</Translate></p>
                                    <p><Translate id="buy.template.shipping">收货信息：</Translate></p>
                                    <p><Translate id="buy.template.contactLine">姓名&联系电话&收货地址</Translate></p>
                                </>
                            )}

                            <div className={styles.importantNote}>
                                <Translate id="buy.template.note.payment">* 请务必在邮件附件中上传“付款记录截图”，截图需要能看清“商户单号”或“交易单号”（Order ID），以便主催核对入账。</Translate>
                                <br />
                                <Translate id="buy.template.note.dm">* 如若选择添加好友私信购买，也请给出上述信息。</Translate>
                            </div>
                        </div>
                    </div>

                    <div className={styles.signature}>
                        <Translate id="buy.signature.sincerely">Sincerely,</Translate><br />
                        <Translate id="buy.signature.name">苏心贤 (主催)</Translate>
                    </div>

                </div>
            </div>
        </Layout>
    );
}
