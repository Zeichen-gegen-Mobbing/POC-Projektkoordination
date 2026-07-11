# POC — Projektkoordination (Click-Dummy)

Statischer Click-Dummy (Proof-of-Concept) des Projektkoordinations-Prozesses von
**Zeichen gegen Mobbing** — aus Sicht der Projektkoordination (PK), Hauptpfad über
18 Screens (0–17) mit Verzweigungen.

- **Zweck:** den Prozessfluss durchklickbar validieren, kein Produktivsystem.
- **Technik:** reines HTML/CSS/JS, kein Build, kein Backend, keine Abhängigkeiten.
  Läuft direkt aus dem Repo-Root (auch auf GitHub Pages) — `index.html` öffnen.
- **Screen-Daten:** liegen data-driven in [`app.js`](app.js) (Objekt `SCREENS`).
- **Vollständige Spezifikation:** [`PROCESS.md`](PROCESS.md).

Offene Fragen / Optimierungsideen aus den Miro-Klebezetteln sind pro Screen als
aufklappbare Info-Notiz („Offene Fragen & Ideen“) eingebaut, nicht als eigene Schritte.
