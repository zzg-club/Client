import { useEffect, useRef, useState } from 'react';
import { getCurrentLocation } from './getCurrentLocation';

const KakaoMap = ({ selectedPlace, onMoveToCurrentLocation }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [placeMarker, setPlaceMarker] = useState(null);
  const [currentMarker, setCurrentMarker] = useState(null);

  // 지도 초기화
  useEffect(() => {
    const initializeMap = async () => {
      const location = await getCurrentLocation();

      const kakaoMapScript = document.createElement('script');
      kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
      kakaoMapScript.async = true;

      kakaoMapScript.onload = () => {
        window.kakao.maps.load(() => {
          const mapContainer = mapContainerRef.current;
          if (!mapContainer) return;

          const mapOption = {
            center: new window.kakao.maps.LatLng(location.lat, location.lng),
            level: 3,
          };

          const kakaoMap = new window.kakao.maps.Map(mapContainer, mapOption);

          // 현재 위치 마커 추가
          const markerImage = new window.kakao.maps.MarkerImage(
            '/myLocation.svg',
            new window.kakao.maps.Size(32, 60),
            { offset: new window.kakao.maps.Point(16, 60) } // 중심점 하단으로 설정
          );

          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(location.lat, location.lng),
            image: markerImage,
          });
          marker.setMap(kakaoMap);

          setMap(kakaoMap);
          setCurrentMarker(marker);
        });
      };

      document.head.appendChild(kakaoMapScript);

      return () => {
        document.head.removeChild(kakaoMapScript);
      };
    };

    initializeMap();
  }, []);

  // 선택된 장소의 주소를 지도에 표시
  useEffect(() => {
    if (!map || !selectedPlace?.address) return;

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(selectedPlace.address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

        // 지도 중심 이동
        map.setCenter(coords);

        // 기존 장소 마커 제거
        if (placeMarker) placeMarker.setMap(null);

        // 장소 타입에 따른 마커 이미지 설정
        const markerImageSrc =
          selectedPlace.type === 'food'
            ? '/food_location.svg'
            : selectedPlace.type === 'cafe'
            ? '/cafe_location.svg'
            : selectedPlace.type === 'play'
            ? '/game_location.svg'
            : '/default_location.svg'; // 기본 마커 이미지

        const markerImage = new window.kakao.maps.MarkerImage(
          markerImageSrc,
          new window.kakao.maps.Size(32, 60), // 마커 크기 설정
          { offset: new window.kakao.maps.Point(13, 30) } // 중심점 하단으로 설정
        );

        // 새 장소 마커 추가
        const newMarker = new window.kakao.maps.Marker({
          position: coords,
          image: markerImage,
        });
        newMarker.setMap(map);
        setPlaceMarker(newMarker);
      } else {
        console.error('주소 검색 실패:', selectedPlace.address);
      }
    });
  }, [map, selectedPlace]);

  // 현재 위치로 이동
  const moveToCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();

      if (!map) return;

      const newLocation = new window.kakao.maps.LatLng(location.lat, location.lng);

      // 지도와 현재 위치 마커 업데이트
      map.setCenter(newLocation);

      if (currentMarker) {
        currentMarker.setPosition(newLocation);
      } else {
        const markerImage = new window.kakao.maps.MarkerImage(
          '/myLocation.svg',
          new window.kakao.maps.Size(32, 60),
          { offset: new window.kakao.maps.Point(16, 60) }
        );

        const newMarker = new window.kakao.maps.Marker({
          position: newLocation,
          image: markerImage,
        });
        newMarker.setMap(map);
        setCurrentMarker(newMarker);
      }
    } catch (error) {
      console.error('현재 위치로 이동 중 오류:', error);
    }
  };

  // 외부 이벤트와 연동
  useEffect(() => {
    if (onMoveToCurrentLocation) {
      onMoveToCurrentLocation(moveToCurrentLocation);
    }
  }, [onMoveToCurrentLocation, moveToCurrentLocation]);

  return (
    <div
      ref={mapContainerRef}
      className="map-container"
      style={{ width: '100%', height: '100%' }}
    ></div>
  );
};

export default KakaoMap;
