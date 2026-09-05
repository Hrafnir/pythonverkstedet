export type LibraryAvailability = "standard" | "offline" | "local";

export type LibraryGuideGroup =
  | "Matematikk"
  | "Data og visualisering"
  | "Tekst, filer og tid"
  | "Programmeringsverktøy"
  | "Spill og skapende";

export type LibraryGuide = {
  id: string;
  name: string;
  importCode: string;
  availability: LibraryAvailability;
  group: LibraryGuideGroup;
  level: "Start her" | "Neste steg" | "Videre";
  tagline: string;
  intro: string;
  useCases: string[];
  steps: string[];
  commands: { code: string; explanation: string }[];
  example: string;
  challenge: string;
  note: string;
};

export const libraryGuideGroups: ("Alle" | LibraryGuideGroup)[] = [
  "Alle",
  "Matematikk",
  "Data og visualisering",
  "Tekst, filer og tid",
  "Programmeringsverktøy",
  "Spill og skapende",
];

// Ett oppslag for hvert bibliotek Skolepython markerer som støttet i editoren.
export const libraryGuides: LibraryGuide[] = [
  {
    id: "math", name: "math", importCode: "import math", availability: "standard", group: "Matematikk", level: "Start her",
    tagline: "Kvadratrot, π, vinkler og matematiske funksjoner.",
    intro: "math passer når du skal gjøre én matematisk beregning av gangen. Du lager fortsatt formelen selv; biblioteket gir deg presise konstanter og funksjoner.",
    useCases: ["Pytagoras og avstander", "Sirkelberegninger", "Sinus, cosinus og tangens"],
    steps: ["Importer math øverst.", "Skriv math. foran verktøyet du vil bruke.", "Lagre svaret i en variabel og vis det med enhet."],
    commands: [
      { code: "math.sqrt(tall)", explanation: "finner kvadratroten" },
      { code: "math.pi", explanation: "gir en presis verdi av π" },
      { code: "math.sin(math.radians(vinkel))", explanation: "finner sinus når vinkelen er oppgitt i grader" },
    ],
    example: `import math

a = 3
b = 4
hypotenus = math.sqrt(a ** 2 + b ** 2)

print("Hypotenusen er", hypotenus)`,
    challenge: "La brukeren skrive inn to kateter, og vis hypotenusen med to desimaler.",
    note: "Potens skrives med **, ikke ^. Trigonometrifunksjonene forventer radianer.",
  },
  {
    id: "statistics", name: "statistics", importCode: "import statistics", availability: "standard", group: "Matematikk", level: "Start her",
    tagline: "Gjennomsnitt, median, typetall og spredning.",
    intro: "statistics beskriver en vanlig liste med tall. Biblioteket passer godt når dere arbeider med sentralmål og spredning på ungdomstrinnet.",
    useCases: ["Sammenligne datasett", "Finne en typisk verdi", "Undersøke spredning"],
    steps: ["Lag en liste med tall.", "Importer statistics.", "Send listen inn i funksjonen og forklar hva svaret betyr."],
    commands: [
      { code: "statistics.mean(tall)", explanation: "finner gjennomsnittet" },
      { code: "statistics.median(tall)", explanation: "finner den midterste verdien" },
      { code: "statistics.multimode(tall)", explanation: "finner alle typetall" },
      { code: "statistics.pstdev(tall)", explanation: "finner standardavviket for hele datasettet" },
    ],
    example: `import statistics

poeng = [4, 7, 7, 8, 9, 13]

print("Gjennomsnitt:", statistics.mean(poeng))
print("Median:", statistics.median(poeng))
print("Typetall:", statistics.multimode(poeng))`,
    challenge: "Legg til verdien 100. Hva skjer med gjennomsnittet og medianen, og hvorfor?",
    note: "En tom liste har ikke gjennomsnitt eller median.",
  },
  {
    id: "fractions", name: "fractions", importCode: "from fractions import Fraction", availability: "standard", group: "Matematikk", level: "Neste steg",
    tagline: "Regn med eksakte brøker uten avrunding.",
    intro: "Fraction beholder teller og nevner. Det gjør biblioteket nyttig når 1/3 skal forbli en tredel i stedet for å bli et avrundet desimaltall.",
    useCases: ["Brøkregning", "Forkorting", "Sammenligne brøk og desimaltall"],
    steps: ["Importer Fraction.", "Lag en brøk med teller og nevner.", "Regn med brøken som med andre tall."],
    commands: [
      { code: "Fraction(2, 6)", explanation: "lager og forkorter brøken til 1/3" },
      { code: "Fraction(tekst)", explanation: "kan lese for eksempel \"3/4\"" },
      { code: "float(brok)", explanation: "gjør brøken om til desimaltall" },
    ],
    example: `from fractions import Fraction

a = Fraction(1, 3)
b = Fraction(1, 6)
sum_brok = a + b

print("Eksakt svar:", sum_brok)
print("Desimaltall:", float(sum_brok))`,
    challenge: "Regn ut 2/5 + 3/10 og forklar hvorfor svaret forkortes.",
    note: "Nevneren kan ikke være 0.",
  },
  {
    id: "decimal", name: "decimal", importCode: "from decimal import Decimal", availability: "standard", group: "Matematikk", level: "Neste steg",
    tagline: "Kontrollert desimalregning, særlig for penger.",
    intro: "Vanlige desimaltall lagres binært og kan få ørsmå avrundingsfeil. Decimal lar deg beholde desimalene slik de er skrevet.",
    useCases: ["Pengebeløp", "Nøyaktige desimaler", "Undersøke avrunding"],
    steps: ["Importer Decimal.", "Lag verdien fra tekst med anførselstegn.", "Regn og avrund først når oppgaven krever det."],
    commands: [
      { code: "Decimal(\"19.90\")", explanation: "lager en nøyaktig desimalverdi" },
      { code: "verdi.quantize(Decimal(\"0.01\"))", explanation: "avrunder til to desimaler" },
    ],
    example: `from decimal import Decimal

pris = Decimal("19.90")
antall = 3
total = pris * antall

print("Totalpris:", total, "kr")`,
    challenge: "Lag et program med pris, antall og 25 % rabatt.",
    note: "Bruk Decimal(\"0.1\"), ikke Decimal(0.1), for å unngå å ta med en gammel float-avrunding.",
  },
  {
    id: "random", name: "random", importCode: "import random", availability: "standard", group: "Matematikk", level: "Start her",
    tagline: "Tilfeldige tall, valg og simuleringer.",
    intro: "random lager pseudotilfeldige valg. Det passer til terninger, sannsynlighetseksperimenter, spørrekort og enkle spill.",
    useCases: ["Kaste terninger", "Simulere sannsynlighet", "Velge et tilfeldig element"],
    steps: ["Importer random.", "Velg riktig funksjon for tall eller liste.", "Gjenta forsøket mange ganger hvis du undersøker sannsynlighet."],
    commands: [
      { code: "random.randint(1, 6)", explanation: "velger et heltall fra og med 1 til og med 6" },
      { code: "random.choice(liste)", explanation: "velger ett element" },
      { code: "random.shuffle(liste)", explanation: "stokker listen på stedet" },
    ],
    example: `import random

antall_seksere = 0
for forsok in range(100):
    kast = random.randint(1, 6)
    if kast == 6:
        antall_seksere += 1

print("Seksere:", antall_seksere)`,
    challenge: "Simuler 1000 kast og regn ut andelen seksere.",
    note: "random er godt til forsøk og spill, men ikke til sikkerhet eller passord.",
  },
  {
    id: "csv", name: "csv", importCode: "import csv", availability: "standard", group: "Data og visualisering", level: "Start her",
    tagline: "Les og skriv tabeller i CSV-format.",
    intro: "CSV-filer inneholder tabeller som ren tekst. csv-biblioteket lar deg lese én rad om gangen uten å bruke pandas.",
    useCases: ["Lese måledata", "Arbeide med kolonnenavn", "Lagre en enkel tabell"],
    steps: ["Legg CSV-filen ved editoren.", "Åpne filen med with open.", "Velg csv.reader eller csv.DictReader."],
    commands: [
      { code: "csv.DictReader(fil, delimiter=\";\")", explanation: "leser hver rad som en ordbok med kolonnenavn" },
      { code: "csv.writer(fil)", explanation: "lager en skriver for CSV-rader" },
    ],
    example: `import csv

tekst = "navn,poeng\\nAda,8\\nBo,12"
linjer = tekst.splitlines()
leser = csv.DictReader(linjer)

for rad in leser:
    print(rad["navn"], int(rad["poeng"]))`,
    challenge: "Importer en CSV-fil og finn største verdi i en tallkolonne.",
    note: "Norske CSV-filer bruker ofte semikolon. Kolonnenavn må skrives helt nøyaktig.",
  },
  {
    id: "collections", name: "collections", importCode: "from collections import Counter", availability: "standard", group: "Data og visualisering", level: "Neste steg",
    tagline: "Tell forekomster og organiser data smartere.",
    intro: "collections inneholder spesialverktøy rundt lister og ordbøker. Counter er særlig nyttig når du vil telle hvor ofte noe forekommer.",
    useCases: ["Frekvenstabeller", "Ordtelling", "Finne vanligste verdi"],
    steps: ["Importer Counter.", "Send inn en liste eller tekst.", "Undersøk tellingene eller de vanligste elementene."],
    commands: [
      { code: "Counter(liste)", explanation: "teller hvert element" },
      { code: "telling.most_common(3)", explanation: "gir de tre vanligste" },
    ],
    example: `from collections import Counter

terningkast = [2, 6, 3, 6, 1, 6, 3, 4]
telling = Counter(terningkast)

print("Frekvenser:", telling)
print("Vanligst:", telling.most_common(1))`,
    challenge: "Tell bokstavene i et ord og finn den vanligste bokstaven.",
    note: "Counter teller også mellomrom hvis du sender inn en hel tekst.",
  },
  {
    id: "itertools", name: "itertools", importCode: "import itertools", availability: "standard", group: "Programmeringsverktøy", level: "Videre",
    tagline: "Lag kombinasjoner og effektive mønstre i løkker.",
    intro: "itertools bygger iteratorer: verdier som lages når de trengs. På ungdomstrinnet er combinations og product nyttige til systematisk opptelling.",
    useCases: ["Finne kombinasjoner", "Utforske mulige utfall", "Gjenta mønstre"],
    steps: ["Importer itertools.", "Velg elementene som kan kombineres.", "Gjør resultatet om til list hvis du vil se alt."],
    commands: [
      { code: "itertools.combinations(liste, 2)", explanation: "lager alle par uten å bytte rekkefølge" },
      { code: "itertools.product(a, b)", explanation: "lager alle valg fra a og b" },
    ],
    example: `import itertools

elever = ["Ada", "Bo", "Celine", "David"]
par = list(itertools.combinations(elever, 2))

print("Antall par:", len(par))
for parnavn in par:
    print(parnavn)`,
    challenge: "Finn alle mulige utfall når to terninger kastes.",
    note: "Antallet kombinasjoner kan vokse svært raskt når listen blir stor.",
  },
  {
    id: "datetime", name: "datetime", importCode: "from datetime import date, timedelta", availability: "standard", group: "Tekst, filer og tid", level: "Neste steg",
    tagline: "Datoer, tidsforskjeller og kalenderregning.",
    intro: "datetime forstår datoer som verdier det går an å sammenligne og regne med. Det er tryggere enn å telle dager i tekst for hånd.",
    useCases: ["Dager mellom datoer", "Frister", "Dato etter et antall dager"],
    steps: ["Importer date og eventuelt timedelta.", "Lag datoer med år, måned og dag.", "Trekk datoene fra hverandre eller legg til en tidsperiode."],
    commands: [
      { code: "date(2026, 9, 1)", explanation: "lager en dato" },
      { code: "slutt - start", explanation: "gir tidsforskjellen" },
      { code: "start + timedelta(days=14)", explanation: "flytter datoen 14 dager" },
    ],
    example: `from datetime import date, timedelta

start = date(2026, 9, 1)
frist = start + timedelta(days=14)

print("Start:", start)
print("Frist:", frist)
print("Dager:", (frist - start).days)`,
    challenge: "Lag en dato for neste ferie og regn ut hvor mange dager det er fra en valgt startdato.",
    note: "Rekkefølgen er år, måned, dag.",
  },
  {
    id: "json", name: "json", importCode: "import json", availability: "standard", group: "Tekst, filer og tid", level: "Neste steg",
    tagline: "Lagre og lese strukturerte data som tekst.",
    intro: "JSON kan representere lister, tall, tekst og ordbøker. Formatet brukes mye når programmer lagrer eller utveksler data.",
    useCases: ["Lagre innstillinger", "Lese datasett", "Se forskjellen på Python-data og tekst"],
    steps: ["Lag en ordbok eller liste.", "Bruk dumps for å lage JSON-tekst.", "Bruk loads for å gjøre teksten tilbake til Python-data."],
    commands: [
      { code: "json.dumps(data, ensure_ascii=False)", explanation: "gjør Python-data om til JSON-tekst med norske tegn" },
      { code: "json.loads(tekst)", explanation: "leser JSON-tekst" },
    ],
    example: `import json

elev = {"navn": "Ada", "poeng": [8, 10, 12]}
tekst = json.dumps(elev, ensure_ascii=False)
tilbake = json.loads(tekst)

print(tekst)
print("Siste poeng:", tilbake["poeng"][-1])`,
    challenge: "Lag JSON for et spill med navn, poeng og vanskelighetsgrad.",
    note: "JSON bruker true, false og null i tekstformatet, mens Python bruker True, False og None.",
  },
  {
    id: "re", name: "re", importCode: "import re", availability: "standard", group: "Tekst, filer og tid", level: "Videre",
    tagline: "Finn tekstmønstre med regulære uttrykk.",
    intro: "re søker etter mønstre i tekst. Det kan finne for eksempel alle tall eller kontrollere at en enkel kode har riktig form.",
    useCases: ["Finne tall i tekst", "Dele opp ujevn tekst", "Kontrollere enkle mønstre"],
    steps: ["Importer re.", "Skriv mønsteret som en rå tekst med r foran.", "Bruk findall når du vil ha alle treff."],
    commands: [
      { code: "re.findall(r\"\\d+\", tekst)", explanation: "finner grupper med ett eller flere sifre" },
      { code: "re.sub(monster, nytt, tekst)", explanation: "erstatter alle treff" },
    ],
    example: `import re

tekst = "Temperaturene var 12, 15 og 9 grader."
tall_tekst = re.findall(r"\\d+", tekst)
tall = [int(verdi) for verdi in tall_tekst]

print("Tallene:", tall)
print("Gjennomsnitt:", sum(tall) / len(tall))`,
    challenge: "Finn alle ordene som begynner med stor bokstav i en setning.",
    note: "Regulære uttrykk har sitt eget tegnspråk. Start med små mønstre og skriv ut treffene.",
  },
  {
    id: "time", name: "time", importCode: "import time", availability: "standard", group: "Tekst, filer og tid", level: "Neste steg",
    tagline: "Mål hvor lang tid kode bruker.",
    intro: "time kan lese en klokke og måle varighet. I nettleseren bør du unngå lange time.sleep-pauser fordi de stopper resten av programmet.",
    useCases: ["Måle kjøretid", "Sammenligne algoritmer", "Lage tidsstempel"],
    steps: ["Lagre time.perf_counter før arbeidet.", "Kjør koden du vil måle.", "Trekk starttiden fra en ny klokkeverdi."],
    commands: [
      { code: "time.perf_counter()", explanation: "gir en presis klokke for tidsmåling" },
      { code: "time.time()", explanation: "gir tidspunkt som sekunder siden 1970" },
    ],
    example: `import time

start = time.perf_counter()
sum_kvadrater = sum(tall ** 2 for tall in range(100000))
slutt = time.perf_counter()

print("Svar:", sum_kvadrater)
print("Tid:", round(slutt - start, 5), "sekunder")`,
    challenge: "Sammenlign tiden til en løkke og sum med en generator.",
    note: "Tidsmålinger varierer litt fra kjøring til kjøring.",
  },
  {
    id: "pathlib", name: "pathlib", importCode: "from pathlib import Path", availability: "standard", group: "Tekst, filer og tid", level: "Neste steg",
    tagline: "Arbeid ryddig med filnavn og filendelser.",
    intro: "Path representerer en filsti som en verdi. I Skolepython er det særlig nyttig for filer i det lokale prosjektet eller filer som er lagt ved editoren.",
    useCases: ["Finne filendelse", "Bygge filstier", "Lese tekstfiler"],
    steps: ["Importer Path.", "Lag en Path fra et filnavn.", "Undersøk navnet eller les filen hvis den finnes i prosjektet."],
    commands: [
      { code: "Path(\"data.csv\").suffix", explanation: "gir filendelsen .csv" },
      { code: "sti.stem", explanation: "gir navnet uten filendelse" },
      { code: "sti.read_text(encoding=\"utf-8\")", explanation: "leser hele tekstfilen" },
    ],
    example: `from pathlib import Path

sti = Path("maalinger.csv")

print("Filnavn:", sti.name)
print("Navn uten ending:", sti.stem)
print("Filtype:", sti.suffix)`,
    challenge: "Legg ved en TXT-fil og les innholdet med Path.read_text.",
    note: "Nettleseren gir ikke fri tilgang til mapper på maskinen; bare prosjektfiler og valgte datafiler er tilgjengelige.",
  },
  {
    id: "os", name: "os", importCode: "import os", availability: "standard", group: "Programmeringsverktøy", level: "Videre",
    tagline: "Enkle opplysninger om filer og kjøremiljø.",
    intro: "os er laget for kontakt med operativsystemet. Skolepython støtter de ufarlige, filrelaterte delene, men nettleseren er isolert fra resten av enheten.",
    useCases: ["Undersøke filnavn", "Se prosjektfiler", "Bygge portable stier"],
    steps: ["Importer os.", "Bruk os.path til å undersøke navn.", "Husk at nettleserens filsystem er avgrenset."],
    commands: [
      { code: "os.path.splitext(filnavn)", explanation: "deler navn og filendelse" },
      { code: "os.listdir(\".\")", explanation: "viser filer i det virtuelle prosjektområdet" },
    ],
    example: `import os

filnavn = "resultater.csv"
navn, ending = os.path.splitext(filnavn)

print("Navn:", navn)
print("Ending:", ending)
print("Prosjektfiler:", os.listdir("."))`,
    challenge: "Filtrer listen fra os.listdir slik at bare .py-filer vises.",
    note: "os kan ikke brukes til å utforske elevens vanlige mapper fra nettsiden.",
  },
  {
    id: "sys", name: "sys", importCode: "import sys", availability: "standard", group: "Programmeringsverktøy", level: "Videre",
    tagline: "Opplysninger om Python-motoren og programkjøringen.",
    intro: "sys gir kontakt med selve Python-kjøremiljøet. Det er mest nyttig til feilsøking og når du vil forstå hvilken Python som kjører.",
    useCases: ["Se Python-versjon", "Undersøke importstier", "Avslutte et program kontrollert"],
    steps: ["Importer sys.", "Les en opplysning som sys.version.", "Bruk verktøyet til å forstå miljøet, ikke som førstevalg i vanlige oppgaver."],
    commands: [
      { code: "sys.version", explanation: "viser Python-versjonen" },
      { code: "sys.modules", explanation: "inneholder bibliotekene som er lastet" },
      { code: "sys.exit()", explanation: "stopper programmet kontrollert" },
    ],
    example: `import sys

print("Python-versjon:", sys.version.split()[0])
print("Plattform:", sys.platform)
print("math er lastet:", "math" in sys.modules)`,
    challenge: "Importer math og undersøk deretter på nytt om math finnes i sys.modules.",
    note: "sys.argv fungerer annerledes i en nettleser enn når et program startes fra Terminal.",
  },
  {
    id: "string", name: "string", importCode: "import string", availability: "standard", group: "Tekst, filer og tid", level: "Neste steg",
    tagline: "Ferdige samlinger av bokstaver, sifre og tegn.",
    intro: "string inneholder nyttige tegnsett. Det kan brukes når du lager koder, analyserer tekst eller vil unngå å skrive alfabetet selv.",
    useCases: ["Tegnkategorier", "Enkle kodegeneratorer", "Tekstanalyse"],
    steps: ["Importer string.", "Velg et tegnsett.", "Kombiner det med en løkke eller random.choice."],
    commands: [
      { code: "string.ascii_lowercase", explanation: "engelske små bokstaver" },
      { code: "string.digits", explanation: "sifrene 0–9" },
      { code: "string.punctuation", explanation: "vanlige spesialtegn" },
    ],
    example: `import string
import random

tegn = string.ascii_uppercase + string.digits
kode = "".join(random.choice(tegn) for _ in range(6))

print("Tilfeldig kode:", kode)`,
    challenge: "Lag en kode med tre bokstaver, bindestrek og tre sifre.",
    note: "ascii-bokstavene inneholder ikke æ, ø og å.",
  },
  {
    id: "textwrap", name: "textwrap", importCode: "import textwrap", availability: "standard", group: "Tekst, filer og tid", level: "Neste steg",
    tagline: "Del lange tekster i lesbare linjer.",
    intro: "textwrap formaterer tekst uten at du må telle tegn selv. Det er nyttig for dialog, konsollspill og tekstbaserte presentasjoner.",
    useCases: ["Bryte lange linjer", "Rydde innrykket flerlinjet tekst", "Lage tekstbokser"],
    steps: ["Importer textwrap.", "Velg ønsket linjebredde.", "Bruk wrap for en liste eller fill for én ferdig tekst."],
    commands: [
      { code: "textwrap.fill(tekst, width=35)", explanation: "lager en tekst med linjeskift" },
      { code: "textwrap.dedent(tekst)", explanation: "fjerner felles innrykk" },
    ],
    example: `import textwrap

tekst = "Python kan dele en lang forklaring i kortere linjer som er lettere å lese."
ryddig = textwrap.fill(tekst, width=28)

print(ryddig)`,
    challenge: "Lag en liten tekstboks med en overskrift og linjer på maksimalt 30 tegn.",
    note: "Bredden teller tegn, ikke den synlige pikselbredden på bokstavene.",
  },
  {
    id: "copy", name: "copy", importCode: "import copy", availability: "standard", group: "Programmeringsverktøy", level: "Videre",
    tagline: "Kopier lister og nøstede datastrukturer riktig.",
    intro: "Når to variabler peker til samme liste, påvirker en endring begge. copy kan lage en uavhengig kopi, også når listen inneholder andre lister.",
    useCases: ["Spillbrett", "Tilstander før og etter", "Nøstede lister"],
    steps: ["Lag den opprinnelige datastrukturen.", "Bruk deepcopy når innholdet også skal kopieres.", "Endre kopien og sammenlign."],
    commands: [
      { code: "copy.copy(verdi)", explanation: "lager en grunn kopi" },
      { code: "copy.deepcopy(verdi)", explanation: "kopierer også nøstede lister og ordbøker" },
    ],
    example: `import copy

brett = [[0, 0], [0, 0]]
nytt_brett = copy.deepcopy(brett)
nytt_brett[0][0] = 1

print("Gammelt:", brett)
print("Nytt:", nytt_brett)`,
    challenge: "Prøv nytt_brett = brett først. Forklar hvorfor begge endres.",
    note: "For en enkel liste holder ofte liste.copy().",
  },
  {
    id: "functools", name: "functools", importCode: "from functools import reduce", availability: "standard", group: "Programmeringsverktøy", level: "Videre",
    tagline: "Verktøy som bygger videre på funksjoner.",
    intro: "functools er for funksjoner som arbeider med andre funksjoner. Dette er videre stoff; vanlige løkker er ofte tydeligere for nybegynnere.",
    useCases: ["Kombinere verdier", "Huske funksjonsresultater", "Lage nye funksjonsvarianter"],
    steps: ["Forstå først funksjonen som skal brukes.", "Importer bare verktøyet du trenger.", "Sammenlign gjerne med en vanlig løkke."],
    commands: [
      { code: "reduce(funksjon, liste)", explanation: "kombinerer listen trinn for trinn" },
      { code: "functools.lru_cache", explanation: "kan huske tidligere funksjonssvar" },
    ],
    example: `from functools import reduce

tall = [2, 3, 4]
produkt = reduce(lambda a, b: a * b, tall)

print("Produkt:", produkt)`,
    challenge: "Lag samme produkt med en for-løkke. Hvilken versjon er lettest å forklare?",
    note: "Velg en tydelig løkke hvis reduce gjør tankegangen vanskeligere å se.",
  },
  {
    id: "operator", name: "operator", importCode: "import operator", availability: "standard", group: "Programmeringsverktøy", level: "Videre",
    tagline: "Operatorer som funksjoner, nyttig ved sortering.",
    intro: "operator gjør +, * og uthenting av verdier tilgjengelig som navngitte funksjoner. itemgetter er et ryddig verktøy for å sortere tabell-lignende data.",
    useCases: ["Sortere på en kolonne", "Funksjoner som argument", "Utforske operatorer"],
    steps: ["Importer operator.", "Velg hvilken posisjon eller nøkkel som skal styre.", "Send funksjonen til sorted som key."],
    commands: [
      { code: "operator.itemgetter(1)", explanation: "henter element nummer 1 fra hver rad" },
      { code: "operator.add(a, b)", explanation: "gjør det samme som a + b" },
    ],
    example: `import operator

resultater = [("Ada", 8), ("Bo", 12), ("Celine", 10)]
sortert = sorted(resultater, key=operator.itemgetter(1), reverse=True)

for navn, poeng in sortert:
    print(navn, poeng)`,
    challenge: "Sorter en liste med (vare, pris) først etter pris og så etter navn.",
    note: "En lambda kan gjøre det samme; velg formen dere forstår best.",
  },
  {
    id: "bisect", name: "bisect", importCode: "import bisect", availability: "standard", group: "Programmeringsverktøy", level: "Videre",
    tagline: "Sett inn verdier på riktig plass i en sortert liste.",
    intro: "bisect finner raskt hvor en verdi hører hjemme i en liste som allerede er sortert.",
    useCases: ["Holde en liste sortert", "Finne innsettingsplass", "Klassifisere tall i intervaller"],
    steps: ["Start med en sortert liste.", "Bruk bisect_left for å finne posisjonen.", "Bruk insort hvis verdien skal settes inn."],
    commands: [
      { code: "bisect.bisect_left(liste, verdi)", explanation: "finner første mulige plass" },
      { code: "bisect.insort(liste, verdi)", explanation: "setter inn uten å ødelegge sorteringen" },
    ],
    example: `import bisect

poeng = [3, 7, 9, 12]
nytt = 8
plass = bisect.bisect_left(poeng, nytt)
bisect.insort(poeng, nytt)

print("Plass:", plass)
print("Ny liste:", poeng)`,
    challenge: "Lag karaktergrenser og bruk bisect til å finne intervallet et poeng hører til.",
    note: "Resultatet blir feil hvis listen ikke var sortert først.",
  },
  {
    id: "heapq", name: "heapq", importCode: "import heapq", availability: "standard", group: "Programmeringsverktøy", level: "Videre",
    tagline: "Finn de minste eller største verdiene effektivt.",
    intro: "heapq arbeider med prioritetskøer. Til skolebruk er nsmallest og nlargest de enkleste inngangene.",
    useCases: ["Topp tre resultater", "Prioritetskø", "Finne ekstremverdier"],
    steps: ["Importer heapq.", "Velg hvor mange resultater du vil ha.", "Bruk en key-funksjon hvis dataene er par eller ordbøker."],
    commands: [
      { code: "heapq.nlargest(3, tall)", explanation: "gir de tre største" },
      { code: "heapq.nsmallest(3, tall)", explanation: "gir de tre minste" },
    ],
    example: `import heapq

poeng = [7, 12, 4, 15, 9, 13]

print("Tre høyeste:", heapq.nlargest(3, poeng))
print("To laveste:", heapq.nsmallest(2, poeng))`,
    challenge: "Finn de tre billigste varene fra en liste med (pris, navn).",
    note: "For små lister er sorted ofte enklere å lese.",
  },
  {
    id: "array", name: "array", importCode: "from array import array", availability: "standard", group: "Data og visualisering", level: "Videre",
    tagline: "Kompakte samlinger av tall med samme type.",
    intro: "array ligner en liste, men alle verdiene må ha samme talltype. NumPy er som regel rikere til matematikk, mens array er et lett standardverktøy.",
    useCases: ["Lagre mange like tall", "Utforske datatyper", "Sammenligne med lister"],
    steps: ["Importer array-klassen.", "Velg typekode, for eksempel d for desimaltall.", "Legg til og les verdier omtrent som i en liste."],
    commands: [
      { code: "array(\"d\", [1.5, 2.0])", explanation: "lager et array med desimaltall" },
      { code: "verdier.append(3.5)", explanation: "legger til en verdi av samme type" },
    ],
    example: `from array import array

temperaturer = array("d", [12.5, 14.0, 13.5])
temperaturer.append(15.0)

print("Verdier:", temperaturer.tolist())
print("Gjennomsnitt:", sum(temperaturer) / len(temperaturer))`,
    challenge: "Prøv å legge inn tekst i tall-arrayet. Les feilen og forklar hva typekoden gjør.",
    note: "Bruk vanlig liste først hvis du ikke trenger at alle verdiene har samme type.",
  },
  {
    id: "enum", name: "enum", importCode: "from enum import Enum", availability: "standard", group: "Programmeringsverktøy", level: "Videre",
    tagline: "Gi tydelige navn til et fast sett med valg.",
    intro: "Enum samler lovlige tilstander under tydelige navn. Det kan gjøre spillkode og modeller mindre fulle av magiske tall og tekstverdier.",
    useCases: ["Spilltilstander", "Faste kategorier", "Tydeligere regler"],
    steps: ["Importer Enum.", "Lag en klasse med de lovlige valgene.", "Sammenlign variabelen med et av de navngitte valgene."],
    commands: [
      { code: "class Tilstand(Enum):", explanation: "starter en gruppe navngitte valg" },
      { code: "Tilstand.SPILLER", explanation: "henter ett bestemt valg" },
    ],
    example: `from enum import Enum

class Tilstand(Enum):
    KLAR = 1
    SPILLER = 2
    FERDIG = 3

tilstand = Tilstand.SPILLER
if tilstand == Tilstand.SPILLER:
    print("Runden pågår")`,
    challenge: "Lag en Enum for trafikklys og skriv en regel for hver farge.",
    note: "Enum er nyttig når valgene er faste. En vanlig variabel er enklere for mange små programmer.",
  },
  {
    id: "typing", name: "typing", importCode: "# Innebygde typehint: list[float] og -> float", availability: "standard", group: "Programmeringsverktøy", level: "Videre",
    tagline: "Beskriv hvilke typer verdier funksjoner forventer.",
    intro: "typing lar deg skrive typehint. Python kjører fortsatt dynamisk, men hintene gjør større programmer lettere å lese og gir bedre forslag i avanserte editorer.",
    useCases: ["Dokumentere funksjoner", "Forstå returverdier", "Bedre editorhjelp"],
    steps: ["Skriv typen etter parameteren.", "Skriv returtypen etter ->.", "Husk at hintet forklarer; det konverterer ikke verdien."],
    commands: [
      { code: "def areal(side: float) -> float:", explanation: "sier at funksjonen forventer og gir desimaltall" },
      { code: "list[int]", explanation: "betyr en liste med heltall" },
    ],
    example: `def gjennomsnitt(tall: list[float]) -> float:
    return sum(tall) / len(tall)

maalinger: list[float] = [3.5, 4.0, 5.5]
print(gjennomsnitt(maalinger))`,
    challenge: "Legg typehint til en funksjon som tar navn og alder og returnerer en tekst.",
    note: "Typehint stopper ikke automatisk feil type når programmet kjører.",
  },
  {
    id: "unicodedata", name: "unicodedata", importCode: "import unicodedata", availability: "standard", group: "Tekst, filer og tid", level: "Videre",
    tagline: "Undersøk og normaliser bokstaver og symboler.",
    intro: "Unicode inneholder bokstaver og tegn fra mange språk. unicodedata kan forklare tegn og gjøre ulikt kodede tekster sammenlignbare.",
    useCases: ["Norske tegn", "Tegninformasjon", "Normalisere tekst"],
    steps: ["Importer unicodedata.", "Velg et tegn eller en tekst.", "Bruk name for forklaring eller normalize for lik representasjon."],
    commands: [
      { code: "unicodedata.name(\"ø\")", explanation: "gir det offisielle tegnnavnet" },
      { code: "unicodedata.normalize(\"NFC\", tekst)", explanation: "samler tegn til en vanlig form" },
    ],
    example: `import unicodedata

tegn = "ø"
print("Tegn:", tegn)
print("Navn:", unicodedata.name(tegn))
print("Kategori:", unicodedata.category(tegn))`,
    challenge: "Skriv ut navn og kategori for æ, å, €, π og ✓.",
    note: "To tekster kan se like ut på skjermen, men bestå av forskjellige Unicode-koder.",
  },
  {
    id: "numpy", name: "NumPy", importCode: "import numpy as np", availability: "offline", group: "Matematikk", level: "Neste steg",
    tagline: "Regn med mange tall samtidig.",
    intro: "NumPy bruker arrays. Når x er et array, kan én formel regnes ut for alle x-verdiene på én gang. Det gjør NumPy særlig nyttig til funksjoner og større datasett.",
    useCases: ["Verditabeller", "Funksjoner og grafer", "Statistikk på mange tall"],
    steps: ["Importer numpy as np.", "Lag et array med array, arange eller linspace.", "Skriv én regneoperasjon som virker på alle verdiene."],
    commands: [
      { code: "np.array([1, 2, 3])", explanation: "lager et array fra en liste" },
      { code: "np.linspace(-5, 5, 101)", explanation: "lager 101 jevnt fordelte tall" },
      { code: "np.mean(tall)", explanation: "finner gjennomsnittet" },
    ],
    example: `import numpy as np

x = np.arange(-3, 4)
y = x ** 2 + 2 * x - 3

print("x:", x)
print("f(x):", y)
print("Gjennomsnitt:", np.mean(y))`,
    challenge: "Lag x-verdier fra -5 til 5 og regn ut y = 2x + 3.",
    note: "Et NumPy-array og en vanlig Python-liste oppfører seg ulikt ved regneoperasjoner.",
  },
  {
    id: "pandas", name: "pandas", importCode: "import pandas as pd", availability: "offline", group: "Data og visualisering", level: "Neste steg",
    tagline: "Arbeid med tabeller i rader og kolonner.",
    intro: "pandas bruker DataFrame. Du kan lese CSV, velge kolonner, filtrere rader og beregne statistikk med navn som ligner tabellarbeid.",
    useCases: ["CSV-filer", "Filtrere data", "Gruppere og oppsummere"],
    steps: ["Importer pandas as pd.", "Lag en DataFrame eller les en CSV-fil.", "Velg en kolonne og bruk en beregning."],
    commands: [
      { code: "pd.DataFrame(data)", explanation: "lager en tabell" },
      { code: "pd.read_csv(\"fil.csv\", sep=\";\")", explanation: "leser en CSV-fil" },
      { code: "tabell[\"poeng\"].mean()", explanation: "finner gjennomsnitt i kolonnen" },
    ],
    example: `import pandas as pd

tabell = pd.DataFrame({
    "navn": ["Ada", "Bo", "Celine"],
    "poeng": [8, 12, 10]
})

print(tabell.to_string(index=False))
print("Gjennomsnitt:", tabell["poeng"].mean())`,
    challenge: "Filtrer tabellen slik at bare elever med minst 10 poeng vises.",
    note: "Kolonnenavn må skrives nøyaktig. Kontroller datatypen hvis tall ble lest som tekst.",
  },
  {
    id: "matplotlib", name: "Matplotlib", importCode: "import matplotlib.pyplot as plt", availability: "offline", group: "Data og visualisering", level: "Neste steg",
    tagline: "Tegn grafer, diagrammer og matematiske figurer.",
    intro: "Matplotlib gjør tall om til figurer. En eksamensklar graf trenger vanligvis aksetitler, rutenett, passende målestokk og forklaring av hva grafen viser.",
    useCases: ["Funksjonsgrafer", "Punkt- og linjediagram", "Stolper og histogram"],
    steps: ["Importer pyplot as plt.", "Gi plot-funksjonen x- og y-verdier.", "Legg til aksetitler, tittel og rutenett før plt.show()."],
    commands: [
      { code: "plt.plot(x, y)", explanation: "tegner linje eller funksjonsgraf" },
      { code: "plt.scatter(x, y)", explanation: "tegner enkeltpunkter" },
      { code: "plt.xlabel(\"Tid (s)\")", explanation: "gir x-aksen tittel og enhet" },
      { code: "plt.axis(\"equal\")", explanation: "gir samme målestokk på begge akser" },
    ],
    example: `import matplotlib.pyplot as plt

x = [0, 1, 2, 3, 4]
y = [0, 1, 4, 9, 16]

plt.plot(x, y, marker="o", label="y = x²")
plt.xlabel("x")
plt.ylabel("y")
plt.title("Kvadratfunksjonen")
plt.grid()
plt.legend()
plt.show()`,
    challenge: "Tegn y = 2x + 3 med aksetitler, enheter og forklaring.",
    note: "Resultatet vises i appen. Bruk lagreknappen ved figuren for å hente ut bildet.",
  },
  {
    id: "scipy", name: "SciPy", importCode: "from scipy import stats", availability: "offline", group: "Matematikk", level: "Videre",
    tagline: "Regresjon, sannsynlighet og videre numeriske metoder.",
    intro: "SciPy bygger på NumPy og har mer avanserte matematiske verktøy. stats.linregress er en forståelig inngang til regresjon på ungdomstrinnet.",
    useCases: ["Lineær regresjon", "Sannsynlighetsfordelinger", "Numeriske løsninger"],
    steps: ["Importer den delen du trenger.", "Gi funksjonen parvise data med samme lengde.", "Tolk modellen matematisk – ikke bare skriv ut tallene."],
    commands: [
      { code: "stats.linregress(x, y)", explanation: "finner en lineær modell y = ax + b" },
      { code: "stats.pearsonr(x, y)", explanation: "måler lineær samvariasjon" },
    ],
    example: `from scipy import stats

x = [1, 2, 3, 4, 5]
y = [3, 5, 8, 9, 12]
modell = stats.linregress(x, y)

print("Stigningstall:", round(modell.slope, 2))
print("Konstantledd:", round(modell.intercept, 2))
print("R²:", round(modell.rvalue ** 2, 3))`,
    challenge: "Bruk modellen til å anslå y når x = 6, og vurder om anslaget er rimelig.",
    note: "Sterk sammenheng betyr ikke automatisk at x er årsaken til y.",
  },
  {
    id: "sympy", name: "SymPy", importCode: "import sympy as sp", availability: "offline", group: "Matematikk", level: "Videre",
    tagline: "Eksakt algebra med symboler og ligninger.",
    intro: "SymPy lar x være et matematisk symbol i stedet for en variabel med én verdi. Da kan Python forenkle uttrykk og løse ligninger eksakt.",
    useCases: ["Løse ligninger", "Faktorisere", "Kontrollere algebra"],
    steps: ["Importer sympy as sp.", "Lag symbolet x.", "Bygg uttrykket eller ligningen, og velg solve, expand eller factor."],
    commands: [
      { code: "x = sp.symbols(\"x\")", explanation: "lager et matematisk symbol" },
      { code: "sp.Eq(venstre, hoyre)", explanation: "lager en ligning" },
      { code: "sp.solve(ligning, x)", explanation: "finner løsninger" },
      { code: "sp.factor(uttrykk)", explanation: "faktoriserer" },
    ],
    example: `import sympy as sp

x = sp.symbols("x")
ligning = sp.Eq(3 * x - 5, 16)

print("Løsning:", sp.solve(ligning, x))
print("Kontroll:", 3 * 7 - 5)`,
    challenge: "Løs 2(x + 4) = 18 og kontroller svaret i den opprinnelige ligningen.",
    note: "Lag likningen med sp.Eq. To argumenter til solve betyr ikke automatisk venstre og høyre side.",
  },
  {
    id: "sklearn", name: "scikit-learn", importCode: "from sklearn.linear_model import LinearRegression", availability: "offline", group: "Data og visualisering", level: "Videre",
    tagline: "Bygg og prøv enkle modeller fra data.",
    intro: "scikit-learn er et bibliotek for maskinlæring. LinearRegression lar dere undersøke hvordan en modell lærer en rett linje fra eksempler.",
    useCases: ["Lineær modell", "Prediksjon", "Forstå trening og test"],
    steps: ["Lag X som rader med egenskaper og y som svar.", "Opprett modellen og bruk fit.", "Bruk predict på en ny verdi og vurder resultatet."],
    commands: [
      { code: "LinearRegression()", explanation: "lager en tom lineær modell" },
      { code: "modell.fit(X, y)", explanation: "tilpasser modellen til dataene" },
      { code: "modell.predict([[6]])", explanation: "lager et anslag for en ny verdi" },
    ],
    example: `import numpy as np
from sklearn.linear_model import LinearRegression

timer = np.array([[1], [2], [3], [4], [5]])
poeng = np.array([3, 5, 8, 9, 12])

modell = LinearRegression()
modell.fit(timer, poeng)
print("Anslag:", round(modell.predict([[6]])[0], 1))`,
    challenge: "Endre ett datapunkt kraftig. Hvordan påvirker det anslaget?",
    note: "En modell finner mønstre i data; den forstår ikke situasjonen og kan gi dårlige anslag utenfor dataområdet.",
  },
  {
    id: "PIL", name: "Pillow", importCode: "from PIL import Image, ImageDraw", availability: "offline", group: "Spill og skapende", level: "Neste steg",
    tagline: "Lag og bearbeid bilder med piksler og tegneformer.",
    intro: "Pillow er Python-biblioteket PIL. Det kan lage bilder, tegne figurer og lese bildefiler. I Skolepython kan bildet vises gjennom Matplotlib.",
    useCases: ["Generativ kunst", "Pikselbilder", "Tegne geometriske mønstre"],
    steps: ["Importer Image og ImageDraw.", "Lag et bilde med størrelse og bakgrunn.", "Tegn figurer og vis bildet med Matplotlib."],
    commands: [
      { code: "Image.new(\"RGB\", (600, 400), \"white\")", explanation: "lager et tomt fargebilde" },
      { code: "ImageDraw.Draw(bilde)", explanation: "lager et tegneverktøy" },
      { code: "tegn.rectangle((x1, y1, x2, y2))", explanation: "tegner et rektangel" },
    ],
    example: `from PIL import Image, ImageDraw
import matplotlib.pyplot as plt

bilde = Image.new("RGB", (500, 300), "#fffdf8")
tegn = ImageDraw.Draw(bilde)

for x in range(50, 451, 50):
    tegn.ellipse((x - 18, 132, x + 18, 168), fill="#f06f51")

plt.imshow(bilde)
plt.axis("off")
plt.show()`,
    challenge: "Lag et symmetrisk mønster av sirkler og rektangler.",
    note: "Pillow bruker koordinater fra øverst til venstre, slik som Pygame.",
  },
  {
    id: "networkx", name: "NetworkX", importCode: "import networkx as nx", availability: "offline", group: "Data og visualisering", level: "Videre",
    tagline: "Undersøk forbindelser, ruter og matematiske nettverk.",
    intro: "NetworkX arbeider med grafer i betydningen noder og forbindelser – ikke funksjonsgrafer. Det passer til ruter, vennskapsnettverk og avhengigheter.",
    useCases: ["Korteste rute", "Nettverk", "Noder og kanter"],
    steps: ["Importer networkx as nx.", "Lag en graf og legg til forbindelser.", "Undersøk ruter eller tegn nettverket."],
    commands: [
      { code: "nx.Graph()", explanation: "lager et nettverk uten retning" },
      { code: "graf.add_edge(a, b)", explanation: "kobler sammen to noder" },
      { code: "nx.shortest_path(graf, start, slutt)", explanation: "finner en kort rute" },
    ],
    example: `import networkx as nx
import matplotlib.pyplot as plt

graf = nx.Graph()
graf.add_edges_from([
    ("Skole", "Bibliotek"),
    ("Skole", "Hall"),
    ("Bibliotek", "Sentrum")
])

print(nx.shortest_path(graf, "Skole", "Sentrum"))
nx.draw(graf, with_labels=True)
plt.show()`,
    challenge: "Lag et lite bussnettverk og finn en rute mellom to holdeplasser.",
    note: "Dette er nettverksgrafer. Bruk Matplotlib til funksjonsgrafer.",
  },
  {
    id: "shapely", name: "Shapely", importCode: "from shapely.geometry import Polygon", availability: "offline", group: "Matematikk", level: "Videre",
    tagline: "Regn med geometriske figurer og områder.",
    intro: "Shapely representerer punkter, linjer og mangekanter. Biblioteket kan finne areal, omkrets, overlapp og avstand mellom figurer.",
    useCases: ["Areal og omkrets", "Overlappende områder", "Buffer og avstand"],
    steps: ["Importer en geometritype.", "Lag figuren fra koordinater.", "Les egenskaper eller kombiner figurer."],
    commands: [
      { code: "Polygon([(x1, y1), ...])", explanation: "lager en mangekant" },
      { code: "figur.area", explanation: "gir arealet" },
      { code: "figur.buffer(1)", explanation: "lager en sone én enhet rundt figuren" },
      { code: "a.intersection(b)", explanation: "finner overlappet" },
    ],
    example: `from shapely.geometry import Polygon

figur = Polygon([(0, 0), (6, 0), (5, 4), (1, 5)])

print("Areal:", figur.area)
print("Omkrets:", round(figur.length, 2))
print("Gyldig figur:", figur.is_valid)`,
    challenge: "Lag to rektangler og finn arealet av området der de overlapper.",
    note: "Shapely regner på koordinater, men tegner ikke alene. Kombiner med Matplotlib for visning.",
  },
  {
    id: "pygame", name: "Pygame", importCode: "import pygame", availability: "offline", group: "Spill og skapende", level: "Neste steg",
    tagline: "Lag 2D-spill med grafikk, tastatur og kollisjon.",
    intro: "Pygame gir spillflate, figurer, tastatur og lyd. Bruk Pygame-laben, der koden kjører i en egen spillflate og kan styres med tastene.",
    useCases: ["2D-spill", "Animasjon", "Interaktive simuleringer"],
    steps: ["Åpne Pygame-laben.", "Start Pygame og lag spillflaten.", "Bruk en spilløkke som leser, oppdaterer og tegner.", "Gi nettleseren tid med await asyncio.sleep(0)."],
    commands: [
      { code: "pygame.init()", explanation: "starter Pygame" },
      { code: "pygame.display.set_mode((800, 500))", explanation: "lager spillflaten" },
      { code: "pygame.key.get_pressed()", explanation: "leser tastene" },
      { code: "figur.colliderect(maal)", explanation: "sjekker kollisjon" },
    ],
    example: `import pygame
import asyncio

pygame.init()
skjerm = pygame.display.set_mode((800, 500))
klokke = pygame.time.Clock()
spiller = pygame.Rect(370, 220, 60, 60)

kjorer = True
while kjorer:
    for hendelse in pygame.event.get():
        if hendelse.type == pygame.QUIT:
            kjorer = False

    skjerm.fill((20, 45, 55))
    pygame.draw.rect(skjerm, (244, 111, 78), spiller)
    pygame.display.flip()
    await asyncio.sleep(0)
    klokke.tick(60)

pygame.quit()`,
    challenge: "Åpne Pygame-kurset og bygg «Fang mynten» steg for steg.",
    note: "Vanlige skrivebordseksempler må tilpasses nettleseren med await asyncio.sleep(0).",
  },
  {
    id: "turtle", name: "Turtle", importCode: "from turtle import *", availability: "local", group: "Spill og skapende", level: "Start her",
    tagline: "Tegn geometri ved å styre en digital penn.",
    intro: "Turtle gjør bevegelse og vinkler synlige. Det passer godt til mangekanter, symmetri, spiraler og skapende mønstre som kan eksporteres til SVG.",
    useCases: ["Mangekanter", "Vinkler og rotasjon", "Mønster til vinylkutter og laser"],
    steps: ["Importer Turtle-kommandoene.", "Flytt pennen med forward.", "Drei med left eller right.", "Avslutt med done()."],
    commands: [
      { code: "forward(100)", explanation: "går 100 enheter fram" },
      { code: "left(90)", explanation: "dreier 90 grader mot venstre" },
      { code: "pensize(4)", explanation: "endrer strektykkelsen" },
      { code: "color(\"blue\")", explanation: "endrer fargen" },
    ],
    example: `from turtle import *

color("#2f6b5f")
pensize(4)

for side in range(6):
    forward(90)
    left(60)

done()`,
    challenge: "Bytt antall sider og regn ut riktig ytre vinkel med 360 / antall_sider.",
    note: "Skolepython bruker en lokal Turtle som kan spilles av stegvis og eksporteres som SVG.",
  },
  {
    id: "spill", name: "Spill", importCode: "from spill import Snake", availability: "local", group: "Spill og skapende", level: "Start her",
    tagline: "Lag et spillbart Snake-brett med få linjer.",
    intro: "Spill er Skolepythons lokale nybegynnerbibliotek. Det skjuler tegnemotoren, slik at dere kan utforske variabler, regler og design før dere bygger alt selv i Pygame.",
    useCases: ["Første spill", "Endre regler med variabler", "Undersøke fart, brett og farger"],
    steps: ["Importer Snake.", "Lag spillet med valgte innstillinger.", "Start med spill.start().", "Endre én verdi og sammenlign."],
    commands: [
      { code: "Snake(bredde=18, hoyde=12)", explanation: "lager et Snake-brett" },
      { code: "fart=6", explanation: "bestemmer spilltempoet" },
      { code: "gjennom_vegg=False", explanation: "bestemmer veggregelen" },
      { code: "spill.start()", explanation: "viser og starter spillet" },
    ],
    example: `from spill import Snake

spill = Snake(
    bredde=18,
    hoyde=12,
    fart=6,
    gjennom_vegg=False,
    tittel="Mitt Snake-spill"
)

spill.start()`,
    challenge: "Lag tre vanskelighetsgrader ved å endre brettstørrelse og fart.",
    note: "Spill er laget spesielt for Skolepython og finnes ikke i en vanlig Python-installasjon.",
  },
];
