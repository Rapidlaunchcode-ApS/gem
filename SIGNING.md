# Signing & notarizing Gem for macOS

Gem is distributed **directly** (from the website / GitHub Releases), not through the
Mac App Store. So the goal is a **Developer ID Application** signature plus **Apple
notarization** — that's what removes the "Apple could not verify Gem is free of malware"
warning for people who download it.

> **Not the Mac App Store.** The Electron *Mac App Store submission guide* uses the
> "Apple Distribution" certificate, a provisioning profile, and the App Sandbox. A
> clipboard manager can't live in the sandbox — it needs a global hotkey, Accessibility
> to paste into other apps, and to watch the system clipboard, all of which the sandbox
> forbids. Developer ID + notarization is the correct path here.

The build is already wired for this (`build/entitlements.mac.plist`, hardened runtime,
`build/notarize.cjs`). You only need the certificate and credentials — everything else is
automatic. Until then, builds are ad-hoc signed and open via right-click → Open.

## Prerequisite

An **[Apple Developer Program](https://developer.apple.com/programs/) membership** ($99/year).
There are no signing certificates without it. (Only you can enrol — it needs your Apple ID,
payment, and agreement.)

## One-time setup

1. **Create the certificate in Xcode**
   Xcode → **Settings → Accounts** → add your Apple ID → select your team →
   **Manage Certificates…** → click **+** → **Developer ID Application**.
   This puts the cert and its private key in your login keychain. Confirm with:

   ```bash
   security find-identity -v -p codesigning   # look for "Developer ID Application: … (TEAMID)"
   ```

2. **Note your Team ID** — it's the 10-character code in the identity above, or at
   [developer.apple.com → Membership](https://developer.apple.com/account).

3. **Create a notarization credential** (pick one):
   - **App Store Connect API key (recommended):** App Store Connect → **Users and Access →
     Integrations → App Store Connect API** → generate a key with **Developer** access →
     download the `AuthKey_XXXX.p8` (once!), and note the **Key ID** and **Issuer ID**.
   - **App-specific password:** [account.apple.com](https://account.apple.com) → **Sign-In
     and Security → App-Specific Passwords** → create one for "Gem notarization".

## Building a signed, notarized release

Set the environment variables (keep the `.p8` / password **out of git**):

```bash
export APPLE_TEAM_ID=XXXXXXXXXX

# Option A — API key (recommended)
export APPLE_API_KEY=/absolute/path/to/AuthKey_XXXX.p8
export APPLE_API_KEY_ID=XXXXXXXXXX
export APPLE_API_ISSUER=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Option B — Apple ID app-specific password (instead of A)
# export APPLE_ID=you@example.com
# export APPLE_APP_SPECIFIC_PASSWORD=abcd-efgh-ijkl-mnop

pnpm dist        # signs (Developer ID + hardened runtime) → notarizes → staples
ditto -c -k --keepParent dist/mac-arm64/Gem.app Gem-macOS-arm64.zip
```

electron-builder auto-discovers the Developer ID cert from your keychain and signs with the
hardened runtime and `build/entitlements.mac.plist`; `build/notarize.cjs` then submits the
app to Apple's notary service and staples the ticket. Notarization usually takes 1–5 minutes.

## Verify

```bash
codesign -dv --verbose=4 dist/mac-arm64/Gem.app   # Authority=Developer ID Application: …
spctl -a -vvv -t execute dist/mac-arm64/Gem.app   # → accepted, source=Notarized Developer ID
xcrun stapler validate dist/mac-arm64/Gem.app      # → The validate action worked!
```

Once that passes, a downloaded copy opens with **no** Gatekeeper warning.

## Notes

- Without `APPLE_TEAM_ID` set, `pnpm dist` falls back to ad-hoc signing (current behavior) —
  the app opens via right-click → Open or `xattr -dr com.apple.quarantine /Applications/Gem.app`.
- Never commit the `.p8` key, app-specific password, or `CSC_LINK`/`CSC_KEY_PASSWORD`. Store
  them in your shell env or a git-ignored file; in CI use encrypted secrets.
