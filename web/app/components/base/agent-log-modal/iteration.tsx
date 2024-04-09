'use client'
import { useTranslation } from 'react-i18next'
import type { FC } from 'react'
import cn from 'classnames'
import ToolCall from './tool-call'
import type { AgentIteration } from '@/models/log'

type Props = {
  isFinal: boolean
  index: number
  iterationInfo: AgentIteration
}

const Iteration: FC<Props> = ({ iterationInfo, isFinal, index }) => {
  const { t } = useTranslation()

  return (
    <div className={cn('px-4 py-2')}>
      <div className='flex items-center'>
        <div className='shrink-0 mr-3 text-gray-500 text-xs leading-[18px] font-semibold'>{`${t('appLog.agentLogDetail.iteration').toUpperCase()} ${index}`}</div>
        <div className='grow h-[1px] bg-gradient-to-r from-[#f3f4f6] to-gray-50'></div>
      </div>
      {iterationInfo.tool_calls.map((toolCall, index) => (
        <ToolCall
          key={index}
          toolCall={toolCall}
        />
      ))}
    </div>
  )
}

export default Iteration
