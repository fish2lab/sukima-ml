import React from 'react';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
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
                                <strong><Translate id="about.profile.site">Organizer's Personal Site</Translate></strong>: <a href="https://fish2lab.com" target="_blank" rel="noopener noreferrer">fish2lab.com</a>
                            </p>
                            <p>
                                <a href="https://research.fish2lab.com" target="_blank" rel="noopener noreferrer"><Translate id="about.profile.research">研究</Translate></a>
                                {' / '}
                                <a href="https://portfolio.fish2lab.com" target="_blank" rel="noopener noreferrer"><Translate id="about.profile.portfolio">胶片作品集</Translate></a>
                                {' / '}
                                <a href="https://blog.fish2lab.com" target="_blank" rel="noopener noreferrer"><Translate id="about.profile.blog">博客</Translate></a>
                                {' / '}
                                <a href="https://github.com/fish2lab" target="_blank" rel="noopener noreferrer">GitHub</a>
                            </p>
                            <p>
                                <Translate id="about.profile.bio">
                                    北京交通大学博士生，做 LLM 安全与 agent harness：系统怎样告诉模型「这段话是谁说的」，这件事失灵时会发生什么。
                                    也拍中画幅胶片、学数学，关心学习科学和认知安全。
                                </Translate>
                            </p>
                        </section>

                        <InkRule weight="thin" length={560} seed={12} />

                        <section className={styles.block}>
                            <h2 className={styles.blockTitle}><Translate id="about.recently.title">Recently</Translate></h2>
                            <ul className={styles.plainList}>
                                <li><Translate id="about.recently.research">研究上下文窗口里的「来源」：prompt injection 为什么能得手</Translate></li>
                                <li><Translate id="about.recently.paper">写一篇立场论文：agent harness 不会被 scaling 吃掉，只会缩成一个内核</Translate></li>
                                <li>
                                    <a href="https://github.com/fish2lab/DSCodex" target="_blank" rel="noopener noreferrer">DSCodex</a>
                                    <Translate id="about.recently.dscodex">：在原版 Codex / ChatGPT 桌面端里用 DeepSeek</Translate>
                                </li>
                                <li>
                                    <Link to="/blog/bjtu-touhou-booth-film"><Translate id="about.recently.booth">北交东方摊位短片（百校天则 2026）</Translate></Link>
                                </li>
                                <li><Translate id="about.recently.film">中画幅胶片，和一个东方同人游戏的坑</Translate></li>
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
