import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// editApi
interface TimeSlot {
  slotId: number
  start: string
  end: string
  date?: string
}

// editApi
interface DateData {
  date: string
  timeSlots: TimeSlot[]
}

// editApi
interface ApiResponse {
  success: boolean
  data: {
    date: string
    data: {
      date: string
      timeSlots: TimeSlot[]
    }[]
  }
}

export const editApi = {
  getEditTimeSlot: async (surveyId: number) => {
    try {
      const response = await axios.get<ApiResponse>(
        `${API_BASE_URL}/api/timeslot/${surveyId}/edit`,
        {
          withCredentials: true, // 쿠키 전송 허용
        },
      )
      console.log('타임슬롯 정보 불러오기 성공:', response.data)
      const dateData: DateData[] = response.data.data.data.map((item) => ({
        date: item.date,
        timeSlots: item.timeSlots.map((slot) => ({
          slotId: slot.slotId,
          start: slot.start,
          end: slot.end,
        })),
      }))

      return dateData
    } catch (error) {
      console.error('타임슬롯 정보 불러오기 실패:', error)
      return []
    }
  },

  putEditTimeSlot: async (
    surveyId: number,
    slotId: number,
    startTime: string,
    endTime: string,
  ) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/timeslot/${surveyId}/edit/${slotId}`,
        {
          withCredentials: true, // 쿠키 전송 허용
          startTime: startTime,
          endTime: endTime,
        },
      )
      console.log('타임슬롯 정보 수정 성공:', response.data)
    } catch (error) {
      console.error('타임슬롯 정보 수정 실패:', error)
      return []
    }
  },

  deleteTimeSlot: async (surveyId: number, slotId: number) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/timeslot/${surveyId}/delete/${slotId}`,
        {
          withCredentials: true, // 쿠키 전송 허용
        },
      )
      console.log('타임슬롯 정보 삭제 성공:', response.data)
    } catch (error) {
      console.error('타임슬롯 정보 삭제 실패:', error)
      return []
    }
  },
}
