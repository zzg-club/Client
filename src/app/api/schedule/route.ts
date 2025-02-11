const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const createDirectSchedule = async (
  groupId: number,
  name: string,
  startDate: string | null,
  endDate: string | null,
) => {
  console.log(groupId, name, startDate, endDate)
  try {
    const response2 = await fetch(`${API_BASE_URL}/api/schedule`, {
      method: 'POST',
      credentials: 'include', // 쿠키 전송을 위해 필요
      headers: {
        'Content-Type': 'application/json', // JSON 형식 명시
      },
      body: JSON.stringify({
        groupId: groupId, // 첫 번째 요청에서 받은 그룹 ID 사용
        name: name,
        startDate: startDate,
        endDate: endDate,
      }),
    })

    if (!response2.ok) {
      throw new Error(`서버 에러: ${response2.status}`)
    }

    const data2 = await response2.json()
    console.log('직접 일정 생성 성공', data2)
  } catch (error) {
    console.log('직접 일정 생성 실패', error)
  }
}
