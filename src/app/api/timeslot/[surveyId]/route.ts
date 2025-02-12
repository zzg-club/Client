import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export type SelectedDate = {
  year: number
  month: number
  day: number
  weekday: string
}

export type GroupedDate = {
  weekday: string
  dates?: {
    year: number
    month: number
    day: number
    weekday: string
  }[]
  date?: {
    year: number
    month: number
    day: number
    weekday: string
  }[]
}

export type ScheduleData = {
  title: string // 일정 이름
  userId: number // 사용자 ID
  groupId: number // 그룹 ID
  mode: string
  selected: string[] | null
  date: [string, string][] // 날짜 배열: [날짜, 요일]의 배열
}

export const selectApi = {
  createTimeSlot: async (
    surveyId: number,
    slotDate: string,
    startTime: string,
    endTime: string,
  ) => {
    console.log(slotDate, startTime, endTime, surveyId)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/timeslot/${surveyId}`,
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
  },
}

export const headerApi = {
  getSelectedDays: async (
    surveyId: number,
    success: boolean,
    data: {
      mode: string
      selected: [string]
    },
  ) => {
    console.log(success, data)
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/timeslot/${surveyId}/edit/header`,
        {
          withCredentials: true, // 쿠키 전송 허용
        },
      )

      console.log('헤더 날짜 정보 받아오기 성공', response)
    } catch (error) {
      console.log('헤더 날짜 정보 받아오기 실패', error)
    }
  },
}
