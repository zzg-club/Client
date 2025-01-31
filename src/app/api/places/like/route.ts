const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const toggleLike = async (
  placeId: number,
  liked: boolean,
): Promise<boolean> => {
  // 환경 변수 유효성 검사
  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined in environment variables.')
    throw new Error('API_BASE_URL is not configured.')
  }

  try {
    // 요청 URL 설정
    const url = liked
      ? `${API_BASE_URL}/api/place/like/unlike`
      : `${API_BASE_URL}/api/place/like/like`

    // URL 인코딩된 데이터 생성
    const body = new URLSearchParams()
    body.append('placeId', placeId.toString())

    // API 요청
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include', // 쿠키 포함
      body: body.toString(),
    })

    // 응답 상태 확인
    if (!response.ok) {
      console.error(
        `Failed to toggle like status for placeId ${placeId}. HTTP Status: ${response.status}`,
      )
      throw new Error(
        `Failed to toggle like status. Status: ${response.status}`,
      )
    }

    // 성공적으로 반대 상태 반환
    return !liked
  } catch (error) {
    console.error(`Error toggling like for placeId ${placeId}:`, error)
    return liked // 실패 시 기존 상태 유지
  }
}
