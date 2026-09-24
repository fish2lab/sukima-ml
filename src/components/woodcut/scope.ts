import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export interface ScopeOptions {
  /** 站点（当前语言构建）的 baseUrl，默认 '/'；英文构建里是 '/en/' */
  baseUrl?: string;
  /** 站点的全部语言代码；路径开头是其中之一时先去掉再判断 */
  locales?: readonly string[];
}

/**
 * 这个路径属不属于东方部分（隙间月影）。除 Studio Phantasm 摄影棚（/ph、/ph/*、/en/ph、/en/ph/*）以外都算，
 * 包括首页、作品集、博客、404。
 */
export function isSukimaPath(pathname: string, { baseUrl = '/', locales = ['zh-Hans', 'en'] }: ScopeOptions = {}): boolean {
  let path = pathname;
  if (baseUrl !== '/' && path.startsWith(baseUrl)) path = `/${path.slice(baseUrl.length)}`;
  const segs = path.split('/').filter(Boolean);
  if (segs.length && locales.includes(segs[0])) segs.shift();
  const first = segs[0] ?? '';
  return first !== 'ph' && first !== 'ph.html';
}

/**
 * 当前页面属不属于东方部分。用的是路由里正在渲染的那个 location：
 * 在页面组件、Layout、Navbar、Footer 里调用，和页面内容同一时刻切换。
 */
export function useIsSukima(): boolean {
  const { pathname } = useLocation();
  const {
    siteConfig: { baseUrl },
    i18n: { locales },
  } = useDocusaurusContext();
  return isSukimaPath(pathname, { baseUrl, locales });
}
