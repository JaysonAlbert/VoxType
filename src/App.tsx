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
      <h1 style={{ marginBottom: '20px' }}>VoxType - Speech Input Assistant</h1>

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
          Copy Text
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
          Clear
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
        {transcript || <span style={{ color: '#999' }}>Click the microphone to start speech input...</span>}
      </div>

      {isAsrLoading && (
        <div style={{ marginTop: '10px', color: '#666' }}>
          Loading Whisper ASR model, please wait...
        </div>
      )}
    </div>
  )
}

export default App
