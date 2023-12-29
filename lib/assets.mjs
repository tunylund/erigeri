import Q from './Q.mjs'
import { range, reduce } from './utils.mjs'
import { queueJob } from './bgJobs.mjs'

const collisions = {}

function cvsctx(w, h, img) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = w
  canvas.height = h
  if (img) context.drawImage(img, 0, 0)
  return { canvas, context }
}

function frame(srcImg, x, w) {
  const { canvas, context } = cvsctx(w, srcImg.height)
  context.drawImage(srcImg, x, 0, w, srcImg.height, 0, 0, w, srcImg.height)
  return context.getImageData(0, 0, w, srcImg.height)
}

function duplicateFrames(srcImg, tilew) {
  const { canvas, context } = cvsctx(srcImg.width * 2, srcImg.height)
  for (let i = 0; i < srcImg.width; i += tilew) {
    let frm = frame(srcImg, i, tilew)
    context.putImageData(frm, i * 2, 0)
    context.putImageData(frm, i * 2 + tilew, 0)
  }
  return canvas
}


const interpolationMultiplier = 4
function buildAnimations() {
  Q.animations('gerimon', {
    stand: { frames: [0, 1] },
    senten: { frames: range(Q.sheet('senten-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    koten: { frames: range(Q.sheet('koten-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    sentainotsuki: { frames: range(Q.sheet('sentainotsuki-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    fujogeri: { frames: range(Q.sheet('fujogeri-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    suiheigeri: { frames: range(Q.sheet('suiheigeri-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    manjigeri: { frames: range(Q.sheet('manjigeri-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    hangetsuate: { frames: range(Q.sheet('hangetsuate-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    sensogeri: { frames: range(Q.sheet('sensogeri-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    tsuisoku: { frames: range(Q.sheet('tsuisoku-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    kosoku: { frames: range(Q.sheet('kosoku-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    ushiro: { frames: range(Q.sheet('ushiro-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    ninoashi: { frames: range(Q.sheet('ninoashi-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    taisoku: { frames: range(Q.sheet('tsuisoku-a').frames).reverse(), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    torsohit: { frames: range(4 * interpolationMultiplier).concat(range(3 * interpolationMultiplier).reverse()), rate: 1/(interpolationMultiplier * 12), loop: false, trigger: 'stand' },
    headoffhit: { frames: range(Q.sheet('headoff-hit-a').frames), rate: 1/(interpolationMultiplier * 12), loop: false }
  })
}

function loadAssets (cb) {

  const playerAssets = [
    'senten',
    'koten',
    'suiheigeri',
    'manjigeri',
    'tsuisoku',
    'ushiro',
    'kosoku',
    'ninoashi',
    'fujogeri',
    'sensogeri',
    'sentainotsuki',
    'hangetsuate',
    'torso-hit',
    'headoff-hit']

  async function buildAssets() {
    const PLAYER_TILEW = 96
    const PLAYER_TILEH = 64

    Q.sheet('tiles', 'assets/tiles.png', { tilew: 32, tileh: 8 })
    Q.sheet('judge', 'assets/judge.png', { tilew: 32*2, tileh: 32 * 2 })

    await Promise.all(playerAssets
      .map(async name => {
        const asset = Q.asset(`assets/${name}.png`)
        const size = { tilew: PLAYER_TILEW, tileh: PLAYER_TILEH }
        const srcImage = await createImageBitmap(asset)
        const params = { interpolationMultiplier, image: srcImage, ...size }
        return queueJob('lib/interpolate-worker.mjs', params, [params.image]).then(({ image }) => {
          return Promise.all([
            queueJob('lib/colorize-worker.mjs', {image, color: [240, 121, 0, 255]}),
            queueJob('lib/colorize-worker.mjs', {image, color: [102, 153, 255, 255]}),
            queueJob('lib/colorize-worker.mjs', {image, color: [68, 221, 85, 255]})
          ])
        }).then(([a, b, c]) => {
          Q.assets[`assets/${name}-a.png`] = a.image
          Q.assets[`assets/${name}-b.png`] = b.image
          Q.assets[`assets/${name}-c.png`] = c.image
          Q.sheet(`${name}-a`, `assets/${name}-a.png`, size)
          Q.sheet(`${name}-b`, `assets/${name}-b.png`, size)
          Q.sheet(`${name}-c`, `assets/${name}-c.png`, size)
        })
      })
    )
  
    await Promise.all(playerAssets
      .filter(name => !["torso-hit", "headoff-hit"].includes(name))
      .map(async name => {
        const assetName = `assets/${name}-collisions.png`
        const canvas = reduce(interpolationMultiplier / 2, img => duplicateFrames(img, PLAYER_TILEW), Q.asset(assetName))
        const image = await createImageBitmap(canvas)
        const params = { name, image, tilew: PLAYER_TILEW, tileh: PLAYER_TILEH }
        return queueJob('lib/buildCollision-worker.mjs', params, [params.image]).then(data => {
          collisions[data.name] = data.collision
        })
      }))

    collisions.stand = {
      head: [collisions.tsuisoku.head[0]],
      torso: [collisions.tsuisoku.torso[0]],
      hit: [collisions.tsuisoku.hit[0]]
    }
    collisions.taisoku = {
      head: [].concat(collisions.tsuisoku.head).reverse(),
      torso: [].concat(collisions.tsuisoku.torso).reverse(),
      hit: [].concat(collisions.tsuisoku.hit).reverse()
    }
    collisions.torsohit = collisions.headoffhit = {
      head: [],
      torso: [],
      hit: []
    }

    buildAnimations()

    cb()

    Q.load(['assets/it+.mp3'])
  }

  Q.load([
    'assets/bg-1.png',
    'assets/bg-loop.mp3',
    'assets/bounce.mp3',
    'assets/bounce-1.mp3',
    'assets/bounce-2.mp3',
    'assets/bounce-3.mp3',
    'assets/tiles.png',
    'assets/judge.png',
    'assets/head-off-1.mp3',
    'assets/head-off-2.mp3',
    'assets/head-off-3.mp3',
    'assets/hit-1.mp3',
    'assets/hit-2.mp3',
    'assets/hit-3.mp3',
    'assets/hit-4.mp3',
    'assets/hurt-1.mp3',
    'assets/hurt-2.mp3',
    'assets/hurt-3.mp3',
    'assets/miss-1.mp3',
    'assets/miss-2.mp3'
  ].concat(playerAssets.map(name => `assets/${name}.png`))
   .concat(playerAssets
      .filter(n => !["torso-hit", "headoff-hit"].includes(n))
      .map(name => `assets/${name}-collisions.png`)
  ), buildAssets)
}

export { collisions, interpolationMultiplier, loadAssets as default }
