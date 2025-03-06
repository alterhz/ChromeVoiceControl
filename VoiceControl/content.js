/**
 * Chrome Voice Control - A Chrome extension for controlling video playback with voice commands
 * 
 * @author Ziegler <550360139@qq.com>
 * @license MIT
 * @copyright (c) 2025 Ziegler
 */

let recognizer = null;
let isListening = false;
let subtitleTimeout = null;
let audioContext = null;
let mediaStream = null;
let recognizerNode = null;
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
function showSubtitle(text, isWakeWord = false) {
  let subtitle = document.getElementById('voice-subtitle');
  if (!subtitle) {
    subtitle = createSubtitleElement();
  }
  
  subtitle.textContent = text;
  subtitle.style.display = 'block';
  
  // 如果是唤醒词，使用不同的样式
  if (isWakeWord) {
    subtitle.style.backgroundColor = 'rgba(76, 175, 80, 0.7)';  // 绿色背景
  } else {
    subtitle.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';  // 黑色背景
  }
  
  // 清除之前的定时器
  if (subtitleTimeout) {
    clearTimeout(subtitleTimeout);
  }
  
  // 2.5秒后隐藏字幕
  subtitleTimeout = setTimeout(() => {
    subtitle.style.display = 'none';
  }, 2500);
}

// 检查是否包含唤醒词
function containsWakeWord(command) {
  const wakeWords = ['小助手', '小伙伴', '小精灵', 'hey assistant', 'hey buddy', 'hey helper'];
  return wakeWords.some(word => command.includes(word));
}

// 从命令中移除唤醒词
function removeWakeWord(command) {
  const wakeWords = ['小助手', '小伙伴', '小精灵', 'hey assistant', 'hey buddy', 'hey helper'];
  let result = command;
  wakeWords.forEach(word => {
    result = result.replace(word, '').trim();
  });
  return result;
}

async function setupSpeechRecognition() {
  console.log('Setting up speech recognition');
  
  try {
    if (typeof Vosk === 'undefined') {
      throw new Error('Vosk library not loaded');
    }

    const modelPath = chrome.runtime.getURL('models/vosk-model-small-cn-0.22.zip');
    console.log('Loading model from:', modelPath);
    const model = await Vosk.createModel(modelPath);
    console.log('Vosk model loaded successfully');

    const sampleRate = 16000;
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate
      },
    });
    console.log('Microphone access granted');

    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(mediaStream);
    
    console.log('Creating Vosk recognizer...');
    recognizer = new model.KaldiRecognizer(sampleRate);
    
    let lastWakeWordTime = 0;
    const wakeWordTimeout = 5000; // 唤醒词有效期5秒

    recognizer.on("result", (message) => {
      const result = message.result;
      const command = result.text.trim().toLowerCase();
      console.log('Recognized command:', command);
      
      const currentTime = Date.now();
      
      // 检查是否包含唤醒词
      if (containsWakeWord(command)) {
        lastWakeWordTime = currentTime;
        showSubtitle(`已唤醒，请说出指令`, true);
        return;
      }

      // 检查唤醒状态是否有效
      if (currentTime - lastWakeWordTime > wakeWordTimeout) {
        showSubtitle(`请先说"小助手"唤醒`);
        return;
      }

      // 处理实际命令
      const actualCommand = removeWakeWord(command);
      showSubtitle(actualCommand);
      
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
          'enable sound',
          'turn on sound',
          'sound on'
        ];

        // 检查并执行播放命令
        if (playCommandsChinese.some(cmd => actualCommand.includes(cmd)) ||
            playCommandsEnglish.some(cmd => actualCommand.includes(cmd))) {
          video.play();
        }
        
        // 检查并执行暂停命令
        else if (pauseCommandsChinese.some(cmd => actualCommand.includes(cmd)) ||
                pauseCommandsEnglish.some(cmd => actualCommand.includes(cmd))) {
          video.pause();
        }
        
        // 检查并执行静音命令
        else if (muteCommandsChinese.some(cmd => actualCommand.includes(cmd)) ||
                muteCommandsEnglish.some(cmd => actualCommand.includes(cmd))) {
          video.muted = true;
        }
        
        // 检查并执行取消静音命令
        else if (unmuteCommandsChinese.some(cmd => actualCommand.includes(cmd)) ||
                unmuteCommandsEnglish.some(cmd => actualCommand.includes(cmd))) {
          video.muted = false;
        }
      }
    });

    recognizer.on("partialresult", (message) => {
      const partial = message.result.partial;
      console.log("Partial result:", partial);
      if (partial) {
        showSubtitle(partial);
      }
    });

    recognizerNode = audioContext.createScriptProcessor(4096, 1, 1);
    recognizerNode.onaudioprocess = (event) => {
      try {
        const success = recognizer.acceptWaveform(event.inputBuffer);
        if (success) {
          console.log("Waveform accepted");
        }
      } catch (error) {
        console.error('acceptWaveform failed:', error);
      }
    };
    
    source.connect(recognizerNode);
    recognizerNode.connect(audioContext.destination);
    
    isListening = true;
    console.log('Voice recognition setup completed');
  } catch (error) {
    console.error('Failed to setup speech recognition:', error);
    throw error;
  }
}

function startListening() {
  if (!isListening) {
    setupSpeechRecognition().catch(error => {
      console.error('Failed to start listening:', error);
      showSubtitle('语音识别启动失败，请重试');
    });
  }
}

function stopListening() {
  if (isListening) {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    if (recognizerNode) {
      recognizerNode.disconnect();
      recognizerNode = null;
    }
    recognizer = null;
    isListening = false;
  }
}

// 保存按钮位置
function saveButtonPosition(x, y) {
  const hostname = window.location.hostname;
  chrome.storage.local.set({
    [`buttonPosition_${hostname}`]: { x, y }
  });
}

// 获取保存的按钮位置
function getSavedButtonPosition(callback) {
  const hostname = window.location.hostname;
  chrome.storage.local.get([`buttonPosition_${hostname}`], (result) => {
    const position = result[`buttonPosition_${hostname}`];
    callback(position || { x: 0, y: 0 });
  });
}

// 创建麦克风按钮
function createMicrophoneButton() {
  // 检查是否已存在按钮
  if (document.getElementById('voice-control-button')) {
    return;
  }

  const button = document.createElement('div');
  button.id = 'voice-control-button';
  
  // 创建图标容器
  const iconContainer = document.createElement('div');
  iconContainer.style.cssText = `
    width: 48px;
    height: 48px;
    background-image: url(${chrome.runtime.getURL('microphone_on.png')});
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    margin-bottom: 5px;
  `;

  // 创建文字标签
  const label = document.createElement('div');
  label.textContent = '正在听...';
  label.style.cssText = `
    font-size: 12px;
    color: #333;
    text-align: center;
    white-space: nowrap;
    user-select: none;
  `;

  // 设置按钮容器样式
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    cursor: pointer;
    z-index: 10000;
    background: white;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.2s;
  `;

  button.appendChild(iconContainer);
  button.appendChild(label);

  // 恢复保存的位置
  getSavedButtonPosition((position) => {
    xOffset = position.x;
    yOffset = position.y;
    button.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
  });

  // 添加拖动功能
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  button.addEventListener('mousedown', (e) => {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    
    if (e.target === button || button.contains(e.target)) {
      isDragging = true;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;

      button.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      // 保存最终位置
      saveButtonPosition(xOffset, yOffset);
      isDragging = false;
    }
  });

  // 点击切换麦克风状态
  button.addEventListener('click', (e) => {
    if (!isDragging) {  // 只有在不是拖动时才触发点击
      if (isListening) {
        stopListening();
        iconContainer.style.backgroundImage = `url(${chrome.runtime.getURL('microphone_off.png')})`;
        label.textContent = '语音控制';
      } else {
        startListening();
        iconContainer.style.backgroundImage = `url(${chrome.runtime.getURL('microphone_on.png')})`;
        label.textContent = '正在听...';
      }
    }
  });

  document.body.appendChild(button);
  console.log('Microphone button created');
}

// 初始化语音控制
function initializeVoiceControl() {
  // 创建按钮
  createMicrophoneButton();
  
  // 检查是否应该自动启动
  chrome.storage.local.get(['autoStartVoice'], function(result) {
    const shouldAutoStart = result.autoStartVoice !== false; // 默认为true
    if (shouldAutoStart && !isListening) {
      startListening();
      console.log('Voice recognition auto-started');
    } else if (!shouldAutoStart) {
      // 更新按钮状态为关闭
      const button = document.getElementById('voice-control-button');
      if (button) {
        const iconContainer = button.querySelector('div');
        const label = button.querySelectorAll('div')[1];
        iconContainer.style.backgroundImage = `url(${chrome.runtime.getURL('microphone_off.png')})`;
        label.textContent = '语音控制';
      }
    }
  });
}

// 处理来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Content script received message:', request.type);
  
  if (request.type === 'toggleVoice') {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
    sendResponse({isListening: isListening});
  } else if (request.type === 'getVoiceState') {
    sendResponse({isListening: isListening});
  }
  
  return true; // 保持消息通道开放
});

// 等待页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeVoiceControl);
} else {
  // 如果页面已经加载完成，直接初始化
  initializeVoiceControl();
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
