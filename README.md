# VoxType

语音输入助手应用，基于 Tauri + React + Whisper ASR

## 技术栈

- **前端**: React + TypeScript + Vite
- **桌面框架**: Tauri 2.x
- **ASR**: Whisper (faster-whisper)

## 开发

### 环境要求

- Node.js 18+
- Rust 1.70+
- 系统依赖:
  - Linux: `libwebkit2gtk-4.1-dev, libayatana-appindicator3-dev, librsvg2-dev`
  - macOS: Xcode Command Line Tools
  - Windows: Visual Studio Build Tools

### 安装

```bash
npm install
```

### 开发模式

```bash
# 启动前端开发服务器
npm run dev

# 在另一个终端启动 Tauri 应用
npm run tauri dev
```

### 构建

```bash
npm run build
npm run tauri build
```

## 项目结构

```
VoxType/
├── src/                 # React 前端代码
│   ├── components/     # 组件
│   ├── App.tsx         # 主应用
│   └── main.tsx        # 入口
├── src-tauri/          # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs     # Rust 入口
│   │   └── asr.rs      # ASR 服务
│   └── Cargo.toml      # Rust 依赖
├── tauri.conf.json     # Tauri 配置
└── vite.config.ts      # Vite 配置
```

## 依赖

- `faster-whisper`: 高性能 Whisper 实现
- `@tauri-apps/api`: Tauri API

## License

MIT
