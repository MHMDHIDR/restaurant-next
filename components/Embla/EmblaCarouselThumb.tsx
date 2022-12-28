export const Thumb = ({ selected, onClick, imgSrc, alt }) => {
  return (
    <div
      title={alt}
      className={`relative pr-4 last-of-type:pr-0 ${
        selected ? 'opacity-100' : 'opacity-20'
      } transition-opacity duration-300`}
    >
      <button
        onClick={onClick}
        className='relative block w-24 h-24 overflow-hidden bg-transparent border-0 rounded-lg cursor-pointer touch-manipulation outline-0 margin-0 padding-0'
        type='button'
      >
        <img
          loading='lazy'
          className={`absolute top-0 bottom-0 -left-[10000%] -right-[10000%] m-auto min-w-[1000%] min-h-[1000%] max-w-none scale-[0.1]`}
          src={imgSrc}
          alt={alt}
        />
      </button>
    </div>
  )
}
