// Vercel-Funktion: Anfragen aus den Formularen per E-Mail an Indigo Home senden (Resend).
// Umgebungsvariablen in Vercel (Settings → Environment Variables):
//   RESEND_API_KEY  Schlüssel aus resend.com
//   MAIL_FROM       Absender, z.B. Indigo Home Website <web@indigohome.ch> (Domain bei Resend bestätigt)
//   MAIL_TO         Empfänger, z.B. info@indigohome.ch
// Fehlt die Einrichtung, antwortet die Funktion mit 503 und die Website öffnet stattdessen das E-Mail-Programm.

const NAMEN = { bewertung: "Bewertungsanfrage (Verkauf)", verkauf: "Verkaufsanfrage", verwaltung: "Anfrage Verwaltung", vermietung: "Anfrage Vermietung", interessent: "Interessentenliste", kontakt: "Kontaktanfrage" };
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM, to = process.env.MAIL_TO;
  if (!key || !from || !to) return res.status(503).json({ error: "not_configured" });
  const b = req.body && typeof req.body === "object" ? req.body : {};
  const entries = Object.entries(b).filter(([k]) => k !== "formular").slice(0, 30).map(([k, v]) => [String(k).slice(0, 40), String(v).slice(0, 3000)]);
  const email = String(b.email || "").trim();
  if (!entries.length || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "bad_request" });
  const titel = NAMEN[b.formular] || "Anfrage";
  const html = `<h2 style="font-family:Georgia,serif;color:#25235c">${esc(titel)}</h2><table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">` +
    entries.map(([k, v]) => `<tr><td style="color:#6a6878;vertical-align:top;border-bottom:1px solid #eee">${esc(k)}</td><td style="border-bottom:1px solid #eee">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("") + `</table>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], reply_to: email, subject: `${titel} · ${b.name || email}`, html, text: entries.map(([k, v]) => `${k}: ${v}`).join("\n") })
  });
  if (!r.ok) { console.error("Resend", r.status, await r.text().catch(() => "")); return res.status(502).json({ error: "mail" }); }
  return res.status(200).json({ ok: true });
};
