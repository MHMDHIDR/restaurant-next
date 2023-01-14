import ModalNotFound from '../../components/Modal/ModalNotFound'
import { USER } from '../../constants'

// logout user from the system deleting the token from the local storage
const logoutUser = (userId: string) => {
  //getting user id from local storage
  const USER_ID = USER._id

  if (USER_ID === userId) {
    localStorage.removeItem('user')
    return <ModalNotFound />
  }
}

export default logoutUser
