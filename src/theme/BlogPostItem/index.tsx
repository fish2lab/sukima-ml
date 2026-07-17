import React from 'react';
import OriginalBlogPostItem from '@theme-original/BlogPostItem';
import type BlogPostItemType from '@theme/BlogPostItem';
import type { WrapperProps } from '@docusaurus/types';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import CommentsSection from '../../components/CommentsSection';

type Props = WrapperProps<typeof BlogPostItemType>;

export default function BlogPostItem(props: Props) {
  // isBlogPostPage 由 BlogPostProvider 提供（文章页为 true，列表/标签页为 false），
  // 替代原先基于路径正则的判断（会误伤 /blog/tags-xxx 这类 slug）。
  // frontMatter 来自当前文章上下文，支持在文章头部配置 comments: false 关闭评论。
  const { frontMatter, isBlogPostPage } = useBlogPost();
  const commentsEnabled = (frontMatter as { comments?: boolean } | undefined)?.comments !== false;

  return (
    <>
      <OriginalBlogPostItem {...props} />
      {isBlogPostPage && commentsEnabled && (
        <CommentsSection
          title="文章评论"
          description="欢迎分享你的想法和见解"
        />
      )}
    </>
  );
}
