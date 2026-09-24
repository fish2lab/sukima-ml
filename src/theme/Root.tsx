import React, { useEffect } from 'react';
import Head from '@docusaurus/Head';
// 东方部分的手写楷体：霞鹜文楷屏幕版，常规字重（R）这一份，按 unicode-range 分片的 woff2 由 webpack 打包进 build/assets/fonts/，
// 不走 CDN；浏览器只下载页面上用到的分片。字体族名 'LXGW WenKai Screen R'，只在 html[data-sukima] 下使用（src/css/woodcut.css）。
import 'lxgw-wenkai-screen-webfont/lxgwwenkaiscreenr.css';

/**
 * Root 组件 - 包裹整个应用
 * 用于添加全局配置，如非阻塞字体加载
 */

// 字体 URL（已包含 display=swap）。Studio Phantasm（/ph）和导航栏 Logo 用这一套，东方部分改用上面的霞鹜文楷
const FONT_URL = 'https://fonts.carolyn.sh/css2?family=Intel+One+Mono:ital,wght@0,300..700;1,300..700&family=Noto+Color+Emoji&family=Noto+Sans+SC:wght@100..900&family=Noto+Sans+TC:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Noto+Serif+SC:wght@200..900&family=Noto+Serif+TC&family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap';

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
                {/* 字体文件走 CORS 连接，样式表走非 CORS 连接，两条都要预热 */}
                <link rel="preconnect" href="https://fonts.carolyn.sh" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://fonts.carolyn.sh" />
                <link rel="preload" as="style" href={FONT_URL} />
            </Head>
            {children}
        </>
    );
}
