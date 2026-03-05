import React from 'react'

type FullCalendarProps = React.HTMLAttributes<HTMLDivElement> & {
  events?: unknown
  initialView?: string
}

export default function FullCalendar({ children, ...props }: FullCalendarProps) {
  return (
    <div data-testid="fullcalendar-mock" {...props}>
      {children ?? 'Mock FullCalendar Component'}
    </div>
  )
}

export const Calendar = FullCalendar
export const DayGrid = () => <div data-testid="daygrid-mock">DayGrid Mock</div>
export const TimeGrid = () => <div data-testid="timegrid-mock">TimeGrid Mock</div>
export const Interaction = () => <div data-testid="interaction-mock">Interaction Mock</div>
export const List = () => <div data-testid="list-mock">List Mock</div>
export const MultiMonth = () => <div data-testid="multimonth-mock">MultiMonth Mock</div>
export const Resource = () => <div data-testid="resource-mock">Resource Mock</div>
export const ResourceDayGrid = () => (
  <div data-testid="resource-daygrid-mock">ResourceDayGrid Mock</div>
)
export const ResourceTimeGrid = () => (
  <div data-testid="resource-timegrid-mock">ResourceTimeGrid Mock</div>
)
export const ResourceTimeline = () => (
  <div data-testid="resource-timeline-mock">ResourceTimeline Mock</div>
)
export const Timeline = () => <div data-testid="timeline-mock">Timeline Mock</div>
