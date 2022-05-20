// page/search/index.js
wx.cloud.init()
const app = getApp()
const db = wx.cloud.database()
let openid
Page({

  /**
   * 页面的初始数据
   */
  data: {
    allCustomersTemp: [],
    searchState: [],
    noteResult: [],
    fileResult: [],
    extClass: "",
    focus: false,
    fileSrc: '',
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
   * 取消搜索，返回主页面
   */
  hideInput: function () {
    wx.navigateBack({
      delta: 0,
    })
  },

  clearInput: function () {
    this.setData({
      inputValue: "",
      focus: false,
      result:[]
    });
  },

  inputTyping: function (e) {
    let that = this
    //输入搜索框的数据
    let searchState = that.data.searchState
    this.setData({
      inputValue: e.detail.value
    });
    let search = that.data.inputValue
    console.log(search)
    db.collection('hn_notes').where({
      _openid: openid,
      hn_notes_title: db.RegExp({ //正则表达式进行模糊查询搜索
        regexp: '.*' + search, //从搜索栏获取的value值作为规则进行匹配
        options: 'i', //不区分大小写
      })
    }).limit(20)
    .get({
      success:(res) => {
        console.log(res.data)
        that.setData({
          noteResult: res.data
        })
      }
    })
    db.collection('hn_files').where({
      _openid: openid,
      hn_files_title: db.RegExp({ //正则表达式进行模糊查询搜索
        regexp: '.*' + search, //从搜索栏获取的value值作为规则进行匹配
        options: 'i', //不区分大小写
      })
    }).limit(20)
    .get({
      success:(res) => {
        console.log(res.data)
        that.setData({
          fileResult: res.data
        })
      }
    })
  },
  //预览笔记
  openNote: function (e) {
    let that = this
    let id = parseInt(e.currentTarget.dataset.index)
    let noteid = that.data.noteResult[id]._id
    wx.navigateTo({
      url: '../addNote/index?type=false&id=' + noteid,
    })
  },
  //下载预览文件
  openFile(res) {
    let that = this
    let id = parseInt(res.currentTarget.dataset.index)
    let fileid = that.data.fileResult[id].fileID
    console.log(fileid)
    //获取云存储的文件路径
    wx.cloud.getTempFileURL({
      fileList: [fileid],
      success: (res) => {
        console.log(res.fileList)
        that.setData({
          fileSrc: res.fileList[0].tempFileURL
        })
        console.log("获取成功:",this.data.fileSrc)
        //根据https路径可以获得http格式的路径(指定文件下载后存储的路径 (本地路径)),根据这个路径可以预览
        wx.downloadFile({
          url: that.data.fileSrc,
          success: (res) => {
            that.setData({
              httpfile: res.tempFilePath
            })
            //预览文件
            wx.openDocument({
              filePath: that.data.httpfile,
              success: res => {
              },
              fail: err => {
                console.log(err)
                wx.showToast({
                  title: '该文件类型暂不支持在线查看',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          },
          fail: (err) => {
            console.log('读取失败', err)
          }
        })
      },
      fail: err => {
        console.log(err);
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
