import { describe, it, expect } from 'vitest'
import type {
  UserRole,
  UserProfile,
  AuthContext,
  JWTClaims,
  Document,
  Exercise,
  Appointment,
} from '@/types'

describe('Type definitions', () => {
  describe('UserRole', () => {
    it('should accept valid user roles', () => {
      const validRoles: UserRole[] = ['athlete', 'trainer', 'admin']

      validRoles.forEach((role) => {
        expect(role).toMatch(/^(athlete|trainer|admin)$/)
      })
    })
  })

  describe('UserProfile', () => {
    it('should have required properties', () => {
      const profile: UserProfile = {
        id: 'test-id',
        org_id: 'test-org-id',
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'trainer',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(profile.id).toBeDefined()
      expect(profile.org_id).toBeDefined()
      expect(profile.full_name).toBeDefined()
      expect(profile.email).toBeDefined()
      expect(profile.role).toBeDefined()
      expect(profile.created_at).toBeDefined()
    })
  })

  describe('AuthContext', () => {
    it('should have required properties', () => {
      const context: AuthContext = {
        user: null,
        role: null,
        org_id: null,
        loading: true,
      }

      expect(context.user).toBeNull()
      expect(context.role).toBeNull()
      expect(context.org_id).toBeNull()
      expect(context.loading).toBe(true)
    })
  })

  describe('JWTClaims', () => {
    it('should have required properties', () => {
      const claims: JWTClaims = {
        sub: 'test-user-id',
        email: 'test@example.com',
        role: 'trainer',
        org_id: 'test-org-id',
        iat: 1640995200,
        exp: 1641081600,
      }

      expect(claims.sub).toBeDefined()
      expect(claims.email).toBeDefined()
      expect(claims.role).toBeDefined()
      expect(claims.org_id).toBeDefined()
      expect(claims.iat).toBeDefined()
      expect(claims.exp).toBeDefined()
    })
  })

  describe('Document', () => {
    it('should have required properties', () => {
      const document: Document = {
        id: 'test-doc-id',
        athlete_id: 'test-athlete-id',
        uploaded_by_profile_id: 'test-staff-id',
        file_url: 'https://example.com/test.pdf',
        category: 'certificato',
        status: 'valido',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(document.id).toBeDefined()
      expect(document.athlete_id).toBeDefined()
      expect(document.file_url).toBeDefined()
      expect(document.category).toBeDefined()
      expect(document.status).toBeDefined()
      expect(document.created_at).toBeDefined()
    })
  })

  describe('Exercise', () => {
    it('should have required properties', () => {
      const exercise: Exercise = {
        id: 'test-exercise-id',
        org_id: 'test-org-id',
        name: 'Test Exercise',
        category: 'Test Category',
        muscle_group: 'Pettorali',
        difficulty: 'media',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(exercise.id).toBeDefined()
      expect(exercise.org_id).toBeDefined()
      expect(exercise.name).toBeDefined()
      expect(exercise.category).toBeDefined()
      expect(exercise.muscle_group).toBeDefined()
      expect(exercise.created_at).toBeDefined()
    })
  })

  describe('Appointment', () => {
    it('should have required properties', () => {
      const appointment: Appointment = {
        id: 'test-appointment-id',
        org_id: 'test-org-id',
        athlete_id: 'test-athlete-id',
        staff_id: 'test-staff-id',
        trainer_id: 'test-trainer-id',
        starts_at: '2024-01-15T09:00:00Z',
        ends_at: '2024-01-15T10:00:00Z',
        status: 'attivo',
        type: 'allenamento',
        notes: 'Test note',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(appointment.id).toBeDefined()
      expect(appointment.org_id).toBeDefined()
      expect(appointment.athlete_id).toBeDefined()
      expect(appointment.trainer_id).toBeDefined()
      expect(appointment.starts_at).toBeDefined()
      expect(appointment.ends_at).toBeDefined()
      expect(appointment.status).toBeDefined()
      expect(appointment.type).toBeDefined()
      expect(appointment.created_at).toBeDefined()
    })
  })
})
