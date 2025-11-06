## Vergleich: React vs Angular für Frontend‑Testing

### Einleitung

Beim Entwickeln von Web‑Anwendungen gehören Tests einfach dazu. Sie helfen dabei, Fehler früh zu finden und sicherzustellen, dass die Anwendung zuverlässig funktioniert. Sowohl React als auch Angular bringen Werkzeuge mit, um Komponenten, Nutzeraktionen und Datenlogik zu testen.

Im Folgenden schauen wir uns an, wie das Testen mit beiden Frameworks funktioniert, welche Vorteile sie jeweils bieten und wie sich das Ganze im Alltag anfühlt. Erst am Schluss folgt die Entscheidung.

---

### Was man im Frontend testet

**Komponenten‑Tests:** Funktioniert eine einzelne Komponente so, wie sie soll? Wird sie richtig angezeigt, reagieren Buttons korrekt, ändern sich Werte?

**UI‑Interaktionen:** Klicks, Eingaben, Navigation – also das, was Nutzer machen.

**State & Hooks:** Logik, die in Hooks oder globalem State steckt (z. B. API‑Requests oder Berechnungen).

**API‑Tests:** Steuerung von Datenabrufen, Laden‑Zustände, Fehlermeldungen.

**Integrationstests:** Zusammenspiel mehrerer Teile – z. B. Login und anschliessendes Laden von Daten.

**E2E‑Tests:** Kompletter Nutzer‑Flow im Browser, z. B. mit Cypress.

---

### React: Vorteile beim Testen

React fühlt sich beim Testen meist sehr direkt an. Man schreibt schnell einfache Tests und konzentriert sich dabei auf das, was Nutzer wirklich tun. Durch Tools wie Jest und React Testing Library kann man Tests oft ohne viel Setup schreiben. Das spart Zeit und ist übersichtlich.

Ein typischer Test könnte prüfen: *Wenn der Nutzer auf den Button klickt, erscheint die richtige Meldung.* So bleibt der Fokus auf der tatsächlichen Funktion, nicht auf Framework‑Details.

**Kurz gesagt:** schnell, flexibel, praxisnah.

#### Nachteile

React gibt weniger Struktur vor. Man muss also selbst entscheiden, welche Tools man nutzt und wie man Tests organisiert. Das ist flexibel, kann aber am Anfang ein wenig Orientierung erfordern.

---

### Angular: Vorteile beim Testen

Angular bringt von Haus aus ein komplettes Test‑Setup mit. Alles ist schon integriert: Karma, Jasmine, TestBed. Das gibt Klarheit und feste Abläufe, was vor allem in grossen Teams hilfreich ist.

Wenn die Anwendung sehr gross und der Code stark strukturiert ist, sorgt Angular dafür, dass alle mit denselben Tools arbeiten.

#### Nachteile

Tests in Angular fühlen sich oft technischer an. Man braucht mehr Konfiguration und es dauert länger, bis alles läuft. Besonders bei Änderungen kann es vorkommen, dass Tests schneller brechen.

---

### Kurzer Vergleich

| Thema           | React           | Angular             |
| --------------- | --------------- | ------------------- |
| Einstieg        | Schnell         | Komplexer           |
| Test‑Tools      | Jest, RTL       | Jasmine, Karma      |
| Geschwindigkeit | Sehr schnell    | Teilweise langsamer |
| Fokus           | Nutzerverhalten | Framework‑Struktur  |
| Flexibilität    | Hoch            | Fester Rahmen       |
| Lernaufwand     | Mittel          | Höher               |

---

### Fazit

Beide Frameworks können gut getestet werden. Angular hat klare Strukturen und eignet sich besonders für riesige, sehr formale Projekte.

React dagegen fühlt sich beim Testen leichter und natürlicher an. Man konzentriert sich mehr auf das, was später wirklich zählt: das Verhalten in der Anwendung.

---

### Entscheidung

In unserem Projekt wollen wir schnell und flexibel arbeiten, ohne viel Zeit in Setup oder komplizierte Framework‑Mechanik zu stecken.

Darum setzen wir hier auf **React**.

Die Tests lassen sich schneller schreiben, sind verständlicher und bleiben stabil, wenn sich etwas ändert. Neue Leute finden sich einfacher zurecht und wir können uns mehr auf die Funktion als auf das Drumherum konzentrieren.

Kurz: Für unseren Arbeitsstil passt React einfach besser.
