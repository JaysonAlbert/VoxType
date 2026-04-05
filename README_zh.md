# VoxType - 语音输入助手

基于 Tauri + React + Whisper 的桌面语音转文字应用。

## 功能

- 实时录音转文字
- 支持中文语音识别
- 文本复制/清空
- 离线使用（需要下载模型）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发模式

```bash
npm run dev        # 启动前端
npm run tauri dev  # 启动 Tauri 应用
```

### 3. 构建

```bash
npm run tauri build
```

## 架构

```
┌─────────────────┐
│   React UI      │  前端界面，麦克风控制，文本显示
├─────────────────┤
│   Tauri IPC     │  前后端通信
├─────────────────┤
│   Rust Backend  │  Tauri 核心
├─────────────────┤
│   Whisper ASR   │  语音识别引擎
└─────────────────┘
```

## 配置

### Whisper 模型

默认使用 `tiny` 模型，可以修改为:

- `tiny` - 最快，精度较低
- `base` - 平衡速度与精度
- `small` - 更好的精度
- `medium` - 高精度
- `large` - 最高精度

编辑 `src-tauri/src/asr.rs` 中的模型路径。

## License

MIT
