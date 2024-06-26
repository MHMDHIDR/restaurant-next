import Modal from './Modal'
import { Error } from '../Icons/Status'
import { ModalProps } from '@types'

const ModalNotFound = ({
  // status prop type react element
  status = Error,
  btnLink = '/',
  btnName = 'الصفحة الرئيسية',
  msg = `نعتذر على الازعاج، لكن يبدو أن الصفحة التي تبحث عنها غير متواجدة! أو أنك أخطأت في كتابة اسم الصفحة! للعودة الى ${btnName} إضغط الزر أدناه`
}: ModalProps) => {
  return <Modal status={status} msg={msg} btnName={btnName} btnLink={btnLink} />
}

export default ModalNotFound
