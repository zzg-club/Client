import { useState, useEffect } from 'react'
import { fetchLikedStates } from '@/app/api/places/liked/route'
import { fetchLikeCount } from '@/app/api/places/updateLike/route'
import { toggleLike } from '@/app/api/places/like/route'

export const useLikeSystem = (placeId: number) => {
  const [liked, setLiked] = useState<boolean>(false)
  const [likeCount, setLikeCount] = useState<number>(0)

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const likedState = await fetchLikedStates(String(placeId))
        const likes = await fetchLikeCount(placeId)
        setLiked(likedState)
        setLikeCount(likes)
      } catch (error) {
        console.error('Error fetching like data:', error)
      }
    }

    fetchLikes()
  }, [placeId])

  const handleLikeButtonClick = async () => {
    try {
      const updatedLiked = await toggleLike(placeId, liked)
      const updatedLikeCount = await fetchLikeCount(placeId)
      setLiked(updatedLiked)
      setLikeCount(updatedLikeCount)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  return { liked, likeCount, handleLikeButtonClick }
}