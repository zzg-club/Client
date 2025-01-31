const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const fetchLikedStates = async (placeId: string): Promise<boolean> => {
  // API_BASE_URL 유효성 검사
  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined in environment variables.')
    throw new Error('API_BASE_URL is not configured.')
  }

  // placeId 유효성 검사
  if (!placeId) {
    console.error('Invalid placeId:', placeId)
    throw new Error('placeId is required to fetch liked state.')
  }

  try {
    // API 요청
    const response = await fetch(
      `${API_BASE_URL}/api/places/places/${placeId}/liked`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 쿠키 포함
      },
    )

    // 응답 상태 확인
    if (!response.ok) {
      console.error(
        `Failed to fetch liked state. HTTP Status: ${response.status}`,
      )
      return false
    }

    const data = await response.json()
    return data.data || false // liked 상태 반환
  } catch (error) {
    console.error('Error fetching liked state:', error)
    throw error
  }
}
