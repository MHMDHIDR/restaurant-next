export const LoadingPage = () => (
  <div className='fixed inset-0 flex items-center justify-center w-screen h-screen bg-orange-100 dark:bg-orange-900'>
    <div className='absolute w-6 h-6 bg-orange-700 rounded-full dark:bg-orange-300 animate-fly-in'></div>
    <div className='absolute w-6 h-6 bg-orange-700 rounded-full dark:bg-orange-300 animate-fly-in animate-delay-100'></div>
    <div className='absolute w-6 h-6 bg-orange-700 rounded-full dark:bg-orange-300 animate-fly-in animate-delay-200'></div>
  </div>
)

export const LoadingSpinner = ({ color = 'white', size = '6' }) => (
  <svg
    className={`fill-${color} animate-spin h-${size} w-${size} inline-block`}
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
  >
    <circle
      className='opacity-25'
      cx='12'
      cy='12'
      r='10'
      stroke='currentColor'
      strokeWidth='4'
    ></circle>
    <path
      className='opacity-75'
      fill='currentColor'
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    ></path>
  </svg>
)

export const LoadingCard = () => (
  <div className='grid items-center w-4/5 p-2 mx-auto rounded-lg shadow-xl bg-neutral-400 h-fit dark:bg-white sm:grid-cols-2 opacity-60 dark:opacity-80'>
    <div className='w-48 h-48 mx-auto mt-4 rounded-md rounded-bl-lg bg-neutral-100 animate-pulse sm:mt-0 sm:mx-0'></div>
    <div className='p-5 mr-0 sm:-mr-10 md:-mr-20 lg:-mr-40 xl:-mr-60 2xl:-mr-[22rem]'>
      <h3 className='my-2 font-bold text-center select-none ltr'>
        <LoadingSpinner />
        &nbsp; Loading Items...
      </h3>
      <div className='h-6 mb-4 rounded-sm bg-neutral-100 animate-pulse'></div>
      <div className='grid grid-cols-4 gap-4'>
        <div className='h-4 col-span-3 rounded-sm bg-neutral-100 animate-pulse'></div>
        <div className='h-4 rounded-sm bg-neutral-100 animate-pulse'></div>

        <div className='h-4 col-span-2 rounded-sm bg-neutral-100 animate-pulse'></div>
        <div className='h-4 col-span-2 rounded-sm bg-neutral-100 animate-pulse'></div>

        <div className='h-4 rounded-sm bg-neutral-100 animate-pulse'></div>
        <div className='h-4 col-span-3 rounded-sm bg-neutral-100 animate-pulse'></div>
        <div className='h-4 col-span-2 rounded-sm bg-neutral-100 animate-pulse'></div>
        <div className='h-4 rounded-sm bg-neutral-100 animate-pulse'></div>
      </div>
    </div>
  </div>
)
