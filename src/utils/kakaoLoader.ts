// utils/kakaoLoader.ts
let kakaoScriptLoaded = false

export const loadKakaoMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (kakaoScriptLoaded) {
      if (window.kakao && window.kakao.maps) {
        resolve()
      } else {
        reject(new Error('Kakao Maps API failed to load'))
      }
      return
    }

    const kakaoMapScript = document.createElement('script')
    kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`
    kakaoMapScript.async = true

    kakaoMapScript.onload = () => {
      if (window.kakao && window.kakao.maps) {
        kakaoScriptLoaded = true
        window.kakao.maps.load(resolve)
      } else {
        reject(new Error('Kakao Maps API failed to initialize'))
      }
    }

    kakaoMapScript.onerror = () =>
      reject(new Error('Failed to load Kakao Maps script'))

    document.head.appendChild(kakaoMapScript)
  })
}
