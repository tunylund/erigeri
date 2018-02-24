const min = Math.min
const max = Math.max
const distance = (a, b) => {
  let x = Math.abs(a.x - b.x),
      y = Math.abs(a.y - b.y)
  return Math.floor(Math.sqrt(x*x + y*y))
}
const minmax = (current, value) => {
  return { min: min(current.min, value), max: max(current.max, value) }
}

const log = JSON.parse(localStorage.getItem('actionLog')) || {
  "true":{"senten":{"sensogeri":{"distance":{"min":33,"max":47},"animationFrame":{"min":50,"max":58},"animation":"sensogeri","value":1},"hangetsuate":{"distance":{"min":9,"max":28},"animationFrame":{"min":53,"max":63},"animation":"hangetsuate","value":1},"sentainotsuki":{"distance":{"min":61,"max":68},"animationFrame":{"min":44,"max":63},"animation":"sentainotsuki","value":1},"fujogeri":{"distance":{"min":46,"max":69},"animationFrame":{"min":32,"max":46},"animation":"fujogeri","value":1}},"ninoashi":{"suiheigeri":{"distance":{"min":64,"max":69},"animationFrame":{"min":3,"max":23},"animation":"suiheigeri","value":1},"fujogeri":{"distance":{"min":46,"max":69},"animationFrame":{"min":2,"max":20},"animation":"fujogeri","value":4},"manjigeri":{"distance":{"min":42,"max":42},"animationFrame":{"min":8,"max":8},"animation":"manjigeri","value":1},"sentainotsuki":{"distance":{"min":67,"max":69},"animationFrame":{"min":7,"max":13},"animation":"sentainotsuki","value":1},"sensogeri":{"distance":{"min":35,"max":35},"animationFrame":{"min":20,"max":20},"animation":"sensogeri","value":1}},"tsuisoku":{"fujogeri":{"distance":{"min":40,"max":69},"animationFrame":{"min":15,"max":37},"animation":"fujogeri","value":4},"sentainotsuki":{"distance":{"min":54,"max":63},"animationFrame":{"min":18,"max":42},"animation":"sentainotsuki","value":1},"suiheigeri":{"distance":{"min":69,"max":69},"animationFrame":{"min":26,"max":26},"animation":"suiheigeri","value":1},"manjigeri":{"distance":{"min":36,"max":49},"animationFrame":{"min":24,"max":36},"animation":"manjigeri","value":1}},"stand":{"fujogeri":{"distance":{"min":35,"max":62},"animationFrame":{"min":0,"max":0},"animation":"fujogeri","value":1},"manjigeri":{"distance":{"min":39,"max":49},"animationFrame":{"min":0,"max":0},"animation":"manjigeri","value":1},"sensogeri":{"distance":{"min":35,"max":51},"animationFrame":{"min":0,"max":0},"animation":"sensogeri","value":1},"suiheigeri":{"distance":{"min":57,"max":68},"animationFrame":{"min":0,"max":8},"animation":"suiheigeri","value":1},"sentainotsuki":{"distance":{"min":53,"max":55},"animationFrame":{"min":0,"max":0},"animation":"sentainotsuki","value":1}},"fujogeri":{"sensogeri":{"distance":{"min":38,"max":49},"animationFrame":{"min":15,"max":16},"animation":"sensogeri","value":1},"manjigeri":{"distance":{"min":35,"max":48},"animationFrame":{"min":5,"max":13},"animation":"manjigeri","value":1},"hangetsuate":{"distance":{"min":29,"max":29},"animationFrame":{"min":8,"max":8},"animation":"hangetsuate","value":1},"suiheigeri":{"distance":{"min":69,"max":69},"animationFrame":{"min":10,"max":10},"animation":"suiheigeri","value":1}},"ushiro":{"hangetsuate":{"distance":{"min":15,"max":25},"animationFrame":{"min":0,"max":12},"animation":"hangetsuate","value":4},"suiheigeri":{"distance":{"min":56,"max":69},"animationFrame":{"min":0,"max":18},"animation":"suiheigeri","value":1},"fujogeri":{"distance":{"min":30,"max":69},"animationFrame":{"min":0,"max":19},"animation":"fujogeri","value":4},"manjigeri":{"distance":{"min":42,"max":51},"animationFrame":{"min":0,"max":23},"animation":"manjigeri","value":1},"sensogeri":{"distance":{"min":33,"max":51},"animationFrame":{"min":0,"max":8},"animation":"sensogeri","value":1},"sentainotsuki":{"distance":{"min":53,"max":66},"animationFrame":{"min":0,"max":15},"animation":"sentainotsuki","value":1}},"kosoku":{"sensogeri":{"distance":{"min":32,"max":35},"animationFrame":{"min":0,"max":45},"animation":"sensogeri","value":4},"fujogeri":{"distance":{"min":37,"max":58},"animationFrame":{"min":12,"max":50},"animation":"fujogeri","value":1},"sentainotsuki":{"distance":{"min":69,"max":69},"animationFrame":{"min":55,"max":55},"animation":"sentainotsuki","value":1},"hangetsuate":{"distance":{"min":28,"max":28},"animationFrame":{"min":58,"max":58},"animation":"hangetsuate","value":1},"manjigeri":{"distance":{"min":30,"max":30},"animationFrame":{"min":4,"max":4},"animation":"manjigeri","value":1}},"taisoku":{"suiheigeri":{"distance":{"min":52,"max":67},"animationFrame":{"min":34,"max":34},"animation":"suiheigeri","value":1},"fujogeri":{"distance":{"min":20,"max":20},"animationFrame":{"min":23,"max":23},"animation":"fujogeri","value":1},"manjigeri":{"distance":{"min":30,"max":30},"animationFrame":{"min":0,"max":0},"animation":"manjigeri","value":1}},"suiheigeri":{"fujogeri":{"distance":{"min":49,"max":65},"animationFrame":{"min":0,"max":7},"animation":"fujogeri","value":1},"sentainotsuki":{"distance":{"min":62,"max":64},"animationFrame":{"min":0,"max":2},"animation":"sentainotsuki","value":1},"suiheigeri":{"distance":{"min":63,"max":63},"animationFrame":{"min":0,"max":10},"animation":"suiheigeri","value":1}},"sentainotsuki":{"manjigeri":{"distance":{"min":49,"max":49},"animationFrame":{"min":2,"max":2},"animation":"manjigeri","value":1},"fujogeri":{"distance":{"min":68,"max":68},"animationFrame":{"min":10,"max":10},"animation":"fujogeri","value":1},"sensogeri":{"distance":{"min":48,"max":48},"animationFrame":{"min":5,"max":5},"animation":"sensogeri","value":1}},"koten":{"fujogeri":{"distance":{"min":46,"max":46},"animationFrame":{"min":24,"max":24},"animation":"fujogeri","value":1}},"hangetsuate":{"sentainotsuki":{"distance":{"min":56,"max":56},"animationFrame":{"min":5,"max":5},"animation":"sentainotsuki","value":1}},"sensogeri":{"fujogeri":{"distance":{"min":34,"max":35},"animationFrame":{"min":0,"max":13},"animation":"fujogeri","value":1}}},
  "false":{"fujogeri":{"sensogeri":{"distance":{"min":38,"max":38},"animationFrame":{"min":12,"max":12},"animation":"sensogeri","value":1},"fujogeri":{"distance":{"min":52,"max":52},"animationFrame":{"min":5,"max":5},"animation":"fujogeri","value":1}},"ushiro":{"fujogeri":{"distance":{"min":14,"max":67},"animationFrame":{"min":0,"max":21},"animation":"fujogeri","value":4},"hangetsuate":{"distance":{"min":10,"max":28},"animationFrame":{"min":0,"max":27},"animation":"hangetsuate","value":4},"sentainotsuki":{"distance":{"min":56,"max":62},"animationFrame":{"min":0,"max":21},"animation":"sentainotsuki","value":1},"sensogeri":{"distance":{"min":30,"max":47},"animationFrame":{"min":0,"max":26},"animation":"sensogeri","value":1},"manjigeri":{"distance":{"min":31,"max":51},"animationFrame":{"min":0,"max":20},"animation":"manjigeri","value":1},"suiheigeri":{"distance":{"min":53,"max":67},"animationFrame":{"min":0,"max":23},"animation":"suiheigeri","value":1}},"stand":{"manjigeri":{"distance":{"min":32,"max":32},"animationFrame":{"min":0,"max":0},"animation":"manjigeri","value":1},"fujogeri":{"distance":{"min":40,"max":54},"animationFrame":{"min":0,"max":0},"animation":"fujogeri","value":4},"hangetsuate":{"distance":{"min":23,"max":23},"animationFrame":{"min":0,"max":0},"animation":"hangetsuate","value":1}},"sensogeri":{"fujogeri":{"distance":{"min":53,"max":53},"animationFrame":{"min":3,"max":3},"animation":"fujogeri","value":1}},"ninoashi":{"sensogeri":{"distance":{"min":36,"max":36},"animationFrame":{"min":0,"max":0},"animation":"sensogeri","value":1},"hangetsuate":{"distance":{"min":16,"max":16},"animationFrame":{"min":15,"max":15},"animation":"hangetsuate","value":1}},"kosoku":{"suiheigeri":{"distance":{"min":60,"max":68},"animationFrame":{"min":52,"max":55},"animation":"suiheigeri","value":1},"manjigeri":{"distance":{"min":51,"max":51},"animationFrame":{"min":53,"max":53},"animation":"manjigeri","value":1},"sensogeri":{"distance":{"min":36,"max":42},"animationFrame":{"min":31,"max":68},"animation":"sensogeri","value":1},"hangetsuate":{"distance":{"min":11,"max":11},"animationFrame":{"min":21,"max":21},"animation":"hangetsuate","value":1},"sentainotsuki":{"distance":{"min":61,"max":61},"animationFrame":{"min":7,"max":7},"animation":"sentainotsuki","value":1}},"manjigeri":{"fujogeri":{"distance":{"min":49,"max":49},"animationFrame":{"min":16,"max":16},"animation":"fujogeri","value":1},"sentainotsuki":{"distance":{"min":66,"max":66},"animationFrame":{"min":12,"max":12},"animation":"sentainotsuki","value":1}},"senten":{"hangetsuate":{"distance":{"min":12,"max":12},"animationFrame":{"min":39,"max":39},"animation":"hangetsuate","value":1},"manjigeri":{"distance":{"min":44,"max":44},"animationFrame":{"min":2,"max":2},"animation":"manjigeri","value":1}},"suiheigeri":{"hangetsuate":{"distance":{"min":22,"max":22},"animationFrame":{"min":13,"max":13},"animation":"hangetsuate","value":1}},"tsuisoku":{"sentainotsuki":{"distance":{"min":53,"max":53},"animationFrame":{"min":20,"max":20},"animation":"sentainotsuki","value":1},"manjigeri":{"distance":{"min":51,"max":51},"animationFrame":{"min":11,"max":11},"animation":"manjigeri","value":1}},"taisoku":{"suiheigeri":{"distance":{"min":67,"max":67},"animationFrame":{"min":35,"max":35},"animation":"suiheigeri","value":1}}}
}

const defaultAction = {
  distance: {min: Infinity, max: 0 },
  animationFrame: {min: Infinity, max: 0 },
  animation: '',
  value: 0
}

let timeout
function commit () {
  if (!timeout) {
    timeout = setTimeout(() => {
      timeout = null
      localStorage.setItem('actionLog', JSON.stringify(log))}, 5000)}
}

const AttackLog = {

  push: (attackEvent, value, hit) => {
    const dist = distance(attackEvent.s, attackEvent.t)
    if (hit === 'ball') {
      const vxs = log['ball'] = log['ball'] || {}
      const vys = vxs[attackEvent.t.vx] = log[attackEvent.t.vx] || {}
      const actions = vxs[attackEvent.t.vy] = log[attackEvent.t.vy] || {}
      const action = actions[attackEvent.s.animation] = actions[attackEvent.s.animation] || { distance: {min: Infinity, max: 0 } }
      action.distance = minmax(action.distance, dist)} else {
      const isFacingMe = attackEvent.s.dir != attackEvent.t.dir
      const actions = log[isFacingMe][hit === 'ball' ? 'ball' : attackEvent.t.animation] = log[isFacingMe][hit === 'ball' ? 'ball' : attackEvent.t.animation] || {}
      const action = actions[attackEvent.s.animation] = actions[attackEvent.s.animation] || { ...defaultAction }
      action.animationFrame = minmax(action.animationFrame, attackEvent.t.animationFrame)
      action.distance = minmax(action.distance, dist)
      action.value = max(action.value, value)
      action.animation = attackEvent.s.animation}
    commit()},

  findActions: (distance, animation, animationFrame, facingMe) => {
    return Object.values(log[facingMe][animation] || {})
      .filter(d => d.animationFrame.min <= animationFrame && d.animationFrame.max >= animationFrame)
      .filter(d => d.distance.min <= distance && d.distance.max >= distance)}}

export default AttackLog
