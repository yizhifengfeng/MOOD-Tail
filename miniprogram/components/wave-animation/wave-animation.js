const theme = require('../../utils/theme.js')

const VALID_DIRECTIONS = ['bright', 'calm', 'deep']

function normalizeDirection(d) {
  return VALID_DIRECTIONS.indexOf(d) >= 0 ? d : 'calm'
}

function hexToRgb(hex) {
  const h = (hex || '').replace('#', '')
  if (h.length !== 6) return { r: 126, g: 214, b: 223 }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function createParticles(count, w, h) {
  const list = []
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * Math.min(w, h) * 0.42
    list.push({
      x: w / 2 + Math.cos(angle) * dist * 0.4,
      y: h / 2 + Math.sin(angle) * dist * 0.4,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r: 1.2 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
      drift: 0.4 + Math.random() * 0.9,
    })
  }
  return list
}

Component({
  properties: {
    active: {
      type: Boolean,
      value: false,
    },
    direction: {
      type: String,
      value: 'calm',
    },
    statusText: {
      type: String,
      value: '',
    },
  },

  data: {
    paletteDirection: 'calm',
    displayStatusText: '',
    statusFadeClass: '',
  },

  observers: {
    active(isOn) {
      if (isOn) {
        this._startAll()
      } else {
        this._stopCanvasLoop()
      }
    },
    direction(d) {
      this.setData({ paletteDirection: normalizeDirection(d) })
      this._syncThemeParticles()
    },
    statusText(t) {
      this._applyStatusChange(t || '')
    },
  },

  lifetimes: {
    attached() {
      this._rafId = null
      this._lastStatus = ''
      this._canvasW = 210
      this._canvasH = 210
      this._particles = []
      this._ctx = null
      this._tick = 0

      this.setData({
        paletteDirection: normalizeDirection(this.properties.direction),
      })

      const initial = this.properties.statusText || ''
      this.setData({ displayStatusText: initial })
      this._lastStatus = initial

      this._initCanvas(() => {
        if (this.properties.active) {
          this._startAll()
        }
      })
    },
    detached() {
      this._stopAll()
    },
  },

  methods: {
    _initCanvas(done) {
      const q = wx.createSelectorQuery().in(this)
      q.select('.wave-animation__canvas')
        .boundingClientRect((rect) => {
          if (!rect || !rect.width) {
            const sys = wx.getSystemInfoSync()
            const rpx = sys.windowWidth / 750
            this._canvasW = Math.floor(420 * rpx)
            this._canvasH = Math.floor(420 * rpx)
          } else {
            this._canvasW = Math.floor(rect.width)
            this._canvasH = Math.floor(rect.height)
          }
          this._ctx = wx.createCanvasContext('waveParticles', this)
          this._particles = createParticles(52, this._canvasW, this._canvasH)
          this._syncThemeParticles()
          if (typeof done === 'function') done()
        })
        .exec()
    },

    _syncThemeParticles() {
      const d = normalizeDirection(this.properties.direction)
      const t = theme.getTheme(d)
      this._particleRgb = hexToRgb(t.particleColor)
      this._glowRgb = hexToRgb(t.textAccent || t.particleColor)
    },

    _startAll() {
      this._startCanvasLoop()
    },

    _stopAll() {
      this._stopCanvasLoop()
    },

    _startCanvasLoop() {
      this._stopCanvasLoop()
      const tick = () => {
        if (!this.properties.active) return
        if (!this._ctx) {
          this._rafId = setTimeout(tick, 48)
          return
        }
        this._drawParticles()
        this._rafId = setTimeout(tick, 32)
      }
      tick()
    },

    _stopCanvasLoop() {
      if (this._rafId != null) {
        clearTimeout(this._rafId)
        this._rafId = null
      }
      if (this._ctx) {
        this._ctx.clearRect(0, 0, this._canvasW, this._canvasH)
        this._ctx.draw()
      }
    },

    _drawParticles() {
      const ctx = this._ctx
      if (!ctx) return
      const w = this._canvasW
      const h = this._canvasH
      const cx = w / 2
      const cy = h / 2
      const pr = this._particleRgb || { r: 126, g: 214, b: 223 }
      const gr = this._glowRgb || pr

      ctx.clearRect(0, 0, w, h)
      this._tick += 0.022

      const breath = 0.65 + Math.sin(this._tick * 0.9) * 0.22
      const list = this._particles

      for (let i = 0; i < list.length; i++) {
        const p = list[i]
        p.x += p.vx * p.drift * 0.08
        p.y += p.vy * p.drift * 0.08
        p.phase += 0.032 + (i % 7) * 0.001

        const dx = p.x - cx
        const dy = p.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxR = Math.min(w, h) * 0.48
        if (dist > maxR) {
          const ang = Math.atan2(dy, dx)
          p.x = cx + Math.cos(ang) * maxR * 0.85
          p.y = cy + Math.sin(ang) * maxR * 0.85
          p.vx += (Math.random() - 0.5) * 0.4
          p.vy += (Math.random() - 0.5) * 0.4
        }

        const twinkle = 0.35 + Math.sin(this._tick * 1.4 + p.phase) * 0.35 + breath * 0.25
        const alpha = Math.min(0.95, Math.max(0.12, twinkle * 0.72))

        const brightBoost = 0.15 * Math.sin(this._tick * 0.8 + i * 0.2)
        const r = p.r * (0.9 + breath * 0.15)

        ctx.setFillStyle(
          `rgba(${pr.r + (gr.r - pr.r) * brightBoost}, ${pr.g + (gr.g - pr.g) * brightBoost}, ${
            pr.b + (gr.b - pr.b) * brightBoost
          }, ${alpha})`
        )
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()

        ctx.setFillStyle(`rgba(${gr.r}, ${gr.g}, ${gr.b}, ${alpha * 0.35})`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.draw()
    },

    _applyStatusChange(next) {
      const s = next == null ? '' : String(next)
      if (s === this._lastStatus && this.data.displayStatusText === s) return
      this.setData({ statusFadeClass: 'wave-animation__status--fade-out' })
      setTimeout(() => {
        this._lastStatus = s
        this.setData({
          displayStatusText: s,
          statusFadeClass: 'wave-animation__status--fade-in',
        })
        setTimeout(() => {
          this.setData({ statusFadeClass: '' })
        }, 480)
      }, 360)
    },

  },
})
