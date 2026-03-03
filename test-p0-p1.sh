#!/bin/bash

# 灵感引擎 P0 & P1 测试脚本

echo "======================================"
echo "  灵感引擎 P0 & P1 功能测试"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
PASS=0
FAIL=0

# 测试函数
test_api() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4

    echo -n "测试: $name ... "

    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASS=$((PASS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  响应: $body"
        FAIL=$((FAIL + 1))
        return 1
    fi
}

echo "🔴 P0 测试 - 阻塞性问题"
echo "--------------------------------------"

# 测试登录 API
test_api "登录 API" \
    "http://localhost:3009/api/auth/login" \
    "POST" \
    '{"email":"demo@example.com","password":"demo123456"}'

# 测试管理员权限检查
test_api "管理员权限检查" \
    "http://localhost:3009/api/auth/is-admin"

echo ""
echo "🟠 P1 测试 - 核心功能"
echo "--------------------------------------"

# 测试系统状态 API
test_api "系统状态 API" \
    "http://localhost:3009/api/admin/system-status"

# 测试反馈 API
test_api "反馈列表 API" \
    "http://localhost:3009/api/feedback"

# 测试统计 API
test_api "统计数据 API" \
    "http://localhost:3009/api/stats"

echo ""
echo "======================================"
echo "  测试结果汇总"
echo "======================================"
echo -e "通过: ${GREEN}$PASS${NC}"
echo -e "失败: ${RED}$FAIL${NC}"
echo ""

# 数据库检查
echo "💾 数据库状态检查"
echo "--------------------------------------"
if [ -f "dev.db" ]; then
    echo -e "${GREEN}✓${NC} 数据库文件存在"
    db_size=$(ls -lh dev.db | awk '{print $5}')
    echo "  文件大小: $db_size"

    echo ""
    echo "数据统计:"
    sqlite3 dev.db <<EOF
.mode column
.headers on
SELECT
    (SELECT COUNT(*) FROM User) as 用户数,
    (SELECT COUNT(*) FROM Content) as 内容数,
    (SELECT COUNT(*) FROM TopicIdea) as 选题数,
    (SELECT COUNT(*) FROM Creation) as 创作数,
    (SELECT COUNT(*) FROM Feedback) as 反馈数,
    (SELECT COUNT(*) FROM IPProfile) as IP配置数;
EOF
else
    echo -e "${RED}✗${NC} 数据库文件不存在"
fi

echo ""
echo "⚙️  环境配置检查"
echo "--------------------------------------"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env 文件存在"

    if grep -q "ANTHROPIC_API_KEY" .env && grep "ANTHROPIC_API_KEY" .env | grep -v "^#" | grep -q "="; then
        echo -e "${GREEN}✓${NC} ANTHROPIC_API_KEY 已配置"
    else
        echo -e "${RED}✗${NC} ANTHROPIC_API_KEY 未配置"
        echo -e "  ${YELLOW}警告: AI 功能将无法使用${NC}"
    fi

    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✓${NC} DATABASE_URL 已配置"
    else
        echo -e "${YELLOW}⚠${NC}  DATABASE_URL 未配置"
    fi
else
    echo -e "${RED}✗${NC} .env 文件不存在"
fi

echo ""
echo "🌐 服务器状态检查"
echo "--------------------------------------"
if lsof -ti:3009 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 服务器运行中 (端口 3009)"
    pid=$(lsof -ti:3009 | head -1)
    echo "  进程 ID: $pid"
else
    echo -e "${RED}✗${NC} 服务器未运行"
    echo "  请运行: npm run dev"
fi

echo ""
echo "======================================"
echo "  下一步操作建议"
echo "======================================"

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}发现问题，请检查:${NC}"
    echo "1. 确保服务器正在运行: npm run dev"
    echo "2. 检查服务器日志: tail -50 /tmp/next-dev.log"
    echo "3. 清除限流: 重启服务器"
fi

if ! grep -q "ANTHROPIC_API_KEY" .env 2>/dev/null || ! grep "ANTHROPIC_API_KEY" .env 2>/dev/null | grep -v "^#" | grep -q "="; then
    echo ""
    echo -e "${YELLOW}⚠️  需要配置 Claude API Key:${NC}"
    echo "1. 在 .env 文件中添加:"
    echo "   ANTHROPIC_API_KEY=sk-ant-xxxxx"
    echo "2. 重启服务器"
fi

echo ""
echo "📋 手动测试清单:"
echo "1. 访问 http://localhost:3009/login"
echo "2. 使用 demo@example.com / demo123456 登录"
echo "3. 访问 http://localhost:3009/admin 查看系统状态"
echo "4. 测试各个功能页面"
echo ""
