import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const REFRESH_INTERVAL_MS = 15_000

const formatStability = (value) =>
  Number.isFinite(value) ? `${value.toFixed(1)}%` : '--'

function OperationsMetricsPanel({ refreshIntervalMs = REFRESH_INTERVAL_MS }) {
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadMetrics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/operations/metrics`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Operations metrics request failed.')
        }

        setMetrics(await response.json())
        setError(null)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError('Operations metrics are temporarily unavailable.')
        }
      }
    }

    void loadMetrics()
    const refreshId = window.setInterval(loadMetrics, refreshIntervalMs)

    return () => {
      controller.abort()
      window.clearInterval(refreshId)
    }
  }, [refreshIntervalMs])

  const cards = [
    {
      label: 'Active patients',
      value: metrics?.activePatientCount ?? '--',
      detail: 'Patients with an admitted status',
    },
    {
      label: 'Alerts in the last hour',
      value: metrics?.rollingHourAlertTriggers ?? '--',
      detail: 'Threshold breaches across the system',
    },
    {
      label: 'Response stability',
      value: formatStability(metrics?.datasetResponseStability),
      detail: 'Non-alert vital records in the last hour',
    },
  ]

  return (
    <>
      <div className="clinical-analyst-terminal__section-heading">
        <div>
          <p className="clinical-analyst-terminal__section-label">Snapshot</p>
          <h2 id="operations-metrics-title">Operations metrics</h2>
        </div>
        <p>Updates every 15 seconds.</p>
      </div>

      <p className="clinical-analyst-terminal__metrics-status" role="status">
        {error ?? (metrics ? 'Operations metrics are current.' : 'Loading operations metrics...')}
      </p>

      <div className="clinical-analyst-terminal__metrics-grid">
        {cards.map((card) => (
          <article className="clinical-analyst-terminal__metric-card" key={card.label}>
            <h3>{card.label}</h3>
            <p className="clinical-analyst-terminal__metric-value">{card.value}</p>
            <p>{card.detail}</p>
          </article>
        ))}
      </div>
    </>
  )
}

OperationsMetricsPanel.propTypes = {
  refreshIntervalMs: PropTypes.number,
}

export default OperationsMetricsPanel
