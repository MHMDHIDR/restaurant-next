import { DividerProps } from '../types'

const Divider = ({ thickness = 0, style = 'dashed', marginY = 14 }: DividerProps) => (
  <hr
    className={`my-${marginY} border${
      !thickness || thickness === 0 || thickness === 1 ? '' : '-' + thickness
    } border-${style} border-orange-800 dark:border-orange-700 rounded`}
  />
)

export default Divider
