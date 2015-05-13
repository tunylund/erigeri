var Q = require('./Q')

function collisions(name, asset, size) {
  if(!Q.asset(asset)) { throw "Invalid Asset:" + asset; }
  
  exports.collisions[name] = { head: [], torso: [], hit: [] }

  var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      img = document.createElement('img'),
      imgData,
      head = 150,
      torso = 200,
      hit = 100
  
  img.src = asset;
  canvas.width = img.width
  canvas.height = img.height
  context.drawImage(img, 0, 0);
  
  function find(imgData, rcolor) {
    var a = Array.prototype.indexOf.call(imgData.data, rcolor) / 4,
        b = Array.prototype.lastIndexOf.call(imgData.data, rcolor) / 4,
        c = {}
    if(a < -1) return c
    c.x = a % size.tilew
    c.y = Math.floor(a / size.tilew)
    c.w = b % size.tilew - c.x
    c.h = Math.floor(b / size.tilew) - c.y
    return c
  }

  for(var x = 0; x < img.width; x+=size.tilew) {
    imgData = context.getImageData(x, 0, size.tilew, size.tileh);
    exports.collisions[name].head.push(find(imgData, head))
    exports.collisions[name].torso.push(find(imgData, torso))
    exports.collisions[name].hit.push(find(imgData, hit))
  }

}
exports.collisions = {}

exports.load = function(cb) {

  Q.load([
    "/assets/tiles.png",
    "/assets/tsuisoku.png",
    "/assets/kosoku.png",
    "/assets/ninoashi.png",
    "/assets/fujogeri.png",
    "/assets/suiheigeri.png",
    "/assets/manjigeri.png",
    "/assets/torso-hit.png",
    "/assets/headoff-hit.png",
    "/assets/kosoku-collisions.png",
    "/assets/ninoashi-collisions.png",
    "/assets/tsuisoku-collisions.png",
    "/assets/fujogeri-collisions.png",
    "/assets/suiheigeri-collisions.png",
    "/assets/manjigeri-collisions.png"], function() {

    Q.sheet("tiles","/assets/tiles.png", { tilew: 32, tileh: 32 });

    var playerTile = { tilew: 48, tileh: 32 }
    Q.sheet("suiheigeri", "/assets/suiheigeri.png", playerTile);
    Q.sheet("manjigeri", "/assets/manjigeri.png", playerTile);
    Q.sheet("tsuisoku", "/assets/tsuisoku.png", playerTile);
    Q.sheet("kosoku", "/assets/kosoku.png", playerTile);
    Q.sheet("ninoashi", "/assets/ninoashi.png", playerTile);
    Q.sheet("fujogeri", "/assets/fujogeri.png", playerTile);
    
    Q.sheet("torso-hit", "/assets/torso-hit.png", playerTile);
    Q.sheet("headoff-hit", "/assets/headoff-hit.png", playerTile);

    collisions('fujogeri', "/assets/fujogeri-collisions.png", playerTile)
    collisions('manjigeri', "/assets/manjigeri-collisions.png", playerTile)
    collisions('suiheigeri', "/assets/suiheigeri-collisions.png", playerTile)
    collisions('ninoashi', "/assets/ninoashi-collisions.png", playerTile)
    collisions('tsuisoku', "/assets/tsuisoku-collisions.png", playerTile)
    collisions('kosoku', "/assets/kosoku-collisions.png", playerTile)
    exports.collisions.stand = {
      head: [exports.collisions.tsuisoku.head[0]],
      torso: [exports.collisions.tsuisoku.torso[0]],
      hit: [exports.collisions.tsuisoku.hit[0]]
    }
    exports.collisions.ushiro = {
      head: exports.collisions.tsuisoku.head.slice(2,9),
      torso: exports.collisions.tsuisoku.torso.slice(2,9),
      hit: exports.collisions.tsuisoku.hit.slice(2,9)
    }
    exports.collisions.taisoku = {
      head: [].concat(exports.collisions.tsuisoku.head).reverse(),
      torso: [].concat(exports.collisions.tsuisoku.torso).reverse(),
      hit: [].concat(exports.collisions.tsuisoku.hit).reverse()
    }

    cb()
  });

}
