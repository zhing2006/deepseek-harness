/** Exercise certificate-free signing with macOS's actual code-signing verifier. */

import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { signMacOSRuntime } from '../scripts/macos-runtime.ts'
import { verifyMacOSRuntimeCode } from '../scripts/verify-macos-signature.mjs'

const roots: string[] = []
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

it.skipIf(process.platform !== 'darwin')('runs ad-hoc signed native code and rejects subsequent changes', async () => {
  const root = mkdtempSync(join(tmpdir(), 'desktop-adhoc-'))
  roots.push(root)
  const executable = join(root, 'native-tool')
  copyFileSync('/usr/bin/true', executable)
  await expect(signMacOSRuntime(root, 'local.deepseek.harness.test', 'ad-hoc')).resolves.toBe(1)
  const result = spawnSync(executable, [], { encoding: 'utf8', timeout: 10_000 })
  expect(result.error).toBeUndefined()
  expect(result.signal).toBeNull()
  expect(result.status).toBe(0)
  expect(() => { verifyMacOSRuntimeCode(executable, 'ad-hoc') }).not.toThrow()

  // A segment name lies inside a signed Mach-O page; signature metadata itself is not authenticated by ad-hoc signing.
  const bytes = readFileSync(executable)
  const offset = bytes.indexOf('__TEXT')
  expect(offset).toBeGreaterThan(-1)
  bytes[offset] = 'x'.charCodeAt(0)
  writeFileSync(executable, bytes)
  expect(() => { verifyMacOSRuntimeCode(executable, 'ad-hoc') }).toThrow(/codesign exited/u)
})
