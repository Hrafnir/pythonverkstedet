# Bjørnsveen Pythonverksted

Digitalt hefte og Python-laboratorium for matematikk på 8.–10. trinn.

## Innhold

- seks moduler: variabler, vilkår, løkker, funksjoner, simulering og modellering
- arbeidsflyten problemstilling → teori → prøv → observer → oppgave
- progresjonsstiger med små, kjørbare steg fra enkel forståelse til valgfri elegant kode
- søkbar Python-håndbok i Fritt Python-rom med kommandoer, kjørbare eksempler, eksperimenter og feilsøking
- ekte Python i nettleseren ved hjelp av Pyodide
- elevmodus og lærermodus
- lærertips, typiske misforståelser, vurderingsstøtte og utvidelser
- progresjon lagret lokalt på enheten
- utskriftsvennlig heftemodus
- fritt Python-rom med flere lokale prosjekter
- import og eksport av `.py`-filer
- kopiering av kode som formatert tekst eller bilde
- støtte for Pyodide-pakker som NumPy, pandas og Matplotlib
- lokal Turtle-tegning for geometri, mønstre, farger og fyll, med stegvis avspilling, variabel hastighet og høyoppløselig canvas
- kodeeditor med Tab-innrykk, justerbar skriftstørrelse og fullskjerm

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
lager `.app`, `.dmg` og `.pkg` i `../release/macos-arm64`.

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
