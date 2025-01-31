const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchPlaceData = async (placeId: string) => {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/places/${placeId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch place data. Status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`Error fetching place data for placeId ${placeId}:`, error);
    throw error;
  }
};