function escapeCsvField(field) {
  const str = String(field ?? "");
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function buildViolationsCSV(teams, violations) {
  const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));

  const header = [
    "Team Number",
    "Team Name",
    "Rule Code",
    "Severity",
    "Note",
    "Timestamp",
  ];

  const rows = violations
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((v) => {
      const team = teamById[v.teamId];
      return [
        team?.number || "Unknown",
        team?.name || "",
        v.ruleCode,
        v.severity,
        v.note || "",
        new Date(v.timestamp).toLocaleString(),
      ];
    });

  return [header, ...rows]
    .map((row) => row.map(escapeCsvField).join(","))
    .join("\n");
}

export function downloadViolationsCSV(teams, violations, eventName = "event") {
  const csv = buildViolationsCSV(teams, violations);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = eventName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  link.href = url;
  link.download = `${safeName || "event"}-violations.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}