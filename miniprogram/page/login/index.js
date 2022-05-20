wx.cloud.init()
const app = getApp()
console.log(app.globalData.openid)
const db = wx.cloud.database()
const userInfoList = db.collection('hn_user')
// page/login/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    /** 判断小程序的API，回调，参数，组件等是否在当前版本可用 */
    // isHide: false,
    // userlist: [],
    userInfo: {},
    // canIUseGetUserProfile: false,
    // canIUse: wx.canIUse('button.open-type.getUserInfo'),
    nickName: "",//保存昵称
    avatarUrl: "",//保存头像
  },

  // 查看是否授权
  // jugdeUserLogin: function () {
  //   var that = this
  //   wx.getUserProfile({
  //     desc:'登录',
  //     success:(res)=>{
  //       that.data.user = res.userInfo;
  //       console.log(that.data.user)
  //       that.formSubmit();
  //     },
  //     fail:(res)=>{
  //       // debugger
  //       console.log(res)
  //     }
  //   });
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // if (wx.getUserProfile) {
    //   this.onGetOpenid();
    // }
  },
  
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善个人资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        var that = this
        this.setData({
          userInfo: res.userInfo,
          nickName: that.data.userInfo.nickName,
          avatarUrl: that.data.userInfo.avatarUrl
        })
        console.log(this.data.userInfo)
        //缓存userInfo用来验证是否已经成功获取授权信息
        wx.setStorageSync('hn_user', res.userInfo)
        db.collection('hn_user').where({
          _openid: this.onGetOpenid.openid
        }).get({
          success: res => {
            console.log(res)
            //确保数据库只有一份该id用户的信息
            if (res.data.length == 0) {
              console.log("用户数据为0")
              db.collection('hn_user').add({
                data:{
                  _openid: openid,
                  hn_user_avatarUrl: that.data.userInfo.avatarUrl,
                  hn_user_nickName: that.data.userInfo.nickName,
                },
                success: res => {
                  console.log('用户信息已保存到数据库hn_user',res)
                },
                fail: err => {
                  console.log('用户信息保存失败！',res)
                }
              })
              //跳转主界面
              wx.navigateTo({
                url: '../handNote/index',//登录成功后要跳转的页面
              })
            } else {
              console.log("已经登录过不用授权")
              //缓存userInfo用来验证是否已经成功获取授权信息
              // wx.setStorageSync('hn_user', res.userInfo)
              wx.switchTab({
                url: '../handNote/index',
              })
            }
          },
          fail(res) {
            console.log('获取openid失败！',res)
          }
        })
      }
    })
  },
  onGetOpenid: function (e) {
    let that = this
    //调用云函数
    wx.cloud.callFunction({
      name: 'login', //云函数的名字
      success: (res) => {
        console.log('云函数获取到的openid：', res.result.openId)
        var openid = res.result.openId
        that.setData({
          openid: openid
        })
        console.log(openid)
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})