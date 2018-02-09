import Q from './Q.mjs'
import GeriMon from './GeriMon.mjs'

const attackSequence = ['sensogeri', 'manjigeri', 'fujogeri', 'suiheigeri', 'sentainotsuki', 'hangetsuate']
const unsokuSequence = ['ninoashi', 'tsuisoku', 'kosoku', 'gensoku', 'taisoku', 'ushiro', 'senten', 'koten']

class AnimPlayer extends GeriMon {

  constructor (p) {
    super(Object.assign({
      anim: null,
      sequence: attackSequence
    }, p))
    this.on("animEnd", this, 'next')
    this.next()
  }

  next () {
    this.p.anim = this.p.sequence[this.p.sequence.indexOf(this.p.anim) + 1] || this.p.sequence[0]
    setTimeout(this[this.p.anim].bind(this), 500)
  }

  step (t) {
    if(Q.inputs.fire) {
      this.p.sequence = this.p.sequence == attackSequence ? unsokuSequence : attackSequence
    }
  }

}

export default AnimPlayer
