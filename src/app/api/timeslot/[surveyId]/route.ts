import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const createTimeSlot = async (
  slotDate: string,
  startTime: string,
  endTime: string,
) => {
  console.log(slotDate, startTime, endTime)
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/timeslot/{surveyId}`,
      {
        slotDate: slotDate,
        startTime: startTime,
        endTime: endTime,
      },
      {
        withCredentials: true, // 쿠키 전송을 위해 필요
        headers: {
          'Content-Type': 'application/json', // JSON 형식 명시
        },
      },
    )
    console.log('타임슬롯 생성 성공', response)
  } catch (error) {
    console.log('타임슬롯 생성 실패', error)
  }
}
