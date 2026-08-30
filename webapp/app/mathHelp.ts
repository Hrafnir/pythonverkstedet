export type MathHelpTutorial = {
  id: string;
  category: "Matematikk" | "Biblioteker";
  title: string;
  question: string;
  intro: string;
  steps: string[];
  example: string;
  notice: string;
  challenge: string;
};

// Korte, kjørbare oppskrifter for elever som trenger hjelp uten å forlate editoren.
export const mathHelpTutorials: MathHelpTutorial[] = [
  {
    id: "choose-math-library",
    category: "Biblioteker",
    title: "Hvilket matematikkbibliotek skal jeg velge?",
    question: "Jeg vet hva jeg vil regne ut, men ikke hvilket bibliotek som passer.",
    intro: "Start med det enkleste verktøyet som løser oppgaven. Vanlig Python dekker grunnregning. math passer til én beregning, statistics til en vanlig talliste, NumPy til mange tall, pandas til tabeller, SymPy til algebra og SciPy til mer avansert statistikk.",
    steps: [
      "Vanlig Python: +, -, *, /, **, sum, min, max og round trenger ingen import.",
      "math og statistics følger med Python og er gode førstevalg på ungdomstrinnet.",
      "NumPy og pandas er nyttige når datasettet eller verditabellen blir større.",
      "SymPy viser eksakte algebraiske svar. SciPy og scikit-learn passer til regresjon og videre utforsking.",
    ],
    example: `import math
import statistics

tall = [4, 7, 7, 9, 13]

print("Kvadratrot:", math.sqrt(81))
print("Gjennomsnitt:", statistics.mean(tall))
print("Median:", statistics.median(tall))`,
    notice: "import alene viser ikke noe. Først importerer du verktøyet, deretter bruker du for eksempel math.sqrt(...).",
    challenge: "Søk etter «gjennomsnitt», «ligning» og «graf» i hjelpen. Hvilket bibliotek foreslås til hver oppgave?",
  },
  {
    id: "math-geometry",
    category: "Matematikk",
    title: "Kvadratrot, Pytagoras og sirkel",
    question: "Hvordan bruker jeg math.sqrt og math.pi i geometri?",
    intro: "math inneholder matematiske funksjoner og konstanter. Biblioteket regner ikke ut hele oppgaven for deg; du må fortsatt lage riktig formel og gi svaret en enhet.",
    steps: [
      "Skriv import math én gang øverst.",
      "math.sqrt(tall) finner kvadratroten. I Pytagoras er hypotenusen sqrt(a² + b²).",
      "math.pi gir en presis verdi av π til sirkelberegninger.",
      "Bruk round eller en f-tekst for å vise et passe antall desimaler.",
    ],
    example: `import math

a = 3
b = 4
hypotenus = math.sqrt(a ** 2 + b ** 2)

radius = 5
omkrets = 2 * math.pi * radius
areal = math.pi * radius ** 2

print(f"Hypotenusen er {hypotenus:.1f}")
print(f"Sirkelens omkrets er {omkrets:.2f}")
print(f"Sirkelens areal er {areal:.2f}")`,
    notice: "Potens skrives med **, ikke ^. math.sqrt kan ikke finne en reell kvadratrot av et negativt tall.",
    challenge: "La brukeren skrive inn radius med input og float. Vis både omkrets og areal med enhet.",
  },
  {
    id: "statistics-center",
    category: "Matematikk",
    title: "Gjennomsnitt, median og typetall",
    question: "Hvordan finner jeg sentralmål for en liste med tall?",
    intro: "Sentralmål beskriver hva som er typisk i et datasett. Gjennomsnitt bruker alle verdiene, median finner midten, og typetall finner det som forekommer oftest.",
    steps: [
      "Importer statistics og lag en liste med tall.",
      "statistics.mean finner summen delt på antallet.",
      "statistics.median sorterer verdiene tankemessig og finner midten.",
      "statistics.multimode gir en liste med alle typetallene dersom flere er like vanlige.",
    ],
    example: `import statistics

poeng = [4, 7, 7, 8, 9, 13]

print("Gjennomsnitt:", statistics.mean(poeng))
print("Median:", statistics.median(poeng))
print("Typetall:", statistics.multimode(poeng))
print("Variasjonsbredde:", max(poeng) - min(poeng))`,
    notice: "En tom liste har ikke gjennomsnitt eller median. Gjennomsnittet kan også påvirkes mye av én svært stor eller liten verdi.",
    challenge: "Legg til verdien 100. Sammenlign hva som skjer med gjennomsnittet og medianen, og forklar forskjellen.",
  },
  {
    id: "statistics-spread",
    category: "Matematikk",
    title: "Spredning, kvartiler og standardavvik",
    question: "Hvordan beskriver jeg hvor mye tallene varierer?",
    intro: "To datasett kan ha samme gjennomsnitt, men svært ulik spredning. Variasjonsbredde er størst minus minst. Kvartiler deler sorterte data i fire, og standardavvik måler typisk avstand fra gjennomsnittet.",
    steps: [
      "max(tall) - min(tall) gir variasjonsbredden.",
      "statistics.quantiles(tall, n=4) gir tre kvartilgrenser.",
      "statistics.pstdev brukes når listen er hele datasettet du undersøker.",
      "statistics.stdev brukes når listen er et utvalg fra en større gruppe.",
    ],
    example: `import statistics

tall = [3, 5, 6, 7, 7, 8, 10, 14]
kvartiler = statistics.quantiles(tall, n=4)

print("Variasjonsbredde:", max(tall) - min(tall))
print("Nedre kvartil:", kvartiler[0])
print("Median:", statistics.median(tall))
print("Øvre kvartil:", kvartiler[2])
print("Standardavvik:", round(statistics.pstdev(tall), 2))`,
    notice: "stdev og pstdev bruker litt forskjellige formler. Velg pstdev når tallene utgjør hele gruppen i oppgaven.",
    challenge: "Lag to lister med samme gjennomsnitt, men forskjellig standardavvik. Hva må være annerledes i listene?",
  },
  {
    id: "math-trigonometry",
    category: "Matematikk",
    title: "Sinus, cosinus og tangens",
    question: "Hvordan bruker jeg vinkler i math uten å få et merkelig svar?",
    intro: "math.sin, math.cos og math.tan forventer radianer, mens skoleoppgaver vanligvis oppgir grader. Derfor gjør vi graden om med math.radians først.",
    steps: [
      "Importer math og lag en vinkel i grader.",
      "math.radians(vinkel) gjør grader om til radianer.",
      "Bruk math.sin, math.cos eller math.tan på radianverdien.",
      "De omvendte funksjonene asin, acos og atan gir radianer; bruk math.degrees for å få grader tilbake.",
    ],
    example: `import math

vinkel_grader = 35
vinkel = math.radians(vinkel_grader)
hypotenus = 10

motstaende = hypotenus * math.sin(vinkel)
hosliggende = hypotenus * math.cos(vinkel)

print(f"Motstående katet: {motstaende:.2f}")
print(f"Hosliggende katet: {hosliggende:.2f}")`,
    notice: "math.sin(35) tolker 35 som radianer, ikke 35°. Bruk math.sin(math.radians(35)).",
    challenge: "Finn vinkelen når motstående katet er 6 og hypotenusen er 10 ved å bruke asin og degrees.",
  },
  {
    id: "exact-fractions",
    category: "Matematikk",
    title: "Eksakte brøker og trygge pengebeløp",
    question: "Hvordan unngår jeg at 1/3 bare blir et avrundet desimaltall?",
    intro: "Fraction beholder teller og nevner og forkorter brøken automatisk. Decimal er nyttig når desimalene må være nøyaktige, for eksempel i pengeberegninger.",
    steps: [
      "Importer Fraction fra fractions og Decimal fra decimal.",
      "Fraction(1, 3) betyr en tredel og kan regnes med som en vanlig tallverdi.",
      "Lag Decimal fra tekst, for eksempel Decimal(\"19.90\"), for å bevare desimalene nøyaktig.",
      "Bruk float når små avrundingsforskjeller ikke har betydning; ikke gjør alt mer avansert enn nødvendig.",
    ],
    example: `from fractions import Fraction
from decimal import Decimal

brok = Fraction(1, 3) + Fraction(1, 6)
pris = Decimal("19.90")
antall = 3

print("Brøksvar:", brok)
print("Som desimaltall:", float(brok))
print("Pris:", pris * antall, "kr")`,
    notice: "Decimal(0.1) tar med float-ens gamle avrunding. Skriv Decimal(\"0.1\") med anførselstegn.",
    challenge: "Regn ut 2/5 + 3/10 eksakt. Lag deretter en pengeberegning med pris, antall og rabatt.",
  },
  {
    id: "numpy-math",
    category: "Biblioteker",
    title: "NumPy: regn med mange tall samtidig",
    question: "Hvordan lager jeg en verditabell uten å regne én verdi om gangen?",
    intro: "NumPy bruker arrays: tallserier der en regneoperasjon utføres på alle verdiene. Dette passer særlig godt til funksjoner, grafer og større datasett.",
    steps: [
      "Importer numpy as np og lag en serie med np.array, np.arange eller np.linspace.",
      "Når x er et array, regner x ** 2 ut kvadratet av hvert tall.",
      "np.mean, np.median, np.min, np.max og np.std beskriver serien.",
      "np.percentile kan finne kvartiler og andre prosentiler.",
    ],
    example: `import numpy as np

x = np.arange(-3, 4)
y = x ** 2 + 2 * x - 3

print("x:", x)
print("f(x):", y)
print("Gjennomsnitt:", np.mean(y))
print("Median:", np.median(y))
print("Standardavvik:", round(np.std(y), 2))`,
    notice: "En vanlig Python-liste ganger seg selv ved liste * 2. Et NumPy-array ganger derimot hver tallverdi med 2.",
    challenge: "Bytt funksjonen til y = 2 * x + 5. Finn minste og største y-verdi og tegn serien med Matplotlib.",
  },
  {
    id: "pandas-math",
    category: "Biblioteker",
    title: "pandas: regn på en tabell",
    question: "Hvordan finner jeg statistikk for én kolonne og filtrerer rader?",
    intro: "pandas bruker DataFrame til data i rader og kolonner. Du kan velge en kolonne med navnet, beregne statistikk og beholde bare radene som oppfyller et vilkår.",
    steps: [
      "Importer pandas as pd og lag eller les en DataFrame.",
      "tabell[\"poeng\"] velger poengkolonnen.",
      ".mean(), .median(), .min() og .max() regner på den valgte kolonnen.",
      "tabell[tabell[\"poeng\"] >= 10] beholder bare rader med minst 10 poeng.",
    ],
    example: `import pandas as pd

tabell = pd.DataFrame({
    "navn": ["Ada", "Bo", "Celine", "David"],
    "poeng": [8, 12, 10, 6]
})

print(tabell.to_string(index=False))
print("Gjennomsnitt:", tabell["poeng"].mean())
print("Minst 10 poeng:")
print(tabell[tabell["poeng"] >= 10].to_string(index=False))`,
    notice: "Kolonnenavnet må skrives nøyaktig som i tabellen. Tall som ble lest som tekst må gjøres om før de kan regnes med.",
    challenge: "Legg til en kolonne for klasse. Bruk groupby for å finne gjennomsnittet i hver klasse.",
  },
  {
    id: "sympy-algebra",
    category: "Biblioteker",
    title: "SymPy: løs ligninger og undersøk uttrykk",
    question: "Hvordan lar jeg Python regne med x som et matematisk symbol?",
    intro: "Vanlig Python behandler x som en variabel med en bestemt verdi. SymPy kan i stedet gjøre x til et symbol og gi eksakte algebraiske svar.",
    steps: [
      "Importer sympy as sp og lag x med sp.symbols(\"x\").",
      "sp.Eq(venstre, høyre) lager en ligning med to sider.",
      "sp.solve(ligning, x) finner verdier av x som gjør ligningen sann.",
      "sp.expand ganger ut, sp.factor faktoriserer og sp.simplify forenkler uttrykk.",
    ],
    example: `import sympy as sp

x = sp.symbols("x")
uttrykk = (x + 2) * (x - 3)
ligning = sp.Eq(3 * x - 5, 16)

print("Ganget ut:", sp.expand(uttrykk))
print("Faktorisert:", sp.factor(sp.expand(uttrykk)))
print("Løsning:", sp.solve(ligning, x))`,
    notice: "sp.solve(3 * x - 5, 16) betyr ikke 3x - 5 = 16. Lag ligningen med sp.Eq(3 * x - 5, 16).",
    challenge: "Løs 2(x + 4) = 18. Kontroller løsningen ved å sette tallet inn i begge sider.",
  },
  {
    id: "scipy-regression",
    category: "Biblioteker",
    title: "SciPy: lineær regresjon",
    question: "Hvordan finner jeg en rett linje som passer til målepunkter?",
    intro: "stats.linregress finner en modell y = ax + b. Modellen beskriver en trend, men den beviser ikke at x er årsaken til y.",
    steps: [
      "Importer stats fra scipy og lag like lange x- og y-lister.",
      "modell.slope er stigningstallet a, og modell.intercept er konstantleddet b.",
      "modell.rvalue ** 2 er R², et mål fra 0 til 1 på hvor tett punktene følger den rette linjen.",
      "Bruk modellen til anslag bare innenfor et område der det er rimelig.",
    ],
    example: `from scipy import stats

x = [1, 2, 3, 4, 5]
y = [3, 5, 8, 9, 12]
modell = stats.linregress(x, y)

print("Stigningstall:", round(modell.slope, 2))
print("Konstantledd:", round(modell.intercept, 2))
print("R²:", round(modell.rvalue ** 2, 3))

x_ny = 6
y_ny = modell.slope * x_ny + modell.intercept
print("Anslag når x er 6:", round(y_ny, 2))`,
    notice: "Regresjon krever parvise data: x og y må ha like mange verdier. En høy R² betyr ikke automatisk at modellen er faglig riktig.",
    challenge: "Endre ett punkt mye. Hva skjer med linjen og R²? Tegn både punktene og modellen.",
  },
];
