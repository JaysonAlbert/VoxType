import { useState, useCallback, useRef } from 'react'

interface MicRecorderProps {
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
  onTranscript: (text: string) => void
  isAsrLoading: boolean
  setIsAsrLoading: (loading: boolean) => void
}

export default function MicRecorder({
  isRecording,
  setIsRecording,
  onTranscript,
  isAsrLoading,
  setIsAsrLoading,
}: MicRecorderProps) {
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setIsAsrLoading(false)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

        // 调用 Tauri 后端进行 ASR 识别
        try {
          const { invoke } = await import('@tauri-apps/api/core')
          const result = await invoke<string>('record_and_transcribe', { audioBlob })
          onTranscript(result)
        } catch (err) {
          console.error('ASR error:', err)
          setError('语音识别失败，请检查后端 ASR 服务')
        }

        // 清理流
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      console.error('麦克风访问失败:', err)
      setError('无法访问麦克风，请检查权限设置')
      setIsRecording(false)
    }
  }, [onTranscript, setIsRecording, setIsAsrLoading])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording, setIsRecording])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const getButtonStyle = () => ({
    padding: '12px 24px',
    fontSize: '16px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: isRecording ? '#ff4444' : '#007bff',
    color: 'white',
    transition: 'background-color 0.2s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
      <button
        onClick={toggleRecording}
        disabled={isAsrLoading}
        style={{ ...getButtonStyle(), opacity: isAsrLoading ? 0.5 : 1 }}
      >
        {isRecording ? '停止录音' : '开始录音'}
      </button>

      {error && (
        <div style={{ color: '#ff4444', fontSize: '14px' }}>{error}</div>
      )}

      {isAsrLoading && (
        <div style={{ color: '#666', fontSize: '14px' }}>
          ASR 模型加载中...
        </div>
      )}
    </div>
  )
}
