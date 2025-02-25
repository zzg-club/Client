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

    //const naverMobileDirectionsUrl = `https://m.map.naver.com/directions/?ex=${lng}&ey=${lat}&en=${encodeURIComponent(destinationName)}&menu=route`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {

      window.location.href = naverAppUrl;
      
    } else {
      window.open(naverDirectionsUrl, "_blank");
    }
  };

  return { navigateToNaverMap };
};

export default useNavigateToNaverMap;