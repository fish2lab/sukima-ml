export interface Artwork {
    id: string;
    title: string;
    subtitle: string;
    imagePath: string;
    imageWidth: number;
    imageHeight: number;
    originalImagePath: string;
    originalImageWidth: number;
    originalImageHeight: number;
    link: string;
    artist: string;
    description: string;
    originalPainting: string;
    touhouCharacter: string;
    introOriginal: string;
    introTouhou: string;
}

export const artworks: Artwork[] = [
    {
        id: '004',
        title: '妖怪之山的秋千',
        subtitle: 'The Swing × Mountain of Faith',
        imagePath: '/img/artworks/artwork-004.webp',
        imageWidth: 1063,
        imageHeight: 1417,
        originalImagePath: '/img/artworks/The_swing_original.jpg',
        originalImageWidth: 1200,
        originalImageHeight: 1600,
        link: '/sukima-ml/artwork-004',
        artist: '真菌_isomer (Bilibili: 308844850)',
        description: '为何早苗坐在秋千上，蹬直白丝展示魅惑？为何文文藏在左下角，捕捉这"决定性瞬间"？原来是弗拉戈纳尔的《The Swing》幻想入到了妖怪之山！',
        originalPainting: '秋千 (The Swing)',
        touhouCharacter: '東風谷早苗 & 射命丸文 (Sanae & Aya)',
        introOriginal: '弗拉戈纳尔（Jean-Honoré Fragonard）的洛可可名作，画面中少女在秋千上荡起裙摆，下方藏着偷窥的情人，是18世纪法国宫廷生活轻浮享乐精神的缩影。',
        introTouhou: '当场景移到妖怪之山，秋千上的少女变成了风祝早苗，而藏在角落里捕捉"决定性瞬间"的不再是贵族情人，而是文文记者。这大概就是幻想乡版的"狗仔摄影"吧？',
    },
    {
        id: '001',
        title: '戴珍珠耳环的17岁少女',
        subtitle: 'The Girl with a Pearl Earring (Age 17)',
        imagePath: '/img/artworks/yukari_v0.5.webp',
        imageWidth: 1200,
        imageHeight: 1405,
        originalImagePath: '/img/artworks/戴珍珠耳环的少女to戴猫眼石耳环的紫妈.webp',
        originalImageWidth: 900,
        originalImageHeight: 1200,
        link: '/sukima-ml/artwork-001',
        artist: 'Sukima-ML Official',
        description: '"哎呀，迷路至此的外界旅人，初次见面。这幅肖像画捕捉了我流落在隙间之外的一瞬真容。若你将其悬挂于心墙之上时刻注视，或许……也是一种对我\'存在\'的供奉呢。"',
        originalPainting: '戴珍珠耳环的少女 (Girl with a Pearl Earring)',
        touhouCharacter: '八云紫 (Yukari Yakumo)',
        introOriginal: '维米尔（Johannes Vermeer）的传世之作。少女那欲言又止的回眸、嘴唇的一抹亮色以及耳畔珍珠的温润光泽，构成了艺术史上最著名的神秘瞬间，常被称为"北方的蒙娜丽莎"。',
        introTouhou: '但在幻想乡，取而代之的是这位永远的17岁少女（笑）。比起原画中珍珠的温婉，你不觉得隙间妖怪那看穿一切的眼神，配上这充满了历史沧桑感的龟裂纹理，更具一种……跨越境界的魅力吗？',
    },
    {
        id: '003',
        title: '蓬莱宫娥',
        subtitle: 'Las Meninas: The Eternal Court',
        imagePath: '/img/artworks/artwork-003.webp',
        imageWidth: 1200,
        imageHeight: 1404,
        originalImagePath: '/img/artworks/宫娥to辉夜&永远亭：我不是嫦娥.webp',
        originalImageWidth: 1200,
        originalImageHeight: 1600,
        link: '/sukima-ml/artwork-003',
        artist: 'amibazh (Pixiv: 1500528)',
        description: '永远亭的日常切片。比起原画中严肃的西班牙宫廷，这里的空气中似乎弥漫着一种随时会爆发弹幕战的微妙"核"平气息。注意后方门框里那个偷拍的身影哦。',
        originalPainting: '宫娥 (Las Meninas)',
        touhouCharacter: '蓬莱山辉夜 & 永远亭众 (Eientei Cast)',
        introOriginal: '委拉斯开兹（Velázquez）的巅峰之作，以其复杂的透视、镜面反射以及画家本人的入画，在这幅画中巧妙地模糊了真实与幻象的边界，是艺术史上关于"观看"的终极谜题。',
        introTouhou: '而在永远亭的版本中，娇蛮的辉夜姬成为了视觉中心。永琳正恭敬递茶，而妹红似乎正被强迫"营业"。与其说是宫廷礼仪，不如说是蓬莱人漫长无聊时光中的一次盛大Cosplay闹剧。',
    },
    {
        id: '002',
        title: '不动的大图书馆',
        subtitle: 'The Bookworm × The Unmoving Library',
        imagePath: '/img/artworks/Variant_B.webp',
        imageWidth: 1200,
        imageHeight: 1607,
        originalImagePath: '/img/artworks/The Bookworm to The Pachouli-sama.webp',
        originalImageWidth: 1200,
        originalImageHeight: 1600,
        link: '/sukima-ml/artwork-002',
        artist: '青未Q (Pixiv: 103691477)',
        description: '这就是所谓的"知识的重量"吗？为了触及真理的高处，总有人需要成为基石——比如此刻正在帕秋莉大人脚下瑟瑟发抖(yy)的小恶魔。',
        originalPainting: '书虫 (The Bookworm)',
        touhouCharacter: '帕秋莉·诺蕾姬 (Patchouli Knowledge)',
        introOriginal: '卡尔·斯皮茨韦格（Carl Spitzweg）笔下的经典形象，描绘了一位站在梯子上、完全沉浸于书海而遗忘现实的怪诞学者，展现了毕德迈雅时期对知识的纯粹渴求。',
        introTouhou: '红魔馆的魔女完美复刻了这份对书的痴迷。不过，原画中的梯子变成了可怜的使魔。对于患有哮喘的帕秋莉来说，这种不需要自己动弹就能阅读万卷书的方式，大概才是最极致的魔法吧？',
    },
];
