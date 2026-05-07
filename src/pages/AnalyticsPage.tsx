import { motion } from 'framer-motion'
import type { FunnelNode, FunnelRecord } from '../types/funnel'

interface AnalyticsPageProps {
  funnel: FunnelRecord | undefined
}

const stageHealth = (node: FunnelNode) => {
  if (node.data.metrics.conversion >= 10) return 'strong'
  if (node.data.metrics.conversion >= 5) return 'warning'
  return 'weak'
}

const healthLabels: Record<string, { label: string; color: string }> = {
  strong: { label: 'Forte', color: '#10b981' },
  warning: { label: 'Atenção', color: '#f59e0b' },
  weak: { label: 'Fraco', color: '#ef4444' },
}

export function AnalyticsPage({ funnel }: AnalyticsPageProps) {
  if (!funnel) {
    return (
      <div className="builder-empty">
        <div className="builder-empty__content">
          <div className="builder-empty__icon">📈</div>
          <strong>Nenhum funil selecionado</strong>
          <p>Abra um canvas para ver os dados por etapa.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <section className="page-hero">
        <h2>{funnel.name}</h2>
        <p>Leitura por etapa — alimente com sua própria operação.</p>
      </section>

      <div className="analytics-summary">
        {[
          { label: 'Visitas', value: funnel.totals.visits.toLocaleString('pt-BR'), icon: '👁' },
          { label: 'Leads', value: funnel.totals.leads.toLocaleString('pt-BR'), icon: '🎯' },
          { label: 'Sales', value: funnel.totals.sales.toLocaleString('pt-BR'), icon: '💰' },
          { label: 'Receita', value: `R$ ${funnel.totals.revenue.toLocaleString('pt-BR')}`, icon: '📊' },
        ].map((item, i) => (
          <motion.article
            key={item.label}
            className="overview-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: i * 0.03 }}
          >
            <div className="overview-card__icon">{item.icon}</div>
            <div className="overview-card__data">
              <span className="overview-card__label">{item.label}</span>
              <strong className="overview-card__value">{item.value}</strong>
            </div>
          </motion.article>
        ))}
      </div>

      <section className="card">
        <div className="card__header">
          <h3>Etapas do Funil</h3>
        </div>

        <div className="stages-list">
          {funnel.nodes.map((node, i) => {
            const health = stageHealth(node)
            const { label, color } = healthLabels[health]
            return (
              <motion.article
                key={node.id}
                className="stage-row"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, delay: i * 0.03 }}
              >
                <div className="stage-row__info">
                  <strong>{node.data.title}</strong>
                  <p>{node.data.subtitle}</p>
                </div>
                <span className="badge" style={{ background: `${color}20`, color, borderColor: `${color}40` }}>
                  {label}
                </span>
                <div className="stage-row__metrics">
                  <div><span>Visits</span><strong>{node.data.metrics.visits.toLocaleString('pt-BR')}</strong></div>
                  <div><span>Clicks</span><strong>{node.data.metrics.clicks.toLocaleString('pt-BR')}</strong></div>
                  <div><span>Opt-ins</span><strong>{node.data.metrics.optIns.toLocaleString('pt-BR')}</strong></div>
                  <div><span>Conv.</span><strong>{node.data.metrics.conversion}%</strong></div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
