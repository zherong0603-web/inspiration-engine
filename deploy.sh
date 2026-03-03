#!/bin/bash

# 阿里云服务器部署脚本
# 服务器 IP: 112.124.108.24

echo "🚀 开始部署灵感引擎到阿里云..."

# 服务器信息
SERVER_IP="112.124.108.24"
SERVER_USER="root"
REPO_URL="git@github.com:zherong0603-web/inspiration-engine.git"
APP_DIR="/var/www/inspiration-engine"
APP_PORT="3009"

echo "📦 第一步：安装必要的软件..."

# 更新系统并安装必要软件
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
# 更新软件包列表
apt-get update

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 安装 Git
apt-get install -y git

# 安装 PM2（进程管理器）
npm install -g pm2

# 验证安装
echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"
echo "✅ Git 版本: $(git --version)"
echo "✅ PM2 版本: $(pm2 -v)"
ENDSSH

echo "📥 第二步：克隆代码..."

# 克隆代码
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
# 创建应用目录
mkdir -p /var/www

# 克隆代码（如果已存在则更新）
if [ -d "${APP_DIR}" ]; then
  echo "目录已存在，拉取最新代码..."
  cd ${APP_DIR}
  git pull origin main
else
  echo "克隆代码..."
  git clone ${REPO_URL} ${APP_DIR}
fi

cd ${APP_DIR}
echo "✅ 代码已准备好"
ENDSSH

echo "⚙️ 第三步：配置环境变量..."

# 创建 .env 文件
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /var/www/inspiration-engine

cat > .env << 'EOF'
# Anthropic API Key
ANTHROPIC_API_KEY=sk-x3YDgqPpnjbVCxwa9AsFjA37fKXoaynBGkHuaPhvF7fE0elT
ANTHROPIC_BASE_URL=https://hone.vvvv.ee

# Database
DATABASE_URL="file:./dev.db"

# Node Environment
NODE_ENV=production
EOF

echo "✅ 环境变量已配置"
ENDSSH

echo "📦 第四步：安装依赖..."

ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /var/www/inspiration-engine

# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 初始化数据库
npx prisma db push

echo "✅ 依赖已安装"
ENDSSH

echo "🏗️ 第五步：构建项目..."

ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /var/www/inspiration-engine

# 构建项目
npm run build

echo "✅ 项目已构建"
ENDSSH

echo "🚀 第六步：启动服务..."

ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
cd /var/www/inspiration-engine

# 停止旧进程（如果存在）
pm2 delete inspiration-engine 2>/dev/null || true

# 启动应用
pm2 start npm --name "inspiration-engine" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status

echo "✅ 服务已启动"
ENDSSH

echo "🔥 第七步：配置防火墙..."

ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
# 安装 ufw（如果没有）
apt-get install -y ufw

# 允许 SSH
ufw allow 22/tcp

# 允许应用端口
ufw allow ${APP_PORT}/tcp

# 允许 HTTP/HTTPS（如果需要）
ufw allow 80/tcp
ufw allow 443/tcp

# 启用防火墙（谨慎操作）
echo "y" | ufw enable

# 查看状态
ufw status

echo "✅ 防火墙已配置"
ENDSSH

echo ""
echo "🎉 部署完成！"
echo ""
echo "📍 访问地址: http://112.124.108.24:3009"
echo ""
echo "💡 常用命令："
echo "  查看日志: ssh root@112.124.108.24 'pm2 logs inspiration-engine'"
echo "  重启服务: ssh root@112.124.108.24 'pm2 restart inspiration-engine'"
echo "  停止服务: ssh root@112.124.108.24 'pm2 stop inspiration-engine'"
echo ""
