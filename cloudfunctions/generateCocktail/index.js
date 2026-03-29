const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/**
 * AI特调生成云函数
 * 根据情绪数据生成特调名称、配方、文案
 * 可对接AI API（如百度文心、智谱GLM、通义千问等）
 */

const COCKTAIL_TEMPLATES = {
  bright: {
    names: [
      { cn: '日光柑橘・鲜酿版', en: 'Sunshine Citrus Fresh' },
      { cn: '蜜桃微醺・轻盈版', en: 'Peach Blush Light' },
      { cn: '晨光气泡・甜酿版', en: 'Morning Sparkle Sweet' },
      { cn: '金色余晖・果香版', en: 'Golden Glow Fruity' },
      { cn: '热带风暴・活力版', en: 'Tropical Storm Vibrant' },
      { cn: '柠檬花园・清爽版', en: 'Lemon Garden Crisp' },
      { cn: '橙色心跳・欢乐版', en: 'Orange Heartbeat Joy' }
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
    feeling: 'Light 轻盈',
    summaries: [
      '一杯明亮的特调，为你此刻的笑容加冕。',
      '阳光装进杯中，这是属于你的快乐配方。',
      '用甜蜜调和这一刻，敬你的好心情。',
      '快乐值得被认真对待，这杯酒就是证明。'
    ]
  },
  calm: {
    names: [
      { cn: '午后冰茶・微醺版', en: 'Afternoon Tea Tipsy' },
      { cn: '月色薄荷・舒缓版', en: 'Moonlit Mint Soothe' },
      { cn: '海盐微风・淡酿版', en: 'Sea Salt Breeze Mild' },
      { cn: '白噪音・清饮版', en: 'White Noise Clean' },
      { cn: '云端漫步・柔和版', en: 'Cloud Walk Gentle' },
      { cn: '雨后花园・静酿版', en: 'After Rain Garden Still' },
      { cn: '星空露水・轻语版', en: 'Starlight Dew Whisper' }
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
    feeling: 'Soft 柔和',
    summaries: [
      '一杯简单的特调，回应你此刻的留白。',
      '安静是一种力量，这杯酒懂你。',
      '不急不缓，陪你度过这个平静的时刻。',
      '有时候，一杯恰到好处的酒就是最好的陪伴。'
    ]
  },
  deep: {
    names: [
      { cn: '午夜可可・轻酿版', en: 'Midnight Cacao Mild' },
      { cn: '暗涌・深沉版', en: 'Undercurrent Deep' },
      { cn: '黑色天鹅绒・浓酿版', en: 'Black Velvet Rich' },
      { cn: '迷雾森林・烈酿版', en: 'Misty Forest Strong' },
      { cn: '深渊之镜・沉酿版', en: 'Abyss Mirror Dark' },
      { cn: '暮色低语・沉思版', en: 'Twilight Murmur Ponder' },
      { cn: '焦木余烬・微烈版', en: 'Charred Ember Mild Heat' }
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
    feeling: 'Tight 紧绷',
    summaries: [
      '深夜的情绪值得一杯认真的酒来回应。',
      '所有未说出口的话，都融进了这杯特调。',
      '这杯酒不会安慰你，但它会陪着你。',
      '有些重量需要被承认，这杯酒替你承认了。'
    ]
  }
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateFromTemplate(emotionData) {
  const { direction, concentration, emotionIntensity } = emotionData
  const template = COCKTAIL_TEMPLATES[direction] || COCKTAIL_TEMPLATES.calm

  return {
    name: pickRandom(template.names),
    base: pickRandom(template.bases),
    notes: {
      top: pickRandom(template.notes.top),
      mid: pickRandom(template.notes.mid),
      tail: pickRandom(template.notes.tail)
    },
    feeling: template.feeling,
    concentration: concentration || 50,
    direction,
    emotionIntensity: emotionIntensity || 50,
    summary: pickRandom(template.summaries),
    visualStyle: Math.floor(Math.random() * 3),
    generatedAt: Date.now()
  }
}

/*
 * 如需接入真实AI API，取消以下注释并配置API密钥
 * 推荐使用：百度文心一言 / 智谱ChatGLM / 通义千问
 *
 * async function callAI(emotionData) {
 *   const prompt = `你是一个酒吧调酒师AI。根据以下情绪数据生成一款特调鸡尾酒方案：
 *     情绪方向：${emotionData.direction}
 *     情绪强度：${emotionData.emotionIntensity}%
 *     浓度：${emotionData.concentration}%
 *     关键词：${emotionData.keywords.map(k => k.keyword).join('、')}
 *     
 *     请返回JSON格式：
 *     {
 *       "name": {"cn": "中文名", "en": "English Name"},
 *       "base": {"name": "基酒英文", "desc": "基酒中文", "flavor": "风味描述"},
 *       "notes": {
 *         "top": {"ingredient": "前调原料", "mood": "情绪解读"},
 *         "mid": {"ingredient": "中调原料", "mood": "情绪解读"},
 *         "tail": {"ingredient": "尾调原料", "mood": "情绪解读"}
 *       },
 *       "feeling": "体感描述",
 *       "summary": "一句话情绪文案"
 *     }`
 *   
 *   const response = await http.post(AI_API_URL, {
 *     model: 'your-model',
 *     messages: [{ role: 'user', content: prompt }]
 *   }, { headers: { 'Authorization': `Bearer ${API_KEY}` } })
 *   
 *   return JSON.parse(response.data.choices[0].message.content)
 * }
 */

exports.main = async (event) => {
  const { emotionData } = event

  if (!emotionData || !emotionData.direction) {
    return { success: false, error: '情绪数据缺失' }
  }

  try {
    // 使用模板生成（可替换为AI API调用）
    // const aiResult = await callAI(emotionData)
    const cocktail = generateFromTemplate(emotionData)

    return { success: true, data: cocktail }
  } catch (err) {
    console.error('特调生成失败', err)
    return { success: false, error: err.message }
  }
}
