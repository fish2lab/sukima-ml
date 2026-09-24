import React from 'react';
import { useHistory } from '@docusaurus/router';
import { translate } from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import QRCodeModal from '../components/QRCodeModal';
import { InkButton, PaperSection } from '../components/woodcut';
import styles from './qq-group.module.css';

export default function QQGroup() {
  const [isModalOpen, setIsModalOpen] = React.useState(true);
  const history = useHistory();
  const title = translate({ id: 'qr.qq.title', message: '扫码加入QQ群' });

  const handleClose = () => {
    setIsModalOpen(false);
    // 关闭弹窗后返回上一页
    history.goBack();
  };

  return (
    <Layout
      title={translate({ id: 'qr.qq.page.title', message: '加入QQ群' })}
      description={translate({ id: 'qr.qq.page.description', message: '扫描二维码加入隙间月影社团QQ群' })}>
      {/* 票据后面是一面空墙；直接打开本页、没有上一页可回时，关掉票据还能从这里再打开 */}
      <PaperSection as="main" tone="wall" space="lg" width="narrow" className={styles.wall} innerClassName={styles.inner}>
        {!isModalOpen ? (
          <InkButton variant="solid" size="lg" onClick={() => setIsModalOpen(true)}>
            {title}
          </InkButton>
        ) : null}
      </PaperSection>
      <QRCodeModal
        isOpen={isModalOpen}
        onClose={handleClose}
        imageSrc="/img/groupQRcode.webp"
        title={title}
        imageAlt={translate({ id: 'qr.qq.alt', message: '隙间月影 QQ 群二维码' })}
      />
    </Layout>
  );
}
