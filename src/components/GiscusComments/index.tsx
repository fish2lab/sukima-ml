import React, { useEffect, useRef, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';

interface GiscusCommentsProps {
  forceTheme?: 'light' | 'dark';
}

const GISCUS_ORIGIN = 'https://giscus.app';

export default function GiscusComments({ forceTheme }: GiscusCommentsProps = {}) {
  const { colorMode } = useColorMode();
  const { i18n } = useDocusaurusContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const [frameReady, setFrameReady] = useState(false);
  const giscusLang = i18n.currentLocale === 'en' ? 'en' : 'zh-CN';
  const theme = forceTheme || (colorMode === 'dark' ? 'dark' : 'light');

  // 懒加载：评论区滚动到视口附近时才注入 giscus 脚本（仅注入一次；
  // 之后的主题/语言变化走 postMessage，避免销毁 iframe 丢失草稿）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const load = () => {
      if (loadedRef.current) return;
      loadedRef.current = true;

      const script = document.createElement('script');
      script.src = `${GISCUS_ORIGIN}/client.js`;
      script.setAttribute('data-repo', 'fish2lab/sukima-ml');
      script.setAttribute('data-repo-id', 'R_kgDOQS-kXg');
      script.setAttribute('data-category', 'Announcements');
      script.setAttribute('data-category-id', 'DIC_kwDOQS-kXs4Cxyys');
      script.setAttribute('data-mapping', 'pathname');
      script.setAttribute('data-strict', '0');
      script.setAttribute('data-reactions-enabled', '1');
      script.setAttribute('data-emit-metadata', '0');
      script.setAttribute('data-input-position', 'top');
      script.setAttribute('data-theme', theme);
      script.setAttribute('data-lang', giscusLang);
      script.setAttribute('crossorigin', 'anonymous');
      script.async = true;
      container.appendChild(script);
    };

    if (!('IntersectionObserver' in window)) {
      load();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(container);
    return () => observer.disconnect();
    // 仅在挂载时设置一次；theme/giscusLang 由下方的 postMessage effect 处理
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 主题/语言切换：热更新配置，不重建 iframe
  useEffect(() => {
    if (!loadedRef.current) return;
    const iframe = containerRef.current?.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme, lang: giscusLang } } },
      GISCUS_ORIGIN
    );
  }, [theme, giscusLang]);

  // giscus 就绪后取消占位高度
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === GISCUS_ORIGIN) setFrameReady(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // 加载前预留高度，避免 iframe 注入后页面下跳（CLS）
  return <div ref={containerRef} style={frameReady ? undefined : { minHeight: '320px' }} />;
}
