export const focus = (e: any) => {
  const elem =
    e.target.parentElement.parentElement.parentElement.querySelectorAll('label')
  const lastElem = elem[elem.length - 1]
  lastElem.querySelector('#toppingName').focus()
}
