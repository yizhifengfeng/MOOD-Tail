function normDir(d) {
  return d === 'bright' || d === 'deep' || d === 'calm' ? d : 'calm'
}

Component({
  properties: {
    active: { type: Boolean, value: false },
    direction: { type: String, value: 'calm' },
    statusText: { type: String, value: '' }
  },

  data: {
    dirClass: 'calm'
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
