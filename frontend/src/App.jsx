import { useCallback, useState } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import CriticalAlarmBanner from './components/CriticalAlarmBanner'
import HamburgerMenu from './components/HambugerMenu.jsx'
import LiveTelemetryCard from './components/LiveTelemetryCard'
import PatientDemographicsCard from './components/PatientDemographicsCard'
import Registration from './components/Registration'
import PatientList from './components/PatientList'
import { supabase } from './supabaseClient'
import './App.css'

const demoVitals = [
  { heartRate: 72, spO2: 98 },
  { heartRate: 72, spO2: 89 },
  { heartRate: 121, spO2: 97 },
  { heartRate: 75, oxygenSaturation: 97 },
  { heartRate: 75, spO2: 97 },
  { heartRate: 71, spO2: 99 },
]

const subscribeToDemoVitals = (onUpdate) => {
  let readingIndex = 0

  const intervalId = window.setInterval(() => {
    onUpdate(demoVitals[readingIndex])
    readingIndex = (readingIndex + 1) % demoVitals.length
  }, 2500)

  return () => window.clearInterval(intervalId)
}

function BedsideChart({ defaultPatientId, demoTelemetry = false }) {
  const [alarmState, setAlarmState] = useState({
    isAlarmActive: false,
    violations: [],
  })
  const [isPatientConnected, setIsPatientConnected] = useState(false)

  // Read the patient ID from the URL
  const { id } = useParams()

  // Use the URL ID, or fall back to the default patient ID
  const patientId = id ?? defaultPatientId
  const subscribeToPatientVitals = useCallback((onUpdate) => {
    if (!patientId) {
      return undefined
    }

    const channel = supabase
      .channel(`vitals-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vitals',
          filter: `patient_id=eq.${patientId}`,
        },
        onUpdate
      )
      .subscribe((status, error) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Supabase vitals subscription failed:', error ?? status)
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [patientId])

  return (
    <main className="bedside-chart">
      <CriticalAlarmBanner
        active={alarmState.isAlarmActive}
        violations={alarmState.violations}
      />
      <header className="bedside-chart__header">
        <div>
          <p className="bedside-chart__eyebrow">Clinical monitoring</p>
          <h1>Bedside Chart</h1>
        </div>

        <span className="bedside-chart__status">
          {demoTelemetry
            ? 'Demo telemetry active'
            : isPatientConnected
              ? 'Live telemetry connected'
              : 'No telemetry connected'}
        </span>
      </header>

      <section
        className="bedside-chart__patient"
        aria-label="Patient demographics"
      >
        <PatientDemographicsCard
          patientId={patientId}
          onConnectionChange={setIsPatientConnected}
        />
      </section>

      <section
        className="bedside-chart__telemetry"
        aria-label="Live bedside telemetry"
      >
        <LiveTelemetryCard
          key={demoTelemetry ? 'demo' : 'live'}
          subscribeToVitals={
            demoTelemetry ? subscribeToDemoVitals : subscribeToPatientVitals
          }
          onAlarmChange={setAlarmState}
        />
      </section>
    </main>
  )
}

function App() {
  // Default patient ID from query string or environment variable
  const [patientId] = useState(
    () =>
      new URLSearchParams(window.location.search).get('patientId') ??
      import.meta.env.VITE_PATIENT_ID ??
      ''
  )

  return (
    <>
      <HamburgerMenu patientId={patientId} />

      <Routes>
        <Route
          path="/"
          element={<BedsideChart defaultPatientId={patientId} />}
        />
        <Route
          path="/patients"
          element={<PatientList />}
        />
        <Route
          path="/patients/:id"
          element={<BedsideChart defaultPatientId={patientId} />}
        />

        <Route
          path="/registration"
          element={<Registration />}
        />

        <Route
          path="/demo-telemetry"
          element={
            <BedsideChart
              defaultPatientId={patientId}
              demoTelemetry={true}
            />
          }
        />

        <Route
          path="*"
          element={<p>Page not found</p>}
        />
      </Routes>
    </>
  )
}

export default App