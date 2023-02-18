const ScrollToSection = (e: any) => {
  const target = e.target

  if (target.hasAttribute('data-scroll')) {
    e.preventDefault()
    //check target link if not empty, else set it to .hero
    const targetLink = target.dataset.scroll !== '' ? target.dataset.scroll : 'hero'
    const targetLinkExists = document.getElementsByClassName(targetLink)
    //if targetLink exists in same page scroll, else redirect to homepage then scroll
    if (targetLinkExists.length) {
      //(50 means padding top)
      window.scrollTo({
        top: (document.querySelector('.' + targetLink) as HTMLElement).offsetTop - 50,
        behavior: 'smooth'
      })
    } else {
      document.location.href = '/#' + targetLink
    }
  } else {
    console.error(`
      ${target.textContent} Element, which is (${target}) 
      doesn't have data-scroll attribute, please make sure to add it.
    `)
  }
}

export default ScrollToSection
