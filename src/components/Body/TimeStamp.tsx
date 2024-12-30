interface TimeStampProps {
  dates?: { date: number; weekday: string }[]
}

export default function TimeStamp({ dates = [] }: TimeStampProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4">
      {/* 시간 및 날짜 그리드 */}
      <div
        className="relative grid mt-2"
        style={{
          gridTemplateColumns: `35px repeat(${dates.length}, 1fr)`,
        }}
      >
        {/* 시간 레이블 */}
        <div>
          {Array.from({ length: 23 }, (_, i) => (
            <div key={i} className="h-8">
              {`${String(i + 1).padStart(2, '0')}시`}
            </div>
          ))}
        </div>

        {/* 날짜에 따른 그리드 생성 */}
        {dates.map(({ date, weekday }, colIndex) => (
          <div key={colIndex}>
            {/* 날짜 헤더 */}
            <div className="text-center font-bold mb-2">
              {date} ({weekday})
            </div>
            {/* 시간 그리드 */}
            {Array.from({ length: 23 }, (_, rowIndex) => (
              <div key={rowIndex} className="h-8 border border-gray-300">
                {/* 그리드 셀 내용 */}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
