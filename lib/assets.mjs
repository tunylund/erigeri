import Q from './Q.mjs'

const collisions = {}

function buildCollisions(name, asset, size) {
  if(!Q.asset(asset)) { throw "Invalid Asset:" + asset; }
  
  collisions[name] = { head: [], torso: [], hit: [] }

  let canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      img = Q.asset(asset),
      imgData,
      head = 150,
      torso = 200,
      hit = 100,
      feather = 4

  canvas.width = img.width
  canvas.height = img.height
  context.drawImage(img, 0, 0);

  function find (imgData, rcolor) {
    let lookupColor = rcolor - feather
    let a, b, c = {}
    while (lookupColor < rcolor + feather) {
      a = Array.prototype.indexOf.call(imgData.data, lookupColor) / 4,
      b = Array.prototype.lastIndexOf.call(imgData.data, lookupColor) / 4
      lookupColor++
      if (a >= 0) {
        c.x = a % size.tilew
        c.y = Math.floor(a / size.tilew)
        c.w = b % size.tilew - c.x
        c.h = Math.floor(b / size.tilew) - c.y
        break
      }
    }
    return c
  }

  for(let x = 0; x < img.width; x+=size.tilew) {
    imgData = context.getImageData(x, 0, size.tilew, size.tileh);
    collisions[name].head.push(find(imgData, head))
    collisions[name].torso.push(find(imgData, torso))
    collisions[name].hit.push(find(imgData, hit))
  }
}

function colorize(asset, color) {
  if(!Q.asset(asset)) { throw "Invalid Asset:" + asset }

  let canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      img = Q.asset(asset),
      imgData,
      colData,
      colImg = document.createElement("img");
  
  canvas.width = img.width
  canvas.height = img.height
  context.drawImage(img, 0, 0);
  imgData = context.getImageData(0, 0, img.width, img.height)
  colData = context.createImageData(img.width, img.height)

  function setColor(c, d, i) { d[i+0] = c[0]; d[i+1] = c[1]; d[i+2] = c[2]; d[i+3] = c[3] }
  function getColor(d, i) { return [d[i+0], d[i+1], d[i+2], d[i+3]] }
  function prevColor(d, i) { return [d[i-4], d[i-3], d[i-2], d[i-1]] }
  function nextColor(d, i) { return [d[i+4], d[i+5], d[i+6], d[i+7]] }
  function transparent(c) { return c[0] === 0 && c[1] === 0 && c[2] === 0 && c[3] === 0 }
  function dark1(c) { return [c[0] -  5, c[1] -  5, c[2] -  5, c[3]] }
  function dark2(c) { return [c[0] - 20, c[1] - 20, c[2] - 20, c[3]] }
  function dark3(c) { return [c[0] - 80, c[1] - 80, c[2] - 80, c[3]] }
  function lighten(c) { return [c[0] + 30, c[1] + 30, c[2] + 30, c[3]] }
  
  for (let i=0, c; i<imgData.data.length; i+=4) {
    c = getColor(imgData.data, i)
    setColor(lighten(c), colData.data, i)
    if (!transparent(c)) {
      if (transparent(prevColor(imgData.data, i-4))) {
        setColor(dark2(c), colData.data, i)
      }
      if (transparent(prevColor(imgData.data, i))) {
        setColor(dark3(color), colData.data, i)
      }
      if (transparent(getColor(imgData.data, i+4*2))) {
        setColor(dark2(color), colData.data, i)
      }
      if (transparent(getColor(imgData.data, i+4))) {
        setColor(color, colData.data, i)
      }
    }
  }

  context.putImageData(colData, 0, 0);
  colImg.src = canvas.toDataURL("image/png");
  colImg.width = img.width
  colImg.height = img.height
  return colImg
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

    let playerTile = { tilew: 48*2, tileh: 32*2 }
    Q.sheet('tiles', 'assets/tiles.png', { tilew: 32, tileh: 8 })
    Q.sheet('judge', 'assets/judge.png', {tilew: 32*2, tileh: 32*2})

    playerAssets.map(name => {
      Q.assets[`assets/${name}-a.png`] = colorize(`assets/${name}.png`, [240, 121, 0, 255])
      Q.assets[`assets/${name}-b.png`] = colorize(`assets/${name}.png`, [102, 153, 255, 255])
      Q.assets[`assets/${name}-c.png`] = colorize(`assets/${name}.png`, [68, 221, 85, 255])
      Q.sheet(`${name}-a`, `assets/${name}-a.png`, playerTile)
      Q.sheet(`${name}-b`, `assets/${name}-b.png`, playerTile)
      Q.sheet(`${name}-c`, `assets/${name}-c.png`, playerTile)
    })

    playerAssets
      .filter(n => !["torso-hit", "headoff-hit"].includes(n))
      .map(name => buildCollisions(name, `assets/${name}-collisions.png`, playerTile))

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

    cb()

    Q.load(['assets/it+.mp3'])
  }

  Q.load([
    'assets/bg-1.png',
    'assets/tiles.png',
    'assets/judge.png',
    'assets/bg-loop.mp3', 
    'assets/bounce.mp3',
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
  ].concat(
    playerAssets
      .map(name => `assets/${name}.png`)
  ).concat(
    playerAssets
      .filter(n => !["torso-hit", "headoff-hit"].includes(n))
      .map(name => `assets/${name}-collisions.png`)
  ), buildAssets)
}

export { collisions, loadAssets as default }
