const PRODUCT_CDN_BASE =
  'https://user5950.cn.imgto.link/public/20260329/product-'

/** 第 1 张对应 product-01，第 15 张对应 product-12，中间线性插值 */
function productImageByNumericId(id) {
  const n = parseInt(String(id), 10)
  if (!Number.isFinite(n) || n < 1) return ''
  const idx = Math.min(15, Math.max(1, n))
  const fileNum = Math.round(1 + ((idx - 1) * 11) / 14)
  return `${PRODUCT_CDN_BASE}${String(fileNum).padStart(2, '0')}.avif`
}

const MOCK_PRODUCTS = [
  {
    id: '1',
    image: '/images/阳光金酒 Sunshine Gin.png',
    name: '阳光金酒',
    nameEn: 'Sunshine Gin',
    category: '金酒',
    direction: 'bright',
    emotion_tags: ['bright', '明亮'],
    description: '清新柑橘与杜松子的完美融合，如同午后阳光',
    ingredients: ['杜松子', '柑橘皮', '香菜籽']
  },
  {
    id: '2',
    image: '/images/月色朗姆 Moonlight Rum.png',
    name: '月色朗姆',
    nameEn: 'Moonlight Rum',
    category: '朗姆酒',
    direction: 'calm',
    emotion_tags: ['calm', '平静'],
    description: '温润的甘蔗甜韵，适合安静的夜晚',
    ingredients: ['甘蔗', '香草', '焦糖']
  },
  {
    id: '3',
    image: '/images/深渊威士忌 Abyss Whiskey.png',
    name: '深渊威士忌',
    nameEn: 'Abyss Whiskey',
    category: '威士忌',
    direction: 'deep',
    emotion_tags: ['deep', '深沉'],
    description: '烟熏橡木桶陈酿，沉稳而有力量',
    ingredients: ['大麦', '橡木', '烟熏']
  },
  {
    id: '4',
    image: '/images/热带伏特加 Tropical Vodka.png',
    name: '热带伏特加',
    nameEn: 'Tropical Vodka',
    category: '伏特加',
    direction: 'bright',
    emotion_tags: ['bright', '明亮'],
    description: '百香果与芒果的热带风情',
    ingredients: ['百香果', '芒果', '青柠']
  },
  {
    id: '5',
    image: '/images/薰衣草利口酒 Lavender Liqueur.png',
    name: '薰衣草利口酒',
    nameEn: 'Lavender Liqueur',
    category: '利口酒',
    direction: 'calm',
    emotion_tags: ['calm', '平静'],
    description: '法式薰衣草的优雅芬芳',
    ingredients: ['薰衣草', '蜂蜜', '柠檬']
  },
  {
    id: '6',
    image: '/images/暗夜龙舌兰 Dark Tequila.png',
    name: '暗夜龙舌兰',
    nameEn: 'Dark Tequila',
    category: '龙舌兰',
    direction: 'deep',
    emotion_tags: ['deep', '深沉'],
    description: '陈年龙舌兰的复杂层次',
    ingredients: ['龙舌兰', '橡木', '焦糖']
  },
  {
    id: '7',
    image: '/images/蜜桃起泡酒 Peach Sparkling.png',
    name: '蜜桃起泡酒',
    nameEn: 'Peach Sparkling',
    category: '起泡酒',
    direction: 'bright',
    emotion_tags: ['bright', '明亮'],
    description: '新鲜蜜桃的甜蜜气泡',
    ingredients: ['蜜桃', '气泡', '柠檬酸']
  },
  {
    id: '8',
    image: '/images/茉莉清酒 Jasmine Sake.png',
    name: '茉莉清酒',
    nameEn: 'Jasmine Sake',
    category: '清酒',
    direction: 'calm',
    emotion_tags: ['calm', '平静'],
    description: '淡雅茉莉花香的日式清酒',
    ingredients: ['米', '茉莉', '矿泉水']
  },
  {
    id: '9',
    image: '/images/黑樱桃白兰地 Dark Cherry Brandy.png',
    name: '黑樱桃白兰地',
    nameEn: 'Dark Cherry Brandy',
    category: '白兰地',
    direction: 'deep',
    emotion_tags: ['deep', '深沉'],
    description: '浓郁黑樱桃与橡木的交融',
    ingredients: ['黑樱桃', '橡木', '肉桂']
  },
  {
    id: '10',
    image: '/images/青柠莫吉托基酒 Lime Mojito Base.png',
    name: '青柠莫吉托基酒',
    nameEn: 'Lime Mojito Base',
    category: '调配基酒',
    direction: 'bright',
    emotion_tags: ['bright', '明亮'],
    description: '清爽青柠与薄荷的经典组合',
    ingredients: ['青柠', '薄荷', '白糖']
  },
  {
    id: '11',
    image: '/images/海盐焦糖奶酒 Sea Salt Caramel Cream.png',
    name: '海盐焦糖奶酒',
    nameEn: 'Sea Salt Caramel Cream',
    category: '奶油酒',
    direction: 'calm',
    emotion_tags: ['calm', '平静'],
    description: '海盐与焦糖的柔和碰撞',
    ingredients: ['奶油', '海盐', '焦糖']
  },
  {
    id: '12',
    image: '/images/烟熏苦艾酒 Smoky Absinthe.png',
    name: '烟熏苦艾酒',
    nameEn: 'Smoky Absinthe',
    category: '苦艾酒',
    direction: 'deep',
    emotion_tags: ['deep', '深沉'],
    description: '神秘的茴香与苦涩草本',
    ingredients: ['茴香', '苦艾', '薄荷']
  },
  {
    id: '13',
    image: '/images/玫瑰荔枝酒 Rose Lychee Wine.png',
    name: '玫瑰起泡',
    nameEn: 'Rose Sparkling',
    category: '起泡酒',
    direction: 'bright',
    emotion_tags: ['bright', '明亮', '浪漫'],
    description: '玫瑰与莓果的轻盈气泡，明亮而温柔',
    ingredients: ['玫瑰', '莓果', '起泡酒基']
  },
  {
    id: '14',
    image: '/images/竹叶青梅酒 Bamboo Plum Wine.png',
    name: '竹韵梅酒',
    nameEn: 'Bamboo Plum Wine',
    category: '梅酒',
    direction: 'calm',
    emotion_tags: ['calm', '平静', '禅意'],
    description: '青梅与竹叶清香，安静悠长',
    ingredients: ['青梅', '竹叶', '冰糖']
  },
  {
    id: '15',
    image: '/images/黑松露波本 Black Truffle Bourbon.png',
    name: '炭焙烧酒',
    nameEn: 'Charcoal Shochu',
    category: '烧酒',
    direction: 'deep',
    emotion_tags: ['deep', '深沉', '醇厚'],
    description: '炭火焙香与谷物焦香，内敛有力',
    ingredients: ['大麦', '炭焙', '矿泉水']
  }
];

const FILTER_KEYS = ['all', 'bright', 'calm', 'deep'];

function normalizeDirectionFromProduct(p) {
  const raw = p.direction;
  if (raw === 'bright' || raw === 'calm' || raw === 'deep') return raw;
  const s = raw == null ? '' : String(raw).trim();
  const lower = s.toLowerCase();
  if (lower === 'bright' || lower === 'calm' || lower === 'deep') return lower;
  if (s.includes('明亮') || /bright/i.test(s)) return 'bright';
  if (s.includes('深沉') || /deep/i.test(s)) return 'deep';
  if (s.includes('平静') || /calm/i.test(s)) return 'calm';
  const tags = Array.isArray(p.emotion_tags) ? p.emotion_tags : [];
  for (let i = 0; i < tags.length; i++) {
    const t = String(tags[i]).toLowerCase();
    if (t === 'bright' || t === '明亮') return 'bright';
    if (t === 'deep' || t === '深沉') return 'deep';
    if (t === 'calm' || t === '平静') return 'calm';
  }
  return 'calm';
}

function extractProductList(r) {
  if (!r || typeof r !== 'object') return null;
  if (Array.isArray(r.products)) return r.products;
  if (Array.isArray(r.data)) return r.data;
  if (r.data && typeof r.data === 'object' && Array.isArray(r.data.products)) {
    return r.data.products;
  }
  if (Array.isArray(r.list)) return r.list;
  return null;
}

function normalizeProduct(p) {
  if (!p || typeof p !== 'object') return null;
  const direction = normalizeDirectionFromProduct(p);
  const tags = Array.isArray(p.emotion_tags)
    ? p.emotion_tags
    : [direction, direction === 'bright' ? '明亮' : direction === 'calm' ? '平静' : '深沉'];
  const id = String(p.id != null ? p.id : '');
  const rawImg = p.image != null ? String(p.image) : '';
  const image =
    rawImg && /^https?:\/\//i.test(rawImg)
      ? rawImg
      : productImageByNumericId(id);
  return {
    id,
    image,
    name: p.name || '',
    nameEn: p.nameEn || '',
    category: p.category || '',
    direction,
    emotion_tags: tags,
    description: p.description || '',
    ingredients: Array.isArray(p.ingredients) ? p.ingredients : []
  };
}

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    safeAreaBottom: 0,

    filter: 'all',
    filterTabs: [
      { key: 'all', label: '全部' },
      { key: 'bright', label: 'Bright 明亮' },
      { key: 'calm', label: 'Calm 平静' },
      { key: 'deep', label: 'Deep 深沉' }
    ],

    products: [],
    filteredProducts: [],
    expandedId: '',

    bodyPadTop: 64
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync();
    const menu = wx.getMenuButtonBoundingClientRect();
    const statusBarHeight = sys.statusBarHeight || 20;
    const navBarHeight =
      statusBarHeight + (menu.top - statusBarHeight) * 2 + menu.height;
    const bodyPadTop = navBarHeight + 16;
    const safeBottom = sys.safeArea
      ? Math.max(0, sys.screenHeight - sys.safeArea.bottom)
      : 0;

    const dir = options && options.direction ? String(options.direction).toLowerCase() : '';
    const filterFromQuery =
      dir === 'bright' || dir === 'calm' || dir === 'deep' ? dir : null;

    this.setData(
      {
        statusBarHeight,
        navBarHeight,
        bodyPadTop,
        safeAreaBottom: safeBottom,
        ...(filterFromQuery ? { filter: filterFromQuery } : {})
      },
      () => {
        this.loadProducts();
      }
    );
  },

  loadProducts() {
    if (!wx.cloud || !wx.cloud.callFunction) {
      this.applyList(MOCK_PRODUCTS.map(normalizeProduct).filter(Boolean));
      return;
    }

    wx.cloud
      .callFunction({
        name: 'getProducts',
        data: {}
      })
      .then((res) => {
        const r = res && res.result;
        const raw = extractProductList(r);
        if (raw && raw.length) {
          const list = raw.map(normalizeProduct).filter(Boolean);
          this.applyList(list.length ? list : MOCK_PRODUCTS.map(normalizeProduct));
        } else {
          this.applyList(MOCK_PRODUCTS.map(normalizeProduct));
        }
      })
      .catch((err) => {
        console.warn('getProducts fallback mock', err);
        this.applyList(MOCK_PRODUCTS.map(normalizeProduct));
      });
  },

  applyList(list) {
    this._allProducts = list;
    this.setData({ products: list }, () => {
      this.applyFilter(this.data.filter);
    });
  },

  applyFilter(key) {
    const k = FILTER_KEYS.includes(key) ? key : 'all';
    const all = this._allProducts || [];
    const filtered =
      k === 'all' ? all.slice() : all.filter((p) => p.direction === k);
    this.setData({
      filter: k,
      filteredProducts: filtered,
      expandedId: ''
    });
  },

  onFilterTap(e) {
    const key = e.currentTarget.dataset.key;
    if (!key) return;
    this.applyFilter(key);
  },

  onToggleCard(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    this.setData({
      expandedId: this.data.expandedId === id ? '' : id
    });
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  }
});
