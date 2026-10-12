import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventData } from "../context/EventDataContext";
import { getRule } from "../utils/rules";
import { groupByRule } from "../utils/violations";
import Header from "../components/Header";
import TeamCard from "../components/TeamCard";
import ViolationModal from "../components/ViolationModal";
import InspectionPanel from "../components/InspectionPanel";

import "./Teams.css";

export default function Teams() {
  const { teamNumber } = useParams();
  return (
    <main>
      <Header />
      {teamNumber ? <TeamDetail teamNumber={teamNumber} /> : <TeamList />}
    </main>
  );
}

function TeamList() {
  const navigate = useNavigate();
  const { teams, violationsForTeam, inspectionForTeam } = useEventData();
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const filteredTeams = teams
    .filter(
      (t) =>
        !query ||
        t.number.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query)
    )
    .sort((a, b) =>
      a.number.localeCompare(b.number, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

  return (
    <div className="teams-page">
      <h1>Teams</h1>

      <input
        className="team-search"
        placeholder="Search by team number or name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {teams.length === 0 ? (
        <p className="teams-empty">
          No teams yet — add teams from the Event Setup page.
        </p>
      ) : (
        <div className="team-grid">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              violations={violationsForTeam(team.id)}
              inspection={inspectionForTeam(team.id)}
              onClick={() => navigate(`/teams/${team.number}`)}
              onRemove={() => {}}
            />
          ))}
          {filteredTeams.length === 0 && (
            <p className="teams-empty">No teams match "{search}".</p>
          )}
        </div>
      )}
    </div>
  );
}

function TeamDetail({ teamNumber }) {
  const navigate = useNavigate();
  const {
    teams,
    violationsForTeam,
    addViolation,
    removeViolation,
    inspectionForTeam,
    setInspection,
  } = useEventData();
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedRule, setExpandedRule] = useState(null);

  const team = teams.find((t) => t.number === teamNumber);

  if (!team) {
    return (
      <div className="teams-page">
        <p>Team {teamNumber} not found.</p>
        <button onClick={() => navigate("/teams")}>Back to Teams</button>
      </div>
    );
  }

  const violations = violationsForTeam(team.id);
  const majorCount = violations.filter((v) => v.severity === "major").length;
  const minorCount = violations.filter((v) => v.severity === "minor").length;
  const grouped = groupByRule(violations);

  function handleSelect(ruleCode, severity, note) {
    addViolation(team.id, ruleCode, severity, note);
    setModalOpen(false);
  }

  return (
    <div className="teams-page">
      <button className="back-link" onClick={() => navigate("/teams")}>
        ← Back to Teams
      </button>

      <div className="detail-header">
        <div>
          <h1 className="detail-team-number">{team.number}</h1>
          {team.name && <p className="detail-team-name">{team.name}</p>}
        </div>
        <div className="team-detail-stats">
          <span className="stat-pill stat-total">{violations.length} total</span>
          <span className="stat-pill stat-minor">{minorCount} minor</span>
          <span className="stat-pill stat-major">{majorCount} major</span>
        </div>
      </div>

      <section className="detail-section">
        <h2 className="detail-section-title">Inspection</h2>
        <InspectionPanel
          teamId={team.id}
          inspection={inspectionForTeam(team.id)}
          onSetInspection={setInspection}
        />
      </section>

      <section className="detail-section">
        <div className="detail-section-header">
          <h2 className="detail-section-title">Violation Log</h2>
          <button className="assign-btn" onClick={() => setModalOpen(true)}>
            Assign Violation
          </button>
        </div>

        {grouped.length === 0 ? (
          <p className="detail-empty">No violations recorded.</p>
        ) : (
          <ul className="violation-list">
            {grouped.map((group) => {
              const rule = getRule(group.ruleCode);
              const isExpanded = expandedRule === group.ruleCode;
              const groupMinor = group.entries.filter(
                (e) => e.severity === "minor"
              ).length;
              const groupMajor = group.entries.filter(
                (e) => e.severity === "major"
              ).length;

              return (
                <li key={group.ruleCode} className="violation-group">
                  <button
                    className="violation-group-header"
                    onClick={() =>
                      setExpandedRule(isExpanded ? null : group.ruleCode)
                    }
                  >
                    <span
                      className="badge"
                      style={{ background: rule?.color || "#999" }}
                    >
                      {group.ruleCode}
                    </span>

                    {group.entries.length > 1 && (
                      <span className="violation-count">
                        ×{group.entries.length}
                      </span>
                    )}

                    <span className="violation-group-breakdown">
                      {groupMinor > 0 && (
                        <span className="severity-tag severity-tag-minor">
                          {groupMinor} minor
                        </span>
                      )}
                      {groupMajor > 0 && (
                        <span className="severity-tag severity-tag-major">
                          {groupMajor} major
                        </span>
                      )}
                    </span>

                    <span className="violation-time">
                      latest {new Date(group.latestTimestamp).toLocaleTimeString()}
                    </span>

                    <span className="violation-expand-arrow">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {isExpanded && (
                    <ul className="violation-entry-list">
                      {group.entries.map((v) => (
                        <li key={v.id} className="violation-entry">
                          <span
                            className={`severity-tag severity-tag-${v.severity}`}
                          >
                            {v.severity}
                          </span>
                          {v.note ? (
                            <span className="violation-note">{v.note}</span>
                          ) : (
                            <span className="violation-note-empty">—</span>
                          )}
                          <span className="violation-time">
                            {new Date(v.timestamp).toLocaleTimeString()}
                          </span>
                          <button
                            className="violation-remove"
                            onClick={() => removeViolation(v.id)}
                            aria-label="Remove violation"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {modalOpen && (
        <ViolationModal
          team={team}
          onSelect={handleSelect}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}