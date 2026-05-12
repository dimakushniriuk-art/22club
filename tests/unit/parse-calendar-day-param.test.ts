import { describe, expect, it } from 'vitest'
import { parseCalendarDayParam } from '@/lib/calendar/parse-calendar-day-param'

describe('parseCalendarDayParam', () => {
  it('parses valid YYYY-MM-DD in local calendar', () => {
    const d = parseCalendarDayParam('2026-05-12')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2026)
    expect(d!.getMonth()).toBe(4)
    expect(d!.getDate()).toBe(12)
  })

  it('rejects invalid calendar dates', () => {
    expect(parseCalendarDayParam('2026-02-30')).toBeNull()
    expect(parseCalendarDayParam('not-a-date')).toBeNull()
    expect(parseCalendarDayParam('')).toBeNull()
  })
})
