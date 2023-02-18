const Add = ({ width = '10', height = '10', className = '', color = '' }) => (
  <svg
    aria-hidden='true'
    focusable='false'
    role='img'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 448 512'
    width='50'
    height='50'
    className={`w-${width} h-${height} ${className} max-w-[1rem]`}
    xlinkTitle='Add Button'
  >
    <path
      fill='currentColor'
      d='M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z'
    ></path>
  </svg>
)

export default Add
