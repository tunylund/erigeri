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
  "true": {
    "ushiro": {
      "sentainotsuki": { "distance": { "min": 45, "max": 68 }, "animationFrame": { "min": 0, "max": 9 }, "animation": "sentainotsuki", "value": 1 },
      "fujogeri": { "distance": { "min": 30, "max": 69 }, "animationFrame": { "min": 0, "max": 13 }, "animation": "fujogeri", "value": 4 },
      "sensogeri": { "distance": { "min": 30, "max": 52 }, "animationFrame": { "min": 0, "max": 13 }, "animation": "sensogeri", "value": 4 }, 
      "manjigeri": { "distance": { "min": 33, "max": 65 }, "animationFrame": { "min": 0, "max": 11 }, "animation": "manjigeri", "value": 1 },
      "suiheigeri": { "distance": { "min": 53, "max": 69 }, "animationFrame": { "min": 0, "max": 12 }, "animation": "suiheigeri", "value": 1 },
      "hangetsuate": { "distance": { "min": 12, "max": 29 }, "animationFrame": { "min": 0, "max": 11 }, "animation": "hangetsuate", "value": 4}},
    "fujogeri": {
      "hangetsuate": { "distance": { "min": 12, "max": 38 }, "animationFrame": { "min": 0, "max": 8 }, "animation": "hangetsuate", "value": 4 }, 
      "manjigeri": { "distance": { "min": 32, "max": 61 }, "animationFrame": { "min": 0, "max": 25 }, "animation": "manjigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 31, "max": 59 }, "animationFrame": { "min": 0, "max": 8 }, "animation": "sensogeri", "value": 1 },
      "fujogeri": { "distance": { "min": 34, "max": 67 }, "animationFrame": { "min": 0, "max": 8 }, "animation": "fujogeri", "value": 4 },
      "sentainotsuki": { "distance": { "min": 46, "max": 61 }, "animationFrame": { "min": 0, "max": 22 }, "animation": "sentainotsuki", "value": 1 },
      "suiheigeri": { "distance": { "min": 58, "max": 68 }, "animationFrame": { "min": 2, "max": 8 }, "animation": "suiheigeri", "value": 1}},
    "senten": {
      "sentainotsuki": { "distance": { "min": 55, "max": 69 }, "animationFrame": { "min": 22, "max": 33 }, "animation": "sentainotsuki", "value": 1 },
      "sensogeri": { "distance": { "min": 32, "max": 106 }, "animationFrame": { "min": 13, "max": 32 }, "animation": "sensogeri", "value": 1 },
      "fujogeri": { "distance": { "min": 36, "max": 68 }, "animationFrame": { "min": 2, "max": 32 }, "animation": "fujogeri", "value": 4 },
      "hangetsuate": { "distance": { "min": 13, "max": 29 }, "animationFrame": { "min": 26, "max": 32 }, "animation": "hangetsuate", "value": 4 },
      "suiheigeri": { "distance": { "min": 60, "max": 100 }, "animationFrame": { "min": 6, "max": 36 }, "animation": "suiheigeri", "value": 1 }, 
      "manjigeri": { "distance": { "min": 38, "max": 51 }, "animationFrame": { "min": 15, "max": 34 }, "animation": "manjigeri", "value": 1}},
    "tsuisoku": {
      "fujogeri": { "distance": { "min": 39, "max": 97 }, "animationFrame": { "min": 1, "max": 21 }, "animation": "fujogeri", "value": 4 },
      "suiheigeri": { "distance": { "min": 36, "max": 85 }, "animationFrame": { "min": 7, "max": 21 }, "animation": "suiheigeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 60, "max": 68 }, "animationFrame": { "min": 11, "max": 21 }, "animation": "sentainotsuki", "value": 1 }, 
      "manjigeri": { "distance": { "min": 42, "max": 50 }, "animationFrame": { "min": 10, "max": 18 }, "animation": "manjigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 39, "max": 51 }, "animationFrame": { "min": 0, "max": 20 }, "animation": "sensogeri", "value": 1}},
    "stand": {
      "manjigeri": { "distance": { "min": 33, "max": 54 }, "animationFrame": { "min": 0, "max": 4 }, "animation": "manjigeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 52, "max": 67 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "sentainotsuki", "value": 1 },
      "sensogeri": { "distance": { "min": 33, "max": 49 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "sensogeri", "value": 1 },
      "fujogeri": { "distance": { "min": 26, "max": 90 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "fujogeri", "value": 4 },
      "suiheigeri": { "distance": { "min": 55, "max": 93 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "suiheigeri", "value": 1 },
      "hangetsuate": { "distance": { "min": 4, "max": 29 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "hangetsuate", "value": 4}},
    "taisoku": {
      "fujogeri": { "distance": { "min": 21, "max": 61 }, "animationFrame": { "min": 0, "max": 19 }, "animation": "fujogeri", "value": 4 },
      "sensogeri": { "distance": { "min": 3, "max": 50 }, "animationFrame": { "min": 2, "max": 15 }, "animation": "sensogeri", "value": 4 },
      "hangetsuate": { "distance": { "min": 13, "max": 28 }, "animationFrame": { "min": 0, "max": 15 }, "animation": "hangetsuate", "value": 4 }, 
      "manjigeri": { "distance": { "min": 30, "max": 49 }, "animationFrame": { "min": 0, "max": 11 }, "animation": "manjigeri", "value": 1 },
      "suiheigeri": { "distance": { "min": 56, "max": 94 }, "animationFrame": { "min": 2, "max": 20 }, "animation": "suiheigeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 55, "max": 55 }, "animationFrame": { "min": 17, "max": 17 }, "animation": "sentainotsuki", "value": 1}},
    "hangetsuate": {
      "fujogeri": { "distance": { "min": 77, "max": 77 }, "animationFrame": { "min": 31, "max": 31 }, "animation": "fujogeri", "value": 1 }, 
      "manjigeri": { "distance": { "min": 35, "max": 53 }, "animationFrame": { "min": 19, "max": 34 }, "animation": "manjigeri", "value": 1 },
      "hangetsuate": { "distance": { "min": 14, "max": 27 }, "animationFrame": { "min": 15, "max": 38 }, "animation": "hangetsuate", "value": 4 },
      "sensogeri": { "distance": { "min": 40, "max": 40 }, "animationFrame": { "min": 7, "max": 7 }, "animation": "sensogeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 44, "max": 64 }, "animationFrame": { "min": 1, "max": 35 }, "animation": "sentainotsuki", "value": 1}}, 
      "manjigeri": {
      "sensogeri": { "distance": { "min": 49, "max": 66 }, "animationFrame": { "min": 7, "max": 26 }, "animation": "sensogeri", "value": 1 },
      "suiheigeri": { "distance": { "min": 60, "max": 66 }, "animationFrame": { "min": 5, "max": 8 }, "animation": "suiheigeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 53, "max": 58 }, "animationFrame": { "min": 3, "max": 22 }, "animation": "sentainotsuki", "value": 1 },
      "fujogeri": { "distance": { "min": 53, "max": 57 }, "animationFrame": { "min": 5, "max": 7 }, "animation": "fujogeri", "value": 4 }, 
      "manjigeri": { "distance": { "min": 65, "max": 65 }, "animationFrame": { "min": 26, "max": 26 }, "animation": "manjigeri", "value": 1 },
      "hangetsuate": { "distance": { "min": 20, "max": 20 }, "animationFrame": { "min": 8, "max": 8 }, "animation": "hangetsuate", "value": 1}},
    "kosoku": {
      "manjigeri": { "distance": { "min": 19, "max": 51 }, "animationFrame": { "min": 0, "max": 21 }, "animation": "manjigeri", "value": 1 },
      "suiheigeri": { "distance": { "min": 57, "max": 69 }, "animationFrame": { "min": 0, "max": 34 }, "animation": "suiheigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 34, "max": 50 }, "animationFrame": { "min": 0, "max": 22 }, "animation": "sensogeri", "value": 1 },
      "fujogeri": { "distance": { "min": 8, "max": 69 }, "animationFrame": { "min": 0, "max": 29 }, "animation": "fujogeri", "value": 4 },
      "hangetsuate": { "distance": { "min": 15, "max": 28 }, "animationFrame": { "min": 8, "max": 28 }, "animation": "hangetsuate", "value": 4 },
      "sentainotsuki": { "distance": { "min": 55, "max": 55 }, "animationFrame": { "min": 1, "max": 1 }, "animation": "sentainotsuki", "value": 1}},
    "sensogeri": {
      "manjigeri": { "distance": { "min": 37, "max": 50 }, "animationFrame": { "min": 0, "max": 8 }, "animation": "manjigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 38, "max": 69 }, "animationFrame": { "min": 0, "max": 26 }, "animation": "sensogeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 48, "max": 68 }, "animationFrame": { "min": 0, "max": 5 }, "animation": "sentainotsuki", "value": 1 },
      "suiheigeri": { "distance": { "min": 52, "max": 67 }, "animationFrame": { "min": 0, "max": 7 }, "animation": "suiheigeri", "value": 1 },
      "fujogeri": { "distance": { "min": 30, "max": 63 }, "animationFrame": { "min": 0, "max": 8 }, "animation": "fujogeri", "value": 4}},
    "suiheigeri": {
      "manjigeri": { "distance": { "min": 47, "max": 57 }, "animationFrame": { "min": 0, "max": 3 }, "animation": "manjigeri", "value": 1 },
      "fujogeri": { "distance": { "min": 43, "max": 69 }, "animationFrame": { "min": 0, "max": 10 }, "animation": "fujogeri", "value": 4 },
      "sentainotsuki": { "distance": { "min": 55, "max": 69 }, "animationFrame": { "min": 0, "max": 7 }, "animation": "sentainotsuki", "value": 1 },
      "suiheigeri": { "distance": { "min": 62, "max": 69 }, "animationFrame": { "min": 0, "max": 5 }, "animation": "suiheigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 50, "max": 50 }, "animationFrame": { "min": 3, "max": 3 }, "animation": "sensogeri", "value": 1}},
    "torsohit": {
      "sentainotsuki": { "distance": { "min": 48, "max": 91 }, "animationFrame": { "min": 7, "max": 11 }, "animation": "sentainotsuki", "value": 1 }, 
      "manjigeri": { "distance": { "min": 22, "max": 22 }, "animationFrame": { "min": 6, "max": 6 }, "animation": "manjigeri", "value": 1 },
      "fujogeri": { "distance": { "min": 45, "max": 91 }, "animationFrame": { "min": 7, "max": 12 }, "animation": "fujogeri", "value": 4 },
      "sensogeri": { "distance": { "min": 42, "max": 42 }, "animationFrame": { "min": 7, "max": 7 }, "animation": "sensogeri", "value": 4 },
      "suiheigeri": { "distance": { "min": 59, "max": 89 }, "animationFrame": { "min": 6, "max": 13 }, "animation": "suiheigeri", "value": 1}},
    "ninoashi": {
      "manjigeri": { "distance": { "min": 33, "max": 50 }, "animationFrame": { "min": 1, "max": 10 }, "animation": "manjigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 40, "max": 45 }, "animationFrame": { "min": 0, "max": 6 }, "animation": "sensogeri", "value": 1 },
      "suiheigeri": { "distance": { "min": 60, "max": 90 }, "animationFrame": { "min": 0, "max": 11 }, "animation": "suiheigeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 64, "max": 76 }, "animationFrame": { "min": 2, "max": 11 }, "animation": "sentainotsuki", "value": 1 },
      "fujogeri": { "distance": { "min": 36, "max": 69 }, "animationFrame": { "min": 1, "max": 9 }, "animation": "fujogeri", "value": 1}},
    "sentainotsuki": {
      "sensogeri": { "distance": { "min": 62, "max": 62 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "sensogeri", "value": 1 }, 
      "manjigeri": { "distance": { "min": 48, "max": 71 }, "animationFrame": { "min": 0, "max": 40 }, "animation": "manjigeri", "value": 1 },
      "fujogeri": { "distance": { "min": 50, "max": 54 }, "animationFrame": { "min": 0, "max": 3 }, "animation": "fujogeri", "value": 1}},
    "koten": {
      "suiheigeri": { "distance": { "min": 57, "max": 61 }, "animationFrame": { "min": 2, "max": 2 }, "animation": "suiheigeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 56, "max": 58 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "sentainotsuki", "value": 1 },
      "fujogeri": { "distance": { "min": 10, "max": 38 }, "animationFrame": { "min": 1, "max": 10 }, "animation": "fujogeri", "value": 4 }, 
      "manjigeri": { "distance": { "min": 31, "max": 51 }, "animationFrame": { "min": 1, "max": 18 }, "animation": "manjigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 33, "max": 33 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "sensogeri", "value": 1}}},
  "false": {
    "stand": {
      "suiheigeri": { "distance": { "min": 56, "max": 63 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "suiheigeri", "value": 1 },
      "fujogeri": { "distance": { "min": 20, "max": 67 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "fujogeri", "value": 4 },
      "sensogeri": { "distance": { "min": 34, "max": 45 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "sensogeri", "value": 1 }, 
      "manjigeri": { "distance": { "min": 31, "max": 51 }, "animationFrame": { "min": 0, "max": 4 }, "animation": "manjigeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 52, "max": 67 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "sentainotsuki", "value": 1 },
      "hangetsuate": { "distance": { "min": 10, "max": 28 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "hangetsuate", "value": 4}},
    "ushiro": {
      "fujogeri": { "distance": { "min": 19, "max": 67 }, "animationFrame": { "min": 0, "max": 13 }, "animation": "fujogeri", "value": 4 },
      "suiheigeri": { "distance": { "min": 52, "max": 73 }, "animationFrame": { "min": 0, "max": 12 }, "animation": "suiheigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 31, "max": 52 }, "animationFrame": { "min": 0, "max": 11 }, "animation": "sensogeri", "value": 4 },
      "sentainotsuki": { "distance": { "min": 53, "max": 75 }, "animationFrame": { "min": 0, "max": 12 }, "animation": "sentainotsuki", "value": 1 }, 
      "manjigeri": { "distance": { "min": 25, "max": 53 }, "animationFrame": { "min": 0, "max": 13 }, "animation": "manjigeri", "value": 1 },
      "hangetsuate": { "distance": { "min": 9, "max": 28 }, "animationFrame": { "min": 0, "max": 11 }, "animation": "hangetsuate", "value": 4}},
    "fujogeri": {
      "sensogeri": { "distance": { "min": 46, "max": 47 }, "animationFrame": { "min": 0, "max": 3 }, "animation": "sensogeri", "value": 1 },
      "hangetsuate": { "distance": { "min": 18, "max": 25 }, "animationFrame": { "min": 0, "max": 8 }, "animation": "hangetsuate", "value": 4 },
      "sentainotsuki": { "distance": { "min": 58, "max": 63 }, "animationFrame": { "min": 0, "max": 23 }, "animation": "sentainotsuki", "value": 1 },
      "fujogeri": { "distance": { "min": 33, "max": 69 }, "animationFrame": { "min": 4, "max": 8 }, "animation": "fujogeri", "value": 1 },
      "suiheigeri": { "distance": { "min": 57, "max": 57 }, "animationFrame": { "min": 2, "max": 2 }, "animation": "suiheigeri", "value": 1 }, 
      "manjigeri": { "distance": { "min": 51, "max": 51 }, "animationFrame": { "min": 4, "max": 6 }, "animation": "manjigeri", "value": 1}},
    "sensogeri": {
      "manjigeri": { "distance": { "min": 34, "max": 46 }, "animationFrame": { "min": 1, "max": 5 }, "animation": "manjigeri", "value": 1 },
      "fujogeri": { "distance": { "min": 44, "max": 53 }, "animationFrame": { "min": 6, "max": 16 }, "animation": "fujogeri", "value": 1 },
      "suiheigeri": { "distance": { "min": 55, "max": 55 }, "animationFrame": { "min": 5, "max": 5 }, "animation": "suiheigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 36, "max": 38 }, "animationFrame": { "min": 1, "max": 4 }, "animation": "sensogeri", "value": 1}},
    "torsohit": {
      "suiheigeri": { "distance": { "min": 39, "max": 39 }, "animationFrame": { "min": 4, "max": 4 }, "animation": "suiheigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 33, "max": 45 }, "animationFrame": { "min": 8, "max": 8 }, "animation": "sensogeri", "value": 1 }, 
      "manjigeri": { "distance": { "min": 43, "max": 43 }, "animationFrame": { "min": 9, "max": 9 }, "animation": "manjigeri", "value": 1}},
    "koten": {
      "fujogeri": { "distance": { "min": 65, "max": 65 }, "animationFrame": { "min": 28, "max": 28 }, "animation": "fujogeri", "value": 1 },
      "hangetsuate": { "distance": { "min": 21, "max": 21 }, "animationFrame": { "min": 3, "max": 3 }, "animation": "hangetsuate", "value": 1 },
      "sentainotsuki": { "distance": { "min": 57, "max": 67 }, "animationFrame": { "min": 0, "max": 4 }, "animation": "sentainotsuki", "value": 1}}, 
      "manjigeri": {
      "sensogeri": { "distance": { "min": 31, "max": 54 }, "animationFrame": { "min": 0, "max": 26 }, "animation": "sensogeri", "value": 4 },
      "fujogeri": { "distance": { "min": 47, "max": 47 }, "animationFrame": { "min": 5, "max": 5 }, "animation": "fujogeri", "value": 4}},
    "sentainotsuki": {
      "sentainotsuki": { "distance": { "min": 15, "max": 15 }, "animationFrame": { "min": 7, "max": 7 }, "animation": "sentainotsuki", "value": 1 }, 
      "manjigeri": { "distance": { "min": 34, "max": 47 }, "animationFrame": { "min": 5, "max": 7 }, "animation": "manjigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 48, "max": 50 }, "animationFrame": { "min": 1, "max": 2 }, "animation": "sensogeri", "value": 1}},
    "hangetsuate": {
      "sensogeri": { "distance": { "min": 39, "max": 39 }, "animationFrame": { "min": 8, "max": 25 }, "animation": "sensogeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 54, "max": 54 }, "animationFrame": { "min": 26, "max": 26 }, "animation": "sentainotsuki", "value": 1}},
    "ninoashi": {
      "sentainotsuki": { "distance": { "min": 37, "max": 65 }, "animationFrame": { "min": 0, "max": 2 }, "animation": "sentainotsuki", "value": 1 },
      "hangetsuate": { "distance": { "min": 9, "max": 21 }, "animationFrame": { "min": 0, "max": 3 }, "animation": "hangetsuate", "value": 1 }, 
      "manjigeri": { "distance": { "min": 36, "max": 48 }, "animationFrame": { "min": 0, "max": 4 }, "animation": "manjigeri", "value": 1}},
    "kosoku": {
      "fujogeri": { "distance": { "min": 47, "max": 48 }, "animationFrame": { "min": 0, "max": 31 }, "animation": "fujogeri", "value": 1 },
      "suiheigeri": { "distance": { "min": 53, "max": 69 }, "animationFrame": { "min": 10, "max": 23 }, "animation": "suiheigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 30, "max": 48 }, "animationFrame": { "min": 1, "max": 30 }, "animation": "sensogeri", "value": 1 },
      "hangetsuate": { "distance": { "min": 8, "max": 16 }, "animationFrame": { "min": 6, "max": 35 }, "animation": "hangetsuate", "value": 1 }, 
      "manjigeri": { "distance": { "min": 42, "max": 45 }, "animationFrame": { "min": 4, "max": 28 }, "animation": "manjigeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 66, "max": 66 }, "animationFrame": { "min": 1, "max": 1 }, "animation": "sentainotsuki", "value": 1}},
    "tsuisoku": {
      "manjigeri": { "distance": { "min": 30, "max": 30 }, "animationFrame": { "min": 14, "max": 14 }, "animation": "manjigeri", "value": 1 },
      "sentainotsuki": { "distance": { "min": 63, "max": 63 }, "animationFrame": { "min": 11, "max": 11 }, "animation": "sentainotsuki", "value": 1 },
      "hangetsuate": { "distance": { "min": 8, "max": 13 }, "animationFrame": { "min": 0, "max": 13 }, "animation": "hangetsuate", "value": 1 },
      "sensogeri": { "distance": { "min": 44, "max": 44 }, "animationFrame": { "min": 2, "max": 2 }, "animation": "sensogeri", "value": 1 },
      "fujogeri": { "distance": { "min": 5, "max": 5 }, "animationFrame": { "min": 4, "max": 4 }, "animation": "fujogeri", "value": 4}},
    "senten": {
      "manjigeri": { "distance": { "min": 37, "max": 51 }, "animationFrame": { "min": 1, "max": 34 }, "animation": "manjigeri", "value": 1 },
      "sensogeri": { "distance": { "min": 40, "max": 48 }, "animationFrame": { "min": 1, "max": 8 }, "animation": "sensogeri", "value": 1 },
      "hangetsuate": { "distance": { "min": 27, "max": 27 }, "animationFrame": { "min": 6, "max": 6 }, "animation": "hangetsuate", "value": 1}},
    "taisoku": {
      "hangetsuate": { "distance": { "min": 14, "max": 27 }, "animationFrame": { "min": 18, "max": 20 }, "animation": "hangetsuate", "value": 1 },
      "sentainotsuki": { "distance": { "min": 52, "max": 61 }, "animationFrame": { "min": 0, "max": 3 }, "animation": "sentainotsuki", "value": 1 }, 
      "manjigeri": { "distance": { "min": 43, "max": 46 }, "animationFrame": { "min": 1, "max": 7 }, "animation": "manjigeri", "value": 1 },
      "fujogeri": { "distance": { "min": 47, "max": 50 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "fujogeri", "value": 1 },
      "sensogeri": { "distance": { "min": 95, "max": 95 }, "animationFrame": { "min": 0, "max": 0 }, "animation": "sensogeri", "value": 1}},
    "suiheigeri": {
      "hangetsuate": { "distance": { "min": 8, "max": 17 }, "animationFrame": { "min": 4, "max": 6 }, "animation": "hangetsuate", "value": 4 },
      "sentainotsuki": { "distance": { "min": 60, "max": 69 }, "animationFrame": { "min": 0, "max": 3 }, "animation": "sentainotsuki", "value": 1 },
      "suiheigeri": { "distance": { "min": 56, "max": 57 }, "animationFrame": { "min": 2, "max": 3 }, "animation": "suiheigeri", "value": 1 },
      "fujogeri": { "distance": { "min": 31, "max": 31 }, "animationFrame": { "min": 5, "max": 5 }, "animation": "fujogeri", "value": 1 }, 
      "manjigeri": { "distance": { "min": 36, "max": 36 }, "animationFrame": { "min": 3, "max": 3 }, "animation": "manjigeri", "value": 1 }
    }
  }
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
