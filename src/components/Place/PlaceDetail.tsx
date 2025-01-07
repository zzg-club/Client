'use client';

import React, { useEffect, useState, useRef } from 'react';
import KakaoMap from '@/components/Map/KakaoMap';
import styles from '@/app/place/styles/Detail.module.css';
import { Place } from '@/types/place';
import Menu from '@/components/Place/Menu'; // 메뉴 컴포넌트 임포트
import StoreInfo from '@/components/Place/StoreInfo'; // 영업 정보 컴포넌트 임포트
import VisitorPhoto from '@/components/Place/VisitorPhoto'; // 방문자 사진 컴포넌트 임포트
import SectionTitle from '@/components/Place/SectionTitle'; // 방문자 사진 컴포넌트 임포트

interface PlaceDetailProps {
  id: string;
}

const PlaceDetail = ({ id }: PlaceDetailProps) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bottomSheetState, setBottomSheetState] = useState<'collapsed' | 'middle' | 'expanded'>('collapsed');
  const [activeTab, setActiveTab] = useState<'상세' | '메뉴' | '사진'>('상세');
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const threshold = 50;
  const mapRef = useRef<() => void | null>(null);

  useEffect(() => {
    const fetchPlaceData = async () => {
      try {
        const response = await fetch(`/api/place/${id}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch place data');
        }
        const data = await response.json();
        setSelectedPlace(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceData();
  }, [id]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (startY.current !== null && currentY.current !== null) {
      const delta = startY.current - currentY.current;

      if (delta > threshold) {
        setBottomSheetState((prevState) => (prevState === 'collapsed' ? 'middle' : 'expanded'));
      } else if (delta < -threshold) {
        setBottomSheetState((prevState) => (prevState === 'expanded' ? 'middle' : 'collapsed'));
      }
    }
    startY.current = null;
    currentY.current = null;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !selectedPlace) {
    return <div>Failed to load place details.</div>;
  }

  return (
    <div className={styles['detail-container']}>
      <div className={styles['map-container']}>
        <KakaoMap selectedPlace={selectedPlace} />
      </div>
      {/* Bottom Sheet */}
      <div
        className={`${styles.bottomSheet} ${styles[bottomSheetState]}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.dragHandle}></div>

        {/* Collapsed State Content */}
        {bottomSheetState === 'collapsed' && (
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{selectedPlace.name}</h3>
                <div className={styles.likes}>
                  <div className={styles.likeBackground}>
                    <div className={styles.likeIcon}></div>
                  </div>
                  <span>{selectedPlace.likes}명</span>
                </div>
              </div>

              <div className={styles.tags}>
                {selectedPlace.tags.map((tag, idx) => (
                  <span key={idx} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <h3>자연에 고기로 하나 같이 맛있게 먹자</h3>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '2px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <img
                    src="/clock-icon.svg"
                    alt="Clock Icon"
                    style={{ width: '18px', height: '18px' }}
                  />
                  <p
                    style={{ fontSize: '16px', fontWeight: '400', color: '#AFAFAF', letterSpacing: '-0.5px' }}
                  >
                    영업시간
                  </p>
                  <p
                    style={{ fontSize: '16px', fontWeight: '500', color: '#9562FB', letterSpacing: '-0.5px' }}
                  >
                    10:00 - 22:00
                  </p>
                </div>
                <button
                  style={{
                    backgroundColor: '#61C56C',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    width: '92px',
                    height: '44px',
                  }}
                >
                  <img
                    src="/call.svg"
                    alt="Call Icon"
                    style={{ width: '36px', height: '36px' }}
                  />
                </button>
              </div>
            </div>
        )}

        {/* Middle and Expanded State Content */}
        {['middle', 'expanded'].includes(bottomSheetState) && (
          <>
            <div className={styles['image-gallery']}>
              <div className={styles['gallery-large']}>
                <img
                  src={selectedPlace.images[0]}
                  alt="Large Gallery"
                  className={styles['gallery-image']}
                />
              </div>

              <div className={styles['gallery-small-container']}>
                {selectedPlace.images.slice(1, 5).map((image, index) => (
                  <div key={index} className={styles['gallery-small']}>
                    <img
                      src={image}
                      alt={`Small Gallery ${index}`}
                      className={styles['gallery-image']}
                    />
                    {index === 3 && selectedPlace.images.length > 5 && (
                      <div className={styles['more-overlay']}>
                        +{selectedPlace.images.length - 5}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{selectedPlace.name}</h3>
                  <div className={styles.likes}>
                    <div className={styles.likeBackground}>
                      <div className={styles.likeIcon}></div>
                    </div>
                    <span>{selectedPlace.likes}명</span>
                  </div>
                </div>

                <div className={styles.tags}>
                  {selectedPlace.tags.map((tag, idx) => (
                    <span key={idx} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className={styles.description}>
                  풍경한우? 가족 생일마다 가는 단골 맛집! 길이 험하고 반찬 줄어든 건 아쉽지만, 고기가 정말 최고야!
                </div>

                <div className={styles.tabContainer}>
                  {['상세', '메뉴', '사진'].map((tab) => (
                    <div
                      key={tab}
                      className={`${styles.tab} ${activeTab === tab ? styles.selected : ''}`}
                      onClick={() => setActiveTab(tab as '상세' | '메뉴' | '사진')}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.tabContent}>
              {activeTab === '상세' && (
                <>
                  <div className={styles.cardContainer} style={{ marginBottom: '10px' }}>
                    <StoreInfo selectedPlace={selectedPlace} />
                    <div style={{ marginTop: '40px' }}>
                      <SectionTitle title="인기 메뉴" />
                    </div>
                    <Menu selectedPlace={selectedPlace} />
                  </div>

                  <div className={styles.cardContainer} style={{ marginTop: '10px' }}>
                    <SectionTitle title="방문자 사진" />
                    <VisitorPhoto selectedPlace={selectedPlace} />
                  </div>
                </>
              )}
              {activeTab === '메뉴' && <Menu selectedPlace={selectedPlace} />}
              {activeTab === '사진' && <VisitorPhoto selectedPlace={selectedPlace} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlaceDetail;
