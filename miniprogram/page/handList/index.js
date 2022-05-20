// page/handList/index.js
wx.cloud.init()
const app = getApp()
const db = wx.cloud.database()
let openid
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        name: "进行中",
        isActive: true
      },
      {
        id: 1,
        name: "已完成",
        isActive: false
      }
    ],
    checkList: [],
    completeList: [],
    list: [],
    iconSrc: [],
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
      this.getCheckList()
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
  /*监听tabbar点击事件*/
  handleItemChange (e) {
    //接收传递过来的参数
    const {index}=e.detail;
    let {tabs} = this.data;
    tabs.forEach((sectionChooes,sectionInit)=>
      sectionInit===index?sectionChooes.isActive=true:sectionChooes.isActive=false
    );
    this.setData({tabs})
  },
  /**
   * 用来监听浮动添加按钮点击事件，触发跳转页面
   */
  bindClickBtnNote: function () {
    //接收传递过来的参数
    this.setData({addurl})
  },
  /**
   * 获取打卡列表
   */
  getCheckList: function (e) {
    let that = this
    db.collection('hn_check').where({
      _openid: openid
    }).get({
      success: (res) => {
        console.log("checkList查询成功:",res.data)
        that.setData({
          checkList: res.data
        })
        let checkList = that.data.checkList
        let icon,iconList = []
        for (let index = 0; index < checkList.length; index++) {
          switch (checkList[index].hn_check_title) {
            case '阅读':
              icon = 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/task_icon/read.png';
              break;
            case '背单词':
              icon = 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/task_icon/en.png';
              break;
            case '运动':
              icon = 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/task_icon/sport.png';
              break;
            default:
              icon = 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/task_icon/task.png';
              break;
          }
          iconList[index] = icon
          if (checkList[index].hn_check_enddate != this.timeStamp(new Date())) {
            //指定返回结果中记录需返回的字段
            db.collection('hn_check').where({
              _id: checkList[index]._id
            }).update({
              data: {
                hn_check_on: false,
              },
            })
          }
          console.log(checkList[index])
        }
        that.setData({
          iconSrc: iconList
        })
      },
      fail: (err) => {
        console.error("查询失败！",err)
      }
    })
  },
  //判断今日是否打卡
  onCheck: function (res) {
    let that = this
    let id = parseInt(res.currentTarget.dataset.index)
    console.log(id)
    console.log(that.data.checkList[id]._id)
    let checkid = that.data.checkList[id]._id
    let date = new Date()
    let count = 0
    count = that.data.checkList[id].hn_check_count + 1
    db.collection('hn_check').where({
      _id : checkid
    }).update({
      data: {
        hn_check_count: count,
        hn_check_enddate: this.timeStamp(date),
        hn_check_on: true
      },
      success: (res) => {
        console.log('提交成功！',res)
      },
      fail: (err) => {
        console.err('提交失败！',err)
      }
    }) 
    this.onLoad()
  },
  /**
   * 修改背景颜色和icon
   */

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCheckList()
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