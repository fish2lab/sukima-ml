import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '隙间月影 | Sukima Moonlight',
  tagline: '名画与东方的邂逅 | Where Classic Art Meets Touhou',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    // v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://sukima-ml.club',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // Cloudflare Pages deployment config
  organizationName: 'sukima-ml',
  projectName: 'sukima-ml-website',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans', 'en'],
    localeConfigs: {
      'zh-Hans': { label: 'CN', htmlLang: 'zh-Hans' },
      'en': { label: 'EN', htmlLang: 'en-US' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: {
          path: 'blog',
          routeBasePath: 'blog',
          showReadingTime: true,
          readingTime: ({ content, frontMatter, defaultReadingTime }) =>
            defaultReadingTime({ content, locale: 'zh-Hans', frontMatter, options: { wordsPerMinute: 200 } }),
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          blogTitle: '社团动态',
          blogDescription: '隙间月影社团的最新活动和创作进展',
          blogSidebarTitle: '所有文章',
          blogSidebarCount: 'ALL',
          editUrl: 'https://github.com/FinnClair-Su/sukima-ml/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.7,
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // Redirects removed - photography moved to fcsu.dev
  ],

  themeConfig: {
    image: 'img/artworks/Variant_B.webp',
    metadata: [
      { name: 'keywords', content: '隙间月影, 东方Project, 名画同人, Touhou, Touhou Project, Classic Art, Giclée, Art Prints, Fischer Su' },
      { name: 'author', content: 'Fischer Su (苏心贤)' },
      { name: 'description', content: '隙间月影 (Sukima Moonlight) - Where Classic Art Meets Touhou. Discover high-quality Giclée art prints combining world masterpieces with characters from the Touhou Project.' },
      { name: 'license', content: 'Copyright © 2026 Fischer Su. All Rights Reserved.' },
      { name: 'format-detection', content: 'telephone=no' },
      { property: 'og:title', content: '隙间月影 | Sukima Moonlight' },
      { property: 'og:description', content: '隙间月影 (Sukima Moonlight) - Where Classic Art Meets Touhou. Discover high-quality Giclée art prints combining world masterpieces with characters from the Touhou Project.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://sukima-ml.club/' },
      { property: 'og:site_name', content: '隙间月影 | Sukima Moonlight' },
      { property: 'og:locale', content: 'zh_CN' },
      { property: 'og:locale:alternate', content: 'en_US' },
      { property: 'og:image', content: 'https://sukima-ml.club/img/artworks/Variant_B.webp' },
      { property: 'og:image:alt', content: 'The Bookworm × The Unmoving Library artwork by Sukima Moonlight' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: '隙间月影 | Sukima Moonlight' },
      { name: 'twitter:description', content: 'Where Classic Art Meets Touhou. Giclée art prints and Touhou Project fan art.' },
      { name: 'twitter:image', content: 'https://sukima-ml.club/img/artworks/Variant_B.webp' },
    ],
    navbar: {
      // 标题由自定义 Logo 组件处理
      title: '',
      logo: {
        alt: 'Sukima Moonlight Logo',
        src: 'img/new.webp',
        width: 32,
        height: 32,
      },
      items: [
        {
          to: '/sukima-ml',
          label: '作品集',
          position: 'left',
          className: 'navbar-sukima-item',
        },
        {
          to: '/about',
          label: '关于我们',
          position: 'left',
          className: 'navbar-sukima-item',
        },
        {
          to: '/blog',
          label: '社团动态',
          position: 'left',
          className: 'navbar-sukima-item',
        },
        {
          href: 'https://fcsu.dev',
          label: '摄影作品',
          position: 'left',
          className: 'navbar-phantasm-item',
        },
        {
          to: '/contact',
          label: '联系方式',
          position: 'right',
        },
        // Docs section commented out - can be enabled later if needed
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'tutorialSidebar',
        //   position: 'left',
        //   label: '文档',
        // },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '导航',
          items: [
            {
              label: '作品集',
              to: '/sukima-ml',
            },
            {
              label: '关于我们',
              to: '/about',
            },
            {
              label: '社团动态',
              to: '/blog',
            },
            {
              label: '联系方式',
              to: '/contact',
            },
          ],
        },
        {
          title: '社交媒体',
          items: [
            {
              label: 'Bilibili',
              href: 'https://space.bilibili.com/368984327',
            },
            // Pixiv 链接待添加
            // {
            //   label: 'Pixiv',
            //   href: 'https://www.pixiv.net/users/YOUR_ID',
            // },
            {
              label: 'QQ群',
              to: '/qq-group',
            },
          ],
        },
        {
          title: '社团资源',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/FinnClair-Su',
            },
            {
              label: '创作者主页',
              href: 'https://fcsu.dev',
            },
            {
              label: 'Email',
              href: 'mailto:kanade271828@gmail.com',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} 隙间月影 Sukima Moonlight. 依据《中华人民共和国著作权法》保护 | All Rights Reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'diff', 'json', 'python', 'yaml'],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    // algolia: {
    //   // 如果需要搜索功能，可以配置Algolia
    //   apiKey: 'your-api-key',
    //   indexName: 'your-index-name',
    //   appId: 'your-app-id',
    // },
  } satisfies Preset.ThemeConfig,
};

export default config;
