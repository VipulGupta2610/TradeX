export function exportCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    headers.map(escape).join(","),
    ...rows.map(row => headers.map(header => escape(row[header])).join(","))
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
