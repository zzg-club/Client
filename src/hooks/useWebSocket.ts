import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'

const useWebSocket = (groupId) => {
  const stompClient = useRef(null)

  // 웹소켓 연결 함수
  const connect = useCallback(() => {
    if (!groupId) {
      console.error('❌ groupId가 없습니다.')
      return
    }

    const client = new Client({
      brokerURL: 'https://api.moim.team/wsConnect/location', // 웹소켓 서버 주소
      onConnect: () => {
        console.log('웹소켓 연결 성공')

        // 그룹 ID를 기반으로 위치 정보 구독
        client.subscribe(`/topic/location/${groupId}`, (message) => {
          console.log('수신된 메시지:', JSON.parse(message.body))
        })
      },
      onStompError: (error) => {
        console.error('웹소켓 연결 실패:', error)
      },
      reconnectDelay: 5000, // 연결 실패 시 재연결 시도 간격 (옵션)
      debug: (str) => {
        console.log('STOMP 디버그:', str) // 디버그 로그 (옵션)
      },
    })

    client.activate() // 웹소켓 연결 활성화
    stompClient.current = client
  }, [groupId])

  // 웹소켓 연결 해제 함수
  const disconnect = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.deactivate() // 웹소켓 연결 해제
      console.log('웹소켓 연결 해제')
    }
  }, [])

  // 위치 정보 전송 함수
  const sendLocation = useCallback(
    (latitude, longitude) => {
      if (!stompClient.current || !stompClient.current.connected) {
        console.error('웹소켓 연결이 되어있지 않습니다.')
        return
      }

      const message = {
        latitude,
        longitude,
      }
      stompClient.current.publish({
        destination: `/app/travelTime/${groupId}/update`,
        body: JSON.stringify(message),
      })
      console.log('위치 정보 전송 완료:', message)
    },
    [groupId],
  )

  // 컴포넌트 마운트 시 웹소켓 연결, 언마운트 시 연결 해제
  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return { sendLocation }
}

export default useWebSocket
