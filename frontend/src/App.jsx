import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import CriticalAlarmBanner from './components/CriticalAlarmBanner'
import HamburgerMenu from './components/HambugerMenu.jsx'
import LiveTelemetryCard from './components/LiveTelemetryCard'
import PatientDemographicsCard from './components/PatientDemographicsCard'
import Registration from './components/Registration'
import './App.css'

const demoVitals = [
  { heartRate: 72, spO2: 98 },
  { heartRate: 72, spO2: 89 },
  { heartRate: 121, spO2: 97 },
  { heartRate: 75, oxygenSaturation: 97 },
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

function BedsideChart({ patientId, demoTelemetry = false }) {
  const [alarmState, setAlarmState] = useState({ isAlarmActive: false, violations: [] })

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
          {demoTelemetry ? 'Demo telemetry active' : 'No telemetry connected'}
        </span>
      </header>

      <section className="bedside-chart__patient" aria-label="Patient demographics">
        <PatientDemographicsCard patientId={patientId} />
      </section>

      <section className="bedside-chart__telemetry" aria-label="Live bedside telemetry">
        <LiveTelemetryCard
          subscribeToVitals={demoTelemetry ? subscribeToDemoVitals : undefined}
          onAlarmChange={setAlarmState}
        />
      </section>
    </main>
  )
}

function App() {
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
        <Route path="/" element={<BedsideChart patientId={patientId} />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="*" element={<p>Page not found</p>} />
        <Route
          path="/demo-telemetry"
          element={<BedsideChart patientId={patientId} demoTelemetry />}
        />
      </Routes>
    </>
  )
}

export default App
