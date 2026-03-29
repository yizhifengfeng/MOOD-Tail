const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()

  try {
    const historyResult = await db.collection('cocktails')
      .where({ openid: wxContext.OPENID })
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()

    const history = historyResult.data
    if (history.length === 0) {
      return {
        success: true,
        data: {
          recommendations: [],
          message: '还没有调制记录，先去调一杯吧！'
        }
      }
    }

    const directionCounts = { bright: 0, calm: 0, deep: 0 }
    history.forEach(item => {
      const dir = item.cocktail?.direction || item.emotionData?.direction || 'calm'
      if (directionCounts[dir] !== undefined) {
        directionCounts[dir]++
      }
    })

    let dominantDirection = 'calm'
    let maxCount = 0
    for (const [dir, count] of Object.entries(directionCounts)) {
      if (count > maxCount) {
        maxCount = count
        dominantDirection = dir
      }
    }

    let products = []
    try {
      const prodResult = await db.collection('products')
        .where({ direction: dominantDirection })
        .limit(5)
        .get()
      products = prodResult.data
    } catch (e) {
      // products collection may not exist yet
    }

    const directionLabels = {
      bright: '明亮活力',
      calm: '平静柔和',
      deep: '深沉浓郁'
    }

    const recommendations = [
      {
        type: 'insight',
        title: '你的情绪画像',
        content: `最近的 ${history.length} 杯特调中，你偏好「${directionLabels[dominantDirection]}」风格的酒品（${maxCount}次）。`
      },
      {
        type: 'suggestion',
        title: '推荐尝试',
        content: dominantDirection === 'deep'
          ? '你最近情绪偏深沉，不妨试试 Calm 系列，让味蕾带你放松。'
          : dominantDirection === 'bright'
            ? '你一直充满活力！偶尔试试 Deep 系列，感受不同的层次。'
            : '你的情绪很平衡，可以尝试 Bright 系列，增添一些活力。'
      }
    ]

    if (products.length > 0) {
      recommendations.push({
        type: 'products',
        title: '为你推荐的酒品',
        content: products.map(p => `${p.name}（${p.nameEn || p.category}）`).join('、')
      })
    }

    return {
      success: true,
      data: {
        recommendations,
        dominantDirection,
        directionCounts,
        totalCocktails: history.length
      }
    }

  } catch (err) {
    console.error('获取推荐失败', err)
    return { success: false, error: err.message }
  }
}
