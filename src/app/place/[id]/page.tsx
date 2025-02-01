'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PlaceDetailFood from '@/components/Place/PlaceDetailFood';
import PlaceDetailPlay from '@/components/Place/PlaceDetailPlay';
import PlaceDetailCampus from '@/components/Place/PlaceDetailCampus';
import PlaceDetailReservation from '@/components/Place/PlaceDetailReservation';
import { fetchPlaceData } from '@/app/api/places/fetchPlaceData';

const PlacePage = () => {
  const params = useParams();
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const loadPlaceData = async () => {
      try {
        const data = await fetchPlaceData(params.id); // API 데이터 요청
        setPlaceData(data); // 데이터 저장
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // 반드시 호출
      }
    };

    loadPlaceData();
  }, [params?.id]);

  if (!placeData) {
    console.log('placeData가 비어 있습니다.');
    return <></>;
  }

  if (placeData.category === 0 || placeData.category === 1) {
    return <PlaceDetailFood placeData={placeData} />;
  }
  if (placeData.category === 2) {
    return <PlaceDetailPlay placeData={placeData} />;
  }
  if (placeData.category === 3) {
    return placeData.phoneNumber === null ? (
      <PlaceDetailCampus placeData={placeData} />
    ) : (
      <PlaceDetailReservation placeData={placeData} />
    );
  }

  return <div>⚠️ 페이지를 찾을 수 없습니다.</div>;
};

export default PlacePage;