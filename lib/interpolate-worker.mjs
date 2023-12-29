function reduce(times, fn, initialValue) {
  return new Array(times).fill(0).reduce((lastPass, x, i) => fn(lastPass, i), initialValue)
}

function cvsctx(w, h, img) {
  const canvas = new OffscreenCanvas(w, h)
  const context = canvas.getContext('2d')
  if (img) context.drawImage(img, 0, 0)
  return { canvas, context }
}

const TRANSPARENT = [0, 0, 0, 0]
const BLACK = [0, 0, 0, 255]

function frame(srcImg, x, w) {
  const { context } = cvsctx(w, srcImg.height)
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
function isTransparent(d, i) { return d[i+3] === 0 }
function isDarker(a, b) { return a[3] > b[3] }
function mn2mx(max, inc) { return fn => { for (let i = 0, j = 0; i < max; i += inc) { fn(i, j); j++ } } }
function mx2mn(max, inc) { return fn => { for (let i = max; i > 0; i -= inc) fn(i) } }
function dw2up (w, h, col) { return fn => mn2mx(w, 1)(x => mx2mn(h, 1)(y => fn(x * col + y * col * w))) }
function up2dw (w, h, col) { return fn => mn2mx(w, 1)(x => mn2mx(h, 1)(y => fn(x * col + y * col * w))) }

function interpolate(srcImg, tilew, tileh, passCount) {
  const { canvas, context } = cvsctx(srcImg.width * 2, srcImg.height)

  function clonePass(aData, iData) {
    for (let i = 0; i < aData.length; i++) iData[i] = aData[i]
  }

  function diffPass(aData, bData, iData) {
    for (let i = 0; i < iData.length; i += 4) {
      const ic = isTransparent(aData, i) || isTransparent(bData, i) ? TRANSPARENT : BLACK
      setColor(ic, iData, i)
    }
  }

  function blurPass(loop, aData, bData, iData, adjacentColorFn) {
    loop(i => {
      if (isTransparent(aData, i) && isTransparent(bData, 0)) return
      const ic = getColor(iData, i), adjc = adjacentColorFn(iData, i, tilew)
      if (isDarker(adjc, ic)) setColor(diffColor(BLACK, ic), iData, i)
    })
  }

  function weighPass(loop, oData, iData, adjacentColorFn) {
    loop(i => {
      if (isTransparent(oData, i)) return
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

onmessage = ({ data }) => {
  const { interpolationMultiplier, tilew, tileh, image } = data[0]
  const canvas = reduce(interpolationMultiplier / 2, (img, i) => interpolate(img, tilew, tileh, i), image)
  const result = canvas.transferToImageBitmap()
  postMessage({ image: result });
};
