Component({
  properties: {
    value: {
      type: Number,
      value: 50
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },

  data: {
    innerValue: 50,
    dragging: false,
    thumbTransition: 'none'
  },

  observers: {
    value(v) {
      if (this.data.dragging) return
      const n = Number(v)
      const x = Number.isNaN(n) ? 50 : Math.min(100, Math.max(0, Math.round(n)))
      this.setData({ innerValue: x })
    }
  },

  lifetimes: {
    attached() {
      const n = Number(this.properties.value)
      this.setData({
        innerValue: Number.isNaN(n)
          ? 50
          : Math.min(100, Math.max(0, Math.round(n)))
      })
    }
  },

  methods: {
    applyClientX(clientX) {
      const r = this._trackRect
      if (!r || !r.width) return
      let pct = ((clientX - r.left) / r.width) * 100
      pct = Math.min(100, Math.max(0, pct))
      const v = Math.round(pct)
      this.setData({ innerValue: v })
      this.triggerEvent('change', { value: v })
    },

    onTouchStart(e) {
      if (this.properties.disabled) return
      const q = wx.createSelectorQuery().in(this)
      q.select('#track').boundingClientRect((rect) => {
        if (!rect) return
        this._trackRect = rect
        this.setData({ dragging: true, thumbTransition: 'none' })
        if (e.touches && e.touches[0]) {
          this.applyClientX(e.touches[0].clientX)
        }
      })
      q.exec()
    },

    onTouchMove(e) {
      if (!this.data.dragging || this.properties.disabled) return
      if (e.touches && e.touches[0]) {
        this.applyClientX(e.touches[0].clientX)
      }
    },

    onTouchEnd() {
      if (!this.data.dragging) return
      this.setData({ dragging: false, thumbTransition: '0.2s ease' })
      this._trackRect = null
    }
  }
})
