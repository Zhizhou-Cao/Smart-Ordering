# 🍽️ 智能点餐助手 Smart Ordering

基于 AI 的个性化菜品推荐 App —— 拍一张菜单照片，结合你和同桌人的饮食偏好，自动生成专属点餐建议。

## 功能特性

- 📸 **拍照识别菜单** — 上传菜单图片，AI 自动识别所有菜品
- 🎯 **个性化推荐** — 基于口味偏好、过敏食材、饮食类型综合分析
- 👥 **多人协同点餐** — 综合所有同桌人的偏好与禁忌，找到最优解
- 👫 **好友档案管理** — 保存常用好友饮食偏好，点餐时一键选择
- 🃏 **随机推荐** — 不知道吃什么时，卡片滑动随机推荐，右滑收藏

## 未来功能
- **接入实时地理位置** - 更精准的餐厅定位和随机推荐，省去手动上传菜单步骤
- **好友信息共享** - 加好友直接共享饮食偏好习惯

## 技术架构
```
前端：React Native + Expo（支持 iOS / Android / Web）
AI 后端：Dify 工作流
  ├── 图像识别：chatgpt-5.2（菜单图片解析）
  └── 推理分析：gpt-4o-mini（偏好匹配与推荐生成）
本地存储：AsyncStorage
路由：Expo Router
```

## 本地运行

**1. 安装依赖**
```bash
npm install
```

**2. 配置环境变量**
```bash
cp .env.example .env
```
在 `.env` 里填入你的 Dify API Key：
```
EXPO_PUBLIC_DIFY_API_KEY=你的Key
EXPO_PUBLIC_DIFY_API_URL=https://api.dify.ai/v1/workflows/run
```

**3. 启动**
```bash
npx expo start
```
用手机扫码通过 Expo Go 预览，或按 `w` 打开网页版。

## 项目结构
```
app/
├── (tabs)/          # 底部导航三个 Tab
│   ├── index.tsx    # 我的偏好设置
│   ├── order.tsx    # 点餐主页
│   └── friends.tsx  # 好友档案
├── order/
│   ├── upload.tsx   # 菜单上传
│   ├── people.tsx   # 用餐人选择 + 调用 AI
│   ├── result.tsx   # 推荐结果展示
│   └── random.tsx   # 卡片滑动随机推荐
├── api/
│   ├── upload+api.ts    # 图片上传代理
│   └── recommend+api.ts # 工作流调用代理
constants/
└── menuDatabase.ts  # 本地菜品数据库
```
