const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface CategoryData {
  id: number
  category: number
  name: string
  filter1:boolean
  filter2:boolean
  filter3:boolean
  filter4:boolean
  word:string
  time:string
  address:string
  phoneNumber:string
  likes:number
  pictures:string[]
  englishName?: string | null  
}


export const fetchCategoryData = async (
  categoryIndex: number,
): Promise<CategoryData[]> => {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined in environment variables.')
  }

  // categoryIndex 유효성 검사
  if (typeof categoryIndex === 'undefined' || categoryIndex === null) {
    throw new Error('Category index is missing.')
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/places/category/${categoryIndex}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    if (!response.ok) {
      throw new Error(
        `Failed to fetch category data. Status: ${response.status}`,
      )
    }

    const result = await response.json()
    if (!result?.data || !Array.isArray(result.data)) {
      throw new Error('Invalid response format received from the API.')
    }

    return result.data
  } catch (error) {
    console.error('Error in fetchCategoryData:', error)
    throw error
  }
}

export const fetchFilteredCategoryData = async (
  categoryIndex: number,
  filters: {
    filter1?: boolean
    filter2?: boolean
    filter3?: boolean
    filter4?: boolean
  },
): Promise<CategoryData[]> => {
  // 환경 변수 유효성 검사
  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined in environment variables.')
    return [] // 기본값 반환
  }

  // categoryIndex 유효성 검사
  if (typeof categoryIndex === 'undefined' || categoryIndex === null) {
    console.error('Category index is missing.')
    return [] // 기본값 반환
  }

  try {
    const queryParams = new URLSearchParams()

    // categoryIndex 추가
    queryParams.append('category', String(categoryIndex))

    // filters 처리
    if (filters.filter1 !== undefined)
      queryParams.append('filter1', String(filters.filter1))
    if (filters.filter2 !== undefined)
      queryParams.append('filter2', String(filters.filter2))
    if (filters.filter3 !== undefined)
      queryParams.append('filter3', String(filters.filter3))
    if (filters.filter4 !== undefined)
      queryParams.append('filter4', String(filters.filter4))

    const url = `${API_BASE_URL}/api/places/category/${categoryIndex}/filters?${queryParams.toString()}`

    // GET 요청
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      console.error(
        `Failed to fetch filtered category data. Status: ${response.status} - ${response.statusText}`,
      )
      return [] // 실패 시 빈 배열 반환
    }

    const result = await response.json()

    if (!result?.data || !Array.isArray(result.data)) {
      console.error('Invalid response format received from the API:', result)
      return [] 
    }

    if (result.data.length === 0) {
      console.warn('No data returned for the selected filters:', filters)
      return [] 
    }

    return result.data 
  } catch (error) {
    console.error('Error in fetchFilteredCategoryData:', error)
    return [] 
  }
}
