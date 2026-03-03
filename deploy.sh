#!/bin/bash

# 云服务器部署脚本
# 服务器地址: 112.124.108.24:3009

echo "======================================"
echo "  灵感引擎 - 云服务器部署"
echo "======================================"
echo ""

echo "请在云服务器上执行以下命令："
echo ""
echo "# 1. 连接到云服务器"
echo "ssh root@112.124.108.24"
echo ""
echo "# 2. 进入项目目录（请替换为实际路径）"
echo "cd /path/to/ip-content-platform"
echo ""
echo "# 3. 一键部署"
echo "cp dev.db dev.db.backup-\$(date +%Y%m%d-%H%M%S) && git pull origin main && npm install && npx prisma db push && npx prisma generate && pm2 restart ip-content-platform"
echo ""
echo "======================================"
echo ""
echo "部署后验证："
echo "1. 访问 http://112.124.108.24:3009"
echo "2. 登录后检查右上角是否显示积分（💎 100）"
echo "3. 检查首页标题是否为 '4 步创作爆款内容'"
echo ""
