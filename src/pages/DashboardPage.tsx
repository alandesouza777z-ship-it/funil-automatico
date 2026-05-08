import { motion } from 'framer-motion'
import { funnelTemplates } from '../data/templates'
import { OverviewCards } from '../components/dashboard/OverviewCards'
import type { FunnelRecord } from '../types/funnel'

interface DashboardPageProps {
  funnels: FunnelRecord[]
  search: string
  onSearch: (value: string) => void
  onOpenFunnel: (funnelId: string) => void
  onDuplicate: (funnelId: string) => void
  onArchive: (funnelId: string) => void
  onDelete: (funnelId: string) => void
  onCreateTemplate: (templateId: string) => void
}

export function DashboardPage({
  funnels,
  search,
  onSearch,
  onOpenFunnel,
  onDuplicate,
  onArchive,
  onDelete,
  onCreateTemplate,
}: DashboardPageProps) {
  const activeFunnels = funnels.filter((f) => f.status !== 'Archived').length

  return (
    <div className="dashboard">
      {/* Hero */}
      <section className="dashboard__hero">
        <div className="dashboard__hero-text">
          <h2>Mapeie seus funis</h2>
          <p>Estruture jornadas, ofertas e ramificações com clareza visual.</p>
        </div>
        <div className="dashboard__hero-stats">
          <div className="stat-card">
            <strong>{activeFunnels}</strong>
            <span>Funis ativos</span>
          </div>
          <div className="stat-card">
            <strong>{funnelTemplates.length}</strong>
            <span>Templates</span>
          </div>
        </div>
      </section>

      <OverviewCards funnels={funnels} />

      {/* Main grid */}
      <div className="dashboard__grid">
        {/* Funnel list */}
        <section className="card">
          <div className="card__header">
            <h3>Seus Funis</h3>
            <input
              className="search-box"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="🔍 Buscar funis..."
            />
          </div>

          <div className="funnel-list">
            {funnels.length === 0 && (
              <div className="empty-msg">Nenhum funil encontrado.</div>
            )}
            {funnels.map((funnel, i) => (
              <motion.article
                key={funnel.id}
                className="funnel-item"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: i * 0.03 }}
              >
                <div className="funnel-item__info">
                  <div className="funnel-item__title-row">
                    <strong>{funnel.name}</strong>
                    <span className={`badge badge--${funnel.status.toLowerCase()}`}>{funnel.status}</span>
                  </div>
                  <p>{funnel.description}</p>
                  <div className="funnel-item__tags">
                    <span className="tag">{funnel.type}</span>
                    {funnel.tags.map((t) => (
                      <span className="tag" key={t}>{t}</span>
                    ))}
                  </div>
                </div>

                <div className="funnel-item__metrics">
                  <div><span>Conv.</span><strong>{funnel.totals.conversion}%</strong></div>
                  <div><span>Leads</span><strong>{funnel.totals.leads}</strong></div>
                  <div><span>Receita</span><strong>R$ {funnel.totals.revenue.toLocaleString('pt-BR')}</strong></div>
                </div>

                <div className="funnel-item__actions">
                  <button type="button" className="btn btn--sm btn--primary" onClick={() => onOpenFunnel(funnel.id)}>Abrir</button>
                  <button type="button" className="btn btn--sm btn--ghost" onClick={() => onDuplicate(funnel.id)}>Duplicar</button>
                  <button type="button" className="btn btn--sm btn--ghost" onClick={() => onArchive(funnel.id)}>Arquivar</button>
                  <button type="button" className="btn btn--sm btn--danger" onClick={() => onDelete(funnel.id)}>Excluir</button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="dashboard__sidebar">
          <section className="card">
            <div className="card__header">
              <h3>Quick Start</h3>
            </div>
            <div className="template-list">
              {funnelTemplates.slice(0, 3).map((tpl) => (
                <button key={tpl.id} type="button" className="template-item" onClick={() => onCreateTemplate(tpl.id)}>
                  <strong>{tpl.name}</strong>
                  <p>{tpl.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card__header">
              <h3>Dicas</h3>
            </div>
            <ul className="tips-list">
              <li>Todos os números começam zerados para você estruturar do seu jeito.</li>
              <li>O foco agora é clareza de mapa, fluxo e edição do canvas.</li>
              <li>Templates servem como ponto de partida rápido.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
