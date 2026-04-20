const { PERSONALITIES } = require('../../utils/constants.js');
const app = getApp();

Page({
  data: {
    loading: true,
    errorMsg: null,
    scores: null,
    personality: null,
    variant: '',
    analysis: null
  },

  onLoad() {
    // 获取全局分数，如果由于刷新没取到则用mock分数兜底
    const scores = app.globalData.scores || { E: 5, I: 2, S: 4, N: 3, T: 6, F: 1, J: 5, P: 2, A: 6, Tu: 1 };
    
    // 1. 判断类型
    const typeStr = [
      scores.E >= scores.I ? 'E' : 'I',
      scores.S >= scores.N ? 'S' : 'N',
      scores.T >= scores.F ? 'T' : 'F',
      scores.J >= scores.P ? 'J' : 'P'
    ].join('').toLowerCase();
    
    // 2. 判定位阶 A/T
    const variantStr = scores.A >= scores.Tu ? 'A' : 'T';
    
    // 3. 匹配静态数据
    const pData = PERSONALITIES.find(p => p.id === typeStr) || PERSONALITIES[0];
    
    this.setData({
      scores,
      personality: pData,
      variant: variantStr
    });

    // 4. 调用远端 Gemini API
    this.fetchAnalysis(scores, typeStr, variantStr);
  },

  fetchAnalysis(scores, typeId, variant) {
    wx.request({
      // 此处必须使用公网部署的 Vercel 域名！目前暂时使用我在沙盒中的临时主域名供您体验
      url: 'https://ais-dev-vfydepmihxr43xoheehqv3-432743926294.asia-northeast1.run.app/api/analysis',
      method: 'POST',
      data: { scores, typeId, variant },
      success: (res) => {
        if (res.statusCode === 200 && res.data && !res.data.error) {
          this.setData({ analysis: res.data, loading: false });
          // 小程序震动提示生成完成
          wx.vibrateLong();
        } else {
          const apiMsg = res.data?.error || '';
          if (apiMsg.includes('429') || apiMsg.includes('quota')) {
            this.setData({ errorMsg: 'API服务调用人数过多，已达配额限制，请稍后再试。', loading: false });
          } else {
            this.setData({ errorMsg: 'API服务返回错误，请稍后再试。', loading: false });
          }
        }
      },
      fail: (err) => {
         console.error('Request fail:', err);
        this.setData({ errorMsg: '网络请求失败或域名未加入微信白名单。', loading: false });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: `测出来了！我的MBTI是 ${this.data.personality.id.toUpperCase()}-${this.data.variant}，快来看看！`,
      path: '/pages/index/index',
      imageUrl: this.data.personality.avatarUrl // 使用大头像作为转发图片
    }
  },

  goHome() {
    // 重置数据
    app.globalData.scores = {};
    wx.reLaunch({
      url: '/pages/index/index'
    });
  }
});
