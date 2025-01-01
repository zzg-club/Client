'use client'

import { ReactNode } from 'react'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { DialogClose, DialogTitle } from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import '../../styles/CustomModal.css'
import '../../styles/SelectModal.css'

export interface SelectModalProps {
  open: boolean
  onOpenChange: () => void
  children: ReactNode
  onClickLeft: () => void
  onClickRight: () => void
  leftText: string
  rightText: string
}

export default function SelectModal({
  open,
  onOpenChange,
  children,
  onClickLeft,
  onClickRight,
  leftText,
  rightText,
}: SelectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white w-[280px] p-0 gap-0 [&>button]:hidden border-0 radius-3xl">
        {/* 상단 타이틀 영역 */}
        <div className="flex item-center justify-center p-5 text-center">
          <DialogClose className="absolute right-4 focus:outline-none">
            <X></X>
          </DialogClose>
          <DialogTitle></DialogTitle>
          {children}
        </div>

        {/* 하단 버튼 영역 */}
        <DialogFooter className="flex flex-row w-full border-t border-[#afafaf]">
          <button
            onClick={onClickLeft}
            className="text-center text-[#9562fa] font-medium text-base py-4 w-full marginzero-button"
          >
            {leftText}
          </button>
          <div className="w-[2px] bg-[#afafaf] marginzero-button"></div>
          <button
            onClick={onClickRight}
            className="text-center text-[#9562fa] font-medium text-base py-4 w-full marginzero-button"
          >
            {rightText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
