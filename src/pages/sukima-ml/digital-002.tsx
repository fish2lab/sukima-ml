import React, { type ReactNode } from 'react';
import ArtworkDetail from '@site/src/components/artwork/ArtworkDetail';
import { digitalOffers } from '@site/src/data/artworkOffers';

export default function DigitalDownload002(): ReactNode {
  return <ArtworkDetail offer={digitalOffers['002']} />;
}
