const MOCK_PRODUCTS = [
  {
    id: '1',
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

function normalizeProduct(p) {
  if (!p || typeof p !== 'object') return null;
  const direction = ['bright', 'calm', 'deep'].includes(p.direction)
    ? p.direction
    : 'calm';
  const tags = Array.isArray(p.emotion_tags)
    ? p.emotion_tags
    : [direction, direction === 'bright' ? '明亮' : direction === 'calm' ? '平静' : '深沉'];
  return {
    id: String(p.id != null ? p.id : ''),
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
    expandedId: ''
  },

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

    this.loadProducts();
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
        const raw =
          r &&
          (Array.isArray(r.products)
            ? r.products
            : Array.isArray(r.data)
              ? r.data
              : null);
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
