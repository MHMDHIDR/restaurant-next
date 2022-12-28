const menuToggler = (onlyHide = true) => {
  const togglerCheckbox = document.querySelector('#menuToggler') as HTMLInputElement

  if (onlyHide) {
    togglerCheckbox.checked = false
    return
  }

  //if the checkbox is checked, uncheck it (this to reverse the toggling when clicking on the navbar links)
  togglerCheckbox.checked
    ? (togglerCheckbox.checked = false)
    : (togglerCheckbox.checked = true)
}

export default menuToggler
