# EDSync website

Customer-facing information and downloads for EDSync and EDSync Command Link.

**Website:** https://hinxman.github.io/edsync-site/

This public repository contains only the static website, approved demo screenshots, notices and release metadata. Application source remains in its separate repository. There are currently no public installers or mobile store releases linked by the site.

## Local preview

Run `python3 -m http.server 4178` from this directory, then open http://localhost:4178. No build, dependencies, external fonts or analytics are required.

## GitHub Pages

Publish from `master`, root `/`, in **Settings → Pages → Deploy from a branch**. `.nojekyll` serves the static files directly. No application build or custom Actions workflow runs in this repository.

The public website URL above is suitable to supply as the application's homepage during Frontier registration. It is separate from the OAuth redirect URI; hosting this website does not implement or change Frontier authentication.

## Publish installers

Use this repository's **GitHub Releases** for downloadable binaries, not Git or GitHub Pages. Keep builds, signing keys and app source in the existing private build environment. Only upload installers approved for public distribution after platform testing and the project's release/signing process.

Create a release initially as a draft. Upload the tested installers using these filenames:

- `EDSync-Command-Link-<version>-win-x64-setup.exe`
- `EDSync-Command-Link-<version>-linux-x64.deb`

Include installation requirements, changes and known limitations in the release notes. Publish the stable release when ready, then run:

```sh
python3 scripts/update-releases.py v0.1.0
```

The helper uses the authenticated GitHub CLI to read that release. It refuses draft/prerelease releases, duplicate installers, unexpected URLs, missing assets and missing SHA-256 digests. It never uploads or publishes a release. It updates `releases.json` atomically using the actual download URL, size and GitHub checksum. A missing platform remains unavailable. Review the manifest, commit and push to `master`; Pages then exposes the verified download links. Use a new release version instead of replacing an existing asset.

`null` entries intentionally show “Coming soon.” Do not add placeholder binaries or fake download links. To withdraw a site's download button, set that platform to `null` and publish the change; manage any corresponding GitHub Release separately. The front page's introductory development copy and mobile availability should be updated as part of the first public launch.

## Mobile releases

Add App Store and Google Play links only after the actual listings are public. The Android debug APK used to take screenshots is not a public release artifact.

## Screenshots and assets

The site uses real demo-mode screenshots, with CMDR Aster Vale, captured from the current development app. Device information and provenance are documented in `assets/screenshots/README.md`. Do not publish personal profiles, device pairing codes or credentials.

Barlow Condensed is distributed under the SIL Open Font License in `assets/OFL.txt`. Game and community asset notices are in `assets/licenses/` and the public credits page. The screenshots do not grant a separate license to underlying Frontier assets. Website code and EDSync branding have no additional open-source license declared in this repository.
