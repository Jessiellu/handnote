// page/component/TopBar/TopBar.js
Component({
  /**
   * 组件的属性列表
   * 存放的是，从父组件中接收的数据
   */
  properties: {
    tabs: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   * 1.页面.js文件中，存放事件回调函数，存放在data同层级下
   * 2.组件.js文件中，存放事件回调函数，必须要存放在methods中
   */
  methods: {
    /* 1.绑定点击事件 需要在methods中绑定 */
    hanldeItemTap(e) {
      /** 2.获取被点击的索引
       * console.log(e);
       */
      const {index} = e.currentTarget.dataset;
      /** 3.获取原数组
       * 解构：对复杂类型进行解构的时候，复制了一份变量的引用而已
       * 最严谨的做法，重新拷贝一份数组，再对这个数组的备份进行处理
       * let title=JSON.parse(JSON.stringify(this.data.title));
      */
    //  let {title} = this.data;//let title = this.data.title;
      /* 4.对数组循环
       *  - 给每一个循环项，选中属性改为false
       *  - 给当前的索引项，添加激活选中效果
       * [].forEach 遍历数组 修改sectionChooe，也会导致原数组被修改
       */
      // title.forEach((sectionChooes,sectionInit)=>
      // sectionInit===index?sectionChooes.isActive=true:sectionChooes.isActive=false
      // );
      // this.setData({title})
      /**5.点击事件触发 触发父组件中的自定义事件，同时传递数据给父组件
       * this.triggerEvent("父组件自定义事件的名称"，要传递的参数)
       */
      this.triggerEvent("itemChange",{index});
    }
  }
})
