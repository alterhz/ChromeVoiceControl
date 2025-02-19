let isVoiceEnabled = false;
console.log('Background script initialized');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request.type, 'from:', sender.tab ? 'content script' : 'popup');
  
  if (request.type === 'toggleVoice') {
    isVoiceEnabled = !isVoiceEnabled;
    console.log('Voice state toggled to:', isVoiceEnabled);
    
    // Notify content script about the state change
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      console.log('Sending state change to tab:', tabs[0].id);
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'voiceStateChanged',
        isEnabled: isVoiceEnabled
      });
    });
    sendResponse({isEnabled: isVoiceEnabled});
  } else if (request.type === 'getVoiceState') {
    console.log('Returning current voice state:', isVoiceEnabled);
    sendResponse({isEnabled: isVoiceEnabled});
  }
  return true;
});
