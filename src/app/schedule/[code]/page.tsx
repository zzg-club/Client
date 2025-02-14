'use client'

import React, { useEffect } from 'react'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'

export default function CodePage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const { code } = useParams() // URL에서 code 파라미터 가져오기
  const router = useRouter()

  useEffect(() => {
    console.log(code)
    const postCode = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/group-members/code`,
          {
            code: code,
          },
          {
            withCredentials: true, // 쿠키 전송을 위해 필요
          },
        )

        console.log('초대 코드 성공', response)
        router.push('/schedule')
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 403) {
            console.log('초대 실패 403', error)
            alert('로그인 후 다시 초대링크에 접속해주세요.') // 403 에러(로그아웃 상태) 시 알림 -> 예외처리 확인 필요
          } else {
            console.log('초대 코드 실패', error)
          }
        }
      }
    }

    postCode()
  }, [API_BASE_URL, code, router])
  return <div>모임에 초대 중...</div>
}
