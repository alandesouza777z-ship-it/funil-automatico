import { useState } from 'react'
import type { FunnelNode, FunnelRecord } from '../../types/funnel'

interface InspectorPanelProps {
  funnel: FunnelRecord
  selectedNode: FunnelNode | undefined
  onUpdateMeta: (patch: Partial<Pick<FunnelRecord, 'name' | 'description' | 'objective'>>) => void
  onUpdateNode: (patch: Partial<FunnelNode['data']>) => void
  onDeleteNode: (nodeId: string) => void
}

const TRACKING_SERVER = 'http://localhost:3333'

export function InspectorPanel({ funnel, selectedNode, onUpdateMeta, onUpdateNode, onDeleteNode }: InspectorPanelProps) {
  const [copied, setCopied] = useState(false)

  const trackingScript = selectedNode
    ? `<script src="${TRACKING_SERVER}/api/tracker.js?funnelId=${funnel.id}&nodeId=${selectedNode.id}"></script>`
    : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isQuiz = selectedNode?.data.nodeKind === 'quiz'
  const quizOptions: string[] = (selectedNode?.data as Record<string, unknown>).quizOptions as string[] ?? ['Opção A', 'Opção B', 'Opção C']

  const handleQuizOptionChange = (index: number, value: string) => {
    const updated = [...quizOptions]
    updated[index] = value
    onUpdateNode({ quizOptions: updated } as Partial<FunnelNode['data']>)
  }

  const handleAddQuizOption = () => {
    onUpdateNode({ quizOptions: [...quizOptions, `Opção ${String.fromCharCode(65 + quizOptions.length)}`] } as Partial<FunnelNode['data']>)
  }

  const handleRemoveQuizOption = (index: number) => {
    if (quizOptions.length <= 2) return
    onUpdateNode({ quizOptions: quizOptions.filter((_, i) => i !== index) } as Partial<FunnelNode['data']>)
  }

  return (
    <div className="inspector">
      <div className="inspector__section">
        <h4 className="inspector__section-title">✦ Funil</h4>

        <label className="inspector__field">
          <span>Nome</span>
          <input value={funnel.name} onChange={(e) => onUpdateMeta({ name: e.target.value })} />
        </label>

        <label className="inspector__field">
          <span>Descrição</span>
          <textarea value={funnel.description} onChange={(e) => onUpdateMeta({ description: e.target.value })} rows={2} />
        </label>

        <label className="inspector__field">
          <span>Objetivo</span>
          <textarea value={funnel.objective} onChange={(e) => onUpdateMeta({ objective: e.target.value })} rows={2} />
        </label>
      </div>

      {selectedNode ? (
        <div className="inspector__section">
          <h4 className="inspector__section-title">
            Etapa: {selectedNode.data.title}
          </h4>

          <label className="inspector__field">
            <span>Título</span>
            <input value={selectedNode.data.title} onChange={(e) => onUpdateNode({ title: e.target.value })} />
          </label>

          <label className="inspector__field">
            <span>Subtítulo</span>
            <textarea value={selectedNode.data.subtitle} onChange={(e) => onUpdateNode({ subtitle: e.target.value })} rows={2} />
          </label>

          <label className="inspector__field">
            <span>CTA</span>
            <input value={selectedNode.data.cta} onChange={(e) => onUpdateNode({ cta: e.target.value })} />
          </label>

          <label className="inspector__field">
            <span>Oferta</span>
            <input value={selectedNode.data.offerType} onChange={(e) => onUpdateNode({ offerType: e.target.value })} />
          </label>

          <label className="inspector__field">
            <span>URL da Página (para tracking)</span>
            <input
              value={selectedNode.data.trackingUrl ?? ''}
              onChange={(e) => onUpdateNode({ trackingUrl: e.target.value })}
              placeholder="https://seusite.com/pagina"
            />
          </label>

          <label className="inspector__field">
            <span>Notas</span>
            <textarea value={selectedNode.data.notes} onChange={(e) => onUpdateNode({ notes: e.target.value })} rows={3} />
          </label>

          {/* Quiz Options — Cakto style */}
          {isQuiz && (
            <div className="inspector__quiz">
              <h4 className="inspector__section-title">❓ Opções do Quiz</h4>
              <p className="inspector__quiz-hint">
                Configure as opções que o lead vai ver. Estilo Cakto — cada opção leva a um caminho diferente.
              </p>
              <div className="inspector__quiz-count">
                <span className="inspector__quiz-count-label">Total de opções:</span>
                <span className="inspector__quiz-count-value">{quizOptions.length}</span>
              </div>
              <div className="inspector__quiz-options">
                {quizOptions.map((opt, i) => (
                  <div key={i} className="inspector__quiz-option">
                    <span className="inspector__quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                    <input
                      value={opt}
                      onChange={(e) => handleQuizOptionChange(i, e.target.value)}
                      placeholder={`Opção ${String.fromCharCode(65 + i)}`}
                    />
                    {quizOptions.length > 2 && (
                      <button
                        type="button"
                        className="inspector__quiz-option-remove"
                        onClick={() => handleRemoveQuizOption(i)}
                        title="Remover opção"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn--sm btn--gold" onClick={handleAddQuizOption}>
                + Adicionar Opção
              </button>
            </div>
          )}

          {/* Delete Node */}
          <button
            type="button"
            className="btn btn--danger btn--full"
            onClick={() => onDeleteNode(selectedNode.id)}
          >
            🗑 Remover esta etapa
          </button>

          {/* Tracking Script */}
          <div className="inspector__tracking">
            <h4 className="inspector__section-title">📡 Script de Tracking</h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Cole este script no HTML da página para rastrear visitas e saídas em tempo real.
            </p>
            <div className="inspector__script-box">
              <code>{trackingScript}</code>
            </div>
            <button
              type="button"
              className={`btn btn--sm inspector__copy-btn ${copied ? 'btn--gold' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copiado!' : '📋 Copiar Script'}
            </button>
          </div>

          {/* Metrics */}
          <div className="inspector__metrics">
            <div className="inspector__metric">
              <span>Visits</span>
              <strong>{selectedNode.data.metrics.visits.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="inspector__metric">
              <span>Exits</span>
              <strong>{(selectedNode.data.metrics.exits ?? 0).toLocaleString('pt-BR')}</strong>
            </div>
            <div className="inspector__metric">
              <span>Clicks</span>
              <strong>{selectedNode.data.metrics.clicks.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="inspector__metric">
              <span>Conv.</span>
              <strong>{selectedNode.data.metrics.conversion}%</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="inspector__empty">
          <span className="inspector__empty-icon">✦</span>
          <p>Selecione um bloco no canvas para editar seus detalhes e obter o script de tracking.</p>
        </div>
      )}
    </div>
  )
}
