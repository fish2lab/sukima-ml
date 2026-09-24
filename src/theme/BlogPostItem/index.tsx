import React, { type CSSProperties } from 'react';
import OriginalBlogPostItem from '@theme-original/BlogPostItem';
import type BlogPostItemType from '@theme/BlogPostItem';
import type { WrapperProps } from '@docusaurus/types';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import { LabelCard } from '@site/src/components/woodcut';
import { barMark, markUrl } from '@site/src/components/pages/marks';
import CommentsSection from '../../components/CommentsSection';
import styles from './styles.module.css';

type Props = WrapperProps<typeof BlogPostItemType>;

/** 正文引用块左边那道木刻粗墨线（CSS 遮罩，颜色由 background 决定；文章 Markdown 不用改） */
const QUOTE_BAR: CSSProperties = { ['--pages-quote-bar' as string]: markUrl(barMark(37, 240, 6)) };

/** 列表里每张卡片的毛边形状不同：按文章地址算一个 seed */
function seedOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return 100 + h;
}

export default function BlogPostItem(props: Props) {
  // isBlogPostPage 由 BlogPostProvider 提供（文章页为 true，列表/标签页为 false），
  // 替代原先基于路径正则的判断（会误伤 /blog/tags-xxx 这类 slug）。
  // frontMatter 来自当前文章上下文，支持在文章头部配置 comments: false 关闭评论。
  const { metadata, frontMatter, isBlogPostPage } = useBlogPost();
  const commentsEnabled = (frontMatter as { comments?: boolean } | undefined)?.comments !== false;

  // 列表、标签、作者页：每篇文章是一张展签，进入视口时从左边翻出来
  if (!isBlogPostPage) {
    return (
      <LabelCard as="div" className={styles.card} seed={seedOf(metadata.permalink)} nominal={[760, 380]} style={QUOTE_BAR}>
        <OriginalBlogPostItem {...props} />
      </LabelCard>
    );
  }

  // 文章页：720 左右的版心，评论区外面包一张展签
  return (
    <div className={styles.post} style={QUOTE_BAR}>
      <OriginalBlogPostItem {...props} />
      {commentsEnabled && (
        <CommentsSection
          title="文章评论"
          description="欢迎分享你的想法和见解"
        />
      )}
    </div>
  );
}
