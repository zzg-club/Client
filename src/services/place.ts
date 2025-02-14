import { CategoryData } from '@/types/category'
import { validatePlaceId } from '@/utils/validatePlaceId';
import { sendLikedStateRequest } from '@/utils/sendLikedStateRequest';
import { createRequestBody } from '@/utils/createRequestBody';
import { createToggleLikeUrl } from '@/utils/createToggleLikeUrl';
import { sendToggleLikeRequest } from '@/utils/sendToggleLikeRequest';
import { sendLikeCountRequest } from '@/utils/sendLikeCountRequest';
import { processLikeCountResponse } from '@/utils/processLikeCountResponse';
import { sendPlaceDataRequest } from '@/utils/sendPlaceDataRequest';
import { processPlaceDataResponse } from '@/utils/processPlaceDataResponse';
import { sendLoginRequest } from '@/utils/sendLoginRequest';
import { processLoginResponse } from '@/utils/processLoginResponse';
import { sendUserInfoRequest } from '@/utils/sendUserInfoRequest';
import { processUserInfoResponse } from '@/utils/processUserInfoResponse';
import { UserInfo } from '@/types/userInfo'
import { FetchFiltersResponse } from "@/types/filter";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  };


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
  };


export const fetchLikedStates = async (placeId: string): Promise<boolean> => {
    try {
        validatePlaceId(placeId); 

        const response = await sendLikedStateRequest(placeId);  

        // 응답 상태 확인
        if (!response.ok) {
        console.error(`Failed to fetch liked state. HTTP Status: ${response.status}`);
        return false;
        }

        const data = await response.json();
        return data.data || false;  // liked 상태 반환
    } catch (error) {
        console.error('Error fetching liked state:', error);
        throw error;
    }
    };

export const toggleLike = async (
    placeId: number,
    liked: boolean
    ): Promise<boolean> => {
    try {
        const url = createToggleLikeUrl(liked);  // URL 생성
        const body = createRequestBody(placeId);  // 요청 본문 생성
    
        // API 요청 보내기
        const response = await sendToggleLikeRequest(url, body);
    
        // 응답 상태 확인
        if (!response.ok) {
        console.error(`Failed to toggle like status for placeId ${placeId}. HTTP Status: ${response.status}`);
        throw new Error(`Failed to toggle like status. Status: ${response.status}`);
        }
    
        // 성공적으로 반대 상태 반환
        return !liked;
    } catch (error) {
        console.error(`Error toggling like for placeId ${placeId}:`, error);
        return liked; // 실패 시 기존 상태 유지
    }
    };

export const fetchLikeCount = async (placeId: number): Promise<number> => {
    try {
        const response = await sendLikeCountRequest(placeId);  // API 요청
    
        if (!response.ok) {
        console.error(`Failed to fetch like count. HTTP Status: ${response.status}`);
        throw new Error(`Failed to fetch like count. Status: ${response.status}`);
        }
    
        // 응답 처리
        return await processLikeCountResponse(response);
    } catch (error) {
        console.error(`Error fetching like count for placeId ${placeId}:`, error);
        return 0; // 기본값으로 0 반환 (에러 발생 시)
    }
    };

export const fetchPlaceData = async (placeId: string) => {
    try {
        const response = await sendPlaceDataRequest(placeId);  // API 요청 보내기
    
        if (!response.ok) {
        console.error(`Failed to fetch place data. HTTP Status: ${response.status}`);
        throw new Error(`Failed to fetch place data. Status: ${response.status}`);
        }
    
        // 응답 처리
        return await processPlaceDataResponse(response);  // 응답 처리 후 반환
    } catch (error) {
        console.error(`Error fetching place data for placeId ${placeId}:`, error);
        throw error;  // 에러 재발생
    }
    };

export const fetchKakaoLoginUrl = async (): Promise<string> => {
    try {
        const response = await sendLoginRequest();  
    
        // 응답 처리
        return await processLoginResponse(response);  
    } catch (error) {
        console.error('요청 중 오류 발생:', error);
        throw new Error('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
    };

export const fetchUserInformation = async (): Promise<UserInfo> => {
    try {
        const response = await sendUserInfoRequest();  
    
        // 응답 처리
        return await processUserInfoResponse(response); 
    } catch (error) {
        console.error('Error fetching user information:', error);
        return { data: { userNickname: '알 수 없는 사용자' } }; 
    }
    };


export const fetchFilters = async (): Promise<FetchFiltersResponse> => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined in environment variables.');
        throw new Error('Internal server error');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/places/filter`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        });
    
        if (!response.ok) {
        throw new Error('Failed to fetch filters');
        }
    
        const result: FetchFiltersResponse = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching filters:', error);
        throw new Error('Server error');
    }
    };
