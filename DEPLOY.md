# Google OAuth + D1 用户存储部署指南

## 1. 创建 D1 数据库

```bash
cd bg-remover
wrangler d1 create bg_remover_users
```

复制返回的 `database_id`，更新到 `wrangler.toml` 中的 `database_id` 字段

## 2. 初始化数据库表

```bash
wrangler d1 execute bg_remover_users --file=schema.sql
```

## 3. 部署到 Cloudflare Pages

```bash
wrangler pages deploy . --project-name=bg-remover
```

## 4. 配置 Google OAuth 回调地址

在 Google Cloud Console 中添加授权重定向 URI：
- `https://bg-remover-9at.pages.dev/auth/callback`

## 完成！

用户登录后会自动保存到 D1 数据库，包含：
- Google ID
- 邮箱
- 姓名
- 头像
- 登录时间
