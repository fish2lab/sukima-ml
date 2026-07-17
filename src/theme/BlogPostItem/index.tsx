import React from 'react';
import OriginalBlogPostItem from '@theme-original/BlogPostItem';
import type BlogPostItemType from '@theme/BlogPostItem';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';
import CommentsSection from '../../components/CommentsSection';

type Props = WrapperProps<typeof BlogPostItemType> & {
  frontMatter?: { comments?: boolean };
};

export default function BlogPostItem(props: Props) {
  const location = useLocation();
  
  // 检查是否是完整的博客文章页面
  // 博客文章页面路径格式: /blog/slug 或 /blog/YYYY/MM/DD/slug
  // 排除: /blog, /blog/, /blog/tags, /blog/archive 等
  const isBlogPostPage = 
    location.pathname.startsWith('/blog/') && 
    !location.pathname.match(/\/(tags|archive)\/?/) &&
    location.pathname.split('/').filter(Boolean).length >= 2;
  
  // 可以通过 frontMatter 禁用评论
  const commentsEnabled = props.frontMatter?.comments !== false;

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
