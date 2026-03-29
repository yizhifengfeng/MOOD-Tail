const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/**
 * 情绪分析云函数
 * 接收用户文本和滑块值，进行NLP分析后返回融合情绪数据
 * 可对接第三方NLP API（百度NLP、腾讯NLP等）
 */

const EMOTION_KEYWORDS = {
  bright: {
    keywords: ['开心', '快乐', '兴奋', '激动', '喜悦', '幸福', '美好', '期待', '惊喜', '甜蜜', '温暖', '灿烂', '阳光', '活力', '热情', '欢乐', '满足', '愉快', '畅快', '自在'],
    baseScore: 0.85
  },
  calm: {
    keywords: ['平静', '安宁', '放松', '舒适', '宁静', '淡然', '从容', '闲适', '悠闲', '恬静', '祥和', '惬意', '缓和', '慵懒', '休息', '沉淀', '冥想', '安逸', '柔和', '自然'],
    baseScore: 0.5
  },
  deep: {
    keywords: ['疲惫', '累', '沉重', '压力', '低落', '忧伤', '思念', '孤独', '迷茫', '焦虑', '伤感', '遗憾', '失落', '沉默', '黑暗', '痛苦', '难过', '烦躁', '挣扎', '疲倦', '消沉', '无力', '沮丧'],
    baseScore: 0.2
  }
}

function localAnalyze(text) {
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

  const total = scores.bright + scores.calm + scores.deep
  if (total === 0) {
    return { direction: 'calm', intensity: 0.5, keywords: [], confidence: 0.3 }
  }

  let direction = 'calm'
  let maxScore = 0
  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) { maxScore = score; direction = cat }
  }

  return {
    direction,
    intensity: Math.min(1, total / 5),
    keywords: matchedKeywords,
    confidence: Math.min(1, total / 3),
    scores
  }
}

function fuseData(sliderValue, textAnalysis) {
  const sliderNorm = sliderValue / 100
  let sliderDir = sliderNorm >= 0.65 ? 'bright' : sliderNorm >= 0.35 ? 'calm' : 'deep'

  const tw = 0.6, sw = 0.4
  const finalDirection = textAnalysis.confidence > 0.5 ? textAnalysis.direction : sliderDir

  const textInt = textAnalysis.intensity || 0.5
  const sliderInt = Math.abs(sliderNorm - 0.5) * 2
  const emotionIntensity = Math.round((textInt * tw + sliderInt * sw) * 100)
  const efi = Math.round(Math.abs(sliderNorm - textInt) * 100)
  const eii = Math.round((textAnalysis.confidence * tw + sliderInt * sw) * 100)

  let concBase
  switch (finalDirection) {
    case 'deep': concBase = 60 + Math.round(emotionIntensity * 0.3); break
    case 'calm': concBase = 30 + Math.round(emotionIntensity * 0.3); break
    case 'bright': concBase = 20 + Math.round(emotionIntensity * 0.3); break
    default: concBase = 40
  }

  return {
    direction: finalDirection,
    sliderValue,
    emotionIntensity: Math.min(100, emotionIntensity),
    emotionFluctuation: Math.min(100, efi),
    emotionIndex: Math.min(100, eii),
    concentration: Math.min(95, Math.max(10, concBase)),
    keywords: textAnalysis.keywords || [],
    confidence: textAnalysis.confidence || 0,
    timestamp: Date.now()
  }
}

exports.main = async (event) => {
  const { text, sliderValue } = event

  if (!text || typeof sliderValue !== 'number') {
    return { success: false, error: '参数缺失' }
  }

  try {
    // 此处可替换为第三方NLP API调用
    // const nlpResult = await callExternalNLP(text)
    const textAnalysis = localAnalyze(text)
    const emotionData = fuseData(sliderValue, textAnalysis)

    return { success: true, data: emotionData }
  } catch (err) {
    console.error('情绪分析失败', err)
    return { success: false, error: err.message }
  }
}
