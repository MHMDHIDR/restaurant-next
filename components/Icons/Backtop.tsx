import { useRef } from 'react'
import useEventListener from 'hooks/useEventListener'
import { toggleCSSclasses } from 'functions/toggleCSSclasses'
import { SCROLL_LIMIT } from '@constants'

const Backtop = ({ color = 'orange' }) => {
  const backTopRef = useRef(null)

  useEventListener('scroll', () => {
    if (backTopRef === null) return
    toggleCSSclasses(
      [window.scrollY > SCROLL_LIMIT],
      backTopRef.current!,
      ['opacity-100', 'bottom-[10%]', 'pointer-events-auto'],
      ['opacity-0', 'bottom-1/2', 'pointer-events-none']
    )
  })

  return (
    <button
      id='back__top'
      type='button'
      className={`group fixed right-[3%] dark:shadow-orange-600 p-3 bg-${color}-600 hover:bg-${color}-700 text-white rounded-full transition-all shadow-md hover:shadow-lg focus:bg-${color}-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-orange-800 active:shadow-lg opacity-0 pointer-events-none`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      ref={backTopRef}
    >
      <svg
        aria-hidden='true'
        focusable='false'
        className='w-4 h-4 transition-transform group-hover:-translate-y-1'
        role='button'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 448 512'
      >
        <title>الذهاب للأعلى</title>
        <path
          fill='currentColor'
          d='M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z'
        ></path>
      </svg>
    </button>
  )
}

export default Backtop
