import Q from './Q.mjs'

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
  img.src = canvas.toDataURL("image/png")
  img.width = canvas.width
  img.height = canvas.height
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
function mn2mx(max, inc) { return fn => { for (let i = 0; i < max; i += inc) fn(i) } }
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
  return renderToImg(canvas)
}

function buildCollisions(img, tilew, tileh) {
  const collision = { head: [], torso: [], hit: [] }
  const { canvas, context } = cvsctx(img.width * 2, img.height, img)
  
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

function interpolate(srcImg, tilew, tileh) {
  const { canvas, context } = cvsctx(srcImg.width * 2, srcImg.height)

  function diffPass(aData, bData, iData) {
    for (let i = 0; i < iData.length; i += 4) {
      const ic = isTransparent(getColor(aData, i)) || isTransparent(getColor(bData, i)) ? TRANSPARENT : BLACK
      setColor(ic, iData, i)
    }
  }

  function blurPass(loop, aData, bData, iData, adjacentColorFn) {
    loop(i => {
      const ac = getColor(aData, i), bc = getColor(bData, i), ic = getColor(iData, i),
            adjc = adjacentColorFn(iData, i)
      if (((!isTransparent(ac) && isTransparent(bc)) || (isTransparent(ac) && !isTransparent(bc))) && isDarker(adjc, ic)) {
        setColor(diffColor(BLACK, ic), iData, i)
      }
    })
  }

  mn2mx(srcImg.width, tilew)(x => {
    const a = frame(srcImg, x, tilew),
          b = frame(srcImg, x + tilew, tilew),
          c = context.createImageData(tilew, srcImg.height),
          aData = a.data, bData = b.data, iData = c.data

    diffPass(aData, bData, iData)
    blurPass(mn2mx(iData.length, 4), aData, bData, iData, nextColor)
    blurPass(mn2mx(iData.length, 4), aData, bData, iData, nextColor)
    blurPass(mx2mn(iData.length, 4), aData, bData, iData, prevColor)
    blurPass(mx2mn(iData.length, 4), aData, bData, iData, prevColor)
    blurPass(dw2up(tilew, tileh, 4), aData, bData, iData, (iData, i) => prevRowColor(iData, i, tilew))
    blurPass(dw2up(tilew, tileh, 4), aData, bData, iData, (iData, i) => prevRowColor(iData, i, tilew))
    blurPass(up2dw(tilew, tileh, 4), aData, bData, iData, (iData, i) => nextRowColor(iData, i, tilew))
    blurPass(up2dw(tilew, tileh, 4), aData, bData, iData, (iData, i) => nextRowColor(iData, i, tilew))

    context.putImageData(a, x * 2, 0)
    context.putImageData(c, x * 2 + tilew, 0)
  })

  context.putImageData(frame(srcImg, srcImg.width - tilew, tilew), canvas.width - tilew, 0)

  return renderToImg(canvas)
}

function colorize(img, color) {
  const { canvas, context } = cvsctx(img.width, img.height, img)
  const imgData = context.getImageData(0, 0, img.width, img.height)
  const colData = context.createImageData(img.width, img.height)

  for (let i=0; i<imgData.data.length; i+=4) {
    const c = getColor(imgData.data, i)
    setColor(lighten(c), colData.data, i)
    if (!isTransparent(c)) {
      if (isTransparent(prevColor(imgData.data, i-4))) {
        setColor(dark2(c), colData.data, i)
      }
      if (isTransparent(prevColor(imgData.data, i))) {
        setColor(dark3(color), colData.data, i)
      }
      if (isTransparent(getColor(imgData.data, i+4*2))) {
        setColor(dark2(color), colData.data, i)
      }
      if (isTransparent(getColor(imgData.data, i+4))) {
        setColor(color, colData.data, i)
      }
    }
  }

  context.putImageData(colData, 0, 0)
  return renderToImg(canvas)
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

  function buildAssets() {
    const PLAYER_TILEW = 96
    const PLAYER_TILEH = 64

    Q.sheet('tiles', 'assets/tiles.png', { tilew: 32, tileh: 8 })
    Q.sheet('judge', 'assets/judge.png', { tilew: 32*2, tileh: 32 * 2 })

    playerAssets.map(name => {
      Q.assets[`assets/${name}.png`] = interpolate(Q.asset(`assets/${name}.png`), PLAYER_TILEW)
      Q.assets[`assets/${name}-a.png`] = colorize(Q.asset(`assets/${name}.png`), [240, 121, 0, 255])
      Q.assets[`assets/${name}-b.png`] = colorize(Q.asset(`assets/${name}.png`), [102, 153, 255, 255])
      Q.assets[`assets/${name}-c.png`] = colorize(Q.asset(`assets/${name}.png`), [68, 221, 85, 255])
      Q.sheet(`${name}-a`, `assets/${name}-a.png`, { tilew: PLAYER_TILEW, tileh: PLAYER_TILEH })
      Q.sheet(`${name}-b`, `assets/${name}-b.png`, { tilew: PLAYER_TILEW, tileh: PLAYER_TILEH })
      Q.sheet(`${name}-c`, `assets/${name}-c.png`, { tilew: PLAYER_TILEW, tileh: PLAYER_TILEH })
    })

    playerAssets
      .filter(name => !["torso-hit", "headoff-hit"].includes(name))
      .map(name => {
        const assetName = `assets/${name}-collisions.png`
        Q.assets[assetName] = duplicateFrames(Q.asset(assetName), PLAYER_TILEW)
        collisions[name] = buildCollisions(Q.asset(assetName), PLAYER_TILEW, PLAYER_TILEH)
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

export { collisions, loadAssets as default }
