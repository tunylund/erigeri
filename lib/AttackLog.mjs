const min = Math.min
const max = Math.max
const distance = (a, b) => {
  let x = Math.abs(a.x - b.x),
      y = Math.abs(a.y - b.y)
  return Math.sqrt(x*x + y*y)
}
const minmax = (current, value) => {
  return { min: min(current.min, value), max: max(current.max, value) }
}

const log = JSON.parse(localStorage.getItem('actionLog')) || {
  "true": {
    "suiheigeri": {
      "fujogeri": {
        "distance": {
          "min": 36.321999999999946,
          "max": 68.73333333333346
        },
        "animationFrame": {
          "min": 0,
          "max": 8
        },
        "animation": "fujogeri",
        "value": 4
      },
      "sentainotsuki": {
        "distance": {
          "min": 52.06666666666979,
          "max": 69.16700000000026
        },
        "animationFrame": {
          "min": 0,
          "max": 8
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "sensogeri": {
        "distance": {
          "min": 41.493333333333396,
          "max": 49.85000000000002
        },
        "animationFrame": {
          "min": 2,
          "max": 4
        },
        "animation": "sensogeri",
        "value": 4
      },
      "suiheigeri": {
        "distance": {
          "min": 63.66099999999929,
          "max": 69.67499999999967
        },
        "animationFrame": {
          "min": 2,
          "max": 6
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 28.490000000001658,
          "max": 28.490000000001658
        },
        "animationFrame": {
          "min": 2,
          "max": 2
        },
        "animation": "hangetsuate",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 44.875,
          "max": 69.56899999999985
        },
        "animationFrame": {
          "min": 0,
          "max": 8
        },
        "animation": "manjigeri",
        "value": 1
      }
    },
    "ushiro": {
      "suiheigeri": {
        "distance": {
          "min": 53.46333333333308,
          "max": 69.90399999999994
        },
        "animationFrame": {
          "min": 0,
          "max": 10
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 30.354999999999848,
          "max": 69.84166666666823
        },
        "animationFrame": {
          "min": 0,
          "max": 12
        },
        "animation": "fujogeri",
        "value": 4
      },
      "sensogeri": {
        "distance": {
          "min": 40.1049999999986,
          "max": 51.875
        },
        "animationFrame": {
          "min": 0,
          "max": 10
        },
        "animation": "sensogeri",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 35.59800000000189,
          "max": 60.244666666666376
        },
        "animationFrame": {
          "min": 0,
          "max": 12
        },
        "animation": "manjigeri",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 10.30500000000012,
          "max": 29.938666666666393
        },
        "animationFrame": {
          "min": 0,
          "max": 12
        },
        "animation": "hangetsuate",
        "value": 4
      },
      "sentainotsuki": {
        "distance": {
          "min": 53.899999999999466,
          "max": 78.74466666666638
        },
        "animationFrame": {
          "min": 0,
          "max": 12
        },
        "animation": "sentainotsuki",
        "value": 1
      }
    },
    "sensogeri": {
      "suiheigeri": {
        "distance": {
          "min": 55.47499999999917,
          "max": 68.72366666666667
        },
        "animationFrame": {
          "min": 0,
          "max": 6
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 40.58999999999969,
          "max": 70.42766666666648
        },
        "animationFrame": {
          "min": 2,
          "max": 34
        },
        "animation": "fujogeri",
        "value": 1
      },
      "sentainotsuki": {
        "distance": {
          "min": 46.59933333333018,
          "max": 68.55666666666741
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 33.403666666665856,
          "max": 65.53999999999908
        },
        "animationFrame": {
          "min": 0,
          "max": 36
        },
        "animation": "manjigeri",
        "value": 1
      },
      "sensogeri": {
        "distance": {
          "min": 43.875,
          "max": 50.62666666666689
        },
        "animationFrame": {
          "min": 0,
          "max": 36
        },
        "animation": "sensogeri",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 22.315000000000282,
          "max": 22.315000000000282
        },
        "animationFrame": {
          "min": 14,
          "max": 14
        },
        "animation": "hangetsuate",
        "value": 4
      }
    },
    "ninoashi": {
      "manjigeri": {
        "distance": {
          "min": 40.32499999999936,
          "max": 51.1120000000015
        },
        "animationFrame": {
          "min": 0,
          "max": 10
        },
        "animation": "manjigeri",
        "value": 1
      },
      "suiheigeri": {
        "distance": {
          "min": 60.79700000000179,
          "max": 87.10200000000387
        },
        "animationFrame": {
          "min": 0,
          "max": 10
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "sentainotsuki": {
        "distance": {
          "min": 60.490333333331705,
          "max": 93.35699999999997
        },
        "animationFrame": {
          "min": 2,
          "max": 10
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 34.831999999999084,
          "max": 85.30500000000023
        },
        "animationFrame": {
          "min": 0,
          "max": 10
        },
        "animation": "fujogeri",
        "value": 1
      }
    },
    "stand": {
      "fujogeri": {
        "distance": {
          "min": 7.694666666667445,
          "max": 73.81633333333582
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "fujogeri",
        "value": 4
      },
      "sentainotsuki": {
        "distance": {
          "min": 49.030000000000484,
          "max": 63.333666666667085
        },
        "animationFrame": {
          "min": 0,
          "max": 4
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "sensogeri": {
        "distance": {
          "min": 35.29999999999944,
          "max": 67431.3873720725
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "sensogeri",
        "value": 4
      },
      "suiheigeri": {
        "distance": {
          "min": 48.11933333333235,
          "max": 92.36833333333635
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 36.69400000000064,
          "max": 109797.10168542812
        },
        "animationFrame": {
          "min": 0,
          "max": 4
        },
        "animation": "manjigeri",
        "value": 4
      },
      "hangetsuate": {
        "distance": {
          "min": 12.832000000000136,
          "max": 29.83699999999959
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "hangetsuate",
        "value": 4
      }
    },
    "senten": {
      "manjigeri": {
        "distance": {
          "min": 31.007333333337044,
          "max": 51.66700000000009
        },
        "animationFrame": {
          "min": 0,
          "max": 56
        },
        "animation": "manjigeri",
        "value": 1
      },
      "sentainotsuki": {
        "distance": {
          "min": 59.483999999999526,
          "max": 115.36433333333659
        },
        "animationFrame": {
          "min": 2,
          "max": 32
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "suiheigeri": {
        "distance": {
          "min": 54.13199999999989,
          "max": 102.33233333333658
        },
        "animationFrame": {
          "min": 20,
          "max": 36
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 40.07866666666797,
          "max": 88.5153333333335
        },
        "animationFrame": {
          "min": 2,
          "max": 36
        },
        "animation": "fujogeri",
        "value": 4
      },
      "sensogeri": {
        "distance": {
          "min": 42.2243333333343,
          "max": 58.951333333333025
        },
        "animationFrame": {
          "min": 0,
          "max": 36
        },
        "animation": "sensogeri",
        "value": 4
      },
      "hangetsuate": {
        "distance": {
          "min": 24.319000000000074,
          "max": 24.319000000000074
        },
        "animationFrame": {
          "min": 32,
          "max": 32
        },
        "animation": "hangetsuate",
        "value": 4
      }
    },
    "kosoku": {
      "sensogeri": {
        "distance": {
          "min": 32.65499999999952,
          "max": 39.76466666666664
        },
        "animationFrame": {
          "min": 12,
          "max": 26
        },
        "animation": "sensogeri",
        "value": 4
      },
      "sentainotsuki": {
        "distance": {
          "min": 34.67666666666611,
          "max": 68.26799999999773
        },
        "animationFrame": {
          "min": 0,
          "max": 30
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 30.635000000000502,
          "max": 51.575000000000045
        },
        "animationFrame": {
          "min": 0,
          "max": 24
        },
        "animation": "manjigeri",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 6.67800000000031,
          "max": 29.73333333333312
        },
        "animationFrame": {
          "min": 10,
          "max": 30
        },
        "animation": "hangetsuate",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 9.448333333332187,
          "max": 69.67699999999957
        },
        "animationFrame": {
          "min": 0,
          "max": 22
        },
        "animation": "fujogeri",
        "value": 4
      },
      "suiheigeri": {
        "distance": {
          "min": 52.40166666666647,
          "max": 69.35633333333288
        },
        "animationFrame": {
          "min": 4,
          "max": 56
        },
        "animation": "suiheigeri",
        "value": 1
      }
    },
    "taisoku": {
      "manjigeri": {
        "distance": {
          "min": 8.60499999999945,
          "max": 50.15000000000089
        },
        "animationFrame": {
          "min": 0,
          "max": 20
        },
        "animation": "manjigeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 16.986666666666935,
          "max": 52.20700000000022
        },
        "animationFrame": {
          "min": 2,
          "max": 16
        },
        "animation": "fujogeri",
        "value": 4
      },
      "sensogeri": {
        "distance": {
          "min": 34.76333333333409,
          "max": 34.76333333333409
        },
        "animationFrame": {
          "min": 12,
          "max": 12
        },
        "animation": "sensogeri",
        "value": 1
      }
    },
    "tsuisoku": {
      "fujogeri": {
        "distance": {
          "min": 34.68399999999974,
          "max": 87.85000000000025
        },
        "animationFrame": {
          "min": 0,
          "max": 20
        },
        "animation": "fujogeri",
        "value": 4
      },
      "suiheigeri": {
        "distance": {
          "min": 64.56099999999924,
          "max": 71.51666666666733
        },
        "animationFrame": {
          "min": 12,
          "max": 18
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "sentainotsuki": {
        "distance": {
          "min": 60.254999999999086,
          "max": 69.3999999999997
        },
        "animationFrame": {
          "min": 6,
          "max": 20
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "sensogeri": {
        "distance": {
          "min": 37.874999999999886,
          "max": 98.56100000000043
        },
        "animationFrame": {
          "min": 2,
          "max": 14
        },
        "animation": "sensogeri",
        "value": 4
      },
      "manjigeri": {
        "distance": {
          "min": 37.6869999999995,
          "max": 73.03833333333381
        },
        "animationFrame": {
          "min": 0,
          "max": 20
        },
        "animation": "manjigeri",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 25.774999999999523,
          "max": 25.774999999999523
        },
        "animationFrame": {
          "min": 16,
          "max": 16
        },
        "animation": "hangetsuate",
        "value": 4
      }
    },
    "torsohit": {
      "sensogeri": {
        "distance": {
          "min": 22.640000000000157,
          "max": 22.640000000000157
        },
        "animationFrame": {
          "min": 6,
          "max": 6
        },
        "animation": "sensogeri",
        "value": 1
      },
      "sentainotsuki": {
        "distance": {
          "min": 45.925333333333526,
          "max": 65.9036666666662
        },
        "animationFrame": {
          "min": 8,
          "max": 10
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 33.704333333332244,
          "max": 40.85699999999974
        },
        "animationFrame": {
          "min": 6,
          "max": 8
        },
        "animation": "manjigeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 32.01200000000034,
          "max": 32.01200000000034
        },
        "animationFrame": {
          "min": 10,
          "max": 10
        },
        "animation": "fujogeri",
        "value": 1
      },
      "suiheigeri": {
        "distance": {
          "min": 64.29300000000188,
          "max": 64.29300000000188
        },
        "animationFrame": {
          "min": 6,
          "max": 6
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 47.455999999998255,
          "max": 47.455999999998255
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "hangetsuate",
        "value": 1
      }
    },
    "sentainotsuki": {
      "fujogeri": {
        "distance": {
          "min": 43.87500000000006,
          "max": 69.20700000000016
        },
        "animationFrame": {
          "min": 0,
          "max": 8
        },
        "animation": "fujogeri",
        "value": 4
      },
      "manjigeri": {
        "distance": {
          "min": 45.57499999999999,
          "max": 50.93566666666641
        },
        "animationFrame": {
          "min": 0,
          "max": 4
        },
        "animation": "manjigeri",
        "value": 1
      },
      "sentainotsuki": {
        "distance": {
          "min": 87.12666666666684,
          "max": 87.12666666666684
        },
        "animationFrame": {
          "min": 20,
          "max": 20
        },
        "animation": "sentainotsuki",
        "value": 1
      }
    },
    "fujogeri": {
      "sensogeri": {
        "distance": {
          "min": 30.19500000000022,
          "max": 51.08433333333227
        },
        "animationFrame": {
          "min": 0,
          "max": 6
        },
        "animation": "sensogeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 46.900000000000205,
          "max": 68.38400000000016
        },
        "animationFrame": {
          "min": 0,
          "max": 8
        },
        "animation": "fujogeri",
        "value": 4
      },
      "hangetsuate": {
        "distance": {
          "min": 18.47700000000009,
          "max": 27.99866666666702
        },
        "animationFrame": {
          "min": 0,
          "max": 26
        },
        "animation": "hangetsuate",
        "value": 4
      },
      "sentainotsuki": {
        "distance": {
          "min": 30.228333333332557,
          "max": 66.4063249999576
        },
        "animationFrame": {
          "min": 0,
          "max": 22
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 37.0153333333333,
          "max": 49.6493333333336
        },
        "animationFrame": {
          "min": 0,
          "max": 4
        },
        "animation": "manjigeri",
        "value": 1
      },
      "suiheigeri": {
        "distance": {
          "min": 64.1000000000002,
          "max": 65.34933333333359
        },
        "animationFrame": {
          "min": 2,
          "max": 4
        },
        "animation": "suiheigeri",
        "value": 1
      }
    },
    "manjigeri": {
      "sensogeri": {
        "distance": {
          "min": 31.670999999999026,
          "max": 66.43399999999963
        },
        "animationFrame": {
          "min": 4,
          "max": 26
        },
        "animation": "sensogeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 38.34266666666599,
          "max": 57.47199999999992
        },
        "animationFrame": {
          "min": 8,
          "max": 20
        },
        "animation": "fujogeri",
        "value": 4
      },
      "sentainotsuki": {
        "distance": {
          "min": 13.984000000000009,
          "max": 66.07299999999856
        },
        "animationFrame": {
          "min": 0,
          "max": 28
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "suiheigeri": {
        "distance": {
          "min": 67.45200000000006,
          "max": 67.45200000000006
        },
        "animationFrame": {
          "min": 8,
          "max": 8
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 55.101333333332946,
          "max": 55.101333333332946
        },
        "animationFrame": {
          "min": 26,
          "max": 26
        },
        "animation": "manjigeri",
        "value": 1
      }
    },
    "hangetsuate": {
      "sentainotsuki": {
        "distance": {
          "min": 55.21999999999957,
          "max": 64.00700000000023
        },
        "animationFrame": {
          "min": 2,
          "max": 22
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 38.692999999999756,
          "max": 51.120333333332894
        },
        "animationFrame": {
          "min": 0,
          "max": 40
        },
        "animation": "manjigeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 36.84999999999857,
          "max": 59.54299999999992
        },
        "animationFrame": {
          "min": 0,
          "max": 32
        },
        "animation": "fujogeri",
        "value": 4
      },
      "hangetsuate": {
        "distance": {
          "min": 12.913333333333924,
          "max": 17.641999999999996
        },
        "animationFrame": {
          "min": 24,
          "max": 28
        },
        "animation": "hangetsuate",
        "value": 4
      },
      "suiheigeri": {
        "distance": {
          "min": 59.27166666666636,
          "max": 69.64800000000005
        },
        "animationFrame": {
          "min": 14,
          "max": 16
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "sensogeri": {
        "distance": {
          "min": 39.324999999999704,
          "max": 43.001333333335566
        },
        "animationFrame": {
          "min": 6,
          "max": 8
        },
        "animation": "sensogeri",
        "value": 1
      }
    },
    "koten": {
      "suiheigeri": {
        "distance": {
          "min": 58.47300000000138,
          "max": 62.282000000001005
        },
        "animationFrame": {
          "min": 2,
          "max": 4
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 33.816999999999155,
          "max": 51.125
        },
        "animationFrame": {
          "min": 0,
          "max": 16
        },
        "animation": "manjigeri",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 25.587000000001524,
          "max": 25.587000000001524
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "hangetsuate",
        "value": 1
      },
      "sentainotsuki": {
        "distance": {
          "min": 61.19666666666623,
          "max": 67.6799999999995
        },
        "animationFrame": {
          "min": 0,
          "max": 2
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "sensogeri": {
        "distance": {
          "min": 44.58199999999857,
          "max": 44.58199999999857
        },
        "animationFrame": {
          "min": 14,
          "max": 14
        },
        "animation": "sensogeri",
        "value": 1
      }
    }
  },
  "false": {
    "ushiro": {
      "sensogeri": {
        "distance": {
          "min": 30.680000000000035,
          "max": 51.94800000000012
        },
        "animationFrame": {
          "min": 0,
          "max": 12
        },
        "animation": "sensogeri",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 8.249999999999602,
          "max": 28.874666666667792
        },
        "animationFrame": {
          "min": 0,
          "max": 12
        },
        "animation": "hangetsuate",
        "value": 4
      },
      "manjigeri": {
        "distance": {
          "min": 30.414666666667756,
          "max": 50.524666666666974
        },
        "animationFrame": {
          "min": 0,
          "max": 12
        },
        "animation": "manjigeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 19.97499999999937,
          "max": 68.55799999999996
        },
        "animationFrame": {
          "min": 0,
          "max": 12
        },
        "animation": "fujogeri",
        "value": 4
      },
      "sentainotsuki": {
        "distance": {
          "min": 34.96533333333133,
          "max": 68.30000000000018
        },
        "animationFrame": {
          "min": 0,
          "max": 8
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "suiheigeri": {
        "distance": {
          "min": 55.079999999999814,
          "max": 69.6473333333359
        },
        "animationFrame": {
          "min": 0,
          "max": 12
        },
        "animation": "suiheigeri",
        "value": 1
      }
    },
    "stand": {
      "sensogeri": {
        "distance": {
          "min": 22.072000000000173,
          "max": 239059.78012451626
        },
        "animationFrame": {
          "min": 0,
          "max": 4
        },
        "animation": "sensogeri",
        "value": 4
      },
      "suiheigeri": {
        "distance": {
          "min": 54.146666666665794,
          "max": 67.71000000000089
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 34.71700000000169,
          "max": 1689285.4692660475
        },
        "animationFrame": {
          "min": 0,
          "max": 4
        },
        "animation": "manjigeri",
        "value": 4
      },
      "hangetsuate": {
        "distance": {
          "min": 8.050000000000296,
          "max": 22.770000000000095
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "hangetsuate",
        "value": 4
      },
      "sentainotsuki": {
        "distance": {
          "min": 58.70999999999992,
          "max": 1315368.6146619173
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "sentainotsuki",
        "value": 4
      },
      "fujogeri": {
        "distance": {
          "min": 16.74999999999926,
          "max": 56.4920000000007
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "fujogeri",
        "value": 4
      }
    },
    "manjigeri": {
      "sentainotsuki": {
        "distance": {
          "min": 57.19500000000221,
          "max": 57.71700000000084
        },
        "animationFrame": {
          "min": 6,
          "max": 8
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "sensogeri": {
        "distance": {
          "min": 36.86500000000183,
          "max": 49.424999999999386
        },
        "animationFrame": {
          "min": 0,
          "max": 8
        },
        "animation": "sensogeri",
        "value": 1
      }
    },
    "kosoku": {
      "hangetsuate": {
        "distance": {
          "min": 8.516666666665799,
          "max": 29.813333333333276
        },
        "animationFrame": {
          "min": 0,
          "max": 32
        },
        "animation": "hangetsuate",
        "value": 4
      },
      "sentainotsuki": {
        "distance": {
          "min": 58.00166666666655,
          "max": 69.28999999999985
        },
        "animationFrame": {
          "min": 0,
          "max": 8
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "suiheigeri": {
        "distance": {
          "min": 69.73333333333306,
          "max": 69.73333333333306
        },
        "animationFrame": {
          "min": 14,
          "max": 14
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "sensogeri": {
        "distance": {
          "min": 42.76666666666648,
          "max": 42.76666666666648
        },
        "animationFrame": {
          "min": 22,
          "max": 22
        },
        "animation": "sensogeri",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 31.874000000000564,
          "max": 31.874000000000564
        },
        "animationFrame": {
          "min": 32,
          "max": 32
        },
        "animation": "manjigeri",
        "value": 1
      }
    },
    "suiheigeri": {
      "manjigeri": {
        "distance": {
          "min": 40,
          "max": 49.32899999999998
        },
        "animationFrame": {
          "min": 0,
          "max": 2
        },
        "animation": "manjigeri",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 27.848000000000184,
          "max": 27.848000000000184
        },
        "animationFrame": {
          "min": 6,
          "max": 6
        },
        "animation": "hangetsuate",
        "value": 1
      },
      "sensogeri": {
        "distance": {
          "min": 30.999999999999773,
          "max": 45.05366666666612
        },
        "animationFrame": {
          "min": 2,
          "max": 8
        },
        "animation": "sensogeri",
        "value": 1
      }
    },
    "sentainotsuki": {
      "sensogeri": {
        "distance": {
          "min": 48.48899999999952,
          "max": 51.718333333334385
        },
        "animationFrame": {
          "min": 2,
          "max": 2
        },
        "animation": "sensogeri",
        "value": 1
      }
    },
    "fujogeri": {
      "sensogeri": {
        "distance": {
          "min": 30.83000000000021,
          "max": 50.205000000000496
        },
        "animationFrame": {
          "min": 0,
          "max": 8
        },
        "animation": "sensogeri",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 35.950333333334015,
          "max": 44
        },
        "animationFrame": {
          "min": 2,
          "max": 8
        },
        "animation": "manjigeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 32.45133333333291,
          "max": 54.99999999999852
        },
        "animationFrame": {
          "min": 2,
          "max": 8
        },
        "animation": "fujogeri",
        "value": 4
      },
      "suiheigeri": {
        "distance": {
          "min": 67.507,
          "max": 67.507
        },
        "animationFrame": {
          "min": 8,
          "max": 8
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 18.992999999999938,
          "max": 25.103333333333637
        },
        "animationFrame": {
          "min": 0,
          "max": 4
        },
        "animation": "hangetsuate",
        "value": 4
      },
      "sentainotsuki": {
        "distance": {
          "min": 64.82499999999959,
          "max": 67.43200000000019
        },
        "animationFrame": {
          "min": 2,
          "max": 6
        },
        "animation": "sentainotsuki",
        "value": 1
      }
    },
    "koten": {
      "sentainotsuki": {
        "distance": {
          "min": 65.44333333333401,
          "max": 68.07400000000024
        },
        "animationFrame": {
          "min": 6,
          "max": 6
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 67.39533333333424,
          "max": 67.39533333333424
        },
        "animationFrame": {
          "min": 24,
          "max": 24
        },
        "animation": "fujogeri",
        "value": 4
      }
    },
    "sensogeri": {
      "manjigeri": {
        "distance": {
          "min": 36.635666666666395,
          "max": 50.726333333335106
        },
        "animationFrame": {
          "min": 0,
          "max": 6
        },
        "animation": "manjigeri",
        "value": 1
      },
      "sensogeri": {
        "distance": {
          "min": 28.58133333333194,
          "max": 40.47899999999953
        },
        "animationFrame": {
          "min": 0,
          "max": 26
        },
        "animation": "sensogeri",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 21.335333333332727,
          "max": 21.335333333332727
        },
        "animationFrame": {
          "min": 36,
          "max": 36
        },
        "animation": "hangetsuate",
        "value": 4
      },
      "suiheigeri": {
        "distance": {
          "min": 58.706999999999795,
          "max": 69.73000000000008
        },
        "animationFrame": {
          "min": 0,
          "max": 8
        },
        "animation": "suiheigeri",
        "value": 1
      }
    },
    "hangetsuate": {
      "hangetsuate": {
        "distance": {
          "min": 15.157000000000039,
          "max": 23.42499999999984
        },
        "animationFrame": {
          "min": 16,
          "max": 28
        },
        "animation": "hangetsuate",
        "value": 1
      },
      "sentainotsuki": {
        "distance": {
          "min": 50.47433333333095,
          "max": 64.44233333333341
        },
        "animationFrame": {
          "min": 0,
          "max": 24
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 34.86533333333145,
          "max": 34.86533333333145
        },
        "animationFrame": {
          "min": 18,
          "max": 18
        },
        "animation": "manjigeri",
        "value": 1
      }
    },
    "torsohit": {
      "sentainotsuki": {
        "distance": {
          "min": 43.215333333331444,
          "max": 51.62166666666701
        },
        "animationFrame": {
          "min": 6,
          "max": 10
        },
        "animation": "sentainotsuki",
        "value": 1
      },
      "hangetsuate": {
        "distance": {
          "min": 23.279999999999745,
          "max": 23.279999999999745
        },
        "animationFrame": {
          "min": 10,
          "max": 10
        },
        "animation": "hangetsuate",
        "value": 4
      },
      "suiheigeri": {
        "distance": {
          "min": 58.809999999998126,
          "max": 58.809999999998126
        },
        "animationFrame": {
          "min": 12,
          "max": 12
        },
        "animation": "suiheigeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 58.055000000000234,
          "max": 58.055000000000234
        },
        "animationFrame": {
          "min": 6,
          "max": 6
        },
        "animation": "fujogeri",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 35.85500000000002,
          "max": 50.54499999999996
        },
        "animationFrame": {
          "min": 6,
          "max": 10
        },
        "animation": "manjigeri",
        "value": 1
      }
    },
    "tsuisoku": {
      "hangetsuate": {
        "distance": {
          "min": 25.650333333337187,
          "max": 25.650333333337187
        },
        "animationFrame": {
          "min": 16,
          "max": 16
        },
        "animation": "hangetsuate",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 33.76366666666917,
          "max": 33.76366666666917
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "manjigeri",
        "value": 1
      }
    },
    "senten": {
      "hangetsuate": {
        "distance": {
          "min": 10.092999999999137,
          "max": 14.575999999999397
        },
        "animationFrame": {
          "min": 26,
          "max": 36
        },
        "animation": "hangetsuate",
        "value": 1
      },
      "manjigeri": {
        "distance": {
          "min": 48,
          "max": 48.25
        },
        "animationFrame": {
          "min": 0,
          "max": 2
        },
        "animation": "manjigeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 31.25,
          "max": 35.75
        },
        "animationFrame": {
          "min": 4,
          "max": 4
        },
        "animation": "fujogeri",
        "value": 4
      },
      "sensogeri": {
        "distance": {
          "min": 48.375,
          "max": 48.375
        },
        "animationFrame": {
          "min": 2,
          "max": 2
        },
        "animation": "sensogeri",
        "value": 1
      }
    },
    "taisoku": {
      "hangetsuate": {
        "distance": {
          "min": 20.72299999999953,
          "max": 27.30299999999943
        },
        "animationFrame": {
          "min": 14,
          "max": 18
        },
        "animation": "hangetsuate",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 39.30500000000035,
          "max": 60.36999999999961
        },
        "animationFrame": {
          "min": 0,
          "max": 4
        },
        "animation": "fujogeri",
        "value": 1
      }
    },
    "ninoashi": {
      "manjigeri": {
        "distance": {
          "min": 44.57499999999919,
          "max": 46.45700000000096
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "manjigeri",
        "value": 1
      },
      "sensogeri": {
        "distance": {
          "min": 47.40666666666755,
          "max": 47.40666666666755
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "sensogeri",
        "value": 1
      },
      "fujogeri": {
        "distance": {
          "min": 39.144999999998674,
          "max": 39.144999999998674
        },
        "animationFrame": {
          "min": 0,
          "max": 0
        },
        "animation": "fujogeri",
        "value": 4
      }
    }
  }
}

const defaultAction = {
  distance: {min: Infinity, max: 0},
  animationFrame: {min: Infinity, max: 0},
  animation: '',
  value: 0
}

let timeout
function commit () {
  if (!timeout) {
    timeout = setTimeout(() => {
      timeout = null
      localStorage.setItem('actionLog', JSON.stringify(log))
    }, 5000)
  }
}

const AttackLog = {

  push: (attackEvent, value, hit) => {
    const dist = distance(attackEvent.s, attackEvent.t)
    const isFacingMe = attackEvent.s.dir != attackEvent.t.dir
    const actions = log[isFacingMe][attackEvent.t.animation] = log[isFacingMe][attackEvent.t.animation] || {}
    const action = actions[attackEvent.s.animation] = actions[attackEvent.s.animation] || { ...defaultAction }
    action.animationFrame = minmax(action.animationFrame, attackEvent.t.animationFrame)
    action.distance = minmax(action.distance, dist)
    action.value = max(action.value, value)
    action.animation = attackEvent.s.animation
    commit()
  },

  findActions: (distance, animation, animationFrame, facingMe) => {
    return Object.values(log[facingMe][animation] || {})
      // .filter(d => d.animationFrame.min <= animationFrame && d.animationFrame.max >= animationFrame)
      .filter(d => d.distance.min <= distance && d.distance.max >= distance)
  }

}

export default AttackLog
