import { hash } from './draw';

/** 一个字：字符、写出的顺序号、固定的小倾斜（deg）和上下错位（em）。 */
export interface Glyph {
  ch: string;
  i: number;
  r: string;
  y: string;
}

/** 断行单位：一组不拆开的字（一个汉字带上前后的标点，或一个西文单词），或者一段空白（可以断行）。 */
export type WriteGroup = { kind: 'word'; glyphs: Glyph[] } | { kind: 'space'; text: string };

export interface WriteLayout {
  lines: WriteGroup[][];
  /** 要写的字数（不含空白） */
  count: number;
}

const CJK = /[\u2E80-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u3000-\u303F\u3040-\u30FF]/;
/** 不放到行首的标点：跟在前一个字后面 */
const CLOSE = new Set([...'，。、！？；：）」』》〉】〕…—·～%％/／,.!?;:)]}”’']);
/** 不放到行尾的标点：跟着后一个字 */
const OPEN = new Set([...'（「『《〈【〔“‘([{¥￥']);

/**
 * 把一行手写字拆成逐字写出的单位。每个字的倾斜和错位由 (序号, seed) 决定：SSR 和浏览器算出来一样。
 * wobble 1 = 倾斜 ±1.15°、上下错位 ±.02em（片子 s2Hand 的 tilt/jitter 按网页字号放大一点）。
 */
export function layoutWriting(text: string, seed = 3, wobble = 1): WriteLayout {
  let i = 0;
  const glyph = (ch: string): Glyph => {
    const r = (hash(i, seed) - 0.5) * 2 * 0.02 * wobble * (180 / Math.PI);
    const y = (hash(i, seed + 1) - 0.5) * 2 * 0.02 * wobble;
    return { ch, i: i++, r: `${r.toFixed(2)}deg`, y: `${y.toFixed(3)}em` };
  };
  const lines = text.split('\n').map((line) => {
    const groups: WriteGroup[] = [];
    let open: Glyph[] = [];
    let latin: Glyph[] | null = null;
    const last = (): WriteGroup | undefined => groups[groups.length - 1];
    for (const ch of Array.from(line)) {
      if (/\s/.test(ch)) {
        if (open.length) {
          groups.push({ kind: 'word', glyphs: open });
          open = [];
        }
        latin = null;
        const prev = last();
        if (prev?.kind === 'space') prev.text += ch;
        else groups.push({ kind: 'space', text: ch });
        continue;
      }
      if (CLOSE.has(ch)) {
        const prev = last();
        if (prev?.kind === 'word' && !open.length) {
          prev.glyphs.push(glyph(ch));
          continue;
        }
      }
      if (OPEN.has(ch)) {
        latin = null;
        open.push(glyph(ch));
        continue;
      }
      if (CJK.test(ch)) {
        latin = null;
        groups.push({ kind: 'word', glyphs: [...open, glyph(ch)] });
        open = [];
        continue;
      }
      if (latin) {
        latin.push(glyph(ch));
      } else {
        latin = [...open, glyph(ch)];
        open = [];
        groups.push({ kind: 'word', glyphs: latin });
      }
    }
    if (open.length) groups.push({ kind: 'word', glyphs: open });
    return groups;
  });
  return { lines, count: i };
}
