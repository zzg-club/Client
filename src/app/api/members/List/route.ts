import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// /api/members/List 연동
export type Participant = {
  id: number
  name: string
  image: string
  type: string
}

export type Schedule = {
  id: number
  startDate: string
  title: string
  startTime: string
  endTime: string
  location?: string
  participants: Participant[]
}

// /api/members/List 연동
export const getmembersListApi = {
  getMembers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/members/List`, {
        withCredentials: true, // 쿠키 전송 허용
      })
      if (Array.isArray(response.data.data)) {
        console.log('스케줄 정보:', response.data.data)
        return response.data.data.map((schedule: Schedule) => ({
          id: schedule.id,
          startDate: schedule.startDate || '날짜 미정',
          title: schedule.title,
          startTime: schedule.startTime || '시간 미정',
          endTime: schedule.endTime || '시간 미정',
          location: schedule.location || '',
          participants: schedule.participants || [],
        }))
      } else {
        console.error('데이터 구조 에러:', response.data.data)
        return []
      }
    } catch (error) {
      console.error('스케줄 정보 불러오기 실패:', error)
      return []
    }
  },
}
