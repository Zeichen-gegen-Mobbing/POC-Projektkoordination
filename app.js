"use strict";

/* Click-Dummy Projektkoordination — vier Rollen-Perspektiven.
   Start: Rollenauswahl (home). Jede Rolle hat ihren eigenen Klickpfad mit
   echten, bedienbaren Screens. PK-Screens (0–17) unverändert; Formulare, die
   ohnehin einer anderen Rolle gehören (Angebotsdetails, Angebot, Termine,
   Vertrag/Klassenplanung), werden über gemeinsame Body-Konstanten wiederverwendet.
   render()/history stützen Weiter/Zurück/Neustart. Eingaben sind Attrappe. */

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

const taskDo = (title, controlHtml, checked) =>
  `<div class="task"><label class="task-check"><input type="checkbox" ${checked ? "checked" : ""}>` +
  `<span>${title}</span></label>${controlHtml}</div>`;

const tile = (label, value) =>
  `<div class="tile"><div class="tile-val">${value}</div><div class="tile-label">${label}</div></div>`;

const emailCard = (from, to, subject, body) =>
  `<div class="email"><div class="email-head">` +
  `<div><span class="e-k">Von</span> ${from}</div><div><span class="e-k">An</span> ${to}</div>` +
  `<div class="e-subj">${subject}</div></div><div class="email-body">${body}</div></div>`;

/* owner: 'self' | 'other:<Rolle>' | 'system' — wer den Screen wirklich bedient.
   Fehlt das Feld, gilt 'self' (eigene, bedienbare Aktion der aktiven Rolle). */
const ownerChip = (owner) => {
  if (owner === "system") return `<span class="owner-chip owner-foreign">⚙ Automatisch (System)</span>`;
  if (owner.startsWith("other:"))
    return `<span class="owner-chip owner-foreign">Wird erledigt von: ${owner.slice(6)}</span>`;
  return `<span class="owner-chip owner-self">● Ihre Aktion</span>`;
};

const N = {
  frage:      (t) => ({ tag: "Frage",      cls: "tag-frage",      t }),
  idee:       (t) => ({ tag: "Idee",       cls: "tag-idee",       t }),
  vorschlag:  (t) => ({ tag: "Vorschlag",  cls: "tag-vorschlag",  t }),
  tooling:    (t) => ({ tag: "Tooling",    cls: "tag-tooling",    t }),
  sovi:       (t) => ({ tag: "SoVi",       cls: "tag-sovi",       t }),
  besprechen: (t) => ({ tag: "Besprechen", cls: "tag-besprechen", t }),
};

/* ---- Wiederverwendbare Bodies (von mehreren Rollen genutzt) ------------- */

const bodyAngebotForm =
  `<p class="lead">Formular zur Erfassung der Angebotsdetails.</p>` +
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
    field("Anschrift des Schulträgers", { textarea: true, ph: "Straße, PLZ, Ort" }), 1);

const bodyAngebotQuote =
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
  </div>`;

const bodyTermine =
  `<p class="lead">Vorgeschlagene Termine — verbindlich bestätigen.</p>
   <div class="opts">
     <label class="opt"><input type="checkbox" checked> Di, 10.11.2026 · 08:00–13:00 · Klasse 7a</label>
     <label class="opt"><input type="checkbox" checked> Mi, 11.11.2026 · 08:00–13:00 · Klasse 7b</label>
     <label class="opt"><input type="checkbox"> Do, 12.11.2026 · Ausweichtermin</label>
   </div>` +
  section("Ergebnis", ro("Status", pill("Verbindlich bestätigt", "ok")), 1);

const bodyVertragKlasse =
  `<div class="parallel-note">Vertrag erhalten · Klassenplanung ausfüllen:</div>
   <div class="two-col">
     <div class="doc doc-sm">
       <div class="doc-head"><strong>Dienstleistungsvertrag</strong>${pill("Erhalten", "ok")}</div>
       <ul class="doc-list">
         <li>Vertragsdokument</li>
         <li>Hinweis Kinderschutzkonzept</li>
         <li>Erklärung für Lehrkräfte</li>
       </ul>
     </div>
     <div class="form-col">
       ${section("Formular Klassenplanung",
         field("Klassenbezeichnung", { value: "7a" }) +
         field("Klassenleitung – Name", { ph: "Vor- und Nachname" }) +
         field("Klassenleitung – E-Mail", { type: "email", ph: "name@schule.de" }), 1)}
     </div>
   </div>`;

/* ---- Screens ------------------------------------------------------------ */

const SCREENS = {
  home: {
    role: "home", phase: "Perspektive wählen", title: "Ich bin …",
    body:
      `<p class="lead">Wählen Sie Ihre Rolle im Prozess. Jede Perspektive zeigt Ihre eigenen,
        bedienbaren Screens.</p>`,
    actions: [
      { label: "Projektkoordination", to: 0, kind: "primary" },
      { label: "Schule", to: "s_anfrage", kind: "branch" },
      { label: "Social Visionary", to: "sv_matching", kind: "branch" },
      { label: "Klassenleitung", to: "kl_mail", kind: "branch" },
    ],
  },

  /* ===== Projektkoordination (unverändert) ============================== */

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
    step: 2, phase: "A — Anfrage & Erstgespräch", title: "Erstgespräch terminieren", owner: "other:Schule",
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
    step: 4, phase: "B — Angebot", title: "Angebotsdetails-Formular", owner: "other:Schule",
    body: bodyAngebotForm,
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
    body: bodyAngebotQuote,
    actions: [{ label: "Angebot versenden → Weiter", to: 6, kind: "primary" }],
    notes: [
      N.vorschlag("Hier einen KVA versenden statt Angebot."),
      N.vorschlag("Angebot und Dienstleistungsvertrag zusammenfassen?"),
      N.vorschlag("Hier Angebot unterschreiben lassen."),
    ],
  },

  6: {
    step: 6, phase: "B — Angebot", title: "Unterschriebenes Angebot", owner: "other:Schule",
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
    step: 9, phase: "C — Terminfindung & SoVi-Matching", title: "Termine bestätigen", owner: "other:Schule",
    body: bodyTermine,
    actions: [{ label: "Weiter", to: 10, kind: "primary" }],
  },

  10: {
    step: 10, phase: "D — Vertrag & Klassenplanung", title: "Vertrag & Klassenplanung",
    body: bodyVertragKlasse,
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
    step: 12, phase: "E — Projektstart & SoVi-Buchung", title: "Klassenleitung-Aufgaben (parallel)", owner: "other:Klassenleitung",
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
    step: 14, phase: "🏁 Meilenstein", title: "Workshop-Meilenstein", owner: "system",
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

  /* ===== Schule ========================================================= */

  s_anfrage: {
    role: "schule", phase: "Schule · Anfrage", title: "Anfrage über die Website stellen",
    body:
      `<p class="lead">Füllen Sie das Anfrageformular aus. Felder mit * sind Pflicht.</p>` +
      section("Stammdaten",
        field("Name der Schule *", { ph: "z. B. GS Lindenhof" }) +
        field("PLZ *", { ph: "21077" }) + field("Ort *", { ph: "Hamburg" })) +
      section("Ansprechperson",
        field("Name *", { ph: "Vor- und Nachname" }) + field("Position", { ph: "z. B. Klassenleitung" }) +
        field("E-Mail *", { type: "email", ph: "name@schule.de" }) + field("Telefon", { type: "tel", ph: "040 …" })) +
      section("Projektplanung",
        field("Anzahl Klassen *", { type: "number", ph: "2" }) +
        field("Jahrgangsstufen *", { ph: "z. B. 7" }) +
        field("Termin", { options: ["Flexibel", "Wunschtermine"] }) +
        field("Finanzierung genehmigt", { options: ["Nein", "Ja"] })) +
      section("Weiteres",
        field("Wunschtermine", { ph: "z. B. KW 46–48 / 2026" }) +
        field("Bemerkungen", { textarea: true, ph: "Optional …" }), 1),
    actions: [{ label: "Anfrage absenden → Weiter", to: "s_erstgespraech", kind: "primary" }],
    notes: [
      N.frage("SchulAPI zur Vereinfachung des Anfrageformulars → Adresse Schulträger erforderlich?"),
      N.idee("Jg. 1–2 schon rausnehmen? → Tooltip"),
      N.idee("Straße schon hier abfragen?"),
    ],
  },

  s_erstgespraech: {
    role: "schule", phase: "Schule · Erstgespräch", title: "Erstgespräch buchen",
    body:
      `<p class="lead">Wählen Sie einen freien Termin für Ihr Erstgespräch (Video-Call, ca. 30 Min.):</p>
       <div class="opts">
         <label class="opt"><input type="radio" name="slot" checked> Mo, 14.07.2026 · 10:00 Uhr</label>
         <label class="opt"><input type="radio" name="slot"> Di, 15.07.2026 · 14:00 Uhr</label>
         <label class="opt"><input type="radio" name="slot"> Do, 17.07.2026 · 09:30 Uhr</label>
       </div>`,
    actions: [{ label: "Termin buchen → Weiter", to: "s_angebotform", kind: "primary" }],
  },

  s_angebotform: {
    role: "schule", phase: "Schule · Angebot", title: "Angebotsdetails ausfüllen",
    body: bodyAngebotForm,
    actions: [{ label: "Formular absenden → Weiter", to: "s_angebotwait", kind: "primary" }],
  },

  s_angebotwait: {
    role: "schule", phase: "Schule · Angebot", title: "Angebot wird erstellt", owner: "other:Projektkoordination",
    body:
      `<p class="lead">Ihre Angebotsdetails sind eingegangen. Die Projektkoordination erstellt nun
        auf dieser Grundlage Ihr individuelles Angebot — für Sie ist hier nichts zu tun.</p>` +
      `<div class="tracker">
         <div class="tk done">✓ Angebotsdetails übermittelt</div>
         <div class="tk cur">● Projektkoordination erstellt das Angebot</div>
         <div class="tk">Danach: Angebot zur Prüfung an Sie</div>
       </div>`,
    actions: [{ label: "Angebot von PK erhalten → zur Prüfung", to: "s_angebotpruef", kind: "primary" }],
  },

  s_angebotpruef: {
    role: "schule", phase: "Schule · Angebot", title: "Angebot prüfen und unterschreiben",
    body:
      `<p class="lead">Dieses Angebot wurde von der <strong>Projektkoordination</strong> erstellt.
        Bitte prüfen und unterschreiben.</p>` +
      bodyAngebotQuote +
      `<label class="opt" style="margin-top:12px"><input type="checkbox"> Ich habe das Angebot geprüft und stimme zu.</label>`,
    actions: [{ label: "✍ Prüfen & Unterschreiben → Weiter", to: "s_termine", kind: "primary" }],
  },

  s_termine: {
    role: "schule", phase: "Schule · Terminfindung", title: "Termine verbindlich bestätigen",
    body: bodyTermine,
    actions: [{ label: "Termine bestätigen → Weiter", to: "s_vertrag", kind: "primary" }],
  },

  s_vertrag: {
    role: "schule", phase: "Schule · Vertrag", title: "Vertrag erhalten & Klassenplanung",
    body: bodyVertragKlasse,
    actions: [{ label: "Klassenplanung absenden → Fertig", to: "home", kind: "primary" }],
  },

  /* ===== Social Visionary =============================================== */

  sv_matching: {
    role: "sovi", phase: "SoVi · Matching", title: "Projektanfrage — zusagen oder absagen",
    body:
      `<div class="meeting">
         <div class="meeting-when"><span class="big">GS Lindenhof</span> · Hamburg</div>
         <div class="meeting-row">Workshop: 10.–11.11.2026 · 2 Klassen (Jg. 7)</div>
         <div class="meeting-row">Angefragt über: Persönliche Ansprache (Zielregion Hamburg)</div>
       </div>
       <p class="lead">Möchten Sie diesen Workshop übernehmen?</p>`,
    actions: [
      { label: "✓ Zusagen", to: "sv_situ", kind: "primary" },
      { label: "✗ Absagen", to: "home", kind: "branch" },
    ],
  },

  sv_situ: {
    role: "sovi", phase: "SoVi · Situationserfassung", title: "Terminierung Situationserfassung übernehmen",
    body:
      `<p class="lead">Für Sie ist <strong>kein Buchungstool</strong> hinterlegt — bitte stimmen Sie
        den Termin für die Situationserfassung direkt mit der Klassenleitung ab.</p>` +
      section("Termin vorschlagen",
        field("Datum", { type: "date" }) + field("Uhrzeit", { type: "time" }) +
        field("Format", { options: ["Vor Ort", "Video-Call (Zoom)"] }) +
        field("Kontakt Klassenleitung", { value: "kl-7a@gs-lindenhof.de" })),
    actions: [{ label: "Termin an Klassenleitung senden → Weiter", to: "sv_umfrage", kind: "primary" }],
    notes: [
      N.sovi("Kapazitätenliste → SoVis bekommen Terminbuchungstool. Mit Neeto prüfen."),
      N.besprechen("Unschön, dass manche SoVis Calendly haben und manche nicht (Beispiel OSG Hildesheim)."),
    ],
  },

  sv_umfrage: {
    role: "sovi", phase: "SoVi · Umfrage", title: "Umfrage auswerten",
    body:
      section("Umfrageergebnisse der Klasse",
        ro("Rücklaufquote", "87 % (26 / 30)") + ro("Zeitraum", "vor dem Workshop")) +
      section("Auswertung",
        field("Beobachtungen / Auffälligkeiten", { textarea: true, rows: 3, ph: "Kurze Auswertung …" }) +
        field("Empfehlung für den Workshop-Fokus", { textarea: true, rows: 2, ph: "Optional …" }), 1),
    actions: [{ label: "Auswertung absenden → Weiter", to: "sv_reflexion", kind: "primary" }],
  },

  sv_reflexion: {
    role: "sovi", phase: "SoVi · Nachbereitung", title: "Reflexionsfragebogen ausfüllen",
    body:
      section("Reflexion zum Workshop",
        field("Wie ist der Workshop verlaufen?", { textarea: true, rows: 3, ph: "…" }) +
        field("Gesamtbewertung", { options: ["1 – sehr gut", "2", "3", "4", "5"] }) +
        field("Verbesserungsvorschläge", { textarea: true, rows: 2, ph: "Optional …" }), 1),
    actions: [{ label: "Fragebogen absenden → Weiter", to: "sv_antrag", kind: "primary" }],
  },

  sv_antrag: {
    role: "sovi", phase: "SoVi · Abrechnung", title: "Antrag stellen (Reisekosten & Auslagen)",
    body:
      section("Antragsdaten",
        field("Gefahrene KM", { type: "number", value: "64" }) +
        field("Reisekosten (€)", { type: "number", ph: "0,00" }) +
        field("Unterkunft (€)", { type: "number", ph: "0,00" }) +
        field("Verpflegung (€)", { type: "number", ph: "0,00" })) +
      section("Sonstiges",
        field("Beleg / Anmerkung", { textarea: true, ph: "Belege bitte anhängen …" }), 1),
    actions: [{ label: "Antrag einreichen → Fertig", to: "home", kind: "primary" }],
  },

  /* ===== Klassenleitung ================================================= */

  kl_mail: {
    role: "kl", phase: "Klassenleitung · Projektstart", title: "Projektstart-Mail erhalten", owner: "system",
    body:
      emailCard("koordination@zeichen-gegen-mobbing.de", "Sie (Klassenleitung 7a)",
        "Start des Projekts — Ihre Aufgaben",
        `<p>Guten Tag,<br>Ihr Anti-Mobbing-Projekt startet. Über den Link erhalten Sie:</p>
         <ul class="doc-list">
           <li>Einverständniserklärungen für Eltern &amp; Erziehungsberechtigte</li>
           <li>Erklärung für Lehrkräfte</li>
           <li>Test-Umfrage &amp; Umfragelink Ihrer Klasse</li>
         </ul>
         <p><a class="fake-link">→ Aufgaben & Formulare öffnen</a></p>`),
    actions: [{ label: "Aufgaben öffnen → Weiter", to: "kl_aufgaben", kind: "primary" }],
  },

  kl_aufgaben: {
    role: "kl", phase: "Klassenleitung · Aufgaben", title: "Meine Aufgaben (parallel)",
    body:
      `<p class="lead">Ihre vier Aufgaben — in beliebiger Reihenfolge zu erledigen:</p>
       <div class="tasks">
         ${taskDo("Einverständniserklärungen der Eltern einholen",
           `<button class="btn-mini" type="button">Hochladen</button>`, false)}
         ${taskDo("Erklärung für Lehrkräfte unterschreiben",
           `<button class="btn-mini" type="button">✍ Unterschreiben</button>`, false)}
         ${taskDo("Umfrage planen und durchführen",
           `<button class="btn-mini" type="button">Umfrage starten</button>`, false)}
         ${taskDo("Situationserfassung buchen",
           `<button class="btn-mini" type="button">Termin buchen</button>`, false)}
       </div>`,
    actions: [{ label: "Weiter", to: "kl_situ", kind: "primary" }],
  },

  kl_situ: {
    role: "kl", phase: "Klassenleitung · Situationserfassung", title: "Situationserfassung durchführen",
    body:
      `<div class="meeting">
         <div class="meeting-when"><span class="big">05.11.2026</span> · 08:00 Uhr · Klasse 7a</div>
         <div class="meeting-row">Format: Vor Ort mit dem/der Social Visionary</div>
       </div>
       <div class="tasks">
         ${taskDo("Situationserfassung mit der Klasse durchführen",
           `<span class="pill pill-wartet">Geplant</span>`, false)}
       </div>`,
    actions: [{ label: "Als durchgeführt markieren → Weiter", to: "kl_elternabend", kind: "primary" }],
  },

  kl_elternabend: {
    role: "kl", phase: "Klassenleitung · Elternabend", title: "Einladung Elternabend erhalten",
    body:
      emailCard("koordination@zeichen-gegen-mobbing.de", "Sie (Klassenleitung 7a)",
        "Einladung zum Elternabend — bitte an die Eltern weiterleiten",
        `<p>Anbei die Einladung zum gemeinsamen Elternabend am <strong>09.11.2026</strong>.
          Bitte leiten Sie diese <strong>zur Weiterverteilung an die Eltern</strong> Ihrer Klasse weiter.</p>
         <p><a class="fake-link">📎 Einladung_Elternabend.pdf</a></p>`),
    actions: [{ label: "📧 An Eltern weiterleiten → Weiter", to: "kl_ergebnis", kind: "primary" }],
  },

  kl_ergebnis: {
    role: "kl", phase: "Klassenleitung · Abschluss", title: "Ergebnisse einsehen", owner: "system",
    body:
      `<div class="tracker"><div class="tk done">✓ Vergleichsumfrage nach 10 Wochen abgeschlossen</div></div>
       <h2 class="fs-title">Ergebnisse Ihrer Klasse</h2>
       <div class="tiles">
         ${tile("Vorher – Belastung", "hoch")}
         ${tile("Nachher – Belastung", "gering")}
         ${tile("Teilnahme Umfrage", "26 / 30")}
         ${tile("Klassenklima (1–5)", "4,2")}
       </div>`,
    actions: [{ label: "Fertig → zur Rollenauswahl", to: "home", kind: "primary" }],
  },
};

/* ---- Rollen-Flows (für Fortschrittsanzeige) ----------------------------- */

const FLOWS = {
  pk: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  schule: ["s_anfrage", "s_erstgespraech", "s_angebotform", "s_angebotwait", "s_angebotpruef", "s_termine", "s_vertrag"],
  sovi: ["sv_matching", "sv_situ", "sv_umfrage", "sv_reflexion", "sv_antrag"],
  kl: ["kl_mail", "kl_aufgaben", "kl_situ", "kl_elternabend", "kl_ergebnis"],
};

const ROLE_LABEL = {
  home: "Rollenauswahl", pk: "Projektkoordination", schule: "Schule",
  sovi: "Social Visionary", kl: "Klassenleitung",
};

/* ---- Renderer ----------------------------------------------------------- */

let currentId = "home";
const history = [];

const stage = document.getElementById("stage");
const progressEl = document.getElementById("progress");

const tag = (n) => `<span class="tag ${n.cls}">${n.tag}</span>${n.t}`;

function render(id) {
  const s = SCREENS[id];
  if (!s) return;
  currentId = id;
  const role = s.role || "pk";

  const terminalCls = s.terminal ? ` ${s.terminal}` : "";
  let badge;
  if (id === "home") badge = "";
  else if (s.step === null) badge = `<span class="screen-no terminal">Ende</span>`;
  else if (typeof id === "number") badge = `<span class="screen-no${terminalCls}">Screen ${id}</span>`;
  else badge = "";

  const owner = s.owner || "self";
  const foreign = owner !== "self";
  const chip = (id === "home" || s.terminal) ? "" : ownerChip(owner);

  let html = `<article class="card${foreign ? " card-muted" : ""}">
    <div class="phase"><span>${s.phase}</span>${chip}</div>
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

  // Fortschrittsanzeige
  const flow = FLOWS[role];
  let pos;
  if (id === "home") pos = "Rollenauswahl";
  else if (s.step === null) pos = `${ROLE_LABEL[role]} · Prozess beendet`;
  else if (flow && flow.indexOf(id) >= 0) pos = `${ROLE_LABEL[role]} · Schritt ${flow.indexOf(id) + 1} von ${flow.length}`;
  else if (id === "7a") pos = `${ROLE_LABEL[role]} · Zwischenschritt`;
  else pos = ROLE_LABEL[role];
  progressEl.textContent = pos;

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
  render("home");
  window.scrollTo(0, 0);
});

render("home");
