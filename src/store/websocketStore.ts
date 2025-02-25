import { create } from 'zustand'
import { Client } from '@stomp/stompjs'

interface WebSocketState {
  stompClient: Client | null
  connectWebSocket: (groupId: number) => void
  subscribeLocation: (groupId: number) => void
  sendMessage: (groupId: number, latitude: number, longitude: number) => void
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  stompClient: null,

  /** WebSocket 연결 */
  connectWebSocket: (groupId) => {
    console.log(`WebSocket 연결 요청: groupId=${groupId}`)

    if (get().stompClient) return // 이미 연결되어 있으면 중복 실행 방지

    const client = new Client({
      brokerURL: 'wss://api.moim.team/location',
      reconnectDelay: 5000,
      debug: (msg) => console.log('STOMP 디버그:', msg),
    })

    client.onConnect = () => {
      console.log('WebSocket 연결 성공')
    }

    client.activate()
    set({ stompClient: client })
  },

  /** 위치 업데이트 구독 (Middle에서 사용) */
  subscribeLocation: (groupId) => {
    const client = get().stompClient
    if (!client || !client.connected) {
      console.warn('WebSocket이 아직 연결되지 않음')
      return
    }

    client.subscribe(`/topic/location/${groupId}`, (message) => {
      console.log('위치 데이터 수신:', message.body)
    })

    console.log(`구독 완료: /topic/location/${groupId}`)
  },

  /** 위치 데이터 전송 (LocationPage에서 사용) */
  sendMessage: (groupId, latitude, longitude) => {
    const client = get().stompClient
    if (!client || !client.connected) {
      console.warn('WebSocket이 아직 연결되지 않음')
      return
    }

    const locationData = {
      myLocation: {
        latitude,
        longitude,
      },
    }

    client.publish({
      destination: `/app/travelTime/${groupId}/update`,
      body: JSON.stringify(locationData),
    })

    console.log('websocket->server 위치 전송 완료:', locationData)
  },
}))
