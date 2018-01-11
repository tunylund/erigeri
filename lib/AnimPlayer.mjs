import Q from './Q.mjs'
import GeriMon from './GeriMon.mjs'

const attackSequence = ['sensogeri', 'manjigeri', 'fujogeri', 'suiheigeri', 'sentainotsuki', 'hangetsuate']
const unsokuSequence = ['ninoashi', 'tsuisoku', 'kosoku', 'gensoku', 'taisoku', 'ushiro']

class AnimPlayer extends GeriMon {

  constructor (p) {
    super(Object.assign({
      anim: null,
      sequence: attackSequence
    }, p))
  }

  next () {
    let n = this.p.sequence[this.p.sequence.indexOf(this.p.anim) + 1] || this.p.sequence[0]
    if(this[n]()) {
      this.p.anim = n
    }
  }

  step (t) {
    if(Q.inputs.fire) {
      this.p.sequence = this.p.sequence == attackSequence ? unsokuSequence : attackSequence
    }
    this.next()
  }

}

export default AnimPlayer
