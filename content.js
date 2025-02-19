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
          
          if (command.includes('播放') || command.includes('开始') || command.includes('start') || command.includes('resume') || command.includes('play')) {
            console.log('Playing video');
            video.play();
          } else if (command.includes('暂停') || command.includes('停止') || command.includes('pause') || command.includes('stop')) {
            console.log('Pausing video');
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
  console.log('Received message:', request.type, request.isEnabled);
  if (request.type === 'voiceStateChanged') {
    if (request.isEnabled) {
      startListening();
    } else {
      stopListening();
    }
  }
});

// Initial setup
chrome.runtime.sendMessage({type: 'getVoiceState'}, function(response) {
  console.log('Initial voice state:', response.isEnabled);
  if (response.isEnabled) {
    startListening();
  }
});
