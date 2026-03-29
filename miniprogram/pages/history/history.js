const { formatTime, formatDate } = require('../../utils/util.js')

const DIRECTION_BADGE = {
  bright: 'Bright',
  calm: 'Calm',
  deep: 'Deep'
}

function getItemTime(item) {
  const t = item.savedAt
  if (t == null) return 0
  if (typeof t === 'number') return t
  if (t instanceof Date) return t.getTime()
  const n = new Date(t).getTime()
  return Number.isNaN(n) ? 0 : n
}

function normalizeItem(row) {
  if (!row || typeof row !== 'object') return null
  const id =
    row._id != null
      ? row._id
      : row.id != null
        ? row.id
        : row.cocktailId != null
          ? row.cocktailId
          : null
  if (id == null || id === '') return null
  const name = row.name || row.cocktailName || row.title || '未命名特调'
  let direction = row.direction
  if (direction !== 'bright' && direction !== 'calm' && direction !== 'deep') {
    direction = 'calm'
  }
  let savedAt = row.savedAt != null ? row.savedAt : row.createTime != null ? row.createTime : row.updatedAt
  if (savedAt && typeof savedAt === 'object' && typeof savedAt.getTime === 'function') {
    savedAt = savedAt.getTime()
  }
  if (savedAt == null) savedAt = Date.now()
  return {
    id: String(id),
    name,
    direction,
    savedAt
  }
}

function normalizeHistoryResult(result) {
  let arr = []
  if (Array.isArray(result)) {
    arr = result
  } else if (result && typeof result === 'object') {
    if (result.success && result.data && Array.isArray(result.data.list)) {
      arr = result.data.list
    } else if (Array.isArray(result.list)) arr = result.list
    else if (Array.isArray(result.data)) arr = result.data
    else if (result.data && typeof result.data === 'object' && Array.isArray(result.data.list)) {
      arr = result.data.list
    } else if (Array.isArray(result.history)) arr = result.history
    else if (Array.isArray(result.records)) arr = result.records
  }
  const out = []
  for (let i = 0; i < arr.length; i++) {
    const n = normalizeItem(arr[i])
    if (n) out.push(n)
  }
  return out.sort((a, b) => getItemTime(b) - getItemTime(a))
}

function buildMoodData(list) {
  const byDate = {}
  const sorted = [...list].sort((a, b) => getItemTime(b) - getItemTime(a))
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]
    const d = formatDate(new Date(getItemTime(item)))
    if (!byDate[d]) {
      byDate[d] = {
        date: d,
        direction: item.direction,
        cocktailId: item.id
      }
    }
  }
  return Object.keys(byDate)
    .sort()
    .map(k => byDate[k])
}

Page({
  data: {
    statusBarHeight: 20,
    navContentHeight: 44,
    mainPadTop: 88,
    cocktailList: [],
    moodData: [],
    activeTab: 0,
    selectedDateCocktail: null,
    previewVisible: false,
    previewAnim: false,
    loading: false,
    recommendVisible: false,
    recommendLoading: false,
    recommendLines: [],
    recommendError: ''
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    let navContentHeight = 44
    try {
      const menu = wx.getMenuButtonBoundingClientRect()
      if (menu && menu.top != null && menu.height) {
        navContentHeight = (menu.top - (sys.statusBarHeight || 0)) * 2 + menu.height
      }
    } catch (e) {
      navContentHeight = 44
    }
    const statusBarHeight = sys.statusBarHeight || 20
    const mainPadTop = statusBarHeight + navContentHeight + 24
    this.setData({
      statusBarHeight,
      navContentHeight,
      mainPadTop
    })
    this.fetchHistory()
  },

  onShow() {
    this.fetchHistory()
  },

  onPullDownRefresh() {
    this.fetchHistory().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  fetchHistory() {
    if (!wx.cloud) {
      this.setData({ cocktailList: [], moodData: [] })
      return Promise.resolve()
    }
    this.setData({ loading: true })
    return wx.cloud
      .callFunction({
        name: 'getHistory',
        data: {}
      })
      .then(res => {
        const list = normalizeHistoryResult(res.result).map((it, idx) => {
          const t = getItemTime(it)
          const rowKey = `${it.id}_${t}_${idx}`
          return {
            ...it,
            rowKey,
            displayTime: formatTime(new Date(t)),
            badge: DIRECTION_BADGE[it.direction] || 'Calm'
          }
        })
        const moodData = buildMoodData(list)
        this.setData({
          cocktailList: list,
          moodData,
          loading: false
        })
      })
      .catch(err => {
        console.error('getHistory', err)
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  switchTab(e) {
    const idx = Number(e.currentTarget.dataset.index)
    if (idx !== 0 && idx !== 1) return
    this.setData({ activeTab: idx })
    if (idx === 1) {
      this.closePreview()
    }
  },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.reLaunch({ url: '/pages/index/index' })
    }
  },

  onListItemTap(e) {
    const mark = e.mark || {}
    const id =
      (e.currentTarget.dataset && e.currentTarget.dataset.id) ||
      mark.cid ||
      ''
    if (!id) return
    wx.navigateTo({
      url: `/pages/detail/detail?id=${encodeURIComponent(String(id))}`
    })
  },

  onDeleteItem(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.showModal({
      title: '删除这杯特调？',
      content: '删除后无法恢复',
      confirmText: '删除',
      confirmColor: '#ff6b6b',
      success: (res) => {
        if (!res.confirm) return
        if (!wx.cloud || !wx.cloud.callFunction) {
          wx.showToast({ title: '云能力不可用', icon: 'none' })
          return
        }
        wx.cloud
          .callFunction({
            name: 'deleteCocktail',
            data: { id }
          })
          .then((r) => {
            const ok = r && r.result && r.result.success
            if (ok) {
              wx.showToast({ title: '已删除' })
              this.fetchHistory()
            } else {
              const msg =
                (r && r.result && r.result.error) || '删除失败'
              wx.showToast({ title: msg, icon: 'none' })
            }
          })
          .catch(() => {
            wx.showToast({ title: '删除失败', icon: 'none' })
          })
      }
    })
  },

  onCalendarDateTap(e) {
    const detail = e.detail || {}
    let cocktail = null
    if (detail.cocktailId) {
      cocktail = this.data.cocktailList.find(c => String(c.id) === String(detail.cocktailId))
    }
    if (!cocktail && detail.date) {
      const list = this.data.cocktailList
      let best = null
      let bestT = -1
      for (let i = 0; i < list.length; i++) {
        const it = list[i]
        const ds = formatDate(new Date(getItemTime(it)))
        if (ds === detail.date) {
          const t = getItemTime(it)
          if (t > bestT) {
            bestT = t
            best = it
          }
        }
      }
      cocktail = best
    }
    if (!cocktail) return
    this.setData({
      selectedDateCocktail: {
        ...cocktail,
        displayTime: formatTime(new Date(getItemTime(cocktail))),
        badge: DIRECTION_BADGE[cocktail.direction] || 'Calm'
      },
      previewVisible: true,
      previewAnim: false
    })
    setTimeout(() => {
      this.setData({ previewAnim: true })
    }, 20)
  },

  closePreview() {
    this.setData({
      previewVisible: false,
      previewAnim: false,
      selectedDateCocktail: null
    })
  },

  onPreviewMaskTap() {
    this.closePreview()
  },

  onPreviewGoDetail(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    this.closePreview()
    wx.navigateTo({
      url: `/pages/detail/detail?id=${encodeURIComponent(id)}`
    })
  },

  goProducts() {
    wx.navigateTo({
      url: '/pages/products/products'
    })
  },

  fetchRecommendations() {
    if (!wx.cloud) {
      wx.showToast({ title: '请使用支持云开发的基础库', icon: 'none' })
      return
    }
    this.setData({
      recommendVisible: true,
      recommendLoading: true,
      recommendLines: [],
      recommendError: ''
    })
    wx.cloud
      .callFunction({
        name: 'getRecommendations',
        data: {
          history: this.data.cocktailList
        }
      })
      .then(res => {
        const r = res.result
        let lines = []
        if (Array.isArray(r)) {
          lines = r.map(x => (typeof x === 'string' ? x : JSON.stringify(x)))
        } else if (r && typeof r === 'object') {
          if (Array.isArray(r.recommendations)) lines = r.recommendations.map(String)
          else if (Array.isArray(r.list)) lines = r.list.map(String)
          else if (typeof r.text === 'string') lines = [r.text]
          else if (typeof r.message === 'string') lines = [r.message]
          else if (typeof r.summary === 'string') lines = [r.summary]
        }
        if (!lines.length && r && typeof r === 'object' && r.items) {
          lines = Array.isArray(r.items) ? r.items.map(i => (i && i.name ? i.name : String(i))) : []
        }
        this.setData({
          recommendLoading: false,
          recommendLines: lines.length ? lines : ['暂无推荐，多保存几杯特调后再试吧']
        })
      })
      .catch(err => {
        console.error('getRecommendations', err)
        this.setData({
          recommendLoading: false,
          recommendError: '获取推荐失败，请稍后重试'
        })
      })
  },

  closeRecommend() {
    this.setData({
      recommendVisible: false,
      recommendLines: [],
      recommendError: ''
    })
  }
})
