import { describe, it, expect } from 'vitest'
import { designSystem } from '@/config/design-system'

describe('Design System', () => {
  describe('Colors', () => {
    it('should have all required color tokens', () => {
      expect(designSystem.colors.background.DEFAULT).toBeDefined()
      expect(designSystem.colors.background.elevated).toBeDefined()
      expect(designSystem.colors.background.subtle).toBeDefined()
      expect(designSystem.colors.text.primary).toBeDefined()
      expect(designSystem.colors.text.secondary).toBeDefined()
      expect(designSystem.colors.text.muted).toBeDefined()
      expect(designSystem.colors.primary.DEFAULT).toBeDefined()
      expect(designSystem.colors.primary.hover).toBeDefined()
      expect(designSystem.colors.primary.active).toBeDefined()
      expect(designSystem.colors.accent.gold).toBeDefined()
      expect(designSystem.colors.accent.glow).toBeDefined()
      expect(designSystem.colors.success).toBeDefined()
      expect(designSystem.colors.warning).toBeDefined()
      expect(designSystem.colors.error).toBeDefined()
    })

    it('should have valid color values', () => {
      expect(designSystem.colors.background.DEFAULT).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(designSystem.colors.primary.DEFAULT).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(designSystem.colors.success).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(designSystem.colors.warning).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(designSystem.colors.error).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  describe('Typography', () => {
    it('should have font family defined', () => {
      expect(designSystem.fontFamily.sans).toBeDefined()
      expect(Array.isArray(designSystem.fontFamily.sans)).toBe(true)
      expect(designSystem.fontFamily.sans).toContain('Inter')
      expect(designSystem.fontFamily.sans).toContain('SF Pro Display')
    })
  })

  describe('Spacing', () => {
    it('should have all spacing values', () => {
      expect(designSystem.spacing.xs).toBeDefined()
      expect(designSystem.spacing.sm).toBeDefined()
      expect(designSystem.spacing.md).toBeDefined()
      expect(designSystem.spacing.lg).toBeDefined()
      expect(designSystem.spacing.xl).toBeDefined()
      expect(designSystem.spacing['2xl']).toBeDefined()
    })

    it('should have valid spacing values', () => {
      expect(designSystem.spacing.xs).toMatch(/^\d+px$/)
      expect(designSystem.spacing.sm).toMatch(/^\d+px$/)
      expect(designSystem.spacing.md).toMatch(/^\d+px$/)
      expect(designSystem.spacing.lg).toMatch(/^\d+px$/)
      expect(designSystem.spacing.xl).toMatch(/^\d+px$/)
      expect(designSystem.spacing['2xl']).toMatch(/^\d+px$/)
    })
  })

  describe('Border Radius', () => {
    it('should have all radius values', () => {
      expect(designSystem.radius.none).toBeDefined()
      expect(designSystem.radius.sm).toBeDefined()
      expect(designSystem.radius.md).toBeDefined()
      expect(designSystem.radius.lg).toBeDefined()
      expect(designSystem.radius.xl).toBeDefined()
      expect(designSystem.radius['2xl']).toBeDefined()
    })

    it('should have valid radius values', () => {
      expect(designSystem.radius.none).toMatch(/^\d+px$/)
      expect(designSystem.radius.sm).toMatch(/^\d+px$/)
      expect(designSystem.radius.md).toMatch(/^\d+px$/)
      expect(designSystem.radius.lg).toMatch(/^\d+px$/)
      expect(designSystem.radius.xl).toMatch(/^\d+px$/)
      expect(designSystem.radius['2xl']).toMatch(/^\d+px$/)
    })
  })

  describe('Shadows', () => {
    it('should have shadow values', () => {
      expect(designSystem.shadows.soft).toBeDefined()
      expect(designSystem.shadows.glow).toBeDefined()
    })

    it('should have valid shadow values', () => {
      expect(designSystem.shadows.soft).toMatch(/^0 \d+px \d+px rgba/)
      expect(designSystem.shadows.glow).toMatch(/^0 0 \d+px rgba/)
    })
  })

  describe('Gradients', () => {
    it('should have gradient values', () => {
      expect(designSystem.gradients['brand-teal-gold']).toBeDefined()
    })

    it('should have valid gradient values', () => {
      expect(designSystem.gradients['brand-teal-gold']).toMatch(/^linear-gradient/)
    })
  })
})
