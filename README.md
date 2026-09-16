# pyramed


PyraMed is a hospital operations simulator that models how healthcare software systems work together during the day-to-day operation of a hospital. It simulates patient registration, vital monitoring, clinical decision support, privacy auditing, and background processes, allowing IT-focused users to experience how changes and events within one system can affect the rest of the hospital.

---

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** C# (.NET 10.0 Web API + Asynchronous Background Services)
- **Database:** Supabase (Cloud PostgreSQL Engine + Realtime Event Streams)
- **Routing & Deployment:** Nginx / Docker (Staging Phase)

---

## Team & Responsibilities

- **Jude Ma:** Project Lead, DevOps, and QA Lead (Infrastructure, Routing, Security Middleware & Auditing Loggers)
- **Gloria Ojiebun:** Full-Stack Engineer and Cloud Developer (Patient Registration, Information Aggregation, Background Vital Simulation Engine)
- **Yena Hong:** Full-Stack Engineer, QA Engineer, and Cloud Developer (Real-Time Provider Dashboards, Clinical Decision Support Rules, UI Alert Core)

---

## Setup & Onboarding 

Follow these steps to link your local machine to our shared development testing environment.

### 1. Synchronize the Repository
Pull down the master directory layout onto your computer:
```bash
git pull origin main
```

### 2. Configure Your Database Credentials
We're using a one central cloud database instance (`pyramed-dev`). You must configure your local configuration files to authenticate securely. **Do not commit these files to GitHub.**

#### Frontend Configuration (`/frontend/.env`)
Check the .env.example

#### Backend Configuration (`/backend/appsettings.Development.json`)
Check the appsettings.example
```

---

### Running Locally

To test features locally during development, go to your project directory and start both projects inside two separate terminal windows.

#### Start the React Frontend Engine
```bash
cd frontend
npm install
npm run dev
```

#### Start the C# .NET Web API Core
```bash
cd backend
dotnet watch run
```


##Folder Structure + Responsibility

pyramed/                  <-- Main Git Repository Root
├── frontend/
  ├── src/
  │   ├── components/       <-- Put UI modules here
  │   │   ├── Registration.jsx  # OjieG-Code's file
  │   │   └── MonitorView.jsx   # nugiraffe's file
  │   ├── App.jsx           <-- The main router 
  │   └── main.jsx
  ├── .env                  <-- Hidden database credentials
  └── .gitignore
└── backend/                      
    ├── BackgroundWorkers/        <-- OjieG-Code'S WORKSPACE (Simulation Loops)
    │   └── .gitkeep
    ├── Controllers/              <-- nugiraffe & OjieG-Code'S WORKSPACE (API Routes)
    │   └── PatientController.cs   #  new database entry & query endpoint
    ├── Middleware/               <-- DragonScripter'S WORKSPACE (Security & Auditing)
    │   └── .gitkeep
    ├── Models/                   <-- SHARED DATA STRUTURES (Database Mappings)
    │   └── .gitkeep
    ├── Services/                 <-- nugiraffe'S WORKSPACE (Medical Rules Engine)
    │   └── .gitkeep
    ├── Program.cs                <-- The main engine configuration file
    ├── appsettings.json          <-- Local configuration keys
    └── appsettings.Example.json


---

## Git Branching 
- **Do not push directly to `main`.**
- Create a feature branch off of `main` named after your module assignment (e.g., `gloria/simulation-worker` or `yena/clinical-dashboard`).
- Open a Pull Request (PR) on GitHub and secure a peer review from another teammate before merging.
