import React from 'react'

interface IconProps {
  size?: number
  className?: string
  color?: string
}

// Componente base per icone professionali
export const ProfessionalIcon: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block ${className}`}
  >
    {children}
  </svg>
)

// Dashboard
export const DashboardIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </ProfessionalIcon>
)

// Clienti/Utenti
export const UsersIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="m22 21-3-3m0 0a2 2 0 1 0-2.83-2.83l2.83 2.83Z" />
  </ProfessionalIcon>
)

// Aggiungi/Plus
export const PlusIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </ProfessionalIcon>
)

// Chat
export const MessageIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </ProfessionalIcon>
)

// Allenamenti/Fitness
export const DumbbellIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M6.5 6.5h11v11h-11z" />
    <path d="M6.5 6.5L3 3" />
    <path d="M17.5 17.5L21 21" />
    <path d="M6.5 17.5L3 21" />
    <path d="M17.5 6.5L21 3" />
  </ProfessionalIcon>
)

// Libro/Documenti
export const BookIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </ProfessionalIcon>
)

// Calendario
export const CalendarIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </ProfessionalIcon>
)

// Documento
export const FileIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </ProfessionalIcon>
)

// Soldi/Pagamenti
export const DollarIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M12 1v22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </ProfessionalIcon>
)

// Comunicazioni/Megafono
export const MegaphoneIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M3 11l18-5v12L3 13v-2z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </ProfessionalIcon>
)

// Notifiche/Campanella
export const BellIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </ProfessionalIcon>
)

// Profilo/Utente
export const UserIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </ProfessionalIcon>
)

// Statistiche/Grafico
export const BarChartIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M12 20V10" />
    <path d="M18 20V4" />
    <path d="M6 20v-4" />
  </ProfessionalIcon>
)

// Impostazioni/Ingranaggio
export const SettingsIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </ProfessionalIcon>
)

// Home
export const HomeIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </ProfessionalIcon>
)

// Target/Obiettivo
export const TargetIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </ProfessionalIcon>
)

// Check/Successo
export const CheckIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M20 6L9 17l-5-5" />
  </ProfessionalIcon>
)

// Warning
export const AlertTriangleIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </ProfessionalIcon>
)

// X/Close
export const XIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </ProfessionalIcon>
)

// Edit
export const EditIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </ProfessionalIcon>
)

// Trash/Elimina
export const TrashIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </ProfessionalIcon>
)

// File attachment
export const PaperclipIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.49" />
  </ProfessionalIcon>
)

// Image
export const ImageIcon: React.FC<IconProps> = ({ size = 24, className, color }) => (
  <ProfessionalIcon size={size} className={className} color={color}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </ProfessionalIcon>
)

// Mappa icona per sostituire emoji
export const iconMap = {
  '📊': DashboardIcon,
  '👥': UsersIcon,
  '➕': PlusIcon,
  '💬': MessageIcon,
  '💪': DumbbellIcon,
  '📚': BookIcon,
  '📅': CalendarIcon,
  '📄': FileIcon,
  '💰': DollarIcon,
  '📢': MegaphoneIcon,
  '🔔': BellIcon,
  '👤': UserIcon,
  '📈': BarChartIcon,
  '⚙️': SettingsIcon,
  '🏠': HomeIcon,
  '🎯': TargetIcon,
  '✅': CheckIcon,
  '⚠️': AlertTriangleIcon,
  '❌': XIcon,
  '✏️': EditIcon,
  '🗑️': TrashIcon,
  '📎': PaperclipIcon,
  '🖼️': ImageIcon,
}

// Hook per ottenere l'icona corrispondente
export const useIcon = (emoji: string, props?: IconProps) => {
  const IconComponent = iconMap[emoji as keyof typeof iconMap]
  return IconComponent ? <IconComponent {...props} /> : null
}

// Funzione helper (non-hook) per ottenere l'icona - da usare dentro callback/useMemo
export const getIconComponent = (emoji: string, props?: IconProps): React.ReactNode => {
  const IconComponent = iconMap[emoji as keyof typeof iconMap]
  return IconComponent ? <IconComponent {...props} /> : null
}
