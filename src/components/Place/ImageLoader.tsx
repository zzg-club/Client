import React, { useState, useEffect } from 'react';

interface ImageLoaderProps {
  imageUrl: string; // API에서 가져올 이미지 URL
  fallbackUrl?: string; // 기본 이미지 URL
  alt?: string; // 이미지 대체 텍스트
  className?: string; // 스타일링을 위한 클래스
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  imageUrl,
  fallbackUrl = '/default-cafe.jpg', // 기본값 설정
  alt = '이미지',
  className = '',
}) => {
  const [imageSrc, setImageSrc] = useState<string>(fallbackUrl);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(imageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setImageSrc(objectUrl); // 로드된 이미지 URL로 업데이트
        } else {
          console.error('Failed to fetch image:', response.status);
        }
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    if (imageUrl) fetchImage();
  }, [imageUrl]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).src = fallbackUrl; // 로드 실패 시 기본 이미지
      }}
    />
  );
};

export default ImageLoader;
