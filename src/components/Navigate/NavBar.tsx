'use client'

import React from 'react'
import Link from 'next/link'

interface NavbarProps {
  activeTab: string // 현재 활성화된 탭
}

const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const navs = [
    { name: '스케줄', path: '/schedule' },
    { name: '렛츠밋', path: '/letsmeet' },
    { name: '플레이스', path: '/place' },
  ]

  return (
    <nav className="w-full h-16 justify-start flex items-center bg-white pl-[20px] py-5 rounded-bl-3xl rounded-br-3xl shadow-[0px_0px_10px_0px_rgba(30,30,30,0.10)] gap-[12px]">
      {navs.map((nav) => (
        <Link
          key={nav.name}
          href={nav.path}
          className={`relative text-xl font-semibold leading-[17px] ${
            activeTab === nav.name ? 'text-[#9562fa]' : 'text-[#afafaf]'
          }`}
        >
          {nav.name}
          {activeTab === nav.name && (
            <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-[12px] w-[52px] h-1 bg-[#9562fa] rounded"></span>
          )}
        </Link>
      ))}
    </nav>
  )
}

export default Navbar
