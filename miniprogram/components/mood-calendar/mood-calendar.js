const { getDaysInMonth, getFirstDayOfMonth } = require('../../utils/util.js')

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function buildMoodMap(list) {
  const map = {}
  const arr = Array.isArray(list) ? list : []
  for (let i = 0; i < arr.length; i++) {
    const it = arr[i]
    if (it && it.date) map[it.date] = it
  }
  return map
}

function normDir(d) {
  return d === 'bright' || d === 'calm' || d === 'deep' ? d : 'calm'
}

Component({
  properties: {
    moodData: {
      type: Array,
      value: []
    }
  },

  data: {
    weekdays: WEEKDAYS,
    cells: [],
    year: 0,
    month: 0
  },

  observers: {
    moodData() {
      this.rebuildGrid()
    }
  },

  lifetimes: {
    attached() {
      const now = new Date()
      this.setData(
        {
          year: now.getFullYear(),
          month: now.getMonth() + 1
        },
        () => this.rebuildGrid()
      )
    }
  },

  methods: {
    rebuildGrid() {
      const year = this.data.year
      const month1 = this.data.month
      const month0 = month1 - 1
      const daysInMonth = getDaysInMonth(year, month0)
      const firstDow = getFirstDayOfMonth(year, month0)
      const map = buildMoodMap(this.properties.moodData)
      const cells = []
      let k = 0
      for (let i = 0; i < firstDow; i++) {
        cells.push({ empty: true, k: `p${k++}` })
      }
      const m = month1.toString().padStart(2, '0')
      for (let d = 1; d <= daysInMonth; d++) {
        const dd = d.toString().padStart(2, '0')
        const dateStr = `${year}-${m}-${dd}`
        const hit = map[dateStr]
        cells.push({
          empty: false,
          k: dateStr,
          day: d,
          dateStr,
          hasMood: !!hit,
          direction: hit ? normDir(hit.direction) : 'calm',
          cocktailId: hit && hit.cocktailId != null ? String(hit.cocktailId) : ''
        })
      }
      this.setData({ cells })
    },

    onCellTap(e) {
      const ds = e.currentTarget.dataset
      const date = ds.date
      if (!date) return
      const raw = ds.cocktailId != null ? ds.cocktailId : ds.cocktailid
      const cocktailId = raw != null && raw !== '' ? String(raw) : ''
      this.triggerEvent('datetap', { date, cocktailId })
    }
  }
})
