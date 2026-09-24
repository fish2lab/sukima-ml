import React, { type ReactNode } from 'react';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import type { WrapperProps } from '@docusaurus/types';
import SukimaScope from '@site/src/components/woodcut/SukimaScope';

type Props = WrapperProps<typeof LayoutType>;

/**
 * 所有页面（含博客、404）都经过这里：东方部分的页面在 <html> 上挂 data-sukima（见 SukimaScope），
 * 木刻画风的全局样式 src/css/woodcut.css 全部挂在这个标记下；Studio Phantasm（/ph）不挂，外观不变。
 */
export default function LayoutWrapper(props: Props): ReactNode {
  return (
    <>
      <SukimaScope />
      <Layout {...props} />
    </>
  );
}
