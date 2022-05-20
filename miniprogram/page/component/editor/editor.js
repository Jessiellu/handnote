// page/component/editor/editor.js
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    readOnly: false,
    placeholder: {
      type: String,
      value: '开始输入...'
    },
    editorHeight: {
      type: Number,
      value: '300',
    },
    keyboardHeight: {
      type: Number,
      value: '0'
    },
    isIOS: false
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    readOnlyChange() {
      this.setData({
        readOnly: !this.data.readOnly
      })
    },
    onLoad() {
      const platform = wx.getSystemInfoSync().platform
      const isIOS = platform === 'ios'
      this.setData({ isIOS})
      const that = this
      this.updatePosition(0)
      let keyboardHeight = 0
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
    updatePosition(keyboardHeight) {
      const toolbarHeight = 50
      const { windowHeight, platform } = wx.getSystemInfoSync()
      let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
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
      this.createSelectorQuery().select('#editor').context(function (res) {
        that.editorCtx = res.context
      }).exec()
    },
    blur() {
      this.editorCtx.blur()
    },
    format(e) {
      let { name, value } = e.target.dataset
      if (!name) return
      // console.log('format', name, value)
      this.editorCtx.format(name, value)
  
    },
    onStatusChange(e) {
      const formats = e.detail
      this.setData({ formats })
    },
    insertDivider() {
      this.editorCtx.insertDivider({
        success: function () {
          console.log('insert divider success')
        }
      })
    },
    clear() {
      this.editorCtx.clear({
        success: function (res) {
          console.log("clear success")
        }
      })
    },
    removeFormat() {
      this.editorCtx.removeFormat()
    },
    insertDate() {
      const date = new Date()
      const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
      this.editorCtx.insertText({
        text: formatDate
      })
    },
    insertImage() {
      const that = this
      wx.chooseImage({
        count: 1,
        success: function (res) {
          that.editorCtx.insertImage({
            src: res.tempFilePaths[0],
            data: {
              id: 'abcd',
              role: 'god'
            },
            width: '80%',
            success: function () {
              console.log('insert image success')
            }
          })
        }
      })
    },
}
})
