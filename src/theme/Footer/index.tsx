import React, { useState } from 'react';
import Footer from '@theme-original/Footer';
import type FooterType from '@theme/Footer';
import type { WrapperProps } from '@docusaurus/types';
import { translate } from '@docusaurus/Translate';
import QRCodeModal from '../../components/QRCodeModal';

export default function FooterWrapper(props: WrapperProps<typeof FooterType>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 拦截 QQ群链接的点击事件。
  // 捕获阶段监听：React 的点击处理挂在根节点上，冒泡到 document 时 <Link> 已经跳转了。
  // 英文站链接是 /en/qq-group，所以按结尾匹配；带修饰键或中键点击照常在新标签页打开。
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement;
      const link = target.closest('a[href$="/qq-group"]');

      if (link) {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <>
      <Footer {...props} />
      <QRCodeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc="/img/groupQRcode.webp"
        title={translate({ id: 'qr.qq.title', message: '扫码加入QQ群' })}
        imageAlt={translate({ id: 'qr.qq.alt', message: '隙间月影 QQ 群二维码' })}
      />
    </>
  );
}
