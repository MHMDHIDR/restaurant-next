import ModalNotFound from '../components/Modal/ModalNotFound'

// logout user from the system deleting the token from the local storage
const logoutUser = (userId: string) => {
  //getting user id from local storage
  const USER_ID = 'user' in localStorage && JSON.parse(localStorage.getItem('user'))._id

  if (USER_ID === userId) {
    localStorage.removeItem('user')
    return <ModalNotFound />
  }
}

export default logoutUser
