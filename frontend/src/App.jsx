
import { useState } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
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

function BedsideChart({ defaultPatientId, demoTelemetry = false }) {
  // Read the patient ID from the URL
  const { id } = useParams()

  // Use the URL ID, or fall back to the default patient ID
  const patientId = id ?? defaultPatientId

  return (
    <main className="bedside-chart">
      <header className="bedside-chart__header">
        <div>
          <p className="bedside-chart__eyebrow">Clinical monitoring</p>
          <h1>Bedside Chart</h1>
        </div>

        <span className="bedside-chart__status">
          {demoTelemetry
            ? 'Demo telemetry active'
            : 'No telemetry connected'}
        </span>
      </header>

      <section
        className="bedside-chart__patient"
        aria-label="Patient demographics"
      >
        <PatientDemographicsCard patientId={patientId} />
      </section>

      <section
        className="bedside-chart__telemetry"
        aria-label="Live bedside telemetry"
      >
        <LiveTelemetryCard
          subscribeToVitals={
            demoTelemetry ? subscribeToDemoVitals : undefined
          }
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
