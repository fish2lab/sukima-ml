# 木刻画风组件（东方部分）

东方部分指除 Studio Phantasm 摄影棚（`/ph`、`/ph/*`、`/en/ph…`）以外的全部页面，包括首页、作品集、作品详情、关于、购买、联系、博客、404。
画风照 BX 短片第 2 段「隙间月影」：暖白纸墙、木刻粗黑框、一道带眼睛的隙间从上往下扫过画面、展签从墙上翻出来、全部手写楷体。
画法来源：`/Users/fish2lab/Project/BX/animation/kit.js`、`engine/core.js`、`scenes/2-sukima.js`，移植在 `draw.ts`。

组件陈列页：`/woodcut-lab`（`src/pages/woodcut-lab.tsx`，noindex，不进导航），每个组件摆了 2–3 种参数，写新页面前先去看一眼。

## 用之前先记住五条

1. **只在东方页面用。** 东方页面的 `<html>` 上有 `data-sukima`，全局样式（`src/css/woodcut.css`）和组件用到的颜色变量都挂在它下面；`/ph` 页面没有这些变量，组件放进去会失去颜色。
2. **字体已经全站锁成霞鹜文楷。** 页面模块 CSS 里不要再写 `font-family`（写了也会被压掉）。要等宽的地方（票据、编号、订单号）加 `className="wc-mono"`；`code`、`kbd`、`samp`、`pre` 自动等宽。
3. **颜色只用 `--wc-*` 变量**，不写十六进制。唯一强调色是暗紫 `--wc-accent`；印章红 `--wc-stamp` 只给少量印章元素。
4. **不用渐变、不发光、不加彩色阴影。** 投影一律是平的灰块：`box-shadow: 7px 9px 0 var(--wc-shade)`。实拍图片（作品、原作、头像、二维码）按原样显示，不加任何滤镜。
5. **进场动画交给组件。** 逐字写出、展签翻出、隙间横扫都已经处理好减少动态和首帧不闪；自己写动画时照「动画与减少动态」一节接。

```tsx
import { PaperSection, InkFrame, SweepReveal, LabelCard, HandTitle, Caption, InkButton, InkRule, SukimaSlit } from '@site/src/components/woodcut';
```

## 组件一览

| 组件 | 用途 | 关键 props |
|---|---|---|
| `PaperSection` | 一段纸墙或黑场，统一底色、纸纹、版心宽度、留白 | `tone` paper / wall / ink，`width`，`space`，`edge` |
| `HandTitle` | 手写楷体标题，进入视口逐字写出，SSR 输出全文 | `as`，`size`，`per`，`delay`，`write` |
| `Caption` | 片子左上角那种白底黑框的小展签 | `size`，`write`，`jitter` |
| `InkButton` | 木刻毛边按钮，悬停被墨涂满、字变纸色 | `to` / `href` / 无（button），`variant`，`size` |
| `InkRule` | 木刻毛边分隔线 | `weight`，`dry`，`decorative` |
| `InkFrame` | 木刻粗黑框 + 白卡纸 + 墙上平灰投影，可挂绳、可晃 | `hang`，`swing`，`size`，`caption` |
| `LabelCard` | 美术馆展签，进入视口时以左边为轴翻出、逐行写字 | `title`，`lines`，`spec`，`price`，`flip` |
| `SukimaSlit` | canvas 画的一道隙间（缝、唇线、蝴蝶结、眼睛） | `open`（数字或 MotionValue），`eyes`，`alive` |
| `SweepReveal` | 原作和东方版叠在一个画框里，隙间横扫切换 | `from`，`to`，`progress`，`autoPlay`，`frame` |
| `RoughBorder` | 底层：给任意盒子加木刻毛边（线或墨块外沿） | `variant` line / fill，`weight`，`amp`，`seed`，`jitter` |

所有组件都有 TS 类型（`index.ts` 一并导出 `XxxProps`）。所有「毛边」都由 `seed` 决定形状：同样的 seed 永远同一个形状；只有「抖」的时候（悬停、`jitter`）才每秒换 8 次（字幕框 6 次）。

---

## PaperSection：一段纸墙或黑场

```tsx
<PaperSection tone="wall" width="wide" space="lg" edge="bottom">
  …
</PaperSection>
```

| prop | 默认 | 说明 |
|---|---|---|
| `tone` | `'paper'` | `paper` 暖白纸 #ebe5d8；`wall` 隙间页面的画廊墙 #F7F6F4（放画框、展签用这个）；`ink` 黑场（墨底、纸色字、白刮痕线）。深色模式下 paper / wall 也变成墨底 |
| `width` | `'normal'` | 版心：`narrow` 720、`normal` 1120、`wide` 1360、`full` 满宽。左右留白桌面 56px、手机（≤996px）20px |
| `space` | `'md'` | 上下留白：`none` 0、`sm` 48/32、`md` 96/56、`lg` 144/80（桌面/手机） |
| `edge` | `'none'` | `top` / `bottom` / `both`：上下沿做成木刻刀口的毛边，盖到相邻段落上 3–5px。黑场接纸墙时用 |
| `as` | `'section'` | 也可以 `div` / `header` / `footer` / `article` / `aside` / `main` |
| `innerClassName` | | 版心那层 div 的 class |

注意：
- 它在元素上设了 `data-wc-tone`，里面所有 `--wc-*` 颜色跟着这一段的底色走：黑场里的 `InkButton`、`InkRule`、正文、链接自动变纸色，不用另外写深色样式。
- 自己的元素也可以直接写 `data-wc-tone="ink"` 得到同样的效果（带纸纹背景）。

## HandTitle：手写楷体标题

```tsx
<HandTitle as="h1" size="display">名画与东方的邂逅。</HandTitle>
<HandTitle as="h2" size="section" per={0.03} delay={0.3}>Where Classic Art Meets Touhou</HandTitle>
```

| prop | 默认 | 说明 |
|---|---|---|
| `children` | 必填 | 纯文本字符串；`'\n'` 换行 |
| `as` | `'h2'` | `h1`–`h6` / `p` / `span` / `div` |
| `size` | `'title'` | `display` 首屏大标题（2.3–4.6rem）、`title` 页面标题（1.8–3rem）、`section` 段落标题（1.35–2rem）、`inherit` |
| `per` | `.04` | 每字秒数（片子 .03–.05） |
| `delay` | `0` | 进入视口后等几秒再写 |
| `wobble` | `1` | 每个字固定的小倾斜（±1.15°）和上下错位（±.02em）；0 端正 |
| `write` | `true` | `false` 直接显示 |
| `seed` | `3` | 倾斜、错位的种子 |

注意：
- SSR 输出完整文字（逐字的 span），搜索引擎照常收录；标题标签用 `aria-label` 给读屏读整句，`p` / `span` / `div` 用一段 `wc-sr-only` 文字。
- 西文按单词不断行；「，。」等收尾标点不会落到行首，「（「《」等不会落到行尾。
- 标题的 margin 用 Infima 默认值，自己在页面里调。

## Caption：白底黑框的小展签

```tsx
<Caption>隙间月影</Caption>
<Caption as="h2" size="lg" write jitter>放在摊位上展示</Caption>
```

| prop | 默认 | 说明 |
|---|---|---|
| `children` | 必填 | 纯文本，短（片子要求 12 字以内），不换行 |
| `as` | `'span'` | `span` / `p` / `div` / `h2` / `h3` / `h4` |
| `size` | `'md'` | `sm` .95rem、`md` 1.15rem、`lg` 1.5rem |
| `write` | `false` | 进入视口时框从左往右展开（.2 秒）、字逐字打出（每字 `per` 秒） |
| `per` | `.06` | 每字秒数 |
| `jitter` | `false` | 框一直轻轻地抖（6 次/秒），只在视口里抖 |
| `seed` | `3` | |

注意：深浅色模式、黑场里都是卡纸白底 + 墨字墨框（和片子黑场里的字幕一样）。它是 `inline-block`，定位由页面决定。

## InkButton：木刻毛边按钮

```tsx
<InkButton to="/sukima-ml">看作品集</InkButton>                  {/* 站内链接，自动加 baseUrl */}
<InkButton href="https://space.bilibili.com/368984327" variant="solid">Bilibili</InkButton>  {/* 外链，新窗口 */}
<InkButton size="lg" onClick={…}>加入购物袋</InkButton>           {/* <button type="button"> */}
```

| prop | 默认 | 说明 |
|---|---|---|
| `to` / `href` | | 二选一；都不给时渲染 `<button>`，可以传 `onClick`、`disabled`、`type` 等 |
| `variant` | `'outline'` | `outline` 墨框空心，悬停时从左往右被墨涂满、字变纸色（触屏上按下时涂）；`solid` 实心墨块 + 平灰投影，悬停往投影方向按下去 |
| `size` | `'md'` | `sm` 36px 高、`md` 44px、`lg` 56px（最小触控高度） |
| `seed` | `7` | |

其余属性透传给 Docusaurus `Link` 或 `<button>`。悬停、键盘聚焦时边框抖动。颜色用 `--wc-fg` / `--wc-bg`，黑场里自动反过来。

## InkRule：木刻毛边分隔线

```tsx
<InkRule />
<InkRule weight="bold" dry={0.4} decorative />
```

| prop | 默认 | 说明 |
|---|---|---|
| `weight` | `'thin'` | `hair` 1.4px、`thin` 2.6px、`bold` 5px，或直接给像素 |
| `dry` | `0` | 飞白 0..1（断续的空隙） |
| `taper` | `.1` | 两头收尖的比例 |
| `amp` | 按粗细 | 中线上下起伏（像素） |
| `length` | `720` | 标称长度（像素）；线按这个长度生成再拉伸到实际宽度，填和实际宽度差不多的数 |
| `decorative` | `false` | 默认是 `role="separator"`；纯装饰时设 true（对读屏隐藏） |
| `jitter` | `false` | 在视口里时一直轻轻地抖 |
| `color` | `--wc-line` | |

上下各有 1.5rem 外边距，用 `className` / `style` 改。

## InkFrame：木刻粗黑框

```tsx
<InkFrame hang swing caption="蓬莱宫娥 · amibazh">
  <img src={src} alt="蓬莱宫娥" width={1200} height={1404} loading="lazy" decoding="async" />
</InkFrame>
```

画法照片子 `s2Frame`：外沿木刻毛边的墨框、框上一道断续的白刻线、四角斜接缝、白卡纸衬、画心外一圈细灰线、墙上一块平的灰投影。

| prop | 默认 | 说明 |
|---|---|---|
| `children` | 必填 | 画心：一张 `<img>`（自动 `width: 100%`）、`<picture>`，或任何内容 |
| `as` | `'figure'` | 放进 `<button>` 这类只能装行内内容的地方时用 `span` |
| `size` | `'md'` | 框宽和卡纸衬的档：`sm` / `md` / `lg`，都按屏幕宽度 clamp |
| `hang` | `false` | 挂绳：从上方挂画轨斜拉到画框两个上角；上方多出画框宽 13% 的高度 |
| `rail` | `true`（hang 时） | 挂画轨，比画框宽出两边各 14% |
| `swing` | `false` | 进入视口时在挂绳上晃一下（片子 `s2Hang`：峰值约 ±1.5°，2.4 秒内停稳），减少动态时不晃 |
| `swingKey` | | 这个值变了就再晃一下（轮播换页时用） |
| `shadow` | `true` | 墙上的平灰投影 |
| `caption` | | 图注，仅 `as="figure"` 时输出 `figcaption` |
| `nominal` | `[420, 540]` | 毛边的标称尺寸，填和实际画框差不多的数（见「毛边怎么做的」） |
| `seed` | `21` | |

注意：
- `<img>` 一定给 `width` / `height`，浏览器才能在图片加载前留出高度，不跳。
- 画框宽度由父元素决定（`display: block`，占满父元素）。要限制大小就给父元素定宽。
- 挂绳、画框一起绕挂画轨中点转；挂画轨自己不动。

## LabelCard：美术馆展签

```tsx
<LabelCard
  title="妖怪之山的秋千"
  lines={['弗拉戈纳尔《秋千》', '東風谷早苗 & 射命丸文 · 画师 真菌_isomer']}
  spec="14寸画芯"
  price="¥68"
/>
```

片子 `s2Card`：卡纸白卡片、细墨描边、墙上平灰投影。进入视口时以左边为轴翻出来（.3 秒，easeOutBack 带一点过冲），作品名每字 .03 秒写出，其余各行在翻出后 .2 / .35 / .45 / .55 秒依次从左往右擦出。

| prop | 默认 | 说明 |
|---|---|---|
| `title` | | 作品名（纯文本），大号，逐字写出 |
| `titleAs` | `'h3'` | `h2` / `h3` / `h4` / `p` |
| `lines` | `[]` | 作品名下面的几行（原作、角色 · 画师…），ReactNode |
| `spec` / `price` | | 规格、价格，贴在卡片底部 |
| `children` | | 其余内容，放在 `lines` 之后，跟着一起擦出 |
| `flip` | `true` | `false` 直接显示 |
| `as` | `'aside'` | `aside` / `div` / `section` / `article` / `figcaption` |
| `nominal` | `[420, 340]` | 毛边标称尺寸 |
| `seed` | `31` | |

注意：
- 屏上文字、价格照事实源抄（作品信息在 `src/data/galleryData.ts`），不要编。
- 和画框并排时，放进 `display: grid` 的一格，卡片会被拉到和画一样高，规格、价格自动贴底。
- 深色模式下是墨底卡片（`--wc-card`）、纸色字、纸色细线。

## SukimaSlit：一道隙间

```tsx
<SukimaSlit />                                   {/* 张满，宽 100%，宽高比 3.6 */}
<SukimaSlit open={openMotionValue} height={180} eyes={6} />
<SukimaSlit height={96} eyes={5} alive={false} label="一道静止的隙间" />
```

canvas 画（片子 `s2Tear` + `s2Eyes`）：黑色透镜形的缝，白色刮痕唇线，两端各一个小蝴蝶结，缝里 5–7 只睁开的眼睛（纸色眼白、暗紫瞳孔），各看各的方向，偶尔眨一下；边缘每秒抖 8 次。

| prop | 默认 | 说明 |
|---|---|---|
| `open` | `1` | 0..1：0–.3 先划出一道线、两端系上蝴蝶结，.3–1 张开。可以传 framer-motion 的 `MotionValue<number>`，变化时直接重画、不触发 React 重渲染 |
| `width` | `'100%'` | 数字是像素，也可以是 CSS 长度 |
| `height` | | 不给时按 `aspect` 算 |
| `aspect` | `3.6` | 宽高比，建议 3–5（太窄眼睛会挤） |
| `eyes` | `7` | 眼睛只数，建议 5–7 |
| `alive` | `true` | 抖、眼睛换方向、眨眼。只在可见时动（IntersectionObserver），减少动态时静止 |
| `glance` | `.9` | 眼睛平均多少秒换一次方向（片子里是 .28，网页上常驻，放慢） |
| `label` | | 给读屏的说明（`role="img"`）；不给时是纯装饰（`aria-hidden`） |
| `seed` | `17` | |

注意：
- 画布按 `devicePixelRatio`（最高 2）缩放，ResizeObserver 跟随容器尺寸；元素本身有确定尺寸，SSR 时是一块空白，不跳。
- 颜色从 CSS 变量 `--wc-slit*` 读：深色模式、黑场里缝外沿自动描一圈纸色、蝴蝶结变纸色。
- 缝的两端要给蝴蝶结留地方：组件的盒子两端各留约 `高 × 0.12`。

## SweepReveal：原作 → 东方版

```tsx
<SweepReveal
  from={{ src: useBaseUrl(a.originalImagePath), alt: `原作：${a.originalPainting}`, width: a.originalImageWidth, height: a.originalImageHeight }}
  to={{ src: useBaseUrl(a.imagePath), alt: `东方版：${a.title}`, width: a.imageWidth, height: a.imageHeight }}
  frame={{ hang: true, swing: true }}
/>
```

两张普通 `<img>` 叠在同一个画框里。一道横向的隙间从画的上沿扫到下沿，扫过的部分已经是东方版；两张图的分界线（`clip-path`）始终在缝的中线上，藏在缝里。节奏照片子：进入视口后原作停 .35 秒 → 划线 .2 秒 → 张开 .25 秒 → 扫过 .7 秒 → 合上 .25 秒。

| prop | 默认 | 说明 |
|---|---|---|
| `from` / `to` | 必填 | `{ src, alt, width, height, srcSet?, sizes? }`：原作 / 东方版 |
| `progress` | | 外部驱动的进度 0..1（0 原作，1 东方版且缝已合上）。传 `MotionValue` 做滚动驱动；传了就不自动播放、不能点击 |
| `autoPlay` | `true` | 进入视口（可见一半）时自动扫一次 |
| `delay` | `.35` | 进入视口后原作停几秒 |
| `interactive` | `true` | 点击 / 回车 / 空格在原作和东方版之间来回切；根元素是 `<button aria-pressed>`，按下 = 东方版 |
| `aspectRatio` | `to` 的宽高比 | 两张图都按 cover 铺满这个比例 |
| `frame` | `true` | `InkFrame` 画框；`false` 不要框；也可以传 `InkFrame` 的参数（`hang`、`swing`、`size`…） |
| `eyes` / `seed` | `7` / `23` | 缝里的眼睛 |
| `toggleLabel` | 「显示东方版」 | 按钮的读屏名称（英文站：Show the Touhou version，`i18n/en/code.json` 的 `woodcut.sweep.toggle`） |
| `onToggle` | | `(showing: 'from' \| 'to') => void`，点击和自动播放都会触发 |
| `priority` | `false` | 首屏大图：`loading="eager"` + `fetchpriority="high"` |

滚动驱动：

```tsx
const ref = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
const progress = useTransform(scrollYProgress, [0.1, 0.9], [0, 1], { clamp: true });
<div ref={ref} style={{ height: '220vh' }}>
  <div style={{ position: 'sticky', top: '12vh' }}><SweepReveal from={…} to={…} progress={progress} /></div>
</div>
```

注意：
- 画心有固定宽高比（`aspect-ratio`），图片加载前后不跳。
- 缝比画宽（约 1.6 倍），会伸到画框和墙上；页面主体 `.main-wrapper` 横向 `overflow: clip`，不会出横向滚动条。手机上缝两端可能被屏幕边裁掉一点。
- 减少动态：直接显示东方版（水合前就是），点击时瞬间切换。

## RoughBorder：给自己的盒子加木刻毛边

写新组件（票据、表格、对话框）时用。它绝对定位盖在父元素上，父元素要 `position: relative`。

```tsx
<div style={{ position: 'relative', background: 'var(--wc-card)', color: 'var(--wc-card)' }}>
  <RoughBorder variant="fill" amp={0.8} />                               {/* 同色墨块的毛边外沿 */}
  <RoughBorder variant="line" weight={1.4} color="var(--wc-line)" />     {/* 一圈细墨线 */}
  …
</div>
```

| prop | 默认 | 说明 |
|---|---|---|
| `variant` | `'line'` | `line` 沿盒子边描一圈毛边线（片子 `outline`）；`fill` 给同色实心块加刀口外沿（片子 `block`），`color` 要和块的底色一样 |
| `weight` | `2` | line 的线宽 |
| `amp` | line .6 / fill 1.2 | 起伏幅度（像素） |
| `freq` | line 40 / fill 14 | 起伏的长度 |
| `roughness` | `.3` | line 的线宽起伏 |
| `dry` | `0` | line 的飞白 |
| `spike` / `spikeLen` | `0` / `4` | fill 偶尔的长刺 |
| `inset` | `0` | line 的中线离盒子边向内多少（数字 = 像素，或 CSS 长度） |
| `sides` | `'all'` | `all` / `x`（上下）/ `y`（左右）/ 单独一边 |
| `nominal` | `[240, 160]` | 标称尺寸 |
| `jitter` | `0` | `useJitterTick(active)` 的返回值 |
| `color` / `opacity` | currentColor | |

### 毛边怎么做的

每条边单独一个 SVG，path 在渲染时用 `draw.ts` 的 `rough` / `stroke` 按 seed 算出来，SSR 直接输出，不用量尺寸。SVG 用 `preserveAspectRatio="none"`，只沿边的长度方向拉伸，厚度方向 1:1，所以起伏和线宽在任何尺寸下都是真实像素。代价是起伏的「波长」随实际长度等比伸缩：`nominal` 填和实际尺寸差不多的数，波长就接近设计值。每条边的 path 约 0.7KB；一个 InkFrame 20 个 SVG，HTML 约 17KB（未压缩），大页面上别一次铺几十个。

全局 CSS 里的毛边（导航栏底线、链接下划线、`<hr>`、页脚上沿）用的是两张遮罩图 `assets/mask-rule.svg`、`assets/mask-edge.svg`（`mask-image`，颜色由 `background` 决定）。

## draw.ts：画具

BX 画法的 TS 纯函数版，不依赖 React，可以在任何 canvas 上画，也能给 SSR 输出 SVG path。

| 函数 | 片子里的名字 | 作用 |
|---|---|---|
| `K` | `K` | 色表 |
| `rng(seed)`、`hash(k, seed)`、`noise1(x, seed)` | 同名 | 带种子的随机数、整数哈希、一维值噪声 |
| `easeIO`、`easeOut`、`easeIn`、`easeOutQuint`、`easeOutBack`、`easeInOutSine`、`sm(a, b, t, e)`、`settle(t, t0, o)` | 同名 | 缓动与余振 |
| `tick(t, fps = 8)` | `tick` | 「抖」：加到 seed 上 |
| `writeP(t, t0, str, per)` | `writeP` | 逐字写出的进度 |
| `rough(pts, o)` | `rough` | 闭合轮廓 → 木刻刀口毛边轮廓 |
| `strokePolys(pts, o)` | `stroke` 的几何部分 | 一笔 → 多边形（两侧粗糙、两头收尖、飞白） |
| `block(ctx, pts, color, o)`、`stroke(ctx, pts, o)`、`scratch(ctx, pts, o)`、`outline(ctx, pts, o)` | 同名 | 在 canvas 上画墨块、一笔、白刮痕、描边 |
| `eyeLines(ctx, x, y, r, o)` | `eyeLines` | 觉之瞳：只有眼皮线和睫毛；`open`、`look`、`iris` |
| `crackPts(a, b, hw, seed)`、`lips(ctx, q, seed)`、`bow(ctx, x, y, s, seed)` | `s2CrackPts`、`s2Lips`、`s2Bow` | 隙间的透镜轮廓、唇线刮痕、蝴蝶结 |
| `drawSlit(ctx, params)` | `s2Tear` + `s2Eyes` | 画一整道隙间（SukimaSlit 用的就是它） |
| `sweepY(p, top, h, pad)`、`hangAngle(t, t0)`、`SWEEP_TIMING` | `s2SweepY`、`s2Hang`、`S2.T` | 横扫高度、挂绳晃动角、第 2 段的节奏 |
| `pathD(pts)`、`roughPathD(pts, o)`、`strokePathD(pts, o)` | | 点列 / 毛边 / 一笔 → SVG path 字符串 |

坐标单位是 CSS 像素。片子里的数值（1080p 逻辑单位）照搬时按比例缩放。

---

## 全局样式（`src/css/woodcut.css`）

### `<html data-sukima>` 标记

- `src/theme/Layout/index.tsx` 包了一层原版 Layout，里面渲染 `SukimaScope`：用路由判断，东方页面经 `@docusaurus/Head` 输出 `<html data-sukima="">`，SSR 的静态 HTML 里就有，首帧不闪；客户端换页时在 layout effect 里同步改一次。
- 判断函数：`isSukimaPath(pathname, { baseUrl, locales })`（纯函数）和 `useIsSukima()`（hook，在页面、Layout、Navbar、Footer 里用）。`/ph`、`/ph/*`、`/ph.html`、`/en/ph…` 返回 false，其余都是 true。
- 放在 Layout 而不是 Root：Root 拿到的是路由刚跳过去的新地址，旧页面要等新页面的代码块加载完才换下来；Layout 在页面里面，拿到的是正在显示的地址。

### 颜色变量

常量（片子 `K`，不随深浅色变）：

| 变量 | 值 | 用途 |
|---|---|---|
| `--wc-k-paper` | #ebe5d8 | 纸 |
| `--wc-k-wall` | #F7F6F4 | 隙间页面的纸（画廊墙） |
| `--wc-k-card` / `--wc-k-wall-card` | #f3efe6 / #FCFBF9 | 字幕框 / 展签、卡纸衬 |
| `--wc-k-ink` / `--wc-k-ink2` | #161412 / #24211e | 墨 |
| `--wc-k-g1` / `g2` / `g3` | #cdc6b8 / #8e887d / #4b4741 | 三级灰 |
| `--wc-k-plum` | #4B2A63 | 暗紫：唯一强调色 |
| `--wc-k-stamp` | #a3342c | 印章红：只给印章 |

语义变量（跟深浅色、`data-wc-tone` 走；写样式用这些）：

| 变量 | 纸（浅色） | 墨（深色、黑场） | 用途 |
|---|---|---|---|
| `--wc-bg` | 纸 / 墙 | 墨 | 底色 |
| `--wc-fg` | 墨 | 纸 | 正文、线、按钮 |
| `--wc-fg-2` | g3 | g1 | 次要文字（对比度 ≥ 7） |
| `--wc-fg-3` | g2 | g2 | 装饰线、占位；浅色底上不要拿来写正文（2.8:1） |
| `--wc-line` / `--wc-line-soft` | 墨 / 墨 16% | 纸 / 纸 20% | 线 / 细分隔 |
| `--wc-tint` | 墨 6% | 纸 8% | 悬停、选中、代码底 |
| `--wc-accent` / `--wc-on-accent` | 暗紫 / 纸 | 淡紫 #b7a3cb / 墨 | 链接、焦点框、选中文字 |
| `--wc-stamp` | #a3342c | #c4493f | 印章 |
| `--wc-card` / `--wc-card-fg` / `--wc-card-fg-2` / `--wc-card-line` | 卡纸白 / 墨 / g3 / 墨 | ink2 / 纸 / g1 / 纸 70% | 展签、卡片 |
| `--wc-shade` | #dbd4c6（墙上 #e0dcd3） | #070606 | 平灰投影 |
| `--wc-frame` / `--wc-mat` | 墨 / 卡纸白 | ink2 / #d8d2c6 | 画框、卡纸衬 |
| `--wc-slit*` | | | SukimaSlit 读的颜色 |
| `--wc-font-hand` / `--wc-font-mono` | | | 霞鹜文楷 / 系统等宽 |

对比度：墨/纸 14.6，g3/纸 7.3，暗紫/纸 9.2，纸/墨 14.6，g1/墨 10.8，g2/墨 5.2，淡紫/墨 8.0，都在 4.5:1 以上。

Infima 变量（`--ifm-*`）和旧页面用的 `--art-*` 已经接到这些变量上：旧页面不改代码也会换成纸墨配色和手写字。

### 字体

霞鹜文楷屏幕版（`lxgw-wenkai-screen-webfont@1.7.0`，OFL），只引入常规字重那一份 `lxgwwenkaiscreenr.css`（字体族名 `LXGW WenKai Screen R`），在 `src/theme/Root.tsx` 里 import。97 个按 unicode-range 分片的 woff2 由 webpack 打包进 `build/assets/fonts/`（最小的一片内联进 CSS），自托管，浏览器只下载页面上用到的分片。只有一个字重：标题不假粗（`font-synthesis: none`），`strong` / `em` 允许浏览器合成以保留强调。原来 Root 从 fonts.carolyn.sh 加载的字体保留，给 `/ph` 和导航栏 Logo 用。

### 纸纹

`assets/grain-paper.webp`（43KB）、`grain-wall.webp`（38KB）、`grain-ink.webp`（22KB）：1024px 的无缝平铺图，照片子 `tile('paper' | 'ink')` 逐笔复刻，CSS 按 512px 显示。明暗起伏：解码后的 CIE L* 最大偏差 ≤ 4.3（上限 5）。铺在 `<html>` 和 `[data-wc-tone]` 上；根元素背景随文档滚动，不用 `background-attachment: fixed`，滚动时不重绘。

### 导航栏、手机菜单、页脚

- 导航栏：纸底 + 纸纹，底边一道木刻粗墨线，链接手写楷体，悬停 / 当前页下面一笔墨线；Logo 字体不变（`wc-keep-font`），悬停色换成暗紫。去掉了原来的毛玻璃（`backdrop-filter`）。
- 手机菜单：同一张纸，品牌行下面一笔墨线，当前页左边一道墨。
- 页脚：黑场（墨底 + 墨纹、纸色字），上沿是木刻刀口的毛边；深色模式下再压暗一档，上沿加一道纸色刮痕。
- `/ph` 的导航栏、页脚一律不受影响（没有 `data-sukima`）。

### 工具 class

- `wc-mono`：等宽（票据、编号），带等宽数字。
- `wc-sr-only`：读屏可见、屏幕上隐藏。
- `wc-keep-font`：保留元素自己的字体（只给 Logo 用）。

## 动画与减少动态

- `docusaurus.config.ts` 里的内联脚本在首帧前给 `<html>` 写 `data-wc-motion="on" | "off"`：没有要求减少动态时是 on；要求减少动态时是 off；4 秒还没水合（脚本出错、网太慢）也改成 off。没有 JS 时没有这个属性。
- 进场动画（HandTitle、Caption 的 write、LabelCard）用 `useReveal(ref, 时长)`，把返回值写到元素的 `data-wc-reveal` 上：
  - `pending`：SSR 的初始值。只在 `html[data-wc-motion='on']` 时 CSS 把元素藏成动画起点，所以首帧不会先显示再藏起来；没有 JS 时照常显示。
  - `play`：进入视口，CSS 动画开始；`done`：结束。
  - `static`：不能动，直接显示最终状态。
- 自己写进场动画照同样的写法：

```css
:global(html[data-wc-motion='on']) .thing[data-wc-reveal='pending'] { transform: scaleX(0); }
.thing[data-wc-reveal='play'] { animation: … both; }
```

- 其他 hook：`useMotionAllowed()`（响应系统设置变化，SSR 为 false）、`motionAllowedNow()`、`useJitterTick(active, fps)`。
- 节奏：诙谐电影式的「停住、突然动、再停住」，用 easeOut / easeOutBack，不用长时间的淡入淡出。

## 生成的素材

| 文件 | 生成命令 | 说明 |
|---|---|---|
| `assets/grain-*.webp` | `node scripts/woodcut/make-grain.mjs` | 需要 cwebp / dwebp（`brew install webp`）；会打印大小和 L* 偏差 |
| `assets/mask-*.svg` | `node scripts/woodcut/make-masks.mjs` | |

两个脚本直接 import `draw.ts`（Node ≥ 22.18 的类型擦除），所以 `draw.ts` 不能 import 别的文件，也只能写可擦除的 TS（不用 enum、namespace）。

## 文件地图

```
src/components/woodcut/
  index.ts            统一导出
  draw.ts             画具（BX 移植，纯函数）
  edges.ts            毛边 SVG 边条的几何
  text.ts             逐字写出的断行与字形抖动
  hooks.ts            useMotionAllowed / useJitterTick / useReveal
  scope.ts            isSukimaPath / useIsSukima
  SukimaScope.tsx     <html data-sukima>（src/theme/Layout 里渲染）
  RoughBorder.tsx     木刻毛边
  WrittenText.tsx     逐字写出的字（内部用）
  PaperSection / HandTitle / Caption / InkButton / InkRule / InkFrame / LabelCard / SukimaSlit / SweepReveal (.tsx + .module.css)
  assets/             纸纹 WebP、遮罩 SVG
src/css/woodcut.css   全局画风（全部挂在 html[data-sukima] 下）
src/theme/Layout/     输出 data-sukima
src/theme/Root.tsx    引入霞鹜文楷
src/pages/woodcut-lab.tsx  组件陈列页
scripts/woodcut/      素材生成脚本
```
