import React, { type ReactNode } from 'react';
import ArtworkDetail from '@site/src/components/artwork/ArtworkDetail';
import { artworkOffers } from '@site/src/data/artworkOffers';

export default function Artwork004(): ReactNode {
  return <ArtworkDetail offer={artworkOffers['004']} />;
}
