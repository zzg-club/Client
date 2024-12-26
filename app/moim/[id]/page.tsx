'use client'

import { useParams } from 'next/navigation'
import { FiBell } from 'react-icons/fi'

export default function MoimDetail() {
  const { id } = useParams()

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            모임{id}
            <span className="ml-2 text-gray-400 text-sm cursor-pointer">
              ✏️
            </span>
          </h1>
        </div>
        <button>
          <FiBell size={24} className="text-gray-600" />
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex gap-4 mb-6 text-sm">
        <a
          href="#"
          className="text-purple-600 font-semibold border-b-2 border-purple-600 pb-1"
        >
          스케줄
        </a>
        <a href="#" className="text-gray-500">
          렛츠밋
        </a>
        <a href="#" className="text-gray-500">
          플레이스
        </a>
      </nav>

      {/* 참여 중인 모임원 */}
      <section className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-2">
          참여 중인 모임원
        </h2>
        <div className="flex items-center gap-2">
          {/* Mocked member circles */}
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="w-8 h-8 bg-black rounded-full border-2 border-white"
            ></div>
          ))}
          <span className="text-purple-500 text-sm">4</span>
        </div>
      </section>

      {/* 일정 추가 안내 */}
      <section className="text-center text-gray-500 mb-6">
        <p>모임 일정을 추가해봐요!</p>
      </section>

      {/* 일정 추가하기 버튼 */}
      <div className="absolute bottom-4 right-4">
        <button className="bg-purple-500 text-white text-base font-semibold px-6 py-3 rounded-full shadow-lg flex items-center justify-center">
          + 일정 추가하기
        </button>
      </div>
    </div>
  )
}
