# Control video by voice

Control video by voice 是一个强大的浏览器扩展，让你能够通过语音命令控制网页中的视频播放。支持中英文双语命令，提供直观的语音控制体验。

## ✨ 特性

- 🎯 支持中英文双语语音命令
- 🎮 全面的视频控制功能
- 🔊 智能音量调节
- ⏱ 精确的进度控制
- 🔄 实时语音识别
- 📱 简单易用的界面
- 🌐 支持多个主流视频网站（YouTube、Bilibili等）

## 🚀 安装方法

1. 下载本扩展的源代码（可以通过 git clone 或下载 ZIP）
2. 打开 Chrome 浏览器，进入扩展管理页面：`chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择下载的源代码中的 `VoiceControl` 文件夹
6. 确保浏览器已获得麦克风使用权限

## 📖 使用说明

### 基础操作

1. 点击工具栏中的扩展图标
2. 点击"启用语音控制"按钮开始使用
3. 使用唤醒词激活语音控制（支持中英文唤醒词）
4. 在唤醒后5秒内说出具体的控制命令

### 使用流程示例

1. 说"小助手"或"Hey assistant"（等待提示"已唤醒，请说出指令"）
2. 然后说出具体命令，如"播放视频"或"play video"

### 支持的语音命令

#### 1. 唤醒词
中文唤醒词：
- 小助手
- 小伙伴
- 小精灵

English wake words:
- Hey assistant
- Hey buddy
- Hey helper

（说出任意唤醒词后，在5秒内说出以下控制命令）

#### 2. 播放控制
中文命令：
- 播放/开始播放/播放视频/开始
- 暂停/停止/暂停视频/停止播放

English Commands:
- Play/Start/Resume/Continue
- Pause/Stop/Halt

#### 3. 音量控制
中文命令：
- 音量调到50（0-100之间的数值）
- 增大音量/调高音量
- 减小音量/调低音量
- 静音/关闭声音
- 取消静音/打开声音

English Commands:
- Volume to 50 (number between 0-100)
- Volume up/Increase volume
- Volume down/Decrease volume
- Mute/Turn off sound
- Unmute/Turn on sound

#### 4. 进度控制
中文命令：
- 快进/快进30秒/快进2分钟
- 快退/快退30秒/快退1分钟

English Commands:
- Forward/Skip ahead 30 seconds
- Backward/Skip back 1 minute

## 🎯 使用技巧

1. **精确控制**：
   - 可以指定具体的音量数值："音量调到75"
   - 可以指定快进快退的具体时间："快进2分钟"

2. **默认行为**：
   - 快进快退默认为10秒
   - 音量增减默认为20%

3. **智能识别**：
   - 支持多种自然语言表达
   - 命令不需要完全匹配，包含关键词即可

## 🛠 注意事项

1. 确保浏览器已获得麦克风使用权限
2. 每个标签页只能有一个激活的语音控制
3. 切换标签页时会自动关闭其他标签页的语音控制
4. 目前支持的视频网站：
   - YouTube (youtube.com)
   - Bilibili (bilibili.com)
   - 更多网站支持正在开发中...

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

## 📄 许可证

本项目采用 MIT 许可证。

Copyright (c) 2025 Ziegler <550360139@qq.com>

详细信息请查看 [LICENSE](LICENSE) 文件。

## 📝 版本历史

当前版本：1.3
- 新增智能唤醒词系统，支持中英文唤醒词
- 支持多个主流视频网站
- 优化语音识别准确度
- 改进用户界面体验
