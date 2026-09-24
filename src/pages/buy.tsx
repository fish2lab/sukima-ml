import React, { type ReactNode } from 'react';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { useLocation } from '@docusaurus/router';
import { HandTitle, InkFrame, InkRule, PaperSection, RoughBorder } from '@site/src/components/woodcut';
import { StepTitle } from '@site/src/components/artwork/HandMarks';
import Ticket from '@site/src/components/artwork/Ticket';
import styles from './buy.module.css';

export default function BuyPage(): ReactNode {
    const location = useLocation();
    // URL 参数在水合之后才读：静态 HTML 里没有查询串，首帧和服务端输出一致
    const isBrowser = useIsBrowser();
    const searchParams = new URLSearchParams(isBrowser ? location.search : '');

    const product = searchParams.get('product');
    const variant = searchParams.get('variant');
    const spec = searchParams.get('spec');
    const price = searchParams.get('price');
    // 作品页传来的是数字（68、6.5）；统一写成两位小数，不再在文案里硬拼 .00
    const priceText = price && Number.isFinite(Number(price)) ? Number(price).toFixed(2) : (price ?? '');

    const prefill = product && variant && spec ? { product, variant, spec } : null;

    return (
        <Layout
            title={translate({ id: 'buy.title', message: '购买指引 / Purchase Guide' })}
            description={translate({ id: 'buy.description', message: '隙间月影制品购买指引与付款方式' })}
        >
            <PaperSection tone="wall" width="narrow" space="md" className={styles.page}>
                <HandTitle as="h1" size="title" className={styles.title}>
                    {translate({ id: 'buy.heading', message: '奉纳信仰 / OFFER FAITH' })}
                </HandTitle>

                {prefill ? (
                    <Ticket
                        className={styles.slip}
                        head={<p className={styles.slipHead}>{translate({ id: 'buy.ticket.title', message: '订单', description: '购买页顶部小票据的抬头（票据列出从作品页带过来的作品、款式、规格、金额）' })}</p>}
                    >
                        <ul className={`${styles.slipRows} wc-mono`}>
                            <li>{translate({ id: 'buy.template.product', message: '作品：{product}' }, { product: prefill.product })}</li>
                            <li>{translate({ id: 'buy.template.variant', message: '款式：{variant}' }, { variant: prefill.variant })}</li>
                            <li>{translate({ id: 'buy.template.spec', message: '规格：{spec}' }, { spec: prefill.spec })}</li>
                        </ul>
                        {price ? (
                            <p className={`${styles.slipAmount} wc-mono`}>
                                {translate({ id: 'buy.payment.amount', message: '待支付金额: ¥ {price}' }, { price: priceText })}
                            </p>
                        ) : null}
                    </Ticket>
                ) : null}

                <section className={styles.step}>
                    <StepTitle text={translate({ id: 'buy.payment.title', message: '1. 扫码支付 / Payment' })} />
                    <div className={styles.qrRow}>
                        <InkFrame size="sm" seed={33} nominal={[220, 230]} className={styles.qr} caption={<Translate id="buy.payment.alipay">支付宝 (Alipay)</Translate>}>
                            <img
                                src="/img/alipay_receiveMoney.webp"
                                alt={translate({ id: 'buy.payment.alipay.alt', message: 'Alipay payment QR code' })}
                                width={922}
                                height={964}
                                decoding="async"
                            />
                        </InkFrame>
                        <InkFrame size="sm" seed={34} nominal={[220, 230]} className={styles.qr} caption={<Translate id="buy.payment.wechat">微信支付 (WeChat)</Translate>}>
                            <img
                                src="/img/IMG_0944.webp"
                                alt={translate({ id: 'buy.payment.wechat.alt', message: 'WeChat Pay payment QR code' })}
                                width={1200}
                                height={1182}
                                decoding="async"
                            />
                        </InkFrame>
                    </div>
                </section>

                <InkRule weight="thin" dry={0.25} seed={101} className={styles.rule} />

                <section className={styles.step}>
                    <StepTitle text={translate({ id: 'buy.contact.title', message: '2. 联系方式 / Contact' })} />
                    <p className={styles.para}><Translate id="buy.contact.emailFirst">推荐发邮件给我，使用你的任意邮箱，包括QQ邮箱均可，确认信息和快递单号都会通过邮件回信给出。</Translate></p>
                    <p className={styles.para}><Translate id="buy.contact.afterPayment">发送购买邮件后，请添加社团交流群。我会以邮件回复确认订单并提供快递运输信息，若遇到问题请邮件联系或在群中发起私聊联系主催。</Translate></p>
                    <ul className={styles.emails}>
                        <li className={styles.primary}>
                            <RoughBorder variant="line" weight={1.8} amp={0.45} seed={103} nominal={[560, 52]} className={styles.emailEdge} />
                            <span className={styles.emailText}><Translate id="buy.contact.to">To: kanade271828@icloud.com (推荐/Recommended)</Translate></span>
                        </li>
                        <li className={styles.secondary}>
                            <Translate id="buy.contact.cc">Cc: kanade271828@gmail.com (备选/Backup)</Translate>
                        </li>
                    </ul>
                </section>

                <InkRule weight="thin" dry={0.25} seed={107} className={styles.rule} />

                <section className={styles.step}>
                    <StepTitle text={translate({ id: 'buy.template.title', message: '3. 邮件填写模板 / Email Template' })} />
                    <div className={styles.templateBox} data-wc-tone="paper">
                        <RoughBorder variant="fill" amp={0.9} freq={30} seed={109} nominal={[720, 520]} className={styles.templateEdge} />
                        <span className={styles.copyHint}><Translate id="buy.template.copyHint">请复制下方内容 / Copy below</Translate></span>

                        {prefill ? (
                            <>
                                <p><strong><Translate id="buy.template.subjectLabel">邮件标题：</Translate></strong><Translate id="buy.template.prefill.subject" values={{ product: prefill.product, spec: prefill.spec }}>{'【{product}购买】你的QQ号 + {spec}'}</Translate></p>
                                <p><strong><Translate id="buy.template.bodyLabel">邮件正文：</Translate></strong></p>
                                <p><Translate id="buy.template.specs">购买规格</Translate></p>
                                <p><Translate id="buy.template.product" values={{ product: prefill.product }}>{'作品：{product}'}</Translate></p>
                                <p><Translate id="buy.template.variant" values={{ variant: prefill.variant }}>{'款式：{variant}'}</Translate></p>
                                <p><Translate id="buy.template.spec" values={{ spec: prefill.spec }}>{'规格：{spec}'}</Translate></p>
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
                </section>

                <p className={styles.signature}>
                    <Translate id="buy.signature.sincerely">Sincerely,</Translate><br />
                    <Translate id="buy.signature.name">苏心贤 (主催)</Translate>
                </p>
            </PaperSection>
        </Layout>
    );
}
