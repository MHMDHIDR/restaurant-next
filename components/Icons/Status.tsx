const ICON_SIZE_CLASS = 'w-16 h-16'

// SUCCESS
export const Success = (
  <svg
    viewBox='0 0 87 87'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    className={`status__icon--success ${ICON_SIZE_CLASS}`}
  >
    <title>Great :D Everything is good 👍🏻</title>
    <g id='Page-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
      <g id='Group-3' transform='translate(2.000000, 2.000000)'>
        <circle
          id='Oval-2'
          stroke='rgba(165, 220, 134, 0.2)'
          strokeWidth='4'
          cx='41.5'
          cy='41.5'
          r='41.5'
        ></circle>
        <circle
          className='status__icon--success-circle'
          id='Oval-2'
          stroke='#A5DC86'
          strokeWidth='4'
          cx='41.5'
          cy='41.5'
          r='41.5'
        ></circle>
        <polyline
          className='status__icon--success-path'
          id='Path-2'
          stroke='#A5DC86'
          strokeWidth='4'
          points='19 38.8036813 31.1020744 54.8046875 63.299221 28'
        ></polyline>
      </g>
    </g>
  </svg>
)

// ERROR
export const Error = (
  <svg
    viewBox='0 0 87 87'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    className={`status__icon--error ${ICON_SIZE_CLASS}`}
  >
    <title>Opps! something went wrong 😞</title>
    <g id='Page-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
      <g id='Group-2' transform='translate(2.000000, 2.000000)'>
        <circle
          id='Oval-2'
          className='status__icon--error-circle status__icon--error-circle-1'
          cx='41.5'
          cy='41.5'
          r='41.5'
        ></circle>
        <circle
          className='status__icon--error-circle status__icon--error-circle-2'
          cx='41.5'
          cy='41.5'
          r='41.5'
        ></circle>
        <path
          className='status__icon--error-line status__icon--error-line-1'
          d='M22.244224,22 L60.4279902,60.1837662'
          id='Line'
        ></path>
        <path
          className='status__icon--error-line status__icon--error-line-2'
          d='M60.755776,21 L23.244224,59.8443492'
          id='Line'
        ></path>
      </g>
    </g>
  </svg>
)

// LOADING
export const Loading = (
  <svg
    viewBox='0 0 87 87'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    className={`status__icon--loading ${ICON_SIZE_CLASS}`}
  >
    <title>Loading... 💬</title>
    <g id='Page-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
      <g id='Group-3' transform='translate(2.000000, 2.000000)'>
        <circle
          id='Oval-2'
          className='status__icon--loading-circle status__icon--loading-circle-1'
          cx='41.5'
          cy='41.5'
          r='41.5'
        ></circle>
        <circle
          className='status__icon--loading-circle status__icon--loading-circle-2'
          cx='41.5'
          cy='41.5'
          r='41.5'
        ></circle>
      </g>
    </g>
  </svg>
)
