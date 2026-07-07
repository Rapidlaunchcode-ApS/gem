# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue.

- Preferred: [open a private vulnerability report](https://github.com/Rapidlaunchcode-ApS/gem/security/advisories/new)
  (GitHub → Security → Report a vulnerability).
- Or email **nicklas@rapidlaunchcode.app**.

We aim to acknowledge within a few days and to ship a fix or mitigation before any
public disclosure.

## Verifying that a download is genuine

The macOS build is signed and notarized by Apple. Anyone can verify a downloaded copy
was built and signed by us — a tampered or re-signed binary will fail these checks:

```bash
# Team is "Rapid Launch Code ApS (NQR4JSRH2X)"
codesign -dv --verbose=4 /Applications/Gem.app          # Authority: Developer ID Application: Rapid Launch Code ApS
spctl -a -vvv -t execute /Applications/Gem.app          # accepted, source=Notarized Developer ID
xcrun stapler validate /Applications/Gem.app            # The validate action worked!
```

Each release also lists a **SHA-256 checksum** for every asset — compare it after downloading:

```bash
shasum -a 256 ~/Downloads/Gem-macOS-arm64.zip           # must match the release notes
```

If any of these don't match, **do not run the app** and please report it.

## Supported versions

Only the latest release is supported. Always download from the official sources:

- Releases: https://github.com/Rapidlaunchcode-ApS/gem/releases
- Website: https://gem-clipboard.vercel.app
