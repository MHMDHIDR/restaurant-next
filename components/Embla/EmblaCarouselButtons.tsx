export const DotButton = ({ selected, onClick }) => (
  <button
    aria-label='Dotted Navigation'
    title='Dotted Navigation'
    className={`bg-transparent cursor-pointer relative p-0 outline-0 border-0 w-8 h-8 mx-2 flex items-center after:bg-gray-100 after:w-full after:h-1 after:rounded-sm ${
      selected ? 'after:bg-orange-400 opacity-100' : ''
    }`}
    type='button'
    onClick={onClick}
  />
)

export const PrevButton = ({ enabled, onClick }) => (
  <button
    aria-label='Previous slide'
    title='Previous slide'
    className='outline-0 cursor-pointer bg-transparent touch-manipulation absolute z-[1] top-1/2 -translate-y-1/2 border-0 border-none w-10 h-10 fill-orange-400 hover:fill-orange-500 disabled:hover:fill-orange-400 disabled:cursor-default disabled:opacity-30 left-3'
    onClick={onClick}
    disabled={!enabled}
    type='button'
  >
    <svg className='w-full h-full' viewBox='137.718 -1.001 366.563 644'>
      <path
        strokeWidth='.5rem'
        className='stroke-orange-900'
        d='M428.36 12.5c16.67-16.67 43.76-16.67 60.42 0 16.67 16.67 16.67 43.76 0 60.42L241.7 320c148.25 148.24 230.61 230.6 247.08 247.08 16.67 16.66 16.67 43.75 0 60.42-16.67 16.66-43.76 16.67-60.42 0-27.72-27.71-249.45-249.37-277.16-277.08a42.308 42.308 0 0 1-12.48-30.34c0-11.1 4.1-22.05 12.48-30.42C206.63 234.23 400.64 40.21 428.36 12.5z'
      />
    </svg>
  </button>
)

export const NextButton = ({ enabled, onClick }) => (
  <button
    aria-label='Next slide'
    title='Next slide'
    className='outline-0 cursor-pointer bg-transparent touch-manipulation absolute z-[1] top-1/2 -translate-y-1/2 border-0 border-none w-10 h-10 fill-orange-400 hover:fill-orange-500 disabled:hover:fill-orange-400 disabled:cursor-default disabled:opacity-30 right-3'
    onClick={onClick}
    disabled={!enabled}
    type='button'
  >
    <svg className='w-full h-full' viewBox='0 0 238.003 238.003'>
      <path
        strokeWidth='.2rem'
        className='stroke-orange-900'
        d='M181.776 107.719L78.705 4.648c-6.198-6.198-16.273-6.198-22.47 0s-6.198 16.273 0 22.47l91.883 91.883-91.883 91.883c-6.198 6.198-6.198 16.273 0 22.47s16.273 6.198 22.47 0l103.071-103.039a15.741 15.741 0 0 0 4.64-11.283c0-4.13-1.526-8.199-4.64-11.313z'
      />
    </svg>
  </button>
)
