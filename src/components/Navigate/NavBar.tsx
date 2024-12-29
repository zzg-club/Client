'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface NavbarProps {
  onSelectNav?: (selectedNav: string) => void
}

const Navbar: React.FC<NavbarProps> = ({ onSelectNav }) => {
  const [selectedNav, setSelectedNav] = useState('스케줄')

  const navs = [
    { name: '스케줄', path: '/schedule' },
    { name: '렛츠밋', path: '/letsmeet' },
    { name: '플레이스', path: '/place' },
  ]

  const handleNavClick = (navName: string) => {
    setSelectedNav(navName)
    if (onSelectNav) {
      onSelectNav(navName) // 부모 컴포넌트로 선택된 네비게이션 전달
    }
  }

  return (
    <nav className="w-full h-16 flex items-center bg-white pl-5 shadow-lg gap-4">
      {navs.map((nav) => (
        <Link
          key={nav.name}
          href={nav.path}
          onClick={(e) => {
            e.preventDefault() // 기본 페이지 이동 방지
            handleNavClick(nav.name)
          }}
          className={`text-lg font-semibold ${
            selectedNav === nav.name ? 'text-purple-600' : 'text-gray-500'
          }`}
        >
          {nav.name}
        </Link>
      ))}
    </nav>
  )
}

export default Navbar
