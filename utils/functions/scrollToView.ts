const scrollToView = () =>
  setTimeout(
    () =>
      window.scrollTo({
        top: (document.querySelector(`#hero`) as HTMLElement)?.offsetHeight || 500, //window.scrollY / 3
        behavior: 'smooth'
      }),
    100
  )

export default scrollToView
