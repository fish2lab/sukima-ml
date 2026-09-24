import React, {useEffect, type ReactNode} from 'react';
import clsx from 'clsx';
import {animate, useMotionValue} from 'framer-motion';
import {translate} from '@docusaurus/Translate';
import Content from '@theme-original/NotFound/Content';
import type ContentType from '@theme/NotFound/Content';
import type {WrapperProps} from '@docusaurus/types';
import {
  Caption,
  HandTitle,
  InkButton,
  PaperSection,
  SukimaSlit,
  motionAllowedNow,
  useIsSukima,
} from '@site/src/components/woodcut';
import styles from './styles.module.css';

type Props = WrapperProps<typeof ContentType>;

/**
 * 404：纸墙中间一道张开的隙间，缝里的眼睛看来看去，下面手写「这里什么都没有，被隙间吞掉了」，一个按钮回首页。
 * 不在东方部分（/ph 下的地址落到 404）时用原版内容：那里没有 data-sukima，木刻组件没有颜色。
 */
export default function ContentWrapper(props: Props): ReactNode {
  const sukima = useIsSukima();
  const open = useMotionValue(0);

  // 进场：缝先划开再张满（约 .6 秒）；减少动态时直接张满
  useEffect(() => {
    if (!sukima) return undefined;
    if (!motionAllowedNow()) {
      open.set(1);
      return undefined;
    }
    const controls = animate(open, 1, {duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1]});
    return () => controls.stop();
  }, [sukima, open]);

  if (!sukima) return <Content {...props} />;

  return (
    <main className={clsx(styles.main, props.className)}>
      <PaperSection as="div" tone="wall" width="normal" space="lg" innerClassName={styles.inner}>
        <Caption size="md" seed={404}>
          {translate({id: 'theme.NotFound.title', message: 'Page Not Found'})}
        </Caption>
        <div className={styles.slit}>
          <SukimaSlit open={open} eyes={7} aspect={3.8} glance={0.45} seed={404} />
        </div>
        <HandTitle as="h1" size="title" per={0.06} delay={0.7} className={styles.line}>
          {translate({id: 'pages.notFound.text', message: '这里什么都没有，被隙间吞掉了'})}
        </HandTitle>
        <InkButton to="/" variant="solid" size="lg">
          {translate({id: 'pages.notFound.home', message: '回首页'})}
        </InkButton>
      </PaperSection>
    </main>
  );
}
