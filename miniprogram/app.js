const themeListeners = []
global.isDemo = true
App({
  globalData: {
    theme: wx.getSystemInfoSync().theme,
    hasLogin: false,
    openid: null,
    iconTabbar: '/page/weui/example/images/icon_tabbar.png',
  },
  onLaunch(opts, data) {
    // const that = this;
    // const canIUseSetBackgroundFetchToken = wx.canIUse('setBackgroundFetchToken')
    // if (canIUseSetBackgroundFetchToken) {
    //   wx.setBackgroundFetchToken({
    //     token: 'getBackgroundFetchToken',
    //   })
    // }
    // if (wx.getBackgroundFetchData) {
    //   wx.getBackgroundFetchData({
    //     fetchType: 'pre',
    //     success(res) {
    //       that.globalData.backgroundFetchData  = res;
    //       console.log('读取预拉取数据成功')
    //     },
    //     fail() {
    //       console.log('读取预拉取数据失败')
    //       wx.showToast({
    //         title: '无缓存数据',
    //         icon: 'none'
    //       })
    //     },
    //     complete() {
    //       console.log('结束读取')
    //     }
    //   })
    // }
    //初始化加载，先判断用户登录状态
    if (wx.getStorageSync('hn_user')) {
      wx.switchTab({
        url: './page/handNote/index',
      })
    } else {
      wx.reLaunch({
        url: './page/login/index',
      })
    }
    console.log('App Launch', opts)
    if (data && data.path) {
      wx.navigateTo({
        url: data.path,
      })
    }
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-4gkaffo6e431e7b1',
        traceUser: true,
      })
      
    }
    this.openid = (function(that){
      return new Promise((resolve, reject) =>{
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: res => {
            that.globalData.openid = res.result.openid
            resolve(res.result.openid)
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err)
          }
        })
      })
    })(this)
  },
  
  onShow(opts) {
    console.log('App Show', opts)
    // console.log(wx.getSystemInfoSync())
  },
  onHide() {
    console.log('App Hide')
  },
  onThemeChange({ theme }) {
    this.globalData.theme = theme
    themeListeners.forEach((listener) => {
        listener(theme)
    })
  },
  watchThemeChange(listener) {
      if (themeListeners.indexOf(listener) < 0) {
          themeListeners.push(listener)
      }
  },
  unWatchThemeChange(listener) {
      const index = themeListeners.indexOf(listener)
      if (index > -1) {
          themeListeners.splice(index, 1)
      }
  },
  
  // lazy loading openid
  getUserOpenId(callback) {
    const that = this

    if (that.globalData.openid) {
      callback(null, that.globalData.openid)
    } else {
      wx.login({
        success(data) {
          wx.cloud.callFunction({
            name: 'getOpenid',
            data: {
              action: 'openid'
            },
            success: res => {
              console.log('拉取openid成功', res)
              that.globalData.openid = res.result.openid
              callback(null, that.globalData.openid)
            },
            fail: err => {
              console.log('拉取用户openid失败，将无法正常使用开放接口等服务', res)
              callback(res)
            }
          })
        },
        fail(err) {
          console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
          callback(err)
        }
      })
    }
  },
  // 通过云函数获取用户 openid，支持回调或 Promise
  getUserOpenIdViaCloud: function () {
    return new Promise((resolve, reject) =>{
      wx.cloud.callFunction({
        name: 'login',
       data: {},
        success: res => {
          this.globalData.openid = res.result.openid
          resolve(res.result.openid)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    })
  }
})
