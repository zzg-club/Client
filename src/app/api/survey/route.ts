import axios from 'axios'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
type DateInfo = [string, string]

export const createSurveySchedule = async (
  groupId: number,
  mode: 'range' | 'week',
  selected: DayOfWeek[] | null,
  selectedDates: DateInfo[],
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/survey`,
      {
        groupId: groupId,
        mode: mode,
        selected: selected,
        date: selectedDates,
      },
      {
        withCredentials: true, // 쿠키 전송을 위해 필요
      },
    )

    console.log('조율할 일정 생성', response)
    const surveyId = response.data.data.surveyId
    return surveyId
  } catch (error) {
    console.error('조율할 일정 생성 실패', error)
  }
}
