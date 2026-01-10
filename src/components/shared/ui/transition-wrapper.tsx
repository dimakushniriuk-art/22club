'use client'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Transition } from 'framer-motion'

// Import dinamico per evitare problemi di compatibilità con React 19
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let motionModule: any = null

const loadFramerMotion = async () => {
  if (typeof window === 'undefined') return null
  if (motionModule) return motionModule

  try {
    motionModule = await import('framer-motion')
    return motionModule
  } catch (error) {
    console.warn('Errore nel caricamento di framer-motion:', error)
    return null
  }
}

interface TransitionWrapperProps {
  children: React.ReactNode
  className?: string
}

// Varianti di animazione per diversi tipi di transizioni
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
}

const pageTransition: Transition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
}

// Varianti per transizioni più veloci
const quickVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  },
}

const quickTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.25,
}

// Varianti per transizioni slide
const slideVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: -20,
  },
}

const slideTransition: Transition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  className = '',
}) => {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [framerMotion, setFramerMotion] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const framerMotionModule = await loadFramerMotion()
      setFramerMotion(framerMotionModule)
      setMounted(true)
    }
    load()
  }, [])

  // Fallback se motion non è disponibile (SSR o errori di caricamento)
  if (!mounted || !framerMotion || !framerMotion.motion?.div) {
    return <div className={className}>{children}</div>
  }

  const { motion, AnimatePresence } = framerMotion

  try {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  } catch (error) {
    // Fallback in caso di errore con framer-motion
    console.warn('Errore con framer-motion, usando fallback:', error)
    return <div className={className}>{children}</div>
  }
}

// Wrapper per transizioni veloci
export const QuickTransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  className = '',
}) => {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [framerMotion, setFramerMotion] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const framerMotionModule = await loadFramerMotion()
      setFramerMotion(framerMotionModule)
      setMounted(true)
    }
    load()
  }, [])

  if (!mounted || !framerMotion || !framerMotion.motion?.div) {
    return <div className={className}>{children}</div>
  }

  const { motion, AnimatePresence } = framerMotion

  try {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={quickVariants}
          transition={quickTransition}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  } catch (error) {
    console.warn('Errore con framer-motion, usando fallback:', error)
    return <div className={className}>{children}</div>
  }
}

// Wrapper per transizioni slide
export const SlideTransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  className = '',
}) => {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [framerMotion, setFramerMotion] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const framerMotionModule = await loadFramerMotion()
      setFramerMotion(framerMotionModule)
      setMounted(true)
    }
    load()
  }, [])

  if (!mounted || !framerMotion || !framerMotion.motion?.div) {
    return <div className={className}>{children}</div>
  }

  const { motion, AnimatePresence } = framerMotion

  try {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={slideVariants}
          transition={slideTransition}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  } catch (error) {
    console.warn('Errore con framer-motion, usando fallback:', error)
    return <div className={className}>{children}</div>
  }
}

// Wrapper per animazioni di entrata
export const FadeInWrapper: React.FC<{
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}> = ({ children, delay = 0, duration = 0.5, className = '' }) => {
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [framerMotion, setFramerMotion] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const framerMotionModule = await loadFramerMotion()
      setFramerMotion(framerMotionModule)
      setMounted(true)
    }
    load()
  }, [])

  if (!mounted || !framerMotion || !framerMotion.motion?.div) {
    return <div className={className}>{children}</div>
  }

  const { motion } = framerMotion

  try {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration,
          delay,
          ease: 'easeOut',
        }}
        className={className}
      >
        {children}
      </motion.div>
    )
  } catch (error) {
    console.warn('Errore con framer-motion, usando fallback:', error)
    return <div className={className}>{children}</div>
  }
}

// Wrapper per animazioni stagger (per liste)
export const StaggerWrapper: React.FC<{
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}> = ({ children, staggerDelay = 0.1, className = '' }) => {
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [framerMotion, setFramerMotion] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const framerMotionModule = await loadFramerMotion()
      setFramerMotion(framerMotionModule)
      setMounted(true)
    }
    load()
  }, [])

  if (!mounted || !framerMotion || !framerMotion.motion?.div) {
    return <div className={className}>{children}</div>
  }

  const { motion } = framerMotion

  try {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
            },
          },
        }}
        className={className}
      >
        {children}
      </motion.div>
    )
  } catch (error) {
    console.warn('Errore con framer-motion, usando fallback:', error)
    return <div className={className}>{children}</div>
  }
}

// Wrapper per elementi individuali in una lista stagger
export const StaggerItem: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => {
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [framerMotion, setFramerMotion] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const framerMotionModule = await loadFramerMotion()
      setFramerMotion(framerMotionModule)
      setMounted(true)
    }
    load()
  }, [])

  if (!mounted || !framerMotion || !framerMotion.motion?.div) {
    return <div className={className}>{children}</div>
  }

  const { motion } = framerMotion

  try {
    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        className={className}
      >
        {children}
      </motion.div>
    )
  } catch (error) {
    console.warn('Errore con framer-motion, usando fallback:', error)
    return <div className={className}>{children}</div>
  }
}
