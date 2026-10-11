
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Registration.css'

function Registration() {
  const navigate = useNavigate()

  // Stores the values entered in the form
  const [name, setName] = useState('')
  const [age, setAge] = useState('')

  // Stores success, validation, or error messages
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    // Prevent the browser from refreshing when the form is submitted
    event.preventDefault()

    // VALIDATION 1:
    // Block submission if the patient's full name is blank
    if (name.trim() === '') {
      setMessage('Please enter the patient full name.')
      return
    }

    // VALIDATION 2:
    // Block submission if the patient's age is 0 or negative
    if (Number(age) <= 0) {
      setMessage('Age must be greater than 0.')
      return
    }

    // Validation passed, send patient information to the backend
    try {
      const response = await fetch('http://localhost:5019/api/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          age: Number(age),
        }),
      })

      // Check whether the backend successfully processed the request
      if (!response.ok) {
        throw new Error('Patient registration failed')
      }

      // Get the newly created patient returned by the backend
      const patient = await response.json()


      //  Backend returns patientId instead of id
if (!patient.patientId) {
  throw new Error('Backend did not return a patient ID')
}

//  Navigate using the patientId returned by the backend
navigate(`/patients/${patient.patientId}`)

    } catch (error) {
      console.error(error)
      setMessage('Unable to register patient.')
    }
  }

  return (
    <div className="registration-page">
      <div className="registration-card">
        <h1>PyraMed</h1>
        <h2>Patient Registration</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              type="number"
              min="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              required
            />
          </div>

          <button className="register-button" type="submit">
            Register Patient
          </button>
        </form>

        {message && (
          <p className="registration-message">{message}</p>
        )}
      </div>
    </div>
  )
}

export default Registration
