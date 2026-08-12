# Bjørnsveen Pythonverksted

Digitalt hefte og Python-laboratorium for matematikk på 8.–10. trinn.

## Innhold

- seks moduler: variabler, vilkår, løkker, funksjoner, simulering og modellering
- arbeidsflyten problemstilling → teori → prøv → observer → oppgave
- ekte Python i nettleseren ved hjelp av Pyodide
- elevmodus og lærermodus
- lærertips, typiske misforståelser, vurderingsstøtte og utvidelser
- progresjon lagret lokalt på enheten
- utskriftsvennlig heftemodus
- fritt Python-rom med flere lokale prosjekter
- import og eksport av `.py`-filer
- kopiering av kode som formatert tekst eller bilde
- støtte for Pyodide-pakker som NumPy, pandas og Matplotlib

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
