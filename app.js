"use strict";

/* Click-Dummy Projektkoordination — Hauptpfad aus Sicht der PK.
   Jeder Screen rendert echtes App-UI (Tabelle, Formular, Dokument-Vorschau,
   Aufgaben-Karten, Statistik-Kacheln) statt Prosa. Datengetrieben aus SCREENS;
   render()/history stützen Weiter/Zurück/Neustart. Eingaben sind Attrappe —
   keine Validierung, keine Persistenz (statischer PoC). */

/* ---- Render-Helfer ------------------------------------------------------ */

const ro = (label, value) =>
  `<div class="field"><span class="f-label">${label}</span><div class="ro-value">${value}</div></div>`;

const field = (label, o = {}) => {
  const { type = "text", value = "", ph = "", options, textarea, rows = 2 } = o;
  let ctl;
  if (options) ctl = `<select>${options.map((x) => `<option>${x}</option>`).join("")}</select>`;
  else if (textarea) ctl = `<textarea rows="${rows}" placeholder="${ph}">${value}</textarea>`;
  else ctl = `<input type="${type}" value="${value}" placeholder="${ph}">`;
  return `<label class="field"><span class="f-label">${label}</span>${ctl}</label>`;
};

const section = (title, inner, cols = 2) =>
  `<section class="fs"><h2 class="fs-title">${title}</h2><div class="grid cols-${cols}">${inner}</div></section>`;

const pill = (text, kind) => `<span class="pill pill-${kind}">${text}</span>`;

const task = (title, status, kind, checked) =>
  `<div class="task"><label class="task-check"><input type="checkbox" ${checked ? "checked" : ""}>` +
  `<span>${title}</span></label>${pill(status, kind)}</div>`;

const tile = (label, value) =>
  `<div class="tile"><div class="tile-val">${value}</div><div class="tile-label">${label}</div></div>`;

const emailCard = (from, to, subject, body) =>
  `<div class="email"><div class="email-head">` +
  `<div><span class="e-k">Von</span> ${from}</div><div><span class="e-k">An</span> ${to}</div>` +
  `<div class="e-subj">${subject}</div></div><div class="email-body">${body}</div></div>`;

/* ---- Screens ------------------------------------------------------------ */

const N = {
  frage:      (t) => ({ tag: "Frage",      cls: "tag-frage",      t }),
  idee:       (t) => ({ tag: "Idee",       cls: "tag-idee",       t }),
  vorschlag:  (t) => ({ tag: "Vorschlag",  cls: "tag-vorschlag",  t }),
  tooling:    (t) => ({ tag: "Tooling",    cls: "tag-tooling",    t }),
  sovi:       (t) => ({ tag: "SoVi",       cls: "tag-sovi",       t }),
  besprechen: (t) => ({ tag: "Besprechen", cls: "tag-besprechen", t }),
};

const SCREENS = {
  0: {
    step: 0, phase: "Einstieg", title: "Dashboard / Projektübersicht",
    body: `
      <p class="lead">Offene Schulanfragen und laufende Projekte.</p>
      <table class="tbl">
        <thead><tr><th>Schule</th><th>Ort</th><th>Klassen</th><th>Status</th><th>Eingang</th></tr></thead>
        <tbody>
          <tr class="row-active">
            <td>GS Lindenhof</td><td>Hamburg</td><td>2</td>
            <td>${pill("Neue Anfrage", "neu")}</td><td>11.07.2026</td></tr>
          <tr><td>OSG Hildesheim</td><td>Hildesheim</td><td>4</td>
            <td>${pill("Terminfindung", "wartet")}</td><td>28.06.2026</td></tr>
          <tr><td>Gymnasium Nord</td><td>Kiel</td><td>3</td>
            <td>${pill("Workshop terminiert", "ok")}</td><td>02.06.2026</td></tr>
        </tbody>
      </table>`,
    actions: [{ label: "Anfrage GS Lindenhof öffnen", to: 1, kind: "primary" }],
  },

  1: {
    step: 1, phase: "A — Anfrage & Erstgespräch", title: "Schulanfrage eingegangen",
    body:
      section("Stammdaten",
        ro("Name der Schule", "GS Lindenhof") + ro("PLZ", "21077") + ro("Ort", "Hamburg")) +
      section("Ansprechperson",
        ro("Name", "Petra Meyer") + ro("Position", "Klassenleitung 7b") +
        ro("E-Mail", "meyer@gs-lindenhof.de") + ro("Telefon", "040 123456")) +
      section("Projektplanung",
        ro("Anzahl Klassen", "2") + ro("Jahrgangsstufen", "7") +
        ro("Terminwunsch", "Wunschtermine") + ro("Finanzierung genehmigt", pill("Ja", "ok"))) +
      section("Weiteres",
        ro("Wunschtermine", "KW 46–48 / 2026") +
        ro("Bemerkungen", "Zwei Parallelklassen, gemeinsamer Elternabend gewünscht."), 1),
    actions: [
      { label: "Annehmen", to: 2, kind: "branch" },
      { label: "Ablehnen", to: "ende", kind: "branch" },
    ],
    notes: [
      N.frage("SchulAPI zur Vereinfachung des Anfrageformulars → Adresse Schulträger erforderlich?"),
      N.idee("Jg. 1–2 schon rausnehmen? → Tooltip"),
      N.idee("Straße schon hier abfragen?"),
      N.idee("Angebot-Formular und Anfrageformular zusammenlegen."),
      N.idee("Angaben für Bestandskunden sparen → Kundennummer."),
    ],
  },

  2: {
    step: 2, phase: "A — Anfrage & Erstgespräch", title: "Erstgespräch terminieren",
    body:
      emailCard("koordination@zeichen-gegen-mobbing.de", "meyer@gs-lindenhof.de",
        "Terminierung Ihres Erstgesprächs",
        `<p>Guten Tag Frau Meyer,<br>bitte wählen Sie über den folgenden Link einen Termin
         für Ihr Erstgespräch:</p><p><a class="fake-link">→ Termin buchen (WordPress)</a></p>`) +
      `<div class="tracker">
         <div class="tk done">✓ Anfrage angenommen</div>
         <div class="tk done">✓ Automatische E-Mail versandt</div>
         <div class="tk cur">● Wartet auf Buchung durch die Schule</div>
       </div>`,
    actions: [
      { label: "Erstgespräch gebucht", to: 3, kind: "branch" },
      { label: "Nicht gebucht", to: "ende", kind: "branch" },
    ],
    notes: [ N.idee("Gemeinsames Überblickstool für Automatisierungen.") ],
  },

  3: {
    step: 3, phase: "A — Anfrage & Erstgespräch", title: "Erstgespräch",
    body:
      `<div class="meeting">
         <div class="meeting-when"><span class="big">14. Juli 2026</span> · 10:00–10:30 Uhr</div>
         <div class="meeting-row">Format: Video-Call (Calendly)</div>
         <div class="meeting-row">Teilnehmende: P. Meyer · Projektkoordination</div>
         <button class="btn btn-join" type="button" disabled>🎥 Call beitreten</button>
       </div>` +
      section("Vorbereitungsnotizen (PK)",
        field("Finanzierungsvorschläge", { textarea: true,
          value: "Stiftungsmittel + Eigenanteil 20 %", rows: 2 }) +
        field("Interne Notiz", { textarea: true, ph: "Notizen zum Gespräch…", rows: 2 }), 1),
    actions: [{ label: "Erstgespräch durchgeführt → Weiter", to: 4, kind: "primary" }],
    notes: [
      N.frage("Portal schon hier?"),
      N.besprechen("PK bereitet Erstgespräch vor (z. B. Finanzierungsvorschläge) ~15 Min."),
      N.tooling("Video-Call schafft höhere persönliche Bindung als Anruf (Anruf nur auf Anfrage?)."),
      N.tooling("Button zu Calendly statt E-Mail — oder automatische Weiterleitung?"),
    ],
  },

  4: {
    step: 4, phase: "B — Angebot", title: "Angebotsdetails-Formular",
    body:
      `<p class="lead">Formular für die Schule zur Erfassung der Angebotsdetails.</p>` +
      section("Unterricht",
        field("Unterrichtszeiten", { value: "08:00–13:15" }) +
        field("Hybrid möglich?", { options: ["Nein", "Ja"] })) +
      section("Angaben zur Schule",
        field("Straße + Hausnr.", { ph: "z. B. Lindenweg 4" }) +
        field("Name der Schulleitung", { ph: "Vor- und Nachname" }) +
        field("Schulform", { options: ["Grundschule", "Stadtteilschule", "Gymnasium", "Förderschule", "Berufsschule"] }) +
        field("Rechnungsadresse abweichend?", { options: ["Nein", "Ja"] })) +
      section("Rechnungs- & Trägerangaben",
        field("Rechnungsadresse", { textarea: true, ph: "Nur falls abweichend…" }) +
        field("Anschrift des Schulträgers", { textarea: true, ph: "Straße, PLZ, Ort" }), 1),
    actions: [
      { label: "Details erhalten", to: 5, kind: "branch" },
      { label: "Angebot abgelehnt", to: "ende", kind: "branch" },
    ],
    notes: [
      N.frage("Mobil schwierige Markierung von Pflichtfeldern, wenn nicht ausgefüllt?"),
      N.idee("Dieses Formular fällt möglicherweise weg."),
      N.vorschlag("Pro: Ein Formular."),
    ],
  },

  5: {
    step: 5, phase: "B — Angebot", title: "Angebot erstellen & versenden",
    body:
      `<div class="doc">
        <div class="doc-head"><strong>Zeichen gegen Mobbing e.V.</strong>
          <span>Angebot Nr. 2026-0142 · 14.07.2026</span></div>
        <div class="doc-to">An: GS Lindenhof, Petra Meyer</div>
        <table class="doc-tbl">
          <thead><tr><th>Position</th><th class="r">Menge</th><th class="r">Einzel</th><th class="r">Summe</th></tr></thead>
          <tbody>
            <tr><td>Workshop-Durchführung (2 Klassen)</td><td class="r">2</td><td class="r">980,00 €</td><td class="r">1.960,00 €</td></tr>
            <tr><td>Situationserfassung</td><td class="r">2</td><td class="r">180,00 €</td><td class="r">360,00 €</td></tr>
            <tr><td>Material &amp; Vorbereitung</td><td class="r">1</td><td class="r">160,00 €</td><td class="r">160,00 €</td></tr>
          </tbody>
        </table>
        <div class="doc-total">Gesamt: <strong>2.480,00 €</strong></div>
      </div>`,
    actions: [{ label: "Angebot versenden → Weiter", to: 6, kind: "primary" }],
    notes: [
      N.vorschlag("Hier einen KVA versenden statt Angebot."),
      N.vorschlag("Angebot und Dienstleistungsvertrag zusammenfassen?"),
      N.vorschlag("Hier Angebot unterschreiben lassen."),
    ],
  },

  6: {
    step: 6, phase: "B — Angebot", title: "Unterschriebenes Angebot",
    body:
      `<div class="doc">
        <div class="doc-head"><strong>Angebot Nr. 2026-0142</strong>${pill("Unterschrieben", "ok")}</div>
        <div class="doc-to">GS Lindenhof · Gesamt 2.480,00 €</div>
        <div class="doc-sign">
          <div class="sign-line">Petra Meyer<br><small>Schule, 14.07.2026</small></div>
          <div class="sign-line sign-ok">✓ Eingang bei der PK bestätigt</div>
        </div>
      </div>`,
    actions: [{ label: "Weiter", to: 7, kind: "primary" }],
  },

  7: {
    step: 7, phase: "C — Terminfindung & SoVi-Matching", title: "Terminfindung",
    body:
      `<div class="decision">
         <p>Hat die Schule Wunschtermine angegeben?</p>
         ${ro("Terminwunsch (aus Anfrage)", "Wunschtermine: KW 46–48 / 2026")}
       </div>`,
    actions: [
      { label: "Wunschtermine vorhanden", to: "7a", kind: "branch" },
      { label: "Keine Wunschtermine", to: 8, kind: "branch" },
    ],
    notes: [ N.besprechen("Ggf. gab es vorher eine grobe Anfrage, um vor Angebotsversand die Machbarkeit sicherzustellen.") ],
  },

  "7a": {
    step: 7, phase: "C — Terminfindung & SoVi-Matching", title: "Grobe Terminabsprache",
    body:
      section("Mögliche Zeitfenster abstimmen",
        field("Zeitfenster 1", { type: "week" }) +
        field("Zeitfenster 2", { type: "week" }) +
        field("Priorität", { options: ["Vormittags", "Nachmittags", "Ganztägig"] }) +
        field("Anmerkung", { ph: "z. B. keine Termine in Prüfungswochen" })),
    actions: [{ label: "Weiter", to: 8, kind: "primary" }],
  },

  8: {
    step: 8, phase: "C — Terminfindung & SoVi-Matching", title: "SoVi-Matching",
    body:
      `<p class="lead">Persönliche Ansprache nach Zielregion / Post in „Schulische Projekte“.
        SoVis sagen zu oder ab — teils mit Zeitverzug.</p>
       <table class="tbl">
         <thead><tr><th>Social Visionary</th><th>Region</th><th>Rückmeldung</th></tr></thead>
         <tbody>
           <tr><td>Jonas B.</td><td>Hamburg</td><td>${pill("Zugesagt", "ok")}</td></tr>
           <tr><td>Aylin K.</td><td>Hamburg</td><td>${pill("Zugesagt", "ok")}</td></tr>
           <tr><td>Marc T.</td><td>Lüneburg</td><td>${pill("Abgesagt", "no")}</td></tr>
           <tr><td>Sina R.</td><td>Hamburg</td><td>${pill("Offen", "wartet")}</td></tr>
         </tbody>
       </table>`,
    actions: [{ label: "Weiter", to: 9, kind: "primary" }],
    notes: [
      N.idee("Alte Abfrage der SoVis prüfen."),
      N.idee("Schul-Kontakt in Campai hinterlegen für Newsletter."),
    ],
  },

  9: {
    step: 9, phase: "C — Terminfindung & SoVi-Matching", title: "Termine bestätigen",
    body:
      `<p class="lead">Vorgeschlagene Termine an die Schule — die Schule bestätigt verbindlich.</p>
       <div class="opts">
         <label class="opt"><input type="checkbox" checked> Di, 10.11.2026 · 08:00–13:00 · Klasse 7a</label>
         <label class="opt"><input type="checkbox" checked> Mi, 11.11.2026 · 08:00–13:00 · Klasse 7b</label>
         <label class="opt"><input type="checkbox"> Do, 12.11.2026 · Ausweichtermin</label>
       </div>` +
      section("Ergebnis", ro("Status", pill("Verbindlich bestätigt", "ok")), 1),
    actions: [{ label: "Weiter", to: 10, kind: "primary" }],
  },

  10: {
    step: 10, phase: "D — Vertrag & Klassenplanung", title: "Vertrag & Klassenplanung",
    body:
      `<div class="parallel-note">Zwei Aktionen laufen parallel:</div>
       <div class="two-col">
         <div class="doc doc-sm">
           <div class="doc-head"><strong>Dienstleistungsvertrag</strong>${pill("Versendet", "ok")}</div>
           <ul class="doc-list">
             <li>Vertragsdokument</li>
             <li>Hinweis Kinderschutzkonzept</li>
             <li>Erklärung für Lehrkräfte</li>
           </ul>
         </div>
         <div class="form-col">
           ${section("Formular Klassenplanung (Schule)",
             field("Klassenbezeichnung", { value: "7a" }) +
             field("Klassenleitung – Name", { ph: "Vor- und Nachname" }) +
             field("Klassenleitung – E-Mail", { type: "email", ph: "name@schule.de" }), 1)}
         </div>
       </div>`,
    actions: [{ label: "Weiter", to: 11, kind: "primary" }],
    notes: [
      N.frage("Reihenfolge Vertrag / Klassenplanung — oder erst hier?"),
      N.idee("Absichtserklärung?"),
      N.idee("Vertrag zusammen mit Angebot unterschreiben."),
      N.vorschlag("Formular Klassenplanung erst hier raussenden."),
    ],
  },

  11: {
    step: 11, phase: "E — Projektstart & SoVi-Buchung", title: "Projektstart",
    body:
      emailCard("koordination@zeichen-gegen-mobbing.de", "Klassenleitungen 7a, 7b",
        "Start des Projekts",
        `<p>Der Link enthält:</p>
         <ul class="doc-list">
           <li>Einverständniserklärungen Eltern &amp; Erziehungsberechtigte</li>
           <li>Erklärung für Lehrkräfte</li>
           <li>Test-Umfrage &amp; Umfragelink der Klasse</li>
         </ul>`) +
      `<div class="tracker"><div class="tk done">✓ Situationserfassungs-Mail (Calendly) automatisch versandt</div></div>
       <p class="lead">SoVi-Buchungstool vorhanden?</p>`,
    actions: [
      { label: "SoVi mit Buchungstool → Workshop buchen", to: 12, kind: "branch" },
      { label: "SoVi ohne Buchungstool → SoVis informieren", to: 12, kind: "branch" },
    ],
    notes: [
      N.sovi("Alle SoVis haben ein Buchungstool (Zielbild)."),
      N.sovi("Termin an SoVi senden; Link für Situationserfassung mitsenden."),
      N.sovi("Kapazitätenliste → SoVis bekommen Terminbuchungstool. Mit Neeto prüfen."),
      N.vorschlag("Buchung der Workshops über Buchungstool entfällt."),
      N.besprechen("Unschön, dass manche SoVis Calendly haben und manche nicht. Beispiel OSG Hildesheim: 2 Lehrkräfte über Calendly, 1 über Thimos Link, 1 ganz ohne Automatisation."),
    ],
  },

  12: {
    step: 12, phase: "E — Projektstart & SoVi-Buchung", title: "Klassenleitung-Aufgaben (parallel)",
    body:
      `<p class="lead">Parallele Aufgaben der Klassenleitung:</p>
       <div class="tasks">
         ${task("Einverständniserklärungen der Eltern unterschreiben lassen", "In Arbeit", "wartet", false)}
         ${task("Erklärung für Lehrkräfte unterschreiben", "Erledigt", "ok", true)}
         ${task("Umfrage planen und durchführen", "Offen", "neu", false)}
         ${task("Situationserfassung buchen", "Offen", "neu", false)}
       </div>
       <div class="tracker"><div class="tk cur">● Parallel: SoVis werten die Umfrage aus</div></div>`,
    actions: [{ label: "Weiter", to: 13, kind: "primary" }],
    notes: [ N.vorschlag("Details zur Klassenplanung aus der Mail streichen.") ],
  },

  13: {
    step: 13, phase: "F — Vorbereitung & Situationserfassung", title: "Vorbereitung & Situationserfassung",
    body:
      `<div class="tasks">
         ${task("Erklärung für Lehrkräfte ablegen (PK)", "Erledigt", "ok", true)}
         ${task("Unterkünfte buchen (nur Reiseprojekt)", "Nicht nötig", "neu", false)}
         ${task("Situationserfassung durchführen (Klassenleitung)", "Geplant", "wartet", false)}
         ${task("Elternabend koordinieren (gemeinsamer Elternabend)", "In Arbeit", "wartet", false)}
         ${task("Einladung Elternabend an Lehrkräfte versenden", "Offen", "neu", false)}
       </div>`,
    actions: [{ label: "Weiter zum Workshop", to: 14, kind: "primary" }],
    notes: [ N.idee("Zoom teilweise für die Situationserfassung.") ],
  },

  14: {
    step: 14, phase: "🏁 Meilenstein", title: "Workshop-Meilenstein",
    body:
      `<div class="milestone">
         <div class="ms-flag">🏁</div>
         <div class="ms-title">WORKSHOP</div>
         <div class="ms-sub">Der Anti-Mobbing-Workshop findet statt · 10.–11.11.2026 · GS Lindenhof</div>
       </div>`,
    actions: [{ label: "Weiter zur Nachbereitung", to: 15, kind: "primary" }],
  },

  15: {
    step: 15, phase: "G — Nachbereitung & Feedback", title: "Feedback & Nachbereitung",
    body:
      `<div class="tasks">
         ${task("Feedback-Umfrage versenden (Calendly/manuell)", "Versendet", "ok", true)}
         ${task("SoVis an Reflexionsfragebogen erinnern", "Erledigt", "ok", true)}
         ${task("Feedback auswerten → SoVis / P&C / PsyPäd", "In Arbeit", "wartet", false)}
         ${task("Feedback mit Presse teilen", "Offen", "neu", false)}
       </div>`,
    actions: [{ label: "Weiter", to: 16, kind: "primary" }],
  },

  16: {
    step: 16, phase: "G — Nachbereitung & Feedback", title: "Abrechnung",
    body:
      `<div class="doc doc-sm">
         <div class="doc-head"><strong>Rechnungsentwurf → Marek</strong>${pill("Entwurf", "wartet")}</div>
         <div class="doc-to">GS Lindenhof · Rechnungssumme 2.480,00 €</div>
         <div class="doc-row">Versand über <code>rechnung@</code> (Buchhaltung)</div>
       </div>
       <div class="tasks">
         ${task("Rechnungsentwurf an Marek senden", "Erledigt", "ok", true)}
         ${task("Anträge von SoVis bearbeiten (Reisekosten etc.)", "In Arbeit", "wartet", false)}
       </div>`,
    actions: [{ label: "Weiter", to: 17, kind: "primary" }],
    notes: [ N.idee("Warum prüft Marek?") ],
  },

  17: {
    step: 17, phase: "G — Nachbereitung & Feedback", title: "Abschluss",
    body:
      `<div class="tracker">
         <div class="tk done">✓ Nach 10 Wochen: Vergleichsumfrage versendet</div>
         <div class="tk done">✓ Ergebnisse an die Lehrkraft gesendet</div>
       </div>
       <h2 class="fs-title">Statistische Daten</h2>
       <div class="tiles">
         ${tile("Klassen / SuS", "2 / 48")}
         ${tile("Reisekosten / Unterkunft", "0,00 €")}
         ${tile("Rechnungssumme", "2.480,00 €")}
         ${tile("Eingesetzte SoVis", "2")}
         ${tile("Gefahrene KM", "64")}
       </div>`,
    terminal: "abschluss",
    notes: [ N.besprechen("Vergleichsumfrage fällt in den „heißen Zeitraum“ des Schulalltags — unschön.") ],
  },

  ende: {
    step: null, phase: "Prozessende", title: "Prozess beendet",
    body:
      `<div class="terminal-box">
         <p>Die Anfrage wurde <strong>abgelehnt bzw. nicht weiterverfolgt</strong>.</p>
         <p>Dies ist ein vorzeitiges Ende — kein regulärer Projektabschluss.</p>
       </div>`,
    terminal: "ende",
  },
};

/* ---- Renderer ----------------------------------------------------------- */

const TOTAL = 18; // Screens 0–17
let currentId = 0;
const history = [];

const stage = document.getElementById("stage");
const progressEl = document.getElementById("progress");

const tag = (n) => `<span class="tag ${n.cls}">${n.tag}</span>${n.t}`;

function render(id) {
  const s = SCREENS[id];
  if (!s) return;
  currentId = id;

  const terminalCls = s.terminal ? ` ${s.terminal}` : "";
  const badge = s.step === null
    ? `<span class="screen-no terminal">Ende</span>`
    : `<span class="screen-no${terminalCls}">Screen ${id}</span>`;

  let html = `<article class="card">
    <div class="phase">${s.phase}</div>
    <h1>${badge}${s.title}</h1>`;

  if (s.terminal) {
    const label = s.terminal === "abschluss"
      ? "✔ Regulärer Projektabschluss (Screen 17)"
      : "✖ Vorzeitiges Ende — kein Abschluss";
    html += `<div class="terminal-banner ${s.terminal}">${label}</div>`;
  }

  html += `<div class="body">${s.body}</div>`;

  if (s.notes && s.notes.length) {
    html += `<details class="notes"><summary><span class="ico">i</span>` +
      `Offene Fragen & Ideen (${s.notes.length})</summary><ul>` +
      s.notes.map((n) => `<li>${tag(n)}</li>`).join("") + `</ul></details>`;
  }

  html += `<div class="actions">`;
  html += `<button class="btn btn-back" type="button" data-back ${history.length ? "" : "disabled"}>← Zurück</button>`;
  if (s.actions) {
    for (const a of s.actions) {
      const cls = a.kind === "branch" ? "btn-branch" : "btn-primary";
      html += `<button class="btn ${cls}" type="button" data-to="${a.to}">${a.label}</button>`;
    }
  }
  html += `</div></article>`;

  stage.innerHTML = html;

  progressEl.textContent = s.step === null
    ? "Prozess beendet"
    : `Schritt ${s.step} von ${TOTAL - 1}` + (id === "7a" ? " · Zwischenschritt" : "");

  stage.querySelectorAll("[data-to]").forEach((btn) => {
    btn.addEventListener("click", () => {
      history.push(currentId);
      render(btn.dataset.to);
      window.scrollTo(0, 0);
    });
  });
  const backBtn = stage.querySelector("[data-back]");
  if (backBtn) backBtn.addEventListener("click", () => {
    if (history.length) render(history.pop());
  });
}

document.getElementById("restart").addEventListener("click", () => {
  history.length = 0;
  render(0);
  window.scrollTo(0, 0);
});

render(0);
