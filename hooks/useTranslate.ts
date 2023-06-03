import { useIntl } from 'react-intl'
import { useCallback } from 'react'
import { TranslationKey } from 'lang/flattenMessages'

export const useTranslate = () => {
  const { formatMessage } = useIntl()

  const t = useCallback(
    (key: TranslationKey) => formatMessage({ id: key }),
    [formatMessage]
  )

  return { t }
}
