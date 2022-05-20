// page/addNote/index.js
wx.cloud.init()
const app = getApp()
const db = wx.cloud.database()
let openid
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formats: {},
    readOnly: false,
    placeholder: '点击开始书写',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    noteTitle: "",
    noteContent: "",
    listid: "",
    isNew: true,
    focus: false,
    fileIDArr: [],
    noteList: [],
    renderedByHtml: false,
  },

  /**
   * 判断标题是否为空
   */

  /**
   * 是否只读
   */
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options.type)
    if (options.type) {
      console.log(options)
      let isnew = JSON.parse(options.type)
      this.setData({isNew: isnew,listid: options.id})
      this.editNoteList()
    }
    //调用函数获取openid
    app.getUserOpenIdViaCloud().then(res=>{
      // console.log(res)
      openid = res
      console.log(openid)
    })
    let that = this
    // let item = that.data.item
    // item.key = options.key
    // that.setData({item:item})
    // console.log(item)
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({ isIOS})
    this.updatePosition(0)
    let keyboardHeight = 0
    //获取键盘高度
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)
    })
  },
  //根据键盘高度设置键盘弹起时输入框高度
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const topbarHeight = 100
    const { windowHeight, platform } = wx.getSystemInfoSync()
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight - topbarHeight) : (windowHeight - toolbarHeight - topbarHeight)
    this.setData({ editorHeight, keyboardHeight })
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const { statusBarHeight, platform } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  onEditorReady() {
    const that = this
    //编辑器初始化完成时触发
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
      that.setContents(that.data.noteContent)
    }).exec()
  },
  blur() {//失焦
    this.editorCtx.blur()
  },
  format(e) {
    let { name, value } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)

  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log("clear success")
      }
    })
  },
  setContents(richText) {
    this.editorCtx.setContents({
      html: richText,
      success: (res) => {
        console.log("获取成功",res)
      }
    })
  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({ formats })
  },
  //插入分割线
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      }
    })
  },
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    })
  },
  insertImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const date = new Date(new Date().getTime())
        const formatDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        // tempFilePath可以作为img标签的src属性显示图片
        // const tempFilePaths = res.tempFilePaths
        const filePath = res.tempFilePaths[0]
        console.log(filePath)
        //存储在云存储的地址
        let openidPath = openid + '/'
        const cloudPath = 'img/' + openidPath + formatDate
        wx.showLoading({
          title: '上传云端中',
        })
        //获取fileID
        wx.cloud.uploadFile ({
          cloudPath: cloudPath,
          filePath: filePath,
          success: (res) => {
            //存储fileID
            console.log("上传成功！")
            that.editorCtx.insertImage({
              src: res.fileID,
              data: {
                id: 'image',
                role: 'god'
              },
              width: '80%',
              success: function () {
                wx.hideLoading()
                console.log('insert image success')
              }
            })
          }
        })  
      }
    })
  },
  //监听输入文本插入的图片，存在数组中与云端的图片数组作比较，找出不存在的图片并从云端删除
  inputChange: function (e) {
    const that = this
    // console.log(e)
    let fileIDArr = this.data.fileIDArr
    let arr = []
    e.detail.delta.ops.forEach(item => {
      console.log(item.insert)
      if (item.insert.image) {
        arr.push(item.insert.image)
      }
    })
    if (fileIDArr.length > arr.length) {
      fileIDArr.forEach((item,idx) => {
        let index = arr.findIndex(res => res == item)
        if (index == -1) {
          wx.showLoading({
            title: '上传云端中',
          })
          wx.cloud.deleteFile({
            fileList: [item],
            success: (res) => {
              wx.hideLoading()
              console.log("删除数据成功：", res.fileList)
            },
            fail: err => {
              // handle error
              console.error("删除失败", err)
            }
          })
        }
      })
    }
    that.setData({
      content: e.detail.html,
      fileIDArr: arr
    })
  },
  /**
   * 
   * 获取时间戳函数
   */
  timeStamp(value) {
    let date = new Date(value)
    let year = date.getFullYear()
    let month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
    let hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
    let minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
    let second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
    console.log(month)
    let resultDate = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second
    return resultDate
  },
  bindblur(res) {
    let that = this
    let today = new Date().getTime()
    console.log(that.timeStamp(today))
    const html = res.detail.html.replace(/wx:nodeid="\d+"/g,'');
    console.log(html)
    that.setData({
      noteContent: html
    })
    if (that.data.listid.length > 0) {
      db.collection('hn_notes').where({
        _id: that.data.listid
      }).update({
        data: {
          hn_notes_content: that.data.noteContent
        }
      })
    }
    else {
      db.collection('hn_notes').add({
        data: {
          hn_notes_title: that.data.noteTitle,
          hn_notes_content: that.data.noteContent,
          hn_create_date: that.timeStamp(today),
          isTouchMove: false
        },
        success: (res) => {
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          })
          console.log('笔记保存成功！',res)
          that.setData({
            listid: res._id
          })
          console.log(that.data.listid)
        },
        fail: err => {
          console.log('笔记保存失败！',err)
        }
      })
    }
    console.log(this.data.noteContent)
  },
  titleblur(res) {
    console.log(res.detail.value)
    this.setData({
      noteTitle: res.detail.value
    })
    this.onSave()
  },
  //
  editNoteList: function (e) {
    var that = this
    console.log(that.data.isNew)
    if (!that.data.isNew) {
      console.log(that.data.isNew)
      console.log(that.data.listid)
      db.collection('hn_notes').where({
        _id: that.data.listid
      }).get({
        //查询成功
        success: (res) => {
          console.log('getNoteList：', res.data)
          that.setData({
            noteList: res.data
          })
          let noteList = that.data.noteList
          that.setData({
            renderedByHtml: true,
            noteTitle: noteList[0].hn_notes_title,
            noteContent: noteList[0].hn_notes_content,
            htmlSnip: noteList[0].hn_notes_content
          })
          wx.createSelectorQuery().select('#editor').context((res) => {
            if (!res) {
              return
            }
            res.context.setContents({
              html: that.data.noteContent
            })
            console.log(res)
          }).exec()
          
        },
      })
    }
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
   * 保存数据事件
   */
  // onSave: function (event) {
  //   let item = this.data.item
  //   item.value.title = event.detail.value.title
  //   item.value.content = event.detail.value.content
  //   console.log(item)
  //   this.setData({
  //     item: item
  //   })
  //   this.saveData()
  // },
  onSave: function (e) {
    let that = this
    let noteContent = that.data.noteContent
    // console.log(noteContent)
    const today = new Date()
    const date = new Date(today.getTime())
    const formatDate = that.timeStamp(date)
    console.log(formatDate)
    if (that.data.noteTitle === '') {
      that.setData({
        noteTitle: formatDate
      })
    } else {
      that.setData({
        noteTitle: that.data.noteTitle
      })
    }
    console.log(that.data.noteTitle)
    if (that.data.listid.length > 0) {
      if (noteContent.length > 0) {
        db.collection('hn_notes').where({
          _id: that.data.listid
        }).update({
          data: {
            hn_notes_title: that.data.noteTitle,
            hn_notes_content: noteContent
          }
        })
      }
      else {
        db.collection('hn_notes').add({
          data: {
            hn_notes_title: that.data.noteTitle,
            hn_notes_content: noteContent,
            hn_create_date: formatDate,
            isTouchMove: false
          },
          success: (res) => {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
            console.log('笔记保存成功！',res)
          },
          fail: err => {
            console.log('笔记保存失败！',err)
          }
        })
      }
    }
  },
  onFocus: function (e) {
    this.setData({
      focus: true
    })
  },
  /**
   * 请求服务器保存数据
   */
  // saveData: function () {
  //   let item = this.data.item
  //   let now = Date.parse(new Date()) / 1000
  //   item.update_time = now
  //   this.setData({item: item})
  //   const db = wx.cloud.database()
  //   db.collection('hn_notes').add({})
  // },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    //在退出页面实现自动保存
    let that = this
    that.onSave()
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