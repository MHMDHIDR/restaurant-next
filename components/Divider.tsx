import { DividerProps } from '@types'

const Divider = ({
  thickness = 0,
  style = 'dashed',
  marginY = 14,
  color = 'orange'
}: DividerProps) => (
  <hr
    className={`my-${marginY} border${
      !thickness || thickness === 0 || thickness === 1 ? '' : '-' + thickness
    } border-${style}  border-${color}-800 dark:border-${color}-700 rounded w-full`}
  />
)

export default Divider
