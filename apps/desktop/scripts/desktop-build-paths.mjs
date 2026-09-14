/** Resolve build-owned Desktop paths without sharing mutable state across release targets. */

import { join, resolve } from 'node:path'
import { resolveMacOSAdHocBuild } from './desktop-release-environment.mjs'

const APP_ROOT = resolve(import.meta.dirname, '..')
const BUILD_ROOT = join(APP_ROOT, '.desktop-build')
const SUPPORTED_TARGETS = new Set(['mac-arm64', 'mac-x64', 'win-x64'])

/**
 * Resolve the fixed build target selected by a packaging environment.
 * @param {NodeJS.ProcessEnv} env - Packaging environment.
 * @param {NodeJS.Platform} hostPlatform - Build-host platform used when no target override exists.
 * @param {string} hostArch - Build-host architecture used when no target override exists.
 * @returns {'mac-arm64' | 'mac-x64' | 'win-x64'} Supported Desktop target name.
 */
export function resolveDesktopBuildTarget(
  env = process.env,
  hostPlatform = process.platform,
  hostArch = process.arch,
) {
  const platform = env.DSH_DESKTOP_TARGET_PLATFORM ?? env.npm_config_platform ?? hostPlatform
  const arch = env.DSH_DESKTOP_TARGET_ARCH ?? env.npm_config_arch ?? hostArch
  const os = platform === 'darwin' ? 'mac' : platform === 'win32' || platform === 'win' ? 'win' : platform
  const target = `${os}-${arch}`
  if (!SUPPORTED_TARGETS.has(target)) {
    throw new Error(`desktop build paths: unsupported target ${target}`)
  }
  return /** @type {'mac-arm64' | 'mac-x64' | 'win-x64'} */ (target)
}

/**
 * Return the mutable preparation and artifact directories owned by one release target.
 * @param {'mac-arm64' | 'mac-x64' | 'win-x64'} target - Supported Desktop target name.
 * @param {boolean} [adHoc] - Isolate internal-test preparation and artifacts from releases.
 * @returns {{ root: string, artifacts: string, runtime: string, packageSet: string, dsh: string, dshPnpm: string, nodeExtract: string, packedDsh: string, packedVendor: string, packedLandlock: string, downloads: string }} Target paths plus the shared immutable download cache.
 */
export function desktopTargetBuildPaths(target, adHoc = false) {
  if (!SUPPORTED_TARGETS.has(target)) {
    throw new Error(`desktop build paths: unsupported target ${String(target)}`)
  }
  const root = join(BUILD_ROOT, 'targets', target, ...(adHoc ? ['adhoc'] : []))
  const packed = join(root, 'packed')
  return {
    root,
    artifacts: join(root, 'artifacts'),
    runtime: join(root, 'runtime'),
    packageSet: join(root, 'package-set'),
    dsh: join(root, 'dsh'),
    dshPnpm: join(root, 'dsh-pnpm'),
    nodeExtract: join(root, 'node-extract'),
    packedDsh: join(packed, 'dsh'),
    packedVendor: join(packed, 'vendor'),
    packedLandlock: join(packed, 'landlock'),
    downloads: join(BUILD_ROOT, 'downloads'),
  }
}

/**
 * Resolve the paths owned by the target selected in a packaging environment.
 * @param {NodeJS.ProcessEnv} env - Packaging environment.
 * @param {NodeJS.Platform} hostPlatform - Build-host platform used when no target override exists.
 * @param {string} hostArch - Build-host architecture used when no target override exists.
 * @returns {ReturnType<typeof desktopTargetBuildPaths>} Selected target paths.
 */
export function resolveDesktopTargetBuildPaths(
  env = process.env,
  hostPlatform = process.platform,
  hostArch = process.arch,
) {
  const target = resolveDesktopBuildTarget(env, hostPlatform, hostArch)
  return desktopTargetBuildPaths(target, resolveMacOSAdHocBuild(env, target.startsWith('mac-') ? 'darwin' : 'win32'))
}
