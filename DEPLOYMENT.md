# 云服务器部署指南

## 📍 服务器信息
- **云服务器地址**：http://112.124.108.24:3009
- **本地开发地址**：http://localhost:3009
- **项目路径**：/Users/wzr/ip-content-platform

## 🚀 快速部署命令

```bash
# 1. 连接服务器
ssh root@112.124.108.24

# 2. 进入项目目录
cd /path/to/ip-content-platform

# 3. 拉取代码并部署
git pull origin main && npm install && npx prisma db push && npx prisma generate && pm2 restart ip-content-platform
```

## ⚠️ 本次更新需要部署

### 包含数据库变更
- ✅ 添加了 credits 字段到 User 表
- ✅ 需要运行 `npx prisma db push`

### 新功能
1. 积分系统（限制 API 使用）
2. 首页优化（Slogan + 4步创作）
3. 管理后台优化

**建议：现在就部署，让用户看到新功能！**
