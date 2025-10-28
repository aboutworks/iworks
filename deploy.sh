#!/bin/bash

# === 插件名称：自动获取当前文件夹名 ===
PLUGIN_NAME=$(basename "$PWD")

# === 构建输出目录（可修改为你的构建目录，例如 dist）===
BUILD_DIR="dist"

# === 插件目标路径：当前目录下的 .obsidian/plugins/$PLUGIN_NAME ===
TARGET_PATH=".obsidian/plugins/$PLUGIN_NAME"

echo "📦 正在构建插件..."
yarn build

# === 清空旧的部署文件 ===
echo "🧹 清理旧插件文件..."
rm -rf "$TARGET_PATH"
mkdir -p "$TARGET_PATH"

# === 拷贝构建文件 ===
echo "📁 拷贝构建文件到 $TARGET_PATH"

# 如果使用 dist 目录就从 dist 拷贝，否则直接从当前目录拷贝
if [ -d "$BUILD_DIR" ]; then
  cp "$BUILD_DIR"/main.js "$BUILD_DIR"/manifest.json "$TARGET_PATH"
  [ -f "$BUILD_DIR/styles.css" ] && cp "$BUILD_DIR/styles.css" "$TARGET_PATH"
else
  cp main.js manifest.json "$TARGET_PATH"
  [ -f styles.css ] && cp styles.css "$TARGET_PATH"
fi

echo "✅ 插件已部署到 $TARGET_PATH"