import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import type {Props} from '@theme/Tag';
import {Caption} from '@site/src/components/woodcut';

import styles from './styles.module.css';

/**
 * 从 @docusaurus/theme-classic 3.10 弹出（eject）：标签画成一张小展签（Caption sm），
 * 标签总览页上的篇数用等宽字跟在后面。链接、rel、title 照原版。
 */
export default function Tag({
  permalink,
  label,
  count,
  description,
}: Props): ReactNode {
  return (
    <Link
      rel="tag"
      href={permalink}
      title={description}
      className={clsx(styles.tag, count ? styles.tagWithCount : styles.tagRegular)}>
      <Caption size="sm" seed={label.length + 3}>
        {label}
      </Caption>
      {count ? <span className={clsx(styles.count, 'wc-mono')}>{count}</span> : null}
    </Link>
  );
}
