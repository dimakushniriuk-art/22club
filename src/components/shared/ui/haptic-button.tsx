'use client'
import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { triggerHaptic, type HapticType } from '@/lib/haptics'

interface HapticButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode
  hapticType?: HapticType
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
  secondary: 'bg-surface-200 text-text-primary hover:bg-surface-300 active:bg-surface-400',
  outline: 'border border-primary text-primary hover:bg-primary/10 active:bg-primary/20',
  ghost: 'text-text-primary hover:bg-surface-200 active:bg-surface-300',
  danger: 'bg-error text-white hover:bg-error/90 active:bg-error/80',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  children,
  hapticType = 'light',
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  disabled,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      triggerHaptic(hapticType)
      onClick?.(e)
    }
  }

  const motionProps = rest as HTMLMotionProps<'button'>

  return (
    <motion.button
      {...motionProps}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {!loading && icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}

      {!loading && children}

      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </motion.button>
  )
}

// Componente per pulsanti di azione specifici
export const ActionButton: React.FC<{
  children: React.ReactNode
  action: 'success' | 'error' | 'warning' | 'info'
  onClick?: () => void
  className?: string
}> = ({ children, action, onClick, className = '' }) => {
  const hapticMap: Record<typeof action, HapticType> = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'light',
  }

  const variantMap: Record<typeof action, HapticButtonProps['variant']> = {
    success: 'primary',
    error: 'danger',
    warning: 'outline',
    info: 'secondary',
  }

  return (
    <HapticButton
      hapticType={hapticMap[action]}
      variant={variantMap[action]}
      onClick={onClick}
      className={className}
    >
      {children}
    </HapticButton>
  )
}

// Componente per pulsanti di conferma
export const ConfirmButton: React.FC<{
  children: React.ReactNode
  onConfirm: () => void
  confirmText?: string
  className?: string
}> = ({ children, onConfirm, confirmText = 'Conferma', className = '' }) => {
  const [showConfirm, setShowConfirm] = React.useState(false)

  const handleClick = () => {
    if (showConfirm) {
      triggerHaptic('medium')
      onConfirm()
      setShowConfirm(false)
    } else {
      triggerHaptic('light')
      setShowConfirm(true)
    }
  }

  const handleCancel = () => {
    triggerHaptic('light')
    setShowConfirm(false)
  }

  return (
    <div className="flex gap-2">
      <HapticButton
        hapticType="light"
        variant={showConfirm ? 'danger' : 'primary'}
        onClick={handleClick}
        className={className}
      >
        {showConfirm ? confirmText : children}
      </HapticButton>

      {showConfirm && (
        <HapticButton hapticType="light" variant="ghost" onClick={handleCancel}>
          Annulla
        </HapticButton>
      )}
    </div>
  )
}
