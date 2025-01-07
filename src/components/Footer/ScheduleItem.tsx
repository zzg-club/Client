import { ProfileSelected } from '../Profiles/ProfileSelected'

export interface ScheduleItemProps {
  number: number
  startDate: string
  startTime: string
  endTime: string
  participants: { id: number; name: string; image: string }[]
}

export function ScheduleItem({
  number,
  startDate,
  startTime,
  endTime,
  participants,
}: ScheduleItemProps) {
  return (
    <div className="flex items-center justify-between py-9 h-full">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-medium text-[#9562fa]">{number}</span>
        <span className="text-lg font-normal text-black">
          {startDate} &nbsp;
          {startTime} - {endTime}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ProfileSelected profiles={participants} />
      </div>
    </div>
  )
}
