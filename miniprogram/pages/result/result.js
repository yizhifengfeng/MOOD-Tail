const ACCENT = {
  bright: '#FF9F43',
  calm: '#4ECDC4',
  deep: '#A855F7'
};

function safeStr(v) {
  return v == null ? '' : String(v);
}

function normalizeDirection(dir) {
  const d = safeStr(dir).toLowerCase();
  if (d === 'bright' || d === 'calm' || d === 'deep') return d;
  return 'calm';
}

Page({
  data: {
    titleVisible: false,
    statusBarHeight: 20,
    navBarHeight: 44,
    safeAreaBottom: 0,

    cocktailName: '',
    cocktailNameEn: '',
    recipe: {},
    direction: 'calm',
    accentColor: ACCENT.calm,
    accentRgb: '78, 205, 196',

    emotionData: null,
    emotionText: '',

    currentStyle: 0
  },

  _shareSummary: '',

  onLoad() {
    const sys = wx.getSystemInfoSync();
    const menu = wx.getMenuButtonBoundingClientRect();
    const statusBarHeight = sys.statusBarHeight || 20;
    const navBarHeight =
      statusBarHeight + (menu.top - statusBarHeight) * 2 + menu.height;
    const safeBottom = sys.safeArea
      ? Math.max(0, sys.screenHeight - sys.safeArea.bottom)
      : 0;

    this.setData({
      statusBarHeight,
      navBarHeight,
      safeAreaBottom: safeBottom
    });

    this.loadResultFromStorage();

    setTimeout(() => {
      this.setData({ titleVisible: true });
    }, 80);
  },

  onShow() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage() {
    const name = this.data.cocktailName || '情绪特调';
    const summary = this._shareSummary || this.data.recipe.summary || '为你调制的一杯心情';
    return {
      title: `${name} · ${summary}`,
      path: '/pages/index/index'
    };
  },

  onShareTimeline() {
    const name = this.data.cocktailName || '情绪特调';
    return {
      title: `${name} — MOOD Tail 情绪调酒`
    };
  },

  loadResultFromStorage() {
    let raw = null;
    try {
      raw = wx.getStorageSync('currentResult');
    } catch (e) {
      console.warn('currentResult read failed', e);
    }

    let payload = raw;
    if (typeof raw === 'string' && raw) {
      try {
        payload = JSON.parse(raw);
      } catch (e) {
        payload = null;
      }
    }

    if (!payload || typeof payload !== 'object') {
      wx.showToast({ title: '暂无配方数据', icon: 'none' });
      return;
    }

    const cocktail = payload.cocktail && typeof payload.cocktail === 'object'
      ? payload.cocktail
      : {};
    const direction = normalizeDirection(cocktail.direction || payload.direction);
    const accent = ACCENT[direction] || ACCENT.calm;

    let nameCn = '';
    let nameEn = '';
    if (cocktail.name && typeof cocktail.name === 'object') {
      nameCn = safeStr(cocktail.name.cn);
      nameEn = safeStr(cocktail.name.en);
    } else {
      nameCn = safeStr(cocktail.name);
      nameEn = safeStr(
        cocktail.nameEn || cocktail.name_en || cocktail.subtitleEn || cocktail.subtitle
      );
    }

    const recipe = {
      base: cocktail.base,
      notes: cocktail.notes,
      feeling: cocktail.feeling,
      concentration: cocktail.concentration,
      summary: cocktail.summary
    };

    const summary = safeStr(cocktail.summary);
    this._shareSummary = summary;

    let styleIdx = 0;
    const vs = cocktail.visualStyle;
    if (vs === 0 || vs === 1 || vs === 2) {
      styleIdx = vs;
    } else if (vs === '0' || vs === '1' || vs === '2') {
      styleIdx = parseInt(vs, 10);
    }

    this.setData({
      cocktailName: nameCn || '未命名特调',
      cocktailNameEn: nameEn,
      recipe,
      direction,
      accentColor: accent,
      accentRgb: this.hexToRgbString(accent),
      emotionData: payload.emotionData != null ? payload.emotionData : null,
      emotionText: safeStr(payload.emotionText),
      currentStyle: styleIdx
    });
  },

  hexToRgbString(hex) {
    const h = safeStr(hex).replace('#', '');
    if (h.length !== 6) return '78, 205, 196';
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) return '78, 205, 196';
    return `${r}, ${g}, ${b}`;
  },

  onTabStyle(e) {
    const idx = Number(e.currentTarget.dataset.index);
    if (Number.isNaN(idx)) return;
    this.setData({ currentStyle: idx });
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  onCloseToIndex() {
    wx.reLaunch({ url: '/pages/index/index' });
  },

  onSaveCocktail() {
    const payload = {
      cocktail: {
        name: this.data.cocktailName,
        nameEn: this.data.cocktailNameEn,
        ...this.data.recipe,
        direction: this.data.direction
      },
      emotionData: this.data.emotionData,
      emotionText: this.data.emotionText,
      savedAt: Date.now()
    };

    wx.cloud.callFunction({
      name: 'saveCocktail',
      data: { payload }
    })
      .then(() => {
        wx.showToast({ title: '已保存到酒单', icon: 'success' });
      })
      .catch((err) => {
        console.error('saveCocktail', err);
        wx.showToast({
          title: '保存失败，请稍后重试',
          icon: 'none'
        });
      });
  },

  onMixAnother() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
    } else {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  }
});
