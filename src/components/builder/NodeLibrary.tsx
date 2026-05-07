import { motion } from 'framer-motion'
import { stageLibrary } from '../../data/templates'
import type { NodeKind } from '../../types/funnel'

const kindIcons: Record<NodeKind, string> = {
  traffic: '🌐',
  landing: '📄',
  checkout: '💳',
  upsell: '⬆️',
  downsell: '⬇️',
  webinar: '🎥',
  call: '📞',
  thankyou: '✅',
  email: '✉️',
  whatsapp: '💬',
  vsl: '▶️',
  quiz: '❓',
}

interface NodeLibraryProps {
  onAddNode: (kind: NodeKind) => void
}

export function NodeLibrary({ onAddNode }: NodeLibraryProps) {
  return (
    <div className="node-library">
      <div className="node-library__header">
        <h4>Adicionar Etapas</h4>
        <span className="node-library__hint">Clique para inserir no canvas</span>
      </div>
      <div className="node-library__grid">
        {stageLibrary.map((item, index) => (
          <motion.button
            key={item.kind}
            type="button"
            className="node-chip"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15, delay: index * 0.02 }}
            onClick={() => onAddNode(item.kind)}
            title={item.description}
          >
            <span className="node-chip__icon">{kindIcons[item.kind] || '📦'}</span>
            <span className="node-chip__label">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
