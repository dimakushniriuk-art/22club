import type { MutableRefObject } from 'react'

/** Secondi di countdown "Preparati" nel circuito fullscreen prima dell'esecuzione automatica */
export const CIRCUIT_FULLSCREEN_PREPARE_SECONDS = 10

/** 5 beep ascendenti (Hz crescenti) durante il countdown 5→1 prima del timer di esecuzione */
const EXECUTION_PRE_ROLL_FREQ_HZ = [523.25, 587.33, 659.25, 783.99, 880] as const

/** Suono timer: crea e avvia un tono con Web Audio API (durata in ms, volume 0-1, frequenza Hz) */
export function playTimerTone(
  audioContextRef: MutableRefObject<AudioContext | null>,
  durationMs: number,
  volume: number,
  frequencyHz = 520,
): void {
  try {
    if (typeof window === 'undefined') return
    const ctx =
      audioContextRef.current ??
      new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )()
    if (!audioContextRef.current) audioContextRef.current = ctx
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = frequencyHz
    osc.type = 'sine'
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + 0.02)
    gain.gain.setValueAtTime(volume, now + durationMs / 1000 - 0.05)
    gain.gain.linearRampToValueAtTime(0, now + durationMs / 1000)
    osc.start(now)
    osc.stop(now + durationMs / 1000)
  } catch {
    // Ignora errori (es. autoplay policy)
  }
}

export function playExecutionPreRollTone(
  audioContextRef: MutableRefObject<AudioContext | null>,
  stepRemaining: number,
): void {
  const idx = 5 - Math.min(5, Math.max(1, stepRemaining))
  const hz = EXECUTION_PRE_ROLL_FREQ_HZ[idx] ?? 523.25
  playTimerTone(audioContextRef, 200, 0.88, hz)
}
