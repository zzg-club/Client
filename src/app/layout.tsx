import type { Metadata } from 'next'
import './globals.css'
import localFont from 'next/font/local'
import React from 'react'
import Notification from '@/components/Modals/Notification'

const pretendard = localFont({
  src: '../fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
})

export const metadata: Metadata = {
  title: 'MOIM',
  description: '선배들이 추천하는 캠퍼스 라이프 필수템',
  icons: {
    icon: '/logo.ico',
  },
  openGraph: {
    title: '모임 MOIM',
    description: '캠퍼스 라이프 필수템',
    images: [
      {
        url: 'https://moimbucket.s3.ap-northeast-2.amazonaws.com/kakao+openGraph+(1600x800).png',
        width: 1600,
        height: 800,
        alt: '모임 MOIM Open Graph Image',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${pretendard.variable}`}>
      <body className={`${pretendard.className}`}>
        <Notification />
        <div className="mobile-container">{children}</div>
      </body>
    </html>
  )
}
