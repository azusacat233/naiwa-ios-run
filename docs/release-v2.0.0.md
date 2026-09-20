## 奶娃快跑 v2.0.0

本次 Release 提供 iOS 离线版本和可直接打开的单文件 HTML，均内置完整 v2 游戏页面和角色资源。

### 更新内容

- 全屏三维跑酷场景，地图、衣橱、任务、道具、记录和设置位于下方子页面。
- 三跑道换道、跳跃、滑铲、列车车顶、追逐机制与金币结算。
- 磁铁、护盾、喷气背包、弹跳鞋、双倍积分和滑板六种道具。
- 10 个场景主题、12 套配色配饰、每日任务和本机存档。
- 改进太阳阴影、环境光、雾效、金属材质和 iPhone 安全区。

### 下载说明

- `NaiwaRunner-v2.0.0-unsigned.ipa`：真实 iPhoneOS ARM64 安装包，但未签名。需要使用自己的 Apple 开发者证书或可信签名工具签名后才能正常安装。
- `NaiwaRunner-v2.0.0.html`：单文件离线版，使用 Chrome、Edge 或 Safari 直接打开。
- `SHA256SUMS.txt`：IPA 与 HTML 的 SHA-256 校验值。

IPA 由对应提交在 GitHub Actions 的 macOS 环境中构建并验证。校验包括 ZIP 完整性、ARM64 Mach-O、iPhoneOS 平台、v2 资源和未签名状态。
