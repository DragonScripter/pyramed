import { Link } from "react-router-dom";
import "./WelcomePage.css";

const HIGHLIGHTS = [
  {
    title: "Patient registration",
    text: "Admit patients through intake forms and watch new records flow into the rest of the hospital's systems.",
  },
  {
    title: "Vital monitoring",
    text: "Follow simulated vital signs on a bedside monitor, driven by background processes running around the clock.",
  },
  {
    title: "Clinical decision support",
    text: "See rule-based alerts fire when a patient's condition changes, and trace the reasoning behind each one.",
  },
  {
    title: "Privacy auditing",
    text: "Review audit logs that record who accessed what, so you can see how security and compliance work behind the scenes.",
  },
];

const HOW_TO_USE_STEPS = [
  {
    title: "Register a simulated patient",
    text: "Start with patient registration to create a simulated record for the hospital workflow.",
  },
  {
    title: "Review patient information",
    text: "Open the patient list and bedside chart to review demographics and the current care context.",
  },
  {
    title: "Monitor live telemetry",
    text: "Use the bedside monitor or demo telemetry stream to follow heart rate and oxygen saturation readings.",
  },
  {
    title: "Respond to clinical alerts",
    text: "Review active alerts and their evidence so you can understand which measurement crossed its safety threshold.",
  },
];

const TEAM_MEMBERS = [
  {
    name: "Jude Ma",
    initials: "JM",
    role: "Project Lead, DevOps & QA Lead",
    focus: "Infrastructure, routing, security middleware, and audit logging.",
  },
  {
    name: "Gloria Ojiebun",
    initials: "GO",
    role: "Full-Stack Engineer & Cloud Developer",
    focus: "Patient registration, information aggregation, and vital simulation.",
  },
  {
    name: "Yena Hong",
    initials: "YH",
    role: "Full-Stack, QA & Cloud Developer",
    focus: "Provider dashboards, clinical decision support, and alert experiences.",
  },
];

export default function WelcomePage() {
  return (
    <div className="welcome">
      <header className="welcome-nav">
        <span className="welcome-brand">PyraMed</span>
        <nav aria-label="Account">
          <Link to="/login" className="welcome-nav-link">Log in</Link>
        </nav>
      </header>

      <main>
        <section className="welcome-hero" aria-labelledby="hero-title">
          <h1 id="hero-title">PyraMed</h1>
          <p className="welcome-tagline">
            A hospital operations simulator that shows how healthcare software
            systems work together, and what happens when one of them changes.
          </p>
          <div className="welcome-cta">
            <Link to="/login" className="btn btn-primary">Log in</Link>
            <Link to="/register" className="btn btn-secondary">Register</Link>
          </div>
        </section>

        <section className="welcome-how-to" aria-labelledby="how-to-title">
          <div className="welcome-section-heading">
            <p className="welcome-section-eyebrow">Getting started</p>
            <h2 id="how-to-title">How to use the simulation</h2>
            <p>
              Follow the hospital workflow from patient intake through vital-sign
              monitoring and alert review.
            </p>
          </div>

          <ol className="welcome-how-to-steps">
            {HOW_TO_USE_STEPS.map((step, index) => (
              <li key={step.title} className="welcome-how-to-step">
                <span className="welcome-step-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="welcome-about" aria-labelledby="about-title">
          <h2 id="about-title">About PyraMed</h2>
          <p className="welcome-about-intro">
            Hospitals depend on many connected systems running at once. PyraMed
            models the day-to-day operation of those systems, from patient
            registration and vital monitoring to clinical decision support,
            privacy auditing, and the background processes that keep it all
            moving. It is built for IT-focused users who want to experience how
            an event in one system can ripple through the rest of the hospital.
          </p>

          <div className="welcome-cards">
            {HIGHLIGHTS.map((item) => (
              <article key={item.title} className="welcome-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <p className="welcome-scope">
            <strong>Scope:</strong> PyraMed is a simulation for learning and
            experimentation. All patients and data are simulated, and it is not
            a medical device or a tool for real clinical decisions.
          </p>
        </section>
      </main>
    </div>
  );
}

        <section className="welcome-team" aria-labelledby="team-title">
          <div className="welcome-section-heading">
            <p className="welcome-section-eyebrow">Team</p>
            <h2 id="team-title">Built by a multidisciplinary team</h2>
            <p>
              PyraMed brings together product, engineering, cloud, and quality
              assurance expertise to model connected hospital operations.
            </p>
          </div>

          <div className="welcome-team-members">
            {TEAM_MEMBERS.map((member) => (
              <article key={member.name} className="welcome-team-card">
                <span className="welcome-team-avatar" aria-hidden="true">
                  {member.initials}
                </span>
                <h3>{member.name}</h3>
                <p className="welcome-team-role">{member.role}</p>
                <p>{member.focus}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
