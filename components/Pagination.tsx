import { Link } from 'react-router-dom'
import Arrow from './Icons/Arrow'
import scrollToView from '../utils/functions/scrollToView'
import { Key } from 'react'
import { PaginationProps } from '../types'

const Pagination = ({
  routeName,
  pageNum,
  numberOfPages,
  count,
  foodId,
  itemsPerPage,
  category
}: PaginationProps) => {
  numberOfPages = [...Array(numberOfPages).keys()]

  // only render pagination if there is no food id (not multiple food items)
  if (!foodId) {
    if (count > itemsPerPage) {
      return (
        <div
          className='flex flex-wrap items-center justify-center mt-8 text-lg select-none ltr'
          onClick={scrollToView}
        >
          {/* Previous Link Arrow */}
          <Link
            to={`/${routeName}${
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
          </Link>

          {/* Current Link Number */}
          <div>
            {numberOfPages.map((page: number, index: Key) => (
              <Link
                key={index}
                to={`/${routeName}${
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
              </Link>
            ))}
          </div>

          {/* Next Link Arrow */}
          <Link
            to={`/${routeName}${
              category ? '/' + category + '/' + (pageNum + 1) : '/' + (pageNum + 1)
            }`}
            className={`${
              pageNum < numberOfPages.length
                ? 'opacity-100'
                : 'opacity-50 pointer-events-none'
            } ml-3`}
          >
            <Arrow toLeft css='p-1.5' height='36' width='36' />
          </Link>
        </div>
      )
    }
  }
  //return nothing if there's food id in the request (not multiple food items)
  return null
}

export default Pagination
