/**
 * Chrome Voice Control - A Chrome extension for controlling video playback with voice commands
 * 
 * @author Ziegler <550360139@qq.com>
 * @license MIT
 * @copyright (c) 2025 Ziegler
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup initialized');
  const toggleButton = document.getElementById('voiceToggle');
  
  // Get current state
  chrome.runtime.sendMessage({type: 'getVoiceState'}, function(response) {
    console.log('Current voice state:', response.isEnabled);
    updateButtonState(response.isEnabled);
  });

  toggleButton.addEventListener('click', function() {
    console.log('Toggle button clicked');
    chrome.runtime.sendMessage({type: 'toggleVoice'}, function(response) {
      console.log('Voice state changed to:', response.isEnabled);
      updateButtonState(response.isEnabled);
    });
  });

  function updateButtonState(isEnabled) {
    console.log('Updating button UI state:', isEnabled);
    toggleButton.textContent = isEnabled ? '关闭语音控制' : '启用语音控制';
    toggleButton.classList.toggle('off', !isEnabled);
  }
});
