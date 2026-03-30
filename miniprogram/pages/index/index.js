const app = getApp()
const emotion = require('../../utils/emotion')
const ai = require('../../utils/ai')
const util = require('../../utils/util')

Page({
  data: {
    // Auth
    isLoggedIn: false,
    // Emotion state
    emotionText: '',
    sliderValue: 50,
    heroWaitLine: 'Wait to put',
    // Analysis state
    isAnalyzing: false,
    analysisProgress: 0,
    statusText: 'Wait to input',
    emotionDirection: 'calm',
    emotionIntensity: 50,
    emotionFluctuation: 30,
    // UI
    statusBarHeight: 0,
    navRightGap: 24,
    scrollHeight: 600,
    canStartMixing: false,
    // Analysis status messages cycling
    statusMessages: [
      '捕捉你的当下心情中・',
      '正在调和你的情绪基酒...',
      '分析你的情感色彩...',
      '为你调制专属特调...',
      '即将完成你的情绪饮品...'
    ]
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync()
    let navRightGap = 24
    try {
      const mb = wx.getMenuButtonBoundingClientRect()
      if (mb && mb.left) {
        navRightGap = Math.round((sysInfo.windowWidth - mb.left + 8) * 750 / sysInfo.windowWidth)
      }
    } catch (e) {
      /* noop */
    }
    const navBarPx = Math.round((88 * sysInfo.windowWidth) / 750)
    const scrollHeight = Math.max(
      400,
      Math.round(sysInfo.windowHeight - sysInfo.statusBarHeight - navBarPx - 8)
    )
    app.checkLoginStatus()
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navRightGap,
      scrollHeight,
      isLoggedIn: app.globalData.isLoggedIn
    })
    this.syncGlassStatus()
    this.updateGlassFromSliderOnly()
  },

  onShow() {
    app.checkLoginStatus()
    this.setData({ isLoggedIn: app.globalData.isLoggedIn })
    if (this._pendingResultNavigation) {
      this._pendingResultNavigation = false
      this.setData({ isAnalyzing: false })
    }
    this.syncGlassStatus()
    this.updateGlassFromSliderOnly()
  },

  syncGlassStatus() {
    if (this.data.isAnalyzing) return
    const trimmed = (this.data.emotionText || '').trim()
    let t = 'Wait to input'
    let heroWaitLine = 'Wait to put'
    if (!trimmed) {
      t = 'Wait to input'
      heroWaitLine = 'Wait to put'
    } else {
      t = '准备就绪 · 轻触开始特调'
      heroWaitLine = 'Ready when you are'
    }
    this.setData({ statusText: t, heroWaitLine })
  },

// Login
  handleLogin() {
    wx.getUserProfile({
      desc: '用于保存你的特调记录',
      success: (res) => {
        const userInfo = res.userInfo
        app.login()
          .then(() => {
            app.globalData.userInfo = userInfo
            app.globalData.isLoggedIn = true
            wx.setStorageSync('userInfo', userInfo)
            this.setData({ isLoggedIn: true })
            util.showToast('登录成功')
          })
          .catch((err) => {
            console.error('云登录失败', err)
            util.showToast('登录失败，请重试')
          })
      },
      fail: (err) => {
        console.error('用户取消授权', err)
        util.showToast('请授权登录')
      }
    })
  },

  preventTouchMove() {},

  // Input handling
  onTextInput(e) {
    const text = e.detail.value
    const hasText = text.trim().length > 0
    const canStartMixing = hasText

    this.setData({
      emotionText: text,
      canStartMixing
    })

    if (hasText) {
      this.updatePreviewEmotion(text)
    }
    this.syncGlassStatus()
  },

  // Slider — emotion-slider emits change { value }
  onSliderChange(e) {
    const val = e.detail.value
    this.setData({ sliderValue: val })
    if (this.data.emotionText && this.data.emotionText.trim()) {
      this.updatePreviewEmotion(this.data.emotionText)
    } else {
      this.updateGlassFromSliderOnly()
    }
  },

  updateGlassFromSliderOnly() {
    const v = this.data.sliderValue
    const direction = v >= 65 ? 'bright' : v >= 35 ? 'calm' : 'deep'
    const efi = Math.round(Math.abs(v / 100 - 0.5) * 2 * 100)
    this.setData({
      emotionDirection: direction,
      emotionFluctuation: Math.max(15, efi),
      emotionIntensity: Math.round(40 + Math.abs(v - 50) * 1.2)
    })
  },

  // Random text
  handleRandomGenerate() {
    if (this.data.isAnalyzing) return
    const text = emotion.getRandomText(this.data.sliderValue)
    this.setData({
      emotionText: text,
      canStartMixing: true
    })
    this.updatePreviewEmotion(text)
    this.syncGlassStatus()
  },

  // Preview emotion (update glass visuals)
  updatePreviewEmotion(text) {
    const textAnalysis = emotion.analyzeText(text)
    const fusedData = emotion.fuseEmotionData(this.data.sliderValue, textAnalysis)
    this.setData({
      emotionDirection: fusedData.direction,
      emotionIntensity: fusedData.emotionIntensity,
      emotionFluctuation: fusedData.emotionFluctuation
    })
  },

  // Start mixing
  async handleStartMixing() {
    if (!this.data.canStartMixing || this.data.isAnalyzing) return

    this.setData({
      isAnalyzing: true,
      statusText: this.data.statusMessages[0],
      analysisProgress: 0
    })

    let msgIndex = 0
    this._statusTimer = setInterval(() => {
      msgIndex = (msgIndex + 1) % this.data.statusMessages.length
      this.setData({ statusText: this.data.statusMessages[msgIndex] })
    }, 2000)

    try {
      const textAnalysis = emotion.analyzeText(this.data.emotionText)
      const emotionData = emotion.fuseEmotionData(this.data.sliderValue, textAnalysis)

      await util.delay(3000)

      const cocktailData = await ai.generateCocktail(emotionData)

      await util.delay(1500)

      if (this._statusTimer) {
        clearInterval(this._statusTimer)
        this._statusTimer = null
      }

      const resultData = {
        cocktail: cocktailData,
        emotionData: emotionData,
        emotionText: this.data.emotionText,
        sliderValue: this.data.sliderValue
      }

      wx.setStorageSync('currentResult', resultData)

      this._pendingResultNavigation = true
      wx.navigateTo({
        url: '/pages/result/result',
        fail: (err) => {
          console.error('navigateTo result failed', err)
          this._pendingResultNavigation = false
          this.setData({ isAnalyzing: false })
          this.syncGlassStatus()
          util.showToast('打开结果页失败')
        }
      })
    } catch (err) {
      console.error('调制失败', err)
      if (this._statusTimer) {
        clearInterval(this._statusTimer)
        this._statusTimer = null
      }
      this.setData({ isAnalyzing: false })
      this.syncGlassStatus()
      util.showToast('调制失败，请重试')
    }
  },

  // Navigate to history
  goToHistory() {
    if (this.data.isAnalyzing) return
    wx.navigateTo({ url: '/pages/history/history' })
  },

  onUnload() {
    if (this._statusTimer) clearInterval(this._statusTimer)
  }
})
