# Prozessanalyse Projektkoordination — Spezifikation für Click-Dummy

> Quelle: Miro-Board „Prozessanalyse Projektkoordination" (Zeichen-gegen-Mobbing).
> Rekonstruiert aus SVG-Export (exakte Beschriftung, Position, Farbe, Formtyp) + JPG-Export (visuelle Bestätigung der Swimlanes, Farben, Meilenstein). Live-Board: https://miro.com/app/board/uXjVGHAYrOA=/
>
> **Diese Datei ist die einzige Vorlage für den/die Frontend-Entwickler:in.** Das Board wird nicht erneut angesehen.

---

## 1. Overview — Worum geht es?

Der Prozess bildet die **Koordination eines Anti-Mobbing-Schulprojekts** ab — von der ersten Schulanfrage über die Website bis zur abschließenden Rechnung, Feedback-Auswertung und Vergleichsumfrage nach dem Workshop.

Hauptakteur (Treiber des Prozesses) ist die **Projektkoordination (PK)** von Zeichen-gegen-Mobbing. Sie nimmt Schulanfragen entgegen, führt Erstgespräche, erstellt Angebote, stimmt Termine ab, matcht ehrenamtliche „Social Visionaries" (SoVis) mit Schulen, koordiniert Verträge und Einverständniserklärungen, organisiert die Situationserfassung und den Workshop und wickelt am Ende Feedback und Abrechnung ab.

Das Board ist ein **BPMN-artiges Swimlane-Flussdiagramm** (waagerechte Zeitachse, links → rechts, ~14.000 px breit). Der **Click-Dummy soll den Hauptpfad aus Sicht der Projektkoordination** abbilden; die farbigen Klebezettel sind **keine Prozessschritte**, sondern offene Fragen / Optimierungsideen (siehe Abschnitt 4).

---

## 2. Actors / Swimlanes (Zeilen, von oben nach unten)

Vier Bahnen. Beschriftungen exakt vom Board:

| # | Lane | Rolle |
|---|------|-------|
| 1 | **Klassenleitung** | Lehrkraft/Klassenleitung der teilnehmenden Klasse (unterschreibt Erklärungen, plant Umfrage, bucht Situationserfassung). |
| 2 | **Schule** | Anfragende Schule (stellt Anfrage, bucht Erstgespräch, füllt Formulare aus, unterschreibt Angebot/Vertrag). |
| 3 | **Projektkoordination** (PK) | Hauptakteur. Steuert den gesamten Ablauf. |
| 4 | **Social Visionaries** (SoVis) | Ehrenamtliche, die den Workshop durchführen (sagen zu/ab, koordinieren Situationserfassung). |

Zusätzlich extern erwähnt: **Marek** (Buchhaltung / Rechnungsversand, `rechnung@…`), **Presse/P&C/PsyPäd** (Feedback-Empfänger). Diese haben keine eigene Lane.

### Legende / Formtypen (BPMN-Schlüssel, links im Board — nicht Teil des Prozesses)

| Element | Bedeutung |
|---|---|
| **Orangefarbenes Rechteck** (`#fe9f4d`) | **Aufgabe** (Task/Aktion) — der Regelbaustein des Prozesses. |
| Orange Raute mit **X** | **Exklusives Gateway** (Entweder-oder-Verzweigung). |
| Orange Raute mit **+** | **Paralleles Gateway** (alle Zweige gleichzeitig). |
| Orange Raute mit **O** | **Inklusives Gateway** (ein oder mehrere Zweige). |
| Kreis / heller Baustein | **Ereignis**: Startereignis, Zwischenereignis, Endereignis. |
| Dokument-Baustein (Liste) | **Datenobjekt** — welche Daten/Felder ein-/ausgegeben werden. |
| Gestrichelte senkrechte Linie „Workshop" | **Meilenstein** (der eigentliche Workshop-Termin). |

**Farbcodierung der Klebezettel (= Kommentare, keine Schritte):** Gelb (`#fff79e`) = Optimierungsidee/Kommentar · Rot (`#ff9e9e`) = offene Frage · Magenta (`#fd9ae7`) = „Besprechen"-Diskussion · Hellgrün (`#b3e65f`) = Verbesserungsvorschlag · Grün (`#6ae08d`) = SoVi/Buchungstool-Hinweis · Türkis (`#81e7de`) = Tooling-Idee (Calendly etc.) · Gold (`#ffe86d`) = Prüf-/Klärungsnotiz.

---

## 3. Prozessschritte (geordnet, Hauptpfad)

Nummeriert in Zeitachsen-Reihenfolge (links → rechts). Jede Zeile: **Was passiert · Lane · Daten/Info · Verzweigung**.

### Phase A — Anfrage & Erstgespräch

1. **Schule stellt Anfrage über Website** · *Schule* · Startereignis.
   Erfasste Daten (Datenobjekt): **Stammdaten\*** (Name, PLZ, Ort), **Ansprechperson** (Name\*, Position, E-Mail\*, Telefon), **Projektplanung\*** (Anzahl der Klassen, Jahrgangsstufen, flexibel oder Wunschtermine, genehmigte Finanzierung ja/nein), ggf. Wunschtermine, Bemerkungen. (\* = Pflichtfeld.)
2. **PK erhält Schulanfrage** · *PK* · Zwischenereignis. Annahme „zur Schonung unserer Ressourcen vor wenig interessierten Schulen".
3. **E-Mail mit Terminierung Erstgespräch wird automatisch versandt (WordPress)** · *PK* · Aufgabe.
   → **Exklusive Verzweigung:** entweder **Erstgespräch buchen** (Schritt 4) **oder** *Erstgespräch wird nicht gebucht* → Prozess endet (Schule fällt raus).
4. **Erstgespräch buchen** · *Schule* · Aufgabe.
5. **E-Mail mit den Termindetails wird versandt (Calendly)** · *Schule* · Aufgabe.
   (PK bereitet das Erstgespräch vor, z. B. Finanzierungsvorschläge, ~15 Min — siehe Notiz.)
6. **Tag des Erstgesprächs erreicht** · *Schule* · Zwischenereignis (Timer).
7. **Erstgespräch durchführen** · *Schule*/PK · Aufgabe (Video-Call).

### Phase B — Angebot

8. **E-Mail mit dem Formular für Angebotsdetails wird versandt (Calendly)** · *Schule* · Aufgabe.
9. **Exklusives Gateway (X)** · *Schule*.
   → **Angebotsdetails im Formular angeben** (Schritt 10) **oder** *Angebot abgelehnt* → Endereignis.
10. **Angebotsdetails im Formular angeben** · *Schule* · Aufgabe.
    Erfasste Daten (Datenobjekt): **Unterrichtszeiten**, **Angaben zur Schule** (Straße + Hausnummer, Name der Schulleitung, Schulform), evtl. gesonderte **Rechnungsadresse**, **Angaben zum Schulträger** (Anschrift), falls Ablehnung: Hybrid ja/nein + Feedback, evtl. neue Angaben zur Projektplanung. *(Notiz: „fällt möglicherweise weg".)*
11. **Angebotsdetails erhalten** · *PK* · Zwischenereignis.
12. **Angebot wird erstellt und versendet** · *PK* · Aufgabe → Datenobjekt **„Angebot"**.
13. **Angebot erhalten** · *Schule* · Zwischenereignis.
14. **Angebot wird geprüft, unterschrieben und versandt** · *Schule* · Aufgabe → Datenobjekt **„Unterschriebenes Angebot"**.
15. **Unterschriebenes Angebot erhalten** · *PK* · Zwischenereignis.

### Phase C — Terminfindung & SoVi-Matching

16. **Exklusives Gateway (X)** · *PK*.
    → *wenn Wunschtermine vorhanden sind*: **Grobe Terminabsprache** (Schritt 17, *Schule*).
    → *wenn keine Wunschtermine vorhanden sind*: direkt zu Schritt 18.
17. **Grobe Terminabsprache** · *Schule*/PK · Aufgabe.
18. **SoVi-Matching → Persönliche Ansprache nach Zielregion oder Post in „Schulische Projekte"** · *PK* · Aufgabe.
19. **SoVis sagen zu oder ab, tlw. mit Zeitverzug** · *SoVis* · Aufgabe.
20. **Meldet der Schule Termine zurück** · *PK* · Aufgabe → Datenobjekt **„Vorgeschlagene Termine"**.
21. **Termine werden verbindlich bestätigt** · *Schule* · Aufgabe → Datenobjekt **„Verbindliche Termine"**.
22. **Terminbestätigung der Schule** · *PK* · Zwischenereignis.

### Phase D — Vertrag & Klassenplanung (parallel)

23. **Paralleles Gateway (+)** · *PK* · spaltet in zwei gleichzeitige Zweige (24a & 24b):
    - 24a. **Link zum Formular Klassenplanung versenden** · *PK* · Aufgabe.
    - 24b. **Dienstleistungsvertrag versenden** · *PK* · Aufgabe → Datenobjekt: Vertrag selbst, Hinweis Kinderschutzkonzept, Erklärung für Lehrkräfte.
25. **Koordination bekommt Vertrags-Mail** · *Schule* · Zwischenereignis. Datenobjekt: Dienstleistungsvertrag, Hinweis auf das Kinderschutzkonzept, Erklärung für Lehrkräfte zur Kenntnisnahme.
26. **Formular Klassenplanung ausfüllen** · *Schule* · Aufgabe. Datenobjekt: Klassenbezeichnung, Name und E-Mail-Adresse der Klassenleitung.
27. **Bekommt Formulardaten** · *PK* · Zwischenereignis.

### Phase E — Projektstart & SoVi-Buchung

28. **„Start des Projekt"-Mail an Klassenleitungen versenden** · *PK* · Aufgabe.
    Datenobjekt — Link enthält: Einverständniserklärungen Eltern und Erziehungsberechtigte, Erklärung für Lehrkräfte, Test-Umfrage und Umfragelink der Klasse.
29. **Inklusives Gateway (O)** · *PK*. Verzweigung nach SoVi-Buchungstool:
    - *Wenn SoVi Terminbuchungstool hat*: **Bucht den Workshop im Terminbuchungstool des SoVis** · *PK*.
    - *Wenn SoVi kein Terminbuchungstool hat*: **SoVis informieren** · *PK* → **Kümmern sich um Terminierung Situationserfassung** · *SoVis*.
30. **Automatischer Versand der Mail zur Buchung der Situationserfassung (Calendly)** · *PK* · Aufgabe.
31. **Klassenleitung bekommt Projektstart-Mail** · *Klassenleitung* · Zwischenereignis.
32. **Paralleles Gateway (+)** · *Klassenleitung* · vier gleichzeitige Aufgaben:
    - **Einverständniserklärungen der Eltern unterschreiben lassen**
    - **Erklärung für Lehrkräfte unterschreiben**
    - **Umfrage planen und durchführen**
    - **Situationserfassung buchen**
33. **Umfrage auswerten** · *SoVis* · Aufgabe.

### Phase F — Vorbereitung, Situationserfassung, Elternabend

34. **PK legt Erklärung für Lehrkräfte ab** · *PK* · Aufgabe.
35. **Unterkünfte buchen, wenn es ein Reiseprojekt ist** · *PK* · Aufgabe (bedingt).
36. **Situationserfassung durchführen** · *Klassenleitung* · Aufgabe.
37. **Koordiniert Elternabendplanung bei gemeinsamem Elternabend** · *PK* · Aufgabe.
38. **Verschickt Einladung Elternabend an Lehrkräfte zur Weiterverteilung** · *PK* · Aufgabe.

### 🏁 Meilenstein: **WORKSHOP** (der eigentliche Anti-Mobbing-Workshop findet statt)

### Phase G — Nachbereitung, Feedback & Abrechnung

39. **Calendly/Manuell verschickt nach Workshop Feedback-Umfrage** · *PK* · Aufgabe.
40. **SoVis an Reflexionsfragebogen erinnern** · *PK* · Aufgabe.
41. **Feedback wird ausgewertet und an SoVis (/P&C/PsyPäd) weitergegeben** · *PK* · Aufgabe.
42. **Feedback wird mit Presse geteilt** · *PK* · Aufgabe.
43. **Entwurf der Rechnung an Marek senden** · *PK* · Aufgabe → **Marek versendet Rechnung über `rechnung@`** (Buchhaltung).
44. **Anträge von SoVis bearbeiten** · *PK* · Aufgabe.
45. **Manuell wird nach 10 Wochen Vergleichsumfrage verschickt** (Umfrage-Link erstellen) · *PK* · Aufgabe.
46. **Ergebnisse an Lehrkraft senden** · *PK* · Aufgabe. **Endereignis.**

### Statistische Daten (werden über den Prozess hinweg gesammelt — als eigenes Datenobjekt oben rechts dargestellt)

- Anzahl Klassen/SuS
- Aufwendungen für Reisekosten/Unterkunft
- Rechnungssumme
- Welche SoVis?
- Gefahrene KM

---

## 4. Open Questions / Ambiguities (Klebezettel — als Tooltips/Fußnoten, NICHT blockierend)

Im Dummy als dezente Notiz/Tooltip am jeweiligen Schritt darstellen, nicht als Prozessschritt.

**Rote Zettel — offene Fragen:**
- „SchulAPI zur Vereinfachung des Anfrageformulars → Adresse Schulträger erforderlich?" (Schritt 1)
- „Portal schon hier?" (rund um Erstgespräch, Schritt 7)
- „Mobil schwierige Markierung von Pflichtfeldern wenn nicht ausgefüllt?" (Schritt 10)
- „Gemeinsames Überblickstool für Automatisierungen"
- „Oder erst hier?" (Reihenfolge Vertrag/Klassenplanung, Phase D)

**Gelbe Zettel — Optimierungsideen:**
- „Jg. 1-2 schon rausnehmen? → Tooltip" · „Straße schon hier?" (Anfrageformular)
- „Angebot-Formular und dieses zusammenlegen"
- „Angaben für Bestandskunden sparen? → Kundennummer"
- „Portal für Kund:innen → mit Benachrichtigungen → Checkliste" · „Einmallogins über E-Mail" · „Schulen/Team-Funktionalität"
- „Absichtserklärung?" · „Zusammen mit Angebot unterschreiben" (Vertrag)
- „Schul-Kontakt in Campai hinterlegen für Newsletter" · „Alte Abfrage SoVis prüfen"
- „Checklisten-Form" · „Alles über das Portal versenden" · „Portal zum Durchklicken" · „Digitale Unterschriften"
- „Vorteil, dass Informationen zeitgversetzt zugestellt werden können"
- „Zoom tlw. für Situationserfassung" · „Warum prüft Marek?"

**Hellgrüne Zettel — Verbesserungsvorschläge:**
- „Pro: Ein Formular" · „Details zur Klassenplanung streichen aus der Mail"
- „Hier einen KVA versenden statt Angebot" · „Angebot und Dienstleistungsvertrag zusammenfassen?" · „Hier Angebot unterschreiben lassen"
- „Formular Klassenplanung hier erst raussenden" · „Buchung der Workshops über Buchungstool entfällt"

**Grüne / Gold Zettel — SoVi/Buchungstool:**
- „Alle SoVis haben ein Buchungstool" · „Termin an SoVi senden" · „Link für die Situationserfassung mitsenden"
- „Kapazitätenliste → SoVis bekommen Terminbuchungstool" · „Mit Neeto prüfen"
- „Buchungstool nur als (interne) Prüfmöglichkeit für Stephie für Workshops" · „Für Situationserfassungen weiter über Buchungstool"

**Türkise Zettel — Tooling:**
- „Button zu Calendly statt E-Mail oder sogar automatische Weiterleitung?"
- „Video-Call schafft höhere persönliche Bindung als Anruf (Anruf nur auf persönliche Anfrage?)"

**Magenta „Besprechen"-Notizen (Diskussionspunkte):**
- „Vergleichsumfrage im „heißen Zeitraum" im Schulalltag. Unschön, dass manche SoVis Calendly haben und manche nicht. Beispiel OSG Hildesheim: 2 Lehrkräfte über Calendly, 1 über Thimos Link, 1 ganz ohne Automatisation." (globaler Diskussionspunkt)
- „PK bereitet Erstgespräch vor (z. B. Vorschläge zur Finanzierung etc.) ~15 Min." (Schritt 5)
- „Je nachdem gab es vorher schonmal eine grobe Anfrage, um vor Angebotsversand die Machbarkeit sicherzustellen" (Phase C)

---

## 5. Click-Dummy Screen List (minimaler statischer Klickpfad, Sicht der Projektkoordination)

Ziel: statischer Click-Dummy, Hauptpfad, mit **Weiter/Zurück**-Buttons; Verzweigungen als Auswahl-Buttons. Offene Fragen (Abschnitt 4) als Tooltip/Info-Icon am Screen, nicht blockierend.

| Screen | Titel | Inhalt (Anzeige/Eingabe) | Navigation / Branch |
|---|---|---|---|
| **0** | Dashboard / Projektübersicht | Liste offener Schulanfragen, Status je Projekt. Einstieg. | → Screen 1 |
| **1** | Schulanfrage eingegangen | Anzeige der Anfrage: Stammdaten, Ansprechperson, Projektplanung, Wunschtermine, Bemerkungen. | Buttons: **Annehmen** → 2 · **Ablehnen** → Ende |
| **2** | Erstgespräch terminieren | Auto-E-Mail (WordPress) mit Terminierungslink. Status „wartet auf Buchung". | Branch: **Erstgespräch gebucht** → 3 · **nicht gebucht** → Ende |
| **3** | Erstgespräch | Termindetails (Calendly), Vorbereitungsnotizen. Nach Durchführung. | → 4 |
| **4** | Angebotsdetails-Formular versenden | Formularlink an Schule. Erfasst: Unterrichtszeiten, Schul-/Trägerangaben, Rechnungsadresse. | Branch: **Details erhalten** → 5 · **Angebot abgelehnt** → Ende |
| **5** | Angebot erstellen & versenden | Angebot zusammenstellen und versenden. | → 6 |
| **6** | Unterschriebenes Angebot | Status: Schule hat geprüft/unterschrieben/zurückgesandt. | → 7 |
| **7** | Terminfindung | Verzweigung nach Wunschterminen. | Branch: **Wunschtermine vorhanden** → 7a (Grobe Terminabsprache) → 8 · **keine** → 8 |
| **8** | SoVi-Matching | Persönliche Ansprache nach Zielregion / Post in „Schulische Projekte". SoVis sagen zu/ab. | → 9 |
| **9** | Termine bestätigen | Vorgeschlagene Termine an Schule; Schule bestätigt → Verbindliche Termine. | → 10 |
| **10** | Vertrag & Klassenplanung (parallel) | Zwei Aktionen nebeneinander: Dienstleistungsvertrag versenden · Link Formular Klassenplanung versenden. Schule füllt Klassenplanung (Klassenbezeichnung, Klassenleitung + E-Mail). | → 11 |
| **11** | Projektstart | „Start des Projekt"-Mail an Klassenleitungen (Einverständniserklärungen, Erklärung Lehrkräfte, Test-/Umfragelink). Inklusiv-Branch: SoVi-Buchungstool ja/nein → Workshop buchen bzw. SoVis informieren. Situationserfassungs-Mail (Calendly). | → 12 |
| **12** | Klassenleitung-Aufgaben (parallel, Anzeige) | Übersicht der parallelen Klassenleitungs-Aufgaben: Einverständniserklärungen, Erklärung Lehrkräfte, Umfrage durchführen, Situationserfassung buchen. SoVis werten Umfrage aus. | → 13 |
| **13** | Vorbereitung & Situationserfassung | Erklärung ablegen, ggf. Unterkünfte buchen (Reiseprojekt), Situationserfassung, Elternabend koordinieren + Einladung versenden. | → 14 (Workshop) |
| **14** | 🏁 Workshop-Meilenstein | Markierung „Workshop findet statt". | → 15 |
| **15** | Feedback & Nachbereitung | Feedback-Umfrage (Calendly/manuell), SoVis an Reflexionsfragebogen erinnern, Feedback auswerten → SoVis/P&C/PsyPäd + Presse. | → 16 |
| **16** | Abrechnung | Rechnungsentwurf an Marek → Marek versendet über `rechnung@`. SoVi-Anträge bearbeiten. | → 17 |
| **17** | Abschluss | Nach 10 Wochen Vergleichsumfrage versenden; Ergebnisse an Lehrkraft senden. Statistische Daten (Anzahl Klassen/SuS, Reisekosten/Unterkunft, Rechnungssumme, welche SoVis, gefahrene KM). | **Ende** |

**Verzweigungen zusammengefasst (für die Dummy-Buttons):**
- Screen 1: Annehmen / Ablehnen
- Screen 2: gebucht / nicht gebucht
- Screen 4: Details erhalten / Angebot abgelehnt
- Screen 7: mit / ohne Wunschtermine
- Screen 11: SoVi mit / ohne Buchungstool (inklusiv)
- Screen 10 & 12: parallele Zweige (alle gleichzeitig, keine Auswahl — nur Darstellung)

**Hinweis Umfang:** 18 Screens (0–17). Parallele Bahnen (10, 12) nur als Anzeige mehrerer gleichzeitiger Aufgaben, nicht als echte Nebenläufigkeit. Offene Fragen aus Abschnitt 4 als Info-Icons/Tooltips einbauen, nicht als eigene Screens.
