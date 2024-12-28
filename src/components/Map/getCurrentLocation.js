export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.error("현재 위치를 가져오지 못했습니다:", error);
            reject(new Error("Geolocation error"));
          }
        );
      } else {
        console.error("Geolocation을 지원하지 않는 브라우저입니다.");
        reject(new Error("Geolocation not supported"));
      }
    });
  };
  