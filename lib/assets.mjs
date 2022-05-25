import { preload } from '../node_modules/tiny-game-engine/lib/index.mjs'

const assets = {
  'bg-1': 'assets/bg-1.png',
  'tiles': 'assets/tiles.png',
  'judge': 'assets/judge.png',
  'senten': 'assets/senten.png',
  'koten': 'assets/koten.png',
  'suiheigeri': 'assets/suiheigeri.png',
  'manjigeri': 'assets/manjigeri.png',
  'tsuisoku': 'assets/tsuisoku.png',
  'ushiro': 'assets/ushiro.png',
  'kosoku': 'assets/kosoku.png',
  'ninoashi': 'assets/ninoashi.png',
  'fujogeri': 'assets/fujogeri.png',
  'sensogeri': 'assets/sensogeri.png',
  'sentainotsuki': 'assets/sentainotsuki.png',
  'hangetsuate': 'assets/hangetsuate.png',
  'torso-hit': 'assets/torso-hit.png',
  'headoff-hit': 'assets/headoff-hit.png',
  'senten-collisions': 'assets/senten-collisions.png',
  'koten-collisions': 'assets/koten-collisions.png',
  'suiheigeri-collisions': 'assets/suiheigeri-collisions.png',
  'manjigeri-collisions': 'assets/manjigeri-collisions.png',
  'tsuisoku-collisions': 'assets/tsuisoku-collisions.png',
  'ushiro-collisions': 'assets/ushiro-collisions.png',
  'kosoku-collisions': 'assets/kosoku-collisions.png',
  'ninoashi-collisions': 'assets/ninoashi-collisions.png',
  'fujogeri-collisions': 'assets/fujogeri-collisions.png',
  'sensogeri-collisions': 'assets/sensogeri-collisions.png',
  'sentainotsuki-collisions': 'assets/sentainotsuki-collisions.png',
  'hangetsuate-collisions': 'assets/hangetsuate-collisions.png',
  'assets/bg-loop.mp3': 'assets/bg-loop.mp3',
  'assets/bounce.mp3': 'assets/bounce.mp3',
  'assets/bounce-1.mp3': 'assets/bounce-1.mp3',
  'assets/bounce-2.mp3': 'assets/bounce-2.mp3',
  'assets/bounce-3.mp3': 'assets/bounce-3.mp3',
  'assets/head-off-1.mp3': 'assets/head-off-1.mp3',
  'assets/head-off-2.mp3': 'assets/head-off-2.mp3',
  'assets/head-off-3.mp3': 'assets/head-off-3.mp3',
  'assets/hit-1.mp3': 'assets/hit-1.mp3',
  'assets/hit-2.mp3': 'assets/hit-2.mp3',
  'assets/hit-3.mp3': 'assets/hit-3.mp3',
  'assets/hit-4.mp3': 'assets/hit-4.mp3',
  'assets/hurt-1.mp3': 'assets/hurt-1.mp3',
  'assets/hurt-2.mp3': 'assets/hurt-2.mp3',
  'assets/hurt-3.mp3': 'assets/hurt-3.mp3',
  'assets/miss-1.mp3': 'assets/miss-1.mp3',
  'assets/miss-2.mp3': 'assets/miss-2.mp3',
}

function preloadAssets(onAssetReady) {
  return preload(assets, onAssetReady)
}

function loadMusic() {
  return preload({'assets/it+.mp3': 'assets/it+.mp3'}, () => {})
}

export { preloadAssets, loadMusic }