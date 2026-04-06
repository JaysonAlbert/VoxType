// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod asr;

use serde::Serialize;
use std::sync::Mutex;
use tauri::{Manager, State};

pub struct AsrService {
    inner: Mutex<asr::AsrService>,
}

impl AsrService {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(asr::AsrService::new()),
        }
    }
}

#[derive(Serialize)]
struct AsrStatus {
    is_loaded: bool,
    is_busy: bool,
}

#[tauri::command]
fn record_and_transcribe(
    audio_data: Vec<u8>,
    state: State<'_, AsrService>,
) -> Result<String, String> {
    let service = state.inner.lock().map_err(|e| e.to_string())?;
    service.transcribe(&audio_data)
}

#[tauri::command]
fn init_asr_service(state: State<'_, AsrService>) -> Result<bool, String> {
    let mut service = state.inner.lock().map_err(|e| e.to_string())?;
    service.init()?;
    Ok(true)
}

#[tauri::command]
fn get_asr_status(state: State<'_, AsrService>) -> Result<AsrStatus, String> {
    let service = state.inner.lock().map_err(|e| e.to_string())?;
    Ok(AsrStatus {
        is_loaded: service.is_loaded(),
        is_busy: false,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let asr = AsrService::new();
    tauri::Builder::default()
        .setup(|app| {
            app.manage(asr);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            record_and_transcribe,
            init_asr_service,
            get_asr_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
