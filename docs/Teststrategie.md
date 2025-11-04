# Teststrategie – Frontend

Dieses Dokument beschreibt die Teststrategie für das Frontend unseres Projekts.  
Ziel ist es, die Qualität der Benutzeroberfläche sicherzustellen und eine einheitliche Vorgehensweise für das Testen zu definieren.

---

## Zielsetzung

Die Teststrategie soll sicherstellen, dass:

- die Anwendung stabil und zuverlässig funktioniert,  
- zentrale Funktionen korrekt implementiert sind,  
- Benutzerinteraktionen wie erwartet ablaufen,  
- Änderungen keine unbeabsichtigten Nebeneffekte verursachen,  
- und die Benutzerfreundlichkeit dauerhaft gewährleistet bleibt.

---

## Testarten

### 1. **Komponententests**
Überprüfung einzelner Bausteine des Frontends (z. B. Komponenten, Module, Funktionen).  
Ziel ist es, sicherzustellen, dass jede Komponente isoliert korrekt funktioniert und die erwarteten Eingaben und Ausgaben liefert.

### 2. **Integrationstests**
Überprüfung des Zusammenspiels mehrerer Komponenten oder Funktionseinheiten.  
Es wird getestet, ob Datenflüsse und Interaktionen zwischen Modulen wie vorgesehen funktionieren.

### 3. **Systemtests**
Überprüfung der Anwendung als Ganzes aus Sicht des Benutzers.  
Dabei werden typische Nutzungsszenarien getestet, um sicherzustellen, dass alle Teile des Systems zusammen korrekt arbeiten.

### 4. **Usability- und Accessibility-Tests**
Bewertung der Benutzerfreundlichkeit und Barrierefreiheit.  
Ziel ist, dass die Anwendung für alle Nutzergruppen intuitiv, klar und zugänglich bleibt.

---

## Testorganisation

- Tests werden **kontinuierlich während der Entwicklung** erstellt und gepflegt.  
- Jede neue Funktion soll durch passende Tests abgedeckt werden.  
- Fehler, die einmal aufgetreten sind, sollen durch Tests abgesichert werden.  
- Testfälle werden dokumentiert und regelmäßig überprüft.

---

## Testablauf

1. **Vorbereitung**  
   - Definition der Testziele und Testfälle  
   - Festlegung der Testdaten und Voraussetzungen  

2. **Durchführung**  
   - Tests werden in definierten Umgebungen ausgeführt  
   - Ergebnisse werden protokolliert und bewertet  

3. **Auswertung**  
   - Fehler werden dokumentiert, priorisiert und behoben  
   - Nach Fehlerbehebung erfolgt eine erneute Testausführung (Retest)

4. **Abschluss**  
   - Erstellung eines Testberichts  
   - Entscheidung über Freigabe oder weitere Maßnahmen  

---

## Qualitätskriterien

- Jede Kernfunktion ist durch mindestens einen Testfall abgedeckt  
- Kritische Prozesse werden regelmäßig überprüft  
- Akzeptanzkriterien sind eindeutig definiert und testbar  
- Tests sind nachvollziehbar, reproduzierbar und unabhängig  

---

## Testabdeckung

Die Testabdeckung beschreibt den Anteil des Frontends, der durch Tests überprüft wird.  
Ziel ist eine möglichst hohe Abdeckung der wichtigen Funktionen, insbesondere der:

- Geschäftslogik  
- Benutzerinteraktionen  
- Schnittstellen  
- sicherheitsrelevanten Komponenten  

---

## Dokumentation

- Alle Testfälle werden in einem zentralen Verzeichnis dokumentiert  
- Testprotokolle enthalten Informationen zu Testziel, Ergebnis und Status  
- Änderungen an bestehenden Tests werden versioniert  

---

## Verantwortlichkeiten

- **Entwicklungsteam:** Erstellung und Pflege der Tests während der Implementierung  
- **Qualitätssicherung:** Überwachung der Testdurchführung, Bewertung der Ergebnisse  
- **Projektleitung:** Freigabe auf Basis der Testergebnisse  

---

## Testzyklen

Tests werden in verschiedenen Phasen durchgeführt:

| Phase | Ziel | Zeitpunkt |
|-------|------|------------|
| Entwicklungsphase | Überprüfung einzelner Komponenten | Laufend |
| Integrationsphase | Zusammenspiel der Komponenten | Nach Feature-Integration |
| Abnahmephase | Gesamtfunktionalität aus Benutzersicht | Vor Release |
| Wartung | Regression nach Änderungen | Bei jedem Update |

---

## Zusammenfassung

Diese Teststrategie stellt sicher, dass:
- die Qualität des Frontends kontinuierlich überprüft wird,  
- Risiken frühzeitig erkannt und minimiert werden,  
- und die Anwendung langfristig stabil, benutzerfreundlich und wartbar bleibt.

---