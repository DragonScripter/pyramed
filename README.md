# PyraMed

PyraMed is a hospital operations simulator that models how healthcare software systems work together during the day-to-day operation of a hospital. It simulates patient registration, vital monitoring, clinical decision support, privacy auditing, and background processes, allowing IT-focused users to experience how changes and events within one system can affect the rest of the hospital.

> **Educational simulator.** All patient records and readings are simulated. PyraMed is not a medical device and must not be used to guide real clinical decisions.

---

## Who PyraMed Is For

- **IT students and recent graduates** learning how software supports hospital operations and healthcare data.
- **Software developers and IT professionals** exploring the workflows, system interactions, and technical challenges of hospital information systems.
- **Healthcare IT professionals** who want a simulated environment for exploring hospital software processes without real patient data.

## What You Can Explore

- **Patient registration and records:** how patient information enters the system.
- **Simulated vital-sign monitoring:** bedside charts and demo telemetry.
- **Clinical decision support and alerts:** simulated readings crossing configured thresholds.
- **Operations metrics and bed overview:** system-wide activity and hospital capacity.
- **Privacy activity and role-based access:** how access and permissions are represented.
- **Body-composition dashboard:** another kind of patient-related data.

## Example Workflow

1. Sign in and open the patient list.
2. Select a patient, or register a simulated patient if your role allows it.
3. Open the bedside chart and review the vital signs.
4. Explore alerts and clinical decision-support explanations.
5. Visit the operations terminal to review metrics and the bed overview.

Available pages and actions depend on your account role (for example, patient registration and role management are restricted to certain roles).

## Learning Goals

- How patient information is created and displayed across workflows.
- How simulated vital readings lead to alerts and decision-support results.
- How bedside monitoring and operations views present different perspectives on hospital activity.
- How authentication, roles, and activity logging fit into a healthcare software environment.

---

## Architecture

```text
React (Vite) frontend  →  .NET 10 Web API  →  Supabase (PostgreSQL + Realtime)
                                ↑
                  Background worker generating simulated vitals
```

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** C# (.NET 10 Web API + asynchronous background services)
- **Database:** Supabase (cloud PostgreSQL + Realtime event streams)
- **Routing & Deployment:** Nginx / Docker (staging phase)

---

## Running the Project

### Prerequisites
- Node.js (current LTS) and npm
- .NET 10 SDK
- Supabase configuration values for the `pyramed-dev` project, provided by the team

### Configuration
Never commit these files.
- **Frontend:** copy `frontend/.env.example` to `frontend/.env` and fill in the values.
- **Backend:** copy `backend/appsettings.Example.json` to `backend/appsettings.Development.json` and fill in the values.

### Start the app
In two terminals:

```bash
# Frontend
cd frontend
npm install
npm run dev
```

```bash
# Backend
cd backend
dotnet watch run
```

---

## Team & Responsibilities

- **Jude Ma:** Project Lead, DevOps, and QA Lead (infrastructure, routing, security middleware, auditing loggers)
- **Gloria Ojiebun:** Full-Stack Engineer and Cloud Developer (patient registration, information aggregation, background vital simulation engine)
- **Yena Hong:** Full-Stack Engineer, QA Engineer, and Cloud Developer (real-time provider dashboards, clinical decision support rules, UI alert core)

---

## Contributing

### Project structure

```text
pyramed/
├── backend/
│   ├── Audit/
│   ├── BackgroundWorkers/   # Vital simulation loops
│   ├── Controllers/         # API routes
│   ├── DTO/
│   ├── Middleware/          # Security and auditing
│   ├── Models/              # Shared data structures
│   └── Services/            # Clinical rules engine
├── backend.Tests/
├── db/
├── docs/
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── config/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── utils/
├── nginx/
└── supabase/
    └── migrations/
```

### Git branching
- Do not push directly to `main`.
- Branch off `main` using your module name (e.g. `gloria/simulation-worker`, `yena/clinical-dashboard`).
- Open a Pull Request and get a peer review before merging.
