import { useEffect, useMemo, useState } from 'react'
import useBodyComposition from '../hooks/useBodyComposition'
import BodyCompositionResults from '../components/BodyCompositionResults'
import './BodyCompositionDashboard.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom range' },
]

function getLocalDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
function getPresetRange(timeRange) {
  const start = new Date()
  if (timeRange === '7d') start.setDate(start.getDate() - 7)
  else if (timeRange === '30d') start.setDate(start.getDate() - 30)
  else if (timeRange === '1y') start.setFullYear(start.getFullYear() - 1)
  const pad = (n) => String(n).padStart(2, '0')
  return {
    from: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    to: getLocalDateString(),
  }
}

function BodyCompositionDashboard() {
  const [patients, setPatients] = useState([])
  const [isPatientsLoading, setIsPatientsLoading] = useState(true)
  const [patientLoadError, setPatientLoadError] = useState(null)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [timeRange, setTimeRange] = useState('30d')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadPatients = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/patient?limit=100`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Patient list request failed.')
        }

        const payload = await response.json()
        setPatients(Array.isArray(payload) ? payload : payload?.patients ?? [])
        setPatientLoadError(null)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setPatients([])
          setPatientLoadError('Patient options are temporarily unavailable.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsPatientsLoading(false)
        }
      }
    }

    void loadPatients()

    return () => controller.abort()
  }, [])

  const requestParameters = useMemo(
    () => ({
      patientId: selectedPatientId,
      timeRange,
      ...(timeRange === 'custom' && {
        startDate: customStartDate,
        endDate: customEndDate,
      }),
    }),
    [customEndDate, customStartDate, selectedPatientId, timeRange],
  )
  const selectedPatient = patients.find(
    (patient) => (patient.patientId ?? patient.id) === selectedPatientId,
  )
  const selectedTimeRange = TIME_RANGES.find(
    (range) => range.value === timeRange,
  )
  const today = getLocalDateString()
  const customRangeError = useMemo(() => {
    if (timeRange !== 'custom') {
      return null
    }

    if (!customStartDate || !customEndDate) {
      return 'Choose both a start date and an end date.'
    }

    if (customStartDate > today || customEndDate > today) {
      return 'Custom range dates cannot be in the future.'
    }

    if (customStartDate > customEndDate) {
      return 'Start date must be on or before the end date.'
    }

    return null
  }, [customEndDate, customStartDate, timeRange, today])

  const handlePatientChange = (event) => {
    setSelectedPatientId(event.target.value)
  }

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value)
  }

  const handleCustomStartDateChange = (event) => {
    setCustomStartDate(event.target.value)
  }

  const handleCustomEndDateChange = (event) => {
    setCustomEndDate(event.target.value)
  }

  const patientControlDisabled = isPatientsLoading || Boolean(patientLoadError) || patients.length === 0
  const isRequestReady = Boolean(selectedPatient) && !customRangeError
  const { from, to } = useMemo(
    () =>
      timeRange === 'custom'
        ? { from: customStartDate, to: customEndDate }
        : getPresetRange(timeRange),
    [timeRange, customStartDate, customEndDate],
  )

  const { data, loading, error, retry } = useBodyComposition(
    isRequestReady ? selectedPatientId : null,
    from,
    to,
  )
  return (
    <main
      className="body-composition-dashboard"
      aria-labelledby="body-composition-dashboard-title"
    >
      <header className="body-composition-dashboard__header">
        <p className="body-composition-dashboard__eyebrow">Clinical analysis</p>
        <h1 id="body-composition-dashboard-title">Body Composition Dashboard</h1>
        <p className="body-composition-dashboard__description">
          Review body composition trends and summary metrics for a selected patient.
        </p>
      </header>

      <section
        className="body-composition-dashboard__filters"
        aria-labelledby="body-composition-filters-title"
      >
        <h2 id="body-composition-filters-title">Analysis filters</h2>
        <div className="body-composition-dashboard__filter-grid">
          <label className="body-composition-dashboard__field" htmlFor="body-composition-patient">
            <span>Patient</span>
            <select
              id="body-composition-patient"
              value={selectedPatientId}
              onChange={handlePatientChange}
              disabled={patientControlDisabled}
            >
              <option value="">
                {isPatientsLoading ? 'Loading patients...' : 'Select a patient'}
              </option>
              {patients.map((patient) => {
                const patientId = patient.patientId ?? patient.id

                return (
                  <option key={patientId} value={patientId}>
                    {patient.name}
                  </option>
                )
              })}
            </select>
          </label>

          <label className="body-composition-dashboard__field" htmlFor="body-composition-time-range">
            <span>Time range</span>
            <select
              id="body-composition-time-range"
              value={timeRange}
              onChange={handleTimeRangeChange}
            >
              {TIME_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {timeRange === 'custom' && (
          <div
            className="body-composition-dashboard__custom-range"
            aria-label="Custom date range"
          >
            <label
              className="body-composition-dashboard__field"
              htmlFor="body-composition-start-date"
            >
              <span>Start date</span>
              <input
                id="body-composition-start-date"
                type="date"
                value={customStartDate}
                onChange={handleCustomStartDateChange}
                max={today}
                required
                aria-invalid={Boolean(customRangeError)}
                aria-describedby={customRangeError ? 'body-composition-date-error' : undefined}
              />
            </label>

            <label
              className="body-composition-dashboard__field"
              htmlFor="body-composition-end-date"
            >
              <span>End date</span>
              <input
                id="body-composition-end-date"
                type="date"
                value={customEndDate}
                onChange={handleCustomEndDateChange}
                min={customStartDate || undefined}
                max={today}
                required
                aria-invalid={Boolean(customRangeError)}
                aria-describedby={customRangeError ? 'body-composition-date-error' : undefined}
              />
            </label>
          </div>
        )}
        {customRangeError && (
          <p
            id="body-composition-date-error"
            className="body-composition-dashboard__date-error"
            role="alert"
          >
            {customRangeError}
          </p>
        )}
        <p className="body-composition-dashboard__filter-hint">
          {patientLoadError ??
            (selectedPatient
              ? customRangeError ?? `Ready to request body composition for ${selectedPatient.name} over ${selectedTimeRange.label}.`
              : 'Select a patient to prepare a body composition request.')}
        </p>
      </section>

            <section
        className="body-composition-dashboard__content"
        aria-label="Body composition analysis results"
        data-patient-id={requestParameters.patientId}
        data-time-range={requestParameters.timeRange}
        data-start-date={requestParameters.startDate ?? ''}
        data-end-date={requestParameters.endDate ?? ''}
        data-request-ready={isRequestReady}
      >
        {isRequestReady ? (
          <BodyCompositionResults
            data={data}
            loading={loading}
            error={error}
            onRetry={retry}
          />
        ) : (
          <p className="body-composition-dashboard__filter-hint">
            Select a patient{timeRange === 'custom' ? ' and a valid date range' : ''} to view results.
          </p>
        )}
      </section>
    </main>
  )
}

export default BodyCompositionDashboard
