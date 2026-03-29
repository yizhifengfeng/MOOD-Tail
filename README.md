# MOOD Tail 情绪调酒小程序

基于微信小程序 + 微信云开发的情绪调酒应用，根据用户情绪匹配实体酒品，生成专属情绪特调方案。

## 项目结构

```
├── miniprogram/                # 小程序端
│   ├── components/             # 自定义组件
│   │   ├── cocktail-glass/     # 动态调酒杯
│   │   ├── emotion-slider/     # 情绪滑块
│   │   ├── recipe-card/        # 配方卡片
│   │   ├── wave-animation/     # 分析动画
│   │   └── mood-calendar/      # 心情日历
│   ├── pages/
│   │   ├── index/              # 调酒主界面
│   │   ├── result/             # 特调结果页
│   │   ├── history/            # 历史记录页
│   │   ├── detail/             # 特调详情页
│   │   └── products/           # 酒吧产品页
│   ├── utils/
│   │   ├── emotion.js          # 情绪分析融合
│   │   ├── ai.js               # AI生成接口
│   │   ├── theme.js            # 主题色彩
│   │   └── util.js             # 通用工具
│   ├── app.js
│   ├── app.json
│   └── app.wxss
├── cloudfunctions/             # 云函数
│   ├── login/                  # 微信登录
│   ├── analyzeEmotion/         # 情绪分析
│   ├── generateCocktail/       # AI特调生成
│   ├── saveCocktail/           # 保存特调
│   ├── getHistory/             # 获取历史
│   ├── getProducts/            # 获取产品
│   └── getRecommendations/     # 个性化推荐
└── project.config.json
```

## 快速开始

### 1. 环境准备

- 微信开发者工具（最新版）
- 微信小程序 AppID（需开通云开发）

### 2. 项目配置

1. 打开微信开发者工具，导入本项目
2. 在 `project.config.json` 中替换 `appid` 为你的小程序 AppID
3. 开通云开发，创建云开发环境

### 3. 数据库配置

在云开发控制台创建以下集合：

| 集合名 | 说明 | 权限 |
|--------|------|------|
| `users` | 用户信息 | 仅创建者可读写 |
| `cocktails` | 特调记录 | 仅创建者可读写 |
| `products` | 酒吧产品 | 所有用户可读 |

### 4. 部署云函数

在微信开发者工具中，右键每个云函数目录 → "上传并部署：云端安装依赖"

需要部署的云函数：
- `login`
- `analyzeEmotion`
- `generateCocktail`
- `saveCocktail`
- `getHistory`
- `getProducts`
- `getRecommendations`

### 5. 导入酒品数据（可选）

`getProducts` 云函数内置了默认酒品数据。如需自定义，在 `products` 集合中添加文档，格式：

```json
{
  "name": "阳光金酒",
  "nameEn": "Sunshine Gin",
  "category": "金酒",
  "direction": "bright",
  "description": "清新柑橘与杜松子的完美融合",
  "ingredients": ["杜松子", "柑橘皮", "香菜籽"],
  "emotion_tags": ["bright"]
}
```

## AI 接入说明

当前使用本地模板生成特调方案。如需接入真实 AI API：

1. 编辑 `cloudfunctions/generateCocktail/index.js`
2. 取消注释 `callAI` 函数
3. 配置你的 AI API 密钥和端点
4. 支持的 AI 服务：百度文心一言、智谱 ChatGLM、通义千问等

## 核心功能

- **情绪输入**：文本输入 + 0-100 情绪滑块，融合分析
- **随机生成**：根据滑块值生成匹配的情绪文本
- **情绪分析**：NLP 关键词识别 + 情绪分类（Bright/Calm/Deep）
- **特调生成**：基酒、前/中/尾调、体感、浓度完整配方
- **视觉展示**：三种风格（玻璃瓶/调酒杯/流体）可切换
- **历史记录**：酒单列表 + 心情日历
- **个性化推荐**：基于历史情绪数据推荐酒品
- **微信分享**：好友/朋友圈分享特调卡片

## 情绪色彩体系

| 情绪方向 | 主色 | 风格 |
|----------|------|------|
| Bright 明亮 | #FF9F43 | 温暖、活力、甜蜜 |
| Calm 平静 | #4ECDC4 | 宁静、放松、柔和 |
| Deep 深沉 | #A855F7 | 沉郁、厚重、复杂 |
