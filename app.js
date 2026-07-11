"use strict";

/* Click-Dummy Projektkoordination — Hauptpfad aus Sicht der PK.
   Alle 18 Screens (0–17) plus Zwischenschritt 7a und zwei Endzustände
   ("ende" = Abbruch, "abschluss" = regulärer Prozessabschluss nach Screen 17)
   liegen data-driven in SCREENS. render() zeigt currentId, history stützt Zurück. */

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
      <p>Übersicht offener Schulanfragen und laufender Projekte mit Status.</p>
      <ul>
        <li>GS Lindenhof — <em>neue Anfrage</em></li>
        <li>OSG Hildesheim — <em>Terminfindung läuft</em></li>
        <li>Gymnasium Nord — <em>Workshop terminiert</em></li>
      </ul>`,
    actions: [{ label: "Anfrage öffnen", to: 1, kind: "primary" }],
  },

  1: {
    step: 1, phase: "A — Anfrage & Erstgespräch", title: "Schulanfrage eingegangen",
    data: ["Stammdaten* (Name, PLZ, Ort)", "Ansprechperson (Name*, Position, E-Mail*, Telefon)",
      "Projektplanung* (Anzahl Klassen, Jahrgangsstufen, flexibel/Wunschtermine, genehmigte Finanzierung)",
      "ggf. Wunschtermine", "Bemerkungen"],
    body: `<p>Die Schule hat über die Website eine Anfrage gestellt. Prüfung durch die PK
      „zur Schonung unserer Ressourcen vor wenig interessierten Schulen“.</p>`,
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
    body: `<p>Automatische E-Mail (WordPress) mit Terminierungslink wurde versandt.
      Status: <strong>wartet auf Buchung</strong>.</p>`,
    actions: [
      { label: "Erstgespräch gebucht", to: 3, kind: "branch" },
      { label: "Nicht gebucht", to: "ende", kind: "branch" },
    ],
    notes: [ N.idee("Gemeinsames Überblickstool für Automatisierungen.") ],
  },

  3: {
    step: 3, phase: "A — Anfrage & Erstgespräch", title: "Erstgespräch",
    body: `<p>Termindetails wurden per E-Mail (Calendly) versandt. Video-Call mit der Schule;
      die PK bereitet Finanzierungsvorschläge o. Ä. vor. Nach Durchführung geht es weiter zum Angebot.</p>`,
    actions: [{ label: "Weiter", to: 4, kind: "primary" }],
    notes: [
      N.frage("Portal schon hier?"),
      N.besprechen("PK bereitet Erstgespräch vor (z. B. Finanzierungsvorschläge) ~15 Min."),
      N.tooling("Video-Call schafft höhere persönliche Bindung als Anruf (Anruf nur auf Anfrage?)."),
      N.tooling("Button zu Calendly statt E-Mail — oder automatische Weiterleitung?"),
    ],
  },

  4: {
    step: 4, phase: "B — Angebot", title: "Angebotsdetails-Formular versenden",
    data: ["Unterrichtszeiten", "Angaben zur Schule (Straße + Hausnr., Schulleitung, Schulform)",
      "ggf. gesonderte Rechnungsadresse", "Angaben zum Schulträger (Anschrift)",
      "bei Ablehnung: Hybrid ja/nein + Feedback"],
    body: `<p>Formularlink (Calendly) an die Schule zur Erfassung der Angebotsdetails.</p>`,
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
    body: `<p>Die PK stellt das Angebot zusammen und versendet es an die Schule
      (Datenobjekt <strong>„Angebot“</strong>).</p>`,
    actions: [{ label: "Weiter", to: 6, kind: "primary" }],
    notes: [
      N.vorschlag("Hier einen KVA versenden statt Angebot."),
      N.vorschlag("Angebot und Dienstleistungsvertrag zusammenfassen?"),
      N.vorschlag("Hier Angebot unterschreiben lassen."),
    ],
  },

  6: {
    step: 6, phase: "B — Angebot", title: "Unterschriebenes Angebot",
    body: `<p>Die Schule hat das Angebot geprüft, unterschrieben und zurückgesandt
      (Datenobjekt <strong>„Unterschriebenes Angebot“</strong>). Eingang bei der PK bestätigt.</p>`,
    actions: [{ label: "Weiter", to: 7, kind: "primary" }],
  },

  7: {
    step: 7, phase: "C — Terminfindung & SoVi-Matching", title: "Terminfindung",
    body: `<p>Verzweigung je nachdem, ob die Schule Wunschtermine angegeben hat.</p>`,
    actions: [
      { label: "Wunschtermine vorhanden", to: "7a", kind: "branch" },
      { label: "Keine Wunschtermine", to: 8, kind: "branch" },
    ],
    notes: [ N.besprechen("Ggf. gab es vorher eine grobe Anfrage, um vor Angebotsversand die Machbarkeit sicherzustellen.") ],
  },

  "7a": {
    step: 7, phase: "C — Terminfindung & SoVi-Matching", title: "Grobe Terminabsprache",
    body: `<p>Schule und PK stimmen grob mögliche Zeitfenster ab, bevor das SoVi-Matching startet.</p>`,
    actions: [{ label: "Weiter", to: 8, kind: "primary" }],
  },

  8: {
    step: 8, phase: "C — Terminfindung & SoVi-Matching", title: "SoVi-Matching",
    body: `<p>Persönliche Ansprache nach Zielregion oder Post in „Schulische Projekte“.
      Social Visionaries sagen zu oder ab — teils mit Zeitverzug.</p>`,
    actions: [{ label: "Weiter", to: 9, kind: "primary" }],
    notes: [
      N.idee("Alte Abfrage der SoVis prüfen."),
      N.idee("Schul-Kontakt in Campai hinterlegen für Newsletter."),
    ],
  },

  9: {
    step: 9, phase: "C — Terminfindung & SoVi-Matching", title: "Termine bestätigen",
    body: `<p>Die PK meldet der Schule <strong>vorgeschlagene Termine</strong> zurück;
      die Schule bestätigt sie verbindlich (Datenobjekt <strong>„Verbindliche Termine“</strong>).</p>`,
    actions: [{ label: "Weiter", to: 10, kind: "primary" }],
  },

  10: {
    step: 10, phase: "D — Vertrag & Klassenplanung", title: "Vertrag & Klassenplanung (parallel)",
    parallel: ["Dienstleistungsvertrag versenden (inkl. Hinweis Kinderschutzkonzept, Erklärung für Lehrkräfte)",
      "Link zum Formular Klassenplanung versenden"],
    body: `<p>Zwei Aktionen laufen gleichzeitig. Die Schule füllt die Klassenplanung aus
      (Klassenbezeichnung, Name + E-Mail der Klassenleitung).</p>`,
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
    body: `<p>„Start des Projekt“-Mail an die Klassenleitungen (Einverständniserklärungen,
      Erklärung für Lehrkräfte, Test- und Umfragelink der Klasse). Anschließend automatischer
      Versand der Mail zur Buchung der Situationserfassung (Calendly).</p>
      <p>Inklusive Verzweigung nach SoVi-Buchungstool:</p>`,
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
    parallel: ["Einverständniserklärungen der Eltern unterschreiben lassen",
      "Erklärung für Lehrkräfte unterschreiben", "Umfrage planen und durchführen",
      "Situationserfassung buchen"],
    body: `<p>Übersicht der parallelen Aufgaben der Klassenleitung. Parallel dazu:
      SoVis werten die Umfrage aus.</p>`,
    actions: [{ label: "Weiter", to: 13, kind: "primary" }],
    notes: [ N.vorschlag("Details zur Klassenplanung aus der Mail streichen.") ],
  },

  13: {
    step: 13, phase: "F — Vorbereitung & Situationserfassung", title: "Vorbereitung & Situationserfassung",
    body: `<p>PK legt die Erklärung für Lehrkräfte ab und bucht ggf. Unterkünfte (Reiseprojekt).
      Die Klassenleitung führt die Situationserfassung durch. Bei gemeinsamem Elternabend
      koordiniert die PK die Planung und verschickt die Einladung an die Lehrkräfte.</p>`,
    actions: [{ label: "Weiter zum Workshop", to: 14, kind: "primary" }],
    notes: [ N.idee("Zoom teilweise für die Situationserfassung.") ],
  },

  14: {
    step: 14, phase: "🏁 Meilenstein", title: "🏁 Workshop-Meilenstein",
    body: `<p>Der eigentliche Anti-Mobbing-<strong>Workshop</strong> findet statt.</p>`,
    actions: [{ label: "Weiter zur Nachbereitung", to: 15, kind: "primary" }],
  },

  15: {
    step: 15, phase: "G — Nachbereitung & Feedback", title: "Feedback & Nachbereitung",
    body: `<p>Feedback-Umfrage (Calendly/manuell) versenden, SoVis an den Reflexionsfragebogen
      erinnern. Feedback auswerten und an SoVis / P&amp;C / PsyPäd weitergeben sowie mit der Presse teilen.</p>`,
    actions: [{ label: "Weiter", to: 16, kind: "primary" }],
  },

  16: {
    step: 16, phase: "G — Nachbereitung & Feedback", title: "Abrechnung",
    body: `<p>Rechnungsentwurf an Marek senden → Marek versendet die Rechnung über
      <code>rechnung@</code> (Buchhaltung). Anträge von SoVis bearbeiten.</p>`,
    actions: [{ label: "Weiter", to: 17, kind: "primary" }],
    notes: [ N.idee("Warum prüft Marek?") ],
  },

  17: {
    step: 17, phase: "G — Nachbereitung & Feedback", title: "Abschluss",
    data: ["Anzahl Klassen / SuS", "Aufwendungen Reisekosten / Unterkunft", "Rechnungssumme",
      "Welche SoVis?", "Gefahrene KM"],
    body: `<p>Nach 10 Wochen wird manuell die <strong>Vergleichsumfrage</strong> verschickt und
      die Ergebnisse an die Lehrkraft gesendet. Statistische Daten werden über den gesamten
      Prozess gesammelt:</p>`,
    terminal: "abschluss",
    notes: [ N.besprechen("Vergleichsumfrage fällt in den „heißen Zeitraum“ des Schulalltags — unschön.") ],
  },

  ende: {
    step: null, phase: "Prozessende", title: "Prozess beendet",
    body: `<p>Die Anfrage wurde <strong>abgelehnt bzw. nicht weiterverfolgt</strong>.
      Dies ist ein vorzeitiges Ende — kein regulärer Projektabschluss.</p>`,
    terminal: "ende",
  },
};

const TOTAL = 18; // Screens 0–17
let currentId = 0;
const history = [];

const stage = document.getElementById("stage");
const progressEl = document.getElementById("progress");

function tag(n) {
  return `<span class="tag ${n.cls}">${n.tag}</span>${n.t}`;
}

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

  html += `<div class="body">${s.body}`;

  if (s.data) {
    html += `<div class="datafields"><div class="label">Erfasste Daten</div><ul>` +
      s.data.map((d) => `<li>${d}</li>`).join("") + `</ul></div>`;
  }
  if (s.parallel) {
    html += `<div class="parallel"><div class="label">Parallele Aufgaben</div>` +
      `<div class="parallel-grid">` +
      s.parallel.map((p) => `<div class="parallel-item">${p}</div>`).join("") +
      `</div></div>`;
  }
  html += `</div>`;

  if (s.notes && s.notes.length) {
    html += `<details class="notes"><summary><span class="ico">i</span>` +
      `Offene Fragen & Ideen (${s.notes.length})</summary><ul>` +
      s.notes.map((n) => `<li>${tag(n)}</li>`).join("") + `</ul></details>`;
  }

  // Actions
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
