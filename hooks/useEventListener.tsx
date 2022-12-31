import { useEffect, useRef } from 'react'

const useEventListener = (
  eventType: string = '',
  listener: EventListenerOrEventListenerObject = () => null,
  target: EventTarget = window,
  options: AddEventListenerOptions = null
) => {
  const savedListener = useRef<any>()

  useEffect(() => {
    savedListener.current = listener
  }, [listener])

  useEffect(() => {
    if (!target?.addEventListener) return

    const eventListener = (event: any) => savedListener.current(event)

    target.addEventListener(eventType, eventListener, options)

    return () => {
      target.removeEventListener(eventType, eventListener, options)
    }
  }, [eventType, target, options])
}

export default useEventListener
