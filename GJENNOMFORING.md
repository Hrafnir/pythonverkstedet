# Gjennomføring · Skolepython 0.17.0

5. september 2026. Lokal oppdatering basert på `FORBEDRINGSPLAN.md`. Ingen publisering eller installasjon over brukerens eksisterende Mac-app er utført.

## Resultatet

Kode er nå appens inngang. Prosjektvalg, kodeflate, kjøring og resultat har faste plasser. Hovednavigasjonen er Kode, Lær, Øv og Lærer, med stabile hash-adresser og støtte for tilbakeknappen. Hjelp samler kommandoer, oppskrifter, byggeklosser, håndbok og biblioteker i ett søk. På smalere skjermer brukes faner; store skjermer viser paneler ved siden av hverandre.

Typografien bruker fungerende lokale sans-serif- og monospace-fonter. Arbeidsflaten har et roligere grønt uttrykk, færre rammer og tydeligere handlingshierarki. Kjøring kan stoppes. Menyer lukkes etter valg. Tastaturbruk har kjøresnarvei, fokusretur og en vei ut av editorens Tab-innrykk.

Prosjekter gjenåpnes ved oppfriskning. Modulutkast, forutsigelser og datafiler lagres lokalt. Innsetting/erstatning kan angres, og siste erstatning kan gjenopprettes fra menyen. Nye hjelpeeksempler får egne prosjekter og nødvendige eksempeldata.

## Undervisning og hjelp

Alle ti moduler bruker Forstå → Forutsi → Prøv → Forklar → Oppgave. De har forkunnskaper, mål, tidsanslag, kontrolltilfeller og valgfri videreføring. Listegrunnlaget er flyttet tidligere i anbefalt rekkefølge, og liste/TXT/CSV er skilt i deløkter.

- Modul 1 starter kort, med sportabell og valgfri utvidelse.
- Modul 3 har en egen while-oppskrift som forklarer stoppvilkåret.
- Modul 7 prioriterer åttekant og vinkelforklaring; farger og SVG er videreføring.
- Modul 8 skiller utforsking av ferdig Snake-bibliotek fra egen implementering i Pygame.
- Modul 9 starter med en kort graf. Den omfattende grafmalen er et senere delsteg. Alle progresjonstrinn har nødvendige importer og data.
- Alle 19 utfordringer og åtte eksamensoppgaver har synlige kontrolltilfeller og supplerende grenseverdier/faglige avklaringer.
- Pygame-stegene bruker flerliniers vilkår, og de seks stegene beholder nytt stoff, observasjon og eksperimenter.
- Hjelpen prioriterer praktiske oppskrifter. Avanserte bibliotekguider er tilgjengelige gjennom søk og «Også videre stoff».
- Fire ufullstendige Matplotlib-oppslag er gjort selvstendige. Kvartiloppskriften avklarer metode, og typing-guiden viser at eksemplet bruker innebygde typehint.
- Utskriftsheftet henter samme modulinnhold som appen og inneholder lærertips. README og en egen brukerveiledning er oppdatert.

## Pålitelig tilbakemelding

Editoranalysen maskerer tekststrenger og kommentarer, inklusive flere linjer. Gyldige sammenligninger, lister og typografiske tegn inne i tekst får ikke de tidligere feilrettingene. Feilhjelpen dekker også indeksfeil, deling på null og manglende biblioteker.

En vurdering krever siste vellykkede kjøring av gjeldende kode. Teksttreff gir veiledende råd og omtales ikke som bevis på en korrekt løsning. Kontrolltilfeller prøves manuelt; grafikk, simulering og forklaringer har eksplisitt egenvurdering. Fullført-markeringen er elevens egen vurdering.

## Teknisk oppdeling

`page.tsx` er redusert fra 8355 til omtrent 2500 linjer. Editor, læringspaneler, hjelp, lærer- og utskriftsvisning er egne komponenter. Innhold, feilanalyse, hjelpesøk, eksempeldata og lagring har egne filer. Én aktiv visning erstatter de konkurrerende visningsboolene.

Hjelp og lærerveiledning lastes ved behov. Første JavaScript-pakke er redusert fra omtrent 764 kB til 509 kB før gzip. Kjøring beholder isolasjon per program og ignorerer resultater fra avsluttede arbeidere. Den gjenværende kjørings- og grafikkoordineringen ligger fortsatt i `page.tsx`; videre uttrekk er mulig uten å endre arbeidsflyten.

## Kontroller

| Kontroll | Resultat |
|---|---|
| Produksjonsbygg | Bestått. Vite varsler fortsatt om hovedpakken over 500 kB. |
| TypeScript, separat typekontroll | Bestått. |
| Regresjons- og innholdstester | Alle 21 bestått. |
| Eksempelinnhold | Alle 300 eksempler har gyldig syntaks. 210 standardeksempler kjører uten feil med medfølgende data. |
| Nettleser | 17 tester bestått: input, pakker, grafikk, editor, hjelp, filer, lagring, angre, historikk, stopp, Pygame og vurderingskrav. |
| Skjermstørrelser | Automatisert kontroll på 1280×720, 1366×768, 1024×768, 390×844 og 640×360. Ingen horisontal siderulling; kode/kjøring og hjelpesøk tilgjengelig. Faktisk 200 % zoom er i tillegg kontrollert i Mac-appens Chromium-motor. |
| Visuell kontroll | Modul 1 og felles hjelp kontrollert i nettleseren. Kode og kjøring er nå synlige uten den tidligere lange hovedsiderullingen. |
| Mac, isolert offline-test | Bestått for lokale datapakker, Matplotlib, bevart input-tilstand, Pygame og tilgjengelig kode/kjøring uten horisontal siderulling ved 200 % zoom. Brukerens eksisterende appdata ble ikke brukt. |
| Læreplankilder | Lenkene til MAT01-06 hos Udir for [8.](https://www.udir.no/lk20/mat01-06/kompetansemaal-og-vurdering/kv1027?lang=nob), [9.](https://www.udir.no/lk20/mat01-06/kompetansemaal-og-vurdering/kv1028?lang=nob) og [10. trinn](https://www.udir.no/lk20/mat01-06/kompetansemaal-og-vurdering/kv1029?lang=nob) ble åpnet og kontrollert som riktige trinnsider. Didaktiske koblinger er merket som forslag. |

De 90 eksemplene som krever interaktiv input eller grafiske/egne tredjepakker er syntakskontrollert, men ikke alle kjørt individuelt av innholdstesten. Nettleser- og Mac-testene kontrollerer representative reelle kjøringer og de annonserte hovedpakkene.

## Før publisering

1. Gjennomfør elev-/lærerprøven fra planen: skriv/kjør, finn hint, rett feil, bytt fil og gjenoppta lagret arbeid. Faktisk brukervennlighet må observeres med målgruppen.
2. Prøv arbeidsflaten på de maskinene/nettleserne skolen faktisk bruker.
3. Bygg og kontroller nye DMG/PKG-distribusjonspakker før en Mac-utgivelse. Denne runden verifiserte den lokale Electron-appen, ikke en ny signert installasjonspakke.
4. Publiser nettutgaven når gjennomgangen er klar.

Arbeidet kan prøves lokalt med `cd webapp && npm run dev`. Se `webapp/README.md` for bruk, tester og Mac-kontroll.
