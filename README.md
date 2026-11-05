# BRC Lernwelt

Eine responsive deutschsprachige Lernwebsite für die BRC-Vorabiturvorbereitung. Läuft ohne Installation externer Pakete als statische Website auf GitHub Pages oder mit jedem statischen Webserver.

## Inhalte und Funktionen

Zwei getrennte Kursbereiche: **Mein Kurs** (Vorschlag plus aktuelle Lehrerergänzung) und **Frau Gläser** (zusätzliche Checkliste, blaue Akzentfarbe). Lernmarkierungen, Quiz, Checklisten, Exporte und Generalprobe werden pro Kurs getrennt geführt. Im Hauptkurs wird die optimale Bestellmenge ohne Rechnung/Grafik behandelt, bei Frau Gläser dagegen mit Tabelle, Formel und Diagramm. Die bereitgestellten Buchseiten 65–68 und 71–72 sind im Hauptkurs eingearbeitet: Marktsegmentierung mit drei Kriteriengruppen und fünf Bearbeitungsstrategien sowie die Produkt-Markt-Matrix nach Ansoff. Das Fitnessstudio-Beispiel und die Übersicht zur Marktabdeckung von Seite 68 sind ebenfalls enthalten. Die Originalfotos bleiben außerhalb des Repositorys.

- Lernzettel zu Kostenrechnung, Beschaffung, Lager, Personal, Führung und Klausurtechnik
- Suchfunktion und Themenfilter
- Karteikarten mit eigener Einschätzung und Wiederholung unsicherer Karten
- Wissensquiz mit sofortiger Begründung und Auswertung
- Hauptkurs: acht Rechenaufgabentypen; Frau Gläser: sechs, jeweils mit drei Varianten und Lösungswegen
- Acht Lernetappen mit Checkliste
- Verkürzte Probeklausur: 85 Minuten, sieben Aufgaben, 67 Punkte, Selbstkorrektur
- Lernfortschritt im Browser, JSON-Export und validierter Import
- Druckansicht, Tastaturbedienung und mobile Navigation

## Lokal öffnen

Mit Node.js:

```sh
npm start
```

Anschließend `http://127.0.0.1:4173` öffnen. Für die JavaScript-Module ist ein HTTP-Server erforderlich; ein Doppelklick auf `index.html` genügt nicht.

## Prüfen

```sh
npm test
```

Die Tests prüfen unter anderem die Rechenergebnisse aus dem Klausurvorschlag, Prozentbasen, Mengenvergleich, Mindestbestand, Nettobedarf, Ganzzahlrundung, deutsche Zahleneingaben und die Probeklausurlösungen. Keine Build-Abhängigkeiten.

## GitHub Pages

In den Repository-Einstellungen unter **Pages → Build and deployment → Deploy from a branch** den Branch `main` und den Ordner `/ (root)` auswählen. Die Seite verwendet ausschließlich relative Ressourcenpfade und funktioniert daher auch unter einer Repository-Unteradresse. `.nojekyll` verhindert eine unnötige Jekyll-Verarbeitung.

## Materialbasis und Grenzen

Grundlage sind vom Nutzer bereitgestellte Fotos eines Klausurvorschlags mit unterschiedlichen Fallunternehmen und Aufgabenvarianten. Lerntexte sind eigenständig formuliert; Originalbilder und persönliche Angaben werden nicht veröffentlicht. Fehlende Anlagen werden ausdrücklich als fehlend gekennzeichnet. Neue Zahlenbeispiele und die Probeklausur sind Lernmaterial, kein offizieller Erwartungshorizont. Angaben zur Rundung und Prozentbasis stehen in den Lernzetteln.

Offene Antworten werden selbst anhand von Lösungshinweisen bewertet. Die Website verwendet keinen KI-Dienst und benötigt keine API-Schlüssel. Lernmarkierungen und die Quizquote sind Lernhilfen und keine Prüfungsnote. Maßgeblich bleiben die Vorgaben des Unterrichts.

## Datenschutz

Keine Werbung, externen Schriftarten, Analytics oder Drittanbieter-Skripte. Der Lernfortschritt bleibt in `localStorage` des jeweiligen Browsers. Ein manueller Export enthält die Lerndaten. Der jeweilige Hostinganbieter verarbeitet technisch notwendige Zugriffsdaten nach seinen eigenen Bestimmungen.

## Gestaltung

Eigenständiges Redesign mit großen Überschriften, dunklem Hintergrund, Neongelb, CSS-3D-Lernkarten und bewegten Einstiegsbereichen. Die Lerninhalte und der lokale Fortschritt bleiben erhalten. Animationen berücksichtigen die Systemeinstellung „Bewegung reduzieren“. Die Schriftarten Anton und Space Grotesk werden lokal ausgeliefert; ihre SIL Open Font Licenses liegen in `assets/fonts/`.

## Struktur

- `index.html`, `style.css`, `design.css`: Oberfläche und responsive Gestaltung
- `data.js`: Lernzettel, Karten, Quiz und Probeklausur
- `teacher-update.js`: Hauptkurs-Ergänzung und aktualisierte Generalprobe
- `glaeser.js`, `courses.js`, `courses.css`: getrennter Kurs mit eigener Checkliste und Gestaltung
- `math.js`: reine Rechenfunktionen
- `exercises.js`: Aufgabenvarianten und Lösungswege
- `extra-exercises.js`: Kennzahlen, Vorwärts-/Rückwärtskalkulation, Lagervergleich und Deckungsbeitrag
- `app.js`: Navigation, Lernfunktionen und lokaler Fortschritt
- `server.mjs`: lokaler Entwicklungsserver
- `tests/`: fachliche und strukturelle Prüfungen beider Kursprofile
