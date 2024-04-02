import {
  useCallback,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useStoreApi } from 'reactflow'
import type {
  Edge,
  Node,
} from '../types'
import { BlockEnum } from '../types'
import { useStore } from '../store'
import { getValidTreeNodes } from '../utils'
import { MAX_TREE_DEEPTH } from '../constants'
import { useIsChatMode } from './use-workflow'
import { useNodesExtraData } from './use-nodes-data'
import { useToastContext } from '@/app/components/base/toast'

export const useChecklist = (nodes: Node[], edges: Edge[]) => {
  const { t } = useTranslation()
  const nodesExtraData = useNodesExtraData()
  const buildInTools = useStore(s => s.buildInTools)
  const customTools = useStore(s => s.customTools)

  const needWarningNodes = useMemo(() => {
    const list = []
    const { validNodes } = getValidTreeNodes(nodes, edges)

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const { errorMessage } = nodesExtraData[node.data.type].checkValid(node.data, t)
      let toolIcon

      if (node.data.type === BlockEnum.Tool) {
        if (node.data.provider_type === 'builtin')
          toolIcon = buildInTools.find(tool => tool.id === node.data.provider_id)?.icon

        if (node.data.provider_type === 'custom')
          toolIcon = customTools.find(tool => tool.id === node.data.provider_id)?.icon
      }

      if (errorMessage || !validNodes.find(n => n.id === node.id)) {
        list.push({
          id: node.id,
          type: node.data.type,
          title: node.data.title,
          toolIcon,
          unConnected: !validNodes.find(n => n.id === node.id),
          errorMessage,
        })
      }
    }

    return list
  }, [t, nodes, edges, nodesExtraData, buildInTools, customTools])

  return needWarningNodes
}

export const useChecklistBeforePublish = () => {
  const { t } = useTranslation()
  const { notify } = useToastContext()
  const isChatMode = useIsChatMode()
  const store = useStoreApi()
  const nodesExtraData = useNodesExtraData()

  const handleCheckBeforePublish = useCallback(() => {
    const {
      getNodes,
      edges,
    } = store.getState()
    const nodes = getNodes()
    const {
      validNodes,
      maxDepth,
    } = getValidTreeNodes(nodes, edges)

    if (maxDepth > MAX_TREE_DEEPTH) {
      notify({ type: 'error', message: t('workflow.common.maxTreeDepth', { depth: MAX_TREE_DEEPTH }) })
      return false
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const { errorMessage } = nodesExtraData[node.data.type as BlockEnum].checkValid(node.data, t)

      if (errorMessage) {
        notify({ type: 'error', message: `[${node.data.title}] ${errorMessage}` })
        return false
      }

      if (!validNodes.find(n => n.id === node.id)) {
        notify({ type: 'error', message: `[${node.data.title}] ${t('workflow.common.needConnecttip')}` })
        return false
      }
    }

    if (isChatMode && !nodes.find(node => node.data.type === BlockEnum.Answer)) {
      notify({ type: 'error', message: t('workflow.common.needAnswerNode') })
      return false
    }

    if (!isChatMode && !nodes.find(node => node.data.type === BlockEnum.End)) {
      notify({ type: 'error', message: t('workflow.common.needEndNode') })
      return false
    }

    return true
  }, [nodesExtraData, notify, t, store, isChatMode])

  return {
    handleCheckBeforePublish,
  }
}
