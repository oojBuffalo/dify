'use client'
import type { FC } from 'react'
import React, { useCallback } from 'react'
import produce from 'immer'
import Item from './dataset-item'
import type { DataSet } from '@/models/datasets'
type Props = {
  list: DataSet[]
  onChange: (list: DataSet[]) => void
}

const DatasetList: FC<Props> = ({
  list,
  onChange,
}) => {
  const handleRemove = useCallback((index: number) => {
    return () => {
      const newList = produce(list, (draft) => {
        draft.splice(index, 1)
      })
      onChange(newList)
    }
  }, [])
  return (
    <div>
      {
        list.map((item, index) => {
          return (
            <Item
              key={index}
              payload={item}
              onRemove={handleRemove(index)}
            />
          )
        })
      }

    </div>
  )
}
export default React.memo(DatasetList)
