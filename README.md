# BRC Lernwelt

Eine responsive deutschsprachige Lernwebsite für die BRC-Vorabiturvorbereitung. Läuft ohne Installation externer Pakete als statische Website auf GitHub Pages oder mit jedem statischen Webserver.

## Inhalte und Funktionen

- Lernzettel zu Kostenrechnung, Beschaffung, Lager, Personal, Führung und Klausurtechnik
- Suchfunktion und Themenfilter
- Karteikarten mit eigener Einschätzung und Wiederholung unsicherer Karten
- Wissensquiz mit sofortiger Begründung und Auswertung
- Sechs Rechenaufgabentypen mit je drei Varianten und vollständigen Rechenwegen
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

## Struktur

- `index.html`, `style.css`: Oberfläche und responsive Gestaltung
- `data.js`: Lernzettel, Karten, Quiz und Probeklausur
- `math.js`: reine Rechenfunktionen
- `exercises.js`: Aufgabenvarianten und Lösungswege
- `app.js`: Navigation, Lernfunktionen und lokaler Fortschritt
- `server.mjs`: lokaler Entwicklungsserver
- `tests/math.test.mjs`: fachliche und strukturelle Prüfungen
