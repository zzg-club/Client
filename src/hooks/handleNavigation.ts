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

    const naverMobileDirectionsUrl = `https://m.search.naver.com/search.naver?query=빠른길찾기&nso_path=placeType^place;name^${encodeURIComponent(destinationName)};address^;longitude^${lng};latitude^${lat};code^`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {

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
          window.location.href = naverMobileDirectionsUrl;
        }
      }, 1500);
    } else {
      window.open(naverDirectionsUrl, "_blank");
    }
  };

  return { navigateToNaverMap };
};

export default useNavigateToNaverMap;