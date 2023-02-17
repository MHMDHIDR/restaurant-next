export const toggleCSSclasses = (
  [...conditions]: any[],
  elem: Element,
  [...addCls]: string[],
  [...removeCls]: string[]
) => {
  if (conditions.every(condition => condition)) {
    addCls.map(cl => elem.classList.add(cl))
    removeCls.map(cl => elem.classList.remove(cl))
  } else if (conditions.every(condition => !condition)) {
    addCls.map(cl => elem.classList.remove(cl))
    removeCls.map(cl => elem.classList.add(cl))
  }
}
