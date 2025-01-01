'use client'

import { Copy } from 'lucide-react'
import { useState } from 'react'

interface ScheduleSelectShareModalProps {
  inviteUrl: string
}

export default function ScheduleSelectShareModal({
  inviteUrl,
}: ScheduleSelectShareModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      console.log(copied)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div>
      <p className="text-[#1e1e1e] text-xl font-medium">친구 초대</p>
      <div className="flex flex-col items-center space-y-[12px] p-4 mt-[30px]">
        <div className="flex w-full flex-col items-center">
          <div className="w-[120px] h-[120px] bg-[#afafaf]">
            {/*QR 들어갈 자리*/}
          </div>
        </div>

        <p className="text-[#afafaf] text-center text-base font-normal pt-3 font-['Pretendard']">
          링크는 24시간 동안 유효해요!
        </p>

        <div className="flex w-full items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inviteUrl}
              readOnly
              className="w-full px-3.5 py-[5px] rounded-3xl border border-[#afafaf] focus:outline-none text-[#afafaf]"
            />
            <button
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-md transition-colors rounded-[50%]"
            >
              <Copy className="h-4 w-4 text-[#d9d9d9]" />
            </button>
          </div>
        </div>

        <div className="flex w-full items-center space-x-2">
          <div className="flex-1 relative">
            <button
              className="w-full flex px-3.5 py-[5px] items-center gap-2 border border-[#afafaf] rounded-3xl text-[#afafaf] hover:text-[#d9d9d9] font-['Pretendard']"
              onClick={() => alert('카카오톡으로 공유하기')}
            >
              카카오톡으로 공유하기
              <img
                src="/share-kakao.svg"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
