
var Q = Quintus()
  .include("Sprites, Scenes, Input, 2D, Touch, UI, Anim")
  .setup({ maximize: true })
  .controls()
  .touch();

module.exports = Q
