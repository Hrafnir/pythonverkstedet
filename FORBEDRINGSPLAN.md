# Forbedringsplan for Skolepython

Gjennomgang 5. september 2026. Grunnlag: lokal versjon 0.16.0, commit `842c81b`, kildekode og visuell kontroll i nettleseren. Dette avsnittet beskriver tilstanden før endringene. Arbeidsflaten og innholdstiltakene er nå implementert lokalt i 0.17.0; se [gjennomføringsrapporten](GJENNOMFORING.md) for resultat, kontroller og gjenstående publiseringsarbeid.

## Anbefalt retning

Gjør Skolepython til en rolig arbeidsflate der eleven alltid vet hvor koden, resultatet og neste hjelpesteg er. Behold den umiddelbare inngangen til Python, den norske språkdrakten og det lokale arbeidsmiljøet. Samle hjelpen, reduser plassen brukt på navigasjon og dekor, og presenter lærestoff ved siden av arbeidet.

Den største gevinsten kommer fra **bedre prioritering av det som allerede finnes**. Samtidig må feilaktige hjelpetips og for svake svarvurderinger rettes. Et penere grensesnitt vil ellers gjøre upålitelig hjelp mer overbevisende.

Prioritering:

1. Synlig kodeflate, kjøreknapp og pålitelig typografi.
2. Trygg arbeidsflyt og én forståelig inngang til hjelp.
3. Gjennomarbeidet progresjon og presis tilbakemelding i alle moduler.
4. Teknisk opprydding som gjør kvaliteten enklere å bevare.

## Hva gjennomgangen omfatter

Innhold og funksjoner er kartlagt på tvers av ti læringsmoduler, 19 utfordringer, åtte eksamensoppgaver, seks Pygame-leksjoner, 143 kommandooppslag, 26 korte veiledninger (16 generelle og ti matematikkveiledninger), 24 håndbokemner, 16 kodebyggerklosser og 38 bibliotekguider. Editor, feilhjelp, kjøring, variabeloversikt, stegvis gjennomgang, filer, prosjekter, grafikk, eksport og lærerstøtte er også vurdert.

Kontrollgrunnlaget har ulike nivåer:

- **Visuelt bekreftet:** startsiden og modul 1 i en nettleserflate på 1280 × 720, inkludert beregnede skrifter og plassering av editor og knapper.
- **Kildegjennomgang:** innholdsstruktur, oppgaver, hjelpefunksjoner og implementasjonen av navigasjon, lagring og kjøring. Faglige forbedringsforslag nedenfor er redaksjonelle vurderinger.
- **Kjørt:** produksjonsbygg og alle 41 eksisterende tester besto. Alle 143 kommandoeksempler kunne syntaksanalyseres i lokal Python. Av 110 eksempler uten de utelatte importene eller behov for input/datafiler kjørte 106 uten feil; fire grafutdrag feilet fordi `plt` ikke var definert.
- **Avgrensning:** denne eksempelsjekken er ikke en full test i Pyodide. Hele ende-til-ende-suiten, Mac-pakkingen og alle grafiske eksempler er ikke kjørt. Separat TypeScript-kontroll ble avbrutt etter at den ikke fullførte under gjennomgangen; godkjent typekontroll er derfor ikke dokumentert. Læreplansitater er ikke kontrollert på nytt mot Udir.

## Konkrete funn som bør styre arbeidet

| Prioritet | Funn og belegg | Betydning og tiltak |
|---|---|---|
| P0 | `globals.css:13` og `:22` bruker udefinerte `--font-geist-*` uten fallback inne i `var()`. Beregnet skrift var **Times både i body og editor**. | Rett fontdefinisjonene først. Bruk en lokal sans-serif for grensesnitt og en reell monospace for kode. Kontroller at innskriving, syntaksfarger og linjenummer har samme metrikk. |
| P0 | På startsiden begynte editoren ved omtrent y=518; «Kjør kode» ved y=1072 i en 720 px høy flate. | Fjern stor innledning over arbeidsflaten, komprimer verktøylinjen, legg kjøring fast ved kodefeltet og tilpass høyden til vinduet. |
| P0 | Modul 1s editor lå omtrent 7463 px ned i dokumentet. Skriveinstruksjonene står også før editoren. | La valgt læringssteg og kode være synlige samtidig. Legg inn en direkte «Til koden»-handling som første forbedring. |
| P0 | `checkAnswer()` bruker `some/includes`. Modul 10 kan godkjennes av ordet «gjennomsnitt» alene; modul 9 av «Grafen er klar». Modul 5 gir ros for tekst som ikke begynner med «trykk», også uten et gyldig simuleringsresultat. | Bind vurderingen til siste vellykkede kjøring av gjeldende kode. Bruk faktiske oppgavekrav, og skill automatisk kontroll fra egenvurdering. |
| P0 | `pythonLineDiagnostic()` advarer på gyldig `if tekst == "a=b":` og på typografiske tegn inne i en vanlig streng. `tall = [1,2,3]` utløser desimaltips. Dette er reprodusert ved direkte kall. | La analysen skille strenger, kommentarer og kode. Et rettetips må aldri foreslå en endring som ødelegger gyldig kode. |
| P1 | Kommandoer, kodehjelp, kodebygger, håndbok og bibliotekoversikt er separate innganger med overlappende innhold. | Samle dem i én hjelp med søk, korte svar, oppskrifter og fordypning. |
| P1 | Hjelpeskuffen er absolutt plassert over arbeidsflaten, minst 500 px bred på større skjermer. | Bruk et panel som får sin egen plass. På mindre skjermer: tydelige faner og én handling tilbake til koden. |
| P1 | Prosjektvalg ligger etter kodebygger og håndbok. Håndboken begynte omtrent 7200 px ned på startsiden i observert tilstand. | Flytt prosjektvalg til arbeidsflatens topp og filer til et panel som åpnes ved behov. |
| P1 | Idéknapper og `tryProgressionCode()` erstatter kode direkte. Modulenes skriveforsøk lagres i React-state, mens frie prosjekter og utfordringskode lagres lokalt. | Gjør «nytt eksempel», «sett inn» og «erstatt» entydige. Bevar utkast, tilby angre og lagre modulutkast ved oppfriskning. |
| P1 | Fire oppslag (`plt-labels`, `plt-limits`, `plt-aspect`, `plt-savefig`) mangler forutsetninger, men detaljvisningen kaller eksempler «Eksempel som virker». | Skill komplette eksempler fra utdrag. Lever import og eksempeldata når eleven velger å prøve et komplett eksempel. |
| P1 | Utfordringer og eksamensoppgaver bruker tekstsøk i kildekode og utskrift. `print("total 648 kr +")` fikk full uttelling i sumutfordringen. Tilsvarende kunne rabattoppgaven i eksamenstreningen passere uten beregning. | Bruk sjekkene som forsiktige råd inntil oppgavene får kjørbare testtilfeller. Ikke framstill teksttreff som bevis på forståelse. |
| P1 | Vanlig Python har tidsstopp, men ingen generell synlig stoppknapp under kjøring. Arbeideren opprettes på nytt for hver kjøring og termineres etter resultat. | Legg til «Stopp». Mål første og gjentatt kjøring før eventuell gjenbruk av motoren; oppretthold isolasjon mellom elevprogrammer. |
| P2 | `page.tsx` er 8355 linjer og blander læringsinnhold, editor, kjøring og alle visninger. Bygget har én JS-fil på ca. 764 kB før gzip. | Trekk ut avgrensede komponenter og innhold trinnvis. Last fordypningsinnhold når det trengs. |

## Foreslått grensesnitt

### Navigasjon og arbeidsflate

Fire tydelige områder: **Kode**, **Lær**, **Øv** og **Lærer**. Hjelp er tilgjengelig fra alle områder. «Øv» inneholder utfordringer og eksamenstrening. Pygame finnes som en synlig inngang under spill i «Lær» og som valg av arbeidsmiljø ved koden.

«Kode» skal alltid være ett klikk unna, gjenåpne utkastet og sette fokus i editoren. Bruk lenker med stabil adresse til moduler, oppgaver og hjelpetemaer, slik at tilbakeknappen og lærerens direkte lenker fungerer. Ikke lag en ny velkomstside foran editoren.

En vanlig arbeidsflate får:

- Øverst: prosjekt, aktiv fil og lagringsstatus.
- Ved koden: **Kjør**, **Stopp under kjøring**, **Hjelp** og **Fokusvisning**.
- I «Flere verktøy»: kjør markert, stegvis gjennomgang, skriftstørrelse og kopiering/eksport.
- Ved siden av eller under koden: resultat med valg for utskrift, grafikk og variabler. Behold tekst og graf samtidig når oppgaven trenger begge.
- Et lukket filpanel som åpnes fra «Filer». Vis aktive datafiler kort, uten å vise alle importvalg hele tiden.

I «Lær» vises ett steg om gangen ved siden av samme arbeidsflate: **Forstå → Forutsi → Prøv → Forklar → Oppgave**. Oppfriskning og fordypning åpnes ved behov. Eleven kan lese oppgaven, skrive og se resultatet uten å lete på en lang side. Behold en separat sammenhengende lese-/utskriftsvisning av heftet.

På brede skjermer kan eleven justere panelbreddene. På mindre skjermer brukes «Kode / Resultat / Hjelp» med bevart markør og rulleposisjon. Tre smale kolonner skal ikke presses inn på en Chromebook.

### Utseende

Behold grønnfargen og Kodeormen som identitet. Bruk lys, nøytral bakgrunn i grensesnittet, mørk kodeflate og én tydelig aksent for primærhandlinger. Grønt brukes konsekvent for vellykket tilstand; feil skal også ha tekst og symbol.

Reduser store seksjonsoverskrifter, dekorative vindusprikker, tunge skygger, pillemerker og gjentatte rammer. Etabler faste tekststørrelser, avstander, hjørner og knappestørrelser. Brødtekst bør få behagelig linjelengde; forklaringene trenger ikke fylle hele skjermen. Gjør forskjellen på overskrift, handling, hjelpetekst og status umiddelbar.

Flytt utskrift, tilbakemelding og mindre brukte innstillinger til en sekundær meny. Lærerområdet skal være en tydelig destinasjon; fagstoff for eleven skal ikke avhenge av en lite forklarende modus-bryter. Vurder en nøktern bunntekst i stedet for dagens KI-spøk.

## Én hjelp, flere dybder

Eleven skal kunne skrive «gjenta fem ganger», «tegne graf», «lese fil» eller selve Python-kommandoen i samme søk. Nåværende norske søkeord og rangering av kommandoer er et godt utgangspunkt.

Hver hjelpeside bør ha samme struktur:

1. **Dette hjelper deg med:** én konkret setning.
2. **Kort eksempel:** få linjer med nødvendige forutsetninger.
3. **Dette skjer:** forventet utskrift eller beskrivelse av grafikken.
4. **Prøv en endring:** ett lite eksperiment med et kontrollspørsmål.
5. **Vanlig feil:** ett relevant problem og veien tilbake til koden.
6. **Mer forklaring:** valgfri fordypning og lenke til relevant modul.

Handlingene må skille mellom «Sett inn ved markøren» og «Prøv i nytt eksempel». Et eksempel som trenger `temperaturer.txt`, skal få denne filen med seg automatisk, eller vise et tydelig nødvendig forberedelsessteg. Kodeklosser som bruker `navn` og `alder`, må oppgi at variablene må finnes.

Konteksthjelp skal foreslå riktig tema ut fra oppgave, import eller feil. Behold søk og manuelle valg. Start med deterministiske koblinger; dette krever ingen KI-tjeneste.

| Hjelpeområde | Vurdering | Planlagt forbedring |
|---|---|---|
| 143 kommandooppslag | God bredde og mange nyttige norske søkeord. Blander korte utdrag og selvstendige eksempler. | Felles innholdsformat med krav til import, data, forventet resultat og miljø. Kortversjon først. |
| 26 mini-veiledninger | Konkrete spørsmål og god nybegynnerstemme. Mangler en egen kort `while`-veiledning blant de generelle temaene. | Samle i hjelpen. Legg til `while` med stoppevilkår, samt hjelp ved indeksfeil og deling på null. |
| 24 håndbokemner | Nyttig fordypning, men dupliserer flere kommando- og bibliotekforklaringer. | Gjenbruk samme emnedata og gjør håndboken til fordypningsvisning. |
| 16 kodebyggerklosser | Gode startpunkt. Noen kan ikke brukes alene eller sammen i vilkårlig rekkefølge. | Merk avhengigheter, gi forhåndsvisning og forklar innsetting. Flytt hele katalogen ut av startsidens dokumentflyt. |
| Feildetektiven | Spørsmål, linje og valgfritt hint støtter egen feilsøking. | Behold formen; rett feilaktige varsler. Utvid presis hjelp for `IndexError`, `ZeroDivisionError` og manglende import. Vis teknisk feil sammenfoldet. |
| Variabeloversikt | God støtte for å forstå tilstand. | Gi kobling til aktiv kodelinje og forrige verdi. Gjør panelet valgfritt. |
| Følg stegvis | Svært relevant for kodeforståelse. Tilgjengelig handling er i det frie Python-rommet. | Tilby i læringsmodulene også. Be eleven forutsi en verdi før neste steg. Forklar at visningen er en gjennomgang av en kjøring, ikke nødvendigvis en interaktiv debugger. |
| Filhjelp og eksport | Relevante skoleverktøy, men lagring betyr flere forskjellige ting. | Skill lokal prosjektlagring, midlertidige Python-filer og nedlasting. `open(..., "w")` trenger enten en faktisk vei til å hente filen ut, eller tydelig avgrensning. |
| Mattehjelp | Praktisk veiledning fra problem til verktøy. | Samordne kvartilmetode og utvalg/populasjon på tvers av statistics, NumPy og pandas. Formuleringen «en liste ganger seg selv» bør bli «listeinnholdet gjentas». |
| Lærerstøtte og læreplan | Formål, misforståelser og vurdering er nyttige. | Samle lærernotater, tidsbruk, forkunnskaper og fasit per aktivitet. Kontroller læreplansitater og skill egenproduserte oppgaver fra offisielt eksamensmateriale. |

## De ti modulene

Alle ti har en relevant bruk, men de bør ikke framstå som én like tung, lineær rekke. Foreslått grunnløp er variabler → vilkår → løkker → funksjoner → grunnleggende lister. Deretter kan eleven velge sannsynlighet, modellering, grafer eller skapende arbeid. Behold eksisterende modul-ID-er og progresjon selv om presentasjonsrekkefølgen endres.

| Modul | Behold | Endre og kontroller |
|---|---|---|
| 1. Verdier, variabler og uttrykk | Rabatt som kort matematisk eksempel; forskjellen på tildeling og likhet. | Progresjonen favner også `+=`, f-tekst og input. Flytt dette til valgfri utvidelse. Start med fire linjer og en liten sportabell. Sjekk faktisk ny pris med endret rabatt. |
| 2. Valg med if og else | Partall/oddetall, rest og innrykk. | La eleven forutsi valgt gren. Test 0, positive og negative heltall, ikke bare 37. Gi hint før full løsningslinje. |
| 3. Gjentakelser og mønstre | `range`, sluttverdi og matematisk mønster. | Vis verdier runde for runde. Legg til et kort `while`-steg før oppgaver om ukjent antall gjentakelser. Vurder tallfølgen, ikke bare en bestemt utskriftsform. |
| 4. Funksjoner som maskiner | Parameter, funksjonskall og `return`. | Vis forskjellen på å definere, kalle, returnere og skrive ut. Test funksjonen ved flere argumenter; utskriften «16» alene sier lite om løsningen. |
| 5. Sannsynlighet gjennom simulering | Ett kast → teller → andel og forklaring av variasjon. | Gjør `or` til en forklart byggekloss før oppgaven. Kontroller gyldig kjøring og logikk. Ikke krev et eksakt tilfeldig resultat, og fjern automatisk ros basert på vilkårlig tekst. |
| 6. Modellering og gyldighet | Sammenhengen mellom prosent, vekstfaktor og antakelser. | Knytt løkke og potens tydelig sammen. Avklar avrunding før resultatkontroll. Be om én matematisk og én situasjonsbestemt begrunnelse. |
| 7. Turtle og geometriske figurer | Ytre vinkel, regulære mangekanter og avspilling. | La målet først være en forklart åttekant. Flytt farge, tykkelse og SVG til neste steg. Kontroller figurens egenskaper; teksten «turtle» dokumenterer ikke åttekant eller eksport. |
| 8. Bygg et spill: Snake | Motivasjon, koordinater, tilstand og parametere. | Skill mellom å konfigurere et ferdig Snake-bibliotek og å implementere spillogikk. Forklar at kropp/listelogikk er skjult bak biblioteket i sluttprogrammet. Knytt til Pygame som videreføring. |
| 9. Grafer/funksjoner | Funksjonsforståelse og tydelig kommunikasjon gjennom akser og utsnitt. | Start med en kort graf. Legg den omfattende eksportmalen i et neste nivå. Test funksjonsverdier og nullpunkt for `-3x + 6`; riktig kontrolltekst er ikke nok. |
| 10. Lister og datafiler | Indeks, tallkonvertering, data og to tilhørende lister. | Del i tre deløkter: lister, TXT, CSV. Flytt listegrunnlaget tidligere. Lever eksempeldata sammen med kode. Kontroller både gjennomsnitt og varmeste dag, og håndter tomme rader og like maksimum. |

Hver modul bør ende i tre parallelle oppgavetyper: **les**, **endre**, **lag**. Merk hva eleven forventes å kunne fra før, og skill obligatorisk grunnstoff fra videre utforsking. Bruk sportabellene i heftet som grunnlag for kodeforståelse i appen.

## Utfordringer og eksamenstrening

De 19 utfordringene har gode oppdrag, suksesskriterier og hintestiger. Behold dem, men gjør sjekkene mer troverdige og inngangen til editoren kortere.

| Utfordring | Særlig forbedring |
|---|---|
| Lag en forståelig sum | Test nye priser/frakt; ikke godkjenn et plusstegn inne i en tekst. |
| Regn ut en rabatt | Skill riktig beløp fra valgfri formatering; test 0 % og en annen rabatt. |
| Er tallet partall? | Kontroller begge grener, inklusive 0 og negativt tall. |
| Lag en framtidsmaskin | Kravet sier minst to opplysninger; sjekken leter bare etter ett `input(`-treff. Test navn og alder gjennom faktisk inndata. |
| Finn hypotenusen | Godta flere matematiske metoder; kontroller verdi og enhet ved to trekanter. |
| Lag en gangetabell | Kontroller alle ti linjer og sammenhengen mellom faktor og produkt. |
| Velg riktig billettpris | Test grensealdrene 11, 12, 17 og 18. |
| Er trekanten rettvinklet? | Gjør forskjellen på eksakte heltall og målte desimaltall tydelig. «Ikke rettvinklet» inneholder også «rettvinklet». |
| Finn den ukjente kateten | Forklar at hypotenusen må være lengst; vis feil ved umulige data. |
| Finn det største tallet selv | Test negative tall og endret rekkefølge. Hold kravet om egen algoritme adskilt fra riktig resultat. |
| Analyser målinger | Test antall over gjennomsnitt også når ingen eller flere ligger over. |
| Tell vokaler i en tekst | Test store bokstaver, norske vokaler og tekst uten vokaler. |
| Tegn en valgfri mangekant | Kontroller generalisering til annet sidetall og at figuren lukker seg. |
| Bygg en trekantdetektiv | Test ugyldig trekant, likesidet og likebeint; forklar positiv sidelengde. |
| Undersøk om et tall er et primtall | Test 1, 2 og et kvadrattall; godta alternative løkketyper. |
| Når passeres en grense? | Test start over grensen, nøyaktig lik grense og manglende vekst. |
| Simuler summen av to terninger | Kontroller at begge kast skjer i løkken. Bruk flere deterministiske kontrolltilfeller, ikke ett krav til tilfeldig andel. |
| Lag en enkel kodeknekker | Test passering av z, mellomrom og negativ forskyvning. Behold norsk alfabet som utvidelse. |
| Design et geometrisk spiralmønster | Kontroller antall streker og vekst; tilstedeværelse av `forward` og `+=` er ikke nok. |

De åtte eksamensoppgavene dekker nyttige matematiske temaer. Felles forbedring: «Hva kontrollerer vi?» skal være synlig, og egen forklaring må vurderes separat fra programresultatet.

| Eksamensoppgave | Særlig forbedring |
|---|---|
| Forstå rabattkoden | Kjør begge oppgitte testdatasett. Krev beregning av både spart beløp og ny pris. |
| Hva koster taxituren? | Test funksjonen ved 0, 5 og 12 km; skill enhetsråd fra programkontroll. |
| Når passerer sparingen målet? | Presiser «passerer» kontra «minst» og test grensen. |
| Målingen som ikke passer inn | Skill statistisk avvik fra påvist målefeil. Kontroller avstand for hver måling. |
| Hvor ofte blir summen sju? | Kontroller simuleringens oppbygning samt forskjellen på antall, andel og prosent. |
| Er hjørnet rett? | Forklar enheten til toleransen i de kvadrerte sidene. Test både positiv og negativ konklusjon. |
| Finn billettfordelingen | Kandidatteller etterspørres i oppdraget, men er bare forbedringsråd i sjekken. Samordne oppgave og krav. |
| Når slutter modellen å gi mening? | Skill original modell fra fysisk avgrenset funksjon. Test 0, 13, 14 og 16 minutter; godta likeverdige implementasjoner. |

## Pygame og biblioteker

Pygame-kursets seks steg gir en god sammenhengende progresjon. Vis **nye og endrede linjer** ved hvert steg, med hele programmet tilgjengelig ved behov.

| Steg | Forbedring |
|---|---|
| 1. Spilløkka | Skill nødvendig nettleseroppsett fra det eleven først skal forstå; synlig stopp og beskjed om fokus i spillflaten. |
| 2. Spilleren | Vis koordinatsystem og størrelse sammen med koden. |
| 3. Bevegelse | Knytt fart til endring per bilde. Gi et lite eksperiment med bildefrekvens. |
| 4. Kollisjon | Behold skillet mellom sirkel og kollisjonsrektangel. Fortsett med flerliniers `if`, slik steg 3 gjør, før kortformer introduseres. |
| 5. Poeng | Vis hvorfor initialisering ligger utenfor løkken. Kontroller poeng ved én og flere kollisjoner. |
| 6. Ferdig spill | Test seier, omstart og avslutning. Forklar tilstandsendringene og gi ett lite utvidelsesoppdrag av gangen. |

De 38 bibliotekguidene bør beholdes som katalog, men ikke gis lik synlighet for nybegynnere. Følgende grupper dekker alle guidene:

| Plassering | Biblioteker | Redaksjonell beslutning |
|---|---|---|
| Vanlige skoleoppgaver | math, statistics, random, csv, turtle | Prioriter i søk når elevens problem passer. Vis enkle eksempler og nødvendige data. |
| Relevant neste steg | fractions, decimal, numpy, pandas, matplotlib | Knytt til brøker, avrunding, grafer og tabeller. Forklar forskjeller mellom liste og array og mellom lagring og nedlasting. |
| Spill og skapende arbeid | spill, pygame, PIL/Pillow | Skill lokalt ferdigbibliotek, selvbygd spill og bildebehandling. Merk hvilket arbeidsmiljø som kreves. |
| Valgfri matematisk fordypning | scipy, sympy, sklearn, networkx, shapely | Behold for elever/lærere med et konkret behov. Start med matematikken, så verktøyet. |
| Tekst og organisering av data | collections, itertools, datetime, json, re, string, textwrap, copy | Nyttige oppslag ved bestemte oppgaver. Lenke fra relevante utfordringer; ikke krev dem i grunnløpet. |
| Miljø og filer | time, pathlib, os, sys | Forklar nettlesermiljøets begrensninger og midlertidige filer presist. Unngå plattformspesifikk «Mac»-tekst i generell netthjelp. |
| Avansert programmering | functools, operator, bisect, heapq, array, enum, typing, unicodedata | Flytt til tydelig «Videre». Forklar først når vanlig Python er tilstrekkelig. `typing`-guiden må samordnes: importen viser Iterable, mens eksemplet bruker innebygde typeannotasjoner. |

## Gjennomføring i avgrensede leveranser

### Leveranse 1 — arbeidsflate og åpenbare kvalitetsfeil

Rett skrifter, komprimer topp og editorverktøy, gjør kjøring synlig uten siderulling, legg til stopp og direkte tilgang til kode fra moduler. Flytt prosjektvalg opp. Rett de dokumenterte feilvarslene og trekk tilbake misvisende positiv oppgavevurdering. Bevar utkast ved eksempelbytte og lagre modulutkast lokalt.

**Ferdig når:** en elev kan åpne appen, skrive, kjøre, finne resultatet og stoppe en løkke uten å lete; gyldige testlinjer får ingen feilretting; kodeendring krever ny kjøring før vurdering.

### Leveranse 2 — felles navigasjon og hjelp

Bygg den nye navigasjonen, stabil adressestruktur og felles hjelp ved arbeidsflaten. Konsolider kommandoer, veiledninger og eksempler bak én inngang. Flytt filer, eksport og sjeldne verktøy til forutsigbare steder. Innfør avgrensede designverdier for typografi, farger og avstand.

**Ferdig når:** eleven finner hjelp til løkke, graf og CSV fra samme sted, beholder kode/markør, og kan prøve et eksempel uten å miste eget arbeid. Tilbakeknappen gjenoppretter riktig område.

### Leveranse 3 — læringsløp og innhold

Prøv den nye modulformen på modul 1, 3 og 9: enkel kode, løkke og grafikk. Bruk erfaringene på alle ti modulene, deretter utfordringer, eksamen og Pygame. Del liste-/filstoffet i mindre steg. Oppdater alle hjelpeeksempler med forutsetninger og forventet resultat. Synkroniser heftet og README med faktisk produkt.

**Ferdig når:** hvert læringssteg har ett tydelig mål og en tydelig neste handling; alle eksempler merket «komplette» virker i tomt riktig arbeidsmiljø med medfølgende data; oppgavekrav og vurdering stemmer overens.

### Leveranse 4 — robusthet og regresjonskontroll

Trekk ut felles arbeidsflate, kjørelogikk, prosjektlagring, hjelpesøk og innholdsdata fra `page.tsx`. Erstatt de mange visningsboolene med én eksplisitt aktiv visning. Gjør dette gradvis i tilknytning til leveransene over; unngå en stor omskriving først.

Legg inn meningsfulle tester for brukerflyt, falske positive hjelpetips, oppgavevurdering og eksempeldata. Flere nåværende tester leter etter bestemte strenger i kilden; slike tester må ikke låse den gamle layouten. Mål lastetid og gjentatt kjøring før optimalisering. Endringer i kjøringen må håndtere navigasjon under kjøring og hindre at gamle resultater havner i feil oppgave.

**Ferdig når:** bygge-, type- og relevante ende-til-ende-kontroller består, eksisterende lagring er bevart og nett- og Mac-utgave har dokumentert fungerende arbeidsflyt.

## Akseptansekriterier før ny versjon

- På 1280 × 720 og 1366 × 768 er kode, hovedhandling og resultatoverskrift synlige uten å rulle hovedsiden. Sikt mot minst ti synlige kodelinjer med vanlig skriftstørrelse.
- Fra alle områder er «Kode» én handling unna. Hjelp åpnes fra arbeidsflaten, og fokus kan returneres direkte til samme sted i koden.
- Test også 1024 × 768, smal mobilflate og 200 % zoom. Viktige handlinger skal ikke klippes bort eller kreve horisontal siderulling.
- Tastaturbruk virker for navigasjon, hjelpesøk, kjøring, dialoglukking og fokusretur. En kjøringssnarvei skal vises i grensesnittet.
- Ingen eksempelhandling mister et utkast uten en tydelig, forståelig vei tilbake. Oppfriskning bevarer modulutkast og prosjekter.
- Feil, utdatert resultat, innlasting, venting på input og fullført kjøring har forskjellige, forklarte tilstander.
- Automatiske oppgavesjekker prøves med riktig løsning, feil løsning, hardkodet svar og naturlig alternativ løsning. Tilfeldige og grafiske oppgaver får egnede kontroller og tydelig egenvurdering.
- Før publisering: la noen elever og lærere utføre fem korte oppgaver — skriv/kjør, finn et hint, rett en feil, bytt fil og fortsett et lagret arbeid. Observer hvor de stopper opp. Mål om minst fire av fem deltakere klarer kjerneoppgavene uten muntlig veiledning; bruk resultatet til å prioritere siste justeringer.

## Anbefalt første beslutning

Start med leveranse 1 og en konkret utforming av kodeflaten. Deretter prøves den på de tre representative modulene før resten bygges om. Dette gir en synlig forbedring tidlig og et reelt grunnlag for å avgjøre hvor mye hjelp som skal være åpen samtidig.
