/**
 * AI 生成模块
 * 调用云函数进行情绪分析和特调方案生成
 * 所有AI调用通过云函数中转，确保API密钥安全
 */

function generateCocktail(emotionData) {
  return wx.cloud.callFunction({
    name: 'generateCocktail',
    data: { emotionData }
  }).then(res => {
    if (res.result && res.result.success) {
      return res.result.data
    }
    return getLocalCocktail(emotionData)
  }).catch(err => {
    console.error('AI生成失败，使用本地方案', err)
    return getLocalCocktail(emotionData)
  })
}

function getLocalCocktail(emotionData) {
  const { direction, emotionIntensity, concentration, keywords } = emotionData

  const cocktailTemplates = {
    bright: {
      names: [
        { cn: '日光柑橘・鲜酿版', en: 'Sunshine Citrus Fresh' },
        { cn: '蜜桃微醺・轻盈版', en: 'Peach Blush Light' },
        { cn: '晨光气泡・甜酿版', en: 'Morning Sparkle Sweet' },
        { cn: '金色余晖・果香版', en: 'Golden Glow Fruity' },
        { cn: '热带风暴・活力版', en: 'Tropical Storm Vibrant' }
      ],
      bases: [
        { name: 'Bright Rum', desc: '明亮朗姆', flavor: '带着阳光般的温暖甜感' },
        { name: 'Fresh Vodka', desc: '清新伏特加', flavor: '纯净而充满活力' },
        { name: 'White Tequila', desc: '白色龙舌兰', flavor: '清冽中带有生命力' }
      ],
      notes: {
        top: [
          { ingredient: '柠檬皮・百香果', mood: '来自你语句中的明快与雀跃' },
          { ingredient: '青柠・薄荷叶', mood: '映射你此刻的清爽心境' },
          { ingredient: '葡萄柚・接骨木花', mood: '回应你内心涌动的喜悦' }
        ],
        mid: [
          { ingredient: '蜜桃・芒果泥', mood: '你的快乐正在发酵成甜蜜' },
          { ingredient: '荔枝・玫瑰水', mood: '芬芳如你此刻的心情' },
          { ingredient: '菠萝・椰子奶', mood: '热带般温暖而丰盈' }
        ],
        tail: [
          { ingredient: '蜂蜜・香草', mood: '让美好延续到最后一滴' },
          { ingredient: '焦糖・肉桂', mood: '甜蜜的余韵缓缓停留' },
          { ingredient: '杏仁糖浆', mood: '柔软的收尾呼应你的温柔' }
        ]
      },
      feeling: 'Light 轻盈'
    },
    calm: {
      names: [
        { cn: '午后冰茶・微醺版', en: 'Afternoon Tea Tipsy' },
        { cn: '月色薄荷・舒缓版', en: 'Moonlit Mint Soothe' },
        { cn: '海盐微风・淡酿版', en: 'Sea Salt Breeze Mild' },
        { cn: '白噪音・清饮版', en: 'White Noise Clean' },
        { cn: '云端漫步・柔和版', en: 'Cloud Walk Gentle' }
      ],
      bases: [
        { name: 'Smooth Gin', desc: '柔和金酒', flavor: '草本清香中带着宁静' },
        { name: 'Light Sake', desc: '清酒', flavor: '温润而不喧嚣' },
        { name: 'Blanc Vermouth', desc: '白味美思', flavor: '淡雅如微风拂面' }
      ],
      notes: {
        top: [
          { ingredient: '薄荷・黄瓜', mood: '清凉如你此刻想要的安宁' },
          { ingredient: '洋甘菊・柠檬草', mood: '来自你内心渴望的放松' },
          { ingredient: '白茶・佛手柑', mood: '映射你此刻的恬淡自在' }
        ],
        mid: [
          { ingredient: '接骨木花・梨', mood: '温柔地包裹着你的平静' },
          { ingredient: '薰衣草・蜂蜜', mood: '安抚你逐渐放松的心绪' },
          { ingredient: '茉莉・荔枝露', mood: '如月光般柔和的中段' }
        ],
        tail: [
          { ingredient: '海盐・白胡椒', mood: '微妙的收尾如潮汐退去' },
          { ingredient: '雪松・岩兰草', mood: '大地般的安稳底韵' },
          { ingredient: '白巧克力・奶油', mood: '温柔地为宁静画上句号' }
        ]
      },
      feeling: 'Soft 柔和'
    },
    deep: {
      names: [
        { cn: '午夜可可・轻酿版', en: 'Midnight Cacao Mild' },
        { cn: '暗涌・深沉版', en: 'Undercurrent Deep' },
        { cn: '黑色天鹅绒・浓酿版', en: 'Black Velvet Rich' },
        { cn: '迷雾森林・烈酿版', en: 'Misty Forest Strong' },
        { cn: '深渊之镜・沉酿版', en: 'Abyss Mirror Dark' }
      ],
      bases: [
        { name: 'Deep Liquor', desc: '深色基酒', flavor: '带一点沉稳与深色调' },
        { name: 'Dark Rum', desc: '黑朗姆', flavor: '厚重如深夜的叹息' },
        { name: 'Smoky Whiskey', desc: '烟熏威士忌', flavor: '沉郁中蕴含力量' }
      ],
      notes: {
        top: [
          { ingredient: '柠檬皮・迷迭香', mood: '来自你语句中的紧绷与急促' },
          { ingredient: '苦橙・黑胡椒', mood: '映射你此刻的沉重感' },
          { ingredient: '生姜・陈皮', mood: '试图唤醒你深处的温暖' }
        ],
        mid: [
          { ingredient: '可可・麦芽', mood: '来自你此刻的压力感' },
          { ingredient: '黑樱桃・烟熏茶', mood: '你的情绪正在缓缓沉淀' },
          { ingredient: '咖啡・黑巧克力', mood: '苦涩中寻找一丝甘甜' }
        ],
        tail: [
          { ingredient: '橡木・烟草', mood: '代表你想缓和的意图' },
          { ingredient: '焦糖・龙涎香', mood: '深沉的余韵陪伴你的沉默' },
          { ingredient: '黑糖・肉豆蔻', mood: '在黑暗尽头留一盏温暖' }
        ]
      },
      feeling: 'Tight 紧绷'
    }
  }

  const template = cocktailTemplates[direction] || cocktailTemplates.calm
  const nameIdx = Math.floor(Math.random() * template.names.length)
  const baseIdx = Math.floor(Math.random() * template.bases.length)
  const topIdx = Math.floor(Math.random() * template.notes.top.length)
  const midIdx = Math.floor(Math.random() * template.notes.mid.length)
  const tailIdx = Math.floor(Math.random() * template.notes.tail.length)

  const summaryTexts = {
    bright: [
      '一杯明亮的特调，为你此刻的笑容加冕。',
      '阳光装进杯中，这是属于你的快乐配方。',
      '用甜蜜调和这一刻，敬你的好心情。'
    ],
    calm: [
      '一杯简单的特调，回应你此刻的留白。',
      '安静是一种力量，这杯酒懂你。',
      '不急不缓，陪你度过这个平静的时刻。'
    ],
    deep: [
      '深夜的情绪值得一杯认真的酒来回应。',
      '所有未说出口的话，都融进了这杯特调。',
      '这杯酒不会安慰你，但它会陪着你。'
    ]
  }

  const summaries = summaryTexts[direction] || summaryTexts.calm
  const summaryIdx = Math.floor(Math.random() * summaries.length)

  return {
    name: template.names[nameIdx],
    base: template.bases[baseIdx],
    notes: {
      top: template.notes.top[topIdx],
      mid: template.notes.mid[midIdx],
      tail: template.notes.tail[tailIdx]
    },
    feeling: template.feeling,
    concentration,
    direction,
    emotionIntensity,
    summary: summaries[summaryIdx],
    visualStyle: Math.floor(Math.random() * 3),
    generatedAt: Date.now()
  }
}

function analyzeEmotionRemote(text, sliderValue) {
  return wx.cloud.callFunction({
    name: 'analyzeEmotion',
    data: { text, sliderValue }
  }).then(res => {
    if (res.result && res.result.success) {
      return res.result.data
    }
    throw new Error('远程分析失败')
  })
}

module.exports = {
  generateCocktail,
  getLocalCocktail,
  analyzeEmotionRemote
}
