import React from 'react';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Caption, HandTitle, InkButton, InkFrame, InkRule, LabelCard, PaperSection } from '../components/woodcut';
import InkQuote from '../components/pages/InkQuote';
import styles from './about.module.css';

export default function About() {
    return (
        <Layout
            title={translate({ id: 'about.title', message: 'About Us' })}
            description={translate({ id: 'about.description', message: 'About Sukima Moonlight' })}
        >
            <PaperSection as="main" tone="wall" width="wide" space="md">
                <div className={styles.grid}>
                    {/* 左：挂在墙上的主催照片 + 图注展签（桌面跟着滚动停在视口里） */}
                    <div className={styles.visual}>
                        <div className={styles.frameBox}>
                            <InkFrame
                                hang
                                swing
                                size="md"
                                seed={27}
                                nominal={[340, 340]}
                                caption={<Caption size="sm">{translate({ id: 'about.creator.caption', message: 'Fig 1. The Creator, 2025.' })}</Caption>}
                                className={styles.frame}
                            >
                                <img
                                    src={useBaseUrl('/img/authors/xinxian.webp')}
                                    alt="Su Xinxian"
                                    width={1000}
                                    height={1000}
                                    loading="eager"
                                    decoding="async"
                                />
                            </InkFrame>
                        </div>
                        <InkButton to="/giclee" size="md">
                            <Translate id="about.giclee.link">我们选择的工艺——Giclée</Translate>
                        </InkButton>
                    </div>

                    {/* 右（手机在下）：一张大展签 */}
                    <LabelCard as="article" nominal={[620, 1000]} seed={35} className={styles.card}>
                        <header className={styles.head}>
                            <HandTitle as="h1" size="title" delay={0.5} className={styles.title}>
                                {translate({ id: 'about.organizer.title', message: 'About the Organizer｜关于主催' })}
                            </HandTitle>
                            <p className={styles.name}>
                                <Translate id="about.organizer.name">苏心贤</Translate>
                            </p>
                            <p className={styles.role}>
                                <Translate id="about.organizer.role">Founder & Chief Developer · Photographer</Translate>
                            </p>
                        </header>

                        <InkRule weight="thin" length={560} seed={11} />

                        <section className={styles.block}>
                            <h2 className={styles.blockTitle}><Translate id="about.profile.title">Profile</Translate></h2>
                            <p>
                                <strong><Translate id="about.profile.site">Organizer's Personal Site</Translate></strong>: <a href="https://fcsu.dev" target="_blank" rel="noopener noreferrer">fcsu.dev</a>
                            </p>
                            <p>
                                <Translate id="about.profile.bio">
                                    BJTU Incoming PhD Student, Computer Science ➡️ Cybersecurity.
                                    I study software supply chain vulnerabilities and constitutional AI in multicultural contexts.
                                    I care deeply about learning science and cognitive security.
                                </Translate>
                            </p>
                        </section>

                        <InkRule weight="thin" length={560} seed={12} />

                        <section className={styles.block}>
                            <h2 className={styles.blockTitle}><Translate id="about.recently.title">Recently</Translate></h2>
                            <ul className={styles.plainList}>
                                <li><Translate id="about.recently.agent">软件供应链漏洞检测 Agent</Translate></li>
                                <li><Translate id="about.recently.products">东方Project制品筹备</Translate></li>
                                <li><Translate id="about.recently.thoughts">身心调优与亲密关系思考</Translate></li>
                                <li><Translate id="about.recently.reading">读书</Translate></li>
                            </ul>
                        </section>

                        <InkRule weight="thin" length={560} seed={13} />

                        <InkQuote className={styles.quote} seed={19} nominal={170}>
                            <p>
                                <Translate id="about.quote.ml">"sukima-ml stands for Sukima Moonlight, but Machine Learning? I can do that too 😉"</Translate>
                            </p>
                            <p>
                                <Translate id="about.quote.vision">
                                    希望为东方带来更有文化底蕴的制品。
                                    上学好累，下辈子想做人见人爱的富家天才美少女。
                                </Translate>
                            </p>
                        </InkQuote>

                        <p className={styles.notice}>
                            <Translate id="about.solo.notice">* Currently, this circle is just me working solo, but I'm excited about what we'll create together!</Translate>
                        </p>
                    </LabelCard>
                </div>
            </PaperSection>
        </Layout>
    );
}
