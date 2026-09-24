import pricing from './studioPricing.json';

export type StudioSpace = {
  slug: string;
  index: string;
  name: string;
  englishName: string;
  area: string;
  openingPrice: number;
  priceUnit: string;
  cover: string;
  images: string[];
};

export const studioPricing = pricing;

const image = (slug: string, id: string) =>
  `/img/studio/generated/spaces/${slug}/${id}`;

// 场地图默认横幅 4:3（1600×1200）；这三张是竖幅 3:4。<img> 带上真实宽高，懒加载的图在下载前就能占好位置。
const PORTRAIT = new Set(['white-stage/fsh0222', 'chinese-vintage/fsh0271', 'american-vintage/fsh0298']);

export const studioImageSize = (base: string): { width: number; height: number } =>
  PORTRAIT.has(base.split('/').slice(-2).join('/')) ? { width: 1200, height: 1600 } : { width: 1600, height: 1200 };

// 图片编号属于网站；价格、面积、名称统一来自 studioPricing.json（PDF 也读同一文件）。
const galleries: Record<string, { cover: string; images: string[] }> = {
  'white-stage': {
    cover: 'fsh0229',
    images: ['fsh0222', 'fsh0229', 'fsh0230', 'fsh0231', 'fsh0234'],
  },
  european: {
    cover: 'fsh0247',
    images: ['fsh0238', 'fsh0240', 'fsh0241', 'fsh0242', 'fsh0243', 'fsh0245', 'fsh0246', 'fsh0247', 'fsh0248', 'fsh0249', 'fsh0250'],
  },
  japanese: {
    cover: 'fsh0313',
    images: ['fsh0252', 'fsh0253', 'fsh0302', 'fsh0303', 'fsh0304', 'fsh0305', 'fsh0308', 'fsh0309', 'fsh0312', 'fsh0313', 'fsh0314'],
  },
  'chinese-vintage': {
    cover: 'fsh0258',
    images: ['fsh0258', 'fsh0261', 'fsh0262', 'fsh0263', 'fsh0265', 'fsh0271', 'fsh0274', 'fsh0279'],
  },
  'american-vintage': {
    cover: 'fsh0287',
    images: ['fsh0280', 'fsh0281', 'fsh0282', 'fsh0287', 'fsh0288', 'fsh0289', 'fsh0290', 'fsh0292', 'fsh0295', 'fsh0298', 'fsh0300'],
  },
};

export const studioSpaces: StudioSpace[] = pricing.spaces.map((space) => {
  const gallery = galleries[space.slug];
  if (!gallery) {
    throw new Error(`Missing gallery for Studio Phantasm space: ${space.slug}`);
  }
  return {
    ...space,
    cover: image(space.slug, gallery.cover),
    images: gallery.images.map((id) => image(space.slug, id)),
  };
});

export const getStudioSpace = (slug: string) =>
  studioSpaces.find((space) => space.slug === slug);

export const formatPrice = (space: Pick<StudioSpace, 'openingPrice' | 'priceUnit'>) =>
  `¥${space.openingPrice} / ${space.priceUnit}`;
