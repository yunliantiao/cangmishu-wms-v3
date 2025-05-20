/**
 * 文字语音提示函数
 * @param {string} text - 要播放的文字内容
 */
export const playVoice = (text) => {
  // 检查浏览器是否支持语音合成
  if ("speechSynthesis" in window) {
    // 创建一个新的SpeechSynthesisUtterance实例
    const utterance = new SpeechSynthesisUtterance(text);

    // 设置语音属性
    utterance.volume = 1; // 音量 (0 到 1)
    utterance.rate = 1.0; // 语速 (0.1 到 10)
    utterance.pitch = 1.0; // 音调 (0 到 2)

    // 根据当前语言设置语音
    const lang = localStorage.getItem("locale") || "zh-CN";
    utterance.lang = lang === "en" ? "en-US" : "zh-CN";

    // 播放语音
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("当前浏览器不支持语音合成API");
  }
};

/**
 * 播放扫描提示音
 * @param {boolean} success - true播放成功音效，false播放失败音效
 */
export const playBeep = (() => {
  // 预加载音频
  const successAudio = new Audio();
  const failureAudio = new Audio();

  // 设置音频文件路径
  successAudio.src = new URL('../assets/audio/scan.mp3', import.meta.url).href;
  failureAudio.src = new URL('../assets/audio/warn.mp3', import.meta.url).href;

  // 设置音量
  successAudio.volume = 0.8;
  failureAudio.volume = 0.8;

  // 返回实际播放函数
  return (success) => {
    try {
      if (success) {
        // 重置并播放成功音效
        successAudio.currentTime = 0;
        successAudio.play();
      } else {
        // 重置并播放失败音效
        failureAudio.currentTime = 0;
        failureAudio.play();
      }
    } catch (error) {
      console.warn('播放音频失败:', error);
    }
  };
})();