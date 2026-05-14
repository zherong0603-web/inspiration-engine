#!/bin/bash
# 灵感引擎一键部署脚本
# 用法：bash deploy.sh

SERVER="root@112.124.108.24"
REMOTE_DIR="/root/linggan-engine"
NGINX_DIR="/var/www/linggan"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 上传文件到服务器..."
scp -o StrictHostKeyChecking=no \
  "$LOCAL_DIR/script.js" \
  "$LOCAL_DIR/invites.js" \
  "$LOCAL_DIR/proxy.js" \
  "$LOCAL_DIR/index.html" \
  "$LOCAL_DIR/login.html" \
  "$LOCAL_DIR/admin.html" \
  "$SERVER:$REMOTE_DIR/"

echo "📂 同步到 nginx 目录..."
ssh -o StrictHostKeyChecking=no "$SERVER" "cp $REMOTE_DIR/index.html $REMOTE_DIR/script.js $REMOTE_DIR/invites.js $REMOTE_DIR/login.html $REMOTE_DIR/admin.html $REMOTE_DIR/proxy.js $NGINX_DIR/"

echo "🔄 重启代理服务器..."
ssh -o StrictHostKeyChecking=no "$SERVER" "
  # 停掉旧的代理进程
  pkill -f 'node.*proxy.js' 2>/dev/null || true
  sleep 1
  # 后台启动新代理
  cd $REMOTE_DIR
  nohup node proxy.js > proxy.log 2>&1 &
  sleep 1
  # 验证代理是否启动
  if ss -tlnp | grep -q 3011; then
    echo '✅ 代理服务器已启动（端口 3011）'
  else
    echo '❌ 代理服务器启动失败，查看 proxy.log'
  fi
"

echo "✅ 部署完成！访问 http://112.124.108.24:3010"
