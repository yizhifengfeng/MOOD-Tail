const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-9g5ad152cea1ad94' })
const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const { id } = event

  if (!id) {
    return { success: false, error: '缺少 id' }
  }

  try {
    const { data } = await db.collection('cocktails').doc(id).get()
    if (!data) {
      return { success: false, error: '记录不存在' }
    }
    if (data.openid !== wxContext.OPENID) {
      return { success: false, error: '无权删除' }
    }
    await db.collection('cocktails').doc(id).remove()
    return { success: true }
  } catch (err) {
    console.error('deleteCocktail', err)
    return { success: false, error: err.message || '删除失败' }
  }
}
