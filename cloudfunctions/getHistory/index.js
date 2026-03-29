const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const { page = 1, pageSize = 20 } = event

  try {
    const skip = (page - 1) * pageSize

    const countResult = await db.collection('cocktails')
      .where({ openid: wxContext.OPENID })
      .count()

    const listResult = await db.collection('cocktails')
      .where({ openid: wxContext.OPENID })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const list = listResult.data.map(item => ({
      id: item._id,
      name: item.cocktail?.name?.cn || item.cocktail?.name || '未命名特调',
      nameEn: item.cocktail?.name?.en || '',
      direction: item.cocktail?.direction || item.emotionData?.direction || 'calm',
      emotionText: item.emotionText || '',
      concentration: item.cocktail?.concentration || 50,
      savedAt: item.createdAt || item.savedAt,
      cocktail: item.cocktail,
      emotionData: item.emotionData
    }))

    return {
      success: true,
      data: {
        list,
        total: countResult.total,
        page,
        pageSize,
        hasMore: skip + listResult.data.length < countResult.total
      }
    }
  } catch (err) {
    console.error('获取历史记录失败', err)
    return { success: false, error: err.message }
  }
}
