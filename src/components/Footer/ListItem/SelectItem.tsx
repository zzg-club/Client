export interface SelectItemProps {
  date: string
  startTime: string
  endTime: string
}

export function SelectItem({ date, startTime, endTime }: SelectItemProps) {
  return (
    <div className="w-full px-6 py-7">
      <div className="flex justify-between items-center">
        <div className="text-center text-[#1e1e1e] text-xl font-normal">
          {date}
        </div>
        <div className="text-center text-[#9562fa] text-xl font-medium">
          {startTime} - {endTime}
        </div>
      </div>
    </div>
  )
}
