use hound::{WavSpec, WavWriter};
use std::io::BufWriter;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use whisper_rs::{
    convert_integer_to_float_audio, FullParams, SamplingStrategy, WhisperContext,
    WhisperContextParameters,
};

pub struct AsrService {
    ctx: Mutex<Option<Arc<WhisperContext>>>,
    app_dir: PathBuf,
}

impl AsrService {
    pub fn new() -> Self {
        let app_dir = std::env::current_dir().unwrap_or_default().join("models");

        let _ = std::fs::create_dir_all(&app_dir);

        Self {
            ctx: Mutex::new(None),
            app_dir,
        }
    }

    pub fn init(&mut self) -> Result<(), String> {
        let mut lock = self.ctx.lock().map_err(|e| e.to_string())?;

        if lock.is_some() {
            println!("Whisper ASR already initialized");
            return Ok(());
        }

        let model_path_gguf = self.app_dir.join("whisper-tiny").join("model.gguf");
        let model_path = if model_path_gguf.exists() {
            model_path_gguf
        } else {
            self.app_dir.join("whisper-tiny")
        };

        println!("Initializing Whisper ASR from: {:?}", model_path);

        if !model_path.exists() {
            return Err(format!(
                "Model file not found at {:?}. \nExpected GGUF format (e.g., whisper-tiny.en.gguf).\nSee: https://github.com/ggerganov/whisper.cpp/blob/master/models/README.md",
                model_path
            ));
        }

        let params = WhisperContextParameters::default();
        let ctx = WhisperContext::new_with_params(&model_path, params)
            .map_err(|e| format!("Failed to load whisper model: {}", e))?;

        let ctx = Arc::new(ctx);

        *lock = Some(ctx);
        println!("Whisper ASR initialized successfully (Chinese and English support)");
        Ok(())
    }

    pub fn is_loaded(&self) -> bool {
        self.ctx.lock().is_ok() && self.ctx.lock().unwrap().is_some()
    }

    pub fn transcribe(&self, audio_data: &[u8]) -> Result<String, String> {
        let ctx = {
            let lock = self.ctx.lock().map_err(|e| e.to_string())?;
            lock.as_ref().ok_or("Model not initialized")?.clone()
        };

        let temp_dir = std::env::temp_dir().join("voxtype_asr");
        let input_id = std::process::id();
        let input_wav = temp_dir.join(format!(
            "{}_{}.wav",
            input_id,
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis()
        ));

        let file = std::fs::File::create(&input_wav)
            .map_err(|e| format!("Failed to create WAV file: {}", e))?;

        let wav_spec = WavSpec {
            channels: 1,
            sample_rate: 16000,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };

        let mut writer = WavWriter::new(BufWriter::new(file), wav_spec)
            .map_err(|e| format!("Failed to create WAV writer: {}", e))?;

        let mut samples: Vec<i16> = Vec::with_capacity(audio_data.len());
        for &sample in audio_data {
            samples.push(if sample > 127 {
                sample as i16 - 256
            } else {
                sample as i16
            });
        }

        for sample in &samples {
            writer
                .write_sample(*sample)
                .map_err(|e| format!("Failed to write sample: {}", e))?;
        }

        writer
            .finalize()
            .map_err(|e| format!("Failed to finalize WAV: {}", e))?;

        let mut state = ctx
            .create_state()
            .map_err(|e| format!("Failed to create state: {}", e))?;

        let mut params = FullParams::new(SamplingStrategy::BeamSearch {
            beam_size: 5,
            patience: -1.0,
        });
        params.set_print_special(false);
        params.set_print_timestamps(false);
        params.set_translate(false);
        params.set_single_segment(true);
        params.set_language(Some("zh"));

        // Convert i16 samples to f32 for the model
        let mut float_samples: Vec<f32> = vec![0.0; samples.len()];
        convert_integer_to_float_audio(&samples, &mut float_samples)
            .map_err(|e| format!("Failed to convert audio: {}", e))?;

        state
            .full(params, &float_samples[..])
            .map_err(|e| format!("Failed to run transcription: {}", e))?;

        let mut text = String::new();
        for segment in state.as_iter() {
            text.push_str(&segment.to_string());
            text.push('\n');
        }

        let _ = std::fs::remove_file(&input_wav);

        Ok(text.trim().to_string())
    }
}

impl Default for AsrService {
    fn default() -> Self {
        Self::new()
    }
}
