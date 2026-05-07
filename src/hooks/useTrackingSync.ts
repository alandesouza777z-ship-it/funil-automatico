import { useEffect, useRef, useCallback } from 'react'
import type { StageMetrics } from '../types/funnel'

const TRACKING_SERVER = 'http://localhost:3333'
const POLL_INTERVAL = 10_000 // 10 seconds

interface NodeStats {
  visits: number
  exits: number
  clicks: number
  uniqueVisitors: number
}

/**
 * Polls the tracking server and syncs live stats into funnel node metrics.
 */
export function useTrackingSync(
  funnelId: string | undefined,
  nodeIds: string[],
  onUpdateNodeMetrics: (nodeId: string, metrics: Partial<StageMetrics>) => void,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchAndSync = useCallback(async () => {
    if (!funnelId) return

    try {
      const res = await fetch(`${TRACKING_SERVER}/api/stats/${funnelId}`)
      if (!res.ok) return

      const stats: Record<string, NodeStats> = await res.json()

      for (const nodeId of nodeIds) {
        const nodeStat = stats[nodeId]
        if (nodeStat) {
          const conversion = nodeStat.visits > 0
            ? Math.round(((nodeStat.visits - nodeStat.exits) / nodeStat.visits) * 100 * 10) / 10
            : 0

          onUpdateNodeMetrics(nodeId, {
            visits: nodeStat.visits,
            exits: nodeStat.exits,
            clicks: nodeStat.clicks,
            conversion,
          })
        }
      }
    } catch {
      // Tracking server might be offline — fail silently
    }
  }, [funnelId, nodeIds, onUpdateNodeMetrics])

  useEffect(() => {
    // Fetch immediately
    fetchAndSync()

    // Then poll
    intervalRef.current = setInterval(fetchAndSync, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchAndSync])
}
