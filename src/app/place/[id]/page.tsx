'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PlaceDetailFood from '@/components/Place/PlaceDetailFood';
import PlaceDetailCampus from '@/components/Place/PlaceDetailCampus';
import PlaceDetailReservation from '@/components/Place/PlaceDetailReservation';
import { fetchPlaceData } from '@/app/api/places/fetchPlaceData';
import { Place } from '@/types/place'

const PlacePage = () => {
  const params = useParams();
  const [placeData, setPlaceData] = useState<Place | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlaceData = async () => {
      if (!params?.id) return;

      try {
        const data = await fetchPlaceData(params.id.toString()); //문자열 변환
        setPlaceData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadPlaceData();
  }, [params?.id]);

  // 로딩 상태 처리
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 에러 상태 처리
  if (error) {
    return <div>오류 발생: {error}</div>;
  }

  // 데이터가 없는 경우
  if (!placeData) {
    console.log('placeData가 비어 있습니다.');
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  // 카테고리별 렌더링
  if (placeData.category === 0 || placeData.category === 1 || placeData.category==2) {
    return <PlaceDetailFood placeData={placeData} />;
  }
  if (placeData.category === 3) {
    return placeData.phoneNumber === null ? (
      <PlaceDetailCampus placeData={placeData} />
    ) : (
      <PlaceDetailReservation placeData={placeData} />
    );
  }

  return <div>페이지를 찾을 수 없습니다.</div>;
};

export default PlacePage;