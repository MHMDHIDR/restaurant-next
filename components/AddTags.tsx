import { useContext } from 'react'
import { TagsContext } from '../Contexts/TagsContext'
import { TagsProps } from '../types'
import TagIcon from './Icons/TagIcon'

const AddTags = ({ inputId }: { inputId: string }) => {
  const { tags, removeTags, addTag } = useContext<TagsProps>(TagsContext)

  return (
    <>
      <ul className='flex flex-wrap mt-6 overflow-x-scroll'>
        {tags.map((tag, index) => (
          <li
            key={index}
            className='flex items-center justify-center py-1 mt-0 mb-2 ml-2 tracking-widest text-white bg-orange-700 rounded select-none hover:bg-orange-800 group hover:cursor-pointer'
            onClick={() => removeTags(index)}
          >
            <span className='flex items-center gap-2 mx-2 whitespace-nowrap'>
              <TagIcon />
              {tag}
            </span>
            <span
              className='
                block w-5 h-5 ml-2 pl-0.5 leading-[1.1rem] text-xl text-center text-orange-800 bg-white rounded-full 
                group-hover:bg-red-500 group-hover:text-white
              '
            >
              &times;
            </span>
          </li>
        ))}
      </ul>
      <input
        type='text'
        id={inputId}
        className='form__input tags'
        placeholder='اكتب العلامات التصنيفية التي تريد اضافتها'
        onKeyDown={e => {
          if (e.target.value.trim() !== '') {
            addTag(e)
          }
        }}
      />
    </>
  )
}

export default AddTags
