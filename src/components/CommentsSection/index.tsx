import React from 'react';
import clsx from 'clsx';
import GiscusComments from '../GiscusComments';
import { LabelCard } from '../woodcut';
import styles from './styles.module.css';

interface CommentsSectionProps {
  title?: string;
  description?: string;
  className?: string;
  forceTheme?: 'light' | 'dark';
}

/** 评论区：外面包一张展签（标题手写、逐字写出，说明一行），里面是 Giscus，Giscus 自己的主题不动。 */
export default function CommentsSection({
  title = '评论区',
  description,
  className = '',
  forceTheme
}: CommentsSectionProps) {
  return (
    <LabelCard
      as="section"
      titleAs="h2"
      title={title}
      lines={description ? [description] : []}
      seed={57}
      nominal={[720, 700]}
      className={clsx(styles.commentsWrapper, className)}
    >
      <div className={styles.commentsContent}>
        <GiscusComments forceTheme={forceTheme} />
      </div>
    </LabelCard>
  );
}
