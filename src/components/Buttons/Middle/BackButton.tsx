import React from 'react'

interface MiddleBackButtonProps {
  onClick: () => void
  style?: React.CSSProperties
}

const MiddleBackButton: React.FC<MiddleBackButtonProps> = ({
  onClick,
  style,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '16px', // 둥근 모서리
        border: '1px solid var(--NavBarColor, #AFAFAF)', // 테두리
        background: 'var(--Grays-White, #FFF)', // 배경색
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // 그림자
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style, // 외부 스타일 병합
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
  )
}

export default MiddleBackButton
