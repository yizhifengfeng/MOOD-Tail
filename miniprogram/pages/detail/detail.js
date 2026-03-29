const util = require('../../utils/util');

const ACCENT = {
  bright: '#FF9F43',
  calm: '#4ECDC4',
  deep: '#A855F7'
};

const DIRECTION_LABEL = {
  bright: 'Bright 明亮',
  calm: 'Calm 平静',
  deep: 'Deep 深沉'
};

function safeStr(v) {
  return v == null ? '' : String(v);
}

function normalizeDirection(dir) {
  const d = safeStr(dir).toLowerCase();
  if (d === 'bright' || d === 'calm' || d === 'deep') return d;
  return 'calm';
}

function pickEmotionData(payload, cocktail) {
  const raw =
    payload.emotionData != null
      ? payload.emotionData
      : cocktail.emotionData != null
        ? cocktail.emotionData
        : null;
  if (!raw || typeof raw !== 'object') return null;
  return {
    direction: normalizeDirection(raw.direction || payload.direction || cocktail.direction),
    intensity:
      raw.intensity != null
        ? raw.intensity
        : cocktail.emotionIntensity != null
          ? cocktail.emotionIntensity
          : null,
    sliderValue:
      raw.sliderValue != null
        ? raw.sliderValue
        : raw.slider != null
          ? raw.slider
          : payload.sliderValue != null
            ? payload.sliderValue
            : null
  };
}

function applyPayload(page, payload, cocktailId) {
  const cocktail =
    payload.cocktail && typeof payload.cocktail === 'object' ? payload.cocktail : {};
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

  const emotionData = pickEmotionData(payload, cocktail);
  const emotionText = safeStr(payload.emotionText || cocktail.emotionText);
  const savedAt = payload.savedAt != null ? payload.savedAt : cocktail.savedAt;
  const ts = typeof savedAt === 'number' ? savedAt : parseInt(savedAt, 10);
  const savedAtText = !Number.isNaN(ts) && ts > 0 ? util.formatTime(ts) : '';

  const summary = safeStr(cocktail.summary || recipe.summary);
  page._shareSummary = summary;
  page._cocktailId = cocktailId || safeStr(payload.id || cocktail.id || cocktail._id);

  const intensityText =
    emotionData && emotionData.intensity != null ? safeStr(emotionData.intensity) : '—';
  const sliderText =
    emotionData && emotionData.sliderValue != null ? safeStr(emotionData.sliderValue) : '—';

  page.setData({
    loaded: true,
    cocktailName: nameCn || '未命名特调',
    cocktailNameEn: nameEn,
    recipe,
    direction,
    accentColor: accent,
    accentRgb: page.hexToRgbString(accent),
    emotionData,
    emotionText,
    intensityText,
    sliderText,
    directionLabel: DIRECTION_LABEL[direction] || DIRECTION_LABEL.calm,
    savedAtText,
    titleVisible: true
  });
}

Page({
  data: {
    loaded: false,
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
    intensityText: '—',
    sliderText: '—',
    directionLabel: DIRECTION_LABEL.calm,
    savedAtText: ''
  },

  _shareSummary: '',
  _cocktailId: '',

  onLoad(options) {
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

    const id = options.id != null ? safeStr(options.id) : '';
    if (!id) {
      let raw = null;
      try { raw = wx.getStorageSync('currentResult'); } catch (e) { /* noop */ }
      if (raw && typeof raw === 'object') {
        applyPayload(this, raw, '');
      } else {
        wx.showToast({ title: '缺少特调数据', icon: 'none' });
        this.setData({ loaded: true });
      }
      return;
    }

    this.loadCocktail(id);

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
    const id = this._cocktailId;
    const path = id
      ? `/pages/detail/detail?id=${encodeURIComponent(id)}`
      : '/pages/index/index';
    return {
      title: `${name} · ${summary}`,
      path
    };
  },

  onShareTimeline() {
    const name = this.data.cocktailName || '情绪特调';
    return {
      title: `${name} — MOOD Tail 情绪调酒`
    };
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

  loadCocktail(id) {
    const tryCloud = () =>
      new Promise((resolve, reject) => {
        if (!wx.cloud || !wx.cloud.database) {
          reject(new Error('no cloud'));
          return;
        }
        wx.cloud
          .database()
          .collection('cocktails')
          .doc(id)
          .get()
          .then((res) => {
            if (res && res.data) resolve(res.data);
            else reject(new Error('empty'));
          })
          .catch(reject);
      });

    tryCloud()
      .then((doc) => {
        applyPayload(this, doc, id);
      })
      .catch(() => {
        const local = this.loadFromLocalStorage(id);
        if (local) {
          applyPayload(this, local, id);
        } else {
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
          if (payload && typeof payload === 'object') {
            const cid = safeStr(payload.id || (payload.cocktail && payload.cocktail.id));
            if (!cid || cid === id) {
              applyPayload(this, payload, id);
              return;
            }
          }
          wx.showToast({ title: '未找到该特调', icon: 'none' });
          this.setData({ loaded: true });
        }
      });
  },

  loadFromLocalStorage(id) {
    let list = [];
    try {
      list = wx.getStorageSync('savedCocktails');
    } catch (e) {
      return null;
    }
    if (typeof list === 'string' && list) {
      try {
        list = JSON.parse(list);
      } catch (e) {
        list = [];
      }
    }
    if (!Array.isArray(list)) list = [];

    let found =
      list.find((x) => x && (String(x.id) === id || String(x._id) === id)) || null;

    if (!found) {
      try {
        const one = wx.getStorageSync(`cocktail_${id}`);
        if (one && typeof one === 'object') found = one;
        else if (typeof one === 'string' && one) {
          found = JSON.parse(one);
        }
      } catch (e) {
        /* noop */
      }
    }

    return found;
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  onMixAnother() {
    wx.reLaunch({ url: '/pages/index/index' });
  }
});
