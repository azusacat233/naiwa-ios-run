# 奶娃快跑 v2 · iOS

三维离线跑酷游戏。iPhone 应用内置 v2 页面、Three.js、角色模型与纹理，运行时不依赖参考网站。

## 功能

- 全屏三维跑酷，支持换道、跳跃、滑铲、列车车顶与追逐机制。
- 10 个场景、12 套配色配饰、6 种道具、任务、记录和本机存档。
- SwiftUI + WKWebView，最低 iOS 16，竖屏全屏。

## 测试

```bash
node --test tests/core.test.cjs
```

## 导出 IPA

需要 macOS、完整 Xcode 与 iPhoneOS SDK：

```bash
bash export-ipa.command --unsigned
```

构建输出位于 `build/ipa-export.*/NaiwaRunner-unsigned.ipa`。未签名 IPA 必须使用自己的 Apple 开发者证书或可信签名工具处理后才能安装。

GitHub 工作流 `.github/workflows/release-v2.yml` 会构建、验证并发布 v2 IPA、单文件 HTML 和 SHA-256 校验值。
