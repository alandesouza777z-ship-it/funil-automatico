import { useCallback } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { FunnelNodeCard } from './nodes/FunnelNodeCard'
import type { FunnelEdge, FunnelNode } from '../../types/funnel'

interface FunnelCanvasProps {
  nodes: FunnelNode[]
  edges: FunnelEdge[]
  onNodesChange: (changes: NodeChange<Node<FunnelNode['data'], 'funnelNode'>>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  onSelectNode: (nodeId: string | null) => void
}

const nodeTypes: NodeTypes = {
  funnelNode: FunnelNodeCard,
}

export function FunnelCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectNode,
}: FunnelCanvasProps) {
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onSelectNode(node.id)
    },
    [onSelectNode],
  )

  const handlePaneClick = useCallback(() => {
    onSelectNode(null)
  }, [onSelectNode])

  return (
    <div className="canvas-wrapper">
      <ReactFlow
        defaultViewport={{ x: 40, y: 40, zoom: 0.85 }}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        snapToGrid
        snapGrid={[20, 20]}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        minZoom={0.3}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#475569', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap
          className="canvas-minimap"
          pannable
          zoomable
          nodeColor="#334155"
          maskColor="rgba(15,17,23,0.7)"
        />
        <Controls className="canvas-controls" showInteractive={false} />
        <Background variant={BackgroundVariant.Dots} color="#334155" gap={20} size={1} />
      </ReactFlow>
    </div>
  )
}
