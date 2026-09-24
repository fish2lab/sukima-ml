import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';
import { useInView } from 'framer-motion';

const REDUCE = '(prefers-reduced-motion: reduce)';

/**
 * 现在能不能动：没有要求减少动态，而且 <html data-wc-motion> 不是 off。
 * data-wc-motion 由 docusaurus.config.ts 里的内联脚本在首帧前写上（见 README「动画与减少动态」）。
 * 只在浏览器里调用。
 */
export function motionAllowedNow(): boolean {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia(REDUCE).matches && document.documentElement.getAttribute('data-wc-motion') !== 'off';
}

function subscribe(cb: () => void): () => void {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

/** 能不能动（响应系统设置的变化）。SSR 和水合那一帧是 false。 */
export function useMotionAllowed(): boolean {
  return useSyncExternalStore(subscribe, motionAllowedNow, () => false);
}

/**
 * 「抖」：active 时每秒换 fps 次，返回 tick 值（加到 seed 上）；不 active 或不能动时返回 0，形状回到 seed 本身。
 * 片子里墨块和线条是 8 次/秒，展签字幕是 6 次/秒。
 */
export function useJitterTick(active: boolean, fps = 8): number {
  const allowed = useMotionAllowed();
  const on = active && allowed;
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!on) return undefined;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setT(n * 17);
    }, 1000 / fps);
    return () => window.clearInterval(id);
  }, [on, fps]);
  return on ? t : 0;
}

/**
 * 进场动画的状态：
 *   pending  SSR 输出的初始值；能动时 CSS 把元素藏成动画起点（没有 JS 时不藏）
 *   play     进入视口，CSS 动画开始
 *   done     动画结束（duration 秒后）
 *   static   不能动：直接显示最终状态
 * 把返回值写到元素的 data-wc-reveal 上，配合 CSS 使用。
 */
export type RevealState = 'pending' | 'play' | 'done' | 'static';

export function useReveal(ref: RefObject<Element | null>, duration: number, options: { enabled?: boolean; amount?: number } = {}): RevealState {
  const { enabled = true, amount = 0.2 } = options;
  const inView = useInView(ref, { once: true, amount });
  // enabled = false 时 SSR 就输出 static，首帧不藏
  const [state, setState] = useState<RevealState>(enabled ? 'pending' : 'static');
  useEffect(() => {
    if (state !== 'pending') return;
    if (!enabled || !motionAllowedNow()) setState('static');
    else if (inView) setState('play');
  }, [enabled, inView, state]);
  useEffect(() => {
    if (state !== 'play') return undefined;
    const id = window.setTimeout(() => setState('done'), Math.max(0, duration) * 1000 + 50);
    return () => window.clearTimeout(id);
  }, [state, duration]);
  return state;
}
