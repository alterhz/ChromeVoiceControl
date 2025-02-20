let recognition = null;
let isListening = false;
console.log('Content script loaded');

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

          // 检查是否包含任何播放命令
          const isPlayCommand = 
            playCommandsChinese.some(cmd => command.includes(cmd)) ||
            playCommandsEnglish.some(cmd => command.includes(cmd));

          // 检查是否包含任何暂停命令
          const isPauseCommand =
            pauseCommandsChinese.some(cmd => command.includes(cmd)) ||
            pauseCommandsEnglish.some(cmd => command.includes(cmd));

          if (isPlayCommand) {
            console.log('Playing video with command:', command);
            video.play();
          } else if (isPauseCommand) {
            console.log('Pausing video with command:', command);
            video.pause();
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
