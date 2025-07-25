export interface ButtonProps {
  text: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  className?: string
}

export function WhiteButton({ text, onClick, className = '' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-[125px] h-[35px] text-[#9562fa] rounded-3xl border-2 border-[#9562fa] justify-center items-center gap-3 inline-flex cursor-pointer ${className}`}
    >
      <div className={'text-sm text-center font-semibold leading-[17px]'}>
        {text}
      </div>
    </button>
  )
}
