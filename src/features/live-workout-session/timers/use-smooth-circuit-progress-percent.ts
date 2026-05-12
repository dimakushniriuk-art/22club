import React from 'react'

/** Barra progresso countdown circuito fullscreen: fluida (rAF + deadline wall-clock), non a scatti col tick 1s. */
export function useSmoothCircuitProgressPercent(opts: {
  active: boolean
  phaseKey: string
  phaseTotalSeconds: number
  remainingSeconds: number | null
  running: boolean
  stalePercent: number
}) {
  const endMsRef = React.useRef<number | null>(null)
  const totalMsRef = React.useRef(0)
  const lastPhaseKeyRef = React.useRef<string | null>(null)
  const wasRunningRef = React.useRef(false)
  const [rafTick, setRafTick] = React.useState(0)

  React.useEffect(() => {
    if (!opts.active) {
      lastPhaseKeyRef.current = null
      endMsRef.current = null
      return
    }
    if (
      opts.phaseTotalSeconds <= 0 ||
      opts.remainingSeconds === null ||
      opts.remainingSeconds <= 0
    ) {
      if (opts.phaseKey !== lastPhaseKeyRef.current) {
        lastPhaseKeyRef.current = opts.phaseKey
      }
      endMsRef.current = null
      return
    }
    if (opts.phaseKey !== lastPhaseKeyRef.current) {
      lastPhaseKeyRef.current = opts.phaseKey
      endMsRef.current = Date.now() + opts.remainingSeconds * 1000
      totalMsRef.current = opts.phaseTotalSeconds * 1000
    }
  }, [opts.active, opts.phaseKey, opts.phaseTotalSeconds, opts.remainingSeconds])

  React.useEffect(() => {
    if (!opts.active) {
      wasRunningRef.current = false
      return
    }
    if (opts.running) {
      if (
        !wasRunningRef.current &&
        opts.remainingSeconds != null &&
        opts.remainingSeconds > 0 &&
        opts.phaseTotalSeconds > 0
      ) {
        endMsRef.current = Date.now() + opts.remainingSeconds * 1000
        totalMsRef.current = opts.phaseTotalSeconds * 1000
      }
      wasRunningRef.current = true
    } else {
      wasRunningRef.current = false
    }
  }, [opts.active, opts.running, opts.remainingSeconds, opts.phaseTotalSeconds])

  React.useEffect(() => {
    if (!opts.active || !opts.running || endMsRef.current === null || totalMsRef.current <= 0) {
      return undefined
    }
    let id = 0
    const loop = () => {
      setRafTick((t) => (t + 1) % 1_000_000)
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [opts.active, opts.running, opts.phaseKey])

  return React.useMemo(() => {
    // Invalidazione memo su tick RAF e cambio fase (corpo legge solo ref / Date.now)
    void rafTick
    void opts.phaseKey
    if (!opts.active) return opts.stalePercent
    if (opts.phaseTotalSeconds <= 0) return opts.stalePercent
    if (!opts.running) {
      if (opts.remainingSeconds === null) return opts.stalePercent
      return Math.min(100, Math.max(0, (opts.remainingSeconds / opts.phaseTotalSeconds) * 100))
    }
    if (endMsRef.current === null || totalMsRef.current <= 0) return opts.stalePercent
    const rem = Math.max(0, endMsRef.current - Date.now())
    return Math.min(100, Math.max(0, (rem / totalMsRef.current) * 100))
  }, [
    opts.active,
    opts.running,
    opts.phaseTotalSeconds,
    opts.remainingSeconds,
    opts.stalePercent,
    opts.phaseKey,
    rafTick,
  ])
}
