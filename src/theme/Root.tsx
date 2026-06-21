import React, { useEffect } from 'react';
import Head from '@docusaurus/Head';

/**
 * Root 组件 - 包裹整个应用
 * 用于添加全局配置，如非阻塞字体加载
 */

// 字体 URL（已包含 display=swap）
const FONT_URL = 'https://fonts.carolyn.sh/css2?family=Intel+One+Mono:ital,wght@0,300..700;1,300..700&family=Noto+Color+Emoji&family=Noto+Sans+SC:wght@100..900&family=Noto+Sans+TC:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Noto+Serif+SC:wght@200..900&family=Noto+Serif+TC&family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Material+Symbols+Outlined&display=swap';

export default function Root({ children }: { children: React.ReactNode }) {
    // 客户端加载字体
    useEffect(() => {
        if (document.querySelector('link[data-sukima-fonts="true"]')) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FONT_URL;
        link.dataset.sukimaFonts = 'true';
        document.head.appendChild(link);
    }, []);

    return (
        <>
            <Head>
                {/* Preconnect 提前建立连接 */}
                <link rel="dns-prefetch" href="https://fonts.carolyn.sh" />
                <link rel="preconnect" href="https://fonts.carolyn.sh" crossOrigin="anonymous" />
                <link rel="preload" as="style" href={FONT_URL} />
            </Head>
            {children}
        </>
    );
}
