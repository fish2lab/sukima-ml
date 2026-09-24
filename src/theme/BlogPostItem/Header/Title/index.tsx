import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import Title from '@theme-original/BlogPostItem/Header/Title';
import type TitleType from '@theme/BlogPostItem/Header/Title';
import type {WrapperProps} from '@docusaurus/types';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import {HandTitle} from '@site/src/components/woodcut';
import styles from './styles.module.css';

type Props = WrapperProps<typeof TitleType>;

/**
 * 文章页：标题用 HandTitle 逐字写出（h1，SSR 输出全文）。
 * 列表、标签、作者页：原版的 h2 链接（字体已是手写楷体），样式由 BlogPostItem 的展签卡片负责。
 */
export default function TitleWrapper(props: Props): ReactNode {
  const {metadata, isBlogPostPage} = useBlogPost();
  if (!isBlogPostPage) return <Title {...props} />;
  return (
    <HandTitle as="h1" size="title" per={0.035} className={clsx(styles.title, props.className)}>
      {metadata.title}
    </HandTitle>
  );
}
