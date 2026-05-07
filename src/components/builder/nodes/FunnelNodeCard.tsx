import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { CSSProperties } from 'react'
import type { FunnelNodeData, NodeKind } from '../../../types/funnel'

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

const kindColors: Record<NodeKind, string> = {
  traffic: '#6366f1',
  landing: '#3b82f6',
  checkout: '#10b981',
  upsell: '#f59e0b',
  downsell: '#ef4444',
  webinar: '#8b5cf6',
  call: '#ec4899',
  thankyou: '#14b8a6',
  email: '#f97316',
  whatsapp: '#22c55e',
  vsl: '#dc2626',
  quiz: '#7c3aed',
}

export function FunnelNodeCard({ data, selected }: NodeProps) {
  const typedData = data as unknown as FunnelNodeData
  const color = kindColors[typedData.nodeKind] || '#6366f1'

  return (
    <div
      className={`fnode ${selected ? 'fnode--selected' : ''}`}
      style={{ '--fnode-color': color } as CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="fnode__handle" />

      <div className="fnode__icon">
        <span>{kindIcons[typedData.nodeKind] || '📦'}</span>
      </div>

      <div className="fnode__content">
        <span className="fnode__kind">{typedData.nodeKind}</span>
        <h4 className="fnode__title">{typedData.title}</h4>
        <p className="fnode__subtitle">{typedData.subtitle}</p>
      </div>

      <div className="fnode__stats">
        <div>
          <span>Visits</span>
          <strong>{typedData.metrics.visits}</strong>
        </div>
        <div className="fnode__stats-sep" />
        <div>
          <span>Exits</span>
          <strong>{typedData.metrics.exits}</strong>
        </div>
        <div className="fnode__stats-sep" />
        <div>
          <span>Conv.</span>
          <strong>{typedData.metrics.conversion}%</strong>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="fnode__handle" />
    </div>
  )
}
