# Agent Note: 构建 ad-hoc 签名的 Desktop 应用用于内部插件测试

Status: implemented

[English](2026-09-14-macos-ad-hoc-desktop-packaging.md) | 中文

## 问题

Desktop 插件安装需要拥有独立 Node.js、pnpm 和物化运行时的打包应用。Workspace 开发使用一次性依赖链接，并禁用包修改。如果每次插件测试都要求 Apple Developer ID 证书和公证凭据，只需要本机或内部测试的贡献者就无法参与。

## 决策

macOS 打包命令接受显式的 `--ad-hoc` 标志，两种架构都通过 `:adhoc` 和 `:adhoc:dir` 脚本提供入口。它使用完整的打包运行时和现有 Desktop 插件管理器。[Desktop README](../../../../apps/desktop/README.zh.md#test-plugins-without-an-apple-developer-membership)负责说明命令和安装步骤。

ad-hoc 准备过程在记录清单前为每个原生运行时文件签名。Electron-builder 使用身份 `-` 为应用及其他嵌套可执行文件签名，保留 hardened runtime 和标准 Electron entitlement，并验证完成的应用。签名检查要求没有开发者团队的 ad-hoc 身份；发布检查仍要求配置的 Developer ID 签发者、Team ID、安全时间戳和公证。

命令从子进程环境中移除 Apple 签名和公证凭据，并显式设置签名模式，因此继承的测试模式变量无法改变发布命令。只有 ad-hoc 模式在缺少应用 ID 时默认使用 `local.deepseek.harness.adhoc`；显式提供格式错误的标识符会失败。ad-hoc 准备文件和产物位于目标的 `adhoc` 目录下。只有不可变的 Node 下载缓存与发布准备过程共享。

ad-hoc 产物不包含更新配置、公证、DMG 签名或发布完成记录。上传命令只读取常规发布目录。[Desktop 发布规则](../architecture/2026-08-25-electron-desktop-packaging-and-updates.zh.md)和[并行公证决策](2026-09-09-parallel-macos-notarization.zh.md)仍是 Developer ID 发布的现行依据；此内部测试模式是范围明确的例外。

## 考虑过的替代方案

**在 workspace 开发中启用包修改。** 生成的依赖链接会在启动时被替换，也不构成包管理器预期的已安装项目。打包测试应用可以验证真实的安装和重启行为，无需再引入一种开发插件生命周期。

**内部测试也要求 Developer ID。** Developer ID 和公证支持常规分发，但本机插件测试不需要这种发布者身份。显式测试命令保留发布要求，同时避免要求贡献者购买会员。

**跳过全部签名，或放宽发布命令。** Apple Silicon 可执行文件仍需要有效的代码签名，内置 Node 进程也会加载原生依赖。ad-hoc 签名保留可执行文件验证，独立的显式开关则防止意外生成无正式签名的发布包。

## 后果

贡献者可以在没有 Apple 凭据时测试 npm 和本地归档插件。接收者仍受 Gatekeeper 和受管理设备策略约束；ad-hoc 签名不提供经过认证的发布者身份。这些产物不能验证正式签名的自动更新或公证流程。Harness 数据和插件 profile 保持现有的 `DSH_HOME` 归属，因此隔离测试需在启动前选择独立 home。

针对性测试覆盖命令与环境选择、准备目录隔离、发布凭据缺失、签名拒绝，以及 macOS 上真实的无证书原生签名。应用打包和启动需要 macOS 宿主；Intel 和跨机器 Gatekeeper 行为仍属于平台验收工作。
