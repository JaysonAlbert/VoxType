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

      console.log('Requesting microphone access...')
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support getUserMedia API')
      }

      const constraints = { audio: true }
      console.log('Audio constraints:', constraints)

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Microphone access granted, stream:', stream)
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        console.log('Audio blob created:', audioBlob.size, 'bytes')

        // Call Tauri backend for ASR transcription
        try {
          const { invoke } = await import('@tauri-apps/api/core')
          console.log('Calling ASR function...')
          const result = await invoke<string>('record_and_transcribe', { audioBlob })
          console.log('ASR result:', result)
          onTranscript(result)
        } catch (err) {
          console.error('ASR error:', err)
          setError('Speech recognition failed, check backend ASR service')
        }

        // cleanup stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      console.log('Recording started')
    } catch (err) {
      const error = err as Error
      console.error('Microphone access failed:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      
      let errorMsg = 'Cannot access microphone'
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Permission denied: Allow microphone access in browser settings'
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'No microphone found'
      } else if (error.name === 'NotReadableError') {
        errorMsg = 'Microphone is in use by another app'
      } else if (error.name === 'OverconstrainedError') {
        errorMsg = 'Microphone constraints not met'
      } else if (error.name === 'NotAllowedError') {
        errorMsg = 'Permission denied'
      }
      
      setError(errorMsg)
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
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {error && (
        <div style={{ color: '#ff4444', fontSize: '14px' }}>{error}</div>
      )}

      {isAsrLoading && (
        <div style={{ color: '#666', fontSize: '14px' }}>
          Loading ASR model...
        </div>
      )}
    </div>
  )
}
