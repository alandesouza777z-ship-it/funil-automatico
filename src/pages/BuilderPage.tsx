import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NodeLibrary } from '../components/builder/NodeLibrary'
import { InspectorPanel } from '../components/builder/InspectorPanel'
import { FunnelCanvas } from '../components/builder/FunnelCanvas'
import type { FunnelNode, FunnelRecord, NodeKind } from '../types/funnel'

interface BuilderPageProps {
  funnel: FunnelRecord | undefined
  selectedNode: FunnelNode | undefined
  onAddNode: (kind: NodeKind) => void
  onSelectNode: (nodeId: string | null) => void
  onNodesChange: Parameters<typeof FunnelCanvas>[0]['onNodesChange']
  onEdgesChange: Parameters<typeof FunnelCanvas>[0]['onEdgesChange']
  onConnect: Parameters<typeof FunnelCanvas>[0]['onConnect']
  onUpdateMeta: (patch: Partial<Pick<FunnelRecord, 'name' | 'description' | 'objective'>>) => void
  onUpdateNode: (patch: Partial<FunnelNode['data']>) => void
}

export function BuilderPage({
  funnel,
  selectedNode,
  onAddNode,
  onSelectNode,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onUpdateMeta,
  onUpdateNode,
}: BuilderPageProps) {
  const [showLibrary, setShowLibrary] = useState(false)
  const [showInspector, setShowInspector] = useState(true)

  if (!funnel) {
    return (
      <div className="builder-empty">
        <div className="builder-empty__content">
          <div className="builder-empty__icon">📐</div>
          <strong>Nenhum funil selecionado</strong>
          <p>Abra um funil pelo dashboard ou crie um novo canvas para começar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="builder">
      {/* Top toolbar */}
      <header className="builder__toolbar">
        <div className="builder__toolbar-left">
          <h2 className="builder__funnel-name">{funnel.name}</h2>
          <span className="builder__status-badge">{funnel.status}</span>
          <span className="builder__meta-chip">{funnel.nodes.length} etapas</span>
          <span className="builder__meta-chip">{funnel.edges.length} conexões</span>
        </div>

        <div className="builder__toolbar-right">
          <button
            type="button"
            className={`btn btn--toolbar ${showLibrary ? 'btn--toolbar-active' : ''}`}
            onClick={() => setShowLibrary(!showLibrary)}
          >
            ＋ Blocos
          </button>
          <button
            type="button"
            className={`btn btn--toolbar ${showInspector ? 'btn--toolbar-active' : ''}`}
            onClick={() => setShowInspector(!showInspector)}
          >
            ⚙ Inspector
          </button>
        </div>
      </header>

      {/* Library drawer */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            className="builder__library-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <NodeLibrary onAddNode={onAddNode} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas + Inspector */}
      <div className={`builder__workspace ${showInspector ? 'builder__workspace--with-inspector' : ''}`}>
        <div className="builder__canvas-area">
          <FunnelCanvas
            key={funnel.id}
            nodes={funnel.nodes}
            edges={funnel.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectNode={onSelectNode}
          />
        </div>

        <AnimatePresence>
          {showInspector && (
            <motion.aside
              className="builder__inspector"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <InspectorPanel
                funnel={funnel}
                selectedNode={selectedNode}
                onUpdateMeta={onUpdateMeta}
                onUpdateNode={onUpdateNode}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
