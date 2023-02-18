import Arrow from './Icons/Arrow'
import scrollToView from 'functions/scrollToView'
import { Key } from 'react'
import { PaginationProps } from '@types'
import { ITEMS_PER_PAGE } from '@constants'

const Pagination = ({
  routeName,
  pageNum,
  numberOfPages,
  count,
  foodId,
  itemsPerPage = ITEMS_PER_PAGE,
  category
}: PaginationProps) => {
  const numOfPages = [...Array(numberOfPages).keys()]

  return !foodId && count > itemsPerPage ? (
    <div
      className='flex flex-wrap items-center justify-center mt-8 text-lg select-none ltr'
      onClick={scrollToView}
    >
      {/* Previous Link Arrow */}
      <a
        href={`/${routeName}${
          category
            ? '/' + category + '/' + (pageNum - 1 === 1 ? '' : pageNum - 1)
            : pageNum - 1 === 1
            ? ''
            : '/' + (pageNum - 1)
        }`}
        className={`${
          pageNum > 1 ? 'opacity-100' : 'opacity-50 pointer-events-none'
        } mr-3`}
      >
        <Arrow css='p-1.5' height='36' width='36' />
      </a>

      {/* Current Link Number */}
      <div>
        {numOfPages.map((page: number, index: Key) => (
          <a
            key={index}
            href={`/${routeName}${
              category
                ? '/' + category + '/' + (page + 1 === 1 ? '' : page + 1)
                : page + 1 === 1
                ? ''
                : '/' + (page + 1)
            }`}
            className={`
                  ${
                    pageNum === page + 1
                      ? 'text-orange-600 bg-orange-300'
                      : 'text-gray-800 transition-colors bg-orange-200 hover:bg-orange-300 dark:bg-orange-100 dark:hover:bg-orange-200'
                  } px-4 py-0.5 last:rounded-r-md first:rounded-l-md`}
          >
            {page + 1}
          </a>
        ))}
      </div>

      {/* Next Link Arrow */}
      <a
        href={`/${routeName}${
          category ? '/' + category + '/' + (pageNum + 1) : '/' + (pageNum + 1)
        }`}
        className={`${
          pageNum < numOfPages.length ? 'opacity-100' : 'opacity-50 pointer-events-none'
        } ml-3`}
      >
        <Arrow toLeft css='p-1.5' height='36' width='36' />
      </a>
    </div>
  ) : null
}

export default Pagination
