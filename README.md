# Python i matematikk på ungdomstrinnet

Dette prosjektet er et arbeidsgrunnlag for et kort, praktisk hefte for matematikklærere på ungdomstrinnet. Hovedmålet er å gjøre lærerne trygge nok til å undervise i — og vurdere — programmering slik læreplanen faktisk krever.

## Hva som er nytt fra 1. august 2026

Den reviderte læreplanen **MAT01-06** erstatter MAT01-05. De eksisterende programmeringsmålene på 8., 9. og 10. trinn er videreført. Det nye, konkrete målet etter 10. trinn er at eleven skal kunne:

> lese og forklare tekstbasert programkode i Python

Dette er et krav om kodeforståelse. Formuleringen sier ikke at eleven skal kunne utvikle store programmer fra bunnen av. For å kunne lese og forklare kode trenger eleven likevel et lite, funksjonelt ordforråd i Python og trening i å følge programflyten steg for steg.

Se [læreplangrunnlaget](hefte/00-laereplangrunnlag.md) for en sammenligning av gammel og ny plan.

## Foreslått hefte

Arbeidstittel: **Python uten panikk — kodeforståelse for matematikklærere på ungdomstrinnet**

Målgruppe: Matematikklærere som ikke har programmert før, med oppgaver som kan brukes direkte med elever.

Foreslått omfang: 35–50 sider, 6 korte moduler og et oppgave-/fasitkapittel.

1. Les kode som en oppskrift
2. Verdier, variabler og regneuttrykk
3. Valg med `if`, `elif` og `else`
4. Gjentakelser med `for` og `while`
5. Funksjoner, tabeller og grafer
6. Simulering av sannsynlighet
7. Feilsøking, vurdering og ferdige undervisningsopplegg

Hver modul bør ha samme rytme:

1. Et matematisk problem
2. Et kort kodeeksempel
3. Linje-for-linje-forklaring
4. En sportabell som viser verdiene underveis
5. Vanlige misforståelser
6. Tre oppgaver: lese, endre og lage
7. Kort fasit og forslag til vurdering

Første utkast til modul 1 ligger i [Les og forklar Python-kode](hefte/01-les-og-forklar-python.md).

## Minimum lærerne trenger å mestre

Et realistisk minimum er å kunne:

- kjenne igjen variabler, tall, tekst og sannhetsverdier
- forklare tilordning (`=`) og skille den fra sammenligning (`==`)
- regne ut uttrykk med `+`, `-`, `*`, `/`, `//`, `%` og `**`
- følge rekkefølgen i et program og holde rede på hvordan verdier endres
- forklare vilkår og innrykk i `if`/`else`
- følge en `for`- eller `while`-løkke steg for steg
- forstå en enkel funksjon med parameter og `return`
- lese lister og enkel bruk av `range`
- forklare hva programmet undersøker matematisk, ikke bare hva hver kodelinje gjør
- oppdage enkle logiske feil og vurdere om resultatet er rimelig

Biblioteker som NumPy, Pandas og avansert objektorientering er ikke nødvendige for å nå det nye kompetansemålet.

## Forslag til kursløp for kollegiet

Heftet kan brukes i tre økter à 90 minutter:

- **Økt 1:** Variabler, uttrykk og sportabeller
- **Økt 2:** Vilkår og løkker i algebra, funksjoner og mønstre
- **Økt 3:** Sannsynlighetssimulering, feilsøking og vurdering av elevforklaringer

Etter hver økt prøver lærerne én aktivitet med elever og tar med ett anonymisert elevarbeid tilbake til kollegiet.

## Mulig app

Anbefalingen er å ferdigstille og prøve ut 15–20 gode kodeforståelsesoppgaver før vi bygger appen. Da blir heftet innholdsfasiten, og appen kan gjenbruke de samme eksemplene.

En liten førsteversjon bør være en nettapp som virker på Chromebook/nettbrett uten innlogging og har:

- kodevindu med én markert linje om gangen
- sportabell der brukeren forutsier neste verdi
- spørsmålene «Hva skjer?», «Hvorfor?» og «Hva blir skrevet ut?»
- umiddelbar tilbakemelding og forklaring
- lærermodus med fasit og kobling til kompetansemål
- oppgaver som kan brukes uten at kode kjøres på en ekstern server

Vi bør vente med brukerkontoer, elevdata, KI-funksjoner og en full kodeeditor til kjerneopplegget er testet i klasserommet.

## Webappen

En førsteversjon av **Pythonverkstedet** ligger i mappen [`webapp`](webapp). Den inneholder:

- seks moduler som følger mønsteret problemstilling → teori → prøv → observer → oppgave
- en Python-motor som kjører elevens kode lokalt i nettleseren
- fem sekunders sikkerhetsstopp for programmer som ikke avsluttes
- elevmodus og lærermodus
- lærertips, typiske misforståelser, vurderingsstøtte og utvidelsesoppgaver
- lokal progresjon uten elevkonto eller innsending av elevdata
- utskriftsvennlig visning av hefteteksten
- automatisk publiseringsoppsett for GitHub Pages

Lokalt kan appen startes fra `webapp` med `npm run dev`. Den statiske GitHub Pages-versjonen bygges med `npm run build:github`.

## Offisielle kilder

- [Udir: Endring av læreplanen i matematikk 1.–10. trinn](https://www.udir.no/laring-og-trivsel/lareplanverket/endringer/endring-lareplanen-matematikk-1-10-trinn/)
- [Udir: Kompetansemål etter 8. trinn, MAT01-06](https://www.udir.no/lk20/mat01-06/kompetansemaal-og-vurdering/kv1027?lang=nob)
- [Udir: Kompetansemål etter 9. trinn, MAT01-06](https://www.udir.no/lk20/mat01-06/kompetansemaal-og-vurdering/kv1028?lang=nob)
- [Udir: Kompetansemål etter 10. trinn, MAT01-06](https://www.udir.no/lk20/mat01-06/kompetansemaal-og-vurdering/kv1029?lang=nob)
- [Udir: Grunnleggende ferdigheter, MAT01-06](https://www.udir.no/lk20/mat01-06/om-faget/grunnleggende-ferdigheter?lang=nob)
