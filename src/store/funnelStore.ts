import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBlankFunnelSeed, funnelTemplates, instantiateTemplate, makeStageNode, seededFunnels } from '../data/templates'
import type { AppView, FunnelRecord, FunnelNode as AppFunnelNode, StageNodeInput } from '../types/funnel'
import { FUNNEL_STORAGE_KEY, funnelStorage } from '../utils/storage'

interface FunnelStore {
  view: AppView
  funnels: FunnelRecord[]
  selectedFunnelId: string
  selectedNodeId: string | null
  search: string
  setView: (view: AppView) => void
  setSearch: (value: string) => void
  selectFunnel: (funnelId: string, nextView?: AppView) => void
  createBlankFunnel: () => void
  createFromTemplate: (templateId: string) => void
  duplicateFunnel: (funnelId: string) => void
  archiveFunnel: (funnelId: string) => void
  updateFunnelMeta: (funnelId: string, patch: Partial<Pick<FunnelRecord, 'name' | 'description' | 'type' | 'status' | 'objective'>>) => void
  addNode: (input: StageNodeInput) => void
  deleteNode: (nodeId: string) => void
  updateSelectedNode: (patch: Partial<FunnelRecord['nodes'][number]['data']>) => void
  updateNodeMetrics: (nodeId: string, metrics: Partial<FunnelRecord['nodes'][number]['data']['metrics']>) => void
  importFunnel: (funnel: FunnelRecord) => void
  setSelectedNodeId: (nodeId: string | null) => void
  onNodesChange: (changes: NodeChange<Node<AppFunnelNode['data'], 'funnelNode'>>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
}

const touch = (funnel: FunnelRecord): FunnelRecord => ({
  ...funnel,
  updatedAt: new Date().toISOString(),
})

const cloneFunnel = (funnel: FunnelRecord): FunnelRecord => ({
  ...funnel,
  id: crypto.randomUUID(),
  name: `${funnel.name} Copy`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: funnel.nodes.map((node) => ({
    ...node,
    id: crypto.randomUUID(),
    position: { ...node.position },
    data: {
      ...node.data,
      metrics: { ...node.data.metrics },
    },
  })),
  edges: [],
})

const initialFunnels = seededFunnels()

const initialState = {
  view: 'dashboard' as AppView,
  funnels: initialFunnels,
  selectedFunnelId: initialFunnels[0]?.id ?? '',
  selectedNodeId: initialFunnels[0]?.nodes[0]?.id ?? null,
  search: '',
}

export const useFunnelStore = create<FunnelStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setView: (view) => set({ view }),
      setSearch: (search) => set({ search }),
      selectFunnel: (selectedFunnelId, nextView) => {
        const funnel = get().funnels.find((entry) => entry.id === selectedFunnelId)
        set({
          selectedFunnelId,
          selectedNodeId: funnel?.nodes[0]?.id ?? null,
          view: nextView ?? get().view,
        })
      },
      createBlankFunnel: () => {
        set((state) => {
          const funnelNumber = state.funnels.length + 1
          const funnel = {
            ...createBlankFunnelSeed(),
            name: `Novo funil ${funnelNumber}`,
          }

          return {
            funnels: [funnel, ...state.funnels],
            selectedFunnelId: funnel.id,
            selectedNodeId: funnel.nodes[0]?.id ?? null,
            view: 'builder',
          }
        })
      },
      createFromTemplate: (templateId) => {
        const template = funnelTemplates.find((entry) => entry.id === templateId)
        if (!template) return

        const funnel = instantiateTemplate(template)

        set((state) => ({
          funnels: [funnel, ...state.funnels],
          selectedFunnelId: funnel.id,
          selectedNodeId: funnel.nodes[0]?.id ?? null,
          view: 'builder',
        }))
      },
      duplicateFunnel: (funnelId) => {
        const funnel = get().funnels.find((entry) => entry.id === funnelId)
        if (!funnel) return

        const cloned = cloneFunnel(funnel)
        const idMap = new Map(funnel.nodes.map((node, index) => [node.id, cloned.nodes[index].id]))
        cloned.edges = funnel.edges.map((edge) => ({
          ...edge,
          id: crypto.randomUUID(),
          source: idMap.get(edge.source) ?? edge.source,
          target: idMap.get(edge.target) ?? edge.target,
        }))

        set((state) => ({
          funnels: [cloned, ...state.funnels],
          selectedFunnelId: cloned.id,
          selectedNodeId: cloned.nodes[0]?.id ?? null,
          view: 'builder',
        }))
      },
      archiveFunnel: (funnelId) => {
        set((state) => ({
          funnels: state.funnels.map((funnel) =>
            funnel.id === funnelId ? touch({ ...funnel, status: 'Archived' }) : funnel,
          ),
        }))
      },
      updateFunnelMeta: (funnelId, patch) => {
        set((state) => ({
          funnels: state.funnels.map((funnel) =>
            funnel.id === funnelId ? touch({ ...funnel, ...patch }) : funnel,
          ),
        }))
      },
      addNode: (input) => {
        const nextNode = makeStageNode(input)

        set((state) => ({
          funnels: state.funnels.map((funnel) => {
            if (funnel.id !== state.selectedFunnelId) return funnel

            return touch({
              ...funnel,
              nodes: [...funnel.nodes, nextNode],
            })
          }),
          selectedNodeId: nextNode.id,
        }))
      },
      deleteNode: (nodeId) => {
        set((state) => ({
          funnels: state.funnels.map((funnel) => {
            if (funnel.id !== state.selectedFunnelId) return funnel
            return touch({
              ...funnel,
              nodes: funnel.nodes.filter((n) => n.id !== nodeId),
              edges: funnel.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
            })
          }),
          selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        }))
      },
      updateSelectedNode: (patch) => {
        set((state) => ({
          funnels: state.funnels.map((funnel) => {
            if (funnel.id !== state.selectedFunnelId) return funnel

            return touch({
              ...funnel,
              nodes: funnel.nodes.map((node) =>
                node.id === state.selectedNodeId
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        ...patch,
                        metrics: patch.metrics ?? node.data.metrics,
                      },
                    }
                  : node,
              ),
            })
          }),
        }))
      },
      updateNodeMetrics: (nodeId, metricsPatch) => {
        set((state) => ({
          funnels: state.funnels.map((funnel) => {
            if (funnel.id !== state.selectedFunnelId) return funnel
            return {
              ...funnel,
              nodes: funnel.nodes.map((node) =>
                node.id === nodeId
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        metrics: { ...node.data.metrics, ...metricsPatch },
                      },
                    }
                  : node,
              ),
            }
          }),
        }))
      },
      importFunnel: (funnel) => {
        set((state) => {
          // Don't import duplicates
          if (state.funnels.some((f) => f.id === funnel.id)) return state

          return {
            funnels: [funnel, ...state.funnels],
            selectedFunnelId: funnel.id,
            selectedNodeId: funnel.nodes[0]?.id ?? null,
            view: 'builder',
          }
        })
      },
      setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
      onNodesChange: (changes) => {
        set((state) => ({
          funnels: state.funnels.map((funnel) =>
            funnel.id === state.selectedFunnelId
              ? touch({
                  ...funnel,
                  nodes: applyNodeChanges<Node<AppFunnelNode['data'], 'funnelNode'>>(changes, funnel.nodes) as AppFunnelNode[],
                })
              : funnel,
          ),
        }))
      },
      onEdgesChange: (changes) => {
        set((state) => ({
          funnels: state.funnels.map((funnel) =>
            funnel.id === state.selectedFunnelId
              ? touch({
                  ...funnel,
                  edges: applyEdgeChanges(changes, funnel.edges),
                })
              : funnel,
          ),
        }))
      },
      onConnect: (connection) => {
        set((state) => ({
          funnels: state.funnels.map((funnel) =>
            funnel.id === state.selectedFunnelId
              ? touch({
                  ...funnel,
                  edges: addEdge(
                    {
                      ...connection,
                      type: 'smoothstep',
                      animated: true,
                      label: 'Flow',
                      style: { stroke: '#94a3b8', strokeWidth: 2 },
                    },
                    funnel.edges,
                  ),
                })
              : funnel,
          ),
        }))
      },
    }),
    {
      name: FUNNEL_STORAGE_KEY,
      storage: funnelStorage,
      version: 2,
    },
  ),
)
