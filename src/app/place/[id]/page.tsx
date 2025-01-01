'use client';

import { use } from 'react';
import PlaceDetail from '@/components/Place/PlaceDetail';

const PlacePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params); // React.use()를 사용해 Promise 언래핑

  return <PlaceDetail id={id} />;
};

export default PlacePage;
