import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const deleteGroupMembers = {
  deleteByCreator: async (groupId: number, userId: number) => {
    try {
      console.log(`그룹 아이디: ${groupId}, 내보낼 사용자 아이디: ${userId}`)
      const response = await axios.delete(
        `${API_BASE_URL}/api/group-members/delete/${groupId}`,
        {
          withCredentials: true, // 쿠키 전송 허용
          data: { userId },
        },
      )
      console.log('생성자가 내보내기 성공:', response.data.data)
      return response
    } catch (error) {
      console.error('생성자가 내보내기 실패:', error)
      throw error
    }
  },

  deleteByAttendee: async (groupId: number) => {
    try {
      console.log(`그룹 아이디: ${groupId}`)
      const response = await axios.delete(
        `${API_BASE_URL}/api/group-members/delete/self/${groupId}`,
        {
          withCredentials: true, // 쿠키 전송 허용
        },
      )
      console.log('참여자 나가기 성공:', response.data.data)
      return response
    } catch (error) {
      console.error('참여자 나가기 실패:', error)
      throw error
    }
  },
}
