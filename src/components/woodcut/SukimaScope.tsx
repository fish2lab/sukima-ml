import React, { useLayoutEffect, type ReactNode } from 'react';
import Head from '@docusaurus/Head';
import { useIsSukima } from './scope';

/**
 * 东方部分的页面在 <html> 上挂 data-sukima。src/theme/Layout 里渲染一次，页面里不用再放。
 *
 * - SSR：经 @docusaurus/Head（react-helmet）写进静态 HTML 的 <html data-sukima="">，首帧就有，不闪。
 * - 客户端换页：helmet 在下一帧才改 <html>，所以另外在 layout effect 里同步改一次（绘制前），
 *   从东方页面跳到 /ph 时不会有一帧用错样式。
 * - 放在 Layout 里而不是 Root：Root 拿到的是路由刚跳过去的新地址，而旧页面要等新页面的代码块加载完才换下来；
 *   Layout 在页面里面，拿到的是正在显示的那个地址。
 */
export default function SukimaScope(): ReactNode {
  const on = useIsSukima();
  useLayoutEffect(() => {
    document.documentElement.toggleAttribute('data-sukima', on);
  }, [on]);
  return on ? (
    <Head>
      <html data-sukima="" />
    </Head>
  ) : null;
}
