#!/usr/bin/env python3
"""Generate download metadata from a published public GitHub release (requires gh)."""
import argparse
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import quote

REPO = 'Hinxman/edsync-site'
ROOT = Path(__file__).resolve().parent.parent

def api(path):
    return json.loads(subprocess.check_output(['gh', 'api', path], text=True))

def manifest(release):
    if release.get('draft') or release.get('prerelease') or not release.get('published_at'):
        raise ValueError('Only a published stable release can become a public download.')
    version = release['tag_name']
    result = {'schemaVersion': 1, 'windows': None, 'ubuntu': None}
    patterns = {'windows': r'EDSync-Command-Link-.+-win-x64-setup\.exe', 'ubuntu': r'EDSync-Command-Link-.+-linux-x64\.deb'}
    for platform, pattern in patterns.items():
        matches = [asset for asset in release.get('assets', []) if re.fullmatch(pattern, asset['name'])]
        if len(matches) > 1:
            raise ValueError(f'Multiple {platform} installers match. Publish one installer per platform.')
        if not matches:
            continue
        asset = matches[0]
        digest = asset.get('digest', '') or ''
        if not re.fullmatch(r'sha256:[a-f0-9]{64}', digest):
            raise ValueError(f"GitHub has not supplied a SHA-256 digest for {asset['name']}.")
        expected = f"https://github.com/{REPO}/releases/download/{quote(version, safe='')}/{quote(asset['name'], safe='')}"
        if asset['browser_download_url'] != expected or asset.get('state') != 'uploaded' or asset['size'] <= 0:
            raise ValueError(f"Invalid or incomplete release asset: {asset['name']}")
        result[platform] = {'version': version, 'url': expected, 'size': asset['size'], 'sha256': digest[7:]}
    if not any(result[key] for key in patterns):
        raise ValueError('No Windows or Ubuntu installer found; existing manifest left unchanged.')
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('tag', help='Published stable GitHub Release tag, for example v0.1.0')
    args = parser.parse_args()
    release = api(f'repos/{REPO}/releases/tags/{quote(args.tag, safe="")}')
    data = manifest(release)
    target = ROOT / 'releases.json'
    temporary = target.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(data, indent=2) + '\n')
    temporary.replace(target)
    print('Updated releases.json. Review, commit and push it to publish the download buttons.')

if __name__ == '__main__':
    try:
        main()
    except (ValueError, subprocess.CalledProcessError, KeyError) as error:
        print(f'Release metadata not updated: {error}', file=sys.stderr)
        sys.exit(1)
