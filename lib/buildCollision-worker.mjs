function mn2mx(max, inc) { return fn => { for (let i = 0, j = 0; i < max; i += inc) { fn(i, j); j++ } } }

function cvsctx(w, h, img) {
  const canvas = new OffscreenCanvas(w, h)
  const context = canvas.getContext('2d')
  if (img) context.drawImage(img, 0, 0)
  return { canvas, context }
}

function buildCollisions(context, tilew, tileh) {
  const collision = { head: [], torso: [], hit: [] }
  
  function findColorRect (imgData, rcolor) {
    const feather = 4
    let lookupColor = rcolor - feather
    let a, b, c = {}
    while (lookupColor < rcolor + feather) {
      a = imgData.data.indexOf(lookupColor) / 4
      b = imgData.data.lastIndexOf(lookupColor) / 4
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

  mn2mx(context.canvas.width, tilew)(x => {
    const imgData = context.getImageData(x, 0, tilew, tileh);
    collision.head.push(findColorRect(imgData, 150))
    collision.torso.push(findColorRect(imgData, 200))
    collision.hit.push(findColorRect(imgData, 100))
  })

  return collision
}

onmessage = ({ data }) => {
  const { name, image, tilew, tileh } = data[0]
  const { context } = cvsctx(image.width, image.height, image)
  const collision = buildCollisions(context, tilew, tileh)
  postMessage({ name, collision });
};
