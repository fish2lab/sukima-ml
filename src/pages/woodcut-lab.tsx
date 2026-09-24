import React, { useRef, useState, type ReactNode } from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useScroll, useTransform } from 'framer-motion';
import { artworks } from '../data/galleryData';
import {
  Caption,
  HandTitle,
  InkButton,
  InkFrame,
  InkRule,
  K,
  LabelCard,
  PaperSection,
  SukimaSlit,
  SweepReveal,
  type SweepImage,
} from '../components/woodcut';
import styles from './woodcut-lab.module.css';

/**
 * 木刻组件陈列：每个组件摆 2–3 种参数，给主会话逐个验收。noindex，不进导航。
 * 组件文档：src/components/woodcut/README.md
 */

const SWATCHES: ReadonlyArray<readonly [string, string, string]> = [
  ['--wc-k-paper', K.paper, '纸'],
  ['--wc-k-wall', K.wall, '隙间页面的纸'],
  ['--wc-k-ink', K.ink, '墨'],
  ['--wc-k-g1', K.g1, '灰 1'],
  ['--wc-k-g2', K.g2, '灰 2'],
  ['--wc-k-g3', K.g3, '灰 3'],
  ['--wc-k-plum', K.plum, '暗紫（唯一强调色）'],
  ['--wc-k-stamp', K.stamp, '印章红（只给印章）'],
];

function Note({ children }: { children: ReactNode }): ReactNode {
  return <p className={`${styles.note} wc-mono`}>{children}</p>;
}

function Block({ name, desc, children }: { name: string; desc: string; children: ReactNode }): ReactNode {
  return (
    <div className={styles.block}>
      <div className={styles.blockHead}>
        <Caption as="h2" size="md">
          {name}
        </Caption>
        <p className={styles.desc}>{desc}</p>
      </div>
      {children}
    </div>
  );
}

function ScrollDriven({ from, to }: { from: SweepImage; to: SweepImage }): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const progress = useTransform(scrollYProgress, [0.1, 0.9], [0, 1], { clamp: true });
  return (
    <div ref={ref} className={styles.scrollTrack}>
      <div className={styles.scrollSticky}>
        <div className={styles.frameCol}>
          <SweepReveal from={from} to={to} progress={progress} seed={41} frame={{ size: 'sm' }} />
        </div>
        <Note>progress = useTransform(scrollYProgress, [.1, .9], [0, 1])：往下滚，缝跟着滚动扫过</Note>
      </div>
    </div>
  );
}

export default function WoodcutLab(): ReactNode {
  const swing = artworks[0];
  const yukari = artworks[1];
  const meninas = artworks[2];
  const from: SweepImage = {
    src: useBaseUrl(swing.originalImagePath),
    alt: `原作：${swing.originalPainting}`,
    width: swing.originalImageWidth,
    height: swing.originalImageHeight,
  };
  const to: SweepImage = {
    src: useBaseUrl(swing.imagePath),
    alt: `东方版：${swing.title}（${swing.touhouCharacter}）`,
    width: swing.imageWidth,
    height: swing.imageHeight,
  };
  const yukariSrc = useBaseUrl(yukari.imagePath);
  const meninasSrc = useBaseUrl(meninas.imagePath);
  const [open, setOpen] = useState(0.7);
  const [clicks, setClicks] = useState(0);
  const [swingKey, setSwingKey] = useState(0);

  return (
    <Layout title="木刻组件陈列" description="隙间月影木刻画风组件陈列（内部验收用）">
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <main>
        <PaperSection tone="paper" space="md" width="wide">
          <Caption write jitter size="lg">
            木刻组件陈列
          </Caption>
          <HandTitle as="h1" size="display" className={styles.pageTitle}>
            画风地基：十个组件，三种纸
          </HandTitle>
          <p className={styles.lead}>
            给主会话逐个验收用，不进导航、不收录。画风照 BX 短片第 2 段：纸墙、木刻黑框、隙间横扫、展签翻出。用法见 src/components/woodcut/README.md。
          </p>
          <div className={styles.swatches}>
            {SWATCHES.map(([name, hex, label]) => (
              <div key={name} className={styles.swatch}>
                <span className={styles.chip} style={{ background: hex }} />
                <span>{label}</span>
                <span className="wc-mono">{hex}</span>
              </div>
            ))}
          </div>
        </PaperSection>

        <PaperSection tone="wall" space="md" width="wide" edge="both">
          <Block name="SweepReveal" desc="原作和东方版叠在同一个画框里，一道带眼睛的隙间从上往下扫过；分界线始终藏在缝里。galleryData 第一幅：《秋千》。">
            <div className={styles.grid3}>
              <div className={styles.cell}>
                <SweepReveal from={from} to={to} frame={{ hang: true, swing: true }} seed={23} />
                <Note>默认：进入视口停 .35 秒后自动扫一次；点击 / 回车来回切（aria-pressed）。frame = hang + swing</Note>
              </div>
              <div className={styles.cell}>
                <SweepReveal from={from} to={to} autoPlay={false} eyes={5} seed={57} frame={{ size: 'lg' }} />
                <Note>autoPlay=false，eyes=5，frame.size=lg：只在点击时切换</Note>
              </div>
              <div className={styles.cell}>
                <SweepReveal from={from} to={to} frame={false} delay={1} seed={88} />
                <Note>frame=false，delay=1：不要画框，进入视口停 1 秒再扫</Note>
              </div>
            </div>
          </Block>
          <ScrollDriven from={from} to={to} />
        </PaperSection>

        <PaperSection tone="paper" space="md" width="wide">
          <Block name="SukimaSlit" desc="canvas 画的一道隙间：透镜形黑缝、白色刮痕唇线、两端蝴蝶结、缝里 5–7 只眼睛（暗紫瞳孔）。边缘每秒抖 8 次，只在可见时动。">
            <div className={styles.stack}>
              <SukimaSlit aspect={4.2} seed={17} />
              <Note>open=1，aspect=4.2，seed=17，eyes=7（默认）</Note>
              <div className={styles.slitRow}>
                <div className={styles.slitBox}>
                  <SukimaSlit open={open} height={180} seed={29} eyes={6} />
                </div>
                <label className={styles.range}>
                  <span className="wc-mono">open = {open.toFixed(2)}</span>
                  <input type="range" min={0} max={1} step={0.01} value={open} onChange={(e) => setOpen(Number(e.target.value))} />
                </label>
              </div>
              <Note>height=180，eyes=6：拖动滑块看 0–.3 划线、.3–1 张开</Note>
              <div className={styles.slitSmall}>
                <SukimaSlit height={96} eyes={5} alive={false} seed={63} label="一道静止的隙间" />
              </div>
              <Note>height=96，eyes=5，alive=false（不抖、眼睛不动），label（role=img）</Note>
            </div>
          </Block>
        </PaperSection>

        <PaperSection tone="wall" space="md" width="wide">
          <Block name="InkFrame" desc="木刻粗黑框：外沿毛边、白刻线、四角斜接缝、白卡纸衬、墙上平灰投影；可选挂绳和到位时晃一下。">
            <div className={styles.grid3}>
              <div className={styles.cell}>
                <InkFrame caption={`${meninas.title} · ${meninas.artist}`}>
                  <img src={meninasSrc} alt={meninas.title} width={meninas.imageWidth} height={meninas.imageHeight} loading="lazy" decoding="async" />
                </InkFrame>
                <Note>默认 size=md，带 figcaption</Note>
              </div>
              <div className={styles.cell}>
                <InkFrame hang swing swingKey={swingKey}>
                  <img src={yukariSrc} alt={yukari.title} width={yukari.imageWidth} height={yukari.imageHeight} loading="lazy" decoding="async" />
                </InkFrame>
                <Note>hang + swing：挂画轨、两根挂绳；swingKey 变了再晃</Note>
                <InkButton size="sm" onClick={() => setSwingKey((k) => k + 1)}>
                  再晃一下
                </InkButton>
              </div>
              <div className={styles.cell}>
                <InkFrame size="sm" shadow={false} seed={77}>
                  <img src={meninasSrc} alt={meninas.subtitle} width={meninas.imageWidth} height={meninas.imageHeight} loading="lazy" decoding="async" />
                </InkFrame>
                <Note>size=sm，shadow=false</Note>
              </div>
            </div>
          </Block>
        </PaperSection>

        <PaperSection tone="wall" space="md" width="wide">
          <Block name="LabelCard" desc="美术馆展签：白卡片、细墨描边、平灰投影；进入视口时以左边为轴翻出，作品名逐字写出，其余逐行擦出。">
            <div className={styles.grid3}>
              <LabelCard
                title={swing.title}
                lines={[swing.originalPainting, `${swing.touhouCharacter} · 画师 ${swing.artist}`]}
                spec="14寸画芯"
                price="¥68"
              />
              <LabelCard title={yukari.title} titleAs="h4" lines={[yukari.originalPainting]} seed={52}>
                <p className={styles.cardText}>{yukari.description}</p>
              </LabelCard>
              <LabelCard title={meninas.title} lines={[meninas.touhouCharacter]} flip={false} seed={73} />
            </div>
            <Note>① 完整展签（规格、价格取自 BX 片子第 2 段的作品表）② 带 children 的说明卡 ③ flip=false 直接显示</Note>
          </Block>
        </PaperSection>

        <PaperSection tone="paper" space="md" width="wide">
          <Block name="HandTitle" desc="手写楷体标题，进入视口时逐字写出（每字 .03–.05 秒）；SSR 输出完整文字。">
            <div className={styles.stack}>
              <HandTitle as="h2" size="title">
                名画与东方的邂逅。
              </HandTitle>
              <Note>size=title，per=.04（默认）</Note>
              <HandTitle as="h3" size="section" per={0.03} delay={0.3} wobble={1.6} seed={9}>
                Where Classic Art Meets Touhou
              </HandTitle>
              <Note>size=section，per=.03，delay=.3，wobble=1.6：西文按单词不断行</Note>
              <HandTitle as="p" size="section" write={false}>
                如果维米尔生活在幻想乡，他会画谁？
              </HandTitle>
              <Note>as=p，write=false：直接显示</Note>
            </div>
          </Block>
          <InkRule />
          <Block name="Caption" desc="片子左上角那种白底黑框的展签小标签。深浅色模式下都是白底黑字。">
            <div className={styles.row}>
              <Caption>隙间月影</Caption>
              <Caption size="lg" write jitter seed={12}>
                放在摊位上展示
              </Caption>
              <Caption size="sm">14寸画芯</Caption>
            </div>
            <Note>md 静态 / lg write + jitter（6 次/秒）/ sm</Note>
          </Block>
          <Block name="InkRule" desc="木刻毛边的分隔线：一笔两头略收尖的墨线。">
            <InkRule weight="hair" seed={3} />
            <InkRule weight="thin" seed={4} />
            <InkRule weight="bold" dry={0.4} seed={6} jitter />
            <Note>hair / thin（默认）/ bold + dry=.4 + jitter</Note>
          </Block>
          <Block name="InkButton" desc="木刻毛边的按钮：悬停时被墨涂满、字变纸色；to 站内链接，href 外链，都不给时是 button。">
            <div className={styles.row}>
              <InkButton to="/sukima-ml">看作品集</InkButton>
              <InkButton href="https://space.bilibili.com/368984327" variant="solid">
                Bilibili
              </InkButton>
              <InkButton size="lg" onClick={() => setClicks((n) => n + 1)}>
                按了 {clicks} 下
              </InkButton>
              <InkButton size="sm" disabled>
                不可用
              </InkButton>
            </div>
            <Note>outline + to / solid + href（新窗口）/ lg button / sm disabled</Note>
          </Block>
        </PaperSection>

        <PaperSection tone="ink" space="lg" width="normal" edge="both" seed={5}>
          <Block name="PaperSection" desc="一段纸墙或黑场。这一段是 tone=ink、edge=both：墨底、纸色字、上下沿木刻毛边；里面的组件自动换成纸色。">
            <div className={styles.row}>
              <Caption>黑场里的展签</Caption>
              <InkButton to="/about">关于我们</InkButton>
              <InkButton variant="solid" to="/contact">
                联系方式
              </InkButton>
            </div>
            <InkRule weight="thin" dry={0.3} />
            <div className={styles.inkPair}>
              <div className={styles.frameCol}>
                <InkFrame size="sm">
                  <img src={yukariSrc} alt={yukari.title} width={yukari.imageWidth} height={yukari.imageHeight} loading="lazy" decoding="async" />
                </InkFrame>
              </div>
              <div>
                <SukimaSlit aspect={3.4} eyes={7} seed={91} />
                <Note>黑场里：画框外沿、隙间外沿自动描一圈纸色细线</Note>
              </div>
            </div>
          </Block>
        </PaperSection>

        <PaperSection tone="paper" space="md" width="narrow">
          <Note>版心：narrow 720 / normal 1120 / wide 1360 / full；留白 sm / md / lg，桌面和手机两套。本段 width=narrow。</Note>
        </PaperSection>
      </main>
    </Layout>
  );
}
