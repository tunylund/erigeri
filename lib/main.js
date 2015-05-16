var Q = require('./Q'),
    assets = require('./assets')
require('./Player')
require('./AutoPlayer')
require('./AnimPlayer')
require('./Hud')
require('./Judge')

var level = new Q.TileLayer({
 tiles: [
 new Array(10).join('0').split(''),
 new Array(10).join('0').split(''),
 new Array(10).join('0').split(''),
 new Array(10).join('1').split('')
 ], sheet: 'tiles' 
})

Q.scene('bg', function(stage) {
  var bg = stage.insert(new Q.Sprite({
    asset: "assets/bg-1.png",
    scale: 576/900
  }))
  bg.center()
  bg.p.y = 236
  stage.on("destroy",function() {
    judge.destroy()
  });
})

Q.scene("anims", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.AnimPlayer({x: 64, y: 5*32}))
  var judge = stage.insert(new Q.Judge({x: 24, y: 5*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  judge.enter()
  judge.on('enterEnd', judge, 'exit')
  judge.on('exitEnd', judge, 'stand')
  window.j = judge
  stage.on("destroy",function() {
    playera.destroy();
    judge.destroy()
  });
})

Q.scene("autoplay", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.AutoPlayer())
  var playerb = stage.insert(new Q.AutoPlayer())
  var playerc = stage.insert(new Q.AutoPlayer());
  var judge = stage.insert(new Q.Judge({x: 24, y: 5*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  stage.on("destroy",function() {
    playera.destroy();
    playerb.destroy();
    playerc.destroy();
    judge.destroy()
  });
  Q.state.on('change', function() {
    if(Q.state.get('score-a') == 4 || Q.state.get('score-b') == 4 || Q.state.get('score-c') == 4) {
      _.invoke([playera, playerb, playerc], 'pause')
    }
  })
  function newRound() {
    hud.reset()
    playera.set({x: 64, y: 5*32})
    playerb.set({x: 168, y: 5*32})
    playerc.set({x: 256, y: 5*32})
    _.invoke([playera, playerb, playerc], 'unpause')
  }
  judge.on('talkEnd', newRound)
  newRound()
})

Q.scene("play-1on1", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.Player())
  var playerb = stage.insert(new Q.AutoPlayer())
  var judge = stage.insert(new Q.Judge({x: 24, y: 5*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  stage.on("destroy",function() {
    playera.destroy();
    playerb.destroy();
    judge.destroy();
    layer.destroy();
  });
  Q.state.on('change', function() {
    if(Q.state.get('score-a') == 4 || Q.state.get('score-b') == 4) {
      _.invoke([playera, playerb], 'pause')
    }
  })
  function newRound() {
    hud.reset()
    playera.set({x: 64, y: 5*32})
    playerb.set({x: 168, y: 5*32})
    _.invoke([playera, playerb], 'unpause')
  }
  judge.on('talkEnd', newRound)
  newRound()
})

function gameLoop(stage, judge) {
  Q.state.on('change', function() {
    if(_.contains([Q.state.get('score-a'), Q.state.get('score-b'), Q.state.get('score-c')], 4)) {
      _.invoke(Q.GeriMon.prototype.instances, 'pause')
    }
  })
  function newGame() {
    Q.state.set({ 'total-score-a': 0, 'total-score-b': 0, 'total-score-c': 0 });
    newRound()
  }
  function newRound() {
    hud.reset()
    var players = Q.GeriMon.prototype.instances;
    [64, 168, 256].forEach(function(x, i) {
      players[i] && players[i].set({x: x, y: 3*32, vy: 0})
    })
    _.invoke(Q.GeriMon.prototype.instances, 'unpause')
  }
  function roundEnd() {
    var scores = _.sortBy(Q.GeriMon.prototype.instances.map(function(p) {
      return {i: p.p.i, score: Q.state.get('score-'+ p.p.i)}
    }), 'score')
    if(scores[0].i === 'a' && scores[0].score < scores[1].score) {
      newGame()
    } else {
      newRound()
    }
  }
  judge.on('talkEnd', roundEnd)
  newGame()
}

Q.scene("play-1on2", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.Player())
  var playerb = stage.insert(new Q.AutoPlayer())
  var playerc = stage.insert(new Q.AutoPlayer())
  var judge = stage.insert(new Q.Judge({x: 24, y: 3*32}))
  window.p = playera
  stage.add("viewport")
  console.log(stage)
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  stage.on("destroyed",function() {
    stage.forceRemove(playera)
    stage.forceRemove(playerb)
    stage.forceRemove(playerc)
    stage.forceRemove(judge)
    stage.forceRemove(layer)
  });
  gameLoop(stage, judge)
})

var hud;
assets.load(function() {
  hud = new Q.Hud()
  hud.init()
  Q.stageScene("bg", 0);
  Q.stageScene("play-1on2", 1);
  // document.body.addEventListener('keyup', function(e) {
  //   if(e.keyCode == 49) {
  //   }
  // })
})
