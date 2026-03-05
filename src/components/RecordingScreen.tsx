import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

function PlaceholderIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10" />
      <path d="M7 12h6" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .33 1.76l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.6 1.6 0 0 0 15 19.4a1.6 1.6 0 0 0-1 .6 1.6 1.6 0 0 0-.4 1V21a2 2 0 1 1-4 0v-.09a1.6 1.6 0 0 0-.4-1 1.6 1.6 0 0 0-1-.6 1.6 1.6 0 0 0-1.76.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-.6-1 1.6 1.6 0 0 0-1-.4H3a2 2 0 1 1 0-4h.09a1.6 1.6 0 0 0 1-.4 1.6 1.6 0 0 0 .6-1 1.6 1.6 0 0 0-.33-1.76l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9 4.6a1.6 1.6 0 0 0 1-.6 1.6 1.6 0 0 0 .4-1V3a2 2 0 1 1 4 0v.09a1.6 1.6 0 0 0 .4 1 1.6 1.6 0 0 0 1 .6 1.6 1.6 0 0 0 1.76-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 19.4 9c.25.32.45.68.6 1a1.6 1.6 0 0 0 1 .4H21a2 2 0 1 1 0 4h-.09a1.6 1.6 0 0 0-1 .4c-.15.32-.35.68-.51 1Z" />
    </svg>
  )
}

function MicIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v4" />
      <path d="M8 22h8" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

const RING_DELAYS = [0, 0.35, 0.7]

export function RecordingScreen() {
  const [isTyping, setIsTyping] = useState(false)
  const [typedEntry, setTypedEntry] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)

  const previousListeningRef = useRef(false)
  const lastLoggedTranscriptRef = useRef('')
  const confirmTimeoutRef = useRef<number | null>(null)

  const { isAvailable, isListening, transcript, startListening, stopListening, error } = useSpeechRecognition()

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date())
  }, [])

  const permissionDenied = error === 'permission-denied'
  const canUseMic = isAvailable && !permissionDenied
  const showTypingInput = !canUseMic || isTyping

  const triggerConfirmedState = () => {
    setIsConfirmed(true)

    if (confirmTimeoutRef.current !== null) {
      window.clearTimeout(confirmTimeoutRef.current)
    }

    confirmTimeoutRef.current = window.setTimeout(() => {
      setIsConfirmed(false)
      confirmTimeoutRef.current = null
    }, 600)
  }

  useEffect(() => {
    if (previousListeningRef.current && !isListening) {
      const spokenEntry = transcript.trim()

      if (spokenEntry && spokenEntry !== lastLoggedTranscriptRef.current) {
        console.log(spokenEntry)
        lastLoggedTranscriptRef.current = spokenEntry
        triggerConfirmedState()
      }
    }

    previousListeningRef.current = isListening
  }, [isListening, transcript])

  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current !== null) {
        window.clearTimeout(confirmTimeoutRef.current)
      }
    }
  }, [])

  const handleMicTap = () => {
    if (!canUseMic) {
      setIsTyping(true)
      return
    }

    if (isListening) {
      stopListening()
      return
    }

    startListening()
  }

  const handleTypedSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = typedEntry.trim()

    if (!value) {
      return
    }

    console.log(value)
    setTypedEntry('')
    triggerConfirmedState()
  }

  const micBackground = isListening ? '#2563EB' : isConfirmed ? '#10B981' : '#E5E7EB'
  const micForeground = isListening || isConfirmed ? '#FFFFFF' : '#6B7280'

  return (
    <main className="mx-auto min-h-screen w-full max-w-[420px] bg-[#FAFAF8] px-4 text-[#1A1A1A]">
      <div className="flex min-h-screen flex-col pb-8 pt-3">
        <header className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Review entries"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#6B7280]"
          >
            <PlaceholderIcon />
          </button>

          <button
            type="button"
            aria-label="Settings"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#6B7280]"
          >
            <GearIcon />
          </button>
        </header>

        {false && <section className="mt-4" aria-label="On This Day" />}

        <p className="mt-2 text-center text-sm font-medium text-[#6B7280]">{todayLabel}</p>

        <section className="flex flex-1 flex-col items-center justify-center pb-12 pt-10">
          {canUseMic && (
            <div className="relative flex h-[172px] w-full items-center justify-center">
              <AnimatePresence>
                {isListening &&
                  RING_DELAYS.map((delay) => (
                    <motion.span
                      key={delay}
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ scale: [1, 1.8], opacity: [0.28, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay, repeat: Number.POSITIVE_INFINITY }}
                      className="pointer-events-none absolute h-[76px] w-[76px] rounded-full border border-[#2563EB]"
                    />
                  ))}
              </AnimatePresence>

              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                animate={isConfirmed ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={
                  isConfirmed
                    ? { duration: 0.6, ease: 'easeInOut' }
                    : { type: 'spring', stiffness: 450, damping: 20, mass: 0.7 }
                }
                onClick={handleMicTap}
                aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
                className="relative z-10 flex h-[76px] w-[76px] items-center justify-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                style={{ backgroundColor: micBackground, color: micForeground }}
              >
                {isConfirmed ? <CheckIcon /> : <MicIcon />}
              </motion.button>
            </div>
          )}

          {permissionDenied && (
            <p className="mb-3 text-center text-sm text-[#6B7280]">Microphone access needed for voice input</p>
          )}

          <div className="mt-4 min-h-[120px] w-full px-4" aria-label="Transcription area">
            <p className="text-center font-serif text-[18px] leading-relaxed text-[#1A1A1A]">{transcript}</p>
          </div>

          {canUseMic && !showTypingInput && (
            <button
              type="button"
              onClick={() => setIsTyping(true)}
              className="mt-1 min-h-11 min-w-11 rounded-md px-2 text-sm text-[#6B7280]"
            >
              Type instead
            </button>
          )}

          {showTypingInput && (
            <form onSubmit={handleTypedSubmit} className="mt-1 w-full">
              <div className="relative rounded-2xl bg-white p-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <input
                  type="text"
                  value={typedEntry}
                  onChange={(event) => setTypedEntry(event.target.value)}
                  placeholder="What's your highlight today?"
                  className="h-12 w-full rounded-xl bg-transparent px-3 pr-14 font-serif text-[18px] text-[#1A1A1A] outline-none placeholder:text-[#9CA3AF]"
                />
                {canUseMic && (
                  <button
                    type="button"
                    onClick={() => setIsTyping(false)}
                    aria-label="Switch back to mic mode"
                    className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[#6B7280]"
                  >
                    <MicIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>
          )}

          {error && error !== 'permission-denied' && error !== 'unknown' && (
            <p className="mt-3 text-center text-sm text-[#6B7280]">
              {error === 'no-speech' && 'No speech detected. Try again or type instead.'}
              {error === 'network' && 'Voice service unavailable right now. Try again or type instead.'}
              {error === 'audio-capture' && 'No microphone detected. You can type your highlight instead.'}
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
