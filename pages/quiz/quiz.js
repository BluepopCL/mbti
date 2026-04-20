const { QUIZ_QUESTIONS } = require('../../utils/constants.js');
const app = getApp();

Page({
  data: {
    currentIndex: 0,
    total: QUIZ_QUESTIONS.length,
    question: QUIZ_QUESTIONS[0],
    scores: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0, A: 0, Tu: 0 }
  },
  
  handleAnswer(e) {
    const val = parseInt(e.currentTarget.dataset.val);
    const { currentIndex, scores, question, total } = this.data;
    
    const [left, right] = question.dimension.split('/');
    const scoreVal = val * question.direction;
    let newScores = { ...scores };
    
    if (scoreVal > 0) {
      newScores[left] += Math.abs(scoreVal);
    } else if (scoreVal < 0) {
      newScores[right] += Math.abs(scoreVal);
    }
    
    if (currentIndex < total - 1) {
      // 震动反馈
      wx.vibrateShort({ type: 'light' });
      this.setData({
        scores: newScores,
        currentIndex: currentIndex + 1,
        question: QUIZ_QUESTIONS[currentIndex + 1]
      });
    } else {
      wx.vibrateShort({ type: 'medium' });
      app.globalData.scores = newScores;
      wx.redirectTo({
        url: '/pages/result/result'
      });
    }
  }
});
