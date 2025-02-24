const useNavigateToNaverMap = () => {
  const navigateToNaverMap = (
    destination: string | undefined,
    lat?: number,
    lng?: number,
    placeName?: string
  ) => {
    if (!destination || lat === undefined || lng === undefined) return;

    const destinationName = placeName || destination;

    const naverDirectionsUrl = `https://map.naver.com/p/directions/-/${lng},${lat},${encodeURIComponent(destinationName)},PLACE_POI/-/transit?c=15.00,0,0,0,dh`;

    const naverAppUrl = `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(destinationName)}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {

      window.location.href = naverAppUrl;

      setTimeout(() => {
        window.location.href = naverDirectionsUrl;
      }, 1500);
    } else {
      window.open(naverDirectionsUrl, "_blank");
    }
  };

  return { navigateToNaverMap };
};

export default useNavigateToNaverMap;