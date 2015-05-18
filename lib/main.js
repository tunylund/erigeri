var Q = require('./Q'),
    assets = require('./assets')
require('./Player')
require('./AutoPlayer')
require('./AnimPlayer')
require('./Hud')
require('./Judge')

var level = new Q.TileLayer({
 tiles: [
 new Array(20).join('0').split(''),
 new Array(20).join('0').split(''),
 new Array(20).join('0').split(''),
 new Array(20).join('1').split('')
 ], sheet: 'tiles' 
})

function gameLoop(stage, judge) {
  
  function pausePlayers() {
    if(_.contains([Q.state.get('score-a'), Q.state.get('score-b'), Q.state.get('score-c')], 4)) {
      _.invoke(stage.lists.players, 'pause')
    }
  }
  
  function cleanup() { 
    judge && judge.destroy()
    try{
      Q.audio.stop("assets/bg-loop.mp3");
      Q.audio.stop("assets/it+.mp3");
    } catch (e) {}
    Q.state.off('change', pausePlayers)
    _.invoke(stage.lists.players, 'destroy');
    hud.reset()
  }
  
  function endGame() {
    Q.stageScene('autoplay', 1)
  }

  function newGame() {
    Q.state.set({ 'total-score-a': 0, 'total-score-b': 0, 'total-score-c': 0, 'round': 0 });
    !Q.state.get('nomusic') && Q.audio.play('assets/bg-loop.mp3', {loop: true});
    newRound()
  }

  function newRound() {
    hud.reset()
    var players = stage.lists.players;
    [164, 312, 412].forEach(function(x, i) {
      players[i] && players[i].set({x: x, y: 4*16, vy: 0})
    })
    Q.state.inc('round', 1)
    if(Q.state.get('round') == 2) {
      try{ Q.audio.stop("assets/bg-loop.mp3") } catch (e){}
      !Q.state.get('nomusic') && Q.audio.play("assets/it+.mp3", {loop: true});
    }
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

  stage.on('destroyed', cleanup)
  Q.state.on('change', pausePlayers)
  judge.on('talkEnd', roundEnd)
  newGame()
}

Q.scene('bg', function(stage) {
  var bg = stage.insert(new Q.Sprite({
    asset: "assets/bg-1.png",
    scale: 608/900
  }))
  bg.center()
  bg.p.y = 198
  stage.on("destroy",function() {
    judge.destroy()
  });
})

Q.scene("anims", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.AnimPlayer({x: 64, y: 4*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
})

Q.scene("play-1on1", function(stage) {
  var layer = stage.collisionLayer(level);
  stage.addToList('players', stage.insert(new Q.Player({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  var judge = stage.insert(new Q.Judge({x: 38, y: 5*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  gameLoop(stage, judge)
})

Q.scene("play-1on2", function(stage) {
  var layer = stage.collisionLayer(level);
  stage.addToList('players', stage.insert(new Q.Player({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'c'})))
  var judge = stage.insert(new Q.Judge({x: 38, y: 5*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  gameLoop(stage, judge)
})

Q.scene("autoplay", function(stage) {
  var layer = stage.collisionLayer(level);
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'c'})))
  var judge = stage.insert(new Q.Judge({x: 38, y: 5*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  gameLoop(stage, judge)
})

var hud
assets.load(function() {
  hud = new Q.Hud()
  hud.init()
  Q.stageScene("bg", 0);
  Q.stageScene("autoplay", 1);
  Q.state.set('nomusic', false)
  document.body.addEventListener('keyup', function(e) {
    if(e.keyCode == 49) {
      Q.clearStage(1)
      Q.stageScene("play-1on1", 1);
    }
    if(e.keyCode == 50) {
      Q.clearStage(1)
      Q.stageScene("play-1on2", 1);
    }
    if(e.keyCode == 77) {
      if(Q.state.get('nomusic')) {
        Q.state.set('nomusic', false)
      } else {
        Q.state.set('nomusic', true)
        Q.audio.stop()
      }
    }
  })
})
console.log(Q)