// page/createTask/index.js
wx.cloud.init()
const app = getApp()
const db = wx.cloud.database()
let openid
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customDialogShow: false,
    dialogShow: false,
    dialogTitle: '',
    dialogIcon: '',
    buttons: [{text: '取消'}, {text: '确定'}],
    template: [
      {
        id: 0,
        icon: 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/task_icon/read.png',
        title: '阅读',
        background: '#FF6666'
      },
      {
        id: 1,
        icon: 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/task_icon/en.png',
        title: '背单词',
        background: '#99CCFF'
      },
      {
        id: 2,
        icon: 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/task_icon/sport.png',
        title: '运动',
        background: '#99CC66'
      }
    ],
    taskTitle: '',
    taskDays: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //调用函数获取openid
    app.getUserOpenIdViaCloud().then(res=>{
      // console.log(res)
      openid = res
      console.log(openid)
    })
  },
  /**
   * 
   * 获取时间戳函数
   */
  timeStamp(value) {
    let date = new Date(value)
    let year = date.getFullYear()
    let month = "0" + (date.getMonth() + 1)
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()

    let resultDate = year + "-" + month + "-" + day
    return resultDate
  },
  /**
   * 
   * 获取输入的值
   */
  getTitle: function (e) {
    console.log(e.detail.value)
    console.log(e.detail.cursor)
    this.setData({
      taskTitle: e.detail.value
    })
  },
  getDays: function (e) {
    console.log(e.detail.value)
    console.log(e.detail.cursor)
    this.setData({
      taskDays: e.detail.value
    })
  },
  /**
   * 确认按钮
   */
  confirm: function (e) {
    let that = this,
    title = that.data.taskTitle,
    days = that.data.taskDays,
    date = new Date()
    console.log(title)
    console.log(days)
    console.log(this.timeStamp(date))
    db.collection('hn_check').add({
      data: {
        hn_check_title: title,
        hn_check_days: days,
        hn_check_count: 0,
        hn_check_startdate: this.timeStamp(date),
        hn_check_enddate: this.timeStamp(date),
        hn_check_on: false
      },
      success: (res) => {
        console.log('提交成功！',res)
      },
      fail: (err) => {
        console.err('提交失败！',err)
      }
    })
    wx.switchTab({
      url: '../../page/handList/index',
    })
  },
  /**
   * 点击添加事件监听
   * 自定义
   */
  onclickCustom:function (event) {
    this.setData({
      customDialogShow: true
    })
  },
  /**
   * 点击添加事件监听
   * 模板
   */
  onclickTemplate:function (e) {
    let id = parseInt(e.currentTarget.dataset.index)
    let {template} = this.data,
      list = template[id],
      title,icon
      console.log(list)
    template.forEach((v,i) =>{
      title = list.title
      icon = list.icon
    })
    
    this.setData({
      dialogShow: true,
      dialogTitle: title,
      dialogIcon: icon,
      taskTitle: title
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