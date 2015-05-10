var Q = require('./Q')

exports.load = function(cb) {

  Q.load([
    "/assets/level.json", 
    "/assets/tiles.png",
    "/assets/tsuisoku.png",
    "/assets/ninoashi.png",
    "/assets/suiheigeri.png",
    "/assets/manjigeri.png"], function() {

    Q.sheet("tiles","/assets/tiles.png", { tilew: 32, tileh: 32 });

    var playerTile = { tilew: 48, tileh: 32 }
    Q.sheet("suiheigeri", "/assets/suiheigeri.png", playerTile);
    Q.sheet("manjigeri", "/assets/manjigeri.png", playerTile);
    Q.sheet("tsuisoku", "/assets/tsuisoku.png", playerTile);
    Q.sheet("ninoashi", "/assets/ninoashi.png", playerTile);

    cb()
  });

}