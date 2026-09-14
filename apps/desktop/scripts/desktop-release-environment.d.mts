/** Environment variable that supplies the Electron application identifier. */
export const DESKTOP_APP_ID_ENV: 'DSH_DESKTOP_APP_ID'

/** Environment variable that supplies electron-builder's macOS certificate qualifier. */
export const MACOS_SIGNING_IDENTITY_ENV: 'DSH_DESKTOP_MACOS_SIGNING_IDENTITY'

/** Environment variable that supplies the expected Apple Developer Team ID. */
export const MACOS_TEAM_ID_ENV: 'DSH_DESKTOP_MACOS_TEAM_ID'

/** Public identity expected on a macOS release. */
export interface MacOSSigningEnvironment {
  readonly signingIdentity: string
  readonly teamId: string
}

/** Release certificate identity or certificate-free internal-test signing. */
export type MacOSCodeSigningIdentity = MacOSSigningEnvironment | 'ad-hoc'

/** Apple ID credentials accepted by notarytool. */
export interface MacOSAppleIdNotarizationEnvironment {
  readonly appleId: string
  readonly appleIdPassword: string
  readonly teamId: string
}

/** App Store Connect API credentials accepted by notarytool. */
export interface MacOSApiKeyNotarizationEnvironment {
  readonly appleApiKey: string
  readonly appleApiKeyId: string
  readonly appleApiIssuer: string
}

/** Keychain profile accepted by notarytool. */
export interface MacOSKeychainNotarizationEnvironment {
  readonly keychainProfile: string
  readonly keychain?: string
}

/** One complete credential strategy accepted by notarytool. */
export type MacOSNotarizationEnvironment =
  | MacOSAppleIdNotarizationEnvironment
  | MacOSApiKeyNotarizationEnvironment
  | MacOSKeychainNotarizationEnvironment

/**
 * Resolve and validate the application identifier shared by every platform target.
 * @param env - Packaging environment.
 * @param adHoc - Allow a local test identifier when the application ID is absent.
 * @returns Reverse-DNS application identifier.
 */
export function resolveDesktopAppId(env: NodeJS.ProcessEnv, adHoc?: boolean): string

/**
 * Resolve the explicit macOS internal-test signing mode.
 * @param env - Packaging environment.
 * @param platform - Selected target platform.
 * @returns Whether to use ad-hoc signing without notarization.
 */
export function resolveMacOSAdHocBuild(env: NodeJS.ProcessEnv, platform: string): boolean

/**
 * Resolve and validate the public identity expected on a macOS release.
 * @param env - Packaging environment.
 * @returns Expected certificate qualifier and Team ID.
 */
export function resolveMacOSSigningEnvironment(env: NodeJS.ProcessEnv): MacOSSigningEnvironment

/**
 * Resolve one complete credential set accepted by Apple's notary service.
 * @param env - Packaging environment.
 * @returns Notary credentials without the submitted artifact path.
 */
export function resolveMacOSNotarizationEnvironment(env: NodeJS.ProcessEnv): MacOSNotarizationEnvironment
