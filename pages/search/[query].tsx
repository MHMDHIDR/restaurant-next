import { useContext, Suspense } from 'react'
import Link from 'next/link'
import useDocumentTitle from 'hooks/useDocumentTitle'
import abstractText from 'functions/abstractText'
import { removeSlug } from 'functions/slug'
import { CartContext } from 'contexts/CartContext'
import { SearchContext } from 'contexts/SearchContext'
import { LoadingCard } from 'components/Loading'
import Card from 'components/Card'
import Nav from 'components/Nav'
import Footer from 'components/Footer'
import Search from 'components/Search'
import { useTranslate } from 'hooks/useTranslate'

const SearchResults: React.FC = () => {
  const { search, searchResults, loading } = useContext(SearchContext)
  const { items } = useContext(CartContext)
  const { t } = useTranslate()

  useDocumentTitle(
    search
      ? `${search} ${t('app.search.searchResultsTitle')}`
      : t('app.search.searchInput')
  )

  const searchResultsCount = searchResults.length

  return (
    <section id='SearchResults' className='flex flex-col justify-between min-h-screen'>
      <Nav />
      <div className='container py-32 mx-auto mb-60'>
        <div className='text-center mb-28'>
          {search ? (
            <>
              <h2 className='mb-10 text-xl md:text-2xl xl:text-4xl'>
                {t('app.search.searchResultsTitle')} {search}
              </h2>
              <Search />
            </>
          ) : (
            <h2 className='mb-10 text-xl md:text-2xl xl:text-4xl'>
              {t('app.search.searchTitle')}
            </h2>
          )}
        </div>

        {search ? (
          searchResultsCount > 0 ? (
            <div className='flex flex-col gap-y-36'>
              {searchResults?.map((data, idx) => (
                <Suspense key={idx} fallback={<LoadingCard />}>
                  <Card
                    cItemId={data._id}
                    cHeading={
                      <Link href={`/view/item/${data._id}`}>
                        {removeSlug(abstractText(data.foodName, 70))}
                      </Link>
                    }
                    cPrice={data.foodPrice}
                    cCategory={data.category}
                    cDesc={abstractText(data.foodDesc, 120)}
                    cTags={data?.foodTags}
                    cToppings={data.foodToppings}
                    cImg={data.foodImgs}
                    cImgAlt={data.foodName}
                    cCtaLabel={
                      //add to cart button, if item is already in cart then disable the button
                      items.find(itemInCart => itemInCart.cItemId === data._id) ? (
                        <div className='relative rtl m-2 min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-red-800 hover:bg-red-700'>
                          <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                            ❌
                          </span>
                          &nbsp;&nbsp;
                          <span className='mr-4 text-center pointer-events-none'>
                            {t('app.foodItem.removeFromCart')}
                          </span>
                        </div>
                      ) : (
                        <div className='relative rtl m-2 min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-green-800 hover:bg-green-700'>
                          <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                            🛒
                          </span>
                          &nbsp;&nbsp;
                          <span className='mr-4 text-center pointer-events-none'>
                            {t('app.foodItem.addToCart')}
                          </span>
                        </div>
                      )
                    }
                  />
                </Suspense>
              ))}
            </div>
          ) : loading ? (
            <LoadingCard />
          ) : (
            <h3 className='text-xl text-center md:text-2xl xl:text-4xl'>
              {t('app.search.searchNotFound')} {search}
            </h3>
          )
        ) : (
          <Search />
        )}
      </div>
      <Footer />
    </section>
  )
}

export default SearchResults
