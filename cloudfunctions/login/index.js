const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID, UNIONID, APPID } = wxContext
  
  const db = cloud.database()
  const usersCollection = db.collection('users')
  
  try {
    const userRecord = await usersCollection.where({ openid: OPENID }).get()
    
    if (userRecord.data.length === 0) {
      await usersCollection.add({
        data: {
          openid: OPENID,
          unionid: UNIONID || '',
          appid: APPID,
          createdAt: db.serverDate(),
          lastLoginAt: db.serverDate(),
          cocktailCount: 0
        }
      })
    } else {
      await usersCollection.doc(userRecord.data[0]._id).update({
        data: { lastLoginAt: db.serverDate() }
      })
    }
    
    return {
      success: true,
      openid: OPENID,
      unionid: UNIONID
    }
  } catch (err) {
    console.error('登录处理失败', err)
    return {
      success: true,
      openid: OPENID
    }
  }
}
