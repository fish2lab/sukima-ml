#!/bin/bash
# 增量更新脚本 - 只提交修改的文件，跳过大文件

set -e

echo "🔍 检查仓库状态..."
git status

echo ""
echo "📊 分析文件大小..."
# 显示大于 5MB 的文件
echo "以下文件大于 5MB (可能需要特别处理):"
git ls-files -z | xargs -0 du -h 2>/dev/null | awk '$1 ~ /[5-9]M|[0-9][0-9]M/ {print $0}' || true

echo ""
echo "📝 准备提交..."
echo "选项："
echo "1. 提交所有修改（包括大文件）"
echo "2. 只提交代码文件（排除 static/）"
echo "3. 自定义选择"
echo ""
read -p "请选择 (1/2/3): " choice

case $choice in
  1)
    echo "提交所有修改..."
    git add .
    ;;
  2)
    echo "只提交代码文件..."
    git add src/
    git add blog/
    git add docs/ 2>/dev/null || true
    git add docusaurus.config.ts
    git add package.json
    git add tsconfig.json
    git add .gitignore
    git add .gitattributes 2>/dev/null || true
    ;;
  3)
    echo "请手动使用 git add 添加文件"
    exit 0
    ;;
  *)
    echo "无效选择"
    exit 1
    ;;
esac

echo ""
git status
echo ""
read -p "输入提交信息: " commit_msg

if [ -z "$commit_msg" ]; then
  echo "❌ 提交信息不能为空"
  exit 1
fi

git commit -m "$commit_msg"

echo ""
echo "✅ 提交完成！"
echo ""
read -p "是否推送到远程？(y/n): " push_choice

if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
  echo "🚀 推送中..."
  git push
  echo "✅ 推送完成！"
else
  echo "⏸️  已跳过推送"
fi
