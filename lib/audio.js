var Q = require('./Q')

var mute = false,
    music = "";

exports.music = function(asset) {
  if(mute) return;
  if(Q.assets[asset] && asset != music) {
    try{ Q.audio.stop(music) } catch (e){}
    Q.audio.play(asset, {loop: true});
    music = asset
  }
}

exports.play = function(asset) {
  if(mute) return;
  Q.audio.play(asset);
}

exports.toggleMute = function() {
  mute = !mute;
  if(mute) Q.audio.stop()
}
