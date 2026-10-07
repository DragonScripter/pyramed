
import { useState } from 'react'
import LiveTelemetryCard from './components/LiveTelemetryCard'
import PatientDemographicsCard from './components/PatientDemographicsCard'
import './App.css'

const demoVitals = [
  { heartRate: 72, spO2: 98 },
  { heartRate: 75, oxygenSaturation: 97 },
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

function App() {
  const [patientId] = useState(() => (
    new URLSearchParams(window.location.search).get('patientId')
      ?? import.meta.env.VITE_PATIENT_ID
      ?? ''
  ))
  const demoTelemetry = import.meta.env.DEV
    && new URLSearchParams(window.location.search).get('demoTelemetry') === '1'

  return (
    <main className="bedside-chart">
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
        <LiveTelemetryCard subscribeToVitals={demoTelemetry ? subscribeToDemoVitals : undefined} />
      </section>
    </main>
  )
}
export default App