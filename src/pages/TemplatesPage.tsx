import { motion } from 'framer-motion'
import { funnelTemplates } from '../data/templates'

interface TemplatesPageProps {
  onUseTemplate: (templateId: string) => void
}

export function TemplatesPage({ onUseTemplate }: TemplatesPageProps) {
  return (
    <div className="templates-page">
      <section className="page-hero">
        <h2>Templates</h2>
        <p>Comece por uma estrutura pronta e adapte o fluxo ao seu processo.</p>
      </section>

      <div className="templates-grid">
        {funnelTemplates.map((tpl, i) => (
          <motion.article
            key={tpl.id}
            className="tpl-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
          >
            <div className="tpl-card__header">
              <span className="tag">{tpl.category}</span>
              <span className="tpl-card__tags">{tpl.tags.join(' · ')}</span>
            </div>
            <h3>{tpl.name}</h3>
            <p>{tpl.description}</p>
            <div className="tpl-card__stats">
              <div><span>Nodes</span><strong>{tpl.seedNodes.length}</strong></div>
              <div><span>Links</span><strong>{tpl.seedEdges.length}</strong></div>
            </div>
            <button type="button" className="btn btn--primary btn--full" onClick={() => onUseTemplate(tpl.id)}>
              Usar Template
            </button>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
