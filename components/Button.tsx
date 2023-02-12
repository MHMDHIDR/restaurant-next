import { ButtonProps } from '../types'

export const ClickableButton = ({ color = 'green', children }: ButtonProps) => {
  return (
    <button
      className={`min-w-[7rem] text-white py-1.5 px-6 mb-8 mr-10 rounded-md
      shadow-[0_7px] hover:shadow-[0_5px]
      shadow-green-700 shadow-${color}-700 hover:shadow-green-900 hover:shadow-${color}-900
      bg-green-600 bg-${color}-600 hover:bg-green-700 hover:bg-${color}-700
      hover:translate-y-1 transition-all
      `}
    >
      {children}
    </button>
  )
}
