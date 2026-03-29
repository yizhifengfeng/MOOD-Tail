/**
 * 情绪分析融合模块
 * 将情绪滑块数值(0-100)与NLP文本分析结果加权融合，
 * 产出最终情绪数据用于AI配方生成
 */

const EMOTION_KEYWORDS = {
  bright: {
    keywords: ['开心', '快乐', '兴奋', '激动', '喜悦', '幸福', '美好', '期待', '惊喜', '甜蜜', '温暖', '灿烂', '阳光', '活力', '热情', '欢乐', '满足', '愉快', '畅快', '自在'],
    weight: 0.85,
    direction: 'positive'
  },
  calm: {
    keywords: ['平静', '安宁', '放松', '舒适', '宁静', '淡然', '从容', '闲适', '悠闲', '恬静', '祥和', '惬意', '缓和', '慵懒', '休息', '沉淀', '冥想', '安逸', '柔和', '自然'],
    weight: 0.5,
    direction: 'neutral'
  },
  deep: {
    keywords: ['疲惫', '累', '沉重', '压力', '低落', '忧伤', '思念', '孤独', '迷茫', '焦虑', '伤感', '遗憾', '失落', '沉默', '黑暗', '痛苦', '难过', '烦躁', '挣扎', '疲倦', '消沉', '无力', '沮丧'],
    weight: 0.2,
    direction: 'negative'
  }
}

const RANDOM_TEXTS = {
  bright: [
    '今天阳光很好，心情也跟着明亮起来',
    '刚收到一个好消息，整个人都轻盈了',
    '和朋友们在一起的时光总是那么快乐',
    '世界很美好，我想要一杯甜甜的酒',
    '满满的活力，想要一杯能让人微笑的特调',
    '有种想跳舞的冲动，给我一杯阳光味的',
    '今天的风都是甜的，适合喝一杯庆祝',
    '笑到肚子疼的一天，需要一杯配得上这份快乐的酒'
  ],
  calm: [
    '想找一个安静的角落，慢慢喝一杯',
    '今天不想说话，只想安静地待着',
    '窗外下着雨，适合一杯温柔的酒',
    '什么都不想做，只想发呆放空',
    '一个人的夜晚，需要一杯陪伴的味道',
    '想要一种让人平静下来的味觉体验',
    '让时间慢下来，给我一杯慵懒的午后',
    '闭上眼睛，想听到冰块碰撞杯壁的声音'
  ],
  deep: [
    '有点累，想要一杯深沉的酒',
    '今天不太顺利，需要什么来缓解一下',
    '说不上来的低落，可能需要一杯烈的',
    '压力太大了，想逃离一会儿',
    '深夜的情绪总是比较复杂',
    '有些话不知道该对谁说',
    '想念一个人，但不想承认',
    '疲惫到只想沉入一杯酒的深处',
    '今天的重量需要一杯足够深沉的酒来承载'
  ]
}

function analyzeText(text) {
  if (!text || text.trim() === '') {
    return { direction: 'calm', intensity: 0.5, keywords: [], confidence: 0 }
  }

  const scores = { bright: 0, calm: 0, deep: 0 }
  const matchedKeywords = []

  for (const [category, config] of Object.entries(EMOTION_KEYWORDS)) {
    for (const keyword of config.keywords) {
      if (text.includes(keyword)) {
        scores[category] += 1
        matchedKeywords.push({ keyword, category })
      }
    }
  }

  const totalMatches = scores.bright + scores.calm + scores.deep

  if (totalMatches === 0) {
    return {
      direction: 'calm',
      intensity: 0.5,
      keywords: [],
      confidence: 0.3,
      scores
    }
  }

  let direction = 'calm'
  let maxScore = 0
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      direction = category
    }
  }

  const intensity = Math.min(1, totalMatches / 5)
  const confidence = Math.min(1, totalMatches / 3)

  return { direction, intensity, keywords: matchedKeywords, confidence, scores }
}

function fuseEmotionData(sliderValue, textAnalysis) {
  const sliderNormalized = sliderValue / 100

  let sliderDirection
  if (sliderNormalized >= 0.65) sliderDirection = 'bright'
  else if (sliderNormalized >= 0.35) sliderDirection = 'calm'
  else sliderDirection = 'deep'

  const textWeight = 0.6
  const sliderWeight = 0.4

  let finalDirection
  if (textAnalysis.confidence > 0.5) {
    finalDirection = textAnalysis.direction
  } else {
    finalDirection = sliderDirection
  }

  const textIntensity = textAnalysis.intensity || 0.5
  const sliderIntensity = Math.abs(sliderNormalized - 0.5) * 2
  const emotionIntensity = Math.round(
    (textIntensity * textWeight + sliderIntensity * sliderWeight) * 100
  )

  const efi = Math.round(Math.abs(sliderNormalized - textIntensity) * 100)

  const eii = Math.round(
    (textAnalysis.confidence * textWeight + sliderIntensity * sliderWeight) * 100
  )

  let concentrationBase
  switch (finalDirection) {
    case 'deep': concentrationBase = 60 + Math.round(emotionIntensity * 0.3); break
    case 'calm': concentrationBase = 30 + Math.round(emotionIntensity * 0.3); break
    case 'bright': concentrationBase = 20 + Math.round(emotionIntensity * 0.3); break
    default: concentrationBase = 40
  }
  const concentration = Math.min(95, Math.max(10, concentrationBase))

  return {
    direction: finalDirection,
    sliderValue,
    emotionIntensity: Math.min(100, emotionIntensity),
    emotionFluctuation: Math.min(100, efi),
    emotionIndex: Math.min(100, eii),
    concentration,
    keywords: textAnalysis.keywords || [],
    confidence: textAnalysis.confidence || 0,
    timestamp: Date.now()
  }
}

function getRandomText(sliderValue) {
  let category
  if (sliderValue >= 65) category = 'bright'
  else if (sliderValue >= 35) category = 'calm'
  else category = 'deep'

  const texts = RANDOM_TEXTS[category]
  const idx = Math.floor(Math.random() * texts.length)
  return texts[idx]
}

function getEmotionColor(direction) {
  const colors = {
    bright: {
      primary: '#FF9F43',
      secondary: '#FECA57',
      gradient: ['#FF9F43', '#FFD700', '#FFA502'],
      liquid: '#FF9F43',
      glow: 'rgba(255, 159, 67, 0.3)'
    },
    calm: {
      primary: '#4ECDC4',
      secondary: '#48DBFB',
      gradient: ['#4ECDC4', '#0ABDE3', '#7ED6DF'],
      liquid: '#4ECDC4',
      glow: 'rgba(78, 205, 196, 0.3)'
    },
    deep: {
      primary: '#A855F7',
      secondary: '#6C5CE7',
      gradient: ['#A855F7', '#8B5CF6', '#DC143C'],
      liquid: '#A855F7',
      glow: 'rgba(168, 85, 247, 0.3)'
    }
  }
  return colors[direction] || colors.calm
}

function getEmotionLabel(direction) {
  const labels = {
    bright: { cn: '明亮', en: 'Bright', emoji: '☀️' },
    calm: { cn: '平静', en: 'Calm', emoji: '🌊' },
    deep: { cn: '深沉', en: 'Deep', emoji: '🌙' }
  }
  return labels[direction] || labels.calm
}

module.exports = {
  analyzeText,
  fuseEmotionData,
  getRandomText,
  getEmotionColor,
  getEmotionLabel,
  EMOTION_KEYWORDS,
  RANDOM_TEXTS
}
