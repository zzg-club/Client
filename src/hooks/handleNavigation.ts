const useNavigateToNaverMap = () => {
  const navigateToNaverMap = (
    destination: string | undefined,
    lat?: number,
    lng?: number,
    placeName?: string
  ) => {
    if (!destination || lat === undefined || lng === undefined) return;

    const destinationName = placeName || destination;

    const naverAppUrl = `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(destinationName)}`;

    const naverDirectionsUrl = `https://map.naver.com/p/directions/-/${lng},${lat},${encodeURIComponent(destinationName)},PLACE_POI/-/transit?c=15.00,0,0,0,dh`;

    const naverAppDirectionsUrl = `https://map.naver.com/v5/directions/-/-/${lng},${lat},${encodeURIComponent(destinationName)}/transit`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      console.log("📱 모바일 환경 → 네이버 지도 앱 실행");

      let hasAppOpened = false;

      const handleVisibilityChange = () => {
        if (document.hidden) {
          hasAppOpened = true;
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      
      window.location.href = naverAppUrl;
      setTimeout(() => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);

        if (!hasAppOpened) {
          window.location.href = naverAppDirectionsUrl;
        }
      }, 1500);
    } else {
      window.open(naverDirectionsUrl, "_blank");
    }
  };

  return { navigateToNaverMap };
};

export default useNavigateToNaverMap;