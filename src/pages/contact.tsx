import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import QRCodeModal from '../components/QRCodeModal';
import GiscusComments from '../components/GiscusComments';
import { HandTitle, InkButton, LabelCard, PaperSection } from '../components/woodcut';
import ExhibitCard from '../components/pages/ExhibitCard';
import InkQuote from '../components/pages/InkQuote';
import styles from './contact.module.css';

export default function Contact() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Layout
      title={translate({ id: 'contact.title', message: '创意交流' })}
      description={translate({ id: 'contact.description', message: '与隙间月影社团取得联系，分享你的创意' })}>
      <PaperSection as="main" tone="wall" width="wide" space="md">
        <div className={styles.grid}>
          {/* 左：标题、联系方式展签、一句话 */}
          <div className={styles.left}>
            <header className={styles.head}>
              <HandTitle as="h1" size="title" className={styles.title}>
                {translate({ id: 'contact.header', message: 'Contact & Connect' })}
              </HandTitle>
              <p className={styles.sub}>
                <Translate id="contact.header.sub">创意交流与联系</Translate>
              </p>
            </header>

            <LabelCard
              as="section"
              titleAs="h2"
              title={translate({ id: 'contact.channels.title', message: 'Official Channels' })}
              nominal={[480, 380]}
              seed={41}
              className={styles.card}>
              <dl className={styles.channels}>
                <div className={styles.channel}>
                  <dt>
                    <Translate id="contact.channels.qq">QQ Group</Translate>
                  </dt>
                  <dd>
                    <InkButton size="md" aria-haspopup="dialog" onClick={() => setIsModalOpen(true)}>
                      <Translate id="contact.channels.qq.join">Click to Join / 点击加入</Translate>
                    </InkButton>
                  </dd>
                </div>
                <div className={styles.channel}>
                  <dt>
                    <Translate id="contact.channels.email">Email</Translate>
                  </dt>
                  <dd>
                    <a href="mailto:kanade271828@gmail.com">kanade271828@gmail.com</a>
                  </dd>
                </div>
                <div className={styles.channel}>
                  <dt>
                    <Translate id="contact.channels.bilibili">Bilibili</Translate>
                  </dt>
                  <dd>
                    <a href="https://space.bilibili.com/368984327" target="_blank" rel="noopener noreferrer">
                      space.bilibili.com/368984327
                    </a>
                  </dd>
                </div>
                <div className={styles.channel}>
                  <dt>
                    <Translate id="contact.channels.pixiv">Pixiv</Translate>
                  </dt>
                  <dd className={styles.muted}>
                    <Translate id="contact.channels.pixiv.coming">Coming Soon</Translate>
                  </dd>
                </div>
              </dl>
            </LabelCard>

            <InkQuote className={styles.quote} seed={23} nominal={150}>
              <p>
                <Translate id="contact.quote">
                  "We are always looking for new ideas and collaborations.
                  Whether you are an artist, a developer, or just a fan of Touhou Project,
                  we'd love to hear from you."
                </Translate>
              </p>
            </InkQuote>
          </div>

          {/* 右：投稿区展签，里面是 Giscus（主题不动） */}
          <div className={styles.right}>
            <LabelCard
              as="section"
              titleAs="h2"
              title={translate({ id: 'contact.feedback.title', message: 'Community Feedback' })}
              lines={[<Translate key="sub" id="contact.feedback.sub">创意投稿区</Translate>]}
              nominal={[680, 900]}
              seed={47}
              className={styles.card}>
              <p className={styles.desc}>
                <Translate id="contact.feedback.desc">欢迎在下方评论区分享你的创意想法、作品建议或任何有趣的点子！</Translate>
              </p>

              <ExhibitCard shadow={false} line={1.1} seed={53} nominal={[600, 110]} className={styles.tips}>
                <p className={styles.tip}>
                  <Translate id="contact.feedback.tip">💡 提示：支持 Markdown 格式，可以使用图床链接插入图片</Translate>
                </p>
                <p className={styles.tip}>
                  <Translate id="contact.feedback.imageHost">📷 推荐图床：</Translate>
                  <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer">
                    imgbb.com
                  </a>{' '}
                  <Translate id="contact.feedback.imageHost.detail">(免费无需注册)</Translate>
                </p>
              </ExhibitCard>

              <div className={styles.comments}>
                <GiscusComments />
              </div>
            </LabelCard>
          </div>
        </div>
      </PaperSection>

      <QRCodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc="/img/groupQRcode.webp"
        title={translate({ id: 'contact.modal.title', message: '扫码加入QQ群' })}
        imageAlt={translate({ id: 'qr.qq.alt', message: '隙间月影 QQ 群二维码' })}
      />
    </Layout>
  );
}
