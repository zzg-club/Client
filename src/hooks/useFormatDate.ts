'use client'

import { useCallback } from 'react'
import { format } from 'date-fns'

// 날짜 데이터를 yyyy-mm-dd 형태의 string으로 변환해주는 훅
export function useFormatDate() {
  const formatDateToString = useCallback((date: Date): string => {
    return format(date, 'yyyy-MM-dd')
  }, [])

  return { formatDateToString }
}
