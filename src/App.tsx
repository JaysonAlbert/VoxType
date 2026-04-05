import { useState } from 'react'
import MicRecorder from './components/MicRecorder'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isAsrLoading, setIsAsrLoading] = useState(false)

  const handleTranscript = (text: string) => {
    setTranscript(prev => prev + (prev ? '\n\n' : '') + text)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript)
  }

  const handleClear = () => {
    setTranscript('')
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>VoxType - 语音输入助手</h1>

      <MicRecorder
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        onTranscript={handleTranscript}
        isAsrLoading={isAsrLoading}
        setIsAsrLoading={setIsAsrLoading}
      />

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={handleCopy}
          disabled={!transcript}
          style={{
            padding: '10px 20px',
            cursor: transcript ? 'pointer' : 'not-allowed',
            opacity: transcript ? 1 : 0.5,
          }}
        >
          复制文本
        </button>
        <button
          onClick={handleClear}
          disabled={!transcript}
          style={{
            padding: '10px 20px',
            cursor: transcript ? 'pointer' : 'not-allowed',
            opacity: transcript ? 1 : 0.5,
          }}
        >
          清空
        </button>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        minHeight: '200px',
        maxHeight: '400px',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        backgroundColor: '#f9f9f9',
      }}>
        {transcript || <span style={{ color: '#999' }}>点击麦克风开始语音输入...</span>}
      </div>

      {isAsrLoading && (
        <div style={{ marginTop: '10px', color: '#666' }}>
          正在加载 Whisper ASR 模型，请稍候...
        </div>
      )}
    </div>
  )
}

export default App
