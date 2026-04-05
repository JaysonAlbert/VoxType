# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VoxType is a desktop voice typing application built with Tauri 2.x and React, providing speech-to-text functionality via Whisper ASR.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Desktop Framework**: Tauri 2.x (Rust-based)
- **ASR**: Whisper (placeholder integration, currently uses faster-whisper architecture)

## Common Development Commands

```bash
# Install dependencies
npm install

# Start frontend dev server (port 1420)
npm run dev

# Build frontend
npm run build

# Run Tauri dev mode
npm run tauri dev

# Build desktop application
npm run tauri build
```

## Project Architecture

### Frontend Structure (`src/`)

```
src/
├── App.tsx                 # Main app component - orchestrates recording state and transcript display
├── main.tsx               # React entry point
├── components/
│   └── MicRecorder.tsx    # Audio recording component with MediaRecorder API
├── index.css              # Global styles
└── vite-env.d.ts         # Vite type declarations
```

**Frontend Key Components:**

- `App.tsx`: Manages three key states (`isRecording`, `transcript`, `isAsrLoading`) and coordinates with Tauri backend via `@tauri-apps/api/core`'s `invoke` function
- `MicRecorder.tsx`: Handles microphone access, audio recording (WebM format), and calls Tauri commands for ASR processing

### Backend Structure (`src-tauri/`)

```
src-tauri/
├── src/
│   ├── main.rs           # Tauri app initialization, command handlers registration
│   ├── lib.rs            # ASRService definition - placeholder Whisper integration
│   └── asr.rs            # Rust library exports
├── Cargo.toml            # Rust dependencies (tauri 2.0, serde)
├── tauri.conf.json       # Tauri bundler configuration
└── build.rs              # Build script for context generation
```

**Backend Key Concepts:**

- ASR service is managed as a **thread-safe singleton** via `tauri::State<Mutex<AsrService>>`
- Three Tauri commands exposed to frontend:
  - `record_and_transcribe(audio_data)`: Records audio and triggers transcription
  - `init_asr_service()`: Initializes the Whisper model
  - `get_asr_status()`: Checks if model is loaded

### Build Configuration

- **Vite**: Configured at port 1420 with aliased `@` path resolver pointing to `src/`
- **Tauri**: Uses `custom-protocol` feature; optimized build with LTO and size optimization in release mode

## State Management

The app uses React local state (no external state management). Key state flows:

1. User clicks microphone → `startRecording()` called
2. Audio chunks collected in `MediaRecorder.ondataavailable`
3. On stop, blob sent to Tauri via `invoke('record_and_transcribe', ...)`
4. Response populates transcript state

## Important Notes

- Frontend and backend communicate via Tauri's invoke command system
- Audio is recorded as WebM blobs, sent as `Vec<u8>` to Rust backend
- Whisper ASR is a **placeholder** - actual model integration needed in `asr.rs`
- Model path configured as `models/tiny` but not yet wired to actual Whisper implementation

## File Locations

- Frontend entry: `src/main.tsx`, `src/App.tsx`
- Tauri commands: `src-tauri/src/main.rs`
- ASR service: `src-tauri/src/lib.rs`
- Tauri config: `tauri.conf.json`, `src-tauri/tauri.conf.json`
