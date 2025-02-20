/**
 * Chrome Voice Control - A Chrome extension for controlling video playback with voice commands
 * 
 * @author Ziegler <550360139@qq.com>
 * @license MIT
 * @copyright (c) 2025 Ziegler
 */

console.log('Background script initialized');

// 存储当前激活的语音控制标签ID
let activeVoiceTabId = null;

// 关闭其他标签页的语音控制
async function disableVoiceInOtherTabs(currentTabId) {
  console.log('Disabling voice in other tabs, current tab:', currentTabId);
  const tabs = await chrome.tabs.query({});
  
  for (const tab of tabs) {
    if (tab.id !== currentTabId) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'voiceStateChanged',
          isEnabled: false
        });
        console.log('Disabled voice in tab:', tab.id);
      } catch (error) {
        // 忽略不支持语音控制的标签页的错误
        console.log('Tab does not support voice control:', tab.id);
      }
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request.type, 'from:', sender.tab ? 'content script' : 'popup');
  
  if (request.type === 'toggleVoice') {
    // 获取当前活动标签页
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      if (tabs[0]) {
        const currentTab = tabs[0];
        
        // 获取当前标签页的语音状态
        try {
          const response = await chrome.tabs.sendMessage(currentTab.id, {type: 'getVoiceState'});
          const willEnable = !response.isEnabled;
          
          if (willEnable) {
            // 如果要开启语音，先关闭其他标签页的语音
            await disableVoiceInOtherTabs(currentTab.id);
            // 更新当前激活的语音控制标签
            activeVoiceTabId = currentTab.id;
          } else if (currentTab.id === activeVoiceTabId) {
            // 如果关闭语音，清除激活的标签记录
            activeVoiceTabId = null;
          }

          // 发送切换命令到当前标签
          console.log('Sending voice toggle to tab:', currentTab.id);
          chrome.tabs.sendMessage(currentTab.id, {
            type: 'voiceStateChanged',
            isEnabled: willEnable
          });

          // 获取最终状态
          const finalResponse = await chrome.tabs.sendMessage(currentTab.id, {type: 'getVoiceState'});
          sendResponse(finalResponse);
        } catch (error) {
          console.error('Error during voice toggle:', error);
          sendResponse({isEnabled: false});
        }
      } else {
        sendResponse({isEnabled: false});
      }
    });
    return true;
  } else if (request.type === 'getVoiceState') {
    // 从当前活动标签页获取实际状态
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        const currentTab = tabs[0];
        // 如果当前标签不是激活的语音控制标签，直接返回false
        if (activeVoiceTabId && activeVoiceTabId !== currentTab.id) {
          console.log('Tab is not the active voice control tab');
          sendResponse({isEnabled: false});
          return;
        }

        chrome.tabs.sendMessage(currentTab.id, {type: 'getVoiceState'}, function(response) {
          if (chrome.runtime.lastError) {
            console.error('Error getting voice state:', chrome.runtime.lastError);
            sendResponse({isEnabled: false});
          } else {
            console.log('Got voice state from content:', response.isEnabled);
            sendResponse(response);
          }
        });
      } else {
        sendResponse({isEnabled: false});
      }
    });
    return true;
  }
});
