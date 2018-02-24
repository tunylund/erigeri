export function range(i) {
  let res = []
  while(res.length < i) res.push(res.length)
  return res
}

export function sample(arr) {
  return arr[Math.floor(arr.length * Math.random())]
}

export function intersects(a, b) {
  if(a.w + a.h + b.w + b.h == 0) return false
  let xIntesects = a.x < b.x && a.x+a.w > b.x ||
                   a.x < b.x+b.w && a.x+a.w > b.x+b.w,
      yIntesects = a.y < b.y && a.y + a.h > b.y ||
                   a.y < b.y+b.h && a.y+a.h > b.y+b.h
  return xIntesects && yIntesects
}

export function rect(x, y, w, h) {
  return {
    x: x||0,
    y: y||0,
    w: w||0,
    h: h||0
  }
}

export function distance(a, b) {
  let x = Math.abs(a.p.x - b.p.x),
      y = Math.abs(a.p.y - b.p.y)
  return Math.sqrt(x*x + y*y)
}

export function reduce(times, fn, initialValue) {
  return new Array(times).fill(0).reduce((lastPass, x, i) => fn(lastPass, i), initialValue)
}
