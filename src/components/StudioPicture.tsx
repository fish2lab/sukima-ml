import React from 'react';

import { studioImageSize } from '../data/studioSpaces';

type Props = {
  base: string;
  alt: string;
  className?: string;
  eager?: boolean;
  /** 1600px 那一档的真实像素尺寸；不传按场地图算（默认 1600×1200，竖幅 1200×1600）。 */
  size?: { width: number; height: number };
};

export default function StudioPicture({ base, alt, className, eager = false, size }: Props) {
  const { width, height } = size ?? studioImageSize(base);
  return (
    <picture className={className}>
      <source media="(max-width: 700px)" srcSet={`${base}-1280.webp`} />
      <img
        src={`${base}-1600.webp`}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding={eager ? 'sync' : 'async'}
      />
    </picture>
  );
}
