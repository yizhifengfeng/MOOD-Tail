function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function normSlider(raw) {
  const n = Number(raw)
  if (Number.isNaN(n)) return 50
  return clamp(n, 0, 100)
}

const STOPS = {
  deep: {
    main: '#6C5CE7',
    light: '#A29BFE',
    dark: '#4834A0',
  },
  calm: {
    main: '#4ECDC4',
    light: '#7EDDD6',
    dark: '#2A9D8F',
  },
  bright: {
    main: '#FECA57',
    light: '#FFE08A',
    dark: '#E8A838',
  },
}

function parseHex(hex) {
  const h = String(hex).replace('#', '')
  const full = h.length === 3 ? h.split('').map((ch) => ch + ch).join('') : h
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return { r: 128, g: 128, b: 128 }
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function lerpHex(a, b, t) {
  const A = parseHex(a)
  const B = parseHex(b)
  const r = Math.round(A.r + (B.r - A.r) * t)
  const g = Math.round(A.g + (B.g - A.g) * t)
  const bl = Math.round(A.b + (B.b - A.b) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl
    .toString(16)
    .padStart(2, '0')}`
}

function lerpLiquidBySlider(t01) {
  const t = clamp(t01, 0, 1)
  if (t <= 0.5) {
    const u = t * 2
    return {
      main: lerpHex(STOPS.deep.main, STOPS.calm.main, u),
      light: lerpHex(STOPS.deep.light, STOPS.calm.light, u),
      dark: lerpHex(STOPS.deep.dark, STOPS.calm.dark, u),
    }
  }
  const u = (t - 0.5) * 2
  return {
    main: lerpHex(STOPS.calm.main, STOPS.bright.main, u),
    light: lerpHex(STOPS.calm.light, STOPS.bright.light, u),
    dark: lerpHex(STOPS.calm.dark, STOPS.bright.dark, u),
  }
}

function hexToRgba(hex, alpha) {
  const { r, g, b } = parseHex(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function buildParticles() {
  const coords = [
    [12, 18], [88, 22], [50, 8], [6, 46], [94, 50], [26, 78], [74, 82], [48, 92],
    [20, 34], [80, 36], [36, 58], [64, 16], [16, 66], [84, 70], [54, 44]
  ]
  return coords.map((c, i) => ({
    id: i,
    x: c[0],
    y: c[1],
    d: ((i * 0.19) % 2.6).toFixed(2),
    dur: (3.1 + (i % 5) * 0.28).toFixed(2)
  }))
}

Component({
  properties: {
    active: { type: Boolean, value: false },
    direction: { type: String, value: 'calm' },
    sliderValue: { type: Number, value: 50 },
    statusText: { type: String, value: '' }
  },

  data: {
    particles: buildParticles(),
    accentMain: STOPS.calm.main,
    accentLight: STOPS.calm.light,
    accentDark: STOPS.calm.dark,
    sphereStyle: '',
    sphereShadow: '',
    ringBorder: 'rgba(78, 205, 196, 0.38)',
    particleBg: 'rgba(255,255,255,0.95)',
    particleShadow: '0 0 20rpx rgba(126, 232, 220, 0.85), 0 0 40rpx rgba(78, 205, 196, 0.45)',
    waveBandA: '',
    waveBandB: '',
    waveBandC: ''
  },

  observers: {
    'sliderValue, active'() {
      this.applyAccent()
    }
  },

  lifetimes: {
    attached() {
      this.applyAccent()
    }
  },

  methods: {
    applyAccent() {
      const t01 = normSlider(this.properties.sliderValue) / 100
      const liq = lerpLiquidBySlider(t01)
      const main = liq.main
      const light = liq.light
      const dark = liq.dark

      const sphereStyle = [
        'radial-gradient(ellipse 95% 75% at 38% 22%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.12) 42%, transparent 58%)',
        `radial-gradient(ellipse 80% 55% at 50% 88%, ${hexToRgba(dark, 0.55)} 0%, transparent 72%)`,
        `linear-gradient(168deg, ${hexToRgba(light, 0.98)} 0%, ${main} 46%, ${dark} 100%)`
      ].join(', ')

      const sphereShadow = [
        `0 0 0 1rpx ${hexToRgba(light, 0.35)}`,
        `0 12rpx 48rpx ${hexToRgba(main, 0.42)}`,
        `0 0 80rpx ${hexToRgba(main, 0.28)}`,
        `inset 0 -24rpx 48rpx ${hexToRgba(dark, 0.22)}`,
        `inset 8rpx 12rpx 32rpx ${hexToRgba(light, 0.25)}`
      ].join(', ')

      const ringBorder = hexToRgba(main, 0.42)
      const particleBg = hexToRgba(light, 0.98)
      const particleShadow = [
        `0 0 22rpx ${hexToRgba(light, 0.95)}`,
        `0 0 44rpx ${hexToRgba(main, 0.55)}`,
        `0 0 72rpx ${hexToRgba(main, 0.28)}`
      ].join(', ')

      const waveBandA = `linear-gradient(180deg, ${hexToRgba(
        light,
        0.62
      )} 0%, ${hexToRgba(main, 0.38)} 55%, transparent 100%)`
      const waveBandB = `linear-gradient(180deg, ${hexToRgba(
        main,
        0.45
      )} 0%, ${hexToRgba(light, 0.28)} 45%, transparent 100%)`
      const waveBandC = `linear-gradient(180deg, rgba(255,255,255,0.42) 0%, ${hexToRgba(
        main,
        0.32
      )} 70%, transparent 100%)`

      this.setData({
        accentMain: main,
        accentLight: light,
        accentDark: dark,
        sphereStyle,
        sphereShadow,
        ringBorder,
        particleBg,
        particleShadow,
        waveBandA,
        waveBandB,
        waveBandC
      })
    }
  }
})
