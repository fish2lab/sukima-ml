import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './about.module.css';

export default function About() {
    return (
        <Layout
            title={translate({ id: 'about.title', message: 'About Us' })}
            description={translate({ id: 'about.description', message: 'About Sukima Moonlight' })}
        >
            <div className={styles.pageContainer}>
                <main className={styles.mainGrid}>
                    {/* Left Column: Visual/Profile */}
                    <div className={styles.visualColumn}>
                        <div className={styles.frameWrapper}>
                            <img
                                src={useBaseUrl("/img/authors/xinxian.webp")}
                                alt="Su Xinxian"
                                className={styles.profileImage}
                                width={1000}
                                height={1000}
                                loading="eager"
                                decoding="async"
                            />
                        </div>
                        <div className={styles.captionText}>
                            <Translate id="about.creator.caption">Fig 1. The Creator, 2025.</Translate>
                        </div>
                        <div className={styles.gicleeLinkWrapper}>
                            <Link to="/giclee" className={styles.gicleeLink}>
                                <Translate id="about.giclee.link">我们选择的工艺——Giclée</Translate>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className={styles.infoColumn}>
                        <div className={styles.infoContent}>

                            <h1 className={styles.mainTitle}>
                                <Translate id="about.organizer.title">About the Organizer｜关于主催</Translate><br />
                                <span className={styles.subTitleCn}><Translate id="about.organizer.name">苏心贤</Translate></span>
                            </h1>

                            <div className={styles.artistMeta}>
                                <Translate id="about.organizer.role">Founder & Chief Developer · Photographer</Translate>
                            </div>

                            <div className={styles.dividerShort}></div>

                            <div className={styles.descriptionBlock}>
                                <h3><Translate id="about.profile.title">Profile</Translate></h3>
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
                            </div>

                            <div className={styles.descriptionBlock}>
                                <h3><Translate id="about.recently.title">Recently</Translate></h3>
                                <ul className={styles.plainList}>
                                    <li><Translate id="about.recently.agent">软件供应链漏洞检测 Agent</Translate></li>
                                    <li><Translate id="about.recently.products">东方Project制品筹备</Translate></li>
                                    <li><Translate id="about.recently.thoughts">身心调优与亲密关系思考</Translate></li>
                                    <li><Translate id="about.recently.reading">读书</Translate></li>
                                </ul>
                            </div>

                            <div className={styles.quoteBlock}>
                                <p>
                                    <Translate id="about.quote.ml">"sukima-ml stands for Sukima Moonlight, but Machine Learning? I can do that too 😉"</Translate>
                                </p>
                                <p>
                                    <Translate id="about.quote.vision">
                                        希望为东方带来更有文化底蕴的制品。
                                        上学好累，下辈子想做人见人爱的富家天才美少女。
                                    </Translate>
                                </p>
                            </div>

                            <p className={styles.smallNotice}>
                                <Translate id="about.solo.notice">* Currently, this circle is just me working solo, but I'm excited about what we'll create together!</Translate>
                            </p>

                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
}
