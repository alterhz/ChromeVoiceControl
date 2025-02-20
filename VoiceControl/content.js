/**
 * Chrome Voice Control - A Chrome extension for controlling video playback with voice commands
 * 
 * @author Ziegler <550360139@qq.com>
 * @license MIT
 * @copyright (c) 2025 Ziegler
 */

let recognition = null;
let isListening = false;
let subtitleTimeout = null;
console.log('Content script loaded');

// 创建字幕元素
function createSubtitleElement() {
  const subtitle = document.createElement('div');
  subtitle.id = 'voice-subtitle';
  subtitle.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 5em;
    z-index: 999999;
    display: none;
    text-align: center;
    max-width: 80%;
    word-wrap: break-word;
  `;
  document.body.appendChild(subtitle);
  return subtitle;
}

// 显示字幕
function showSubtitle(text) {
  let subtitle = document.getElementById('voice-subtitle');
  if (!subtitle) {
    subtitle = createSubtitleElement();
  }
  
  subtitle.textContent = text;
  subtitle.style.display = 'block';
  
  // 清除之前的定时器
  if (subtitleTimeout) {
    clearTimeout(subtitleTimeout);
  }
  
  // 2.5秒后隐藏字幕
  subtitleTimeout = setTimeout(() => {
    subtitle.style.display = 'none';
  }, 2500);
}

function setupSpeechRecognition() {
  console.log('Setting up speech recognition');
  recognition = new webkitSpeechRecognition();
  // 修改为非连续模式，这样每次说完话就会立即返回结果
  recognition.continuous = false;
  // 启用临时结果，可以更快地获得语音识别结果
  recognition.interimResults = true;
  recognition.lang = 'zh-CN';
  // 设置更短的语音识别时间
  recognition.maxAlternatives = 1;

  recognition.onresult = function(event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const command = result[0].transcript.trim().toLowerCase();
      console.log('Recognized command:', command, 'isFinal:', result.isFinal);
      
      // 显示语音字幕
      showSubtitle(result[0].transcript.trim());
      
      // 只处理最终结果
      if (result.isFinal) {
        const videos = document.getElementsByTagName('video');
        console.log('Found videos:', videos.length);
        
        if (videos.length > 0) {
          const video = videos[0];
          
          // 中文播放命令
          const playCommandsChinese = [
            '播放',
            '开始播放',
            '播放视频',
            '开始',
            '开启视频',
            '继续播放',
            '打开视频',
            '运行视频',
            '启动视频',
            '接着放'
          ];

          // 英文播放命令
          const playCommandsEnglish = [
            'play',
            'start',
            'play video',
            'start video',
            'resume',
            'begin',
            'continue',
            'go ahead',
            'run video'
          ];

          // 中文暂停命令
          const pauseCommandsChinese = [
            '暂停',
            '停止',
            '暂停视频',
            '停止播放',
            '关闭视频',
            '停下',
            '别放了',
            '停一下'
          ];

          // 英文暂停命令
          const pauseCommandsEnglish = [
            'pause',
            'stop',
            'pause video',
            'stop video',
            'halt',
            'hold',
            'stop playing',
            'freeze'
          ];

          // 中文静音命令
          const muteCommandsChinese = [
            '静音',
            '关闭声音',
            '关掉声音',
            '声音关掉',
            '不要声音',
            '闭嘴'
          ];

          // 英文静音命令
          const muteCommandsEnglish = [
            'mute',
            'silence',
            'no sound',
            'turn off sound',
            'shut up'
          ];

          // 中文取消静音命令
          const unmuteCommandsChinese = [
            '取消静音',
            '打开声音',
            '开启声音',
            '声音打开',
            '要声音'
          ];

          // 英文取消静音命令
          const unmuteCommandsEnglish = [
            'unmute',
            'turn on sound',
            'enable sound',
            'sound on'
          ];

          // 音量调节命令模式
          const volumePatternChinese = /音量调到(\d+)/;
          const volumeUpPatternChinese = /增大音量|调高音量|音量增大|音量调高|声音调大|声音增大|声音大点/;
          const volumeDownPatternChinese = /减小音量|调低音量|音量减小|音量调低|声音调小|声音减小|声音小点/;
          const volumePatternEnglish = /volume (?:to |set to |change to )?(\d+)/;
          const volumeUpPatternEnglish = /volume up|increase volume|louder|turn up/;
          const volumeDownPatternEnglish = /volume down|decrease volume|lower|turn down/;

          // 快进快退命令模式
          const forwardPatternChinese = /快进(\d+)?(?:秒|分钟)?/;
          const backwardPatternChinese = /快退(\d+)?(?:秒|分钟)?/;
          const forwardPatternEnglish = /(?:forward|skip ahead|skip forward|fast forward)(?: (\d+))?(?: seconds?| minutes?)?/;
          const backwardPatternEnglish = /(?:backward|skip back|rewind|go back)(?: (\d+))?(?: seconds?| minutes?)?/;

          // 中文快进命令
          const forwardCommandsChinese = [
            '前进',
            '向前',
            '往前',
            '跳过',
            '快进'
          ];

          // 英文快进命令
          const forwardCommandsEnglish = [
            'forward',
            'skip ahead',
            'skip forward',
            'fast forward'
          ];

          // 中文快退命令
          const backwardCommandsChinese = [
            '后退',
            '向后',
            '往后',
            '快退',
            '倒退'
          ];

          // 英文快退命令
          const backwardCommandsEnglish = [
            'backward',
            'skip back',
            'rewind',
            'go back'
          ];

          // 检查命令类型
          const isPlayCommand = 
            playCommandsChinese.some(cmd => command.includes(cmd)) ||
            playCommandsEnglish.some(cmd => command.includes(cmd));

          const isPauseCommand =
            pauseCommandsChinese.some(cmd => command.includes(cmd)) ||
            pauseCommandsEnglish.some(cmd => command.includes(cmd));

          const isMuteCommand =
            muteCommandsChinese.some(cmd => command.includes(cmd)) ||
            muteCommandsEnglish.some(cmd => command.includes(cmd));

          const isUnmuteCommand =
            unmuteCommandsChinese.some(cmd => command.includes(cmd)) ||
            unmuteCommandsEnglish.some(cmd => command.includes(cmd));

          // 处理命令
          if (isPlayCommand) {
            console.log('Playing video with command:', command);
            video.play();
          } else if (isPauseCommand) {
            console.log('Pausing video with command:', command);
            video.pause();
          } else if (isMuteCommand) {
            console.log('Muting video');
            video.muted = true;
          } else if (isUnmuteCommand) {
            console.log('Unmuting video');
            video.muted = false;
          } else {
            // 处理音量调节命令
            let volumeMatch = command.match(volumePatternChinese) || command.match(volumePatternEnglish);
            if (volumeMatch) {
              // 将音量值转换为0-1范围
              const volumeLevel = Math.min(Math.max(parseInt(volumeMatch[1]) / 100, 0), 1);
              console.log('Setting volume to:', volumeLevel);
              video.volume = volumeLevel;
            } else if (volumeUpPatternChinese.test(command) || volumeUpPatternEnglish.test(command)) {
              // 增大音量，每次增加20%
              video.volume = Math.min(video.volume + 0.2, 1);
              console.log('Volume increased to:', video.volume);
            } else if (volumeDownPatternChinese.test(command) || volumeDownPatternEnglish.test(command)) {
              // 减小音量，每次减少20%
              video.volume = Math.max(video.volume - 0.2, 0);
              console.log('Volume decreased to:', video.volume);
            } else {
              // 处理快进快退命令
              const DEFAULT_SEEK_TIME = 10; // 默认快进快退10秒
              let seekTime = DEFAULT_SEEK_TIME;
              
              // 检查是否包含时间
              let forwardMatch = command.match(forwardPatternChinese) || command.match(forwardPatternEnglish);
              let backwardMatch = command.match(backwardPatternChinese) || command.match(backwardPatternEnglish);
              
              if (forwardMatch || forwardCommandsChinese.some(cmd => command.includes(cmd)) || 
                  forwardCommandsEnglish.some(cmd => command.includes(cmd))) {
                // 如果指定了时间，使用指定的时间
                if (forwardMatch && forwardMatch[1]) {
                  seekTime = parseInt(forwardMatch[1]);
                  // 如果命令中包含"分钟"，将秒数转换为分钟
                  if (command.includes('分钟') || command.includes('minutes')) {
                    seekTime *= 60;
                  }
                }
                console.log('Seeking forward by', seekTime, 'seconds');
                video.currentTime = Math.min(video.currentTime + seekTime, video.duration);
              } else if (backwardMatch || backwardCommandsChinese.some(cmd => command.includes(cmd)) || 
                         backwardCommandsEnglish.some(cmd => command.includes(cmd))) {
                // 如果指定了时间，使用指定的时间
                if (backwardMatch && backwardMatch[1]) {
                  seekTime = parseInt(backwardMatch[1]);
                  // 如果命令中包含"分钟"，将秒数转换为分钟
                  if (command.includes('分钟') || command.includes('minutes')) {
                    seekTime *= 60;
                  }
                }
                console.log('Seeking backward by', seekTime, 'seconds');
                video.currentTime = Math.max(video.currentTime - seekTime, 0);
              }
            }
          }
        }
      }
    }
  };

  recognition.onend = function() {
    console.log('Speech recognition service disconnected');
    // 如果仍然处于监听状态，立即重新启动语音识别
    if (isListening) {
      console.log('Automatically restarting speech recognition');
      setTimeout(() => {
        try {
          recognition.start();
          console.log('Speech recognition restarted');
        } catch (e) {
          console.error('Error restarting speech recognition:', e);
        }
      }, 100);
    }
  };

  recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'no-speech') {
      // 无语音输入时自动重新启动
      console.log('No speech detected, restarting recognition');
      if (isListening) {
        setTimeout(() => {
          try {
            recognition.start();
            console.log('Speech recognition restarted after no-speech');
          } catch (e) {
            console.error('Error restarting speech recognition:', e);
          }
        }, 100);
      }
      return;
    }
    // 其他错误则停止监听
    stopListening();
  };
}

function startListening() {
  console.log('Starting speech recognition');
  if (!recognition) {
    setupSpeechRecognition();
  }
  if (!isListening) {
    try {
      recognition.start();
      isListening = true;
      console.log('Speech recognition started');
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      // 如果已经在运行，重新启动
      if (e.name === 'InvalidStateError') {
        recognition.stop();
        setTimeout(() => {
          recognition.start();
          isListening = true;
          console.log('Speech recognition restarted');
        }, 100);
      }
    }
  }
}

function stopListening() {
  console.log('Stopping speech recognition');
  if (recognition && isListening) {
    recognition.stop();
    isListening = false;
    console.log('Speech recognition stopped');
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request.type);
  if (request.type === 'voiceStateChanged') {
    if (request.isEnabled) {
      startListening();
    } else {
      stopListening();
    }
  } else if (request.type === 'getVoiceState') {
    // 返回当前实际的语音识别状态
    console.log('Returning current voice state:', isListening);
    sendResponse({isEnabled: isListening});
    return true;
  }
});

// Initial setup
chrome.runtime.sendMessage({type: 'getVoiceState'}, function(response) {
  console.log('Initial voice state:', response.isEnabled);
  if (response.isEnabled) {
    startListening();
  }
});
