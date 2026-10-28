import { useState, useEffect } from "react";
import "./InspectionPanel.css";

export default function InspectionPanel({ teamId, inspection, onSetInspection }) {
  const [note, setNote] = useState(inspection?.note || "");
  // Collapsed whenever an inspection is already on record — pass or fail.
  // Only stays expanded when the team hasn't been inspected yet.
  const [expanded, setExpanded] = useState(!inspection);

  // If the underlying inspection changes (e.g. switching teams), reset collapse state.
  useEffect(() => {
    setExpanded(!inspection);
    setNote(inspection ? "" : "");
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  function markPassed() {
    onSetInspection(teamId, true, note);
    setNote("");
    setExpanded(false);
  }

  function markFailed() {
    onSetInspection(teamId, false, note);
    setNote("");
    setExpanded(false);
  }

  if (inspection && !expanded) {
    return (
      <div className="inspection-panel inspection-panel-collapsed">
        <div className="inspection-collapsed-row">
          <span
            className={`inspection-current inspection-summary ${
              inspection.passed ? "inspection-current-pass" : "inspection-current-fail"
            }`}
          >
            {inspection.passed ? "✓ Passed Inspection" : "✕ Failed Inspection"}
            <span className="inspection-current-time">
              {new Date(inspection.updatedAt).toLocaleString()}
            </span>
          </span>
          <button className="inspection-reinspect-btn" onClick={() => setExpanded(true)}>
            Re-inspect
          </button>
        </div>

        {inspection.note && (
          <p
            className={
              inspection.passed
                ? "inspection-collapsed-note inspection-collapsed-note-pass"
                : "inspection-collapsed-note"
            }
          >
            {inspection.note}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="inspection-panel">
      {inspection && (
        <div
          className={`inspection-current ${
            inspection.passed ? "inspection-current-pass" : "inspection-current-fail"
          }`}
        >
          {inspection.passed ? "✓ Passed Inspection" : "✕ Failed Inspection"}
          {inspection.note && <p className="inspection-current-note">{inspection.note}</p>}
          <span className="inspection-current-time">
            {new Date(inspection.updatedAt).toLocaleString()}
          </span>
        </div>
      )}

      <label className="setup-label">Note (required if failing)</label>
      <textarea
        className="inspection-note-input"
        rows={2}
        placeholder="Why did it fail, or any note worth keeping…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="inspection-buttons">
        <button className="inspection-btn inspection-btn-pass" onClick={markPassed}>
          Pass
        </button>
        <button
          className="inspection-btn inspection-btn-fail"
          disabled={!note.trim()}
          onClick={markFailed}
        >
          Fail
        </button>
      </div>

      {inspection && (
        <button className="inspection-cancel-btn" onClick={() => setExpanded(false)}>
          Cancel
        </button>
      )}
    </div>
  );
}