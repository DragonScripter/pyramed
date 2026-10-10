import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import LiveTelemetryCard from './components/LiveTelemetryCard'
import PatientDemographicsCard from './components/PatientDemographicsCard'
import Registration from './components/Registration'
import HamburgerMenu from './components/HambugerMenu.jsx'
import './App.css'

const demoVitals = [
  { heartRate: 72, spO2: 98 },
  { heartRate: 75, spO2: 97 }, 
  { heartRate: 71, spO2: 99 },
]

const subscribeToDemoVitals = (onUpdate) => {
  let readingIndex = 0
  const intervalId = window.setInterval(() => {
    onUpdate(demoVitals[readingIndex])
    readingIndex = (readingIndex + 1) % demoVitals.length
  }, 1200)

  return () => window.clearInterval(intervalId)
}

function BedsideChart({ patientId, demoTelemetry }) {
  const [isPatientConnected, setIsPatientConnected] = useState(false)

  return (
    <main className="bedside-chart">
      <header className="bedside-chart__header">
        <div>
          <p className="bedside-chart__eyebrow">Clinical monitoring</p>
          <h1>Bedside Chart</h1>
        </div>
        <span className="bedside-chart__status">
          {isPatientConnected ? 'Live telemetry connected' : 'No telemetry connected'}
        </span>
      </header>

      <section className="bedside-chart__patient" aria-label="Patient demographics">
        <PatientDemographicsCard
          patientId={patientId}
          onConnectionChange={setIsPatientConnected}
        />
      </section>

      <section className="bedside-chart__telemetry" aria-label="Live bedside telemetry">
        <LiveTelemetryCard
          key={demoTelemetry ? 'demo' : 'live'}
          subscribeToVitals={demoTelemetry ? subscribeToDemoVitals : undefined}
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
          element={<BedsideChart patientId={patientId} demoTelemetry={true} />}
        />
      </Routes>
    </>
  )
}

export default App