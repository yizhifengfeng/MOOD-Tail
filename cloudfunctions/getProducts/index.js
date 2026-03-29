const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-9g5ad152cea1ad94' })
const db = cloud.database()

const DEFAULT_PRODUCTS = [
  { id: '1', image: '/images/阳光金酒 Sunshine Gin.png', name: '阳光金酒', nameEn: 'Sunshine Gin', category: '金酒', direction: 'bright', description: '清新柑橘与杜松子的完美融合，如同午后阳光', ingredients: ['杜松子', '柑橘皮', '香菜籽'], emotion_tags: ['bright'] },
  { id: '2', image: '/images/月色朗姆 Moonlight Rum.png', name: '月色朗姆', nameEn: 'Moonlight Rum', category: '朗姆酒', direction: 'calm', description: '温润的甘蔗甜韵，适合安静的夜晚', ingredients: ['甘蔗', '香草', '焦糖'], emotion_tags: ['calm'] },
  { id: '3', image: '/images/深渊威士忌 Abyss Whiskey.png', name: '深渊威士忌', nameEn: 'Abyss Whiskey', category: '威士忌', direction: 'deep', description: '烟熏橡木桶陈酿，沉稳而有力量', ingredients: ['大麦', '橡木', '烟熏'], emotion_tags: ['deep'] },
  { id: '4', image: '/images/热带伏特加 Tropical Vodka.png', name: '热带伏特加', nameEn: 'Tropical Vodka', category: '伏特加', direction: 'bright', description: '百香果与芒果的热带风情', ingredients: ['百香果', '芒果', '青柠'], emotion_tags: ['bright'] },
  { id: '5', image: '/images/薰衣草利口酒 Lavender Liqueur.png', name: '薰衣草利口酒', nameEn: 'Lavender Liqueur', category: '利口酒', direction: 'calm', description: '法式薰衣草的优雅芬芳', ingredients: ['薰衣草', '蜂蜜', '柠檬'], emotion_tags: ['calm'] },
  { id: '6', image: '/images/暗夜龙舌兰 Dark Tequila.png', name: '暗夜龙舌兰', nameEn: 'Dark Tequila', category: '龙舌兰', direction: 'deep', description: '陈年龙舌兰的复杂层次', ingredients: ['龙舌兰', '橡木', '焦糖'], emotion_tags: ['deep'] },
  { id: '7', image: '/images/蜜桃起泡酒 Peach Sparkling.png', name: '蜜桃起泡酒', nameEn: 'Peach Sparkling', category: '起泡酒', direction: 'bright', description: '新鲜蜜桃的甜蜜气泡', ingredients: ['蜜桃', '气泡', '柠檬酸'], emotion_tags: ['bright'] },
  { id: '8', image: '/images/茉莉清酒 Jasmine Sake.png', name: '茉莉清酒', nameEn: 'Jasmine Sake', category: '清酒', direction: 'calm', description: '淡雅茉莉花香的日式清酒', ingredients: ['米', '茉莉', '矿泉水'], emotion_tags: ['calm'] },
  { id: '9', image: '/images/黑樱桃白兰地 Dark Cherry Brandy.png', name: '黑樱桃白兰地', nameEn: 'Dark Cherry Brandy', category: '白兰地', direction: 'deep', description: '浓郁黑樱桃与橡木的交融', ingredients: ['黑樱桃', '橡木', '肉桂'], emotion_tags: ['deep'] },
  { id: '10', image: '/images/青柠莫吉托基酒 Lime Mojito Base.png', name: '青柠莫吉托基酒', nameEn: 'Lime Mojito Base', category: '调配基酒', direction: 'bright', description: '清爽青柠与薄荷的经典组合', ingredients: ['青柠', '薄荷', '白糖'], emotion_tags: ['bright'] },
  { id: '11', image: '/images/海盐焦糖奶酒 Sea Salt Caramel Cream.png', name: '海盐焦糖奶酒', nameEn: 'Sea Salt Caramel Cream', category: '奶油酒', direction: 'calm', description: '海盐与焦糖的柔和碰撞', ingredients: ['奶油', '海盐', '焦糖'], emotion_tags: ['calm'] },
  { id: '12', image: '/images/烟熏苦艾酒 Smoky Absinthe.png', name: '烟熏苦艾酒', nameEn: 'Smoky Absinthe', category: '苦艾酒', direction: 'deep', description: '神秘的茴香与苦涩草本', ingredients: ['茴香', '苦艾', '薄荷'], emotion_tags: ['deep'] },
  { id: '13', image: '/images/玫瑰荔枝酒 Rose Lychee Wine.png', name: '玫瑰荔枝酒', nameEn: 'Rose Lychee Wine', category: '果酒', direction: 'bright', description: '玫瑰花瓣与新鲜荔枝的浪漫融合', ingredients: ['玫瑰', '荔枝', '白葡萄'], emotion_tags: ['bright', 'calm'] },
  { id: '14', image: '/images/竹叶青梅酒 Bamboo Plum Wine.png', name: '竹叶青梅酒', nameEn: 'Bamboo Plum Wine', category: '梅酒', direction: 'calm', description: '青梅的酸甜与竹叶的清幽', ingredients: ['青梅', '竹叶', '冰糖'], emotion_tags: ['calm'] },
  { id: '15', image: '/images/黑松露波本 Black Truffle Bourbon.png', name: '黑松露波本', nameEn: 'Black Truffle Bourbon', category: '波本', direction: 'deep', description: '黑松露的奢华与波本的醇厚', ingredients: ['黑松露', '波本', '蜂蜜'], emotion_tags: ['deep'] }
]

exports.main = async (event) => {
  const { direction } = event

  try {
    let query = db.collection('products')
    if (direction && direction !== 'all') {
      query = query.where({ direction })
    }

    const result = await query.limit(50).get()

    if (result.data && result.data.length > 0) {
      return { success: true, data: { products: result.data } }
    }

    let products = DEFAULT_PRODUCTS
    if (direction && direction !== 'all') {
      products = products.filter(p => p.direction === direction)
    }
    return { success: true, data: { products } }

  } catch (err) {
    let products = DEFAULT_PRODUCTS
    if (direction && direction !== 'all') {
      products = products.filter(p => p.direction === direction)
    }
    return { success: true, data: { products } }
  }
}
