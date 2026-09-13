'use strict';
const previews = {
  expedition: { title: 'Give your journey some perspective.', kicker: 'Follow your curiosity', description: 'Find your place in the galaxy, revisit discoveries and plan expedition waypoints. Keep your exploration history and estimated scan values close at hand.', alt: 'EDSync expedition screen showing the galaxy map and the demo commander’s current system.', caption: 'Expedition view · iOS demo mode' },
  fleet: { title: 'Know the ship you fly.', kicker: 'From cockpit to hangar', description: 'Check your active vessel, browse your stored ships and keep an eye on your fleet carrier. Your ship details travel with you, even when you step away from the cockpit.', alt: 'EDSync Fleet screen showing CMDR Aster Vale’s Panther Clipper Mk II, hull, fuel and jump range.', caption: 'Fleet view · iOS demo mode' },
  commander: { title: 'Your next move, at a glance.', kicker: 'Welcome back, CMDR', description: 'Open a home screen built around your commander. See your current ship and location, check mission status, and jump straight into your journal or materials.', alt: 'EDSync home screen greeting CMDR Aster Vale with the active ship, location and quick actions.', caption: 'Commander view · iOS demo mode' }
};
let selectedPreview = 'expedition';
let selectedDevice = 'iphone';
function updatePreview() {
  const key = selectedPreview;
  const item = previews[key];
  const deviceName = {iphone: 'iPhone', ipad: 'iPad', android: 'Android tablet'}[selectedDevice];
  const file = `${selectedDevice === 'iphone' ? '' : selectedDevice + '-'}${key}.png`;
  document.querySelectorAll('[data-preview]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.preview === key)));
  document.querySelectorAll('[data-device]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.device === selectedDevice)));
  document.querySelector('.showcase').dataset.deviceView = selectedDevice;
  document.getElementById('feature-title').textContent = item.title;
  document.getElementById('feature-kicker').textContent = item.kicker;
  document.getElementById('feature-description').textContent = item.description;
  const img = document.getElementById('feature-image');
  img.src = `assets/screenshots/${file}`;
  img.alt = `${deviceName}: ${item.alt}`;
  const sizes = {iphone: [1206, 2622], ipad: [1668, 2420], android: [800, 1340]};
  [img.width, img.height] = sizes[selectedDevice];
  const link = document.getElementById('feature-image-link');
  link.href = img.getAttribute('src');
  link.setAttribute('aria-label', `View full-size ${deviceName} ${key} screenshot`);
  document.getElementById('feature-caption').textContent = `${key === 'expedition' ? 'Expedition' : key === 'fleet' ? 'Fleet' : 'Commander'} view · ${deviceName} demo mode`;
}
document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {selectedPreview = button.dataset.preview; updatePreview();}));
document.querySelectorAll('[data-device]').forEach(button => button.addEventListener('click', () => {selectedDevice = button.dataset.device; updatePreview();}));
function validRelease(release, platform) {
  if (!release || typeof release.version !== 'string' || !release.version || !Number.isSafeInteger(release.size) || release.size <= 0 || !/^[a-f0-9]{64}$/.test(release.sha256)) return false;
  try {
    const url = new URL(release.url);
    const suffix = platform === 'windows' ? '-win-x64-setup.exe' : '-linux-x64.deb';
    return url.origin === 'https://github.com' && url.pathname.startsWith('/Hinxman/edsync-site/releases/download/') && url.pathname.endsWith(suffix) && !url.search && !url.hash && !url.username && !url.password;
  } catch { return false; }
}
async function loadReleases() {
  if (!document.querySelector('[data-platform]')) return;
  try {
    const response = await fetch('releases.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Release information unavailable');
    const data = await response.json();
    if (data.schemaVersion !== 1) return;
    let available = false;
    for (const platform of ['windows', 'ubuntu']) {
      const release = data[platform];
      if (!validRelease(release, platform)) continue;
      const container = document.querySelector(`[data-platform="${platform}"] .release-info`);
      const link = document.createElement('a');
      link.className = 'button'; link.href = release.url; link.textContent = `Download for ${platform === 'windows' ? 'Windows' : 'Ubuntu'} ↗`;
      const metadata = document.createElement('p'); metadata.className = 'small muted';
      metadata.textContent = `Version ${release.version} · ${(release.size / 1048576).toFixed(1)} MB`;
      const checksum = document.createElement('details');
      const label = document.createElement('summary'); label.textContent = 'SHA-256 checksum';
      const digest = document.createElement('code'); digest.textContent = release.sha256;
      checksum.append(label, digest); container.replaceChildren(link, metadata, checksum); available = true;
    }
    if (available) document.querySelector('.release-status').textContent = 'Installer available';
  } catch {
    document.querySelectorAll('[data-platform] .release-info .small').forEach(node => { node.textContent = 'Check GitHub Releases below for the latest download availability.'; });
  }
}
loadReleases();
