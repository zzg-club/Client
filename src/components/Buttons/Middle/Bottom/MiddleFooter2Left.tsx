import React from 'react'

interface MiddleFooter2RightProps {
  onClick: () => void // 클릭 이벤트 핸들러
}

const MiddleFooter2Right: React.FC<MiddleFooter2RightProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', // 버튼 내부 아이템 정렬
        width: '24px', // 버튼 너비
        height: '36px', // 버튼 높이
        justifyContent: 'center', // 내부 아이템 가운데 정렬
        alignItems: 'center', // 내부 아이템 수직 가운데 정렬
        gap: '8px', // 내부 아이템 간 간격
        flexShrink: 0, // 크기 줄어들지 않도록 설정
        borderRadius: '24px', // 둥근 모서리
        background: 'var(--MainColor, #9562FB)', // 배경색
        border: 'none', // 기본 테두리 제거
        cursor: 'pointer', // 클릭 가능한 커서
      }}
    >
      <img
        src="/arrow_white.svg" // 버튼 아이콘 이미지
        alt="Slide Button"
        style={{
          width: '24px', // 아이콘 너비
          height: '24px', // 아이콘 높이
          objectFit: 'contain', // 아이콘 크기 조정
        }}
      />
    </button>
  )
}

export default MiddleFooter2Right
