'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface Nav {
  name: string
  path: string
}

const NavBar: React.FC = () => {
  const pathname = usePathname()
  const [selectNav, setSelectNav] = useState<string>('스케줄')

  const navs: Nav[] = useMemo(
    () => [
      { name: '스케줄', path: '/schedule' },
      { name: '렛츠밋', path: '/letsmeet' },
      { name: '플레이스', path: '/place' },
    ],
    [],
  )

  useEffect(() => {
    const currentNav = navs.find((nav) => nav.path === pathname)
    if (currentNav) {
      setSelectNav(currentNav.name)
    }
  }, [pathname, navs])

  return (
    <nav className="w-full h-16 justify-start flex items-center bg-white pl-[20px] py-5 rounded-bl-3xl rounded-br-3xl shadow-[0px_0px_10px_0px_rgba(30,30,30,0.10)] gap-[12px]">
      {navs.map((nav) => (
        <Link
          key={nav.name}
          href={nav.path}
          onClick={() => setSelectNav(nav.name)}
          className={`relative text-xl font-semibold leading-[17px] ${
            selectNav === nav.name ? 'text-[#9562fa]' : 'text-[#afafaf]'
          }`}
        >
          {nav.name}
          {selectNav === nav.name && (
            <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-[12px] w-[52px] h-1 bg-[#9562fa] rounded"></span>
          )}
        </Link>
      ))}
    </nav>
  )
}

export default NavBar
