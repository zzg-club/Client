export interface EditItemProps {
  slotId: number
  date?: string
  startTime: string
  endTime: string
  onDelete: (id: number) => void
}

export function EditItem({
  slotId,
  date,
  startTime,
  endTime,
  onDelete,
}: EditItemProps) {
  return (
    <div className="w-full p-4 rounded-b-3xl">
      <div className="flex justify-between items-center">
        <div className="flex gap-[8px]">
          <span className="text-center text-[#1e1e1e] text-xl font-normal">
            {date}
          </span>
          <span className="text-center text-[#afafaf] text-xl font-medium">
            {startTime} - {endTime}
          </span>
        </div>
        <div className="px-6 py-2 rounded-3xl bg-[#9562fa]">
          <button
            className="w-[64px] h-[12px] text-center text-white text-lg font-medium"
            onClick={() => onDelete(slotId)} // 클릭 시 ID 전달
          >
            삭제하기
          </button>
        </div>
      </div>
    </div>
  )
}
