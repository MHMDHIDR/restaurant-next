import Link from 'next/link'
import { NoItemsProps } from '@types'
import goTo from 'functions/goTo'
import { useTranslate } from 'hooks/useTranslate'

const NoItems = ({ msg, links }: NoItemsProps) => {
  const { t } = useTranslate()

  return (
    <div className='flex flex-col items-center justify-center gap-6 my-10'>
      <p className='max-w-lg my-2 text-lg font-bold leading-10 tracking-wider text-red-500'>
        {msg ? msg : t('app.order-food.messages.noItems')}
      </p>
      <div className='flex gap-3'>
        {links?.map((link: { to: string; label: string }, idx) => (
          <Link
            key={idx}
            href={goTo(link.to)}
            className='px-3 py-1 text-orange-800 transition-colors bg-orange-100 border border-orange-700 rounded hover:bg-orange-200'
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default NoItems
