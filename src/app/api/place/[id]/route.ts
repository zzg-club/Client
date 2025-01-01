import { NextResponse } from 'next/server';

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params;

  // URL에서 type 쿼리 파라미터 추출
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'food', 'cafe', 'play' 등

  // 샘플 데이터
  const sampleData: Record<string, {
    name: string;
    type: string; // 추가된 type
    address: string;
    description: string;
    tags: string[];
    operatingHours: string;
    maxGuests: number;
    likes: number;
    images: string[];
    additionalInfo: string;
  }> = {
    '1': {
      name: '풍경 한우',
      type: 'food', // 음식점
      address: '경기도 용인시 수지구 성복2로 376',
      description: '자연에 고기로 하나 같이 맛있게 먹자',
      tags: ['24시', '학교'],
      operatingHours: '10:00 - 22:00',
      maxGuests: 6,
      likes: 323,
      images: [
        '/images/meat1.png',
        '/images/meat2.png',
        '/images/meat3.png',
      ],
      additionalInfo: '풍경한우? 가족 생일마다 가는 단골 맛집! 고기가 정말 최고야!',
    },
    '2': {
      name: '알베르',
      type: 'cafe', // 카페
      address: '서울 강남구 강남대로102길 34',
      description: '편안한 분위기에서 커피를 즐길 수 있는 곳',
      tags: ['스터디', '콘센트'],
      operatingHours: '09:00 - 23:00',
      maxGuests: 4,
      likes: 245,
      images: [
        '/images/cafe1.png',
        '/images/cafe2.png',
        '/images/cafe3.png',
      ],
      additionalInfo: '아늑한 공간에서 집중하며 커피 한 잔의 여유를 즐기세요.',
    },
    '3': {
      name: '슈퍼스타 코인노래방',
      type: 'play', // 오락
      address: '서울 양천구 목동동로 65',
      description: '최신 음악과 최고의 음향을 즐길 수 있는 노래방',
      tags: ['노래방', '24시'],
      operatingHours: '24시간 영업',
      maxGuests: 10,
      likes: 512,
      images: [
        '/images/karaoke1.png',
        '/images/karaoke2.png',
        '/images/karaoke3.png',
      ],
      additionalInfo: '친구들과 즐거운 시간을 보내기에 완벽한 장소!',
    },
  };

  const selectedPlace = sampleData[id];

  // ID가 없거나 type이 불일치하는 경우 처리
  if (!selectedPlace || (type && selectedPlace.type !== type)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  return NextResponse.json(selectedPlace);
}
