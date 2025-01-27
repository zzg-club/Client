const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchKakaoLoginUrl = async (): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/start-login`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const kakaoLoginUrl = await response.text(); // 서버에서 반환된 URL
        return kakaoLoginUrl; // 반환
      } else {
        console.error('로그인 URL 요청 실패:', response.status, response.statusText);
        throw new Error('로그인 요청이 실패했습니다.');
      }
    } catch (error) {
      console.error('요청 중 오류 발생:', error);
      throw new Error('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };