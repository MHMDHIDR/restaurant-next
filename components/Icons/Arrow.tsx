import { ArrowProps } from '../../types'

const Arrow = ({
  width = 'clamp(15px,2vw,3rem)',
  height = width,
  toLeft,
  css
}: ArrowProps) => {
  return (
    <svg
      xlinkTitle='svg arrow'
      viewBox='0 0 64 118'
      fill='black'
      xmlns='http://www.w3.org/2000/svg'
      className={`${
        toLeft ? 'hover:translate-x-1' : 'rotate-180 hover:-translate-x-1'
      } w-${width} h-${height} ${css !== undefined ? css : ''} transition-transform`}
      style={{ width: width, height: height }}
    >
      <path
        className='fill-black dark:fill-gray-100'
        d='M62.3837 55.7619L7.8052 1.33438C6.017 -0.447824 3.12187 -0.444828 1.33666 1.3436C-0.447159 3.1318 -0.44255 6.02855 1.34588 7.81214L52.6757 59.0002L1.34404 110.188C-0.444164 111.972 -0.448774 114.867 1.33482 116.655C2.22972 117.552 3.40212 118 4.5745 118C5.7439 118 6.91168 117.555 7.80497 116.664L62.3837 62.2383C63.2449 61.3814 63.7282 60.2152 63.7282 59.0002C63.7282 57.7852 63.2435 56.6204 62.3837 55.7619Z'
      />
    </svg>
  )
}

export default Arrow
