# 平遥古城交互式文化展示网站 🏯

一个现代化的交互式网站，展示平遥古城的文化遗产，包含沉浸式叙事、知识图谱和 3D 可视化。

## 🚀 功能特性

- **沉浸式首页**：三幕式滚动叙事，配合视差效果
- **知识图谱**：晋商文化交互式可视化
- **历史时间轴**：平遥古城发展历程
- **旅游路线规划**：交互式旅游导航
- **3D 建筑展示**：使用 Three.js 实现的建筑可视化

## 🛠️ 技术栈

- **框架**：React 19.2
- **构建工具**：Vite 8.0
- **路由**：React Router DOM 7.13
- **动画**：GSAP 3.14, Framer Motion 12.38
- **3D 图形**：Three.js 0.183, @react-three/fiber 9.5
- **数据可视化**：vis-network 10.0

## 📦 安装与运行

\\\ash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
\\\

## 📁 项目结构

\\\
pinyao/
├── public/           # 静态资源（图片、字体、音频等）
├── src/              # 源代码
│   ├── components/   # React 组件
│   ├── pages/        # 页面组件
│   ├── data/         # 数据文件
│   └── style.css     # 全局样式
├── docs/             # 文档与规划
│   ├── project-plans/ # 项目计划文档
│   ├── knowledge/     # 知识整理文档
│   └── archives/      # 归档文档
├── assets/           # 草稿与未使用的资源
├── archive/          # 旧版本归档（本地开发使用）
├── scripts/          # 工具脚本
├── index.html        # 入口 HTML
├── package.json      # 依赖配置
└── vite.config.js    # 构建配置
\\\

## 🤝 团队协作

本项目由团队协作开发，详细说明请查看 \docs/knowledge/team-collaboration.md\

## 📄 开源协议

[你的开源协议]
