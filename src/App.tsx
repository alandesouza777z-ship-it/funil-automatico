import { useEffect, useMemo, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppShell } from './components/layout/AppShell'
import { BuilderPage } from './pages/BuilderPage'
import { DashboardPage } from './pages/DashboardPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { LoginPage } from './pages/LoginPage'
import { useFunnelStore } from './store/funnelStore'
import { stageLibrary } from './data/templates'
import { clearSessionEmail, getSessionEmail, saveSessionEmail } from './utils/storage'
import type { AppView, EntryTransition, NodeKind } from './types/funnel'
import { useTrackingSync } from './hooks/useTrackingSync'
import { useImportSync } from './hooks/useImportSync'
import './styles/tokens.css'
import './styles/app.css'

function App() {
  const {
    view,
    funnels,
    selectedFunnelId,
    selectedNodeId,
    search,
    setView,
    setSearch,
    selectFunnel,
    createBlankFunnel,
    createFromTemplate,
    duplicateFunnel,
    archiveFunnel,
    deleteFunnel,
    updateFunnelMeta,
    addNode,
    deleteNode,
    updateSelectedNode,
    setSelectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodeMetrics,
    importFunnel,
  } = useFunnelStore()

  const [sessionEmail, setSessionEmail] = useState('')
  const [entryTransition, setEntryTransition] = useState<EntryTransition>('none')

  useEffect(() => {
    setSessionEmail(getSessionEmail() ?? '')
  }, [])

  const filteredFunnels = funnels.filter((funnel) => {
    const haystack = [funnel.name, funnel.type, funnel.description, ...funnel.tags].join(' ').toLowerCase()
    return haystack.includes(search.toLowerCase())
  })

  const currentFunnel = funnels.find((funnel) => funnel.id === selectedFunnelId) ?? filteredFunnels[0]
  const selectedNode = currentFunnel?.nodes.find((node) => node.id === selectedNodeId)

  // Tracking sync
  const nodeIds = useMemo(() => currentFunnel?.nodes.map((n) => n.id) ?? [], [currentFunnel?.nodes])
  const stableUpdateNodeMetrics = useCallback(
    (nodeId: string, metrics: Parameters<typeof updateNodeMetrics>[1]) => updateNodeMetrics(nodeId, metrics),
    [updateNodeMetrics],
  )
  useTrackingSync(currentFunnel?.id, nodeIds, stableUpdateNodeMetrics)

  // Import sync from fb-ads-manager
  const funnelIds = useMemo(() => funnels.map((f) => f.id), [funnels])
  const stableImportFunnel = useCallback(
    (funnel: Parameters<typeof importFunnel>[0]) => importFunnel(funnel),
    [importFunnel],
  )
  useImportSync(funnelIds, stableImportFunnel)

  const handleOpenFunnel = (funnelId: string) => {
    setEntryTransition('none')
    selectFunnel(funnelId, 'builder')
  }

  const handleAddNode = (kind: NodeKind) => {
    const item = stageLibrary.find((entry) => entry.kind === kind)
    const currentCount = currentFunnel?.nodes.length ?? 0

    addNode({
      kind,
      position: {
        x: 40 + currentCount * 145,
        y: 88 + (currentCount % 3) * 82,
      },
      title: item?.label,
      subtitle: item?.description,
      objective: item?.objective,
      awarenessLevel: item?.awarenessLevel,
    })
  }

  const renderView = (activeView: AppView) => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardPage
            funnels={filteredFunnels}
            search={search}
            onSearch={setSearch}
            onOpenFunnel={handleOpenFunnel}
            onDuplicate={duplicateFunnel}
            onArchive={archiveFunnel}
            onDelete={deleteFunnel}
            onCreateTemplate={createFromTemplate}
          />
        )
      case 'builder':
        return (
          <BuilderPage
            funnel={currentFunnel}
            selectedNode={selectedNode}
            onAddNode={handleAddNode}
            onDeleteNode={deleteNode}
            onSelectNode={setSelectedNodeId}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onUpdateMeta={(patch) => currentFunnel && updateFunnelMeta(currentFunnel.id, patch)}
            onUpdateNode={updateSelectedNode}
          />
        )
      case 'templates':
        return <TemplatesPage onUseTemplate={createFromTemplate} />
      case 'analytics':
        return <AnalyticsPage funnel={currentFunnel} />
      default:
        return null
    }
  }

  const handleCreateFunnel = () => {
    setEntryTransition('new-funnel')
    createBlankFunnel()
    setSearch('')
    setView('builder')
  }

  const handleLogin = (email: string) => {
    saveSessionEmail(email)
    setSessionEmail(email)
  }

  const handleLogout = () => {
    clearSessionEmail()
    setSessionEmail('')
  }

  if (!sessionEmail) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <AppShell
      activeView={view}
      sessionEmail={sessionEmail}
      onChangeView={setView}
      onCreateFunnel={handleCreateFunnel}
      onLogout={handleLogout}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${view}-${entryTransition}-${currentFunnel?.id ?? 'none'}`}
          initial={entryTransition === 'new-funnel' ? { opacity: 0, x: 36 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={entryTransition === 'new-funnel' ? { opacity: 0, x: -24 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onAnimationComplete={() => {
            if (entryTransition !== 'none') setEntryTransition('none')
          }}
        >
          {renderView(view)}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}

export default App
