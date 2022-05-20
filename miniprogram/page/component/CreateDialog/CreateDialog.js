// page/component/CreateDialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '标题'
    },
    canelText: {
      type: String,
      value: '取消'
    },
    confirmText: {
      type: String,
      value: '确定'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    confirmButtonTap: function () {
      this.setData({show:!1}),
      this.triggerEvent("confirm")
    },
    close:function(){
      this.setData({show:!1}),
      this.triggerEvent("close",{},{})
    },
    stopEvent:function(){}
  }
})
