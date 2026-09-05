# Skolepython 0.17.1

Fra Bjørnsveen: Python-arbeidsflate og læringshefte for matematikk på 8.–10. trinn.

## Editorrettelse i 0.17.1

Markør, tekstlag og linjenummer bruker samme linjehøyde, også ved endret skriftstørrelse og rulling. Feilmarkeringen flytter ikke teksten.

Kodeforslag vises ved markøren med svak forhåndsvisning av resten av ordet. **Tab/Enter** bruker forslaget, **↑/↓** velger og **Esc** lukker. **Ctrl+Space** åpner forslag manuelt. Fullføring tar hensyn til lokale variabler/funksjoner, kjente bibliotekimporter og aliaser, og enkle liste-/tekstvariabler. Den lokale katalogen omfatter vanlige skolekommandoer; dette er ikke PyCharms komplette Python-analyse. Forslag vises ikke inne i kommentarer eller tekststrenger.

## Arbeidsflyt

Appen åpner direkte i **Kode** og gjenoppretter det aktive lokale prosjektet. Kjør med knappen ved editoren eller **Ctrl/⌘ Enter**. En synlig **Stopp** avbryter Python. Resultatfeltet samler utskrift, grafikk, variabler og stegvis gjennomgang.

- **Kode:** prosjekter, flere Python-filer og datafiler. Prosjektvalg ligger øverst; filverktøy åpnes med **Filer**.
- **Lær:** ti moduler med **Forstå → Forutsi → Prøv → Forklar → Oppgave**, mål, forkunnskaper og kontrolltilfeller. Listestoffet kommer tidligere i anbefalt rekkefølge. Pygame velges som arbeidsmiljø eller fra Snake-modulen.
- **Øv:** 19 utfordringer og åtte egenproduserte eksamensoppgaver, med hintestiger, forklaringer og grenseverdier å teste.
- **Lærer:** lærerveiledning, vanlige misforståelser, vurderingsstøtte og læreplankoblinger.
- **Hjelp:** ett søk i 143 kommandoer, 27 oppskrifter, 16 byggeklosser, 24 fordypningsemner og 38 bibliotekguider. Avansert stoff er mindre framtredende.

**Prøv i nytt eksempel** bevarer det åpne prosjektet. **Sett inn ved markøren** beholder resten av programmet. Erstatning kan angres; **Flere verktøy → Gjenopprett forrige utkast** henter siste lokale kopi for arbeidsområdet, også etter oppfriskning. De siste 20 erstatningene beholdes samlet. Modulutkast, forutsigelser og datafiler lagres lokalt.

På mindre skjermer brukes fanene Oppgave/Kode/Resultat/Hjelp. **Fokus** gir mer plass til koden. Tab gir innrykk; **Esc, deretter Tab** flytter tastaturfokus ut av editoren. **Appmeny → Skriv ut hefte** bruker det samme modulinnholdet som skjermen.

## Hva tilbakemeldingen betyr

Oppgavesjekken krever en ny, vellykket kjøring av gjeldende kode. Tekstsøk og utskrift er veiledende spor, ikke bevis på korrekt algoritme eller forståelse. De oppgitte testtilfellene prøves manuelt; tilfeldig og grafisk resultat må også forklares. «Fullført» er elevens egenvurdering.

Feilhjelpen skiller kode fra kommentarer og tekststrenger. Den gir spørsmål og tips om blant annet syntaks, innrykk, ukjente navn, filer, listeindeks, deling på null og manglende biblioteker.

## Lokal utvikling og kontroll

Krever Node.js 22.13 eller nyere. Python 3 brukes av innholdstesten; uten Python blir den testen eksplisitt hoppet over.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run test:e2e
```

`npm test` bygger appen og kjører regresjons- og innholdstester. Innholdskontrollen syntaksanalyserer alle 300 samlede eksempler og kjører standardeksempler med nødvendige datafiler. Eksempler med interaktiv input eller egne/grafiske tredjepakker er utelatt fra denne lokale kjørekontrollen; nettlesertestene dekker representative faktiske Pyodide-kjøringer.

`npm run test:e2e` bruker Chromium og lokal preview på port 4173. Første kjøring krever installert Playwright-nettleser. Suiten dekker input, pakker, grafikk, editor, hjelp, lagring, stopp, navigasjon og flere skjermstørrelser.

## Kildeorganisering

- `app/page.tsx`: arbeidsflatens tilstand, navigasjon, kjøring og eksisterende grafikkverktøy.
- `app/components/`: editor, læringspanel, øvingspanel, samlet hjelp, lærerveiledning og utskrift.
- `app/content/`: moduler, hjelp, læreplankoblinger, læringsrekkefølge og kontrolltilfeller.
- `app/lib/`: ren editor-/feilanalyse, lokal lagring og felles eksempeldata.
- `app/studio.css`: arbeidsflatens utforming og responsive regler.

Hjelp og lærerveiledning lastes ved behov. Python kjører fortsatt isolert i en ny webarbeider per program. Pygame har sin egen spillflate.

## Nettutgave og Mac

`npm run build:github` lager den statiske appen i `github-dist`. GitHub Pages-arbeidsflyten publiserer ved oppdatering av `main`. Lokale endringer er ikke automatisk publisert.

Nettutgaven laster Python-motor og pakker ved behov. Kode, data og progresjon behandles lokalt. Filer som programmet oppretter under kjøring er midlertidige; bruk nedlasting/eksport i appen for å beholde resultater.

Mac-utgaven bruker lokal Pyodide og blokkerer eksterne nettverksforespørsler. Se `desktop/IT-README.txt` for pakking og signering. For isolert offline-kontroll uten å installere en ny app:

```bash
npm run build
node scripts/prepare-desktop-dev.mjs
BJORNSVEEN_SMOKE_TEST=1 node_modules/.bin/electron desktop/main.mjs
```

Testen bruker et eget midlertidig brukerområde. Distribusjonspakker bygges separat med `npm run desktop:build` og kontrolleres med `npm run desktop:test-release`.
