'use client'

import { ReactNode } from 'react'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { DialogClose, DialogTitle } from '@radix-ui/react-dialog'
import { X, UserPlus } from 'lucide-react'
import '../../styles/CustomModal.css'

interface ModalProps {
  open: boolean
  onOpenChange: () => void
  children: ReactNode
  onNext?: () => void // '다음으로' 버튼 클릭 시 실행
  isFooter: boolean // 하단 버튼 이용 여부
  isUserPlus?: boolean // '친구추가' 버튼 이용 여부
  onPlus?: () => void // '친구추가' 버튼 클릭 시 실행
  footerText?: string // 하단 버튼 이용 시 버튼 텍스트
}

export default function CustomModal({
  open,
  onOpenChange,
  children,
  onNext,
  isFooter,
  isUserPlus,
  onPlus,
  footerText,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f5f6f8] rounded-3xl w-[280px] p-0 gap-0 [&>button]:hidden border-0">
        <div className="relative p-6 w-[280px]">
          {isUserPlus && (
            <button
              className="text-[#9562fa] absolute right-[3.3rem] focus:outline-none"
              onClick={onPlus}
            >
              <UserPlus size={24} />
            </button>
          )}
          <DialogClose className="absolute right-6">
            <X></X>
          </DialogClose>
          <DialogTitle></DialogTitle>
          {children}
        </div>
        {isFooter && (
          <DialogFooter className="flex flex-col items-center w-[280px] border-t border-[#afafaf]">
            <button
              onClick={onNext}
              className="text-center text-[#9562fa] font-medium rounded-3xl text-lg py-5 w-full"
            >
              {footerText}
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
