import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const createGroupId = async () => {
  try {
    // 그룹 생성
    const response = await axios.post(
      `${API_BASE_URL}/api/members`,
      {},
      {
        withCredentials: true, // 쿠키 전송을 위해 필요
      },
    )
    
    const groupId = await response.data.data.groupId
    console.log('그룹 ID:', response.data.data.groupId)

    return groupId
  } catch (error) {
    console.error('그룹 ID 생성 실패', error)
  }
}
