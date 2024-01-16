import Q from './Q.mjs'
import GeriMon from './GeriMon.mjs'

const attackSequence  = ['sensogeri', 'sentainotsuki', 'fujogeri', 'manjigeri', 'hangetsuate', 'suiheigeri', 'ushiro']
const comboSequence   = ['sensogeri', 'sentainotsuki', 'fujogeri', 'manjigeri', 'hangetsuate', 'suiheigeri', 'ushiro']
const unsokuSequence  = ['ninoashi', 'tsuisoku', 'kosoku', 'gensoku', 'taisoku', 'senten', 'koten', 'ushiro']

class AnimPlayer extends GeriMon {

  static AttackAnim (p) {
    return new AnimPlayer({sequence: attackSequence, ...p})
  }

  static ComboAnim (p) {
    return new AnimPlayer({sequence: comboSequence, ...p})
  }

  static UnsokuAnim (p) {
    return new AnimPlayer({sequence: unsokuSequence, ...p})
  }

  constructor (p) {
    super({
      anim: null,
      sequence: attackSequence,
      ...p
    })
    if (this.p.sequence === comboSequence) this.on('step', this, 'next')
    else this.on("animEnd", this, 'next')
    this.next()
  }

  next () {
    const nextAnim = this.p.sequence[this.p.sequence.indexOf(this.p.anim) + 1] || this.p.sequence[0]
    if (this.p.sequence === comboSequence) {
      if (this[nextAnim](this)) this.p.anim = nextAnim
    } else {
      setTimeout(() => this[this.p.anim = nextAnim](this), 500)
    }
  }

  step (t) {
    if(Q.inputs.action) {
      this.p.sequence = this.p.sequence == attackSequence ? unsokuSequence : attackSequence
    }
  }

}

export default AnimPlayer
