import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useEventData } from "../context/EventDataContext";
import { getRule } from "../utils/rules";
import { downloadViolationsCSV } from "../utils/csvExport";
import Header from "../components/Header";
import "./Anomalies.css";

function Anomalies() {
  const { ruleCounts, teams, violations } = useEventData();
  const counts = ruleCounts();
  const [expandedRule, setExpandedRule] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  function teamsForRule(ruleCode) {
    const map = {};
    violations
      .filter((v) => v.ruleCode === ruleCode)
      .forEach((v) => {
        if (!map[v.teamId]) {
          map[v.teamId] = { teamId: v.teamId, count: 0, minor: 0, major: 0 };
        }
        map[v.teamId].count += 1;
        map[v.teamId][v.severity] += 1;
      });

    return Object.values(map)
      .map((entry) => ({
        ...entry,
        team: teams.find((t) => t.id === entry.teamId),
      }))
      .sort((a, b) => b.count - a.count);
  }

  function handleExport() {
    downloadViolationsCSV(teams, violations, event?.name || "event");
  }

  return (
    <main>
      <Header />
      <div className="anomalies-page anomalies-page-relative">
        <div className="anomalies-header">
          <div>
            <h1>Anomalies</h1>
            <p className="anomalies-subtitle">
              Rules broken most often across all {teams.length} teams this event.
            </p>
          </div>
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={violations.length === 0}
          >
            Export CSV
          </button>
        </div>

        {counts.length === 0 ? (
          <p className="teams-empty">No violations recorded yet.</p>
        ) : (
          <div className="anomaly-list">
            {counts.map((entry, i) => {
              const rule = getRule(entry.ruleCode);
              const isExpanded = expandedRule === entry.ruleCode;
              const teamBreakdown = isExpanded
                ? teamsForRule(entry.ruleCode)
                : [];

              return (
                <div key={entry.ruleCode} className="anomaly-item">
                  <button
                    className="anomaly-row"
                    onClick={() =>
                      setExpandedRule(isExpanded ? null : entry.ruleCode)
                    }
                  >
                    <span className="anomaly-rank">#{i + 1}</span>
                    <span
                      className="badge anomaly-badge"
                      style={{ background: rule?.color || "#999" }}
                    >
                      {entry.ruleCode}
                    </span>
                    <span className="anomaly-title">
                      {rule?.title || rule?.categoryName || "Unknown rule"}
                    </span>
                    <span className="anomaly-breakdown">
                      {entry.minor > 0 && (
                        <span className="severity-tag severity-tag-minor">
                          {entry.minor} minor
                        </span>
                      )}
                      {entry.major > 0 && (
                        <span className="severity-tag severity-tag-major">
                          {entry.major} major
                        </span>
                      )}
                    </span>
                    <span className="anomaly-count">{entry.count}×</span>
                    <span className="anomaly-arrow">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {isExpanded && (
                    <ul className="anomaly-detail">
                      {teamBreakdown.map(({ teamId, team, count, minor, major }) => (
                        <li key={teamId} className="anomaly-detail-row">
                          <Link
                            to={team ? `/teams/${team.number}` : "#"}
                            className="anomaly-detail-team"
                          >
                            {team ? team.number : "Unknown team"}
                            {team?.name && (
                              <span className="anomaly-detail-team-name">
                                {" "}
                                {team.name}
                              </span>
                            )}
                          </Link>
                          <span className="anomaly-detail-tags">
                            {minor > 0 && (
                              <span className="severity-tag severity-tag-minor">
                                {minor} minor
                              </span>
                            )}
                            {major > 0 && (
                              <span className="severity-tag severity-tag-major">
                                {major} major
                              </span>
                            )}
                          </span>
                          <span className="anomaly-detail-count">{count}×</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {toast && (
          <div className="toast toast-success" role="status">
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}

export default Anomalies;