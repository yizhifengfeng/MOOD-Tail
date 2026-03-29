const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-9g5ad152cea1ad94' })
const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const { payload } = event

  if (!payload) {
    return { success: false, error: '数据缺失' }
  }

  try {
    const record = {
      openid: wxContext.OPENID,
      cocktail: payload.cocktail || {},
      emotionData: payload.emotionData || {},
      emotionText: payload.emotionText || '',
      sliderValue: payload.sliderValue || 50,
      savedAt: db.serverDate(),
      createdAt: Date.now()
    }

    const result = await db.collection('cocktails').add({ data: record })

    try {
      await db.collection('users').where({
        openid: wxContext.OPENID
      }).update({
        data: {
          cocktailCount: db.command.inc(1),
          lastSavedAt: db.serverDate()
        }
      })
    } catch (e) {
      console.warn('更新用户统计失败', e)
    }

    return {
      success: true,
      data: { id: result._id }
    }
  } catch (err) {
    console.error('保存失败', err)
    return { success: false, error: err.message }
  }
}
