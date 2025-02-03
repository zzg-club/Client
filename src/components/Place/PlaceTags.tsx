'use client'

import React, { useEffect, useState } from 'react'
import styles from '@/app/place/styles/Detail.module.css'
import { fetchFilters } from '@/app/api/places/filter/route'

interface FilterData {
  category: number;
  filters: { [key: string]: string };
}

interface PlaceTagsProps {
  category: number;
  placeData: {
    filter1: boolean;
    filter2: boolean;
    filter3: boolean;
    filter4: boolean;
  };
}

const PlaceTags: React.FC<PlaceTagsProps> = ({ category, placeData }) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    const fetchAndSetFilters = async () => {
      try {
        const response = await fetchFilters();
        const filterData = await response.json();

        if (filterData.success) {
          const categoryFilters = filterData.data.find(
            (filter: FilterData) => filter.category === category
          );

          if (categoryFilters) {
            const activeTags = Object.entries(placeData)
              .filter(([key, value]) => key.startsWith('filter') && value === true)
              .map(([key]) => categoryFilters.filters[key]);

            setActiveFilters(activeTags.filter(Boolean)); // undefined 제거
          }
        }
      } catch (error) {
        console.error('필터 데이터 가져오기 실패:', error);
      }
    };

    fetchAndSetFilters();
  }, [category, placeData]);

  return (
    <div className={styles.tags}>
      {activeFilters.length > 0 ? (
        activeFilters.map((tag, idx) => (
          <span key={idx} className={styles.tag}>
            {tag}
          </span>
        ))
      ) : (
        <span ></span>
      )}
    </div>
  );
};

export default PlaceTags;