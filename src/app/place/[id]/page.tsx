'use client'

import { use } from 'react'
import PlaceDetailCampus from '@/components/Place/PlaceDetailCampus'
import PlaceDetailReservation from '@/components/Place/PlaceDetailReservation'
import PlaceDetailFood from '@/components/Place/PlaceDetailFood'
import PlaceDetailPlay from '@/components/Place/PlaceDetailPlay'

const PlacePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params) // React.use()를 사용해 Promise 언래핑

  // return <PlaceDetailReservation id={id} />
  // return <PlaceDetailCampus id={id} />
  // return <PlaceDetailFood id={id} />
   return <PlaceDetailPlay id={id} />


}

export default PlacePage
