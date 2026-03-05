/**
 * 🎨 INDEX - UNIFIED DESIGN SYSTEM
 * =================================
 *
 * Export centralizzato per tutti i design tokens e utility del progetto 22Club.
 */

// =====================================================
// 🆕 NUOVO SISTEMA - TOKEN-BASED (CONSIGLIATO)
// =====================================================

export {
  // Design Tokens
  colorTokens,
  layoutTokens,
  typographyTokens,
  animationTokens,
  responsiveTokens,
  componentTokens,

  // Utilities
  utils,

  // Unified Design System
  unifiedDesignSystem,

  // Types
  type DesignSystem,
} from './master-design.config'

// =====================================================
// 🔧 SISTEMA LEGACY - ACCOUNT-SPECIFIC
// =====================================================

export {
  // Master system (legacy)
  masterColors,
  masterLayout,
  masterCards,
  masterButtons,
  masterTypography,
  masterAnimations,
  masterBreakpoints,

  // Utility functions (legacy)
  combineClasses,
  getCardClasses,
  getButtonClasses,
  getLayoutClasses,
  getAccountColors,
  getPrimaryGradient,
  getAccountTheme,
  getMasterTheme,

  // Account-specific shortcuts
  athleteTheme,
  getAthleteCardClasses,
  getAthleteButtonClasses,
  trainerTheme,
  getTrainerCardClasses,
  getTrainerButtonClasses,
  adminTheme,
  getAdminCardClasses,
  getAdminButtonClasses,
  getHomepageCardClasses,
  getHomepageButtonClasses,
  getAuthCardClasses,
  getAuthButtonClasses,

  // Types (legacy)
  type AccountType,
  type CardVariant,
  type ButtonVariant,
  type LayoutVariant,
} from './master-design.config'

// =====================================================
// 📤 DEFAULT EXPORT
// =====================================================

export { default } from './master-design.config'
