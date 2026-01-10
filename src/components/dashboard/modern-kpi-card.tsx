'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'

export type KPIColor =
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'cyan'
  | 'indigo'
  | 'teal'
  | 'red'
  | 'gray'

interface ModernKPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: KPIColor
  href?: string
  onClick?: () => void
  animationDelay?: string
}

const colorClasses: Record<
  KPIColor,
  {
    border: string
    shadow: string
    gradient: string
    iconBg: string
    iconText: string
  }
> = {
  blue: {
    border: 'border-blue-500/30',
    shadow: 'shadow-blue-500/10',
    gradient: 'from-blue-500/5 via-transparent to-indigo-500/5',
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-400',
  },
  green: {
    border: 'border-green-500/30',
    shadow: 'shadow-green-500/10',
    gradient: 'from-green-500/5 via-transparent to-emerald-500/5',
    iconBg: 'bg-green-500/20',
    iconText: 'text-green-400',
  },
  orange: {
    border: 'border-orange-500/30',
    shadow: 'shadow-orange-500/10',
    gradient: 'from-orange-500/5 via-transparent to-amber-500/5',
    iconBg: 'bg-orange-500/20',
    iconText: 'text-orange-400',
  },
  purple: {
    border: 'border-purple-500/30',
    shadow: 'shadow-purple-500/10',
    gradient: 'from-purple-500/5 via-transparent to-violet-500/5',
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
  },
  cyan: {
    border: 'border-cyan-500/30',
    shadow: 'shadow-cyan-500/10',
    gradient: 'from-cyan-500/5 via-transparent to-teal-500/5',
    iconBg: 'bg-cyan-500/20',
    iconText: 'text-cyan-400',
  },
  indigo: {
    border: 'border-indigo-500/30',
    shadow: 'shadow-indigo-500/10',
    gradient: 'from-indigo-500/5 via-transparent to-purple-500/5',
    iconBg: 'bg-indigo-500/20',
    iconText: 'text-indigo-400',
  },
  teal: {
    border: 'border-teal-500/30',
    shadow: 'shadow-teal-500/10',
    gradient: 'from-teal-500/5 via-transparent to-cyan-500/5',
    iconBg: 'bg-teal-500/20',
    iconText: 'text-teal-400',
  },
  red: {
    border: 'border-red-500/30',
    shadow: 'shadow-red-500/10',
    gradient: 'from-red-500/5 via-transparent to-rose-500/5',
    iconBg: 'bg-red-500/20',
    iconText: 'text-red-400',
  },
  gray: {
    border: 'border-gray-500/30',
    shadow: 'shadow-gray-500/10',
    gradient: 'from-gray-500/5 via-transparent to-slate-500/5',
    iconBg: 'bg-gray-500/20',
    iconText: 'text-gray-400',
  },
}

export const ModernKPICard: React.FC<ModernKPICardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  href,
  onClick,
  animationDelay,
}) => {
  const colors = colorClasses[color]

  const hoverBorderClass = {
    blue: 'hover:border-blue-500/50',
    green: 'hover:border-green-500/50',
    orange: 'hover:border-orange-500/50',
    purple: 'hover:border-purple-500/50',
    cyan: 'hover:border-cyan-500/50',
    indigo: 'hover:border-indigo-500/50',
    teal: 'hover:border-teal-500/50',
    red: 'hover:border-red-500/50',
    gray: 'hover:border-gray-500/50',
  }[color]

  const cardContent = (
    <Card
      variant="trainer"
      className={`relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary ${colors.border} shadow-lg ${colors.shadow} backdrop-blur-xl ${hoverBorderClass} transition-all duration-200 h-full min-h-[120px] ${
        onClick || href ? 'cursor-pointer' : ''
      }`}
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-br ${colors.gradient}`}
      />
      <CardContent className="p-4 relative h-full flex flex-col justify-center">
        <div className="flex flex-col">
          <p className="text-text-secondary text-sm mb-2">{title}</p>
          <div className="flex items-center justify-between">
            <p className="text-text-primary text-2xl font-bold">{value}</p>
            <div className={`${colors.iconBg} ${colors.iconText} rounded-full p-3 flex-shrink-0`}>
              <div className="h-5 w-5">{icon}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{cardContent}</Link>
  }

  if (onClick) {
    return <div onClick={onClick}>{cardContent}</div>
  }

  return cardContent
}
