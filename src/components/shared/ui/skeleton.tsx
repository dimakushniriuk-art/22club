import React from 'react'

type SkeletonProps = {
  height?: number
  width?: number | string
  className?: string
  rounded?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = 80,
  width = '100%',
  className = '',
  rounded = true,
}) => (
  <div
    className={`animate-pulse bg-surface-200 ${rounded ? 'rounded-xl' : ''} ${className}`}
    style={{ height, width }}
  />
)

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 rounded-xl bg-surface-200 ${className}`}>
    <Skeleton height={20} width="60%" className="mb-2" />
    <Skeleton height={16} width="40%" className="mb-4" />
    <Skeleton height={40} width="100%" />
  </div>
)

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)
