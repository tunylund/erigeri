var Q = require('./Q'),
    assets = require('./assets')
require('./AutoPlayer')

Q.scene("level1",function(stage) {
  stage.collisionLayer(new Q.TileLayer({
                             tiles: [
                             new Array(12).join('0').split(''),
                             new Array(12).join('0').split(''),
                             new Array(12).join('0').split(''),
                             new Array(12).join('0').split(''),
                             new Array(12).join('0').split(''),
                             new Array(12).join('0').split(''),
                             new Array(12).join('1').split('')
                             ],
                             sheet:     'tiles' }));
  var playera = stage.insert(new Q.AutoPlayer({x: 64, y: 64})),
      playerb = stage.insert(new Q.AutoPlayer({x: 256, y: 64}));
  stage.add("viewport").follow(playera);
  stage.on("destroy",function() {
    playera.destroy();
    playerb.destroy();
  });
});

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

assets.load(function() {
  Q.stageScene("level1");
})
