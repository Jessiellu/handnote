// page/personalCenter/index.js
//云数据库初始化
wx.cloud.init()
const db = wx.cloud.database()
const app = getApp()
let openid
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    // userInfo: {},
    hasUserInfo: false,
    // canIUseGetUserProfile: false,
    // canIUse: wx.canIUse('button.open-type.getUserInfo'),
    avatarUrl: "",
    nickName: "",
  },
  // onChooseAvatar(e) {
  //   const { avatarUrl } = e.detail 
  //   this.setData({
  //     avatarUrl,
  //   })
  // },
  // // 查看是否授权
  // jugdeUserLogin: function () {
  //   var that = this
  //   wx.getUserProfile({
  //     desc:'登录',
  //     success:(res)=>{
  //         that.data.user = res.userInfo;
  //         console.log(that.data.user)
  //         that.formSubmit();
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
    var that = this
    
    //调用函数获取openid
    app.getUserOpenIdViaCloud().then(res=>{
      // console.log(res)
      openid = res
      console.log(openid)
      that.onViewInfo()
    })
    // if (wx.getUserProfile) {
    //   this.setData({
    //     canIUseGetUserProfile: true
    //   })
    // }
  },
  getUserProfile(e) {
    wx.navigateTo({
      url: '../login/index',
    })
  },
  // getUserProfile(e) {
  //   // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
  //   // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
  //   wx.getUserProfile({
  //     desc: '用于完善个人资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
  //     success: (res) => {
  //       this.setData({
  //         userInfo: res.userInfo,
  //         hasUserInfo: true
  //       })
  //     }
  //   })
  // },
  onViewInfo(e) {
    let that = this
    //查询数据库
    db.collection('hn_user').where({
      _openid: openid
    }).get({
      success: (res) => {
        console.log(res.data)
        //赋值
        this.setData({
          hasUserInfo: true,
          avatarUrl: res.data[0].hn_user_avatarUrl,
          nickName: res.data[0].hn_user_nickName,
        })
        console.log(avatarUrl)
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