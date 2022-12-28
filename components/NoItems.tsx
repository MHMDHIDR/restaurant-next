import { Link } from 'react-router-dom'
import { NoItemsProps } from '../types'
import goTo from '../utils/functions/goTo'

const NoItems = ({ msg, links }: NoItemsProps) => (
  <div className='flex flex-col items-center justify-center gap-6 my-10'>
    <p className='max-w-lg my-2 text-lg font-bold leading-10 tracking-wider text-red-500'>
      {msg
        ? msg
        : `عفواً! لم يتم العثور على وجبات أو مشروبات في سلة الطلبات 😥 يمكنك تصفح المطعم وإضافة وجبات أو مشروبات جديدة إلى سلة الطلبات`}
    </p>
    <div className='flex gap-3'>
      {links?.map((link: { to: string; label: string }, idx) => (
        <Link
          key={idx}
          to={goTo(link.to)}
          className='px-3 py-1 text-orange-800 transition-colors bg-orange-100 border border-orange-700 rounded hover:bg-orange-200'
        >
          {link.label}
        </Link>
      ))}
    </div>
  </div>
)

export default NoItems
