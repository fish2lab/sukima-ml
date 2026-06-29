import React from 'react';
import { useHistory } from '@docusaurus/router';
import { translate } from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import QRCodeModal from '../components/QRCodeModal';

export default function QQGroup() {
  const [isModalOpen, setIsModalOpen] = React.useState(true);
  const history = useHistory();

  const handleClose = () => {
    setIsModalOpen(false);
    // 关闭弹窗后返回上一页
    history.goBack();
  };

  return (
    <Layout
      title={translate({ id: 'qr.qq.page.title', message: '加入QQ群' })}
      description={translate({ id: 'qr.qq.page.description', message: '扫描二维码加入隙间月影社团QQ群' })}>
      <QRCodeModal 
        isOpen={isModalOpen}
        onClose={handleClose}
        imageSrc="/img/groupQRcode.webp"
        title={translate({ id: 'qr.qq.title', message: '扫码加入QQ群' })}
        imageAlt={translate({ id: 'qr.qq.alt', message: '隙间月影 QQ 群二维码' })}
      />
    </Layout>
  );
}
