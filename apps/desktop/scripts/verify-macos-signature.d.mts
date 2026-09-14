import type { MacOSCodeSigningIdentity, MacOSSigningEnvironment } from './desktop-release-environment.mjs'

/**
 * Require the selected Developer ID identity or an ad-hoc signature without a team.
 * @param details - Output from `codesign --display --verbose=4`.
 * @param expected - Required release or ad-hoc identity.
 */
export function assertMacOSSignatureDetails(details: string, expected: MacOSCodeSigningIdentity): void

/**
 * Require hardened runtime and, for Developer ID releases, a secure timestamp.
 * @param details - Output from `codesign --display --verbose=4`.
 * @param expected - Required release or ad-hoc identity.
 */
export function assertMacOSRuntimeSignatureDetails(details: string, expected: MacOSCodeSigningIdentity): void

/**
 * Sign one Mach-O file embedded in the runtime tree.
 * @param path - Writable standalone Mach-O file.
 * @param identifier - Stable code-signing identifier derived from the release app ID and CAS digest.
 * @param expected - Required release or ad-hoc identity.
 * @returns Resolves after codesign exits successfully.
 */
export function signMacOSRuntimeCode(
  path: string,
  identifier: string,
  expected: MacOSCodeSigningIdentity,
): Promise<void>

/**
 * Verify one Mach-O file embedded in the runtime tree.
 * @param path - Mach-O file to inspect.
 * @param expected - Required release or ad-hoc identity.
 */
export function verifyMacOSRuntimeCode(path: string, expected: MacOSCodeSigningIdentity): void

/**
 * Verify the full application signature and its selected signing identity.
 * @param appPath - Path to the packaged `.app` directory.
 * @param expected - Required release or ad-hoc identity.
 */
export function verifyMacOSSignature(appPath: string, expected: MacOSCodeSigningIdentity): void

/**
 * Verify an independently distributed application's signature, ticket, and Gatekeeper acceptance.
 * @param appPath - Path to the stapled `.app` directory.
 * @param expected - Public release identity.
 */
export function verifyMacOSNotarizedApplication(appPath: string, expected: MacOSSigningEnvironment): void

/**
 * Verify the release identity, stapled ticket, and Gatekeeper acceptance of one disk image.
 * @param diskImagePath - Path to the packaged `.dmg` file.
 * @param expected - Public release identity.
 */
export function verifyMacOSDiskImage(
  diskImagePath: string,
  expected: MacOSSigningEnvironment,
): void

/** Electron-builder fields required to locate a signed macOS application. */
export interface MacOSAfterSignContext {
  readonly electronPlatformName: string
  readonly appOutDir: string
  readonly packager: {
    readonly appInfo: {
      readonly productFilename: string
    }
  }
}

/**
 * Verify the macOS application produced by electron-builder's signing phase.
 * @param context - electron-builder hook context.
 * @param expected - Required release or ad-hoc identity.
 */
export function verifyMacOSSignatureAfterSign(
  context: MacOSAfterSignContext,
  expected: MacOSCodeSigningIdentity,
): void
