# Agent Note: Build ad-hoc signed Desktop applications for internal plugin tests

Status: implemented

English | [中文](2026-09-14-macos-ad-hoc-desktop-packaging.zh.md)

## Problem

Desktop plugin installation requires a packaged application with its own Node.js, pnpm, and materialized runtime. Workspace development uses disposable dependency links and disables package changes. Requiring an Apple Developer ID certificate and notarization credentials for every plugin test excludes contributors who only need local or internal testing.

## Decision

The macOS packaging command accepts an explicit `--ad-hoc` flag, exposed by the `:adhoc` and `:adhoc:dir` scripts for both architectures. It uses the complete packaged runtime and existing Desktop plugin manager. The [Desktop README](../../../../apps/desktop/README.md#test-plugins-without-an-apple-developer-membership) owns the commands and installation procedure.

Ad-hoc preparation signs each native runtime file before recording its inventory. Electron-builder signs the application and its other nested executables with identity `-`, preserves hardened runtime and the standard Electron entitlements, and verifies the completed application. Signature checks require ad-hoc identity without a developer team; release checks continue to require their configured Developer ID authority, Team ID, secure timestamps, and notarization.

The command removes Apple signing and notarization credentials from child environments and explicitly sets the signing mode, so an inherited test-mode variable cannot change a release invocation. A missing application ID defaults to `local.deepseek.harness.adhoc` only in ad-hoc mode; an explicitly malformed identifier fails. Ad-hoc preparation and artifacts live under the target's `adhoc` directory. Only the immutable Node download cache is shared with release preparation.

Ad-hoc artifacts omit update configuration, notarization, DMG signing, and release completion records. The upload command reads only the normal release directory. The [Desktop release policy](../architecture/2026-08-25-electron-desktop-packaging-and-updates.md) and [parallel notarization decision](2026-09-09-parallel-macos-notarization.md) remain active authorities for Developer ID releases; this internal-test mode is the scoped exception.

## Alternatives considered

**Enable package mutation in workspace development.** Its generated dependency links are replaced on startup and do not form the installed project expected by the package manager. A packaged test application exercises the actual installation and restart behavior without introducing another development plugin lifecycle.

**Require Developer ID for internal tests.** Developer ID and notarization support normal distribution, but local plugin tests do not need that publisher identity. The explicit test command retains release requirements without imposing membership on contributors.

**Skip every signature or weaken the release command.** Apple Silicon executables still need valid code signatures, and the bundled Node process loads native dependencies. Ad-hoc signing retains executable verification while a separate opt-in prevents accidental unsigned releases.

## Consequences

Contributors can test npm and local archive plugins without Apple credentials. Recipients still face Gatekeeper and managed-device policy; an ad-hoc signature supplies no authenticated publisher identity. These artifacts cannot qualify the signed auto-update or notarization flows. Harness data and plugin profiles keep the existing `DSH_HOME` ownership, so isolated tests select their own home before launch.

Focused tests cover command and environment selection, preparation-directory isolation, missing release credentials, signature rejection, and actual certificate-free native signing on macOS. Application packaging and startup require a macOS host; Intel and cross-machine Gatekeeper behavior remain platform qualification work.
