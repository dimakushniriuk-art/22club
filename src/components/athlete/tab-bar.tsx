'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useIcon } from '@/components/ui/professional-icons'
import { useAuth } from '@/providers/auth-provider'
import Image from 'next/image'

interface TabItem {
  label: string
  href: string
  icon: string
  badge?: number
  showAvatar?: boolean
}

const tabItems: TabItem[] = [
  { label: 'Home', href: '/home', icon: '🏠' },
  { label: 'Allenamenti', href: '/home/allenamenti', icon: '💪' },
  { label: 'Appuntamenti', href: '/home/appuntamenti', icon: '📅' },
  { label: 'Progressi', href: '/home/progressi', icon: '📊' },
  { label: 'Chat', href: '/home/chat', icon: '💬' },
  { label: 'Documenti', href: '/home/documenti', icon: '📄' },
  { label: 'Profilo', href: '/home/profilo', icon: '👤', showAvatar: true },
]

export function TabBar() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Prepara tutte le icone necessarie
  const homeIcon = useIcon('🏠', { size: 24 })
  const workoutIcon = useIcon('💪', { size: 24 })
  const appointmentsIcon = useIcon('📅', { size: 24 })
  const progressIcon = useIcon('📊', { size: 24 })
  const chatIcon = useIcon('💬', { size: 24 })
  const docsIcon = useIcon('📄', { size: 24 })
  const profileIcon = useIcon('👤', { size: 24 })

  // Helper function per le icone
  const getIcon = (icon: string) => {
    switch (icon) {
      case '🏠':
        return homeIcon
      case '💪':
        return workoutIcon
      case '📅':
        return appointmentsIcon
      case '📊':
        return progressIcon
      case '💬':
        return chatIcon
      case '📄':
        return docsIcon
      case '👤':
        return profileIcon
      default:
        return icon
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="Navigazione principale"
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-teal-500/20 shadow-2xl shadow-teal-500/10" />

      {/* Content */}
      <div className="relative grid grid-cols-7">
        {tabItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={`Vai a ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex items-center justify-center py-4 transition-all duration-300 ease-out',
                // Focus ring rimosso
                'focus:outline-none',
                // Stati colore
                isActive ? 'text-teal-400' : 'text-gray-500 hover:text-teal-400',
                // Transizione smooth
                'active:scale-95',
              )}
            >
              {/* Active Indicator Background */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-transparent" />
              )}

              {/* Icon container */}
              <span
                className={cn(
                  'relative text-2xl flex items-center justify-center transition-all duration-300',
                  // Glow effect quando attivo
                  isActive && 'drop-shadow-[0_0_12px_rgba(20,184,166,0.6)] scale-110',
                  // Hover effect
                  !isActive && 'hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(20,184,166,0.4)]',
                )}
                role="img"
                aria-label={item.label}
              >
                {item.showAvatar && (user?.avatar || user?.avatar_url) ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    {/* Gradient Border */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 p-[2px]">
                      <div className="w-full h-full rounded-full bg-black" />
                    </div>
                    {/* Avatar Image */}
                    <Image
                      src={user.avatar || user.avatar_url || ''}
                      alt={user.nome || user.first_name || 'Profilo'}
                      width={32}
                      height={32}
                      className="absolute inset-[2px] rounded-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/20 via-transparent to-cyan-500/20" />
                  </div>
                ) : (
                  getIcon(item.icon)
                )}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
              )}

              {/* Indicatore visivo stato attivo per utenti con disabilità visive */}
              {isActive && <span className="sr-only">Pagina corrente</span>}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
