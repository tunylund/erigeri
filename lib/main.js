var Q = require('./Q'),
    assets = require('./assets')
require('./Player')
require('./AutoPlayer')
require('./AnimPlayer')
require('./Hud')
require('./Judge')

var level = new Q.TileLayer({
 tiles: [
 new Array(12).join('0').split(''),
 new Array(12).join('0').split(''),
 new Array(12).join('0').split(''),
 new Array(12).join('0').split(''),
 new Array(12).join('0').split(''),
 new Array(12).join('1').split('')
 ], sheet: 'tiles' 
})

Q.scene('bg', function(stage) {
  var bg = stage.insert(new Q.Sprite({
    asset: "/assets/bg-1.png",
    scale: 704/900
  }))
  bg.center()
  bg.p.y = 270
  stage.on("destroy",function() {
    judge.destroy()
  });
})

Q.scene("anims", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.AnimPlayer({x: 64, y: 5*32}))
  var judge = stage.insert(new Q.Judge({x: 24, y: 5*32}))
  stage.add("viewport")//.moveTo(-window.innerWidth/4, -window.innerHeight/4)
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
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

Q.scene("play", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.Player({x: 64, y: 192}))
  var playerb = stage.insert(new Q.AutoPlayer({x: 256, y: 192}))
  var judge = stage.insert(new Q.Judge({x: 24, y: 192}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  stage.on("destroy",function() {
    playera.destroy();
    playerb.destroy();
    judge.destroy()
  });
})

Q.scene('endGame',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));
  
  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Play Again" }))         
  var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                   label: stage.options.label }));

  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('level1');
  });
  container.fit(20);
});

var hud;
assets.load(function() {
  hud = new Q.Hud()
  hud.init()
  Q.stageScene("bg", 0);
  Q.stageScene("autoplay", 1);
})
