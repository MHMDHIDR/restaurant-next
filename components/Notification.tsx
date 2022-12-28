const Notification = ({ sendStatus, sendStatusMsg }) => {
  return sendStatusMsg ? (
    <p
      className={`notification__msg relative border border-solid py-4 px-6 mb-10 rounded-lg text-center font-bold text-sm sm:text-base transition-all duration-500 rtl ${
        sendStatus === 1
          ? 'bg-green-100 text-green-800 border-green-700'
          : 'bg-red-100 text-red-800 border-red-700'
      }`}
    >
      <button
        type='button'
        className='absolute font-normal cursor-pointer right-4 hover:font-bold'
        aria-label='close noification'
        title='close noification'
        onClick={e => {
          const noification = (e.target as HTMLButtonElement).parentElement
          noification.remove()
        }}
      >
        X
      </button>
      {sendStatusMsg}
    </p>
  ) : null
}

export default Notification
