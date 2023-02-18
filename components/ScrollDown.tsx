import { useRouter } from 'next/router'

const ScrollDown = () => {
  const router = useRouter()

  return (
    <button
      className='cursor-pointer flex flex-col items-center animate-bounce absolute bottom-[3vh] sm:bottom-[4vh] md:bottom-[5.5vh] lg:bottom-[7.5vh] xl:bottom-[10vh] z-10'
      role='button'
      type='button'
      name='scrolldown'
      area-label={`Click to Scroll to down to section`}
      onClick={() => {
        const { nextSibling }: any = document.getElementById('hero') as HTMLElement | null

        if (nextSibling) {
          window.scrollTo({
            top: nextSibling.offsetTop - 50,
            behavior: 'smooth'
          })
        } else {
          router.push('/')
        }
      }}
    >
      <div className='w-5 h-8 border-2 border-gray-300 border-solid pointer-events-none sm:w-6 sm:h-10 rounded-2xl transform-none'>
        <div className='relative w-1 h-2 mx-auto my-2 border-2 border-gray-300 border-solid rounded-full'></div>
      </div>
      <div className='pointer-events-none animate-pulse'>
        <span className='block w-3 h-3 -mb-2 rotate-45 border-b-2 border-r-2 border-solid sm:w-4 sm:h-4 border-r-gray-300 border-b-gray-300'></span>
        <span className='block w-3 h-3 rotate-45 border-b-2 border-r-2 border-solid sm:w-4 sm:h-4 border-r-gray-300 border-b-gray-300'></span>
      </div>
    </button>
  )
}

export default ScrollDown
