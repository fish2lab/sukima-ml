import React, { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import { useInView } from 'framer-motion';
import { RoughBorder } from '@site/src/components/woodcut';
import styles from './EndlesslyTicket.module.css';

/**
 * Endlessly 17 票据：逐字累加 "Endlessly 17 year old~" 的 ASCII 码，算出 Expected Age，
 * 停 1 秒后换成链到 Studio Phantasm 的一行，5 秒后重来（逻辑和文案照旧版首页的 ASCIIDemo）。
 * 画成一张木刻小票：卡纸白、墨色细毛边、左右两个打孔半圆、等宽字；印章红只给 State Phantasm。
 * 进入视口后才开始数（旧版是挂载就数，往下滚到这里时已经数了一半）。
 */
type ASCIIPhase = 'counting' | 'complete' | 'phantasm';

const TEXT = 'Endlessly 17 year old~';
const NOMINAL = [480, 360] as const;

function Notch({ side }: { side: 'left' | 'right' }): ReactNode {
  return (
    <span className={styles.notch} data-side={side} aria-hidden="true">
      <svg className={styles.notchSvg} viewBox="0 0 24 24" focusable="false">
        <circle className={styles.hole} cx="12" cy="12" r="11" />
        <path className={styles.holeEdge} d={side === 'left' ? 'M12 1A11 11 0 0 1 12 23' : 'M12 1A11 11 0 0 0 12 23'} />
      </svg>
    </span>
  );
}

export default function EndlesslyTicket(): ReactNode {
  const text = TEXT;
  const ref = useRef<HTMLDivElement>(null);
  const running = useInView(ref, { once: true, amount: 0.3 });
  // 滚出视口就暂停计数，回来接着数，不在后台每 0.5 秒重渲染
  const visible = useInView(ref);
  const [cycle, setCycle] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cumulativeSum, setCumulativeSum] = useState(0);
  const [currentCharASCII, setCurrentCharASCII] = useState(0);
  const [phase, setPhase] = useState<ASCIIPhase>('counting');

  // Counting：每 0.5 秒累加一个字符的 ASCII 码
  useEffect(() => {
    if (!running || !visible || phase !== 'counting') return undefined;
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        const charCode = text.charCodeAt(currentIndex);
        setCurrentCharASCII(charCode);
        setCumulativeSum((prev) => prev + charCode);
        setCurrentIndex((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
    setPhase('complete');
    return undefined;
  }, [running, visible, phase, currentIndex, text]);

  // Complete -> Phantasm
  useEffect(() => {
    if (phase !== 'complete') return undefined;
    const timer = setTimeout(() => setPhase('phantasm'), 1000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Phantasm -> Counting：5 秒后重来
  useEffect(() => {
    if (phase !== 'phantasm') return undefined;
    const timer = setTimeout(() => {
      setCurrentIndex(0);
      setCumulativeSum(0);
      setCurrentCharASCII(0);
      setCycle((c) => c + 1);
      setPhase('counting');
    }, 5000);
    return () => clearTimeout(timer);
  }, [phase]);

  const numberString = cumulativeSum.toString().padStart(4, '0');

  return (
    <div ref={ref} className={clsx(styles.ticket, 'wc-mono')} data-phase={phase} data-running={running ? '' : undefined} data-paused={running && !visible ? '' : undefined}>
      <RoughBorder variant="fill" amp={0.8} freq={30} seed={71} nominal={NOMINAL} className={styles.paper} />
      <RoughBorder variant="line" weight={1.4} amp={0.4} seed={72} nominal={NOMINAL} className={styles.edge} />
      <Notch side="left" />
      <Notch side="right" />

      <div className={styles.counter}>
        {/* 换一轮时重新挂载，数数期间逐渐变淡的 CSS 动画从头开始 */}
        <Fragment key={cycle}>
          <div className={clsx(styles.asciiText, styles.dim)}>
            <span className={styles.quote}>"</span>
            {text.split('').map((char, index) => (
              <span
                key={index}
                className={clsx(styles.asciiChar, index < currentIndex && styles.revealed, index === currentIndex - 1 && styles.current)}>
                {char}
              </span>
            ))}
            <span className={styles.quote}>"</span>
          </div>

          <div className={styles.charInfoRow}>
            <span className={clsx(styles.charInfo, styles.dim)}>
              {currentIndex === 0 ? './start.sh' : currentIndex <= text.length ? `'${text[currentIndex - 1]}' → ASCII ${currentCharASCII}` : './done'}
            </span>
          </div>

          <div className={clsx(styles.counterBox, styles.dim)}>
            <div className={styles.counterValue}>
              {numberString.split('').map((digit, i) => (
                <span key={i} className={styles.counterDigit}>
                  {digit}
                </span>
              ))}
            </div>
            <div className={styles.counterLabel}>CUMULATIVE ASCII SUM</div>
          </div>

          <div className={styles.message}>
            {phase === 'counting' ? (
              <div className={clsx(styles.interim, styles.dim)}>
                <span className={styles.cursor}>_</span> Calculating age...
              </div>
            ) : (
              <div className={styles.complete}>
                Expected Age &ge; <span className={styles.sum}>{cumulativeSum}</span>
                <br />
                <span className={styles.source}>(Source: ASCII Sum Check)</span>
              </div>
            )}
          </div>
        </Fragment>
      </div>

      <Link to="https://ph.sukima-ml.club" className={styles.phantasm}>
        <span className={styles.clickToSee}>
          [ <Translate id="home.ascii.clickToSee">Click to See</Translate> ]
        </span>
        <span className={styles.stateName}>
          <Translate id="home.ascii.statePhantasm">State Phantasm</Translate>
        </span>
        <span className={styles.byline}>
          <Translate id="home.ascii.photographyBy">Photography by Organizer</Translate>
        </span>
      </Link>
    </div>
  );
}
