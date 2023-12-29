const TRANSPARENT = [0, 0, 0, 0]

function cvsctx(w, h, img) {
  const canvas = new OffscreenCanvas(w, h)
  const context = canvas.getContext('2d')
  if (img) context.drawImage(img, 0, 0)
  return { canvas, context }
}

function getColor(d, i) { return i < 0 || i > d.length ? TRANSPARENT : [d[i+0], d[i+1], d[i+2], d[i+3]] }
function setColor(c, d, i) { d[i+0] = c[0]; d[i+1] = c[1]; d[i+2] = c[2]; d[i+3] = c[3] }
function prevColor(d, i) { return getColor(d, i-4) }
function isTransparent(c) { return c[0] === 0 && c[1] === 0 && c[2] === 0 && c[3] === 0 }
function dark2(c) { return [c[0] - 20, c[1] - 20, c[2] - 20, c[3]] }
function dark3(c) { return [c[0] - 80, c[1] - 80, c[2] - 80, c[3]] }
function lighten(c) { return [c[0] + 30, c[1] + 30, c[2] + 30, c[3]] }

async function colorize(imageBitmap, color) {
  const trg = cvsctx(imageBitmap.width, imageBitmap.height)
  const src = cvsctx(imageBitmap.width, imageBitmap.height, imageBitmap)
  const imgData = src.context.getImageData(0, 0, src.canvas.width, src.canvas.height)
  const colData = trg.context.createImageData(imageBitmap.width, imageBitmap.height)
  
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

  trg.context.putImageData(colData, 0, 0)
  return createImageBitmap(trg.canvas)
}

onmessage = async ({ data }) => {
  const { image, color } = data[0]
  const result = await colorize(image, color)
  postMessage({ image: result });
};
