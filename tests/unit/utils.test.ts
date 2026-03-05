import { describe, it, expect } from 'vitest'
import { hasPermission, canAccessResource } from '@/types/user'

describe('Utility functions', () => {
  describe('hasPermission', () => {
    it('should return true for higher role permissions', () => {
      expect(hasPermission('admin', 'trainer')).toBe(true)
      expect(hasPermission('admin', 'athlete')).toBe(true)
      expect(hasPermission('trainer', 'athlete')).toBe(true)
    })

    it('should return true for same role permissions', () => {
      expect(hasPermission('admin', 'admin')).toBe(true)
      expect(hasPermission('trainer', 'trainer')).toBe(true)
      expect(hasPermission('athlete', 'athlete')).toBe(true)
    })

    it('should return false for lower role permissions', () => {
      expect(hasPermission('athlete', 'trainer')).toBe(false)
      expect(hasPermission('athlete', 'admin')).toBe(false)
      expect(hasPermission('trainer', 'admin')).toBe(false)
    })
  })

  describe('canAccessResource', () => {
    it('should return true for valid access', () => {
      expect(canAccessResource('test-org-id', 'test-org-id', 'admin', 'trainer')).toBe(true)
      expect(canAccessResource('test-org-id', 'test-org-id', 'trainer', 'athlete')).toBe(true)
      expect(canAccessResource('test-org-id', 'test-org-id', 'athlete', 'athlete')).toBe(true)
    })

    it('should return false for different org_id', () => {
      expect(canAccessResource('test-org-id', 'other-org-id', 'admin', 'trainer')).toBe(false)
      expect(canAccessResource('test-org-id', 'other-org-id', 'trainer', 'athlete')).toBe(false)
      expect(canAccessResource('test-org-id', 'other-org-id', 'athlete', 'athlete')).toBe(false)
    })

    it('should return false for insufficient permissions', () => {
      expect(canAccessResource('test-org-id', 'test-org-id', 'athlete', 'trainer')).toBe(false)
      expect(canAccessResource('test-org-id', 'test-org-id', 'athlete', 'admin')).toBe(false)
      expect(canAccessResource('test-org-id', 'test-org-id', 'trainer', 'admin')).toBe(false)
    })

    it('should return false for null org_id', () => {
      expect(canAccessResource(null, 'test-org-id', 'admin', 'trainer')).toBe(false)
      expect(canAccessResource(null, 'test-org-id', 'trainer', 'athlete')).toBe(false)
      expect(canAccessResource(null, 'test-org-id', 'athlete', 'athlete')).toBe(false)
    })

    it('should use default required role', () => {
      expect(canAccessResource('test-org-id', 'test-org-id', 'admin')).toBe(true)
      expect(canAccessResource('test-org-id', 'test-org-id', 'trainer')).toBe(true)
      expect(canAccessResource('test-org-id', 'test-org-id', 'athlete')).toBe(true)
    })
  })
})
