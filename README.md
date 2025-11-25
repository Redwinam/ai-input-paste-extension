# AI 输入框粘贴助手（Chrome 扩展）

在 ChatGPT、腾讯元宝、Google Gemini 的输入框上添加「粘贴」与「前置文本」能力：

- 粘贴按钮：一键将剪贴板文本插入输入框
- 自动发送：可选在粘贴后自动触发发送
- 前置文本：启用后在粘贴内容前附加预设文案
- 收藏管理：支持维护前置文本的收藏列表，并随时设为当前

## 支持站点
- `https://chatgpt.com/*`、`https://chat.openai.com/*`
- `https://yuanbao.tencent.com/*`
- `https://gemini.google.com/*`

## 安装
1. 打开浏览器「扩展程序」页面，开启「开发者模式」
2. 点击「加载已解压的扩展程序」，选择本项目根目录
3. 进入以上任一站点的对话页面，输入框上方会出现控制条（有「有前置文本」「编辑收藏」「自动发送」「粘贴」）

## 使用说明
- 有前置文本：启用后，粘贴时会将收藏的前置文本置于开头并换行
- 编辑收藏：打开弹窗，管理前置文本收藏（添加、删除、设为当前）；数据保存在 `chrome.storage.local`
- 自动发送：启用后，粘贴完成会自动点击发送按钮
- 粘贴：读取剪贴板文本后插入输入框（在部分站点使用粘贴事件或 `execCommand('insertText')` 保持兼容）

## 权限
- `clipboardRead`、`clipboardWrite`、`storage`

## 开发
```bash
npm install
npm run build
```
- 构建产物输出到 `dist/content.bundle.js`
- 内容脚本会根据站点自动选择适配器：
  - ChatGPT：`adapters/chatgpt.js`（使用剪贴板事件和发送按钮）
  - 元宝：`adapters/yuanbao.js`（Quill 编辑器，`insertText` + `input` 事件）
  - Gemini：`adapters/gemini.js`（Quill 编辑器，`insertText` + `input` 事件）
- UI 组件位于 `ui/controls.js`（控制条）与 `ui/modal.js`（收藏弹窗）

## 目录结构
- `manifest.json` 扩展清单与权限
- `content.js` 入口，按域名选择适配器
- `adapters/` 站点适配器集合
- `ui/` 控制条与收藏弹窗
- `dist/` 构建后脚本

## 提示
- 若控件未出现，确保页面元素加载完成；扩展通过 `MutationObserver` 监听并注入
- 若无法读取剪贴板，请在浏览器设置中授予「剪贴板读取权限」
