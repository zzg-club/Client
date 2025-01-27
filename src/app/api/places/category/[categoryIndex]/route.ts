const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchCategoryData = async (categoryIndex: number): Promise<any[]> => {

  // 환경 변수 유효성 검사
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined in environment variables.');
  }

  // categoryIndex 유효성 검사
  if (typeof categoryIndex === 'undefined' || categoryIndex === null) {
    throw new Error('Category index is missing.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/places/category/${categoryIndex}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category data. Status: ${response.status}`);
    }

    const result = await response.json();
    if (!result?.data || !Array.isArray(result.data)) {
      throw new Error('Invalid response format received from the API.');
    }

    return result.data;
  } catch (error) {
    console.error('Error in fetchCategoryData:', error);
    throw error;
  }
};