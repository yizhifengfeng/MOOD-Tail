App({
  globalData: {
    userInfo: null,
    openid: null,
    isLoggedIn: false,
    barProducts: [],
    emotionColors: {
      bright: {
        primary: '#FF9F43',
        secondary: '#FECA57',
        gradient: ['#FF9F43', '#FFD700', '#FFA502']
      },
      calm: {
        primary: '#4ECDC4',
        secondary: '#48DBFB',
        gradient: ['#4ECDC4', '#0ABDE3', '#7ED6DF']
      },
      deep: {
        primary: '#A855F7',
        secondary: '#6C5CE7',
        gradient: ['#A855F7', '#8B5CF6', '#DC143C']
      }
    }
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      traceUser: true
    })
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    const openid = wx.getStorageSync('openid')
    if (userInfo && openid) {
      this.globalData.userInfo = userInfo
      this.globalData.openid = openid
      this.globalData.isLoggedIn = true
    }
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        data: {}
      }).then(res => {
        const { openid } = res.result
        this.globalData.openid = openid
        wx.setStorageSync('openid', openid)
        resolve(openid)
      }).catch(err => {
        console.error('登录失败', err)
        reject(err)
      })
    })
  },

  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于展示用户信息',
        success: res => {
          this.globalData.userInfo = res.userInfo
          this.globalData.isLoggedIn = true
          wx.setStorageSync('userInfo', res.userInfo)
          resolve(res.userInfo)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  }
})
