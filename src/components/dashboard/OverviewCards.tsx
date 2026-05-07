import { motion } from 'framer-motion'
import type { FunnelRecord } from '../../types/funnel'

interface OverviewCardsProps {
  funnels: FunnelRecord[]
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const cardConfig = [
  { key: 'visits', label: 'Visitas', icon: '👁', color: '#6366f1' },
  { key: 'leads', label: 'Leads', icon: '🎯', color: '#3b82f6' },
  { key: 'conversion', label: 'Conversão', icon: '📈', color: '#10b981' },
  { key: 'revenue', label: 'Receita', icon: '💰', color: '#f59e0b' },
] as const

export function OverviewCards({ funnels }: OverviewCardsProps) {
  const totals = funnels.reduce(
    (acc, f) => {
      acc.visits += f.totals.visits
      acc.leads += f.totals.leads
      acc.sales += f.totals.sales
      acc.revenue += f.totals.revenue
      return acc
    },
    { visits: 0, leads: 0, sales: 0, revenue: 0 },
  )

  const avgConversion = funnels.length
    ? (funnels.reduce((s, f) => s + f.totals.conversion, 0) / funnels.length).toFixed(1)
    : '0.0'

  const values: Record<string, string> = {
    visits: totals.visits.toLocaleString('pt-BR'),
    leads: totals.leads.toLocaleString('pt-BR'),
    conversion: `${avgConversion}%`,
    revenue: currency.format(totals.revenue),
  }

  return (
    <div className="overview-grid">
      {cardConfig.map((card, i) => (
        <motion.article
          key={card.key}
          className="overview-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.04 }}
          style={{ '--card-accent': card.color } as React.CSSProperties}
        >
          <div className="overview-card__icon">{card.icon}</div>
          <div className="overview-card__data">
            <span className="overview-card__label">{card.label}</span>
            <strong className="overview-card__value">{values[card.key]}</strong>
          </div>
        </motion.article>
      ))}
    </div>
  )
}
