// Notarize the macOS build (afterSign hook).
//
// Runs only when Apple credentials are present in the environment, so ordinary
// unsigned/ad-hoc `pnpm dist` builds still work with no Apple account. Once you
// have a Developer ID Application certificate in your keychain and set the env
// vars below, `pnpm dist` will sign (electron-builder) + notarize (here) +
// staple automatically. See SIGNING.md.
//
// Required: APPLE_TEAM_ID, plus ONE of:
//   • App Store Connect API key:  APPLE_API_KEY (path to .p8), APPLE_API_KEY_ID, APPLE_API_ISSUER
//   • Apple ID app-specific pw:   APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD
const { notarize } = require('@electron/notarize')

exports.default = async function notarizeHook(context) {
  if (context.electronPlatformName !== 'darwin') return

  const env = process.env
  if (!env.APPLE_TEAM_ID) {
    console.log('  • notarize: skipped (APPLE_TEAM_ID not set)')
    return
  }

  const appName = context.packager.appInfo.productFilename
  const appPath = `${context.appOutDir}/${appName}.app`

  let creds
  if (env.APPLE_API_KEY && env.APPLE_API_KEY_ID && env.APPLE_API_ISSUER) {
    creds = {
      appleApiKey: env.APPLE_API_KEY,
      appleApiKeyId: env.APPLE_API_KEY_ID,
      appleApiIssuer: env.APPLE_API_ISSUER
    }
  } else if (env.APPLE_ID && env.APPLE_APP_SPECIFIC_PASSWORD) {
    creds = { appleId: env.APPLE_ID, appleIdPassword: env.APPLE_APP_SPECIFIC_PASSWORD }
  } else {
    console.log('  • notarize: skipped (no API key or app-specific password in env)')
    return
  }

  console.log(`  • notarizing ${appName}.app — this can take a few minutes …`)
  await notarize({ appPath, teamId: env.APPLE_TEAM_ID, ...creds })
  console.log('  • notarized + stapled')
}
