const STOPS = {
  deep: {
    main: '#A855F7',
    light: '#C084FC',
    dark: '#7C3AED',
    glowA: 'rgba(168, 85, 247, 0.52)',
  },
  calm: {
    main: '#4ECDC4',
    light: '#7EDDD6',
    dark: '#2A9D8F',
    glowA: 'rgba(78, 205, 196, 0.5)',
  },
  bright: {
    main: '#FF9F43',
    light: '#FFC078',
    dark: '#E07820',
    glowA: 'rgba(255, 159, 67, 0.55)',
  },
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function normIntensity(raw) {
  const n = Number(raw)
  if (Number.isNaN(n)) return 50
  return clamp(n, 0, 100)
}

function normFluctuation(raw) {
  const n = Number(raw)
  if (Number.isNaN(n)) return 30
  return clamp(n, 0, 100)
}

function normSlider(raw) {
  const n = Number(raw)
  if (Number.isNaN(n)) return 50
  return clamp(n, 0, 100)
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
      glowA: u < 0.5 ? STOPS.deep.glowA : STOPS.calm.glowA,
    }
  }
  const u = (t - 0.5) * 2
  return {
    main: lerpHex(STOPS.calm.main, STOPS.bright.main, u),
    light: lerpHex(STOPS.calm.light, STOPS.bright.light, u),
    dark: lerpHex(STOPS.calm.dark, STOPS.bright.dark, u),
    glowA: u < 0.5 ? STOPS.calm.glowA : STOPS.bright.glowA,
  }
}

function hexToRgba(hex, alpha) {
  const { r, g, b } = parseHex(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

Component({
  properties: {
    sliderValue: {
      type: Number,
      value: 50,
    },
    direction: {
      type: String,
      value: 'calm',
    },
    intensity: {
      type: Number,
      value: 50,
    },
    fluctuation: {
      type: Number,
      value: 30,
    },
    isAnalyzing: {
      type: Boolean,
      value: false,
    },
    statusText: {
      type: String,
      value: 'Wait to input',
    },
  },

  data: {
    liquidColor: STOPS.calm.main,
    liquidLight: STOPS.calm.light,
    liquidDark: STOPS.calm.dark,
    glowGradient:
      'radial-gradient(ellipse at center, rgba(78, 205, 196, 0.5) 0%, transparent 70%)',
    efiWaveTier: 'mid',
    glowOpacity: 0.42,
  },

  lifetimes: {
    attached() {
      this._animating = false
      this._bubbles = []
      this._rafId = null
      this._canvas = null
      this._ctx = null
      this._cw = 0
      this._ch = 0
      this._bubbleMain = STOPS.calm.main
      this._bubbleLight = STOPS.calm.light
      this.applyVisualParams()
      wx.nextTick(() => this.initBubbleCanvas())
    },
    detached() {
      this.stopBubbleLoop()
    },
  },

  observers: {
    'sliderValue, direction, intensity, fluctuation, isAnalyzing'() {
      this.applyVisualParams()
    },
  },

  methods: {
    applyVisualParams() {
      const slider = normSlider(this.properties.sliderValue)
      const t01 = slider / 100
      const liq = lerpLiquidBySlider(t01)

      const intensity = normIntensity(this.properties.intensity)
      const fluctuation = normFluctuation(this.properties.fluctuation)

      let efiWaveTier = 'mid'
      if (fluctuation < 34) efiWaveTier = 'gentle'
      else if (fluctuation > 66) efiWaveTier = 'intense'

      const glowOpacity = 0.12 + (intensity / 100) * 0.62
      const glowGradient = `radial-gradient(ellipse at center, ${hexToRgba(liq.main, 0.48)} 0%, transparent 72%)`

      this._bubbleMain = liq.main
      this._bubbleLight = liq.light

      this.setData({
        liquidColor: liq.main,
        liquidLight: liq.light,
        liquidDark: liq.dark,
        glowGradient,
        efiWaveTier,
        glowOpacity,
      })
    },

    initBubbleCanvas() {
      const query = this.createSelectorQuery()
      query
        .select('#bubbleCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const hit = res && res[0]
          if (!hit || !hit.node) {
            return
          }
          const canvas = hit.node
          const ctx = canvas.getContext('2d')
          const dpr = wx.getSystemInfoSync().pixelRatio || 1
          const w = hit.width
          const h = hit.height
          canvas.width = w * dpr
          canvas.height = h * dpr
          ctx.scale(dpr, dpr)

          this._canvas = canvas
          this._ctx = ctx
          this._cw = w
          this._ch = h
          this._bubbles = []
          const sx0 = w * 0.18
          const sx1 = w * 0.82
          for (let k = 0; k < 14; k += 1) {
            const r = 1.1 + Math.random() * 2.4
            this._bubbles.push({
              x: sx0 + Math.random() * (sx1 - sx0),
              y: h * (0.42 + Math.random() * 0.48),
              r,
              vx: (Math.random() - 0.5) * 0.4,
              vy: -(0.9 + Math.random() * 1.6),
              a: 0.2 + Math.random() * 0.4,
              wobble: Math.random() * Math.PI * 2,
              wobbleSpeed: 0.05 + Math.random() * 0.06,
            })
          }

          this.startBubbleLoop()
        })
    },

    startBubbleLoop() {
      if (this._animating || !this._canvas) {
        return
      }
      this._animating = true
      const step = () => {
        if (!this._animating || !this._canvas || !this._ctx) {
          return
        }
        this.tickBubbles()
        this._rafId = this._canvas.requestAnimationFrame(step)
      }
      this._rafId = this._canvas.requestAnimationFrame(step)
    },

    stopBubbleLoop() {
      this._animating = false
      if (this._canvas && this._rafId != null) {
        try {
          this._canvas.cancelAnimationFrame(this._rafId)
        } catch (e) {
          /* noop */
        }
      }
      this._rafId = null
    },

    tickBubbles() {
      const ctx = this._ctx
      const w = this._cw
      const h = this._ch
      if (!ctx || w <= 0 || h <= 0) {
        return
      }

      const intensity = normIntensity(this.properties.intensity)
      const fluctuation = normFluctuation(this.properties.fluctuation)
      const cMain = this._bubbleMain || STOPS.calm.main
      const cLight = this._bubbleLight || STOPS.calm.light

      ctx.clearRect(0, 0, w, h)

      const liquidTop = h * 0.28
      const spawnMinX = w * 0.18
      const spawnMaxX = w * 0.82

      const spawnChance =
        0.08 + (intensity / 100) * 0.38 + (fluctuation / 100) * 0.14

      if (Math.random() < spawnChance) {
        const r = 1.2 + Math.random() * 2.8 * (0.45 + intensity / 220)
        this._bubbles.push({
          x: spawnMinX + Math.random() * (spawnMaxX - spawnMinX),
          y: h * (0.86 + Math.random() * 0.12),
          r,
          vx: (Math.random() - 0.5) * (0.35 + fluctuation / 80),
          vy: -(1.05 + (fluctuation / 100) * 2.5 + Math.random() * 0.95),
          a: 0.18 + Math.random() * 0.48,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.04 + (fluctuation / 100) * 0.09,
        })
      }

      const next = []
      for (let i = 0; i < this._bubbles.length; i += 1) {
        const b = this._bubbles[i]
        b.wobble += b.wobbleSpeed
        b.x += b.vx + Math.sin(b.wobble) * 0.45
        b.y += b.vy
        b.r *= 0.9992

        if (b.y - b.r < liquidTop - 3) {
          continue
        }
        if (b.y + b.r < 0 || b.x < -16 || b.x > w + 16) {
          continue
        }

        const grd = ctx.createRadialGradient(
          b.x - b.r * 0.35,
          b.y - b.r * 0.35,
          b.r * 0.2,
          b.x,
          b.y,
          b.r
        )
        grd.addColorStop(0, `rgba(255, 255, 255, ${0.55 * b.a})`)
        grd.addColorStop(0.45, hexToRgba(cLight, 0.42 * b.a))
        grd.addColorStop(1, hexToRgba(cMain, 0.08 * b.a))

        ctx.beginPath()
        ctx.fillStyle = grd
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.22 * b.a})`
        ctx.lineWidth = 0.6
        ctx.stroke()

        next.push(b)
      }
      this._bubbles = next
    },
  },
})
