import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.css';

/**
 * 自定义 Logo 组件 - 双品牌展示
 * 隙间月影 (指向首页) & Studio Phantasm (指向摄影网站 fcsu.dev)
 */
export default function Logo(): ReactNode {
    const logoLink = useBaseUrl('/');
    const logoImageUrl = useBaseUrl('/img/new.webp');

    return (
        <div className={styles.navbarBrand}>
            {/* Logo 图片 */}
            <Link to={logoLink} className={styles.logoLink}>
                <img
                    src={logoImageUrl}
                    alt={translate({ id: 'navbar.logo.alt', message: 'Sukima Moonlight Logo' })}
                    className={styles.logoImage}
                    width={512}
                    height={512}
                    loading="eager"
                    decoding="async"
                />
            </Link>

            {/* 双品牌标题 */}
            <div className={styles.brandContainer}>
                <Link to={logoLink} className={styles.sukimaLink}>
                    {translate({ id: 'navbar.brand.sukima', message: '隙间月影' })}
                </Link>
                <span className={styles.separator}>&</span>
                <Link to="https://fcsu.dev" className={styles.phantasmLink}>
                    Studio Phantasm
                </Link>
            </div>
        </div>
    );
}
