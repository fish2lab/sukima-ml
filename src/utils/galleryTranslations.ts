import { translate } from '@docusaurus/Translate';
import type { Artwork } from '../data/galleryData';

export function getArtworkTitle(artwork: Artwork): string {
    switch (artwork.id) {
        case '004':
            return translate({ id: 'gallery.art.004.title', message: '妖怪之山的秋千' });
        case '001':
            return translate({ id: 'gallery.art.001.title', message: '戴珍珠耳环的17岁少女' });
        case '003':
            return translate({ id: 'gallery.art.003.title', message: '蓬莱宫娥' });
        case '002':
            return translate({ id: 'gallery.art.002.title', message: '不动的大图书馆' });
        default:
            return artwork.title;
    }
}

export function getArtworkSubtitle(artwork: Artwork): string {
    switch (artwork.id) {
        case '004':
            return translate({ id: 'gallery.art.004.subtitle', message: 'The Swing × Mountain of Faith' });
        case '001':
            return translate({ id: 'gallery.art.001.subtitle', message: 'The Girl with a Pearl Earring (Age 17)' });
        case '003':
            return translate({ id: 'gallery.art.003.subtitle', message: 'Las Meninas: The Eternal Court' });
        case '002':
            return translate({ id: 'gallery.art.002.subtitle', message: 'The Bookworm × The Unmoving Library' });
        default:
            return artwork.subtitle;
    }
}

export function getArtworkDescription(artwork: Artwork): string {
    switch (artwork.id) {
        case '004':
            return translate({
                id: 'gallery.art.004.desc',
                message: '为何早苗坐在秋千上，蹬直白丝展示魅惑？为何文文藏在左下角，捕捉这"决定性瞬间"？原来是弗拉戈纳尔的《The Swing》幻想入到了妖怪之山！',
            });
        case '001':
            return translate({
                id: 'gallery.art.001.desc',
                message: '哎呀，迷路至此的外界旅人，初次见面。这幅肖像画捕捉了我流落在隙间之外的一瞬真容。若你将其悬挂于心墙之上时刻注视，或许……也是一种对我\'存在\'的供奉呢。',
            });
        case '003':
            return translate({
                id: 'gallery.art.003.desc',
                message: '永远亭的日常切片。比起原画中严肃的西班牙宫廷，这里的空气中似乎弥漫着一种随时会爆发弹幕战的微妙"核"平气息。注意后方门框里那个偷拍的身影哦。',
            });
        case '002':
            return translate({
                id: 'gallery.art.002.desc',
                message: '这就是所谓的"知识的重量"吗？为了触及真理的高处，总有人需要成为基石——比如此刻正在帕秋莉大人脚下瑟瑟发抖(yy)的小恶魔。',
            });
        default:
            return artwork.description;
    }
}

export function getOriginalPaintingTitle(artwork: Artwork): string {
    switch (artwork.id) {
        case '004':
            return translate({ id: 'gallery.art.004.originalPainting', message: '秋千 (The Swing)' });
        case '001':
            return translate({ id: 'gallery.art.001.originalPainting', message: '戴珍珠耳环的少女 (Girl with a Pearl Earring)' });
        case '003':
            return translate({ id: 'gallery.art.003.originalPainting', message: '宫娥 (Las Meninas)' });
        case '002':
            return translate({ id: 'gallery.art.002.originalPainting', message: '书虫 (The Bookworm)' });
        default:
            return artwork.originalPainting;
    }
}

export function getArtworkIntroOriginal(artwork: Artwork): string {
    switch (artwork.id) {
        case '004':
            return translate({
                id: 'gallery.art.004.introOriginal',
                message: '弗拉戈纳尔（Jean-Honoré Fragonard）的洛可可名作，画面中少女在秋千上荡起裙摆，下方藏着偷窥的情人，是18世纪法国宫廷生活轻浮享乐精神的缩影。',
            });
        case '001':
            return translate({
                id: 'gallery.art.001.introOriginal',
                message: '维米尔（Johannes Vermeer）的传世之作。少女那欲言又止的回眸、嘴唇的一抹亮色以及耳畔珍珠的温润光泽，构成了艺术史上最著名的神秘瞬间，常被称为"北方的蒙娜丽莎"。',
            });
        case '003':
            return translate({
                id: 'gallery.art.003.introOriginal',
                message: '委拉斯开兹（Velázquez）的巅峰之作，以其复杂的透视、镜面反射以及画家本人的入画，在这幅画中巧妙地模糊了真实与幻象的边界，是艺术史上关于"观看"的终极谜题。',
            });
        case '002':
            return translate({
                id: 'gallery.art.002.introOriginal',
                message: '卡尔·斯皮茨韦格（Carl Spitzweg）笔下的经典形象，描绘了一位站在梯子上、完全沉浸于书海而遗忘现实的怪诞学者，展现了毕德迈雅时期对知识的纯粹渴求。',
            });
        default:
            return artwork.introOriginal;
    }
}

export function getArtworkIntroTouhou(artwork: Artwork): string {
    switch (artwork.id) {
        case '004':
            return translate({
                id: 'gallery.art.004.introTouhou',
                message: '当场景移到妖怪之山，秋千上的少女变成了风祝早苗，而藏在角落里捕捉"决定性瞬间"的不再是贵族情人，而是文文记者。这大概就是幻想乡版的"狗仔摄影"吧？',
            });
        case '001':
            return translate({
                id: 'gallery.art.001.introTouhou',
                message: '但在幻想乡，取而代之的是这位永远的17岁少女（笑）。比起原画中珍珠的温婉，你不觉得隙间妖怪那看穿一切的眼神，配上这充满了历史沧桑感的龟裂纹理，更具一种……跨越境界的魅力吗？',
            });
        case '003':
            return translate({
                id: 'gallery.art.003.introTouhou',
                message: '而在永远亭的版本中，娇蛮的辉夜姬成为了视觉中心。永琳正恭敬递茶，而妹红似乎正被强迫"营业"。与其说是宫廷礼仪，不如说是蓬莱人漫长无聊时光中的一次盛大Cosplay闹剧。',
            });
        case '002':
            return translate({
                id: 'gallery.art.002.introTouhou',
                message: '红魔馆的魔女完美复刻了这份对书的痴迷。不过，原画中的梯子变成了可怜的使魔。对于患有哮喘的帕秋莉来说，这种不需要自己动弹就能阅读万卷书的方式，大概才是最极致的魔法吧？',
            });
        default:
            return artwork.introTouhou;
    }
}
