# Indigo Home GmbH · Website

Statische Website (HTML, CSS, JS) auf Vercel, mit einer Server-Funktion für die Formulare.

| Seite | Inhalt |
|---|---|
| `index.html` | Startseite mit Schwerpunkt Verkauf und Bewertungsformular |
| `verkauf.html` | Verkauf, Ablauf in sechs Schritten, Bewertungsanfrage |
| `vermietung.html` | Vermietung, Offertanfrage |
| `verwaltung.html` | Verwaltung, Offertanfrage |
| `referenzen.html` | Referenzliegenschaften |
| `kontakt.html` | Kontakt, Bürozeiten, Interessentenliste |
| `impressum.html` | Impressum und Datenschutz |

Telefon und E-Mail stehen an einer Stelle in `site.js` (`KONTAKT`).

## Formulare per E-Mail empfangen

Ohne Einrichtung öffnet ein Formular das E-Mail-Programm der Besucher. Damit Anfragen direkt bei euch ankommen:

1. Konto auf [resend.com](https://resend.com) erstellen, Domain `indigohome.ch` bestätigen (DNS-Einträge beim Domain-Anbieter setzen), API Key erstellen.
2. In Vercel → Projekt → Settings → Environment Variables eintragen:
   - `RESEND_API_KEY`: der API Key
   - `MAIL_FROM`: z.B. `Indigo Home Website <web@indigohome.ch>`
   - `MAIL_TO`: `info@indigohome.ch`
3. Redeploy.
