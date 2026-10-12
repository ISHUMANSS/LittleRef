import { useState, useRef, useEffect, useMemo } from "react";
import { RULE_CATEGORIES } from "../utils/rules";
import { useEventData } from "../context/EventDataContext";
import "./ViolationModal.css";

export default function ViolationModal({ team, onSelect, onClose }) {
  const { violationsForTeam } = useEventData();
  const [search, setSearch] = useState("");
  const [expandedCode, setExpandedCode] = useState(null); // rule code, or "OTHER"
  const [note, setNote] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const itemRefs = useRef({}); // code -> DOM node for the rule-item wrapper

  // Whenever a rule expands, bring it to the center of the scrollable list
  // so the severity buttons land somewhere reachable without manual scrolling.
  useEffect(() => {
    if (!expandedCode) return;
    const node = itemRefs.current[expandedCode];
    if (node) {
      requestAnimationFrame(() => {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [expandedCode]);

  // How many times this team has already been called for each rule code.
  const countsByCode = useMemo(() => {
    if (!team) return {};
    const counts = {};
    violationsForTeam(team.id).forEach((v) => {
      counts[v.ruleCode] = (counts[v.ruleCode] || 0) + 1;
    });
    return counts;
  }, [team, violationsForTeam]);

  if (!team) return null;

  const query = search.trim().toLowerCase();
  const otherCategory = RULE_CATEGORIES.find((c) => c.isCustom);
  const codedCategories = RULE_CATEGORIES.filter((c) => !c.isCustom)
    .map((cat) => ({
      ...cat,
      rules: cat.rules.filter(
        (r) =>
          !query ||
          r.code.toLowerCase().includes(query) ||
          r.title.toLowerCase().includes(query) ||
          (r.shortTitle || "").toLowerCase().includes(query)
      ),
    }))
    .filter((cat) => cat.rules.length > 0);

  const customMatchCount = customCode.trim()
    ? countsByCode[customCode.trim()] || 0
    : 0;

  function toggleExpand(code) {
    setExpandedCode(expandedCode === code ? null : code);
    setNote("");
  }

  function handleConfirmRule(severity) {
    onSelect(expandedCode, severity, note);
  }

  function handleConfirmCustom(severity) {
    if (!customCode.trim()) return;
    onSelect(customCode.trim(), severity, customDescription);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Assign Violation: {team.number}</h2>

        <input
          className="modal-search"
          placeholder="Search rule code or title (e.g. G1, safety)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="rule-list">
          {codedCategories.length === 0 && !query && (
            <p className="rule-empty">No rules loaded.</p>
          )}

          {codedCategories.map((cat) => (
            <div key={cat.id} className="rule-category">
              <div className="rule-category-label" style={{ color: cat.color }}>
                {cat.name}
              </div>
              <div className="rule-chip-column">
                {cat.rules.map((r) => {
                  const isExpanded = expandedCode === r.code;
                  const priorCount = countsByCode[r.code] || 0;
                  return (
                    <div
                      key={r.code}
                      className="rule-item"
                      ref={(el) => {
                        itemRefs.current[r.code] = el;
                      }}
                    >
                      <button
                        className="rule-chip-row-btn"
                        style={{ borderColor: cat.color }}
                        onClick={() => toggleExpand(r.code)}
                      >
                        <span
                          className="rule-chip-code"
                          style={{ background: cat.color }}
                        >
                          {r.code}
                        </span>
                        <span className="rule-chip-short" style={{ color: cat.color }}>
                          {r.shortTitle || r.title}
                        </span>
                        {priorCount > 0 && (
                          <span className="rule-chip-prior-count">
                            ×{priorCount}
                          </span>
                        )}
                        <span className="rule-chip-arrow">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="rule-detail">
                          <p className="rule-detail-title">{r.title}</p>
                          {r.description && (
                            <p className="rule-detail-desc">{r.description}</p>
                          )}

                          {priorCount > 0 && (
                            <p className="rule-detail-prior-count">
                              {team.number} has already been called for{" "}
                              {r.code} {priorCount}{" "}
                              {priorCount === 1 ? "time" : "times"} this event.
                            </p>
                          )}

                          <label className="setup-label">Note (optional)</label>
                          <textarea
                            className="modal-note"
                            rows={2}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Anything specific about this call…"
                          />

                          <div className="severity-buttons">
                            <button
                              className="severity-btn severity-minor"
                              onClick={() => handleConfirmRule("minor")}
                            >
                              Minor
                            </button>
                            <button
                              className="severity-btn severity-major"
                              onClick={() => handleConfirmRule("major")}
                            >
                              Major
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* for all other rules not included in the list */}
          {otherCategory && (
            <div className="rule-category">
              <div
                className="rule-category-label"
                style={{ color: otherCategory.color }}
              >
                {otherCategory.name}
              </div>
              <div
                className="rule-item"
                ref={(el) => {
                  itemRefs.current.OTHER = el;
                }}
              >
                <button
                  className="rule-chip-row-btn"
                  style={{ borderColor: otherCategory.color }}
                  onClick={() => toggleExpand("OTHER")}
                >
                  <span
                    className="rule-chip-code"
                    style={{ background: otherCategory.color }}
                  >
                    ?
                  </span>
                  <span
                    className="rule-chip-short"
                    style={{ color: otherCategory.color }}
                  >
                    Not listed — enter manually
                  </span>
                  <span className="rule-chip-arrow">
                    {expandedCode === "OTHER" ? "▲" : "▼"}
                  </span>
                </button>

                {expandedCode === "OTHER" && (
                  <div className="rule-detail">
                    <label className="setup-label">Rule / Code</label>
                    <input
                      className="modal-note"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      placeholder="e.g. R14 or a short label"
                    />

                    {customMatchCount > 0 && (
                      <p className="rule-detail-prior-count">
                        {team.number} has already been called for "
                        {customCode.trim()}" {customMatchCount}{" "}
                        {customMatchCount === 1 ? "time" : "times"} this event.
                      </p>
                    )}

                    <label className="setup-label">What happened</label>
                    <textarea
                      className="modal-note"
                      rows={2}
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Describe the violation…"
                    />

                    <div className="severity-buttons">
                      <button
                        className="severity-btn severity-minor"
                        disabled={!customCode.trim()}
                        onClick={() => handleConfirmCustom("minor")}
                      >
                        Minor
                      </button>
                      <button
                        className="severity-btn severity-major"
                        disabled={!customCode.trim()}
                        onClick={() => handleConfirmCustom("major")}
                      >
                        Major
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button className="modal-close" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}