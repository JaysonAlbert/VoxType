# Convert Whisper .bin model to GGUF format

## Required:
1. Download whisper.cpp: https://github.com/ggerganov/whisper.cpp
2. Build it: run `make` in the whisper.cpp directory

## Usage:
1. Replace MODEL_PATH with your model location (whisper-tiny.bin in your case)
2. Replace OUTPUT_PATH with the desired output location
3. Run this script with `python convert_to_gguf.py`

from pathlib import Path
import subprocess
import sys

# Configuration
MODEL_PATH = Path(r"D:\Projects\VoxType\models\whisper-tiny.bin")
OUTPUT_PATH = Path(r"D:\Projects\VoxType\models\whisper-tiny\model.gguf")
GGML_FOLDER = r"D:\Projects\VoxType\src-tauri\vcpkg_installed\x64\bin"

# Ensure the output directory exists
OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

print(f"Converting model from {MODEL_PATH} to {OUTPUT_PATH}")

# Run the conversion tool
result = subprocess.run(
    [
        "python",
        "convert-to-gguf.py",
        MODEL_PATH,
        OUTPUT_PATH
    ],
    env={
        **dict(),
        "PATH": f"{GGML_FOLDER};{PATH}" if "PATH" in dict() else GGML_FOLDER
    }
)

if result.returncode == 0:
    print(f"Conversion successful: {OUTPUT_PATH}")
else:
    print(f"Conversion failed with exit code {result.returncode}")
    print("Make sure you have the whisper.cpp tools available in your PATH")
    sys.exit(1)
