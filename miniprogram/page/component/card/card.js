// page/component/card/card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object
    },
    imagesList: {
      type: Object
    }
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
    onTabNode(event) {
      const id = event.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/node/node?id=${id}',
      })
    }
  }
})
