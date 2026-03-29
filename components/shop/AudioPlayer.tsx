'use client'

import { useRef, useState } from 'react'

interface AudioPlayerProps {
  src: string
  title?: string
}

export function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const t = Number(e.target.value)
    audioRef.current.currentTime = t
    setCurrentTime(t)
  }

  return (
    <div className="bg-[var(--color-lilac-pale)] rounded-xl p-4 border border-[var(--color-lilac-soft)]">
      <p className="font-body text-sm text-[var(--color-lavender)] font-semibold mb-3">
        {title || 'Sample Preview (30s)'}
      </p>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        preload="metadata"
      />

      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={toggle}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-lavender)] text-white hover:bg-[var(--color-lavender-light)] transition-colors flex-shrink-0"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7L8 5z"/>
            </svg>
          )}
        </button>

        {/* Progress */}
        <div className="flex-1 flex items-center gap-2">
          <span className="font-body text-xs text-gray-500 w-10">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 30}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 rounded-full appearance-none bg-[var(--color-lilac-soft)] cursor-pointer accent-[var(--color-lavender)]"
          />
          <span className="font-body text-xs text-gray-500 w-10 text-right">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
