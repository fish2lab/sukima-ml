import React, { Fragment, type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import type { Rich } from '@site/src/data/artworkOffers';

/** 把 artworkOffers 里的富文本（文字、加粗、链接、换行）照原样渲染成行内内容 */
export default function RichText({ rich }: { rich: Rich }): ReactNode {
  return rich.map((seg, i) => {
    if (typeof seg === 'string') return <Fragment key={i}>{seg}</Fragment>;
    if ('br' in seg) return <br key={i} />;
    if ('link' in seg) {
      const a = seg.external ? (
        <a href={seg.href} target="_blank" rel="noopener noreferrer">
          {seg.link}
        </a>
      ) : (
        <Link to={seg.href}>{seg.link}</Link>
      );
      return seg.strong ? <strong key={i}>{a}</strong> : <Fragment key={i}>{a}</Fragment>;
    }
    return <strong key={i}>{seg.strong}</strong>;
  });
}
