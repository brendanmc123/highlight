import { useCallback, useEffect, useRef, useState } from 'react'

interface SpeechRecognitionAlternative {
  transcript: string
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
  length: number
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionInstance {
  lang: string
  interimResults: boolean
  continuous: boolean
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

type SpeechErrorCode = 'permission-denied' | 'no-speech' | 'network' | 'audio-capture' | 'unknown' | null

function toSpeechErrorCode(error: string): SpeechErrorCode {
  if (error === 'not-allowed' || error === 'service-not-allowed') {
    return 'permission-denied'
  }

  if (error === 'no-speech') {
    return 'no-speech'
  }

  if (error === 'network') {
    return 'network'
  }

  if (error === 'audio-capture') {
    return 'audio-capture'
  }

  return 'unknown'
}

export function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const finalizedTranscriptRef = useRef('')

  const [isAvailable, setIsAvailable] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<SpeechErrorCode>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const SpeechRecognitionAPI = window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      setIsAvailable(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      let interimText = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const spokenText = result[0]?.transcript?.trim() ?? ''

        if (!spokenText) {
          continue
        }

        if (result.isFinal) {
          finalizedTranscriptRef.current = `${finalizedTranscriptRef.current} ${spokenText}`.trim()
        } else {
          interimText = `${interimText} ${spokenText}`.trim()
        }
      }

      setTranscript(`${finalizedTranscriptRef.current} ${interimText}`.trim())
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      setError(toSpeechErrorCode(event.error))
    }

    recognition.onend = () => {
      setIsListening(false)
      setTranscript((previous) => finalizedTranscriptRef.current || previous)
    }

    recognitionRef.current = recognition
    setIsAvailable(true)

    return () => {
      recognition.onstart = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.abort()
      recognitionRef.current = null
    }
  }, [])

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current

    if (!recognition) {
      setError('unknown')
      return
    }

    finalizedTranscriptRef.current = ''
    setTranscript('')
    setError(null)

    try {
      recognition.start()
    } catch {
      setError('unknown')
    }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return {
    isAvailable,
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
  }
}
