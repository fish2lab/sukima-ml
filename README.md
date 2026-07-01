# 隙间月影 | Sukima Moonlight

> **名画与东方的邂逅 | Where Classic Art Meets Touhou**

![Sukima Moonlight Logo](static/img/sukima-ml.svg)

**隙间月影 (Sukima Moonlight)** 是一个专注于展示经典名画与东方Project角色结合的同人艺术社团网站。我们致力于通过高质量的艺术微喷（Giclée）和精美的周边制作，将幻想乡的魅力带入现实生活。

本网站基于 [Docusaurus](https://docusaurus.io/) 构建，集成了作品展示、在线购买（奉纳）、社团动态和社区互动等功能。

## ✨ 核心特性 | Features

### 🎨 沉浸式 Magic Gallery (v2.0 Update)

- **双重画框展示 (Dual Frames)**：创新性的并列展示设计——左侧为原作名画（如维米尔、委拉斯开兹），右侧为东方同人二创。桌面端左右对照，移动端上下流畅堆叠，直观呈现"打破次元壁"的视觉冲击。
- **Galgame 式互动导览**：
  - **沉浸对话系统**: 由看板娘八云紫（Yukari Yakumo）亲自导览，采用经典的 AVG/Galgame 对话框风格。
  - **ZUN 风选项**: 充满原作梗的选项设计（如“鉴赏‘再现’的魔术”、“假装无事发生”），打破第四面墙的 meta 交互。
  - **动态立绘 (Live2D-like)**: 独特的“Peek”交互——紫妈在闲置时仅露半身，互动时全身立绘浮现，仿佛从隙间中探出。
- **全平台响应式优化**:
  - **桌面端**: 宽屏沉浸体验，Hover 触发细节。
  - **移动端**: 针对竖屏优化的堆叠布局 (`flex-col`)，精心调教的触摸触发区域（防止误触导航键），以及完美的轮播图 "Peeking" 效果。
- **拟真装裱系统**: 纯 CSS/Tailwind 实现的"博物馆级"装裱效果——黑色铝合金框、45mm 白色卡纸与内阴影细节，背景全透明融合。

### 🎭 经典作品展示

- **首页 ASCII 动态**：独特的代码风开场动画，展现极客精神。
- **名画对比 (A/B Test)**：深度解析创作灵感，将原作（如维米尔、委拉斯开兹）与东方同人作品并列展示，致敬经典。
- **细节鉴赏**：提供高分辨率的作品细节展示，还原画作的每一处笔触。

### 🛍️ 艺术品奉纳系统

- **在线选购**：集成的购买页面 (`/buy`)，支持多种支付方式。
- **规格定制**：提供多种尺寸（14寸-20寸）和材质（硫化钡艺术微喷）选择。
- **订单追踪**：完善的邮件确认与订单反馈流程。

### 💬 社区互动

- **Giscus 评论**：基于 GitHub Discussions 的评论系统，支持 Markdown 和表情互动。
- **社团动态**：实时更新社团参展信息、新刊发布和幕后创作故事。

## 🛠️ 技术栈 | Tech Stack

- **核心框架**: [Docusaurus 3.x](https://docusaurus.io/) (React 19, TypeScript)
- **UI 呈现**:
  - **Tailwind CSS**: 现代化的原子类样式系统。
  - **Framer Motion**: 流畅的编排式动画库。
  - **CSS Modules**: 传统的组件级样式隔离。
- **评论系统**: [Giscus](https://giscus.app/)
- **部署**: Cloudflare Pages / GitHub Pages

## 🚀 快速开始 | Getting Started

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn

### 安装与运行

1. **克隆仓库**

   ```bash
   git clone https://github.com/fish2lab/sukima-ml.git
   cd sukima-ml
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **启动开发服务器**

   ```bash
   npm start
   ```

   访问 `http://localhost:3000` 查看预览。

4. **构建生产版本**
   ```bash
   npm run build
   ```

## 📁 项目结构 | Project Structure

```
sukima-ml/
├── blog/                  # 社团动态与文章
├── src/
│   ├── components/        # React 组件
│   │   ├── GalleryCarousel/ # 首页名画对比轮播 (带拟真画框)
│   │   └── ...
│   ├── css/               # 全局样式 (Tailwind directives)
│   ├── pages/             # 路由页面
│   │   ├── gallery.tsx    # Magic Gallery (核心重构页面)
│   │   ├── index.tsx      # 首页
│   │   ├── artwork-*.tsx  # 作品详情页
│   │   └── ...
│   └── theme/             # Docusaurus 主题定制
├── static/
│   └── img/               # 静态资源 (作品图, Yukari Overlay等)
├── docusaurus.config.ts   # 网站核心配置
├── tailwind.config.js     # Tailwind 配置
└── package.json           # 项目依赖
```

## 📮 联系我们 | Contact

如果你对我们的作品感兴趣，或有任何合作意向，欢迎通过以下方式联系：

- **Email (Primary)**: [kanade271828@icloud.com](mailto:kanade271828@icloud.com)
- **Email (Backup)**: [kanade271828@gmail.com](mailto:kanade271828@gmail.com)
- **Bilibili**: [@苏心贤](https://space.bilibili.com/368984327)
- **QQ群**: 请访问网站 [联系页面](/contact) 获取最新群二维码

## 📄 版权声明 | Copyright & License

### 代码 (Code)

本项目（网站源代码）采用 [MIT License](LICENSE) 许可证开源。欢迎学习、交流与二次开发。

### 美术资源 (Art Assets)

本项目中包含的所有美术资源（包括但不限于：`static/img/artworks` 目录下的画作、`static/img/digital_Resource` 下的数字典藏原图、设计草图及宣传物料），其版权均归 **隙间月影 (Sukima Moonlight)** 社团及对应画师所有。

**严禁将上述美术资源用于任何形式的商业用途**，包括但不限于：

1.  直接售卖数字文件或其实体打印件。
2.  将其作为素材用于其他商业产品（如周边、广告、付费内容）的设计中。
3.  未经授权的二次上传至收费平台或会员制社区。

**关于“数字典藏”的使用规范**：
社团公开的高清数字原图仅供**个人收藏、欣赏及非商业性质的交流分享**（如作为个人电脑/手机壁纸、社交媒体头像等）。我们本着“君子协定”的精神分享这些作品，也请您尊重创作者的心血，共同维护良好的同人创作环境。

如需商业合作或授权，请务必通过 [邮件](mailto:kanade271828@icloud.com) 联系我们。

---

<p align="center">
  <strong>隙间月影 Sukima Moonlight</strong><br/>
  <i>为东方带来更有文化底蕴的制品</i><br/>
  Built with ❤️ and Docusaurus
</p>
