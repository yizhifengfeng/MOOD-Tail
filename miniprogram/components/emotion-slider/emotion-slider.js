function clamp(n, min, max) {
  if (typeof n !== 'number' || Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function roundPct(n) {
  return Math.round(clamp(n, 0, 100));
}

Component({
  properties: {
    value: {
      type: Number,
      value: 50,
    },
    disabled: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    innerValue: 50,
    dragging: false,
    thumbTransition: 'left 0.12s ease-out',
  },

  observers: {
    value(val) {
      const next = roundPct(val);
      if (next !== this.data.innerValue) {
        this.setData({ innerValue: next });
      }
    },
  },

  lifetimes: {
    attached() {
      this.setData({ innerValue: roundPct(this.properties.value) });
    },
  },

  methods: {
    setValue(val) {
      const next = roundPct(val);
      this.setData({ innerValue: next });
    },

    _getTouchX(e) {
      const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      return t ? t.clientX : null;
    },

    _applyPercentFromClientX(clientX) {
      const rect = this._trackRect;
      if (!rect || rect.width <= 0) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      const next = roundPct(pct);
      if (next !== this.data.innerValue) {
        this.setData({ innerValue: next });
        this.triggerEvent('change', { value: next });
      }
    },

    _measureTrack(done) {
      const q = wx.createSelectorQuery().in(this);
      q.select('#track')
        .boundingClientRect((rect) => {
          this._trackRect = rect;
          if (typeof done === 'function') done(rect);
        })
        .exec();
    },

    onTouchStart(e) {
      if (this.properties.disabled) return;
      this.setData({
        dragging: true,
        thumbTransition: 'none',
      });
      this._measureTrack(() => {
        const x = this._getTouchX(e);
        if (x != null) this._applyPercentFromClientX(x);
      });
    },

    onTouchMove(e) {
      if (this.properties.disabled) return;
      const x = this._getTouchX(e);
      if (x == null) return;
      if (!this._trackRect) {
        this._measureTrack(() => this._applyPercentFromClientX(x));
        return;
      }
      this._applyPercentFromClientX(x);
    },

    onTouchEnd() {
      if (this.properties.disabled) return;
      this._trackRect = null;
      this.setData({
        dragging: false,
        thumbTransition: 'left 0.12s ease-out',
      });
    },
  },
});
