import React from 'react'
import { motion } from 'framer-motion'
import { triggerHaptic } from '@/lib/haptics'

type Props = {
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  onClick?: () => void
}

export const KpiCard: React.FC<Props> = React.memo(({ label, value, trend, icon, onClick }) => {
  const handleClick = () => {
    triggerHaptic('light')
    onClick?.()
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      className={`flex flex-col justify-center items-center p-4 rounded-2xl shadow-soft bg-surface-200 w-full md:w-1/4 text-center transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:bg-surface-300 active:bg-surface-400' : ''
      }`}
    >
      {icon && <div className="mb-2">{icon}</div>}
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-2xl font-semibold text-primary mt-1">{value}</span>
      {trend && (
        <span
          className={`text-xs mt-1 ${
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-text-muted'
          }`}
        >
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
        </span>
      )}
    </motion.div>
  )
})

KpiCard.displayName = 'KpiCard'
