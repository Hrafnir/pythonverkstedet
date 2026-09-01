# Skolepython

Fra Bjørnsveen: digitalt hefte og Python-laboratorium for matematikk på 8.–10. trinn.

## Innhold

- ti moduler fra variabler og vilkår til Turtle, spill, datafiler og eksamensklare funksjonsgrafer
- arbeidsflyten problemstilling → teori → prøv → observer → oppgave
- progresjonsstiger med små, kjørbare steg fra enkel forståelse til valgfri elegant kode
- søkbar Python-håndbok i Python-rommet med kommandoer, kjørbare eksempler, eksperimenter og feilsøking
- kontekstnære mini-tutorials som kan holdes åpne mens eleven skriver kode
- ekte Python i nettleseren ved hjelp av Pyodide
- elevmodus og lærermodus
- lærertips, typiske misforståelser, vurderingsstøtte og utvidelser
- progresjon lagret lokalt på enheten
- utskriftsvennlig heftemodus
- fritt Python-rom med flere lokale prosjekter og flere `.py`-filer i hvert prosjekt
- import og eksport av `.py`-filer
- lokal import av `.txt`- og `.csv`-filer som kan leses med `open`, `csv` eller pandas
- kopiering av kode som formatert tekst eller bilde
- støtte for Pyodide-pakker som NumPy, pandas, Matplotlib og pygame-ce
- egen Pygame-lab med spillcanvas, spillbart startpunkt, bildefangst og pedagogisk oppskrift
- lokal Turtle-tegning for geometri, mønstre, farger og fyll, med stegvis avspilling, variabel hastighet og høyoppløselig canvas
- Skaperverksted-meny med ekte SVG-eksport i millimeter, farge- og tykkelsesvalg, senterlinje, ytterlinjer og lukket kutteomriss
- kodeeditor med linjenummer, Tab- og automatisk innrykk, kodeforslag, tydelig feilmarkering, justerbar skriftstørrelse og fullskjerm
- variabelutforsker, kjøring av markerte linjer og enkel stegvis gjennomgang av programmet
- skrivelab med tydelig skille mellom koden eleven skal skrive, forklaringen og praktiske handlinger
- strukturert tilbakemelding via brukerens eget e-postprogram; meldinger sendes ikke av appen

## Lokal utvikling

Krever Node.js 22 eller nyere.

```bash
npm install
npm run dev
```

## Kontroll

```bash
npm test
```

## GitHub Pages

```bash
npm run build:github
```

Den statiske appen bygges i `github-dist`. Arbeidsflyten i `.github/workflows/deploy-pages.yml` publiserer automatisk når `main` blir oppdatert.

Første Python-kjøring laster Pyodide fra jsDelivr. Deretter kjøres elevens kode i en webarbeider i nettleseren. Appen sender ikke kode eller progresjon til en egen server.

## Offline Mac-utgave

Mac-utgaven bygges for Apple Silicon/ARM64 og inneholder Python-motoren og den
kuraterte skolepakken lokalt. Den blokkerer eksterne nettverksforespørsler og
lager `.app`, `.dmg` og `.pkg` i `../release/macos-arm64`. Pygame og de andre
annonserte pakkene følger med og kan kjøres uten internett.

```bash
npm run desktop:build
```

Første bygg laster ned de låste Pyodide-filene og kontrollerer pakkefilenes
SHA-256-kontrollsummer. Produksjonsbygg kan signeres ved å sette
`MAC_APP_IDENTITY` og `MAC_INSTALLER_IDENTITY`. Se `desktop/IT-README.txt`.

Hver læringsmodul har to editorfaner: en tom «Skriv selv»-lab med konkrete
skriveinstruksjoner og en redigerbar «Fasit». Kode og resultat kan kopieres
samlet som formatert tekst eller bilde. Det felles kode- og grafikonet i
`public/brand` brukes som favicon, merke i nettsiden og `.icns`-ikon i Mac-pakken.
