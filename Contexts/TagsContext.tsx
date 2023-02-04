import { useState, createContext } from 'react'
import { AddTagsProps, TagsProps } from '../types'

export const TagsContext = createContext({} as TagsProps)

const TagsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [tags, setTags] = useState<any>([])
  const [selectedTags, setSelectedTags] = useState<any>([])

  const removeTags = (indexToRemove: number) => {
    setTags([...tags.filter((_: any, index: number) => index !== indexToRemove)])
  }

  const addTag = (e: AddTagsProps | React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setTags([...tags, e.target.value])
      e.target.value = ''
    }
  }

  const saveSelectedTags = (id: number, tags: string[]) => {
    setSelectedTags([...selectedTags, { id, tags }])
  }

  const removeSelectedTags = (id: number) => {
    setSelectedTags(selectedTags.filter((item: { itemId: number }) => item.itemId !== id))
  }

  return (
    <TagsContext.Provider
      value={{
        addTag,
        removeTags,
        tags,
        setTags,
        saveSelectedTags,
        removeSelectedTags,
        selectedTags
      }}
    >
      {children}
    </TagsContext.Provider>
  )
}

export default TagsContextProvider
