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

function gameLoop(stage, judge) {
  function pausePlayers() {
    if(_.contains([Q.state.get('score-a'), Q.state.get('score-b'), Q.state.get('score-c')], 4)) {
      _.invoke(stage.lists.players, 'pause')
    }
  }
  function cleanup() { 
    Q.state.off('change', pausePlayers)
    _.invoke(stage.lists.players, 'destroy');
    hud.reset()
  }
  stage.on('destroyed', cleanup)
  
  function endGame() {
    Q.stageScene('autoplay', 1)
  }
  function newGame() {
    Q.state.set({ 'total-score-a': 0, 'total-score-b': 0, 'total-score-c': 0 });
    newRound()
  }
  function newRound() {
    hud.reset()
    var players = stage.lists.players;
    [64, 168, 256].forEach(function(x, i) {
      players[i] && players[i].set({x: x, y: 3*32, vy: 0})
    })
    _.invoke(stage.lists.players, 'unpause')
  }
  function roundEnd() {
    var scores = _.sortBy(stage.lists.players.map(function(p) {
      return {i: p.p.i, score: Q.state.get('score-'+ p.p.i)}
    }), 'score')
    if(scores[0].i === 'a' && scores[0].score < scores[1].score) {
      endGame()
    } else {
      newRound()
    }
  }
  Q.state.on('change', pausePlayers)
  judge.on('talkEnd', roundEnd)
  newGame()
}

Q.scene('bg', function(stage) {
  var bg = stage.insert(new Q.Sprite({
    asset: "assets/bg-1.png",
    scale: 576/900
  }))
  bg.center()
  bg.p.y = 230
  stage.on("destroy",function() {
    judge.destroy()
  });
})

Q.scene("anims", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.AnimPlayer({x: 64, y: 3*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
})

Q.scene("play-1on1", function(stage) {
  var layer = stage.collisionLayer(level);
  stage.addToList('players', stage.insert(new Q.Player({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  var judge = stage.insert(new Q.Judge({x: 24, y: 3*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  gameLoop(stage, judge)
})

Q.scene("play-1on2", function(stage) {
  var layer = stage.collisionLayer(level);
  stage.addToList('players', stage.insert(new Q.Player({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'c'})))
  var judge = stage.insert(new Q.Judge({x: 24, y: 3*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  gameLoop(stage, judge)
})

Q.scene("autoplay", function(stage) {
  var layer = stage.collisionLayer(level);
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'c'})))
  var judge = stage.insert(new Q.Judge({x: 24, y: 3*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  gameLoop(stage, judge)
})

var hud;
assets.load(function() {
  hud = new Q.Hud()
  hud.init()
  Q.stageScene("bg", 0);
  Q.stageScene("autoplay", 1);
  document.body.addEventListener('keyup', function(e) {
    if(e.keyCode == 49) {
      Q.clearStage(1)
      Q.stageScene("play-1on1", 1);
    }
    if(e.keyCode == 50) {
      Q.clearStage(1)
      Q.stageScene("play-1on2", 1);
    }
  })
})
console.log(Q)