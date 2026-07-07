// Ad-hoc sign the macOS bundle after packing.
//
// Apple Silicon refuses to run unsigned arm64 apps, and electron-builder renames
// the bundle without re-sealing it — so a web-downloaded build shows "Gem is damaged
// and can't be opened". A valid ad-hoc signature fixes that: the app then reads as an
// ordinary un-notarized app (right-click → Open, or clear the quarantine attribute).
//
// This is a stopgap until proper Developer ID signing + notarization.
const { execFileSync } = require('node:child_process')
const { join } = require('node:path')

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return
  const appName = `${context.packager.appInfo.productFilename}.app`
  const appPath = join(context.appOutDir, appName)
  execFileSync(
    'codesign',
    ['--force', '--deep', '--sign', '-', '--identifier', 'app.rapidlaunchcode.gem', appPath],
    { stdio: 'inherit' }
  )
  console.log(`  • ad-hoc signed  ${appName}`)
}
