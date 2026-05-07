import type { Edge, Node, XYPosition } from '@xyflow/react'

export type AppView = 'dashboard' | 'builder' | 'templates' | 'analytics'
export type EntryTransition = 'none' | 'new-funnel'

export type FunnelCategory = 'Lead' | 'Quiz' | 'Webinar' | 'X1' | 'Produto' | 'Upsell/Downsell'
export type FunnelStatus = 'Draft' | 'Active' | 'Scaling' | 'Archived'
export type AwarenessLevel =
  | 'Inconsciente'
  | 'Problema'
  | 'Solução'
  | 'Produto'
  | 'Compra'

export type NodeKind =
  | 'traffic'
  | 'landing'
  | 'checkout'
  | 'upsell'
  | 'downsell'
  | 'webinar'
  | 'call'
  | 'thankyou'
  | 'email'
  | 'whatsapp'
  | 'vsl'
  | 'quiz'

export interface StageMetrics {
  visits: number
  clicks: number
  optIns: number
  sales: number
  conversion: number
  exits: number
}

export type FunnelNodeData = Record<string, unknown> & {
  nodeKind: NodeKind
  title: string
  subtitle: string
  awarenessLevel: AwarenessLevel
  offerType: string
  cta: string
  notes: string
  objective: string
  accent: string
  trackingUrl: string
  metrics: StageMetrics
}

export type FunnelNode = Node<FunnelNodeData, 'funnelNode'>
export type FunnelEdge = Edge

export interface FunnelTotals {
  visits: number
  leads: number
  sales: number
  conversion: number
  revenue: number
}

export interface FunnelRecord {
  id: string
  name: string
  type: FunnelCategory
  status: FunnelStatus
  description: string
  createdAt: string
  updatedAt: string
  tags: string[]
  objective: string
  nodes: FunnelNode[]
  edges: FunnelEdge[]
  totals: FunnelTotals
}

export interface FunnelTemplate {
  id: string
  name: string
  category: FunnelCategory
  description: string
  tags: string[]
  objective: string
  seedNodes: FunnelNode[]
  seedEdges: FunnelEdge[]
  totals: FunnelTotals
}

export interface StageLibraryItem {
  kind: NodeKind
  label: string
  description: string
  accent: string
  awarenessLevel: AwarenessLevel
  objective: string
}

export interface StageNodeInput {
  kind: NodeKind
  position: XYPosition
  title?: string
  subtitle?: string
  cta?: string
  offerType?: string
  notes?: string
  objective?: string
  awarenessLevel?: AwarenessLevel
  trackingUrl?: string
}

export interface TrackingEvent {
  funnelId: string
  nodeId: string
  type: 'pageview' | 'exit' | 'click'
  url: string
  referrer: string
  timestamp: string
  sessionId: string
  timeOnPage?: number
}
