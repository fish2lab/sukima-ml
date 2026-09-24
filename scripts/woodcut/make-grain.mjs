#!/usr/bin/env node
// 纸纹平铺图生成器：照 BX 短片 animation/kit.js 的 tile('paper' | 'ink') 逐笔复刻（同一个 rng、同样的斑、点、纤维），
// 在指定底色上合成，输出可无缝平铺的 WebP 到 src/components/woodcut/assets/。
//
//   node scripts/woodcut/make-grain.mjs          # 生成三张：grain-paper / grain-wall / grain-ink
//
// 片子里一块底纹是 512 单位见方；这里按 2 倍（1024 像素）渲染，CSS 用 background-size: 512px 显示，Retina 屏上也细。
// 约束（src/components/woodcut/README.md）：明暗起伏 ≤ 5%（CIE L* 0..100 上最大偏差 ≤ 5），每张 ≤ 60KB。
// 依赖：cwebp / dwebp（libwebp，brew install webp）。Node ≥ 22.18（直接 import .ts，类型擦除；
// Node 会提示 MODULE_TYPELESS_PACKAGE_JSON，无害：package.json 不能改成 type: module，postcss.config.js 等仍是 CommonJS）。

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { K, TAU, rng } from '../../src/components/woodcut/draw.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'src', 'components', 'woodcut', 'assets');
const T = 512; // 片子里一块底纹的边长（逻辑单位）
const SCALE = 2; // 输出像素 / 逻辑单位
const N = T * SCALE;
const MAX_DL = 5; // L* 最大偏差（解码后的 WebP 也要满足）
const TARGET_DL = 4.6; // 源图按 4.6 调浓度，给有损编码的振铃留余量
const MAX_BYTES = 60 * 1024;

const TILES = [
  // name, 底色, 底纹, 浓度上限（片子里 paperBg 用 1，隙间页面 handoffSukima 用 .35）
  { name: 'grain-paper', base: K.paper, kind: 'paper', strength: 1 },
  { name: 'grain-wall', base: K.wall, kind: 'paper', strength: 0.5 },
  { name: 'grain-ink', base: K.ink, kind: 'ink', strength: 1 },
];

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const lin = (v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lstar = (r, g, b) => {
  const Y = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return Y > 216 / 24389 ? 116 * Math.cbrt(Y) - 16 : (24389 / 27) * Y;
};

// ---------- 软件光栅：在 N×N 的浮点缓冲上按 canvas 的 source-over 合成，坐标按模 N 环绕（无缝平铺） ----------
function render(base, kind, strength) {
  const buf = new Float64Array(N * N * 3);
  const [br, bg, bb] = hex(base);
  for (let i = 0; i < N * N; i++) {
    buf[i * 3] = br;
    buf[i * 3 + 1] = bg;
    buf[i * 3 + 2] = bb;
  }
  const over = (px, py, col, a) => {
    if (a <= 0) return;
    const x = ((px % N) + N) % N;
    const y = ((py % N) + N) % N;
    const i = (y * N + x) * 3;
    buf[i] += (col[0] - buf[i]) * a;
    buf[i + 1] += (col[1] - buf[i + 1]) * a;
    buf[i + 2] += (col[2] - buf[i + 2]) * a;
  };
  const r = rng(kind.charCodeAt(0) * 97 + kind.length);
  const S = SCALE;

  // 斑：径向渐变，中心 alpha a，到半径 R 处为 0
  const blotches = (n, col, a0, a1) => {
    for (let k = 0; k < n; k++) {
      const x = r() * T, y = r() * T, R = 60 + r() * 140, a = (a0 + r() * (a1 - a0)) * strength;
      const cx = x * S, cy = y * S, RR = R * S;
      for (let py = Math.floor(cy - RR); py <= Math.ceil(cy + RR); py++) {
        for (let px = Math.floor(cx - RR); px <= Math.ceil(cx + RR); px++) {
          const d = Math.hypot(px + 0.5 - cx, py + 0.5 - cy);
          if (d < RR) over(px, py, col, a * (1 - d / RR));
        }
      }
    }
  };
  // 点：小矩形，按像素覆盖面积抗锯齿
  const specks = (n, col, a0, a1, s0, s1) => {
    for (let k = 0; k < n; k++) {
      const x = r() * T, y = r() * T, s = s0 + r() * (s1 - s0), a = (a0 + r() * (a1 - a0)) * strength, h = s * (0.6 + r() * 0.8);
      const X0 = x * S, X1 = (x + s) * S, Y0 = y * S, Y1 = (y + h) * S;
      for (let py = Math.floor(Y0); py < Math.ceil(Y1); py++) {
        const cy = Math.min(py + 1, Y1) - Math.max(py, Y0);
        for (let px = Math.floor(X0); px < Math.ceil(X1); px++) {
          const cx = Math.min(px + 1, X1) - Math.max(px, X0);
          over(px, py, col, a * cx * cy);
        }
      }
    }
  };
  // 纤维：二次曲线，圆头；按到折线的距离算覆盖
  const hairs = (n, col, a0, a1, l0, l1, w, ang = null) => {
    for (let k = 0; k < n; k++) {
      const x = r() * T, y = r() * T;
      const a = ang === null ? r() * TAU : ang + (r() - 0.5) * 0.5;
      const L = l0 + r() * (l1 - l0), bend = (r() - 0.5) * L * 0.3;
      const al = (a0 + r() * (a1 - a0)) * strength, lw = w * (0.6 + r() * 0.8);
      const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
      const qx = (x + ex) / 2 - Math.sin(a) * bend, qy = (y + ey) / 2 + Math.cos(a) * bend;
      const m = Math.max(4, Math.ceil(L * S));
      const pts = [];
      for (let i = 0; i <= m; i++) {
        const t = i / m, u = 1 - t;
        pts.push([(u * u * x + 2 * u * t * qx + t * t * ex) * S, (u * u * y + 2 * u * t * qy + t * t * ey) * S]);
      }
      const hw = (lw * S) / 2;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const [px, py] of pts) { x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); }
      for (let py = Math.floor(y0 - hw - 1); py <= Math.ceil(y1 + hw + 1); py++) {
        for (let px = Math.floor(x0 - hw - 1); px <= Math.ceil(x1 + hw + 1); px++) {
          const cx = px + 0.5, cy = py + 0.5;
          let d = Infinity;
          for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
            const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1;
            const t = Math.max(0, Math.min(1, ((cx - ax) * dx + (cy - ay) * dy) / l2));
            d = Math.min(d, Math.hypot(cx - ax - dx * t, cy - ay - dy * t));
          }
          const cov = Math.max(0, Math.min(1, hw + 0.5 - d)) * Math.min(1, 2 * hw);
          over(px, py, col, al * cov);
        }
      }
    }
  };

  const C = (s) => s.split(',').map(Number);
  if (kind === 'paper') {
    blotches(20, C('60,45,25'), 0.006, 0.014);
    blotches(10, C('255,255,255'), 0.015, 0.03);
    specks(5200, C('50,38,22'), 0.02, 0.07, 0.5, 1.5);
    specks(1600, C('255,255,255'), 0.05, 0.13, 0.5, 1.3);
    hairs(300, C('60,45,25'), 0.025, 0.05, 6, 24, 0.5);
  } else if (kind === 'ink') {
    blotches(12, C('235,229,216'), 0.004, 0.01);
    specks(3600, C('235,229,216'), 0.025, 0.07, 0.5, 1.4);
    hairs(50, C('235,229,216'), 0.025, 0.05, 10, 40, 0.8, -0.12);
  } else throw new Error(`unknown tile: ${kind}`);
  return buf;
}

// 8 位量化，加 ±0.5 的确定性抖动，免得大块的斑出现色带
function quantize(buf) {
  const out = Buffer.alloc(N * N * 3);
  const r = rng(4242);
  for (let i = 0; i < out.length; i++) out[i] = Math.max(0, Math.min(255, Math.round(buf[i] + r() - 0.5)));
  return out;
}

function stats(rgb, base) {
  const L0 = lstar(...hex(base));
  const d = new Float64Array(N * N);
  let sum = 0, sum2 = 0, max = 0;
  for (let i = 0; i < N * N; i++) {
    const v = lstar(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]) - L0;
    d[i] = Math.abs(v);
    sum += v;
    sum2 += v * v;
    max = Math.max(max, d[i]);
  }
  const mean = sum / (N * N);
  const sorted = Array.from(d).sort((a, b) => a - b);
  return { max, p99: sorted[Math.floor(sorted.length * 0.99)], std: Math.sqrt(sum2 / (N * N) - mean * mean), mean };
}

const ppm = (rgb) => Buffer.concat([Buffer.from(`P6\n${N} ${N}\n255\n`), rgb]);
function readPpm(file) {
  const b = readFileSync(file);
  let pos = 0, fields = 0;
  while (fields < 4) {
    while (/\s/.test(String.fromCharCode(b[pos]))) pos++;
    while (!/\s/.test(String.fromCharCode(b[pos]))) pos++;
    fields++;
  }
  return b.subarray(pos + 1);
}

const tmp = mkdtempSync(join(tmpdir(), 'wc-grain-'));
try {
  for (const t of TILES) {
    // 浓度从上限往下调，直到 L* 最大偏差 ≤ 5
    let strength = t.strength, rgb, st;
    for (let iter = 0; iter < 6; iter++) {
      rgb = quantize(render(t.base, t.kind, strength));
      st = stats(rgb, t.base);
      if (st.max <= TARGET_DL) break;
      strength *= (TARGET_DL / st.max) * 0.97;
    }
    const src = join(tmp, `${t.name}.ppm`);
    writeFileSync(src, ppm(rgb));
    const out = join(OUT, `${t.name}.webp`);
    let chosen = null;
    for (const q of [100, 97, 94, 90, 86, 82, 78, 74, 70]) {
      execFileSync('cwebp', ['-quiet', '-q', String(q), '-m', '6', '-sharp_yuv', '-sns', '0', '-f', '0', '-o', out, src]);
      const bytes = statSync(out).size;
      if (bytes <= MAX_BYTES) { chosen = { q, bytes }; break; }
    }
    if (!chosen) throw new Error(`${t.name}: over ${MAX_BYTES} bytes even at q70`);
    const dec = join(tmp, `${t.name}.dec.ppm`);
    execFileSync('dwebp', ['-quiet', out, '-ppm', '-o', dec]);
    const ds = stats(readPpm(dec), t.base);
    const f = (v) => v.toFixed(2);
    console.log(
      `${t.name}.webp  ${N}px  ${(chosen.bytes / 1024).toFixed(1)}KB (q${chosen.q})  strength ${f(strength)}  ` +
        `ΔL* source max ${f(st.max)} p99 ${f(st.p99)} std ${f(st.std)}  |  decoded max ${f(ds.max)} p99 ${f(ds.p99)} std ${f(ds.std)}`,
    );
    if (ds.max > MAX_DL) throw new Error(`${t.name}: decoded ΔL* ${f(ds.max)} > ${MAX_DL}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
