/**
 * Chrome Voice Control - A Chrome extension for controlling video playback with voice commands
 * 
 * @author Ziegler <550360139@qq.com>
 * @license MIT
 * @copyright (c) 2025 Ziegler
 */

document.addEventListener('DOMContentLoaded', function() {
  const voiceToggle = document.getElementById('voiceToggle');
  const autoStartCheckbox = document.getElementById('autoStartVoice');

  // 初始化按钮状态
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'getVoiceState'}, function(response) {
      if (response && response.isListening) {
        voiceToggle.textContent = '禁用语音控制';
        voiceToggle.classList.remove('off');
      } else {
        voiceToggle.textContent = '启用语音控制';
        voiceToggle.classList.add('off');
      }
    });
  });

  // 加载自动启动设置
  chrome.storage.local.get(['autoStartVoice'], function(result) {
    autoStartCheckbox.checked = result.autoStartVoice !== false; // 默认为true
  });

  // 处理语音控制开关点击
  voiceToggle.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'toggleVoice'}, function(response) {
        if (response && response.isListening) {
          voiceToggle.textContent = '禁用语音控制';
          voiceToggle.classList.remove('off');
        } else {
          voiceToggle.textContent = '启用语音控制';
          voiceToggle.classList.add('off');
        }
      });
    });
  });

  // 处理自动启动设置变更
  autoStartCheckbox.addEventListener('change', function() {
    chrome.storage.local.set({
      autoStartVoice: autoStartCheckbox.checked
    }, function() {
      console.log('Auto-start setting saved:', autoStartCheckbox.checked);
    });
  });
});
