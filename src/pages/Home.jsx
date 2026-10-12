import { Link } from "react-router-dom";
import { useEventData } from "../context/EventDataContext";
import "./Home.css";
import Header from "../components/Header";

const SECTIONS = [
  {
    to: "/matches",
    title: "Matches",
    description: "View match schedule and open a match to score or referee.",
    disabled: true,
  },
  {
    to: "/teams",
    title: "Teams",
    description: "View teams and assign violations.",
    disabled: false,
  },
  {
    to: "/anomalies",
    title: "Anomalies",
    description: "Full event-wide log of every violation recorded.",
    disabled: false,
  },
  {
    to: "/event/setup",
    title: "Event Setup",
    description: "Configure event details and import teams.",
    disabled: false,
  },
];

const HOW_TO_STEPS = [
  {
    title: "Create or load an event",
    description:
      "Go to Event Setup and start a local event, optionally with sample teams for testing.",
    to: "/event/setup",
  },
  {
    title: "Add your teams",
    description: "Enter each team's number and name from Event Setup.",
    to: "/event/setup",
  },
  {
    title: "Inspect robots",
    description:
      "From Event Setup or a team's page, mark each robot Pass or Fail with a note.",
    to: "/teams",
  },
  {
    title: "Assign violations during matches",
    description:
      "Open a team, tap Assign Violation, pick the rule and severity (minor/major).",
    to: "/teams",
  },
  {
    title: "Review patterns",
    description:
      "Check Anomalies to see which rules are broken most across the event.",
    to: "/anomalies",
  },
];

function Home() {
  const { teams, violations } = useEventData();

  return (
    <main>
      <Header />
      <div className="home">
        <h1>Little Ref</h1>
        <p className="home-subtitle">
          Created to help referees keep track of voliations at local events. Please refer to the game manual actual rules
        </p>

        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-value">{teams.length}</span>
            <span className="home-stat-label">Teams</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-value">{violations.length}</span>
            <span className="home-stat-label">Violations Logged</span>
          </div>
        </div>

        <div className="home-grid">
          {SECTIONS.map((section) =>
            section.disabled ? (
              <div
                key={section.to}
                className="home-card home-card-disabled"
                aria-disabled="true"
              >
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <span className="home-card-badge">Coming at some point</span>
              </div>
            ) : (
              <Link key={section.to} to={section.to} className="home-card">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </Link>
            )
          )}
        </div>

        <section className="how-to">
          <h2 className="how-to-title">How to use this app</h2>
          <ol className="how-to-list">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={step.title} className="how-to-item">
                <span className="how-to-number">{i + 1}</span>
                <div className="how-to-text">
                  <p className="how-to-step-title">{step.title}</p>
                  <p className="how-to-step-desc">{step.description}</p>
                </div>
                <Link to={step.to} className="how-to-link">
                  Go →
                </Link>
              </li>
            ))}
          </ol>
          <p className="how-to-note">
            Everything is stored on this device only — no internet connection
            needed during an event.
          </p>
        </section>

        
      </div>
    </main>
  );
}

export default Home;