'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'

interface ButtonProps {
  buttonString: string
  onClick: () => void
  isOpen: boolean
}

export default function Button({ buttonString, onClick, isOpen }: ButtonProps) {
  return (
    <div className="absolute bottom-4 right-4">
      <button
        onClick={onClick}
        className={`text-white text-base font-semibold px-6 h-12 rounded-3xl shadow-lg flex items-center justify-center overflow-hidden ${
          isOpen ? 'bg-[#f3e3ff]' : 'bg-[#9562fa]'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 text-[#1e1e1e]" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                {buttonString}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  )
}
