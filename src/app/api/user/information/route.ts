const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchUserInformation = async (): Promise<any | null> => {
  // 환경 변수 유효성 검사
  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined in environment variables.');
    throw new Error('API_BASE_URL is not configured.');
  }

  try {
    // API 요청
    const response = await fetch(`${API_BASE_URL}/api/user/information`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함
    });

    // 응답 상태 확인
    if (!response.ok) {
      console.error(`Failed to fetch user information. HTTP Status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // JSON 데이터 파싱
    const data = await response.json();

    // 응답 데이터 유효성 검사
    if (!data || typeof data !== 'object') {
      console.error('Invalid response format received:', data);
      throw new Error('Invalid response format received.');
    }

    return data;
  } catch (error) {
    console.error('Error fetching user information:', error);
    return null; // 실패 시 기본값 반환
  }
};