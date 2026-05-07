import { useEffect, useRef, useCallback } from 'react'
import type { FunnelRecord } from '../types/funnel'

const TRACKING_SERVER = 'http://localhost:3333'
const POLL_INTERVAL = 5_000 // 5 seconds

/**
 * Polls the tracking server for imported funnels from fb-ads-manager
 * and adds them to the Funnelby store.
 */
export function useImportSync(
  existingFunnelIds: string[],
  onImportFunnel: (funnel: FunnelRecord) => void,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const processedRef = useRef<Set<string>>(new Set(existingFunnelIds))

  // Keep processed IDs up to date
  useEffect(() => {
    for (const id of existingFunnelIds) {
      processedRef.current.add(id)
    }
  }, [existingFunnelIds])

  const fetchAndSync = useCallback(async () => {
    try {
      const res = await fetch(`${TRACKING_SERVER}/api/imported-funnels`)
      if (!res.ok) return

      const funnels: FunnelRecord[] = await res.json()

      for (const funnel of funnels) {
        if (!processedRef.current.has(funnel.id)) {
          processedRef.current.add(funnel.id)
          onImportFunnel(funnel)

          // Mark as consumed on server
          fetch(`${TRACKING_SERVER}/api/imported-funnels/${funnel.id}`, {
            method: 'DELETE',
          }).catch(() => {})
        }
      }
    } catch {
      // Server might be offline
    }
  }, [onImportFunnel])

  useEffect(() => {
    fetchAndSync()
    intervalRef.current = setInterval(fetchAndSync, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchAndSync])
}
