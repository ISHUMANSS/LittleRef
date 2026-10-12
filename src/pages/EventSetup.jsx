import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useEventData } from "../context/EventDataContext";
import InspectionPanel from "../components/InspectionPanel";

import "./EventSetup.css";

function EventSetup() {
  const { event, teams, createEvent, clearEvent, addTeam, removeTeam } =
    useEventData();
  const navigate = useNavigate();

  return (
    <main>
      <Header />
      <div className="setup-page">
        <h1>Event Setup</h1>
        {event ? (
          <ActiveEventPanel
            event={event}
            teams={teams}
            addTeam={addTeam}
            removeTeam={removeTeam}
            clearEvent={clearEvent}
            navigate={navigate}
          />
        ) : (
          <CreateEventPanel createEvent={createEvent} />
        )}
      </div>
    </main>
  );
}

function CreateEventPanel({ createEvent }) {
  const [name, setName] = useState("");
  const [useSampleData, setUseSampleData] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Clear any pending auto-dismiss timer on unmount
  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Enter an event name before creating the event.");
      return;
    }
    createEvent(name, { useSampleData, source: "local" });
  }

  return (
    <div className="setup-card setup-card-relative">
      <h2>Create an Event</h2>

      <form onSubmit={handleCreate}>
        <label className="setup-label">Event Name</label>
        <input
          className="setup-input"
          placeholder="e.g. Demo VEX Event"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="setup-checkbox">
          <input
            type="checkbox"
            checked={useSampleData}
            onChange={(e) => setUseSampleData(e.target.checked)}
          />
          Start with sample teams (for testing)
        </label>

        <button type="submit" className="setup-btn setup-btn-primary">
          Create Local Event
        </button>
      </form>

      <div className="setup-divider" />

      <button className="setup-btn setup-btn-disabled" disabled>
        Load Event from VEX API (requires internet coming at some point)
      </button>
      <p className="setup-hint">
        Local events store everything on this device only. Nothing is sent
        anywhere.
      </p>

      {toast && (
        <div className="toast toast-error" role="alert">
          {toast}
        </div>
      )}
    </div>
  );
}

function ActiveEventPanel({ event, teams, addTeam, removeTeam, clearEvent, navigate }) {
  const { inspectionForTeam, setInspection } = useEventData();
  const [numberInput, setNumberInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  function handleAddTeam(e) {
    e.preventDefault();
    if (!numberInput.trim()) return;
    addTeam(numberInput, nameInput);
    setNumberInput("");
    setNameInput("");
  }

  function handleClearConfirmed() {
    clearEvent();
    setConfirmingClear(false);
    navigate("/");
  }

  return (
    <div className="setup-card">
      <h2>{event.name}</h2>
      <p className="setup-meta">
        {event.source === "local" ? "Local event" : "VEX API event"} · Created{" "}
        {new Date(event.createdAt).toLocaleDateString()}
      </p>

      <h3>Add Team</h3>
      <form className="setup-team-form" onSubmit={handleAddTeam}>
        <input
          className="setup-input"
          placeholder="Team number (e.g. 1234A)"
          value={numberInput}
          onChange={(e) => setNumberInput(e.target.value)}
        />
        <input
          className="setup-input"
          placeholder="Team name (optional)"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button type="submit" className="setup-btn setup-btn-primary">
          Add Team
        </button>
      </form>

      <h3>Teams ({teams.length})</h3>
      <ul className="setup-team-list">
        {teams.length === 0 && <li className="setup-empty">No teams added yet.</li>}
        {teams.map((t) => {
          const inspection = inspectionForTeam(t.id);
          const isExpanded = expandedTeamId === t.id;
          return (
            <li key={t.id} className="setup-team-item">
              <div className="setup-team-row">
                <span>
                  <strong>{t.number}</strong> {t.name}
                  {inspection && (
                    <span
                      className={`inspected-badge ${
                        inspection.passed ? "" : "inspected-badge-fail"
                      }`}
                    >
                      {inspection.passed ? "✓ Inspected" : "✕ Failed"}
                    </span>
                  )}
                </span>
                <div className="setup-team-actions">
                  <button
                    className="setup-inline-btn"
                    onClick={() => setExpandedTeamId(isExpanded ? null : t.id)}
                  >
                    {isExpanded ? "Hide Inspection" : "Inspect"}
                  </button>
                  <button onClick={() => removeTeam(t.id)}>Remove</button>
                </div>
              </div>
              {isExpanded && (
                <div className="setup-inspection-wrap">
                  <InspectionPanel
                    teamId={t.id}
                    inspection={inspection}
                    onSetInspection={setInspection}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="setup-divider" />

      {!confirmingClear ? (
        <button
          className="setup-btn setup-btn-danger"
          onClick={() => setConfirmingClear(true)}
        >
          Leave / Clear Event
        </button>
      ) : (
        <div className="setup-warning">
          <p>
            ⚠ This permanently deletes <strong>{event.name}</strong> —
            including all {teams.length} team(s) and every violation logged
            for this event. This cannot be undone.
          </p>
          <div className="setup-warning-actions">
            <button
              className="setup-btn setup-btn-danger"
              onClick={handleClearConfirmed}
            >
              Yes, delete this event
            </button>
            <button
              className="setup-btn"
              onClick={() => setConfirmingClear(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventSetup;