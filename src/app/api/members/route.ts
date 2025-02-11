const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const createGroupId = async () => {
  try {
    // 그룹 생성
    const response = await fetch(`${API_BASE_URL}/api/members`, {
      method: 'POST',
      credentials: 'include', // 쿠키 전송을 위해 필요
    })

    if (!response.ok) {
      throw new Error(`서버 에러: ${response.status}`)
    }

    const jsonData = await response.json()
    const groupId = jsonData.data.groupId
    console.log('그룹 ID:', jsonData.data.groupId)

    return groupId
  } catch (error) {
    console.error('그룹 ID 생성 실패', error)
  }
}
