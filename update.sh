#!/bin/bash

echo "🔄 开始更新阿里云服务器..."

# 第一步：提交本地代码
echo "📝 第一步：提交本地代码..."
git add .
read -p "请输入更新说明: " commit_msg
git commit -m "$commit_msg"
git push origin main

echo "✅ 代码已推送到 GitHub"

# 第二步：服务器拉取更新
echo ""
echo "📥 第二步：服务器拉取更新..."
ssh root@112.124.108.24 bash << 'EOF'
set -e

cd /var/www/inspiration-engine

echo "拉取最新代码..."
git pull origin main

echo "安装新依赖..."
npm install

echo "重新生成 Prisma Client..."
npx prisma generate

echo "同步数据库..."
npx prisma db push

echo "重新构建..."
npm run build

echo "重启服务..."
pm2 restart inspiration-engine

echo "✅ 更新完成"
EOF

echo ""
echo "🎉 更新成功！"
echo "📍 访问地址: http://112.124.108.24:3009"
