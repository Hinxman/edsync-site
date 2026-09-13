"""Verify that unsafe/incomplete release metadata cannot enable downloads."""
import copy
import importlib.util
from pathlib import Path
import unittest
spec = importlib.util.spec_from_file_location('updater', Path(__file__).with_name('update-releases.py'))
updater = importlib.util.module_from_spec(spec)
spec.loader.exec_module(updater)
class ReleaseMetadataTests(unittest.TestCase):
    def setUp(self):
        self.release = {'draft': False, 'prerelease': False, 'published_at': '2026-09-13T12:00:00Z', 'tag_name': 'v1.0.0', 'assets': [{'name': 'EDSync-Command-Link-1.0.0-win-x64-setup.exe', 'browser_download_url': 'https://github.com/Hinxman/edsync-site/releases/download/v1.0.0/EDSync-Command-Link-1.0.0-win-x64-setup.exe', 'digest': 'sha256:' + 'a' * 64, 'size': 1234, 'state': 'uploaded'}]}
    def test_missing_platform_stays_unavailable(self):
        result = updater.manifest(self.release)
        self.assertIsNone(result['ubuntu'])
        self.assertEqual(result['windows']['sha256'], 'a' * 64)
    def test_unpublished_or_prerelease_rejected(self):
        for field, value in [('draft', True), ('prerelease', True), ('published_at', None)]:
            release = copy.deepcopy(self.release); release[field] = value
            with self.assertRaises(ValueError): updater.manifest(release)
    def test_invalid_assets_rejected(self):
        for field, value in [('digest', None), ('digest', 'sha256:bad'), ('state', 'starter'), ('size', 0), ('browser_download_url', 'https://example.com/installer.exe')]:
            release = copy.deepcopy(self.release); release['assets'][0][field] = value
            with self.assertRaises(ValueError): updater.manifest(release)
    def test_duplicate_or_missing_installers_rejected(self):
        for assets in [[], self.release['assets'] * 2]:
            release = copy.deepcopy(self.release); release['assets'] = assets
            with self.assertRaises(ValueError): updater.manifest(release)
if __name__ == '__main__': unittest.main()
