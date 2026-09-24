/**
 * 作品详情页（artwork-001..004）和数字作品页（digital-001、002）的售卖数据：
 * 规格、尺寸、价格、按钮文案、确认票据文案、购买链接，以及页面上原有的介绍文字。
 *
 * 全部从改版前的旧页面逐字搬来，改版时用一次性脚本和旧页面逐个状态比对过（价格、链接、文案一致）。
 * 改价、改规格只改这里；页面只负责取数据、渲染 src/components/artwork/ArtworkDetail。
 *
 * 本文件不 import 任何东西、只写可擦除的 TS（不用 enum、namespace），Node 可以直接读它做比对。
 */

// ===================== 类型 =====================

export interface OfferImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** 一段富文本里的一小段：纯文字、加粗、链接、换行 */
export type Inline =
  | string
  | { strong: string }
  | { link: string; href: string; external?: boolean; strong?: boolean }
  | { br: true };

export type Rich = readonly Inline[];

export interface TextSection {
  /** 页面原有的小标题（照原文显示） */
  heading?: string;
  /** 改版新加的小标题（界面文字，页面里走 translate） */
  headingKey?: 'material' | 'artist';
  paragraphs: readonly Rich[];
}

export interface OfferSpec {
  id: string;
  /** 价格单左边的名字 */
  name: string;
  /** 名字后面括注的小字（尺寸、画框） */
  spec?: string;
  /** 价格（元）；有两款时是 A 款的价格 */
  price: number;
  /** B 款的价格（002） */
  priceB?: number;
  /** 价格后面的小字（002 八寸套装「(2张)」） */
  priceNote?: string;
  /** 数字版：购买按钮直接去数字作品页，不开确认票据 */
  digital?: boolean;
  /** 套装：两款各一张（002） */
  set?: boolean;
  recommended?: boolean;
  /** 小标签（满印无裁、Recommended……） */
  tag?: string;
  /** 行下的说明 */
  description?: string;
  /** 行下「{type} · 画面: {imageSize} · {note}」的三段 */
  type?: string;
  imageSize?: string;
  note?: string;
}

/** 确认票据的一行：固定文字，或从当前规格 / 款式取 */
export type TicketRow =
  | { label: string; value: string }
  | { label: string; from: 'variant' | 'name' | 'size' | 'note' };

export interface VariantInfo {
  /** 'Variant A' */
  label: string;
  /** 'The Weight of Knowledge' */
  name: string;
  image: Omit<OfferImage, 'alt'>;
}

/** 002 的两款异画与裸足版 */
export interface VariantSet {
  title: string;
  /** 款式选择上方的提示 */
  hint: Rich;
  defaultVariant: 'A' | 'B';
  a: VariantInfo;
  b: VariantInfo;
  /** 裸足版：替换 B 款 */
  special: { name: string; toggle: string; image: Omit<OfferImage, 'alt'> };
  codes: { a: string; b: string; special: string; set: string; setSpecial: string; digital: string };
  /** 套装、数字版时图注里的名字 */
  both: string;
  setNotice: string;
  digitalNotice: string;
}

export interface ArtworkOffer {
  kind: 'print';
  /** galleryData 里的 id */
  id: '001' | '002' | '003' | '004';
  seo: { title: string; description: string };
  /** 原来 h1 的两行 */
  heading: { en: string; zh: string };
  badge?: string;
  metaLines: readonly string[];
  /** 页面原来那张东方版大图（002 按款式换，见 variants） */
  image?: OfferImage;
  /** 图注；002 里 {variant} 换成当前款式名 */
  caption: string;
  /** 展签里的介绍文字 */
  intro?: Rich;
  sections: readonly TextSection[];
  specTitle: string;
  costNote?: readonly string[];
  specs: readonly OfferSpec[];
  defaultSpec: string;
  /** 价格后面的小字（001「(Donation)」） */
  priceSuffix?: string;
  purchase: {
    /** {price} 换成当前价格 */
    label: string;
    notice: string;
    digitalLabel?: string;
    digitalNotice?: string;
    digitalHref?: string;
  };
  ticket: readonly TicketRow[];
  /**
   * 购买链接 /buy?product=…&variant=…&spec=…&price=…。
   * 旧页面有的参数没做 encodeURIComponent（如 product=Portrait of the Gap Sage），照旧保留，链接逐字不变。
   */
  buy: { product: string; encodeProduct: boolean; variant?: string; encodeVariant: boolean };
  variants?: VariantSet;
}

export interface DigitalOffer {
  kind: 'digital';
  id: '001' | '002';
  seo: { title: string; description: string };
  title: string;
  subtitle: string;
  previews: readonly { image: OfferImage; label: string }[];
  downloadTitle: string;
  downloads: readonly { href: string; label: string; size: string }[];
  letter: { title: string; paragraphs: readonly Rich[]; signature: string };
  payment: {
    heading: string;
    price: number;
    note: string;
    qr: readonly { image: OfferImage; label: string }[];
    free: Rich;
  };
}

// ===================== 共用文案 =====================

export const TICKET_TITLE = '确认选购信息';
export const TICKET_CONFIRM = '前往购买页面 / Proceed to Buy';
const DIGITAL_LABEL = '获取数字版 / GET DIGITAL COPY';
const CRAFT_LINK: Inline = { link: '点击了解更多工艺细节 →', href: '/giclee' };

// ===================== 四幅作品 =====================

export const artworkOffers: Record<ArtworkOffer['id'], ArtworkOffer> = {
  '001': {
    kind: 'print',
    id: '001',
    seo: { title: '《戴珍珠耳环的八云紫》- 正式版', description: '八云紫同人艺术微喷 - 硫化钡315g' },
    heading: { en: 'Portrait of the Gap Sage', zh: '戴珍珠耳环的八云紫' },
    metaLines: ['Official Release · Baryta 315g Giclée', '正式版 · 硫化钡艺术微喷'],
    image: { src: '/img/artworks/yukari_v0.5.webp', alt: '戴珍珠耳环的八云紫', width: 1200, height: 1405 },
    caption: 'Fig 1. The Sage of Gensokyo (Exiled), 2025.',
    intro: [
      '“初次见面的外界人，您好！我本是幻想乡的大贤者... 为了重返幻想乡，夺回属于我的一切，我需要收集‘信仰’。 将我的肖像挂在你的墙上，时刻注视，便是在为我重塑神格。”',
    ],
    sections: [
      {
        heading: '材质说明 (Material)',
        paragraphs: [
          ['载体升级为', { strong: '【硫化钡 315g (Baryta)】' }, '。 哑光、厚重，完美呈现高反差的肖像与隙间之黑。'],
          [CRAFT_LINK],
        ],
      },
    ],
    specTitle: '选择供奉规格 (Select Offering)',
    costNote: ['* 售价仅含极低的美术资源回收成本。', '* 全尺寸可选“无边框满印”或“加白边”。'],
    specs: [
      { id: 'digital-copy', name: 'Digital Original (JPG)', price: 6.48, tag: '数字典藏', description: '含1张高清原图', digital: true },
      { id: '14inch', name: '[14寸] 30.5 x 35.6 cm', price: 68, tag: '满印无裁', recommended: true },
      { id: '16inch', name: '[16寸] 30.5 x 40.6 cm', price: 88 },
      { id: '20inch', name: '[20寸] 40.0 x 50.0 cm', price: 119 },
      { id: 'planA', name: '[14寸] 30.5 x 35.6 cm + 35x40cm 专业装裱', price: 248, tag: '小巧紧凑', description: '卡纸宽2.5cm，画面利用率高' },
      { id: 'planB', name: '[16寸] 30.5 x 40.6 cm + 40x50cm 专业装裱', price: 298, tag: '艺术感强', description: '卡纸宽5cm，更有艺术品装裱的感觉' },
      { id: 'planC', name: '[20寸] 40.0 x 50.0 cm + 45x51cm 专业装裱', price: 368, tag: '效果最佳', description: '卡纸宽5cm，大画幅视觉张力更强' },
    ],
    defaultSpec: '14inch',
    priceSuffix: '(Donation)',
    purchase: {
      label: '奉纳信仰 (V我{price}) / OFFER FAITH',
      notice: '* 点击按钮扫码，助紫妈重返幻想乡',
      digitalLabel: DIGITAL_LABEL,
      digitalNotice: '* 数字典藏包含高清原图',
      digitalHref: '/sukima-ml/digital-001',
    },
    ticket: [
      { label: '作品:', value: 'Portrait of the Gap Sage' },
      { label: '款式:', value: 'Official Release' },
      { label: '规格:', from: 'name' },
    ],
    buy: { product: 'Portrait of the Gap Sage', encodeProduct: false, variant: 'Official Release', encodeVariant: false },
  },

  '002': {
    kind: 'print',
    id: '002',
    seo: { title: '《The Bookworm》', description: '帕秋莉&小恶魔同人' },
    heading: { en: 'The Bookworm × The Pachouli', zh: '书虫与知识的魔女' },
    badge: 'Dual Version',
    metaLines: ['Touhou Project · Giclée'],
    caption: 'Fig 2. The Bookworm × {variant}, 2025.',
    sections: [
      {
        headingKey: 'material',
        paragraphs: [
          ['收藏级画芯（EPSON 9580 & 哈内姆勒摄影纸）', { br: true }, '博物馆级装裱（铝合金框+卡纸+影像级高透亚克力面板+铝皮复合背板）'],
          [CRAFT_LINK],
        ],
      },
      {
        headingKey: 'artist',
        paragraphs: [['画师主页：', { link: 'Bilibili @青未Q', href: 'https://space.bilibili.com/520458415', external: true }]],
      },
    ],
    specTitle: '1. 选择规格 (Select Size)',
    specs: [
      { id: 'digital-set', type: '数字典藏', name: 'Digital Set (3 PNGs)', spec: '4K+ Resolution', imageSize: 'Original Source', price: 6.48, priceB: 6.48, note: '含3张高清原图', digital: true },
      { id: 'core-8', type: '仅画芯', name: '8寸 (套装)', spec: '15 × 20 cm', imageSize: '15 × 20 cm', price: 45, priceB: 45, note: '满印，无白边', priceNote: '(2张)', set: true },
      { id: 'core-16', type: '仅画芯', name: '16寸', spec: '30 × 40 cm', imageSize: '30 × 40 cm', price: 70, priceB: 78, note: '满印，无白边' },
      { id: 'core-18', type: '仅画芯', name: '18寸', spec: '35 × 45 cm', imageSize: '30 × 40 cm', price: 85, priceB: 90, note: '四周留白2.5cm' },
      { id: 'framed-14', type: '画框尺寸: 16寸', name: '14寸 & 装裱', imageSize: '25 × 33.4 cm', price: 210, priceB: 215, note: '含卡纸' },
      { id: 'framed-16', type: '画框尺寸: 40 × 50 cm', name: '16寸 & 装裱', imageSize: '30 × 40 cm', price: 280, priceB: 288, note: '含20寸卡纸' },
      { id: 'framed-20', type: '画框尺寸: 60 × 50 cm', name: '20寸 & 装裱', imageSize: '50 × 37.5 cm', price: 368, priceB: 378, note: '含卡纸' },
    ],
    defaultSpec: 'core-16',
    purchase: {
      label: '学习知识 / ACQUIRE KNOWLEDGE',
      notice: '* 点击按钮扫码，备注款式与规格',
      digitalLabel: DIGITAL_LABEL,
      digitalHref: '/sukima-ml/digital-002',
    },
    ticket: [
      { label: '作品:', value: 'The Bookworm' },
      { label: '款式:', from: 'variant' },
      { label: '规格:', from: 'name' },
      { label: '尺寸:', from: 'size' },
    ],
    buy: { product: 'The Bookworm', encodeProduct: false, encodeVariant: true },
    variants: {
      title: '2. 选择款式 (Select Variant)',
      hint: [{ strong: '点击画作或下方选项可切换异画版本。' }],
      defaultVariant: 'A',
      a: { label: 'Variant A', name: 'The Weight of Knowledge', image: { src: '/img/artworks/Variant_A.webp', width: 1200, height: 1600 } },
      b: { label: 'Variant B', name: 'The Forbidden Knowledge', image: { src: '/img/artworks/Variant_B.webp', width: 1200, height: 1607 } },
      special: {
        name: 'The Forbidden Knowledge (Special)',
        toggle: '裸足版本 (Barefoot Version)',
        image: { src: '/img/artworks/Variant_special.webp', width: 1200, height: 1607 },
      },
      codes: { a: 'A', b: 'B', special: 'Special', set: 'Set (A + B)', setSpecial: 'Set (A + Special)', digital: 'Digital Collection' },
      both: 'Both Variants',
      setNotice: '* 8寸套装包含 A款 与 B款 各一张',
      digitalNotice: '* 数字典藏包含所有款式的高清原图 (A + B + Special)',
    },
  },

  '003': {
    kind: 'print',
    id: '003',
    seo: { title: '《蓬莱宫娥》', description: '辉夜&永远亭：我不是嫦娥' },
    heading: { en: 'Las Meninas × Touhou Project', zh: '蓬莱宫娥' },
    badge: 'New Arrival',
    metaLines: ['Artist: amibazh'],
    image: { src: '/img/artworks/artwork-003.webp', alt: '蓬莱宫娥', width: 1200, height: 1404 },
    caption: 'Fig 1. Las Meninas (The Maids of Honour) × Kaguya & Eientei, 2025.',
    sections: [
      {
        headingKey: 'material',
        paragraphs: [['哈内姆勒 Photo RAG 308g (Hahnemühle)', { br: true }, '博物馆级装裱'], [CRAFT_LINK]],
      },
      {
        headingKey: 'artist',
        paragraphs: [['画师主页：', { link: 'Pixiv @amibazh', href: 'https://www.pixiv.net/users/1500528', external: true }]],
      },
    ],
    specTitle: '1. 选择规格 (Select Size)',
    specs: [
      { id: 'core-14', type: '仅画芯', name: '14寸画芯', spec: '14 inch', imageSize: '30 × 35 cm', price: 69, note: '满印无留白' },
      { id: 'core-40-34', type: '仅画芯', name: '40×45cm画芯', imageSize: '34.2×40cm', price: 99, note: '侧边2.5cm留白' },
      { id: 'core-50-45', type: '仅画芯', name: '45×50cm画芯', imageSize: '43.4×45 cm', price: 139, note: '侧边2.5cm留白' },
      {
        id: 'framed-14',
        type: '装裱款',
        name: '装裱款 14寸',
        spec: '40x45cm Frame',
        imageSize: '30 × 35 cm',
        price: 288,
        note: '含40x45卡纸和相框',
        recommended: true,
        tag: 'Recommended',
        description: '300PPi，画面精细，载体小巧有质感',
      },
      { id: 'framed-40-34', type: '装裱款', name: '装裱款 34.2×40cm', spec: '50x45cm Frame', imageSize: '34.2×40 cm', price: 349, note: '含50x45卡纸和相框' },
    ],
    defaultSpec: 'core-14',
    purchase: { label: '收藏永恒 / Drink the Elixir', notice: '* 点击按钮扫码，备注规格' },
    ticket: [
      { label: '作品:', value: '蓬莱宫娥 (Las Meninas)' },
      { label: '规格:', from: 'name' },
      { label: '配置:', from: 'note' },
    ],
    buy: { product: '蓬莱宫娥', encodeProduct: true, variant: 'Standard', encodeVariant: true },
  },

  '004': {
    kind: 'print',
    id: '004',
    seo: { title: '《妖怪之山的秋千》', description: '東方風神録 × 弗拉戈纳尔《秋千》— 早苗与文文的决定性瞬间' },
    heading: { en: 'The Swing × Mountain of Faith', zh: '妖怪之山的秋千' },
    badge: 'New Arrival',
    metaLines: ['Artist: Sukima-ML Official'],
    image: { src: '/img/artworks/artwork-004.webp', alt: '妖怪之山的秋千', width: 1063, height: 1417 },
    caption: 'Fig 4. The Swing × Mountain of Faith, 2025.',
    sections: [
      {
        headingKey: 'material',
        paragraphs: [
          ['哈内姆勒 Photo RAG 308g (Hahnemühle)', { br: true }, '博物馆级装裱'],
          [
            { strong: '🔪 全链路无损映射 (Pixel-to-Paper)' },
            { br: true },
            '这次画师直接以360PPI——打印机的原生分辨率起稿。 我们第一次实现了从画布到纸面的完全无损映射：每一个墨点都是画师亲手所绘，没有算法插值，绝对锐利。',
          ],
          [CRAFT_LINK],
        ],
      },
      {
        headingKey: 'artist',
        paragraphs: [['画师主页：', { link: 'Bilibili @真菌_isomer', href: 'https://space.bilibili.com/308844850', external: true }]],
      },
    ],
    specTitle: '1. 选择规格 (Select Size)',
    specs: [
      { id: 'core-14', type: '仅画芯', name: '14寸画芯', spec: '14 inch', imageSize: '30 × 35 cm', price: 68, note: '满印无留白' },
      {
        id: 'core-16',
        type: '仅画芯',
        name: '16寸画芯',
        spec: '16 inch',
        recommended: true,
        tag: 'Recommended',
        description: '360PPI原生分辨率，Pixel-to-Paper无损映射',
        imageSize: '30 × 40 cm',
        price: 78,
        note: '满印无留白',
      },
      { id: 'core-20', type: '仅画芯', name: '20寸画芯', spec: '20 inch', imageSize: '40 × 50 cm', price: 119, note: '满印无留白' },
      { id: 'framed-14', type: '装裱款', name: '装裱款 14寸', spec: '16寸画框', imageSize: '25 × 33.4 cm', price: 215, note: '含卡纸' },
      {
        id: 'framed-16',
        type: '装裱款',
        name: '装裱款 16寸',
        spec: '40×50cm画框',
        imageSize: '30 × 40 cm',
        price: 288,
        note: '含20寸卡纸',
        recommended: true,
        tag: 'Recommended',
        description: '360PPI无损映射，装裱效果极佳',
      },
      { id: 'framed-20', type: '装裱款', name: '装裱款 20寸', spec: '60×50cm画框', imageSize: '50 × 37.5 cm', price: 378, note: '含卡纸', tag: '效果最佳', description: '大画幅视觉张力更强' },
    ],
    defaultSpec: 'core-14',
    purchase: { label: '荡入幻想 / Swing into Fantasy', notice: '* 点击按钮扫码，备注规格' },
    ticket: [
      { label: '作品:', value: '妖怪之山的秋千 (The Swing)' },
      { label: '规格:', from: 'name' },
      { label: '配置:', from: 'note' },
    ],
    buy: { product: '妖怪之山的秋千', encodeProduct: true, variant: 'Standard', encodeVariant: true },
  },
};

// ===================== 两个数字作品页 =====================

const QR: DigitalOffer['payment']['qr'] = [
  { image: { src: '/img/alipay_receiveMoney.webp', alt: 'Alipay', width: 922, height: 964 }, label: '支付宝 (Alipay)' },
  { image: { src: '/img/wechat_receiveMoney.webp', alt: 'WeChat', width: 924, height: 966 }, label: '微信支付 (WeChat)' },
];
const FREE_NOTICE: Rich = [
  { strong: '✨ 特别说明：' },
  ' 如果你已经购买了（或打算购买）本作品的实物版（艺术微喷），',
  { br: true },
  '这份数字典藏是',
  { strong: '免费赠送' },
  '给你的，请勿重复付款。',
];
const PAYMENT_BASE = {
  heading: '奉纳幻想 / Offering to Phantasm',
  price: 6.48,
  note: '相当于食堂的一顿早餐，或是给大小姐的一杯红茶钱。',
  qr: QR,
  free: FREE_NOTICE,
} as const;
const LETTER_TITLE = 'A Letter from the Organizer';
const SIGNATURE = '—— 苏心贤 (Su Xinxian)';

export const digitalOffers: Record<DigitalOffer['id'], DigitalOffer> = {
  '001': {
    kind: 'digital',
    id: '001',
    seo: { title: 'Digital Collection - Portrait of the Gap Sage', description: 'Digital Download for Portrait of the Gap Sage' },
    title: 'Digital Collection',
    subtitle: '数字典藏 · 戴珍珠耳环的八云紫',
    previews: [
      { image: { src: '/img/digital_Resource/artwork-001.webp', alt: 'Portrait of the Gap Sage', width: 1200, height: 1404 }, label: 'Portrait of the Gap Sage' },
    ],
    downloadTitle: 'Download Original Assets',
    downloads: [{ href: '/img/digital_Resource/artwork-001.jpg', label: 'Original Artwork (JPG)', size: 'JPG · 9.5 MB' }],
    letter: {
      title: LETTER_TITLE,
      paragraphs: [
        ['致每一位热爱东方与艺术的朋友：'],
        ['这是《隙间月影 Sukima Moonlight》社团的', { strong: '第一份制品' }, '。'],
        [
          '它的诞生，源于一个简单的脑洞：“如果维米尔生活在幻想乡，他会画谁？”',
          { br: true },
          '八云紫，这位穿梭于隙间的大贤者，她的神秘与优雅，与《戴珍珠耳环的少女》中那回眸一瞥的神韵不谋而合。',
        ],
        [
          '特别感谢画师 ',
          { link: '真菌_isomer', href: 'https://space.bilibili.com/308844850', external: true, strong: true },
          ' 老师。 是他精湛的笔触，将这个跨越时空的幻想变成了现实。',
        ],
        ['将这份“初心”以数字典藏的形式分享出来，既是对画师的致敬，也是对所有支持者的感谢。 无论你是购买了实体微喷，还是仅仅下载了这张图片，你都是这个社团成长历史的一部分。'],
        ['愿幻想乡的月光，常伴你左右。'],
        ['感谢各位的支持，让更多的世界名画能够浸入幻想的染缸，又再次穿越幻想与现实的界线，来到你我身边。'],
      ],
      signature: SIGNATURE,
    },
    payment: PAYMENT_BASE,
  },
  '002': {
    kind: 'digital',
    id: '002',
    seo: { title: 'Digital Collection - The Bookworm', description: 'Digital Download for The Bookworm × The Pachouli' },
    title: 'Digital Collection',
    subtitle: '数字典藏 · The Bookworm × The Pachouli',
    previews: [
      { image: { src: '/img/artworks/Variant_A.webp', alt: 'Variant A', width: 1200, height: 1600 }, label: 'Variant A: The Weight of Knowledge' },
      { image: { src: '/img/artworks/Variant_B.webp', alt: 'Variant B', width: 1200, height: 1607 }, label: 'Variant B: The Forbidden Knowledge' },
      { image: { src: '/img/artworks/Variant_special.webp', alt: 'Special', width: 1200, height: 1607 }, label: 'Special: Barefoot Version' },
    ],
    downloadTitle: 'Download Original Assets',
    downloads: [
      { href: '/img/digital_Resource/Variant_A.png', label: 'Variant A (Original)', size: 'PNG · 18.7 MB' },
      { href: '/img/digital_Resource/Variant_B.png', label: 'Variant B (Original)', size: 'PNG · 23.8 MB' },
      { href: '/img/digital_Resource/Variant_special.png', label: 'Special Version', size: 'PNG · 23.8 MB' },
    ],
    letter: {
      title: LETTER_TITLE,
      paragraphs: [
        ['致每一位热爱东方与艺术的朋友：'],
        ['感谢你对《隙间月影 Sukima Moonlight》的关注。作为一个刚刚起步、单人运营的同人社团，你的每一次点击和浏览对我来说都弥足珍贵。'],
        ['将高清数字原图直接放出，是一个很大胆的决定。在传统的商业逻辑里，这似乎是在“自断财路”。 但我始终相信，东方Project的魅力在于分享与共创，而真正喜爱这些作品的朋友，一定懂得其背后的价值。'],
        ['这三幅作品，凝聚了画师青未Q老师精湛的笔触，也承载了我对“名画 × 东方”这一概念的无数次推敲与打磨。 如果你喜欢它们，希望你能将它们保存下来，作为壁纸、收藏，或是仅仅在某个时刻打开欣赏。'],
        ['如果条件允许，也希望你能通过下方的“奉纳幻想”支持社团的运营。这笔资金将全部用于填补美术资源的成本，以及支持后续更多精彩作品的诞生。'],
        ['愿幻想乡的月光，常伴你左右。'],
        ['感谢各位的支持，让更多的世界名画能够浸入幻想的染缸，又再次穿越幻想与现实的界线，来到你我身边。'],
      ],
      signature: SIGNATURE,
    },
    payment: PAYMENT_BASE,
  },
};

// ===================== 由数据算出页面上显示的东西 =====================

/** 当前选择：规格、款式（002）、是否裸足版（002） */
export interface Selection {
  specId: string;
  variant: 'A' | 'B';
  special: boolean;
}

export interface PriceRowView {
  id: string;
  /** 完整名字（含括注），给 title 属性和读屏 */
  label: string;
  name: string;
  spec?: string;
  price: string;
  tags: string[];
  details: string[];
  recommended: boolean;
  selected: boolean;
}

export interface VariantOptionView {
  code: 'A' | 'B';
  label: string;
  /** 静态的款式名 */
  name: string;
  /** 当前显示的款式名（B 款选了裸足版时是裸足版的名字） */
  displayName: string;
  image: OfferImage;
  /** 套装、数字版时两款都算选中 */
  selected: boolean;
}

export interface VariantView {
  options: VariantOptionView[];
  /** 套装、数字版：两款都包含，不能单选 */
  locked: boolean;
  special: { visible: boolean; checked: boolean; label: string };
  notices: string[];
  code: string;
}

export interface TicketView {
  title: string;
  rows: [string, string][];
  price: string;
  confirm: string;
  href: string;
}

export interface OfferView {
  spec: OfferSpec;
  price: number;
  /** '¥ 68.00' */
  priceText: string;
  /** '(Donation)'、'(2张)' */
  priceNote?: string;
  /** 当前规格的完整名字（展签底部） */
  specLabel: string;
  rows: PriceRowView[];
  button: string;
  notice: string;
  /** 数字版：按钮直接去这里 */
  digitalHref?: string;
  /** 实体版：确认票据 */
  ticket?: TicketView;
  caption: string;
  /** 画框里的东方版 */
  image: OfferImage;
  variant?: VariantView;
}

/** 带小数的价格原样，整数补 .00（旧页面的写法） */
export const money = (p: number): string => (Number.isInteger(p) ? `${p}.00` : String(p));

export const fill = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));

/** 名字 + 括注（旧页面购买链接 spec 参数的写法） */
export const specLabel = (s: OfferSpec): string => (s.spec ? `${s.name} (${s.spec})` : s.name);

export function initialSelection(offer: ArtworkOffer): Selection {
  return { specId: offer.defaultSpec, variant: offer.variants?.defaultVariant ?? 'A', special: false };
}

export function findSpec(offer: ArtworkOffer, id: string): OfferSpec {
  return offer.specs.find((s) => s.id === id) ?? offer.specs[0];
}

const priceOf = (s: OfferSpec, variant: 'A' | 'B'): number => (variant === 'A' ? s.price : (s.priceB ?? s.price));

export function viewOffer(offer: ArtworkOffer, sel: Selection): OfferView {
  const spec = findSpec(offer, sel.specId);
  const vs = offer.variants;
  const variant = vs ? sel.variant : 'A';
  const price = priceOf(spec, variant);
  const locked = !!(spec.digital || spec.set);

  let code = offer.buy.variant ?? '';
  let captionName = '';
  let image = offer.image;
  let variantView: VariantView | undefined;
  if (vs) {
    const bName = sel.special ? vs.special.name : vs.b.name;
    const bImage = sel.special ? vs.special.image : vs.b.image;
    code = locked
      ? spec.digital
        ? vs.codes.digital
        : sel.special
          ? vs.codes.setSpecial
          : vs.codes.set
      : variant === 'A'
        ? vs.codes.a
        : sel.special
          ? vs.codes.special
          : vs.codes.b;
    captionName = locked ? vs.both : variant === 'A' ? vs.a.name : bName;
    const options: VariantOptionView[] = [
      { code: 'A', label: vs.a.label, name: vs.a.name, displayName: vs.a.name, image: { ...vs.a.image, alt: vs.a.name }, selected: variant === 'A' || locked },
      { code: 'B', label: vs.b.label, name: vs.b.name, displayName: bName, image: { ...bImage, alt: bName }, selected: variant === 'B' || locked },
    ];
    image = options[variant === 'A' ? 0 : 1].image;
    variantView = {
      options,
      locked,
      special: { visible: locked || variant === 'B', checked: sel.special, label: vs.special.toggle },
      notices: spec.digital ? [vs.digitalNotice] : spec.set ? [vs.setNotice] : [],
      code,
    };
  }
  if (!image) throw new Error(`artwork ${offer.id}: no image`);

  const rows: PriceRowView[] = offer.specs.map((s) => ({
    id: s.id,
    label: specLabel(s),
    name: s.name,
    spec: s.spec || undefined,
    price: `¥ ${priceOf(s, variant)}`,
    tags: s.tag ? [s.tag] : [],
    details: [
      ...(s.type ? [`${s.type} · ${s.imageSize && s.imageSize !== 'Unknown' ? `画面: ${s.imageSize} · ` : ''}${s.note ?? ''}`] : []),
      ...(s.description ? [s.description] : []),
    ],
    recommended: !!s.recommended,
    selected: s.id === spec.id,
  }));

  const p = offer.purchase;
  const digital = !!spec.digital && !!p.digitalHref;
  const b = offer.buy;
  const ticket: TicketView | undefined = digital
    ? undefined
    : {
        title: TICKET_TITLE,
        rows: offer.ticket.map((r): [string, string] => [
          r.label,
          'value' in r
            ? r.value
            : r.from === 'variant'
              ? code
              : r.from === 'name'
                ? spec.name
                : r.from === 'size'
                  ? spec.spec || spec.imageSize || ''
                  : (spec.note ?? ''),
        ]),
        price: `¥ ${money(price)}`,
        confirm: TICKET_CONFIRM,
        href:
          `/buy?product=${b.encodeProduct ? encodeURIComponent(b.product) : b.product}` +
          `&variant=${b.encodeVariant ? encodeURIComponent(code) : code}` +
          `&spec=${encodeURIComponent(specLabel(spec))}&price=${price}`,
      };

  return {
    spec,
    price,
    priceText: `¥ ${money(price)}`,
    priceNote: offer.priceSuffix ?? spec.priceNote,
    specLabel: specLabel(spec),
    rows,
    button: digital ? (p.digitalLabel ?? p.label) : fill(p.label, { price }),
    notice: digital ? (p.digitalNotice ?? p.notice) : p.notice,
    digitalHref: digital ? p.digitalHref : undefined,
    ticket,
    caption: fill(offer.caption, { variant: captionName }),
    image,
    variant: variantView,
  };
}
