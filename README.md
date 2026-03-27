# AI背景移除工具

一个基于 Cloudflare Pages 和 Remove.bg API 的在线图片背景移除工具。

## 功能特点

- 🎨 一键去除图片背景
- 📱 响应式设计，支持移动端
- 🚀 无需服务器，部署在 Cloudflare Pages
- 💾 无存储，实时处理

## 部署步骤

### 1. 获取 Remove.bg API Key

1. 访问 [Remove.bg](https://www.remove.bg/api)
2. 注册账号并获取 API Key（免费版每月 50 次）

### 2. 部署到 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → **Create a project**
3. 连接你的 Git 仓库或直接上传文件
4. 构建设置：
   - **Framework preset**: None
   - **Build command**: (留空)
   - **Build output directory**: `/`

### 3. 配置环境变量

在 Cloudflare Pages 项目设置中：

1. 进入 **Settings** → **Environment variables**
2. 添加变量：
   - **Variable name**: `REMOVEBG_API_KEY`
   - **Value**: 你的 Remove.bg API Key
3. 保存并重新部署

## 本地测试

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 设置环境变量
echo "REMOVEBG_API_KEY=your_api_key_here" > .dev.vars

# 启动本地开发服务器
wrangler pages dev .
```

访问 `http://localhost:8788`

## 使用说明

1. 点击或拖拽上传图片
2. 等待处理完成
3. 对比原图和去背景后的效果
4. 下载透明背景图片

## 技术栈

- 前端：HTML + CSS + JavaScript
- 后端：Cloudflare Pages Functions
- API：Remove.bg

## 许可

MIT License
