function normDir(d) {
  return d === 'bright' || d === 'deep' || d === 'calm' ? d : 'calm'
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
    statusText: { type: String, value: '' }
  },

  data: {
    dirClass: 'calm',
    particles: buildParticles()
  },

  observers: {
    direction(d) {
      this.setData({ dirClass: normDir(d) })
    }
  },

  lifetimes: {
    attached() {
      this.setData({ dirClass: normDir(this.properties.direction) })
    }
  }
})
