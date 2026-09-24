import React, { type ReactNode } from 'react';
import ArtworkDetail from '@site/src/components/artwork/ArtworkDetail';
import { artworkOffers } from '@site/src/data/artworkOffers';

export default function Artwork002(): ReactNode {
  return <ArtworkDetail offer={artworkOffers['002']} />;
}
