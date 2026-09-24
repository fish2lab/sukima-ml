import React from 'react';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import { HandTitle, InkButton, InkRule, PaperSection } from '../components/woodcut';
import styles from './copyright.module.css';

export default function Copyright() {
    return (
        <Layout
            title={translate({
                id: 'copyright.title',
                message: '版权声明',
                description: 'The title of the copyright page',
            })}
            description="Copyright Declaration for Sukima Moonlight and Studio Phantasm"
        >
            <PaperSection as="main" tone="paper" width="narrow" space="md" innerClassName={styles.inner}>
                <article className={styles.article}>
                    <header className={styles.header}>
                        <HandTitle as="h1" size="title" className={styles.title}>
                            {translate({ id: 'copyright.header', message: '版权声明 / Copyright Declaration' })}
                        </HandTitle>
                        <p className={`${styles.lastUpdated} wc-mono`}>
                            <Translate id="copyright.lastUpdated">Last Updated: January 2026</Translate>
                        </p>
                    </header>

                    <InkRule weight="bold" dry={0.2} length={680} seed={31} />

                    <section className={styles.section}>
                        <HandTitle as="h2" size="section" className={styles.sectionTitle}>
                            {translate({ id: 'copyright.ownership', message: '权利归属 / Ownership' })}
                        </HandTitle>
                        <p>
                            <Translate id="copyright.ownership.text1">
                                本网站（sukima-ml.club）刊载的所有内容，除特别注明外，著作权均归苏心贤｜Fischer Su所有。具体归属如下：
                            </Translate>
                        </p>
                        <ul className={styles.ownerList}>
                            <li>
                                <strong><Translate id="copyright.artworks">美术制品</Translate></strong>
                                <Translate id="copyright.artworks.owner">隙间月影｜Sukima Moonlight</Translate>
                            </li>
                            <li>
                                <strong><Translate id="copyright.photography">摄影作品</Translate></strong>
                                <Translate id="copyright.photography.owner">心像图片社｜Studio Phantasm</Translate>
                            </li>
                        </ul>
                        <p>
                            <Translate id="copyright.ownership.photodetail">
                                所有摄影作品均内嵌EXIF元数据及数字指纹，属于《著作权法》第四十九条规定的“权利管理信息”。任何删除或篡改该信息的行为均构成违法。
                            </Translate>
                        </p>
                    </section>

                    <InkRule weight="thin" length={680} seed={32} />

                    <section className={styles.section}>
                        <HandTitle as="h2" size="section" className={styles.sectionTitle}>
                            {translate({ id: 'copyright.declaration', message: '声明 / Declaration' })}
                        </HandTitle>
                        <p>
                            <Translate id="copyright.declaration.text1">
                                依据《中华人民共和国著作权法》及《信息网络传播权保护条例》，未经著作权人书面许可，任何单位或个人不得以任何方式（包括但不限于复制、截图、深度链接、镜像、AI训练素材投喂）使用上述内容。
                            </Translate>
                        </p>
                        <p>
                            <Translate id="copyright.declaration.text2">
                                本网站保留对侵犯信息网络传播权及署名权的行为追究法律责任的权利。
                            </Translate>
                        </p>
                        <InkRule weight="hair" dry={0.45} length={680} seed={33} className={styles.innerRule} />
                        <p className={styles.english}>
                            <em>
                                <Translate id="copyright.declaration.english">
                                    All photography works on this site are protected under the Copyright Law of the PRC. Unauthorized use is strictly prohibited.
                                </Translate>
                            </em>
                        </p>
                    </section>

                    <InkRule weight="thin" length={680} seed={34} />

                    <div className={styles.backRow}>
                        <InkButton to="/" size="lg">
                            <Translate id="copyright.back">Back to Home</Translate>
                        </InkButton>
                    </div>
                </article>
            </PaperSection>
        </Layout>
    );
}
