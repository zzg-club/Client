'use client'

import { ReactNode } from 'react'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { DialogClose, DialogTitle } from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import '../../styles/CustomModal.css'

interface ModalProps {
  open: boolean
  onOpenChange: () => void
  children: ReactNode
  onNext?: () => void // '다음으로' 버튼 클릭 시 실행
  isFooter: boolean // 하단 버튼 이용 여부
  footerText?: string // 하단 버튼 이용 시 버튼 텍스트
}

export default function CustomModal({
  open,
  onOpenChange,
  children,
  onNext,
  isFooter,
  footerText,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f5f6f8] rounded-3xl w-80 p-0 gap-0 [&>button]:hidden">
        <div className="relative p-6">
          <DialogClose className="absolute right-6">
            <X></X>
          </DialogClose>
          <DialogTitle></DialogTitle>
          {children}
        </div>
        {isFooter && (
          <DialogFooter className="flex flex-col items-center w-full border-t border-[#afafaf]">
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
