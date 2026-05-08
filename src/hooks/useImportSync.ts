import { useEffect, useRef } from 'react'
import type { FunnelRecord, NodeKind } from '../types/funnel'

interface OfferPayload {
  sourceId?: string
  name: string
  niche?: string
  micropersona?: string
  mechanism?: string
  promise?: string
  offerType?: string
  entryPrice?: number
  sourcePlatform?: string
  sourceUrl?: string
  landingPageUrl?: string
  creativeUrl?: string
  funnelType?: string
  tags?: string[]
  notes?: string
  score?: number
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

function buildFunnelFromOffer(offer: OfferPayload): FunnelRecord {
  const funnelId = uid()
  const now = new Date().toISOString()
  const ft = (offer.funnelType || '').toLowerCase()

  // Build node specs
  interface NodeSpec {
    kind: NodeKind
    title: string
    subtitle: string
    x: number
    y: number
    trackingUrl?: string
  }

  const specs: NodeSpec[] = []
  let x = 40
  const y = 140
  const gap = 300

  // Traffic
  specs.push({ kind: 'traffic', title: 'Traffic', subtitle: offer.sourcePlatform || 'Tráfego pago', x, y })
  x += gap

  // Landing
  if (offer.landingPageUrl) {
    specs.push({ kind: 'landing', title: 'Landing Page', subtitle: offer.name, x, y, trackingUrl: offer.landingPageUrl })
    x += gap
  }

  // VSL / Quiz / Webinar
  if (ft.includes('vsl')) {
    specs.push({ kind: 'vsl', title: 'VSL', subtitle: `Vídeo — ${offer.promise || offer.mechanism || ''}`.slice(0, 80), x, y })
    x += gap
  } else if (ft.includes('quiz')) {
    specs.push({ kind: 'quiz', title: 'Quiz', subtitle: `Segmentação — ${offer.micropersona || offer.mechanism || ''}`.slice(0, 80), x, y })
    x += gap
  } else if (ft.includes('webinar')) {
    specs.push({ kind: 'webinar', title: 'Webinar', subtitle: `Aula + Pitch — ${offer.promise || ''}`.slice(0, 80), x, y })
    x += gap
  }

  // Checkout
  specs.push({
    kind: 'checkout',
    title: 'Checkout',
    subtitle: offer.entryPrice ? `R$ ${offer.entryPrice}` : 'Página de pagamento',
    x, y,
    trackingUrl: offer.sourceUrl || '',
  })
  x += gap

  // Upsell
  if (ft.includes('upsell')) {
    specs.push({ kind: 'upsell', title: 'Upsell', subtitle: 'Oferta complementar', x, y: y - 100 })
  }

  // Thank You
  specs.push({ kind: 'thankyou', title: 'Thank You', subtitle: 'Confirmação e próximo passo', x, y: ft.includes('upsell') ? y + 100 : y })

  // Build nodes
  const nodes = specs.map((spec, i) => ({
    id: `node-${funnelId}-${i}`,
    type: 'funnelNode' as const,
    position: { x: spec.x, y: spec.y },
    data: {
      nodeKind: spec.kind,
      title: spec.title,
      subtitle: spec.subtitle || '',
      awarenessLevel: 'Produto',
      offerType: offer.offerType || 'Core',
      cta: 'Ação',
      notes: offer.notes || '',
      objective: offer.promise || '',
      accent: '#2563eb',
      trackingUrl: spec.trackingUrl || '',
      metrics: { visits: 0, clicks: 0, optIns: 0, sales: 0, conversion: 0, exits: 0 },
    },
  }))

  // Build edges
  const edges = []
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `edge-${funnelId}-${i}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      label: 'Flow',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#475569', strokeWidth: 2 },
    })
  }

  return {
    id: funnelId,
    name: offer.name,
    description: `Funil importado do Offer Radar. Nicho: ${offer.niche || '—'}. Mecanismo: ${offer.mechanism || '—'}. Score: ${offer.score || 0}.`,
    type: 'Produto',
    status: 'Draft',
    objective: offer.promise || offer.mechanism || 'Funil importado',
    tags: [...(offer.tags || []), 'importado', offer.niche || ''].filter(Boolean),
    createdAt: now,
    updatedAt: now,
    nodes,
    edges,
    totals: { visits: 0, leads: 0, sales: 0, conversion: 0, revenue: 0 },
  }
}

/**
 * Reads offer data from URL hash (#import=base64data)
 * and auto-creates a funnel when the app is opened from the Offer Radar.
 */
export function useImportSync(
  existingFunnelIds: string[],
  onImportFunnel: (funnel: FunnelRecord) => void,
) {
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return

    const hash = window.location.hash
    if (!hash.startsWith('#import=')) return

    try {
      const encoded = hash.slice('#import='.length)
      const json = decodeURIComponent(escape(atob(encoded)))
      const offer: OfferPayload = JSON.parse(json)

      if (!offer.name) return

      processedRef.current = true

      // Build and import the funnel
      const funnel = buildFunnelFromOffer(offer)
      onImportFunnel(funnel)

      // Clean the URL hash so it doesn't re-import on refresh
      window.history.replaceState(null, '', window.location.pathname)

      console.log(`📦 Imported offer "${offer.name}" → Funnel "${funnel.id}" (${funnel.nodes.length} nodes)`)
    } catch (err) {
      console.error('Failed to import offer from URL:', err)
    }
  }, [existingFunnelIds, onImportFunnel])
}
