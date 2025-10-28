#!/bin/bash

# === 插件名称自动取当前文件夹名 ===
PLUGIN_NAME=$(basename "$PWD")

# === 本地插件路径（当前目录下） ===
TARGET_PATH=".obsidian/plugins/$PLUGIN_NAME"

# === 判断是否存在并移除 ===
if [ -d "$TARGET_PATH" ]; then
  rm -rf "$TARGET_PATH"
  echo "🗑️ 已移除插件目录：$TARGET_PATH"
else
  echo "⚠️ 插件目录不存在：$TARGET_PATH"
fi