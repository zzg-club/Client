export interface EditItemProps {
  date: string
  startTime: string
  endTime: string
}

export function EditItem({ date, startTime, endTime }: EditItemProps) {
  const onDelete = () => {
    alert('삭제하기 버튼')
  }
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
            onClick={onDelete}
          >
            삭제하기
          </button>
        </div>
      </div>
    </div>
  )
}
