#!/usr/bin/env node
// 全局 CSS 用的木刻毛边遮罩（mask-image），和组件用同一套画法（src/components/woodcut/draw.ts）。
//
//   node scripts/woodcut/make-masks.mjs
//
// 输出 src/components/woodcut/assets/：
//   mask-rule.svg  一笔横向的墨线（两头略收尖、线宽起伏）：导航栏底线、链接下划线、markdown 的 <hr>
//   mask-edge.svg  墨块的上沿（木刻刀口的毛边，下面是实心）：页脚黑场的上沿
// 都是 preserveAspectRatio="none"，CSS 里 mask-size: 100% 100% 沿长度拉伸，厚度方向按元素高度。
// Node ≥ 22.18（直接 import .ts）；会提示 MODULE_TYPELESS_PACKAGE_JSON，无害。

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { noise1, pathD, roughOffset, strokePolys } from '../../src/components/woodcut/draw.ts';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'components', 'woodcut', 'assets');
const svg = (w, h, d) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${d}" fill="#000"/></svg>\n`;

// 横线：长 1200、厚 12，线宽 6，中线起伏 ±1
{
  const L = 1200, H = 12, c = H / 2, seed = 7, pts = [];
  for (let x = 0; x <= L; x += 4) pts.push([x, c + 1 * (0.8 * noise1(x / 90, seed + 21) + 0.35 * noise1(x / 24, seed + 22))]);
  const d = strokePolys(pts, { w: 6, rough: 0.3, taper: 0.03, seed, smooth: false, step: 5 }).map((p) => pathD(p)).join('');
  writeFileSync(join(OUT, 'mask-rule.svg'), svg(L, H, d));
}

// 墨块上沿：长 1200，毛边平均伸出 2.4、偶尔长刺，下面实心 8
{
  const L = 1200, seed = 9, depth = 8, o = { amp: 2.4, freq: 16, spike: 0.012, spikeLen: 5, seed };
  const offs = [];
  let k = 0;
  for (let x = 0; x <= L; x += 3, k++) offs.push([x, Math.max(0, o.amp + roughOffset(k, x, o))]);
  const out = Math.ceil(Math.max(...offs.map((p) => p[1]))) + 0.5, H = out + depth;
  const d = pathD([[0, H], ...offs.map(([x, off]) => [x, out - off]), [L, H]]);
  writeFileSync(join(OUT, 'mask-edge.svg'), svg(L, H, d));
  console.log(`mask-edge.svg height ${H} (rough band ${out})`);
}
console.log('mask-rule.svg, mask-edge.svg written');
