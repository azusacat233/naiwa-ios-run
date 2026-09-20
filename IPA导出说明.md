# IPA 导出
目前未生成 IPA：当前环境是 Windows，没有 Xcode/iOS SDK、已配置的远程 Mac或项目签名文件。

## Mac：导出待签名 IPA
安装完整 Xcode，在终端进入本工程目录执行：
```bash
bash export-ipa.command --unsigned
```
脚本会实际编译 iPhoneOS 应用，成功后才包装 IPA。文件位于 build/ipa-export.随机标识/NaiwaRunner-unsigned.ipa。此文件必须另行签名才能在普通 iPhone 上安装。

## Mac：导出已签名 IPA
先在 Xcode 中配置开发团队、唯一 Bundle Identifier，以及与你的安装设备/分发方式匹配的签名与描述文件。将 Xcode 导出过程中生成的 ExportOptions.plist 放在本机，然后执行：
```bash
TEAM_ID=你的团队ID BUNDLE_ID=你的应用标识 bash export-ipa.command --signed /绝对路径/ExportOptions.plist
```
脚本不会上传到 App Store；若配置指定 upload，会拒绝执行。可安装范围取决于所选签名和描述文件。请勿在聊天中粘贴证书密码或私钥。

Apple 导出配置说明：
https://help.apple.com/xcode/mac/current/en.lproj/deva1f2ab5a2.html

## 当前验证边界
导出脚本已准备，尚未在 macOS 执行。工程此前仅完成浏览器及 JavaScript 逻辑验证，Swift 编译仍需首次在 Xcode 执行，可能需要根据编译结果修正。
