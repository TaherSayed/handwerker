
export const SEED_TEMPLATES = [
    {
        name: "Kundenbesichtigung – Allgemein",
        category: "Besichtigung",
        description: "Standardformular für Erstbesichtigungen und Aufnahme von Kundenwünschen.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "section", label: "Kundendaten", required: false },
            { id: "f2", type: "text", label: "Kunde (Name)", required: true },
            { id: "f3", type: "text", label: "Straße", required: true },
            { id: "f4", type: "text", label: "Ort", required: true },
            { id: "f5", type: "text", label: "Telefon", required: true },
            { id: "f6", type: "text", label: "E-Mail", required: false },
            { id: "f7", type: "section", label: "Termin & Wunsch", required: false },
            { id: "f8", type: "dropdown", label: "Terminart", options: ["Fixtermin", "Flexibel", "Sofort"], required: true },
            { id: "f9", type: "notes", label: "Kundenwunsch (Notiz)", required: true },
            { id: "f10", type: "number", label: "Geschätzter Preis (Netto)", required: false },
            { id: "f11", type: "dropdown", label: "Dauer", options: ["1/4 Tag", "1/2 Tag", "3/4 Tag", "1 Tag", "> 1 Tag"], required: true },
            { id: "f12", type: "signature", label: "Unterschrift Kunde", required: true }
        ]
    },
    {
        name: "Baumfällung – Vor-Ort-Besichtigung",
        category: "Baumdienst",
        description: "Aufnahme von Fällarbeiten inkl. Gefahrenanalyse.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "text", label: "Baumart", required: true },
            { id: "f2", type: "number", label: "Höhe (m)", required: true },
            { id: "f3", type: "number", label: "Anzahl", required: true },
            { id: "f4", type: "checkbox", label: "Fällung komplett", required: false },
            { id: "f5", type: "checkbox", label: "Kronensicherung notwendig", required: false },
            { id: "f6", type: "checkbox", label: "Wurzelfräsen erwünscht", required: false },
            { id: "f7", type: "text", label: "Wenn Fräsen: Tiefe (cm)", required: false },
            { id: "f8", type: "dropdown", label: "Entsorgung", options: ["Häckselgut", "Stammholz", "Alles", "Keine"], required: true },
            { id: "f9", type: "checkbox", label: "Genehmigung erforderlich", required: false },
            { id: "f10", type: "number", label: "Preis Netto (€)", required: true },
            { id: "f11", type: "signature", label: "Auftragserteilung Unterschrift", required: true }
        ]
    },
    {
        name: "Baumpflege & Rückschnitt",
        category: "Baumdienst",
        description: "Pflegemaßnahmen, Totholzentfernung und Kronensicherung.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "text", label: "Baumart", required: true },
            { id: "f2", type: "dropdown", label: "Maßnahme", options: ["Rückschnitt", "Auslichtung", "Totholzentfernung", "Kronenpflege"], required: true },
            { id: "f3", type: "number", label: "Höhe (m)", required: false },
            { id: "f4", type: "checkbox", label: "Zugang frei möglich?", required: false },
            { id: "f5", type: "dropdown", label: "Bühne benötigt", options: ["Keine", "3,5t LKW", "7,5t LKW", "Kettenbühne", "Hubsteiger"], required: false },
            { id: "f6", type: "date", label: "Gewünschter Termin", required: false },
            { id: "f7", type: "number", label: "Preis Netto (€)", required: true }
        ]
    },
    {
        name: "Gartenpflege – Angebot",
        category: "Gartenbau",
        description: "Angebotserstellung für allgemeine Pflegearbeiten.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "number", label: "Fläche (m²)", required: true },
            { id: "f2", type: "dropdown", label: "Leistung", options: ["Rasen mähen", "Heckenschnitt", "Beetpflege", "Laubentfernung", "Komplettpflege"], required: true },
            { id: "f3", type: "dropdown", label: "Häufigkeit", options: ["Einmalig", "Wöchentlich", "14-tägig", "Monatlich"], required: true },
            { id: "f4", type: "checkbox", label: "Mit Entsorgung", required: false },
            { id: "f5", type: "date", label: "Starttermin", required: false },
            { id: "f6", type: "number", label: "Preis Netto (€)", required: true }
        ]
    },
    {
        name: "Wurzelfräsung",
        category: "Baumdienst",
        description: "Spezifisches Formular für Fräsarbeiten.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "number", label: "Anzahl Wurzeln", required: true },
            { id: "f2", type: "number", label: "Durchmesser (cm)", required: true },
            { id: "f3", type: "number", label: "Tiefe (cm)", required: false },
            { id: "f4", type: "checkbox", label: "Zugang min. 90cm breit?", required: false },
            { id: "f5", type: "number", label: "Preis pro Stück (€)", required: false },
            { id: "f6", type: "number", label: "Gesamtpreis (€)", required: true }
        ]
    },
    {
        name: "Sturmschaden – Soforteinsatz",
        category: "Notdienst",
        description: "Dokumentation von Sturmschäden für Versicherungen.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "text", label: "Schadenart", required: true },
            { id: "f2", type: "checkbox", label: "Gefahr im Verzug / Akut?", required: true },
            { id: "f3", type: "photo", label: "Foto des Schadens", required: true },
            { id: "f4", type: "notes", label: "Durchgeführte Sofortmaßnahme", required: true },
            { id: "f5", type: "checkbox", label: "Nacharbeit erforderlich?", required: false },
            { id: "f6", type: "signature", label: "Unterschrift Auftraggeber", required: true }
        ]
    },
    {
        name: "Einsatzbericht – Tagesbericht",
        category: "Allgemein",
        description: "Tägliche Dokumentation der geleisteten Arbeiten.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "text", label: "Mitarbeiter (Namen)", required: true },
            { id: "f2", type: "number", label: "Einsatzdauer (Std)", required: true },
            { id: "f3", type: "notes", label: "Ausgeführte Tätigkeiten", required: true },
            { id: "f4", type: "notes", label: "Besonderheiten / Vorkommnisse", required: false },
            { id: "f5", type: "notes", label: "Materialverbrauch", required: false },
            { id: "f6", type: "checkbox", label: "Kunde war anwesend", required: false },
            { id: "f7", type: "signature", label: "Unterschrift Mitarbeiter / Kunde", required: true }
        ]
    },
    {
        name: "Maschineneinsatz",
        category: "Fuhrpark",
        description: "Erfassung von Maschinenstunden für Abrechnung.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "text", label: "Maschine / Gerät", required: true },
            { id: "f2", type: "number", label: "Betriebsstunden", required: true },
            { id: "f3", type: "checkbox", label: "Transport nötig gewesen?", required: false },
            { id: "f4", type: "text", label: "Bediener", required: true },
            { id: "f5", type: "number", label: "Kostenstelle / Betrag", required: false }
        ]
    },
    {
        name: "Geräteeinsatz & Werkzeuge",
        category: "Fuhrpark",
        description: "Checkliste für genutztes Equipment.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "checkbox", label: "Motorsäge klein", required: false },
            { id: "f2", type: "checkbox", label: "Motorsäge groß", required: false },
            { id: "f3", type: "checkbox", label: "Laubbläser", required: false },
            { id: "f4", type: "checkbox", label: "Freischneider", required: false },
            { id: "f5", type: "checkbox", label: "Leiter", required: false },
            { id: "f6", type: "checkbox", label: "Arbeitsbühne", required: false },
            { id: "f7", type: "checkbox", label: "Fahrzeug inkl. Anhänger", required: false },
            { id: "f8", type: "number", label: "Zusatzkosten / Verschleiß (€)", required: false }
        ]
    },
    {
        name: "Personalplanung Einsatz",
        category: "Verwaltung",
        description: "Planung von Personalstärken und Qualifikationen.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "number", label: "Anzahl Mitarbeiter", required: true },
            { id: "f2", type: "dropdown", label: "Qualifikation Leiter", options: ["Meister", "Vorarbeiter", "Geselle"], required: true },
            { id: "f3", type: "checkbox", label: "SKT-A Schein nötig", required: false },
            { id: "f4", type: "checkbox", label: "SKT-B Schein nötig", required: false },
            { id: "f5", type: "checkbox", label: "ETW Qualifikation nötig", required: false },
            { id: "f6", type: "number", label: "Geplante Einsatzdauer (h)", required: true },
            { id: "f7", type: "number", label: "Geplante Pause (min)", required: false }
        ]
    },
    {
        name: "Angebot – Kurzfassung",
        category: "Verkauf",
        description: "Schnelles Angebot direkt beim Kunden.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "notes", label: "Leistungsbeschreibung", required: true },
            { id: "f2", type: "number", label: "Preis Netto (€)", required: true },
            { id: "f3", type: "dropdown", label: "MwSt Satz", options: ["19%", "7%", "0%"], required: true },
            { id: "f4", type: "number", label: "Gesamtpreis Brutto (€)", required: true },
            { id: "f5", type: "date", label: "Gültig bis", required: true },
            { id: "f6", type: "signature", label: "Unterschrift zur Beauftragung", required: true }
        ]
    },
    {
        name: "Nachtrag zum Angebot",
        category: "Verkauf",
        description: "Erfassung von Zusatzleistungen während der Arbeit.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "text", label: "Grund für Nachtrag", required: true },
            { id: "f2", type: "notes", label: "Zusatzleistung Beschreibung", required: true },
            { id: "f3", type: "number", label: "Zusatzpreis (€)", required: true },
            { id: "f4", type: "checkbox", label: "Kunde stimmt zu", required: true },
            { id: "f5", type: "signature", label: "Unterschrift Kunde", required: true }
        ]
    },
    {
        name: "Entsorgungsnachweis",
        category: "Logistik",
        description: "Nachweis über entsorgtes Grüngut oder Stammholz.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "dropdown", label: "MaterialArt", options: ["Grünschnitt", "Stammholz", "Wurzelstöcke", "Bauschutt", "Erdreich"], required: true },
            { id: "f2", type: "number", label: "Menge (m³ oder t)", required: true },
            { id: "f3", type: "dropdown", label: "Entsorgungsweg", options: ["Deponie", "Kompostierung", "Kundenlager", "Brennholzverkauf"], required: true },
            { id: "f4", type: "checkbox", label: "Wipperschein / Nachweis vorhanden", required: false }
        ]
    },
    {
        name: "Genehmigungscheck",
        category: "Verwaltung",
        description: "Prüfung behördlicher Auflagen vor Arbeitsbeginn.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "text", label: "Zuständige Behörde", required: true },
            { id: "f2", type: "checkbox", label: "Baumschutzsatzung relevant?", required: true },
            { id: "f3", type: "checkbox", label: "Fällgenehmigung beantragt?", required: false },
            { id: "f4", type: "text", label: "Aktenzeichen (falls vorhanden)", required: false },
            { id: "f5", type: "dropdown", label: "Status", options: ["Offen", "Genehmigt", "Abgelehnt"], required: true }
        ]
    },
    {
        name: "Abnahmeprotokoll",
        category: "Projekt",
        description: "Offizielle Abnahme der Arbeiten durch den Kunden.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "checkbox", label: "Leistung vollständig erbracht?", required: true },
            { id: "f2", type: "notes", label: "Festgestellte Mängel / Restarbeiten", required: false },
            { id: "f3", type: "checkbox", label: "Baustelle sauber verlassen?", required: true },
            { id: "f4", type: "text", label: "Abgenommen durch (Name)", required: true },
            { id: "f5", type: "signature", label: "Unterschrift Abnahme", required: true }
        ]
    },
    {
        name: "Reklamation",
        category: "Kundenservice",
        description: "Aufnahme von Kundenbeschwerden oder Mängeln.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "text", label: "Grund der Beanstandung", required: true },
            { id: "f2", type: "photo", label: "Foto des Mangels", required: true },
            { id: "f3", type: "notes", label: "Lösungsvorschlag / Maßnahme", required: true },
            { id: "f4", type: "checkbox", label: "Sofort erledigt?", required: false },
            { id: "f5", type: "date", label: "Termin zur Behebung", required: false }
        ]
    },
    {
        name: "Wartungsvertrag – Erstaufnahme",
        category: "Verkauf",
        description: "Datenaufnahme für neue Pflegeverträge.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "text", label: "Objekt / Adresse", required: true },
            { id: "f2", type: "notes", label: "Wartungsumfang (detailliert)", required: true },
            { id: "f3", type: "dropdown", label: "Intervall", options: ["Wöchentlich", "14-tägig", "Monatlich", "Vierteljährlich", "Jährlich"], required: true },
            { id: "f4", type: "date", label: "Vertragsbeginn", required: true },
            { id: "f5", type: "number", label: "Pauschalpreis pro Wartung (€)", required: true }
        ]
    },
    {
        name: "Sicherheitsunterweisung",
        category: "HR / Sicherheit",
        description: "Dokumentation der UVV und Sicherheitsbelehrung.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "text", label: "Teilnehmende Mitarbeiter", required: true },
            { id: "f2", type: "text", label: "Thema der Unterweisung", required: true },
            { id: "f3", type: "dropdown", label: "Art", options: ["Erstunterweisung", "Wiederholung", "Anlassbezogen"], required: true },
            { id: "f4", type: "signature", label: "Unterschrift Unterweisender", required: true },
            { id: "f5", type: "signature", label: "Unterschrift Teilnehmer", required: true }
        ]
    },
    {
        name: "Materialbedarf Einsatz",
        category: "Logistik",
        description: "Anforderung von Material für kommende Baustellen.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "text", label: "Benötigtes Material", required: true },
            { id: "f2", type: "number", label: "Menge", required: true },
            { id: "f3", type: "dropdown", label: "Einheit", options: ["Stück", "Sack", "Palette", "m³", "lfm"], required: true },
            { id: "f4", type: "number", label: "Geschätzte Kosten", required: false },
            { id: "f5", type: "dropdown", label: "Beschaffung", options: ["Aus Lager", "Bestellung nötig", "Kauf Baumarkt"], required: true }
        ]
    },
    {
        name: "Visitenkartenübergabe",
        category: "Marketing",
        description: "Tracking von Akquise-Gesprächen.",
        workspace_id: "default",
        fields: [
            { id: "f1", type: "checkbox", label: "Visitenkarte übergeben?", required: true },
            { id: "f2", type: "text", label: "Ansprechpartner", required: false },
            { id: "f3", type: "dropdown", label: "Interesse an Folgeauftrag", options: ["Hoch", "Mittel", "Gering", "Keins"], required: true },
            { id: "f4", type: "checkbox", label: "Rückruf erwünscht?", required: false },
            { id: "f5", type: "date", label: "Wiedervorlage Datum", required: false }
        ]
    }
];
