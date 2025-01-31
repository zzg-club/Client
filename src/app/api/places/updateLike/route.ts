const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * 특정 장소의 좋아요 수를 불러오는 API
 * @param placeId 장소 ID
 * @returns {Promise<number>} 장소의 좋아요 개수
 */
export const fetchLikeCount = async (placeId: number): Promise<number> => {
    if (!API_BASE_URL) {
      console.error("API_BASE_URL is not defined.");
      throw new Error("API_BASE_URL is not configured.");
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/places/like/${placeId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch like count. Status: ${response.status}`);
      }
  
      const result = await response.json();
  
      // **data가 단순 숫자일 경우 직접 반환**
      if (typeof result.data === "number") {
        return result.data;
      }
  
      // **예상 데이터 형식이 다를 경우 오류 로그 출력**
      console.error("Invalid response format:", result);
      throw new Error("Invalid like count response format.");
    } catch (error) {
      console.error(`Error fetching like count for placeId ${placeId}:`, error);
      return 0; // 기본값으로 0 반환 (에러 발생 시)
    }
  };