import { MarkerType } from '@xyflow/react'
import type {
  FunnelEdge,
  FunnelNode,
  FunnelRecord,
  FunnelTemplate,
  NodeKind,
  StageLibraryItem,
  StageNodeInput,
} from '../types/funnel'

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const zeroMetrics = {
  visits: 0,
  clicks: 0,
  optIns: 0,
  sales: 0,
  conversion: 0,
  exits: 0,
}

export const stageLibrary: StageLibraryItem[] = [
  {
    kind: 'traffic',
    label: 'Traffic',
    description: 'Entrada do tráfego e origem da visita.',
    accent: '#64748b',
    awarenessLevel: 'Problema',
    objective: 'Definir a origem do fluxo.',
  },
  {
    kind: 'landing',
    label: 'Landing Page',
    description: 'Página de captura ou pré-venda.',
    accent: '#475569',
    awarenessLevel: 'Solução',
    objective: 'Converter visita em intenção.',
  },
  {
    kind: 'checkout',
    label: 'Checkout',
    description: 'Etapa da oferta principal e pagamento.',
    accent: '#334155',
    awarenessLevel: 'Compra',
    objective: 'Fechar a conversão principal.',
  },
  {
    kind: 'upsell',
    label: 'Upsell',
    description: 'Oferta adicional após a compra.',
    accent: '#52525b',
    awarenessLevel: 'Compra',
    objective: 'Aumentar ticket médio.',
  },
  {
    kind: 'downsell',
    label: 'Downsell',
    description: 'Oferta alternativa para recuperação.',
    accent: '#71717a',
    awarenessLevel: 'Compra',
    objective: 'Recuperar parte da receita.',
  },
  {
    kind: 'webinar',
    label: 'Webinar',
    description: 'Aula ou apresentação antes do pitch.',
    accent: '#3f3f46',
    awarenessLevel: 'Produto',
    objective: 'Aumentar desejo antes da oferta.',
  },
  {
    kind: 'call',
    label: 'Call',
    description: 'Etapa de call comercial ou X1.',
    accent: '#44403c',
    awarenessLevel: 'Produto',
    objective: 'Levar o lead para fechamento consultivo.',
  },
  {
    kind: 'email',
    label: 'Email',
    description: 'Nutrição e follow-up do lead.',
    accent: '#57534e',
    awarenessLevel: 'Problema',
    objective: 'Manter o lead aquecido.',
  },
  {
    kind: 'whatsapp',
    label: 'WhatsApp',
    description: 'Contato rápido e recuperação.',
    accent: '#78716c',
    awarenessLevel: 'Produto',
    objective: 'Encaminhar o lead para ação.',
  },
  {
    kind: 'thankyou',
    label: 'Thank You',
    description: 'Confirmação e próximo passo.',
    accent: '#94a3b8',
    awarenessLevel: 'Compra',
    objective: 'Organizar o pós-clique.',
  },
  {
    kind: 'vsl',
    label: 'VSL',
    description: 'Vídeo de vendas com pitch e oferta.',
    accent: '#dc2626',
    awarenessLevel: 'Produto',
    objective: 'Converter via vídeo de vendas.',
  },
  {
    kind: 'quiz',
    label: 'Quiz',
    description: 'Questionário de segmentação do lead.',
    accent: '#7c3aed',
    awarenessLevel: 'Solução',
    objective: 'Segmentar e qualificar o lead.',
  },
]

const edgeStyle = {
  type: 'smoothstep' as const,
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: '#94a3b8',
  },
  style: {
    stroke: '#94a3b8',
    strokeWidth: 2,
  },
}

const getLibraryItem = (kind: NodeKind) => {
  const item = stageLibrary.find((entry) => entry.kind === kind)

  if (!item) {
    throw new Error(`Unknown stage kind: ${kind}`)
  }

  return item
}

export const makeStageNode = ({
  kind,
  position,
  title,
  subtitle,
  cta,
  offerType,
  notes,
  objective,
  awarenessLevel,
  trackingUrl,
}: StageNodeInput): FunnelNode => {
  const item = getLibraryItem(kind)

  return {
    id: uid(),
    type: 'funnelNode',
    position,
    data: {
      nodeKind: kind,
      title: title ?? item.label,
      subtitle: subtitle ?? item.description,
      awarenessLevel: awarenessLevel ?? item.awarenessLevel,
      offerType: offerType ?? 'Core',
      cta: cta ?? 'Ação',
      notes: notes ?? '',
      objective: objective ?? item.objective,
      accent: item.accent,
      trackingUrl: trackingUrl ?? '',
      metrics: { ...zeroMetrics },
    },
  }
}

const makeEdge = (source: string, target: string, label: string): FunnelEdge => ({
  id: uid(),
  source,
  target,
  label,
  ...edgeStyle,
})

const lowTicketNodes = [
  makeStageNode({ kind: 'traffic', position: { x: 0, y: 120 }, title: 'Traffic' }),
  makeStageNode({ kind: 'landing', position: { x: 280, y: 120 }, title: 'Landing Page' }),
  makeStageNode({ kind: 'checkout', position: { x: 560, y: 120 }, title: 'Checkout' }),
  makeStageNode({ kind: 'upsell', position: { x: 840, y: 30 }, title: 'Upsell' }),
  makeStageNode({ kind: 'downsell', position: { x: 840, y: 220 }, title: 'Downsell' }),
  makeStageNode({ kind: 'thankyou', position: { x: 1120, y: 120 }, title: 'Thank You' }),
]

const webinarNodes = [
  makeStageNode({ kind: 'traffic', position: { x: 0, y: 120 }, title: 'Traffic' }),
  makeStageNode({ kind: 'landing', position: { x: 280, y: 120 }, title: 'Registration' }),
  makeStageNode({ kind: 'email', position: { x: 560, y: 20 }, title: 'Email Follow-up' }),
  makeStageNode({ kind: 'whatsapp', position: { x: 560, y: 230 }, title: 'WhatsApp Reminder' }),
  makeStageNode({ kind: 'webinar', position: { x: 840, y: 120 }, title: 'Webinar' }),
  makeStageNode({ kind: 'checkout', position: { x: 1120, y: 120 }, title: 'Offer' }),
]

const x1Nodes = [
  makeStageNode({ kind: 'traffic', position: { x: 0, y: 120 }, title: 'Traffic' }),
  makeStageNode({ kind: 'landing', position: { x: 280, y: 120 }, title: 'Application' }),
  makeStageNode({ kind: 'whatsapp', position: { x: 560, y: 20 }, title: 'Pre-Call' }),
  makeStageNode({ kind: 'call', position: { x: 560, y: 230 }, title: 'Call' }),
  makeStageNode({ kind: 'checkout', position: { x: 840, y: 230 }, title: 'Close' }),
  makeStageNode({ kind: 'thankyou', position: { x: 1120, y: 230 }, title: 'Onboarding' }),
]

const quizNodes = [
  makeStageNode({ kind: 'traffic', position: { x: 0, y: 120 }, title: 'Traffic' }),
  makeStageNode({ kind: 'landing', position: { x: 280, y: 120 }, title: 'Quiz' }),
  makeStageNode({ kind: 'email', position: { x: 560, y: 30 }, title: 'Email' }),
  makeStageNode({ kind: 'checkout', position: { x: 840, y: 120 }, title: 'Offer' }),
  makeStageNode({ kind: 'upsell', position: { x: 1120, y: 120 }, title: 'Upsell' }),
]

export const funnelTemplates: FunnelTemplate[] = [
  {
    id: 'tpl-low-ticket',
    name: 'Low Ticket + Upsell',
    category: 'Upsell/Downsell',
    description: 'Fluxo simples de entrada, oferta e aumento de ticket.',
    tags: ['low-ticket', 'upsell'],
    objective: 'Montar um fluxo de produto com pós-clique claro.',
    seedNodes: lowTicketNodes,
    seedEdges: [
      makeEdge(lowTicketNodes[0].id, lowTicketNodes[1].id, 'Visit'),
      makeEdge(lowTicketNodes[1].id, lowTicketNodes[2].id, 'CTA'),
      makeEdge(lowTicketNodes[2].id, lowTicketNodes[3].id, 'Bought'),
      makeEdge(lowTicketNodes[2].id, lowTicketNodes[4].id, 'Skipped'),
      makeEdge(lowTicketNodes[3].id, lowTicketNodes[5].id, 'Next'),
      makeEdge(lowTicketNodes[4].id, lowTicketNodes[5].id, 'Recovery'),
    ],
    totals: { visits: 0, leads: 0, sales: 0, conversion: 0, revenue: 0 },
  },
  {
    id: 'tpl-webinar',
    name: 'Webinar Flow',
    category: 'Webinar',
    description: 'Registro, follow-up, webinar e oferta.',
    tags: ['webinar', 'pitch'],
    objective: 'Mapear o fluxo completo de webinar.',
    seedNodes: webinarNodes,
    seedEdges: [
      makeEdge(webinarNodes[0].id, webinarNodes[1].id, 'Register'),
      makeEdge(webinarNodes[1].id, webinarNodes[2].id, 'Email'),
      makeEdge(webinarNodes[1].id, webinarNodes[3].id, 'Reminder'),
      makeEdge(webinarNodes[2].id, webinarNodes[4].id, 'Attend'),
      makeEdge(webinarNodes[3].id, webinarNodes[4].id, 'Attend'),
      makeEdge(webinarNodes[4].id, webinarNodes[5].id, 'Offer'),
    ],
    totals: { visits: 0, leads: 0, sales: 0, conversion: 0, revenue: 0 },
  },
  {
    id: 'tpl-x1',
    name: 'Application + Call',
    category: 'X1',
    description: 'Fluxo de aplicação e fechamento via call.',
    tags: ['x1', 'call'],
    objective: 'Organizar um fluxo consultivo simples.',
    seedNodes: x1Nodes,
    seedEdges: [
      makeEdge(x1Nodes[0].id, x1Nodes[1].id, 'Apply'),
      makeEdge(x1Nodes[1].id, x1Nodes[2].id, 'Qualify'),
      makeEdge(x1Nodes[1].id, x1Nodes[3].id, 'Book'),
      makeEdge(x1Nodes[2].id, x1Nodes[3].id, 'Warm'),
      makeEdge(x1Nodes[3].id, x1Nodes[4].id, 'Close'),
      makeEdge(x1Nodes[4].id, x1Nodes[5].id, 'Onboard'),
    ],
    totals: { visits: 0, leads: 0, sales: 0, conversion: 0, revenue: 0 },
  },
  {
    id: 'tpl-quiz',
    name: 'Quiz Funnel',
    category: 'Quiz',
    description: 'Fluxo de quiz, follow-up e oferta.',
    tags: ['quiz', 'offer'],
    objective: 'Mapear segmentação e match de oferta.',
    seedNodes: quizNodes,
    seedEdges: [
      makeEdge(quizNodes[0].id, quizNodes[1].id, 'Start'),
      makeEdge(quizNodes[1].id, quizNodes[2].id, 'Capture'),
      makeEdge(quizNodes[2].id, quizNodes[3].id, 'Offer'),
      makeEdge(quizNodes[3].id, quizNodes[4].id, 'Upsell'),
    ],
    totals: { visits: 0, leads: 0, sales: 0, conversion: 0, revenue: 0 },
  },
]

export const instantiateTemplate = (
  template: FunnelTemplate,
  options?: Partial<Pick<FunnelRecord, 'name' | 'description' | 'status' | 'type' | 'objective' | 'tags'>>,
): FunnelRecord => {
  const idMap = new Map<string, string>()

  const nodes = template.seedNodes.map((node) => {
    const newId = uid()
    idMap.set(node.id, newId)

    return {
      ...node,
      id: newId,
      position: { ...node.position },
      data: {
        ...node.data,
        metrics: { ...node.data.metrics },
      },
    }
  })

  const edges = template.seedEdges.map((edge) => ({
    ...edge,
    id: uid(),
    source: idMap.get(edge.source) ?? edge.source,
    target: idMap.get(edge.target) ?? edge.target,
  }))

  const now = new Date().toISOString()

  return {
    id: uid(),
    name: options?.name ?? template.name,
    description: options?.description ?? template.description,
    type: options?.type ?? template.category,
    status: options?.status ?? 'Draft',
    objective: options?.objective ?? template.objective,
    tags: options?.tags ?? template.tags,
    createdAt: now,
    updatedAt: now,
    nodes,
    edges,
    totals: { ...template.totals },
  }
}

export const createBlankFunnelSeed = (): FunnelRecord => {
  const traffic = makeStageNode({
    kind: 'traffic',
    position: { x: 40, y: 140 },
    title: 'Traffic',
    subtitle: 'Fonte inicial do fluxo',
  })
  const landing = makeStageNode({
    kind: 'landing',
    position: { x: 340, y: 140 },
    title: 'Landing Page',
    subtitle: 'Primeira página da jornada',
  })
  const checkout = makeStageNode({
    kind: 'checkout',
    position: { x: 640, y: 140 },
    title: 'Checkout',
    subtitle: 'Etapa de conversão principal',
  })

  return {
    id: uid(),
    name: 'Novo funil',
    description: 'Canvas limpo para estruturar uma nova jornada.',
    type: 'Produto',
    status: 'Draft',
    objective: 'Organizar o fluxo principal do funil.',
    tags: ['novo'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [traffic, landing, checkout],
    edges: [makeEdge(traffic.id, landing.id, 'Flow'), makeEdge(landing.id, checkout.id, 'Flow')],
    totals: { visits: 0, leads: 0, sales: 0, conversion: 0, revenue: 0 },
  }
}

export const seededFunnels = (): FunnelRecord[] => [
  instantiateTemplate(funnelTemplates[0], { name: 'Funnel base', status: 'Draft' }),
  instantiateTemplate(funnelTemplates[1], { name: 'Webinar base', status: 'Draft' }),
]
