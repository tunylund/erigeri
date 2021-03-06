import Q from './Q.mjs'
import { range, reduce } from './utils.mjs'

const collisions = {}
const BLACK = [0, 0, 0, 255]
const TRANSPARENT = [0, 0, 0, 0]

function cvsctx(w, h, img) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = w
  canvas.height = h
  if (img) context.drawImage(img, 0, 0)
  return { canvas, context }
}

function renderToImg(canvas) {
  const img = document.createElement('img')
  img.width = canvas.width
  img.height = canvas.height
  img.src = canvas.toDataURL('image/png')
  return img
}

function frame(srcImg, x, w) {
  const { canvas, context } = cvsctx(w, srcImg.height)
  context.drawImage(srcImg, x, 0, w, srcImg.height, 0, 0, w, srcImg.height)
  return context.getImageData(0, 0, w, srcImg.height)
}

function getColor(d, i) { return i < 0 || i > d.length ? TRANSPARENT : [d[i+0], d[i+1], d[i+2], d[i+3]] }
function setColor(c, d, i) { d[i+0] = c[0]; d[i+1] = c[1]; d[i+2] = c[2]; d[i+3] = c[3] }
function prevRowColor(d, i, tilew) { return getColor(d, i-tilew * 4) }
function nextRowColor(d, i, tilew) { return getColor(d, i+tilew * 4) }
function prevColor(d, i) { return getColor(d, i-4) }
function nextColor(d, i) { return getColor(d, i+4) }
function diffInt (a, b) { return Math.min(a, b) + Math.floor(Math.abs(Math.min(a, b) - Math.max(a, b)) / 2) }
function diffColor(a, b) { return [diffInt(a[0], b[0]), diffInt(a[1], b[1]), diffInt(a[2], b[2]), diffInt(a[3], b[3])] }
function isTransparent(c) { return c[0] === 0 && c[1] === 0 && c[2] === 0 && c[3] === 0 }
function dark1(c) { return [c[0] -  5, c[1] -  5, c[2] -  5, c[3]] }
function dark2(c) { return [c[0] - 20, c[1] - 20, c[2] - 20, c[3]] }
function dark3(c) { return [c[0] - 80, c[1] - 80, c[2] - 80, c[3]] }
function lighten(c) { return [c[0] + 30, c[1] + 30, c[2] + 30, c[3]] }
function isDarker(a, b) { return a[3] > b[3] }
function mn2mx(max, inc) { return fn => { for (let i = 0, j = 0; i < max; i += inc) { fn(i, j); j++ } } }
function mx2mn(max, inc) { return fn => { for (let i = max; i > 0; i -= inc) fn(i) } }
function dw2up (w, h, col) { return fn => mn2mx(w, 1)(x => mx2mn(h, 1)(y => fn(x * col + y * col * w))) }
function up2dw (w, h, col) { return fn => mn2mx(w, 1)(x => mn2mx(h, 1)(y => fn(x * col + y * col * w))) }
function arr2obj (memo, pair) { memo[pair[0]] = pair[1]; return memo }

function duplicateFrames(srcImg, tilew) {
  const { canvas, context } = cvsctx(srcImg.width * 2, srcImg.height)
  for (let i = 0; i < srcImg.width; i += tilew) {
    let frm = frame(srcImg, i, tilew)
    context.putImageData(frm, i * 2, 0)
    context.putImageData(frm, i * 2 + tilew, 0)
  }
  return canvas
}

function buildCollisions(canvas, tilew, tileh) {
  const collision = { head: [], torso: [], hit: [] }
  const context = canvas.getContext('2d')
  
  function findColorRect (imgData, rcolor) {
    const feather = 4
    let lookupColor = rcolor - feather
    let a, b, c = {}
    while (lookupColor < rcolor + feather) {
      a = Array.prototype.indexOf.call(imgData.data, lookupColor) / 4,
      b = Array.prototype.lastIndexOf.call(imgData.data, lookupColor) / 4
      lookupColor++
      if (a >= 0) {
        c.x = a % tilew
        c.y = Math.floor(a / tilew)
        c.w = b % tilew - c.x
        c.h = Math.floor(b / tilew) - c.y
        break
      }
    }
    return c
  }

  mn2mx(canvas.width, tilew)(x => {
    const imgData = context.getImageData(x, 0, tilew, tileh);
    collision.head.push(findColorRect(imgData, 150))
    collision.torso.push(findColorRect(imgData, 200))
    collision.hit.push(findColorRect(imgData, 100))
  })

  return collision
}

function interpolate(srcImg, tilew, tileh, passCount) {
  const { canvas, context } = cvsctx(srcImg.width * 2, srcImg.height)

  function clonePass(aData, iData) {
    for (let i = 0; i < aData.length; i++) iData[i] = aData[i]
  }

  function diffPass(aData, bData, iData) {
    for (let i = 0; i < iData.length; i += 4) {
      const ic = isTransparent(getColor(aData, i)) || isTransparent(getColor(bData, i)) ? TRANSPARENT : BLACK
      setColor(ic, iData, i)
    }
  }

  function blurPass(loop, aData, bData, iData, adjacentColorFn) {
    loop(i => {
      const ac = getColor(aData, i), bc = getColor(bData, i)
      if (isTransparent(ac) && isTransparent(bData)) return
      const ic = getColor(iData, i), adjc = adjacentColorFn(iData, i, tilew)
      if (isDarker(adjc, ic)) setColor(diffColor(BLACK, ic), iData, i)
    })
  }

  function weighPass(loop, oData, iData, adjacentColorFn) {
    loop(i => {
      const oc = getColor(oData, i)
      if (isTransparent(oc)) return
      const ic = getColor(iData, i), adjc = adjacentColorFn(iData, i, tilew)
      if (isDarker(adjc, ic)) setColor(diffColor(BLACK, ic), iData, i)
    })
  }

  mn2mx(srcImg.width, tilew)((x, j) => {
    const a = frame(srcImg, x, tilew),
          b = frame(srcImg, x + tilew, tilew),
          c = context.createImageData(tilew, srcImg.height),
          aData = a.data, bData = b.data, iData = c.data

    if (bData.findIndex(c => c != 0) === -1) clonePass(aData, iData)
    else diffPass(aData, bData, iData)

    mn2mx(2, 1)(() => blurPass(mn2mx(iData.length, 4), aData, bData, iData, nextColor))
    mn2mx(2, 1)(() => blurPass(mx2mn(iData.length, 4), aData, bData, iData, prevColor))
    mn2mx(2, 1)(() => blurPass(dw2up(tilew, tileh, 4), aData, bData, iData, prevRowColor))
    mn2mx(2, 1)(() => blurPass(up2dw(tilew, tileh, 4), aData, bData, iData, nextRowColor))

    if (passCount % 2 != 0) {
      if (j % 2 === 0) {
        mn2mx(2, 1)(() => weighPass(mn2mx(iData.length, 4), aData, iData, nextColor))
        mn2mx(2, 1)(() => weighPass(mn2mx(iData.length, 4), aData, iData, prevColor))
        mn2mx(2, 1)(() => weighPass(dw2up(tilew, tileh, 4), aData, iData, prevRowColor))
        mn2mx(2, 1)(() => weighPass(up2dw(tilew, tileh, 4), aData, iData, nextRowColor))
      } else {
        mn2mx(2, 1)(() => weighPass(mx2mn(iData.length, 4), bData, iData, prevColor))
        mn2mx(2, 1)(() => weighPass(mx2mn(iData.length, 4), bData, iData, nextColor))
        mn2mx(2, 1)(() => weighPass(dw2up(tilew, tileh, 4), bData, iData, prevRowColor))
        mn2mx(2, 1)(() => weighPass(up2dw(tilew, tileh, 4), bData, iData, nextRowColor))
      }
    }

    context.putImageData(a, x * 2, 0)
    context.putImageData(c, x * 2 + tilew, 0)
  })

  return canvas
}

function colorize(srcCanvas, color) {
  const { canvas, context } = cvsctx(srcCanvas.width, srcCanvas.height)
  const imgData = srcCanvas.getContext('2d').getImageData(0, 0, srcCanvas.width, srcCanvas.height)
  const colData = context.createImageData(srcCanvas.width, srcCanvas.height)
  
  for (let i=0; i<imgData.data.length; i+=4) {
    const c = getColor(imgData.data, i)
    if (!isTransparent(c)) {
      setColor(lighten(c), colData.data, i)
      if (isTransparent(prevColor(imgData.data, i - 4))) setColor(dark2(c), colData.data, i)
      if (isTransparent(prevColor(imgData.data, i))) setColor(dark3(color), colData.data, i)
      if (isTransparent(getColor(imgData.data, i + 4 * 2))) setColor(dark2(color), colData.data, i)
      if (isTransparent(getColor(imgData.data, i + 4))) setColor(color, colData.data, i)
    }
  }

  context.putImageData(colData, 0, 0)
  return renderToImg(canvas)
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

    playerAssets.map(async name => {
      const canvas = reduce(interpolationMultiplier / 2, (img, i) => interpolate(img, PLAYER_TILEW, PLAYER_TILEH, i), Q.asset(`assets/${name}.png`))
      Q.assets[`assets/${name}-a.png`] = colorize(canvas, [240, 121, 0, 255])
      Q.assets[`assets/${name}-b.png`] = colorize(canvas, [102, 153, 255, 255])
      Q.assets[`assets/${name}-c.png`] = colorize(canvas, [68, 221, 85, 255])
      Q.sheet(`${name}-a`, `assets/${name}-a.png`, { tilew: PLAYER_TILEW, tileh: PLAYER_TILEH })
      Q.sheet(`${name}-b`, `assets/${name}-b.png`, { tilew: PLAYER_TILEW, tileh: PLAYER_TILEH })
      Q.sheet(`${name}-c`, `assets/${name}-c.png`, { tilew: PLAYER_TILEW, tileh: PLAYER_TILEH })
    })

    playerAssets
      .filter(name => !["torso-hit", "headoff-hit"].includes(name))
      .map(name => {
        const assetName = `assets/${name}-collisions.png`
        const canvas = reduce(interpolationMultiplier / 2, img => duplicateFrames(img, PLAYER_TILEW), Q.asset(assetName))
        collisions[name] = buildCollisions(canvas, PLAYER_TILEW, PLAYER_TILEH)
      })

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

export { collisions, interpolationMultiplier, interpolate, loadAssets as default }
