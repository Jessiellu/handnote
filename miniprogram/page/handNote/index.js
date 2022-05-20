// page/handNote/index.js
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
        name: "笔记",
        isActive: true
      },
      {
        id: 1,
        name: "文件",
        isActive: false
      }
    ],
    noteList: [],
    // openid: '',
    iconSrc: [],
    fileid:'',
    fileName: '',
    fileDate: '',
    fileList: [],
    fileSrc: '',
    // 设置列表活动块开始的位置
    startX: 0,
    startY: 0,
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
      this.getFileList()
    })
  },
  /**
   * 自定义事件
   * 用来接收子组件传递的数据的
   */
  handleItemChange (e) {
    //接收传递过来的参数
    const {index}=e.detail;
    let {tabs} = this.data;
    tabs.forEach((sectionChooes,sectionInit)=>
      sectionInit===index?sectionChooes.isActive=true:sectionChooes.isActive=false
    );
    this.setData({tabs})
    this.getFileList()
  },
  /**
   * 用来监听浮动添加按钮点击事件，触发跳转页面
   */
  bindClickBtnNote: function () {
    //接收传递过来的参数
    this.setData({addurl})
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

    let resultDate = year + "-" + month + "-" + day + " " + hour + ":" + minute
    return resultDate
  },
  /**
   * 从聊天记录中选择文件
   * @param {number} count 可选择数量（0-100）
   * @param {string} type 可选择文件类型 all:全部类型 video:仅视频 image:仅图片 file:除了视频、图片外的文件类型
   * 上传按钮点击监听
   */
  uploadFile(res) {
    let that = this
    wx.chooseMessageFile({
      count: 1,
      extension: ['.doc', '.DOC', '.docx', '.DOCX',
      '.xls', '.xlsx', '.XLS', '.XLSX', '.csv',
      '.ppt', '.PPT', '.pptx', '.pps', '.ppsx', '.ppa', '.ppam', '.pot', '.potx', '.thmx',
      '.pdf', '.zip', '.raz'],//文件后缀名
      type: 'file',
      success: (res) => {
        // console.log('获得的openid：', openid)
        //文件临时路径
        const tempFilePaths = res.tempFiles
        let tempFile = tempFilePaths[0]
        // let extension = tempFilePaths.match(/\.[^.]+?$/)[0]//正则表达式返回文件的扩展名
        let openidPath = openid + '/'
        let date = new Date().getTime()
        //存储在云存储的地址
        const cloudPath = 'file/' + openidPath + this.timeStamp(date) + '-' + tempFile.name
        // console.log(cloudPath)
        // console.log(tempFile.name)
        wx.showLoading({
          title: '上传中',
        })
        //获取fileID
        wx.cloud.uploadFile ({
          cloudPath: cloudPath,
          filePath: tempFile.path,
          success: (res) => {
            //存储fileID
            var that = this
            console.log("上传成功！")
            // console.log(res.fileID)
            that.setData({
              fileid: res.fileID,
              fileName: tempFile.name,
              fileDate: this.timeStamp(date),
            })
            let fileID = res.fileID
            let fileName = tempFile.name
            let fileDate = this.timeStamp(date)
            // console.log(fileName)
            // console.log(fileDate)
            // console.log(fileid)
            wx.hideLoading()
            //no
            db.collection('hn_files').add({
              data: {
                fileID: fileID,
                hn_create_date: fileDate,
                hn_files_title: fileName,
                isTouchMove: false
              },
              success: (res) => {
                wx.showToast({
                  title: '上传成功',
                  icon: 'success',
                  duration: 2000
                })
                this.getFileList()
                console.log('上传文件信息保存成功！',res)
              },
              fail: err => {
                console.log('上传文件信息保存失败！',err)
              }
            })
          },
          fail: (err) => {
            console.log("上传失败！", err)
            wx.showToast({
              title: '上传失败',
              icon: 'error',
              duration: 2000
            })
          },
        })
      },
      fail: (err) => {
        console.log("选取失败！", err)
        wx.showToast({
          title: '选取失败',
          icon: 'error',
          duration: 2000
        })
      },
    })
  },
  /**
   * 这里最主要的就是先设置变量_this = this,
   * 这里因为this是希望它指向的是pages这个对象，并且调用有this.setData函数也是想对pages里面data里的数据进行修改，
   * 但是如果我们不提前设置变量来存储指向pages的指针，那么我们进入db.get函数里面this指向的就是db这个对象，
   * 因此这里要十分注意！！！
   */
  getFileList: function (res) {
    let that = this
    let db_name
    let tab = that.data.tabs
    tab.forEach((v, i) => {
      if (v.isActive) {
        console.log(v.name)
        if(v.name === "笔记") {db_name = 'hn_notes'}
        else if(v.name === "文件") {db_name = 'hn_files'}
        //查数据库数据集列表
        db.collection(db_name).where({
          _openid: openid
        }).orderBy('hn_create_date', 'desc').get({
          //查询成功
          success: (res) => {
            console.log(openid)
            console.log(db_name)
            console.log('getFileList：', res.data)
            if(db_name === 'hn_notes') {
              that.setData({
                noteList: res.data
              })
              console.log("noteList数据：",this.data.noteList)
            }
            else if(db_name === 'hn_files') {
              that.setData({
                fileList: res.data,
              })
              console.log("fileList数据：",this.data.fileList)
              let fileList = this.data.fileList
              let iconList = []
              for (let index = 0; index < fileList.length; index++) {
                let fileTitle = fileList[index].hn_files_title; 
                let s = fileTitle.indexOf('.')
                let type = fileTitle.substring(s+1)
                console.log(type)
                let icon
                switch (type){
                  case "pdf":
                    icon= 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/files_icon/PDF.png';
                  break;
                  case "doc":
                  case "docx":
                    icon= 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/files_icon/WORD.png';
                  break;
                  case "xls":
                  case "xlsx":
                    icon= 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/files_icon/ECEL.png';
                  break;
                  case "csv":
                    icon= 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/files_icon/CSV.png';
                  break;
                  case "ppt":
                  case"pptx":
                    icon= 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/files_icon/PPT.png';
                  break;
                  case "txt":
                    icon= 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/files_icon/TET.png';
                  break;
                  case "zip":
                    icon= 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/files_icon/ZIP.png';
                  break;
                  default:
                    icon= 'https://636c-cloud1-4gkaffo6e431e7b1-1310032109.tcb.qcloud.la/icon/files_icon/file.png';
                  break;   
                }
                iconList[index] = icon
                console.log(iconList[index])
              }
              this.setData({
                iconSrc: iconList
              })
            }
          },
          fail: (err) => {
            console.log("查询失败！", err)
          }
        })
      }
    })  
  },

  /**
   * 预览文件 openFile
   * 下载文件 downloadFile
   * 根据获得的field来通过wx.cloud.getTempFileURL去获得云存储的文件，
   * 然后再调用wx.downloadFile和wx.openDocument去实现预览。
   */
  openFile(res) {
    let that = this
    let id = parseInt(res.currentTarget.dataset.index)
    console.log(that.data.fileList[id])
    let fileid = that.data.fileList[id].fileID
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
  //下载
  downloadFile(e) {
    console.log("获取成功:",this.data.fileSrc)
    wx.setClipboardData({
      data: this.data.fileSrc,
      success (res) {
        wx.getClipboardData({
          success (res) {
            console.log(res.data) // data
            wx.showToast({
              title: '下载链接已复制',
              icon: 'none'
            })
          }
        })
        
      }
    })
  },
  // 删除
  deleteBtn(e) {
    let that = this
    let id = parseInt(e.currentTarget.dataset.index)
    let fileid = this.data.fileList[id].fileID
    wx.showModal({
      title: '提示',
      content: '此操作将永久删除文件，是否继续？',
      cancelColor: 'cancelColor',
      success: (res) => {
        if (res.confirm) {
          console.log("确认删除")
          //查数据库数据集列表
          db.collection('hn_files').where({
            fileID: fileid
          }).remove({
            //查询成功
            success: (res) => {
              console.log("删除成功！数据：",this.data.fileList)
              wx.cloud.deleteFile({
                fileList: [fileid],
                success: res => {
                  // handle success
                  console.log("删除数据成功：", res.fileList)
                  that.getFileList()
                },
                fail: err => {
                  // handle error
                  console.error("删除失败", err)
                }
              })
            },
            fail: (err) => {
            console.log("删除失败！", err)
            }
          })
        }
      }
    })
    that.getFileList()
  },
  /* 滑动代码开始 */
  // 手指触摸动作开始
  touchStart(e) {
    let that = this
    console.log('--- touchStart ---', e);
    let List
    let tab = that.data.tabs
    tab.forEach((v, i) => {
      if (v.isActive) {
        if(v.name === "笔记") {List = that.data.noteList}
        else if(v.name === "文件") {List = that.data.fileList}
      }
    })
    console.log(List)
    List.forEach((v, i) => {
      console.log(v.isTouchMove)
      if (v.isTouchMove) {
        v.isTouchMove = false;
      }
    })
    that.setData({
      fileList: that.data.fileList,
      noteList: that.data.noteList,
      startX: e.touches[0].clientX, //记录开始X坐标
      startY: e.touches[0].clientY  //记录开始Y坐标
    })
  },

  // 手指触摸后移动
  touchMove(e) {
    console.log('--- touchMove ---', e)
    let that = this,
      indexItem = e.currentTarget.dataset.index,//当前item下标
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      moveX = e.changedTouches[0].clientX,//滑动X坐标
      moveY = e.changedTouches[0].clientY,//滑动Y坐标
      // fileList = that.data.fileList,
      // noteList = that.data.noteList,
      // 获取滑动角度
      angle = that.angle({
        X: startX,
        Y: startY
      }, {
        X: moveX,
        Y: moveY
      }),
      List,
      tab = that.data.tabs;
    tab.forEach((v, i) => {
      if (v.isActive) {
        if(v.name === "笔记") {List = that.data.noteList}
        else if(v.name === "文件") {List = that.data.fileList}
      }
    })
    // 判断滑动角度 v数组对象，i遍历下标
    List.forEach((v, i) => {
      v.isTouchMove = false
      // 如果滑动的角度大于30° 则直接return；
      if (Math.abs(angle) > 30) {
        return;
      }
      if (i === indexItem) {
        if (moveX > startX) { // 右滑
          v.isTouchMove = false
        } else { // 左滑
          v.isTouchMove = true
        }
      }
    })
    //更新数据
    that.setData({
      fileList: that.data.fileList,
      noteList: that.data.noteList
    })
  },

  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
  */
  angle: function (start, end) {
    var _X = end.X - start.X,
    _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  
  /**滑动代码结束 */
  /**
   * 编辑笔记，跳转页面并传值
   */
  editNote: function (e) {
    let that = this
    let id = parseInt(e.currentTarget.dataset.index)
    let noteid = that.data.noteList[id]._id
    // console.log(that.data.noteList[id])
    wx.navigateTo({
      url: '../addNote/index?type=false&id=' + noteid,
    })
  },
  //删除笔记
  deleteNote(e) {
    let that = this
    let id = parseInt(e.currentTarget.dataset.index)
    let noteid = that.data.noteList[id]._id
    console.log(noteid)
    wx.showModal({
      title: '提示',
      content: '此操作将永久删除笔记，是否继续？',
      cancelColor: 'cancelColor',
      success: (res) => {
        if (res.confirm) {
          console.log("确认删除")
          //查数据库数据集列表
          db.collection('hn_notes').where({
            _id: noteid
          }).remove({
            //查询成功
            success: (res) => {
              console.log("删除成功！数据：",this.data.noteList)
            },
            fail: (err) => {
            console.log("删除失败！", err)
            }
          })
        }
      }
    })
    that.getFileList()
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
    this.getFileList()
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