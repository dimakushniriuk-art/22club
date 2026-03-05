'use client'
import React from 'react'
import { motion } from 'framer-motion'

interface ShimmerProps {
  height?: number | string
  width?: number | string
  className?: string
  rounded?: boolean
  count?: number
}

// Componente Shimmer singolo
export const Shimmer: React.FC<ShimmerProps> = ({
  height = 20,
  width = '100%',
  className = '',
  rounded = true,
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-surface-300 ${
        rounded ? 'rounded-md' : ''
      } ${className}`}
      style={{ height, width }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

// Componente per liste di shimmer
export const ShimmerList: React.FC<{
  count?: number
  itemHeight?: number
  itemWidth?: string
  className?: string
  gap?: number
}> = ({ count = 3, itemHeight = 20, itemWidth = '100%', className = '', gap = 8 }) => {
  return (
    <div className={`space-y-${gap} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Shimmer key={index} height={itemHeight} width={itemWidth} className="my-1" />
      ))}
    </div>
  )
}

// Shimmer per card
export const ShimmerCard: React.FC<{
  className?: string
  showAvatar?: boolean
  lines?: number
}> = ({ className = '', showAvatar = false, lines = 3 }) => {
  return (
    <div className={`p-4 bg-surface-200 rounded-xl ${className}`}>
      <div className="flex items-start space-x-3">
        {showAvatar && <Shimmer height={40} width={40} className="rounded-full flex-shrink-0" />}
        <div className="flex-1 space-y-2">
          <Shimmer height={16} width="60%" />
          <Shimmer height={14} width="40%" />
          {lines > 2 && (
            <>
              <Shimmer height={14} width="80%" />
              {lines > 3 && <Shimmer height={14} width="70%" />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Shimmer per grafici
export const ShimmerChart: React.FC<{
  className?: string
  height?: number
  type?: 'line' | 'bar' | 'pie'
}> = ({ className = '', height = 200, type = 'line' }) => {
  if (type === 'pie') {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <Shimmer height={height} width={height} className="rounded-full" />
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`} style={{ height }}>
      <Shimmer height={20} width="30%" />
      <div className="flex items-end justify-between space-x-1" style={{ height: height - 40 }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Shimmer
            key={index}
            height={`${Math.random() * 60 + 20}%`}
            width="12%"
            className="rounded-t"
          />
        ))}
      </div>
    </div>
  )
}

// Shimmer per tabelle
export const ShimmerTable: React.FC<{
  rows?: number
  columns?: number
  className?: string
}> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Shimmer key={index} height={16} width="20%" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Shimmer key={colIndex} height={14} width="20%" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Shimmer per KPI cards
export const ShimmerKPI: React.FC<{
  count?: number
  className?: string
}> = ({ count = 4, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 bg-surface-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <Shimmer height={24} width={24} className="rounded" />
            <Shimmer height={16} width={40} />
          </div>
          <Shimmer height={32} width="60%" className="mb-2" />
          <Shimmer height={14} width="80%" />
        </div>
      ))}
    </div>
  )
}
