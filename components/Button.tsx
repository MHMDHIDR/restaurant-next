import { ButtonProps } from '../types'

export const ClickableButton = ({ color = 'green', children }: ButtonProps) => (
  <button
    className={`min-w-[7rem] bg-${color}-600 text-white py-1.5 px-6 mb-8 mr-10 rounded-md shadow-[0_7px] shadow-${color}-800 hover:shadow-[0_5px] hover:shadow-${color}-900 hover:translate-y-1 hover:bg-${color}-700 transition-all`}
  >
    {children}
  </button>
)
