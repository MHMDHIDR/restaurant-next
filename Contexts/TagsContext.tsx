import { useState, createContext, KeyboardEvent } from 'react'
import { AddTagsProps, TagsProps } from '@types'

console.log('hi')

export const TagsContext = createContext<TagsProps>({
  tags: [],
  setTags: function (_tags: string[]): void {
    throw new Error('Function not implemented.')
  },
  removeTags: function (_index: number): void {
    throw new Error('Function not implemented.')
  },
  addTag: function (_e: KeyboardEvent<HTMLInputElement>): void {
    throw new Error('Function not implemented.')
  },
  saveSelectedTags: function (_id: number, _tags: string[]): void {
    throw new Error('Function not implemented.')
  },
  removeSelectedTags: function (_id: number) {
    throw new Error('Function not implemented.')
  },
  selectedTags: []
})

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
