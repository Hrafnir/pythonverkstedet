"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, KeyboardEvent, ReactNode } from "react";

type Module = {
  id: number;
  title: string;
  shortTitle: string;
  eyebrow: string;
  question: string;
  intro: string;
  refresh: {
    title: string;
    body: string;
    examples: { code: string; explanation: string }[];
  };
  theory: { title: string; body: string; code?: string; steps: string[] }[];
  progression: {
    intro: string;
    steps: {
      label: string;
      title: string;
      body: string;
      code: string;
      tryThis: string;
      upgrade?: { title: string; body: string; code: string };
    }[];
  };
  starterCode: string;
  typingSteps: {
    kind: "write" | "do";
    code?: string;
    explanation: string;
  }[];
  polish: {
    title: string;
    body: string;
    before: string;
    after: string;
    explanation: string;
  };
  observe: string[];
  task: string;
  taskHint: string;
  expected: string[];
  teacher: {
    purpose: string;
    before: string[];
    misconceptions: string[];
    assess: string;
    extension: string;
  };
};

type LocalProject = {
  id: string;
  name: string;
  code: string;
  updatedAt: string;
};

type TurtleEvent = {
  kind: "line" | "move" | "turn" | "fill" | "dot" | "text" | "visibility" | "clear" | "background" | "title" | "screen";
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  heading?: number;
  visible?: boolean;
  color?: string;
  width?: number;
  size?: number;
  text?: string;
  align?: CanvasTextAlign;
  points?: [number, number][];
};

type TurtleDrawing = {
  events: TurtleEvent[];
  canvasWidth: number;
  canvasHeight: number;
  background: string;
  title: string;
  truncated?: boolean;
};

type TurtleVectorMode = "centerline" | "edges" | "outline";

type TurtleWorkshopSettings = {
  mode: TurtleVectorMode;
  strokeWidthMm: number;
  outputWidthMm: number;
  color: string;
  useCodeColors: boolean;
  useCodeWidths: boolean;
  includeFills: boolean;
  includeText: boolean;
  lineCap: "round" | "square";
};

type TurtlePath = {
  points: [number, number][];
  color: string;
  widthMm: number;
};

const defaultTurtleWorkshop: TurtleWorkshopSettings = {
  mode: "centerline",
  strokeWidthMm: 1,
  outputWidthMm: 150,
  color: "#173f3a",
  useCodeColors: true,
  useCodeWidths: true,
  includeFills: true,
  includeText: false,
  lineCap: "round",
};

const referenceCategories = ["Alle", "Kom i gang", "Styring", "Byggeklosser", "Utforske data", "Tegne og vise", "Videre"] as const;
type ReferenceCategory = (typeof referenceCategories)[number];

type PlaygroundReference = {
  id: string;
  category: Exclude<ReferenceCategory, "Alle">;
  level: "Start" | "Grunnmur" | "Utforsk" | "Videre";
  title: string;
  purpose: string;
  commands: { code: string; explanation: string }[];
  example: string;
  experiments: string[];
  tip?: string;
};

const snippetCategories = ["Alle", "Kom i gang", "Styring", "Byggeklosser", "Tilfeldighet", "Tegning"] as const;
type SnippetCategory = (typeof snippetCategories)[number];

type CodeSnippet = {
  id: string;
  category: Exclude<SnippetCategory, "Alle">;
  title: string;
  purpose: string;
  code: string;
  change: string;
};

const codeSnippets: CodeSnippet[] = [
  {
    id: "variabler",
    category: "Kom i gang",
    title: "Lag variabler",
    purpose: "Lagre tekst og tall under tydelige navn.",
    code: 'navn = "Ada"\nalder = 15',
    change: "Bytt ut Ada, alder og variabelnavnene.",
  },
  {
    id: "print",
    category: "Kom i gang",
    title: "Skriv et forståelig svar",
    purpose: "Vis tekst og en variabel i samme utskrift.",
    code: 'print("Hei", navn)\nprint("Du er", alder, "år.")',
    change: "Bytt teksten og variablene mellom kommaene.",
  },
  {
    id: "regning",
    category: "Kom i gang",
    title: "Regn med variabler",
    purpose: "Gang sammen verdier og lagre resultatet.",
    code: 'pris = 80\nantall = 3\ntotal = pris * antall\nprint("Total:", total, "kr")',
    change: "Endre pris, antall eller regneart.",
  },
  {
    id: "for-lokke",
    category: "Styring",
    title: "Gjenta med en for-løkke",
    purpose: "La n få verdiene 1, 2, 3, 4 og 5.",
    code: "for n in range(1, 6):\n    print(n)",
    change: "Endre start, stopp og det som skjer med innrykk.",
  },
  {
    id: "if-else",
    category: "Styring",
    title: "Velg med if og else",
    purpose: "Kjør ulik kode avhengig av et vilkår.",
    code: 'tall = 8\n\nif tall > 5:\n    print("Større enn 5")\nelse:\n    print("5 eller mindre")',
    change: "Endre tallet, sammenligningen og beskjedene.",
  },
  {
    id: "liste",
    category: "Byggeklosser",
    title: "Gå gjennom en liste",
    purpose: "Behandle flere verdier med den samme koden.",
    code: 'poeng = [3, 7, 10]\n\nfor verdi in poeng:\n    print("Poeng:", verdi)',
    change: "Legg til tall i listen eller regn med verdi.",
  },
  {
    id: "funksjon",
    category: "Byggeklosser",
    title: "Lag en funksjon",
    purpose: "Gi en liten oppskrift et navn og bruk den flere ganger.",
    code: 'def dobbel(tall):\n    return tall * 2\n\nprint(dobbel(5))',
    change: "Bytt navn, regneoperasjon og tallet i funksjonskallet.",
  },
  {
    id: "tilfeldig",
    category: "Tilfeldighet",
    title: "Trekk et tilfeldig tall",
    purpose: "Bruk random til terningkast og simuleringer.",
    code: 'import random\n\nkast = random.randint(1, 6)\nprint("Terningen viser", kast)',
    change: "Endre minste og største mulige verdi.",
  },
  {
    id: "graf",
    category: "Tegning",
    title: "Tegn en enkel graf",
    purpose: "Vis sammenhengen mellom x- og y-verdier.",
    code: 'import matplotlib.pyplot as plt\n\nx = [0, 1, 2, 3, 4]\ny = [0, 1, 4, 9, 16]\n\nplt.plot(x, y, marker="o")\nplt.grid()\nplt.show()',
    change: "Endre tallene i listene, fargen eller tittelen.",
  },
  {
    id: "turtle",
    category: "Tegning",
    title: "Tegn et Turtle-kvadrat",
    purpose: "Kombiner en løkke med lengde og vinkel.",
    code: 'from turtle import *\n\nfor side in range(4):\n    forward(120)\n    left(90)\n\ndone()',
    change: "Endre antall sider, lengde og vinkel.",
  },
];

const playgroundReferences: PlaygroundReference[] = [
  {
    id: "variabler",
    category: "Kom i gang",
    level: "Start",
    title: "Variabler, regning og print",
    purpose: "Lagre verdier, regn med dem og vis et forståelig svar.",
    commands: [
      { code: "navn = verdi", explanation: "Lagrer en verdi under et navn." },
      { code: "+  -  *  /", explanation: "Pluss, minus, gange og dele." },
      { code: "print(...) ", explanation: "Viser tekst og verdier i resultatfeltet." },
      { code: "+=  -=", explanation: "Legger til eller trekker fra og lagrer den nye verdien." },
    ],
    example: `pris = 80
antall = 3
total = pris * antall

print("Total:", total, "kr")`,
    experiments: [
      "Endre pris og antall. Forutsi svaret før du kjører.",
      "Legg til frakt = 59 og ta frakten med i totalen.",
      "Lag rabatt = 20 og bruk total -= rabatt.",
    ],
    tip: "Les en tildeling fra høyre: Regn ut høyresiden først, og lagre svaret i navnet til venstre.",
  },
  {
    id: "tekst",
    category: "Kom i gang",
    level: "Start",
    title: "Tekst, tall og pene svar",
    purpose: "Sett tekst og variabler sammen, og bestem hvordan tall skal vises.",
    commands: [
      { code: 'print("Hei", navn)', explanation: "Enkel start: skill delene med komma." },
      { code: 'f"Hei {navn}"', explanation: "En f-tekst setter verdier inn i en hel setning." },
      { code: "{pris:.0f}", explanation: "Viser et desimaltall uten desimaler." },
      { code: "round(tall, 2)", explanation: "Avrunder til to desimaler." },
    ],
    example: `produkt = "hettegenser"
pris = 599.5
antall = 2
total = pris * antall

print("Du kjøper", antall, produkt)
print(f"Totalprisen er {total:.2f} kr.")`,
    experiments: [
      "Bytt produkt og pris.",
      "Prøv :.0f, :.1f og :.2f. Hva endres?",
      "Lag en setning som også viser pris per produkt.",
    ],
  },
  {
    id: "vilkar",
    category: "Styring",
    level: "Grunnmur",
    title: "Valg med if, elif og else",
    purpose: "La programmet velge hva det skal gjøre ut fra et vilkår.",
    commands: [
      { code: "==  !=", explanation: "Er lik / er ikke lik. Sammenligning bruker to likhetstegn." },
      { code: ">  <  >=  <=", explanation: "Sammenligner størrelsen på tall." },
      { code: "and  or", explanation: "Kombinerer flere vilkår." },
      { code: "if ...:", explanation: "Koden med innrykk kjøres når vilkåret er sant." },
    ],
    example: `poeng = 8

if poeng >= 10:
    print("Toppnivå")
elif poeng >= 5:
    print("Godt i gang")
else:
    print("Prøv en gang til")`,
    experiments: [
      "Test poeng 4, 5, 9 og 10.",
      "Legg til navn og gjør svaret personlig med en f-tekst.",
      "Lag et vilkår som krever både poeng >= 5 and poeng <= 10.",
    ],
    tip: "Kolon og innrykk er en del av Python. Bruk Tab for å rykke inn i editoren.",
  },
  {
    id: "tallmonster",
    category: "Styring",
    level: "Grunnmur",
    title: "Løkker og tallmønstre",
    purpose: "Gjenta kode og undersøk tallfølger uten å skrive samme linje mange ganger.",
    commands: [
      { code: "for tall in ...:", explanation: "Gir tall én verdi om gangen." },
      { code: "range(1, 11)", explanation: "Gir 1 til og med 10. Stoppverdien er ikke med." },
      { code: "range(2, 21, 2)", explanation: "Start, stopp og steglengde: 2, 4, 6 ... 20." },
      { code: "break", explanation: "Stopper løkken med en gang." },
    ],
    example: `for tall in range(1, 11):
    kvadrat = tall ** 2
    print(tall, "gir", kvadrat)`,
    experiments: [
      "Bytt ** 2 med ** 3 for å lage kubikktall.",
      "Lag femgangen ved å skrive print(tall * 5).",
      "Bruk range(10, 0, -1) til en nedtelling.",
    ],
  },
  {
    id: "lister",
    category: "Byggeklosser",
    level: "Grunnmur",
    title: "Lister: mange verdier på ett sted",
    purpose: "Samle flere verdier, hente ut én verdi og behandle hele samlingen.",
    commands: [
      { code: "[4, 7, 9]", explanation: "En liste med tre verdier." },
      { code: "liste[0]", explanation: "Henter første verdi. Python teller fra 0." },
      { code: "liste.append(12)", explanation: "Legger en ny verdi bakerst." },
      { code: "len / sum / min / max", explanation: "Antall, sum, minste og største verdi." },
    ],
    example: `poeng = [4, 7, 9, 6]
poeng.append(10)

print("Første:", poeng[0])
print("Antall:", len(poeng))
print("Gjennomsnitt:", sum(poeng) / len(poeng))

for verdi in poeng:
    print("Poeng:", verdi)`,
    experiments: [
      "Legg til og fjern tall i listen.",
      "Finn forskjellen mellom max(poeng) og min(poeng).",
      "Bruk et if-vilkår i løkken og skriv bare verdier over 6.",
    ],
  },
  {
    id: "funksjoner",
    category: "Byggeklosser",
    level: "Grunnmur",
    title: "Lag dine egne funksjoner",
    purpose: "Gi en oppskrift et navn og bruk den med forskjellige verdier.",
    commands: [
      { code: "def navn(parameter):", explanation: "Definerer funksjonen og verdien den tar imot." },
      { code: "return svar", explanation: "Sender et resultat tilbake fra funksjonen." },
      { code: "navn(verdi)", explanation: "Kaller funksjonen og setter inn en verdi." },
      { code: "def f(x, a):", explanation: "En funksjon kan ta imot flere parametere." },
    ],
    example: `def areal(lengde, bredde):
    svar = lengde * bredde
    return svar

rom1 = areal(8, 5)
rom2 = areal(4, 3)

print("Rom 1:", rom1)
print("Rom 2:", rom2)`,
    experiments: [
      "Lag en funksjon omkrets(lengde, bredde).",
      "Kall areal-funksjonen med tre nye rektangler.",
      "Lag en funksjon som returnerer den største av to verdier.",
    ],
    tip: "Koden inni funksjonen kjører først når funksjonen blir kalt.",
  },
  {
    id: "tilfeldighet",
    category: "Utforske data",
    level: "Utforsk",
    title: "Tilfeldighet og terningkast",
    purpose: "Lag tilfeldige forsøk og undersøk hvordan resultatene varierer.",
    commands: [
      { code: "import random", explanation: "Gjør random-verktøyene tilgjengelige." },
      { code: "random.randint(1, 6)", explanation: "Tilfeldig heltall fra 1 til og med 6." },
      { code: "random.choice(liste)", explanation: "Velger ett tilfeldig element fra en liste." },
      { code: "random.seed(4)", explanation: "Gir samme tilfeldige serie hver gang – nyttig ved testing." },
    ],
    example: `import random

antall_seksere = 0

for kast_nr in range(1, 21):
    kast = random.randint(1, 6)
    print(kast_nr, "→", kast)

    if kast == 6:
        antall_seksere += 1

print("Seksere:", antall_seksere)`,
    experiments: [
      "Kjør flere ganger og sammenlign resultatene.",
      "Øk til 1000 kast og skriv bare antall seksere.",
      "Beregn andelen seksere og sammenlign med 1/6.",
    ],
  },
  {
    id: "tabeller",
    category: "Utforske data",
    level: "Utforsk",
    title: "Tabeller med pandas",
    purpose: "Organiser data i rader og kolonner, og gjør enkle beregninger på en hel kolonne.",
    commands: [
      { code: "import pandas as pd", explanation: "Laster pandas og gir det kortnavnet pd." },
      { code: "pd.DataFrame(data)", explanation: "Lager en tabell fra en ordbok med kolonner." },
      { code: 'tabell["poeng"]', explanation: "Velger én kolonne." },
      { code: ".mean() / .max()", explanation: "Finner gjennomsnitt eller største verdi." },
    ],
    example: `import pandas as pd

data = {
    "navn": ["Ada", "Bo", "Celine"],
    "poeng": [8, 12, 10]
}

tabell = pd.DataFrame(data)
print(tabell.to_string(index=False))
print("Gjennomsnitt:", tabell["poeng"].mean())`,
    experiments: [
      "Legg til en elev og en poengsum.",
      "Lag en ny kolonne som heter klasse.",
      "Vis bare radene der poeng er større enn 9.",
    ],
  },
  {
    id: "grafer",
    category: "Tegne og vise",
    level: "Utforsk",
    title: "Tegn en graf med Matplotlib",
    purpose: "Lag en verditabell digitalt og vis sammenhengen som en graf.",
    commands: [
      { code: "import matplotlib.pyplot as plt", explanation: "Laster tegneverktøyet og kaller det plt." },
      { code: "plt.plot(x, y)", explanation: "Tegner y-verdiene mot x-verdiene." },
      { code: "plt.title / xlabel / ylabel", explanation: "Gir grafen forklarende tekst." },
      { code: "plt.grid(); plt.show()", explanation: "Viser rutenett og sender grafen til resultatpanelet." },
    ],
    example: `import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-5, 5, 101)
y = x ** 2

plt.plot(x, y, color="#f06f51", linewidth=3)
plt.axhline(0, color="gray", linewidth=1)
plt.axvline(0, color="gray", linewidth=1)
plt.title("Grafen til y = x²")
plt.xlabel("x")
plt.ylabel("y")
plt.grid()
plt.show()`,
    experiments: [
      "Bytt y = x ** 2 med y = 2 * x + 3.",
      "Tegn også z = x ** 3 med en ny plt.plot-linje.",
      "Endre farge, linjetykkelse og tittel.",
    ],
    tip: "Grafen vises i resultatpanelet. Der kan den åpnes stort eller lagres som PNG-bilde.",
  },
  {
    id: "turtle-figurer",
    category: "Tegne og vise",
    level: "Utforsk",
    title: "Turtle: kvadrat og mangekanter",
    purpose: "Tegn geometri ved å gå framover og svinge en bestemt vinkel.",
    commands: [
      { code: "from turtle import *", explanation: "Gjør Turtle-kommandoene tilgjengelige." },
      { code: "forward(100)", explanation: "Går 100 piksler framover og tegner." },
      { code: "left(90) / right(90)", explanation: "Svinger et antall grader." },
      { code: "color / pensize / begin_fill", explanation: "Bestemmer farge, strek og fyll." },
    ],
    example: `from turtle import *

color("#f06f51", "#f4c95d")
pensize(5)

begin_fill()
for side in range(4):
    forward(120)
    left(90)
end_fill()

done()`,
    experiments: [
      "Endre sidelengden fra 120 til 70.",
      "Lag en trekant: gjenta 3 ganger og sving 120 grader.",
      "Lag en sekskant: gjenta 6 ganger og sving 60 grader.",
    ],
    tip: "For en regelmessig mangekant er utvendig vinkel 360 / antall sider.",
  },
  {
    id: "turtle-spiral",
    category: "Tegne og vise",
    level: "Utforsk",
    title: "Turtle: geometrisk spiral",
    purpose: "Kombiner en løkke, voksende lengde og en nesten rett vinkel til et mønster.",
    commands: [
      { code: "range(10, 190, 6)", explanation: "Lengden øker med 6 for hver runde." },
      { code: "forward(lengde)", explanation: "Tegner med den nye lengden." },
      { code: "left(91)", explanation: "En liten endring fra 90 grader vrir mønsteret." },
      { code: "bgcolor(...) ", explanation: "Bestemmer bakgrunnsfargen." },
    ],
    example: `from turtle import *

bgcolor("#fffdf8")
color("#2f6b5f")
pensize(3)

for lengde in range(10, 190, 6):
    forward(lengde)
    left(91)

done()`,
    experiments: [
      "Prøv vinklene 89, 90, 92 og 121 grader.",
      "Endre hvor raskt lengden vokser.",
      "Legg color(...) inni løkken og bytt farge underveis.",
    ],
  },
  {
    id: "numpy",
    category: "Videre",
    level: "Videre",
    title: "Mange tall med NumPy",
    purpose: "Regn på hele tallserier samtidig og finn statistiske mål.",
    commands: [
      { code: "import numpy as np", explanation: "Laster NumPy med kortnavnet np." },
      { code: "np.array([...])", explanation: "Lager en tallserie som NumPy kan regne på." },
      { code: "verdier * 2", explanation: "Ganger alle verdiene med 2 på én gang." },
      { code: "np.mean / median / std", explanation: "Gjennomsnitt, median og standardavvik." },
    ],
    example: `import numpy as np

verdier = np.array([4, 7, 9, 6, 10])

print("Alle ganger 2:", verdier * 2)
print("Gjennomsnitt:", np.mean(verdier))
print("Median:", np.median(verdier))
print("Standardavvik:", np.std(verdier))`,
    experiments: [
      "Legg til en svært stor verdi. Hva skjer med gjennomsnitt og median?",
      "Lag np.arange(1, 11) og regn ut kvadratet av alle tallene.",
      "Kombiner NumPy-serien med Matplotlib og tegn verdiene.",
    ],
  },
  {
    id: "symbolsk",
    category: "Videre",
    level: "Videre",
    title: "Løs og undersøk uttrykk med SymPy",
    purpose: "Arbeid med bokstaver og algebraiske uttrykk i stedet for bare desimaltall.",
    commands: [
      { code: "import sympy as sp", explanation: "Laster SymPy med kortnavnet sp." },
      { code: 'x = sp.symbols("x")', explanation: "Gjør x til et matematisk symbol." },
      { code: "sp.expand(...) ", explanation: "Ganger ut parenteser." },
      { code: "sp.solve(ligning, x)", explanation: "Løser en ligning med hensyn på x." },
    ],
    example: `import sympy as sp

x = sp.symbols("x")
uttrykk = (x + 2) * (x - 3)
ligning = sp.Eq(2 * x + 3, 11)

print("Ganget ut:", sp.expand(uttrykk))
print("Løsning:", sp.solve(ligning, x))`,
    experiments: [
      "Endre tallene i parentesene og gang ut på nytt.",
      "Løs ligningen 3 * x - 5 = 16.",
      "Bruk sp.factor(...) på et uttrykk som er ganget ut.",
    ],
  },
];

const modules: Module[] = [
  {
    id: 1,
    title: "Verdier, variabler og uttrykk",
    shortTitle: "Variabler",
    eyebrow: "Start her",
    question: "En jakke koster 800 kr. Hva blir prisen etter 25 % rabatt?",
    intro:
      "Vi lar Python holde orden på tallene, men matematikken er fortsatt vår. Målet er å kunne følge verdiene linje for linje og forklare hvorfor svaret blir riktig.",
    refresh: {
      title: "Hva er en variabel?",
      body: "En variabel er som en boks med navnelapp. I boksen kan vi lagre et tall eller en tekst. Verdien kan brukes senere – og den kan byttes ut.",
      examples: [
        { code: "navn = verdi", explanation: "Oppskriften: navn til venstre, verdi til høyre." },
        { code: "x = 50", explanation: "Variabelen x får tallverdien 50." },
        { code: 'tekst = "Hei"', explanation: "Tekst må stå i anførselstegn. Tall skrives uten." },
      ],
    },
    theory: [
      {
        title: "Slik lager du en variabel",
        body: "Når Python leser pris = 800, lagres verdien 800 under navnet pris. Her betyr likhetstegnet «gi variabelen en verdi» – ikke «regn ut begge sider».",
        code: "pris = 800",
        steps: ["Velg et navn som forteller hva verdien betyr.", "Skriv ett likhetstegn.", "Skriv verdien på høyre side.", "Les linjen fra høyre: «pris får verdien 800»."],
      },
      {
        title: "Et uttrykk blir regnet ut",
        body: "Rabatt på 25 % gir vekstfaktoren 1 − 0,25 = 0,75. Python bruker punktum som desimalskilletegn.",
        code: "ny_pris = pris * (1 - rabatt)",
        steps: ["Python henter verdiene til pris og rabatt.", "Parentesen regnes ut først: 1 − 0,25.", "Resultatet ganges med prisen.", "Svaret lagres i ny_pris."],
      },
      {
        title: "print viser resultatet",
        body: "print(...) skriver en verdi i resultatfeltet. Det gjør det mulig å observere hva programmet har regnet ut.",
        code: "print(ny_pris)",
        steps: ["Skriv print og parenteser.", "Sett variabelen du vil se, inni parentesene.", "Kjør koden og sammenlign med overslaget ditt."],
      },
    ],
    progression: {
      intro: "Start med én operasjon. Endre deretter verdier, sett sammen flere variabler og gjør utskriften tydeligere.",
      steps: [
        {
          label: "Start",
          title: "Legg sammen variabler",
          body: "Python henter tallene som er lagret i pris og frakt. Summen kan lagres i en ny variabel.",
          code: `pris = 40\nfrakt = 59\ntotal = pris + frakt\nprint(total)`,
          tryThis: "Endre frakt til 79. Forutsi totalen før du kjører.",
        },
        {
          label: "Forstå først",
          title: "Gi en variabel en ny verdi",
          body: "Høyresiden regnes ut med den gamle verdien. Deretter lagres svaret som den nye verdien til poeng.",
          code: `poeng = 10\npoeng = poeng + 3\npoeng = poeng - 2\nprint(poeng)`,
          tryThis: "Tegn en sportabell: 10 → 13 → 11. Endre så tallene.",
          upgrade: {
            title: "Kortere med += og -=",
            body: "+= betyr «legg til og lagre den nye verdien». -= betyr «trekk fra og lagre». Den lange og korte skrivemåten gjør det samme.",
            code: `poeng = 10\npoeng += 3\npoeng -= 2\nprint(poeng)`,
          },
        },
        {
          label: "Bygg videre",
          title: "Endre en saldo med += og -=",
          body: "Når verdien skal justeres flere ganger, gjør de korte operatorene programmet lettere å lese.",
          code: `saldo = 200\nsaldo += 50\nsaldo -= 30\nprint(saldo)`,
          tryThis: "Legg til enda en innbetaling på 100 kr og et kjøp på 45 kr.",
        },
        {
          label: "Tekst + tall",
          title: "Lag en forståelig beskjed",
          body: "Den enkleste løsningen er å gi print flere deler, skilt med komma. Python setter inn mellomrom for deg.",
          code: `navn = "Ada"\nalder = 15\nprint("Hei", navn)\nprint("Du er", alder, "år.")`,
          tryThis: "Lag en variabel som heter skole, og skriv navn, alder og skole i en hel beskjed.",
          upgrade: {
            title: "Elegant senere: f-tekst",
            body: "Når komma-versjonen gir mening, kan samme beskjed skrives mer samlet. Variablene står i krøllparenteser.",
            code: `navn = "Ada"\nalder = 15\nprint(f"Hei {navn}! Du er {alder} år.")`,
          },
        },
      ],
    },
    starterCode: `pris = 800\nrabatt = 0.25\nny_pris = pris * (1 - rabatt)\nprint(ny_pris)`,
    typingSteps: [
      { kind: "write", code: "pris = 800", explanation: "Trykk Enter etter linjen." },
      { kind: "write", code: "rabatt = 0.25", explanation: "Python bruker punktum i desimaltall." },
      { kind: "write", code: "ny_pris = pris * (1 - rabatt)", explanation: "Parentesen regnes ut før multiplikasjonen." },
      { kind: "write", code: "print(ny_pris)", explanation: "Denne linjen viser svaret i resultatfeltet." },
      { kind: "do", explanation: "Les koden tegn for tegn. Trykk deretter «Kjør kode»." },
    ],
    polish: {
      title: "Gjør 600.0 om til en ordentlig beskjed",
      body: "Python kan sette tekst og en verdi sammen i én utskrift. Bokstaven f foran teksten betyr at det som står i krøllparenteser, skal byttes ut med en verdi.",
      before: "print(ny_pris)",
      after: 'print(f"Den nye prisen på produktet er {ny_pris:.0f} kr.")',
      explanation: ":.0f betyr «vis tallet med null desimaler». Derfor vises 600 i stedet for 600.0.",
    },
    observe: [
      "Hva er verdien til hver variabel etter linje 3?",
      "Hvor i koden finner du vekstfaktoren 0,75?",
      "Hvorfor skriver Python 600.0 og ikke bare 600?",
    ],
    task:
      "Endre programmet slik at det regner ut prisen etter 30 % rabatt. Kjør koden og sjekk svaret.",
    taskHint: "Du trenger bare å endre verdien til rabatt.",
    expected: ["560", "560.0"],
    teacher: {
      purpose:
        "Bygg bro mellom prosentregning, vekstfaktor og tilordning i Python. Hovedsaken er forklaring, ikke skrivehastighet.",
      before: [
        "La elevene regne svaret uten kode først.",
        "Be dem forutsi utskriften før de trykker Kjør.",
        "Lag en sportabell med kolonnene pris, rabatt og ny_pris.",
      ],
      misconceptions: [
        "20 % skrives som 20 i stedet for 0.20.",
        "Likhetstegnet tolkes som en matematisk ligning.",
        "600.0 oppfattes som et annet tall enn 600.",
      ],
      assess:
        "Eleven kan forklare hvilken verdi hver variabel får, finne vekstfaktoren i koden og begrunne utskriften.",
      extension:
        "Be eleven legge til en variabel for medlemsrabatt og diskutere om prosentene kan adderes direkte.",
    },
  },
  {
    id: 2,
    title: "Valg med if og else",
    shortTitle: "Vilkår",
    eyebrow: "Ta et valg",
    question: "Hvordan kan et program avgjøre om et tall er partall eller oddetall?",
    intro:
      "Et vilkår lar programmet velge mellom ulike veier. Her bruker vi divisjonsrest for å gjøre en matematisk regel om til kode.",
    refresh: {
      title: "Hva betyr sant eller usant?",
      body: "Et vilkår er et spørsmål Python kan svare sant eller usant på. Programmet bruker svaret til å velge hvilken kode som skal kjøres.",
      examples: [
        { code: "5 > 3", explanation: "Sant: 5 er større enn 3." },
        { code: "5 == 3", explanation: "Usant: to likhetstegn spør «er de like?»." },
        { code: "tall = 5", explanation: "Ett likhetstegn gir variabelen en verdi." },
      ],
    },
    theory: [
      {
        title: "Sammenligning bruker to likhetstegn",
        body: "Uttrykket rest == 0 spør om rest er lik null. Svaret er enten sant eller usant.",
        code: "rest == 0",
        steps: ["Finn verdien til rest.", "Sammenlign den med 0.", "Avgjør om spørsmålet er sant eller usant."],
      },
      {
        title: "% finner divisjonsresten",
        body: "17 % 2 blir 1, mens 18 % 2 blir 0. Alle partall gir rest 0 når de deles på 2.",
        code: "rest = tall % 2",
        steps: ["Del tallet på 2.", "Se bare på resten etter delingen.", "Rest 0 betyr partall; rest 1 betyr oddetall."],
      },
      {
        title: "Innrykk viser hva som hører sammen",
        body: "Linjene under if og else må rykkes inn. Innrykket er en del av Python-språket.",
        code: 'if rest == 0:\n    print("partall")',
        steps: ["Skriv if, vilkåret og kolon.", "Rykk inn koden som skal kjøres når vilkåret er sant.", "Bruk else for det som skal skje ellers."],
      },
    ],
    progression: {
      intro: "Begynn med et spørsmål som blir sant eller usant. La programmet ta ett valg først, og bygg deretter to mulige veier.",
      steps: [
        {
          label: "Start",
          title: "Se et sant/usant-svar",
          body: "En sammenligning kan skrives rett ut. Python svarer True eller False.",
          code: `tall = 12\nprint(tall > 10)\nprint(tall == 12)`,
          tryThis: "Endre tall til 8. Hvilken av sammenligningene endrer svar?",
        },
        {
          label: "Ett valg",
          title: "Gjør noe bare når vilkåret er sant",
          body: "Koden med innrykk kjøres bare dersom temperaturen er mindre enn null.",
          code: `temperatur = -4\n\nif temperatur < 0:\n    print("Det er frost.")`,
          tryThis: "Prøv temperatur 3. Legg til en ny print-linje uten innrykk og observer forskjellen.",
        },
        {
          label: "To veier",
          title: "Velg med if og else",
          body: "Nå får programmet én beskjed når vilkåret er sant, og en annen ellers.",
          code: `poeng = 7\n\nif poeng >= 5:\n    print("Målet er nådd.")\nelse:\n    print("Prøv én gang til.")`,
          tryThis: "Test poeng 4, 5 og 6. Forklar hvorfor grensen 5 hører til den første veien.",
          upgrade: {
            title: "Gjør beskjeden personlig",
            body: "Bruk en variabel i en f-tekst når selve valget er forstått.",
            code: `navn = "Ada"\npoeng = 7\n\nif poeng >= 5:\n    print(f"Bra jobbet, {navn}!")\nelse:\n    print(f"Prøv igjen, {navn}.")`,
          },
        },
      ],
    },
    starterCode: `tall = 18\nrest = tall % 2\n\nif rest == 0:\n    print("partall")\nelse:\n    print("oddetall")`,
    typingSteps: [
      { kind: "write", code: "tall = 18", explanation: "Variabelen tall får verdien 18." },
      { kind: "write", code: "rest = tall % 2", explanation: "% finner resten etter divisjon med 2." },
      { kind: "write", code: "if rest == 0:", explanation: "Trykk Enter. Legg merke til kolon helt til slutt." },
      { kind: "write", code: "    print(\"partall\")", explanation: "Linjen starter med fire mellomrom. Du kan bruke Tab." },
      { kind: "write", code: "else:\n    print(\"oddetall\")", explanation: "else står helt til venstre. print-linjen under har fire mellomrom." },
    ],
    polish: {
      title: "Fortell hvilket tall programmet undersøkte",
      body: "En f-tekst gjør resultatet lettere å forstå når vi ser på det senere.",
      before: 'print("partall")',
      after: 'print(f"Tallet {tall} er et partall.")',
      explanation: "Alt inni {tall} erstattes med verdien som ligger i variabelen tall.",
    },
    observe: [
      "Hva er verdien til rest når tall er 18?",
      "Hvilken print-linje blir hoppet over?",
      "Hva skjer dersom tall endres til −3?",
    ],
    task:
      "Endre programmet slik at det undersøker tallet 37. Kjør koden og forklar hvorfor resultatet blir som det blir.",
    taskHint: "Endre startverdien på første linje.",
    expected: ["oddetall"],
    teacher: {
      purpose:
        "Knytt logiske vilkår til egenskaper ved heltall. Elevene skal kunne forklare begge mulige programveier.",
      before: [
        "Test divisjonsrest med små tall på tavla.",
        "La elevene peke på linjen de tror blir utført.",
        "Les if som «hvis» og else som «ellers».",
      ],
      misconceptions: [
        "= og == blandes sammen.",
        "Begge print-linjene forventes å bli kjørt.",
        "Innrykket oppfattes som pynt.",
      ],
      assess:
        "Eleven kan regne ut resten, avgjøre sannhetsverdien til vilkåret og følge riktig gren.",
      extension:
        "Utvid programmet slik at det også undersøker om tallet er delelig med 3.",
    },
  },
  {
    id: 3,
    title: "Gjentakelser og mønstre",
    shortTitle: "Løkker",
    eyebrow: "Gjenta smart",
    question: "Hvordan kan fem kodelinjer lage en hel tallfølge?",
    intro:
      "En løkke gjentar en instruksjon. Det gjør programmering nyttig når vi vil utforske mønstre, tabeller og systematiske endringer.",
    refresh: {
      title: "Hva er en gjentakelse?",
      body: "Når den samme handlingen skal utføres mange ganger, kan vi beskrive mønsteret én gang og la en løkke gjøre gjentakelsen.",
      examples: [
        { code: "print(2)\nprint(4)\nprint(6)", explanation: "Her skriver vi nesten samme kommando tre ganger." },
        { code: "for n in range(1, 4):", explanation: "Her får n verdiene 1, 2 og 3 – én om gangen." },
        { code: "    print(2 * n)", explanation: "Den innrykkede linjen kjøres for hver verdi av n." },
      ],
    },
    theory: [
      {
        title: "for gjentar",
        body: "For hver verdi i tallfølgen utføres den innrykkede linjen én gang.",
        code: "for n in range(1, 6):",
        steps: ["Velg navn på løkkevariabelen, for eksempel n.", "Velg start og stopp med range.", "Avslutt linjen med kolon.", "Rykk inn det som skal gjentas."],
      },
      {
        title: "Sluttverdien er ikke med",
        body: "range(1, 6) gir tallene 1, 2, 3, 4 og 5. Tallet 6 er stoppunktet.",
        code: "range(start, stopp)",
        steps: ["Startverdien er med.", "Stoppverdien er ikke med.", "Tell verdiene før du kjører koden."],
      },
      {
        title: "Uttrykket endres hver runde",
        body: "Når n får en ny verdi, regnes 2 * n ut på nytt. Slik oppstår en tallfølge.",
        code: "print(2 * n)",
        steps: ["Sett inn første verdi av n i uttrykket.", "Regn ut og skriv resultatet.", "Gjenta med neste n-verdi til løkken er ferdig."],
      },
    ],
    progression: {
      intro: "Se først hva som gjentas. Erstatt så gjentatte linjer med en løkke, og bruk til slutt løkken til å bygge opp en verdi.",
      steps: [
        {
          label: "Se mønsteret",
          title: "Gjenta på den lange måten",
          body: "Dette virker, men vi må skrive nesten samme linje flere ganger. Nettopp slike mønstre passer for en løkke.",
          code: `print("Hei")\nprint("Hei")\nprint("Hei")`,
          tryThis: "Legg til to linjer til. Tell hvor mange ganger teksten skrives.",
        },
        {
          label: "Bygg videre",
          title: "La en løkke gjenta",
          body: "range(3) gir verdiene 0, 1 og 2. Den innrykkede linjen kjøres tre ganger.",
          code: `for runde in range(3):\n    print("Hei", runde)`,
          tryThis: "Endre 3 til 5. Hva blir første og siste verdi til runde?",
          upgrade: {
            title: "Start tellingen på 1",
            body: "To tall i range lar deg velge start og stopp. Stoppverdien er fortsatt ikke med.",
            code: `for runde in range(1, 6):\n    print("Runde", runde)`,
          },
        },
        {
          label: "Samle resultat",
          title: "Lag en løpende sum",
          body: "Variabelen sum_tall husker det vi har samlet så langt. Hver runde legger til en ny verdi.",
          code: `sum_tall = 0\n\nfor tall in range(1, 6):\n    sum_tall += tall\n    print("Så langt:", sum_tall)`,
          tryThis: "Forutsi utskriftene 1, 3, 6, 10 og 15. Endre stoppverdien til 11.",
        },
      ],
    },
    starterCode: `for n in range(1, 6):\n    print(2 * n)`,
    typingSteps: [
      { kind: "write", code: "for n in range(1, 6):", explanation: "Trykk Enter etter kolon." },
      { kind: "do", explanation: "Kontroller at løkkelinjen slutter med kolon (:)." },
      { kind: "do", explanation: "Lag innrykk på neste linje med Tab eller fire mellomrom." },
      { kind: "write", code: "    print(2 * n)", explanation: "Mellomrommene først på linjen viser at print hører til løkken." },
      { kind: "do", explanation: "Trykk «Kjør kode», og tell hvor mange svar du får." },
    ],
    polish: {
      title: "Vis regnestykket sammen med svaret",
      body: "I stedet for bare 2, 4, 6 … kan hver linje forklare hva som ble regnet ut.",
      before: "print(2 * n)",
      after: 'print(f"2 · {n} = {2 * n}")',
      explanation: "Du kan ha flere krøllparenteser i samme f-tekst. Python regner ut uttrykket {2 * n} før teksten skrives ut.",
    },
    observe: [
      "Hvilke fem verdier får n?",
      "Hvor mange ganger utføres print-linjen?",
      "Hva må endres for å få de fem første oddetallene?",
    ],
    task:
      "Endre uttrykket slik at programmet skriver ut 3, 6, 9, 12 og 15.",
    taskHint: "Behold range, men endre regneuttrykket i print.",
    expected: ["3\n6\n9\n12\n15"],
    teacher: {
      purpose:
        "Bruk løkken som en dynamisk verditabell. La elevene beskrive både mønsteret og regelen.",
      before: [
        "Spill løkken fysisk: fem elever holder hver sin n-verdi.",
        "Skriv en sportabell med n og utskrift.",
        "Forutsi antall utskrifter før koden kjøres.",
      ],
      misconceptions: [
        "Elevene tror at 6 er med i range(1, 6).",
        "Innrykket glemmes.",
        "n oppfattes som én fast verdi.",
      ],
      assess:
        "Eleven kan liste verdiene løkkevariabelen får og knytte uttrykket til en generell regel.",
      extension:
        "Lag en verditabell for y = 2x + 3 med x-verdier fra −3 til 3.",
    },
  },
  {
    id: 4,
    title: "Funksjoner som maskiner",
    shortTitle: "Funksjoner",
    eyebrow: "Bygg en regel",
    question: "Kan vi gi en matematisk regel et navn og bruke den flere ganger?",
    intro:
      "En Python-funksjon tar imot verdier, arbeider med dem og kan returnere et resultat. Det ligner funksjonsbegrepet i matematikk.",
    refresh: {
      title: "Hva er en funksjon?",
      body: "Tenk på en funksjon som en maskin: Du sender inn en verdi, maskinen følger en fast regel, og du får en ny verdi ut.",
      examples: [
        { code: "f(x) = 2x + 3", explanation: "Dette er regelen skrevet som matematikk." },
        { code: "f(6) = 2 · 6 + 3", explanation: "Vi setter inn 6 der det står x." },
        { code: "f(6) = 15", explanation: "15 er funksjonsverdien når x er 6." },
      ],
    },
    theory: [
      {
        title: "def lager funksjonen",
        body: "Navnet kommer etter def. Verdien i parentes kalles en parameter.",
        code: "def f(x):",
        steps: ["Skriv def for å definere en funksjon.", "Gi funksjonen et navn.", "Skriv parameteren i parentes.", "Avslutt med kolon og rykk inn innholdet."],
      },
      {
        title: "return sender svaret tilbake",
        body: "Uttrykket etter return bestemmer funksjonsverdien.",
        code: "return 2 * x + 3",
        steps: ["Skriv regelen som et Python-uttrykk.", "Bruk * for gange.", "Sett return foran uttrykket for å sende svaret tilbake."],
      },
      {
        title: "Et funksjonskall setter inn en verdi",
        body: "f(6) betyr at x får verdien 6. Resultatet blir 2 · 6 + 3 = 15.",
        code: "resultat = f(6)",
        steps: ["Skriv funksjonsnavnet.", "Sett inn ønsket verdi i parentes.", "Lagre svaret i en variabel eller skriv det ut med print."],
      },
    ],
    progression: {
      intro: "Regn ut én verdi på vanlig måte. Gi deretter regelen et navn, og bruk den samme funksjonen med flere inndata.",
      steps: [
        {
          label: "Start",
          title: "Regn ut direkte",
          body: "Før funksjoner kan vi lagre en x-verdi og regne ut uttrykket linje for linje.",
          code: `x = 4\nresultat = 2 * x + 3\nprint(resultat)`,
          tryThis: "Endre x til 0 og deretter −2. Regn ut for hånd før du kjører.",
        },
        {
          label: "Lag en maskin",
          title: "Gi regelen et navn",
          body: "Funksjonen samler regelen på ett sted. return sender funksjonsverdien tilbake.",
          code: `def f(x):\n    return 2 * x + 3\n\nsvar = f(4)\nprint(svar)`,
          tryThis: "Endre tallet i f(4), uten å endre selve regelen.",
        },
        {
          label: "Bruk flere ganger",
          title: "Samme funksjon, flere verdier",
          body: "Én definisjon kan brukes så mange ganger vi vil. Her lager vi tre punkter i en verditabell.",
          code: `def f(x):\n    return 2 * x + 3\n\nprint(-1, f(-1))\nprint(0, f(0))\nprint(1, f(1))`,
          tryThis: "Legg til radene for x = 2 og x = 3. Finn mønsteret i funksjonsverdiene.",
          upgrade: {
            title: "Elegant senere: kombiner med løkke",
            body: "Når både funksjoner og løkker er kjent, kan en hel verditabell lages med få linjer.",
            code: `def f(x):\n    return 2 * x + 3\n\nfor x in range(-3, 4):\n    print(x, f(x))`,
          },
        },
      ],
    },
    starterCode: `def f(x):\n    return 2 * x + 3\n\nresultat = f(6)\nprint(resultat)`,
    typingSteps: [
      { kind: "write", code: "def f(x):", explanation: "Trykk Enter etter kolon." },
      { kind: "write", code: "    return 2 * x + 3", explanation: "Linjen starter med fire mellomrom fordi den hører til funksjonen." },
      { kind: "do", explanation: "Lag en tom linje. Gå deretter helt tilbake til venstre uten innrykk." },
      { kind: "write", code: "resultat = f(6)", explanation: "Her brukes funksjonen med x = 6." },
      { kind: "write", code: "print(resultat)", explanation: "Trykk deretter «Kjør kode»." },
    ],
    polish: {
      title: "Skriv funksjonsverdien som matematikk",
      body: "En tydelig utskrift gjør det lettere å koble koden til matematikkfaget.",
      before: "print(resultat)",
      after: 'print(f"f(6) = {resultat}")',
      explanation: "Teksten f(6) står fast, mens {resultat} henter svaret fra variabelen.",
    },
    observe: [
      "Hvilken verdi får parameteren x?",
      "Hva er funksjonsuttrykket i matematisk skrivemåte?",
      "Hva blir f(0), og hvor ser du det i uttrykket?",
    ],
    task:
      "Endre funksjonen til f(x) = 3x − 2 og finn f(6).",
    taskHint: "Endre bare uttrykket etter return.",
    expected: ["16", "16.0"],
    teacher: {
      purpose:
        "Koble parameter, funksjonskall og returverdi til x, innsetting og funksjonsverdi.",
      before: [
        "Tegn en funksjonsmaskin med inn og ut.",
        "La elevene regne f(6) før kjøring.",
        "Marker forskjellen mellom å definere og å kalle funksjonen.",
      ],
      misconceptions: [
        "def-linjen oppfattes som om funksjonen kjøres med en gang.",
        "return og print blandes sammen.",
        "Parameteren x oppfattes som en bestemt ukjent.",
      ],
      assess:
        "Eleven kan forklare hva funksjonen tar inn, hvilken regel den bruker, og hva den returnerer.",
      extension:
        "Bruk en løkke til å skrive ut en verditabell for funksjonen.",
    },
  },
  {
    id: 5,
    title: "Sannsynlighet gjennom simulering",
    shortTitle: "Simulering",
    eyebrow: "La tilfeldighetene arbeide",
    question: "Hvor ofte får vi en sekser når vi kaster en terning 600 ganger?",
    intro:
      "En simulering gjentar et tilfeldig forsøk mange ganger. Vi sammenligner relativ frekvens med den teoretiske sannsynligheten 1/6.",
    refresh: {
      title: "Hva er sannsynlighet?",
      body: "Sannsynlighet beskriver hvor stor sjanse en hendelse har. Relativ frekvens forteller hvor ofte hendelsen faktisk skjedde i et forsøk.",
      examples: [
        { code: "P(sekser) = 1 / 6", explanation: "Én gunstig side av seks mulige sider." },
        { code: "relativ frekvens = treff / forsøk", explanation: "Antall seksere delt på antall kast." },
        { code: "100 / 600 ≈ 0,167", explanation: "Et typisk resultat, men ikke et garantert resultat." },
      ],
    },
    theory: [
      {
        title: "random lager tilfeldige forsøk",
        body: "randint(1, 6) velger et heltall fra 1 til og med 6.",
        code: "kast = random.randint(1, 6)",
        steps: ["Importer random øverst i programmet.", "Bruk randint med minste og største mulige verdi.", "Lagre det tilfeldige resultatet i en variabel."],
      },
      {
        title: "En teller samler resultater",
        body: "Hver gang kastet er 6, økes antall_seksere med én.",
        code: "antall_seksere += 1",
        steps: ["Start telleren på 0 før løkken.", "Undersøk hvert kast med if.", "Legg til 1 bare når vilkåret er sant."],
      },
      {
        title: "Relativ frekvens",
        body: "Antall seksere delt på antall kast kan sammenlignes med 1/6 ≈ 0,167.",
        code: "andel = antall_seksere / antall_kast",
        steps: ["Tell hvor mange ganger hendelsen skjedde.", "Del på totalt antall forsøk.", "Sammenlign resultatet med teoretisk sannsynlighet."],
      },
    ],
    progression: {
      intro: "Lag ett tilfeldig forsøk først. Gjenta forsøket, og legg til slutt inn en teller som samler data fra alle rundene.",
      steps: [
        {
          label: "Ett forsøk",
          title: "Kast terningen én gang",
          body: "random.randint(1, 6) velger ett av heltallene fra 1 til og med 6.",
          code: `import random\n\nkast = random.randint(1, 6)\nprint(kast)`,
          tryThis: "Kjør fem ganger. Hvorfor får du ikke nødvendigvis fem ulike tall?",
        },
        {
          label: "Gjenta",
          title: "Kast flere ganger",
          body: "Løkken gjentar samme tilfeldige forsøk. Variabelen kast får en ny verdi i hver runde.",
          code: `import random\n\nfor runde in range(5):\n    kast = random.randint(1, 6)\n    print(kast)`,
          tryThis: "Endre til 20 kast. Legg merke til om alle terningverdiene dukker opp.",
        },
        {
          label: "Tell treff",
          title: "Øk telleren med +=",
          body: "Telleren starter på null og økes bare når kastet er en sekser.",
          code: `import random\n\nantall_seksere = 0\n\nfor runde in range(20):\n    kast = random.randint(1, 6)\n    if kast == 6:\n        antall_seksere += 1\n\nprint(antall_seksere)`,
          tryThis: "Tell enere i stedet. Utvid deretter til å telle både 1 og 2.",
          upgrade: {
            title: "Fra antall til andel",
            body: "En andel gjør resultater fra ulike antall forsøk lettere å sammenligne.",
            code: `import random\n\nantall_kast = 600\nantall_seksere = 0\n\nfor runde in range(antall_kast):\n    kast = random.randint(1, 6)\n    if kast == 6:\n        antall_seksere += 1\n\nandel = antall_seksere / antall_kast\nprint(f"Andel: {andel:.1%}")`,
          },
        },
      ],
    },
    starterCode: `import random\n\nantall_kast = 600\nantall_seksere = 0\n\nfor _ in range(antall_kast):\n    kast = random.randint(1, 6)\n    if kast == 6:\n        antall_seksere += 1\n\nandel = antall_seksere / antall_kast\nprint(round(andel, 3))`,
    typingSteps: [
      { kind: "write", code: "import random", explanation: "Dette gir programmet tilgang til tilfeldige tall." },
      { kind: "write", code: "antall_kast = 600\nantall_seksere = 0", explanation: "Den første variabelen bestemmer antall forsøk. Telleren starter på 0." },
      { kind: "write", code: "for _ in range(antall_kast):\n    kast = random.randint(1, 6)", explanation: "kast-linjen har fire mellomrom fordi den hører til løkken." },
      { kind: "write", code: "    if kast == 6:\n        antall_seksere += 1", explanation: "if har fire mellomrom. Telleren under har åtte mellomrom." },
      { kind: "write", code: "andel = antall_seksere / antall_kast\nprint(round(andel, 3))", explanation: "Disse linjene står helt til venstre fordi de kjøres etter løkken." },
    ],
    polish: {
      title: "Vis svaret som prosent",
      body: "Formatkoden :.1% gjør desimaltallet om til prosent og viser én desimal.",
      before: "print(round(andel, 3))",
      after: 'print(f"Andelen seksere ble {andel:.1%}.")',
      explanation: "Hvis andel er 0.167, vises den som 16.7 %. Python ganger med 100 og legger til prosenttegnet for oss.",
    },
    observe: [
      "Hvorfor får du ikke nøyaktig samme svar hver gang?",
      "Ligger resultatet rimelig nær 1/6?",
      "Hva tror du skjer når antall_kast økes til 60 000?",
    ],
    task:
      "Endre simuleringen slik at den undersøker sannsynligheten for å få 1 eller 2. Resultatet bør ligge nær 0,333.",
    taskHint: "Endre vilkåret til: if kast == 1 or kast == 2:",
    expected: [],
    teacher: {
      purpose:
        "Koble simulert relativ frekvens til teoretisk sannsynlighet og naturlig variasjon.",
      before: [
        "La elevene anslå et rimelig intervall for svaret.",
        "Kjør samme kode flere ganger og sammenlign.",
        "Skill mellom én simulering og den teoretiske modellen.",
      ],
      misconceptions: [
        "Tilfeldig tolkes som at alle korte serier må være jevne.",
        "1/6 forventes som eksakt resultat.",
        "Telleren nullstilles inne i løkken.",
      ],
      assess:
        "Eleven kan forklare forsøket, løkken, vilkåret, telleren og hvorfor resultatet varierer.",
      extension:
        "Simuler summen av to terninger og sammenlign sannsynlighetene for summene 2 og 7.",
    },
  },
  {
    id: 6,
    title: "Modellering og gyldighet",
    shortTitle: "Modellering",
    eyebrow: "Still spørsmål ved svaret",
    question: "Hvordan utvikler 1 000 kr seg med 10 % vekst per periode?",
    intro:
      "Programmet kan beregne en modell raskt. Vår viktigste jobb er å forklare forutsetningene og vurdere når modellen slutter å være rimelig.",
    refresh: {
      title: "Hva er en vekstfaktor?",
      body: "Ved prosentvis vekst ganger vi med den samme faktoren hver periode. Vekstfaktoren består av de opprinnelige 100 prosentene pluss veksten.",
      examples: [
        { code: "10 % vekst → 1 + 0,10 = 1,10", explanation: "Vi beholder 100 % og legger til 10 %." },
        { code: "5 % vekst → 1 + 0,05 = 1,05", explanation: "Fem prosent vekst gir vekstfaktor 1,05." },
        { code: "2 perioder → 1,10²", explanation: "Samme vekstfaktor brukes to ganger." },
      ],
    },
    theory: [
      {
        title: "Eksponentiell modell",
        body: "Ved 10 % vekst multipliseres verdien med vekstfaktoren 1,10 for hver periode.",
        code: "verdi = start * vekstfaktor ** tid",
        steps: ["Finn startverdien.", "Gjør prosenten om til vekstfaktor.", "Opphøy vekstfaktoren i antall perioder.", "Gang med startverdien."],
      },
      {
        title: "** betyr potens",
        body: "1.10 ** 2 betyr 1,10². Python bruker to stjerner for potens.",
        code: "vekstfaktor ** tid",
        steps: ["Skriv grunntallet først.", "Bruk to stjerner.", "Skriv eksponenten etter stjernene."],
      },
      {
        title: "En modell har forutsetninger",
        body: "Konstant prosentvis vekst er en antakelse. Virkelige renter, priser eller bestander kan endre seg.",
        code: "vekstfaktor = 1.10  # holdes konstant",
        steps: ["Finn hva modellen antar er konstant.", "Spør hvor lenge antakelsen er rimelig.", "Skille mellom et beregnet modellsvar og virkeligheten."],
      },
    ],
    progression: {
      intro: "Beregn én endring først. Gjenta den samme endringen periode for periode, og gå deretter over til den kompakte potensmodellen.",
      steps: [
        {
          label: "Én periode",
          title: "Regn ut én vekst",
          body: "Ti prosent vekst betyr at vi beholder hele verdien og legger til ti prosent.",
          code: `verdi = 1000\nvekst = verdi * 0.10\nny_verdi = verdi + vekst\nprint(ny_verdi)`,
          tryThis: "Endre veksten til 5 %. Finn både veksten i kroner og den nye verdien.",
          upgrade: {
            title: "Samme regning med vekstfaktor",
            body: "Når delene er forstått, kan 100 % + 10 % samles i vekstfaktoren 1.10.",
            code: `verdi = 1000\nny_verdi = verdi * 1.10\nprint(ny_verdi)`,
          },
        },
        {
          label: "Flere perioder",
          title: "Oppdater verdien i en løkke",
          body: "Hver periode tar utgangspunkt i verdien fra perioden før. Derfor lagres den nye verdien tilbake i samme variabel.",
          code: `verdi = 1000\nvekstfaktor = 1.10\n\nfor ar in range(1, 4):\n    verdi *= vekstfaktor\n    print(ar, round(verdi, 2))`,
          tryThis: "Utvid til fem år. Hvor mye øker beløpet fra år 4 til år 5?",
        },
        {
          label: "Elegant modell",
          title: "Bruk potens når regelen er kjent",
          body: "Potensuttrykket samler gjentatt multiplikasjon. Dette er kompakt, men løkkeversjonen viser tydeligere hva som skjer hvert år.",
          code: `start = 1000\nvekstfaktor = 1.10\ntid = 3\n\nverdi = start * vekstfaktor ** tid\nprint(round(verdi, 2))`,
          tryThis: "Sammenlign svaret med løkkeversjonen. Begge skal gi samme sluttverdi.",
        },
      ],
    },
    starterCode: `start = 1000\nvekstfaktor = 1.10\ntid = 2\n\nverdi = start * vekstfaktor ** tid\nprint(round(verdi, 2))`,
    typingSteps: [
      { kind: "write", code: "start = 1000", explanation: "Startverdien lagres i variabelen start." },
      { kind: "write", code: "vekstfaktor = 1.10\ntid = 2", explanation: "Dette er to separate kodelinjer. Trykk Enter mellom dem." },
      { kind: "do", explanation: "Lag en tom linje. Den gjør koden lettere å lese, men endrer ikke svaret." },
      { kind: "write", code: "verdi = start * vekstfaktor ** tid", explanation: "** betyr potens. Her opphøyes vekstfaktoren i tid." },
      { kind: "write", code: "print(round(verdi, 2))", explanation: "Denne linjen viser svaret avrundet til to desimaler. Trykk deretter «Kjør kode»." },
    ],
    polish: {
      title: "Lag en pen pengesum med to desimaler",
      body: "Formatkoden :.2f sørger for at en pengesum alltid får nøyaktig to desimaler.",
      before: "print(round(verdi, 2))",
      after: 'print(f"Etter {tid} år er verdien {verdi:.2f} kr.")',
      explanation: ":.2f betyr «vis tallet som et desimaltall med to desimaler».",
    },
    observe: [
      "Hvor i koden står antakelsen om konstant vekst?",
      "Hvorfor blir ikke to perioder 1 200 kr?",
      "Når kan en slik modell være misvisende?",
    ],
    task:
      "Endre modellen til 5 % årlig vekst i 3 år. Startverdien skal fortsatt være 1 000 kr.",
    taskHint: "Endre både vekstfaktor og tid.",
    expected: ["1157.63", "1157.62"],
    teacher: {
      purpose:
        "Flytt oppmerksomheten fra bare beregning til antakelser, representasjon og modellgyldighet.",
      before: [
        "La elevene sammenligne lineær og prosentvis vekst.",
        "Be om et overslag før programmet kjøres.",
        "Diskuter hva som holdes konstant i modellen.",
      ],
      misconceptions: [
        "Prosenttilleggene adderes i stedet for å multipliseres.",
        "** forveksles med multiplikasjon.",
        "Et presist desimaltall tolkes som en sikker virkelighetsbeskrivelse.",
      ],
      assess:
        "Eleven kan forklare uttrykket, beregne en verdi og nevne minst én relevant begrensning ved modellen.",
      extension:
        "Sammenlign modellen med månedlig vekst eller en rente som endres underveis.",
    },
  },
];

const steps = ["Problem", "Oppfriskning", "Lær", "Prøv", "Forklar", "Oppgave"];
const legacyPlaygroundCode = `# Dette er deres frie Python-rom.
# Slett eksemplet eller bygg videre på det.

navn = "10. trinn"
for tall in range(1, 6):
    print(navn, "utforsker", tall ** 2)`;

const playgroundCode = "";

const firstProject: LocalProject = {
  id: "mitt-forste-prosjekt",
  name: "Mitt første prosjekt",
  code: playgroundCode,
  updatedAt: new Date(0).toISOString(),
};

function safeProjectName(name: string) {
  return name.trim().replace(/[\\/:*?"<>|]+/g, "-") || "python-prosjekt";
}

const pythonTokens = /(#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:False|None|True|and|as|break|class|continue|def|elif|else|for|from|if|import|in|is|not|or|pass|return|while)\b|\b(?:abs|float|int|len|max|min|print|range|round|str|sum)\b|\b\d+(?:\.\d+)?\b)/g;

function colorPython(source: string): ReactNode[] {
  return source.split(pythonTokens).map((token, index) => {
    let kind = "plain";
    if (token.startsWith("#")) kind = "comment";
    else if (token.startsWith('"') || token.startsWith("'")) kind = "string";
    else if (/^(?:False|None|True|and|as|break|class|continue|def|elif|else|for|from|if|import|in|is|not|or|pass|return|while)$/.test(token)) kind = "keyword";
    else if (/^(?:abs|float|int|len|max|min|print|range|round|str|sum)$/.test(token)) kind = "builtin";
    else if (/^\d+(?:\.\d+)?$/.test(token)) kind = "number";
    return <span className={`py-${kind}`} key={`${index}-${token}`}>{token}</span>;
  });
}

function PythonEditor({ id, value, onChange, describedBy, fontSize, tall = false }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  describedBy: string;
  fontSize: number;
  tall?: boolean;
}) {
  const highlightRef = useRef<HTMLPreElement | null>(null);
  function changeIndent(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const input = event.currentTarget;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;

    if (event.shiftKey) {
      const blockEnd = end > start ? end : value.indexOf("\n", start) === -1 ? value.length : value.indexOf("\n", start);
      const block = value.slice(lineStart, blockEnd);
      let removedBeforeStart = 0;
      let removedTotal = 0;
      const unindented = block.replace(/^(?: {1,4}|\t)/gm, (indent, offset) => {
        if (lineStart + offset < start) removedBeforeStart += indent.length;
        removedTotal += indent.length;
        return "";
      });
      onChange(`${value.slice(0, lineStart)}${unindented}${value.slice(blockEnd)}`);
      requestAnimationFrame(() => {
        input.selectionStart = Math.max(lineStart, start - removedBeforeStart);
        input.selectionEnd = Math.max(lineStart, end - removedTotal);
      });
      return;
    }

    if (end > start) {
      const blockEnd = value[end - 1] === "\n" ? end - 1 : end;
      const block = value.slice(lineStart, blockEnd);
      const indented = block.replace(/^/gm, "    ");
      const lineCount = (block.match(/^/gm) ?? []).length;
      onChange(`${value.slice(0, lineStart)}${indented}${value.slice(blockEnd)}`);
      requestAnimationFrame(() => {
        input.selectionStart = start + 4;
        input.selectionEnd = end + lineCount * 4;
      });
      return;
    }

    onChange(`${value.slice(0, start)}    ${value.slice(end)}`);
    requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd = start + 4;
    });
  }
  return (
    <div className={`python-editor ${tall ? "is-tall" : ""}`} style={{ "--editor-font-size": `${fontSize}px` } as CSSProperties}>
      <pre className="syntax-layer" ref={highlightRef} aria-hidden="true">{colorPython(`${value}\n`)}</pre>
      <textarea
        id={id}
        className="syntax-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={changeIndent}
        onScroll={(event) => {
          if (!highlightRef.current) return;
          highlightRef.current.scrollTop = event.currentTarget.scrollTop;
          highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-describedby={describedBy}
      />
    </div>
  );
}

function turtleViewport(drawing: TurtleDrawing) {
  const requestedWidth = Math.max(400, drawing.canvasWidth || 1000);
  const requestedHeight = Math.max(300, drawing.canvasHeight || 700);
  const hasExplicitScreen = drawing.events.some((event) => event.kind === "screen");
  const coordinates: [number, number][] = hasExplicitScreen
    ? [[-requestedWidth / 2, -requestedHeight / 2], [requestedWidth / 2, requestedHeight / 2]]
    : [[0, 0]];
  for (const event of drawing.events) {
    if (event.x1 !== undefined && event.y1 !== undefined) coordinates.push([event.x1, event.y1]);
    if (event.x2 !== undefined && event.y2 !== undefined) coordinates.push([event.x2, event.y2]);
    if (event.x !== undefined && event.y !== undefined) coordinates.push([event.x, event.y]);
    if (event.points) coordinates.push(...event.points);
  }
  const xs = coordinates.map(([x]) => x);
  const ys = coordinates.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const minimumAutoWidth = 300;
  const minimumAutoHeight = minimumAutoWidth * requestedHeight / requestedWidth;
  const spanX = Math.max(hasExplicitScreen ? requestedWidth : minimumAutoWidth, maxX - minX);
  const spanY = Math.max(hasExplicitScreen ? requestedHeight : minimumAutoHeight, maxY - minY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const outputRatio = requestedWidth / requestedHeight;
  let worldWidth = spanX / 0.92;
  let worldHeight = spanY / 0.92;
  if (worldWidth / worldHeight > outputRatio) worldHeight = worldWidth / outputRatio;
  else worldWidth = worldHeight * outputRatio;
  return { requestedWidth, requestedHeight, centerX, centerY, worldWidth, worldHeight };
}

function finalTurtleEvents(events: TurtleEvent[]) {
  let lastClear = -1;
  events.forEach((event, index) => { if (event.kind === "clear") lastClear = index; });
  return events.slice(lastClear + 1);
}

function samePoint(a: [number, number], b: [number, number]) {
  return Math.abs(a[0] - b[0]) < 0.0001 && Math.abs(a[1] - b[1]) < 0.0001;
}

function turtlePaths(events: TurtleEvent[], settings: TurtleWorkshopSettings) {
  const paths: TurtlePath[] = [];
  let current: TurtlePath | null = null;
  for (const event of finalTurtleEvents(events)) {
    if (event.kind !== "line" || event.x1 === undefined || event.y1 === undefined || event.x2 === undefined || event.y2 === undefined) {
      if (event.kind === "move") current = null;
      continue;
    }
    const color = settings.useCodeColors ? (event.color || settings.color) : settings.color;
    const widthMm = settings.useCodeWidths ? Math.max(0.1, (event.width || 2.5) * 0.12) : settings.strokeWidthMm;
    const start: [number, number] = [event.x1, event.y1];
    const end: [number, number] = [event.x2, event.y2];
    if (!current || current.color !== color || current.widthMm !== widthMm || !samePoint(current.points[current.points.length - 1], start)) {
      current = { points: [start, end], color, widthMm };
      paths.push(current);
    } else {
      current.points.push(end);
    }
  }
  return paths;
}

function offsetTurtlePath(points: [number, number][], distance: number) {
  if (points.length < 2) return { left: points, right: points, closed: false };
  const closed = points.length > 2 && samePoint(points[0], points[points.length - 1]);
  const source = closed ? points.slice(0, -1) : points;
  const normal = (start: [number, number], end: [number, number]) => {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.hypot(dx, dy) || 1;
    return [-dy / length, dx / length] as [number, number];
  };
  const offsetPoint = (index: number, side: number) => {
    const point = source[index];
    const previousIndex = index === 0 ? (closed ? source.length - 1 : 0) : index - 1;
    const nextIndex = index === source.length - 1 ? (closed ? 0 : source.length - 1) : index + 1;
    const previousNormal = normal(source[previousIndex], point);
    const nextNormal = normal(point, source[nextIndex]);
    if (!closed && index === 0) return [point[0] + nextNormal[0] * distance * side, point[1] + nextNormal[1] * distance * side] as [number, number];
    if (!closed && index === source.length - 1) return [point[0] + previousNormal[0] * distance * side, point[1] + previousNormal[1] * distance * side] as [number, number];
    const sumX = previousNormal[0] + nextNormal[0];
    const sumY = previousNormal[1] + nextNormal[1];
    const sumLength = Math.hypot(sumX, sumY);
    if (sumLength < 0.001) return [point[0] + nextNormal[0] * distance * side, point[1] + nextNormal[1] * distance * side] as [number, number];
    const miterX = sumX / sumLength;
    const miterY = sumY / sumLength;
    const denominator = Math.max(0.25, Math.abs(miterX * nextNormal[0] + miterY * nextNormal[1]));
    const miterDistance = Math.min(distance * 4, distance / denominator) * side;
    return [point[0] + miterX * miterDistance, point[1] + miterY * miterDistance] as [number, number];
  };
  const left = source.map((_, index) => offsetPoint(index, 1));
  const right = source.map((_, index) => offsetPoint(index, -1));
  if (closed) {
    left.push(left[0]);
    right.push(right[0]);
  }
  return { left, right, closed };
}

function xmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function createTurtleSvg(drawing: TurtleDrawing, settings: TurtleWorkshopSettings) {
  const viewport = turtleViewport(drawing);
  const widthMm = Math.max(20, settings.outputWidthMm);
  const heightMm = widthMm * viewport.worldHeight / viewport.worldWidth;
  const worldUnitsPerMm = viewport.worldWidth / widthMm;
  const hairlineWorld = 0.1 * worldUnitsPerMm;
  const viewLeft = viewport.centerX - viewport.worldWidth / 2;
  const viewTop = -viewport.centerY - viewport.worldHeight / 2;
  const coordinate = ([x, y]: [number, number]) => `${Number(x.toFixed(4))},${Number((-y).toFixed(4))}`;
  const openPath = (points: [number, number][]) => points.map((point, index) => `${index ? "L" : "M"}${coordinate(point)}`).join(" ");
  const vectorElements: string[] = [];
  const fillElements: string[] = [];
  const textElements: string[] = [];

  for (const path of turtlePaths(drawing.events, settings)) {
    if (path.points.length < 2) continue;
    const color = xmlEscape(path.color);
    const strokeWorld = Math.max(0.05, path.widthMm) * worldUnitsPerMm;
    if (settings.mode === "centerline") {
      vectorElements.push(`<path d="${openPath(path.points)}" fill="none" stroke="${color}" stroke-width="${strokeWorld}" stroke-linecap="${settings.lineCap}" stroke-linejoin="round"/>`);
      continue;
    }
    const offsets = offsetTurtlePath(path.points, strokeWorld / 2);
    if (settings.mode === "edges" || offsets.closed) {
      vectorElements.push(`<path d="${openPath(offsets.left)}" fill="none" stroke="${color}" stroke-width="${hairlineWorld}" stroke-linejoin="round"/>`);
      vectorElements.push(`<path d="${openPath(offsets.right)}" fill="none" stroke="${color}" stroke-width="${hairlineWorld}" stroke-linejoin="round"/>`);
    } else {
      const outline = [...offsets.left, ...offsets.right.slice().reverse()];
      vectorElements.push(`<path d="${openPath(outline)} Z" fill="none" stroke="${color}" stroke-width="${hairlineWorld}" stroke-linejoin="round"/>`);
    }
  }

  if (settings.includeFills) {
    for (const event of finalTurtleEvents(drawing.events)) {
      const color = xmlEscape(settings.useCodeColors ? (event.color || settings.color) : settings.color);
      if (event.kind === "fill" && event.points && event.points.length >= 3) {
        fillElements.push(`<path d="${openPath(event.points)} Z" fill="${color}" stroke="none"/>`);
      }
      if (event.kind === "dot" && event.x !== undefined && event.y !== undefined) {
        const radius = Math.max(0.05 * worldUnitsPerMm, (event.size || 6) / 2);
        fillElements.push(`<circle cx="${event.x}" cy="${-event.y}" r="${radius}" fill="${color}"/>`);
      }
    }
  }

  if (settings.includeText) {
    for (const event of finalTurtleEvents(drawing.events)) {
      if (event.kind !== "text" || event.x === undefined || event.y === undefined) continue;
      const color = xmlEscape(settings.useCodeColors ? (event.color || settings.color) : settings.color);
      const anchor = event.align === "center" ? "middle" : event.align === "right" ? "end" : "start";
      textElements.push(`<text x="${event.x}" y="${-event.y}" fill="${color}" font-family="Arial, sans-serif" font-size="${event.size || 12}" text-anchor="${anchor}">${xmlEscape(event.text || "")}</text>`);
    }
  }

  const modeNames: Record<TurtleVectorMode, string> = { centerline: "senterlinje", edges: "to ytterlinjer", outline: "lukket omriss" };
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${Number(heightMm.toFixed(2))}mm" viewBox="${viewLeft} ${viewTop} ${viewport.worldWidth} ${viewport.worldHeight}">\n  <title>${xmlEscape(drawing.title || "Turtle-tegning")}</title>\n  <desc>Laget i Bjørnsveen Pythonverksted. Vektortype: ${modeNames[settings.mode]}. Transparent bakgrunn.</desc>\n  <g id="turtle-vektorer">\n    ${[...fillElements, ...vectorElements, ...textElements].join("\n    ")}\n  </g>\n</svg>\n`;
}

function renderTurtleFrame(canvas: HTMLCanvasElement, drawing: TurtleDrawing, frame: number, workshop = defaultTurtleWorkshop, workshopPreview = false) {
  const outputWidth = 1400;
  const viewport = turtleViewport(drawing);
  const { requestedWidth, requestedHeight, centerX, centerY } = viewport;
  const outputHeight = Math.round(outputWidth * requestedHeight / requestedWidth);
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) return;
  const layer = document.createElement("canvas");
  layer.width = outputWidth;
  layer.height = outputHeight;
  const layerContext = layer.getContext("2d");
  if (!layerContext) return;

  const events = drawing.events.slice(0, Math.max(0, frame));
  const scale = outputWidth / viewport.worldWidth;
  const point = (x = 0, y = 0) => ({
    x: outputWidth / 2 + (x - centerX) * scale,
    y: outputHeight / 2 - (y - centerY) * scale,
  });

  let background = "white";
  let title = drawing.title || "Turtle-tegning";
  let cursor = { x: 0, y: 0, heading: 0, visible: true };

  for (const event of events) {
    if (event.kind === "background") {
      background = event.color || background;
      continue;
    }
    if (event.kind === "title") {
      title = event.text || title;
      continue;
    }
    if (event.x2 !== undefined && event.y2 !== undefined) cursor = { x: event.x2, y: event.y2, heading: event.heading ?? cursor.heading, visible: event.visible ?? cursor.visible };
    else if (event.x !== undefined && event.y !== undefined) cursor = { x: event.x, y: event.y, heading: event.heading ?? cursor.heading, visible: event.visible ?? cursor.visible };
  }

  const visibleEvents = finalTurtleEvents(events);
  if (workshop.includeFills) {
    for (const event of visibleEvents) {
      if (event.kind === "fill" && event.points && event.points.length >= 3) {
        layerContext.save();
        layerContext.globalCompositeOperation = "destination-over";
        layerContext.beginPath();
        event.points.forEach(([x, y], index) => {
          const next = point(x, y);
          if (index === 0) layerContext.moveTo(next.x, next.y);
          else layerContext.lineTo(next.x, next.y);
        });
        layerContext.closePath();
        layerContext.fillStyle = workshop.useCodeColors ? (event.color || workshop.color) : workshop.color;
        layerContext.fill();
        layerContext.restore();
      }
      if (event.kind === "dot") {
        const center = point(event.x, event.y);
        layerContext.beginPath();
        layerContext.arc(center.x, center.y, Math.max(0.5, Math.max(0.05 * viewport.worldWidth / Math.max(20, workshop.outputWidthMm), (event.size || 6) / 2) * scale), 0, Math.PI * 2);
        layerContext.fillStyle = workshop.useCodeColors ? (event.color || workshop.color) : workshop.color;
        layerContext.fill();
      }
    }
  }

  const drawVectorPath = (points: [number, number][], color: string, width: number, close = false, lineCap: CanvasLineCap = "butt") => {
    if (points.length < 2) return;
    layerContext.beginPath();
    points.forEach(([x, y], index) => {
      const next = point(x, y);
      if (index === 0) layerContext.moveTo(next.x, next.y);
      else layerContext.lineTo(next.x, next.y);
    });
    if (close) layerContext.closePath();
    layerContext.fillStyle = "transparent";
    layerContext.strokeStyle = color;
    layerContext.lineWidth = width;
    layerContext.lineCap = lineCap;
    layerContext.lineJoin = "round";
    layerContext.stroke();
  };

  for (const path of turtlePaths(events, workshop)) {
    const strokePixels = Math.max(0.5, path.widthMm / Math.max(20, workshop.outputWidthMm) * outputWidth);
    if (workshop.mode === "centerline") {
      drawVectorPath(path.points, path.color, strokePixels, false, workshop.lineCap);
      continue;
    }
    const worldUnitsPerMm = viewport.worldWidth / Math.max(20, workshop.outputWidthMm);
    const offsets = offsetTurtlePath(path.points, path.widthMm * worldUnitsPerMm / 2);
    const hairlinePixels = Math.max(0.5, 0.1 / Math.max(20, workshop.outputWidthMm) * outputWidth);
    if (workshop.mode === "edges" || offsets.closed) {
      drawVectorPath(offsets.left, path.color, hairlinePixels);
      drawVectorPath(offsets.right, path.color, hairlinePixels);
    } else {
      drawVectorPath([...offsets.left, ...offsets.right.slice().reverse()], path.color, hairlinePixels, true);
    }
  }

  if (workshop.includeText) {
    for (const event of visibleEvents) {
      if (event.kind !== "text") continue;
      const textPoint = point(event.x, event.y);
      layerContext.fillStyle = workshop.useCodeColors ? (event.color || workshop.color) : workshop.color;
      layerContext.font = `${Math.max(13, (event.size || 12) * Math.min(2, Math.max(1, scale / 8)))}px Arial, sans-serif`;
      layerContext.textAlign = event.align || "left";
      layerContext.textBaseline = "bottom";
      layerContext.fillText(event.text || "", textPoint.x, textPoint.y);
    }
  }

  context.fillStyle = background;
  context.fillRect(0, 0, outputWidth, outputHeight);
  context.drawImage(layer, 0, 0);

  if (!workshopPreview && cursor.visible && frame > 0) {
    const cursorPoint = point(cursor.x, cursor.y);
    const angle = -cursor.heading * Math.PI / 180;
    context.save();
    context.translate(cursorPoint.x, cursorPoint.y);
    context.rotate(angle);
    context.beginPath();
    context.moveTo(15, 0);
    context.lineTo(-10, -9);
    context.lineTo(-6, 0);
    context.lineTo(-10, 9);
    context.closePath();
    context.fillStyle = "#f06f51";
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.fill();
    context.stroke();
    context.restore();
  }
  canvas.dataset.turtleTitle = title;
}

function TurtlePlayer({ drawing, settings, onSettingsChange, onDownload, onDownloadSvg, onExpand, large = false }: {
  drawing: TurtleDrawing;
  settings: TurtleWorkshopSettings;
  onSettingsChange: (settings: TurtleWorkshopSettings) => void;
  onDownload: (settings: TurtleWorkshopSettings) => void;
  onDownloadSvg: (settings: TurtleWorkshopSettings) => void;
  onExpand?: () => void;
  large?: boolean;
}) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [colorDraft, setColorDraft] = useState(settings.color);
  const [workshopPreview, setWorkshopPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastFrame = drawing.events.length;

  useEffect(() => {
    setFrame(0);
    setPlaying(true);
    setWorkshopPreview(false);
  }, [drawing]);

  useEffect(() => setColorDraft(settings.color), [settings.color]);

  useEffect(() => {
    if (canvasRef.current) renderTurtleFrame(canvasRef.current, drawing, frame, settings, workshopPreview);
  }, [drawing, frame, settings, workshopPreview]);

  useEffect(() => {
    if (!playing || frame >= lastFrame) {
      if (frame >= lastFrame) setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setFrame((current) => Math.min(lastFrame, current + 1)), 150 / speed);
    return () => window.clearTimeout(timer);
  }, [frame, lastFrame, playing, speed]);

  const svgHeight = settings.outputWidthMm * turtleViewport(drawing).worldHeight / turtleViewport(drawing).worldWidth;
  const modeHelp: Record<TurtleVectorMode, string> = {
    centerline: "Én vektor midt i streken. Passer til lasergravering, penn og plotter.",
    edges: "To åpne vektorer langs hver ytterkant. Nyttig når begge kantene skal bearbeides.",
    outline: "Et lukket omriss rundt streken. Dette er vanligst til vinylkutting og utskjæring.",
  };
  const updateWorkshop = <Key extends keyof TurtleWorkshopSettings,>(key: Key, value: TurtleWorkshopSettings[Key]) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  const applyColorDraft = () => {
    const normalized = colorDraft.trim();
    if (/^#[0-9a-f]{6}$/i.test(normalized)) updateWorkshop("color", normalized.toLowerCase());
    else setColorDraft(settings.color);
  };

  return (
    <figure className={`turtle-player ${large ? "is-large" : ""}`}>
      <div className="turtle-heading">
        <div><span>Turtle-canvas</span><strong>{drawing.title || "Turtle-tegning"}</strong></div>
        <span>{workshopPreview ? "SVG-forhåndsvisning" : frame === lastFrame ? "Ferdig" : `Steg ${frame} av ${lastFrame}`}</span>
      </div>
      <div className="turtle-canvas-wrap">
        <canvas ref={canvasRef} aria-label={workshopPreview ? `${drawing.title || "Turtle-tegning"}, forhåndsvisning av eksportert SVG` : `${drawing.title || "Turtle-tegning"}, steg ${frame} av ${lastFrame}`} />
        <details className="turtle-maker-menu" onToggle={(event) => {
          const open = event.currentTarget.open;
          if (open) {
            setWorkshopPreview(true);
            setPlaying(false);
            setFrame(lastFrame);
          }
        }}>
          <summary><span>◇</span> Skaperverksted</summary>
          <div className="turtle-maker-panel">
            <header>
              <div><small>SVG-VERKTØY</small><strong>Gjør mønsteret klart for maskinen</strong></div>
              <span>{settings.outputWidthMm.toFixed(0)} × {svgHeight.toFixed(0)} mm</span>
            </header>
            <label>Vektortype
              <select value={settings.mode} onChange={(event) => updateWorkshop("mode", event.target.value as TurtleVectorMode)}>
                <option value="centerline">Senterlinje</option>
                <option value="edges">To ytterlinjer</option>
                <option value="outline">Lukket omriss</option>
              </select>
            </label>
            <p className="maker-mode-help">{modeHelp[settings.mode]}</p>
            <div className="maker-number-grid">
              <label>Strektykkelse
                <span><input type="number" min="0.1" max="50" step="0.1" value={settings.strokeWidthMm} disabled={settings.useCodeWidths} onChange={(event) => updateWorkshop("strokeWidthMm", Math.min(50, Math.max(0.1, Number(event.target.value) || 0.1)))} /> mm</span>
              </label>
              <label>Ferdig bredde
                <span><input type="number" min="20" max="1000" step="5" value={settings.outputWidthMm} onChange={(event) => updateWorkshop("outputWidthMm", Math.min(1000, Math.max(20, Number(event.target.value) || 20)))} /> mm</span>
              </label>
            </div>
            <label className="maker-range"><span>Tykkelse i forhåndsvisningen</span>
              <input type="range" min="0.1" max="20" step="0.1" value={Math.min(20, settings.strokeWidthMm)} disabled={settings.useCodeWidths} onChange={(event) => updateWorkshop("strokeWidthMm", Number(event.target.value))} />
            </label>
            <label className="maker-check"><input type="checkbox" checked={settings.useCodeWidths} onChange={(event) => updateWorkshop("useCodeWidths", event.target.checked)} /> Behold tykkelser fra Python-koden</label>
            <div className="maker-color-row">
              <label>Vektorfarge
                <span className="maker-color-inputs">
                  <input type="color" value={settings.color} disabled={settings.useCodeColors} onChange={(event) => updateWorkshop("color", event.target.value)} />
                  <input
                    type="text"
                    aria-label="Fargekode"
                    value={colorDraft}
                    disabled={settings.useCodeColors}
                    onChange={(event) => setColorDraft(event.target.value)}
                    onBlur={applyColorDraft}
                    onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
                    spellCheck={false}
                  />
                </span>
              </label>
              <label className="maker-check"><input type="checkbox" checked={settings.useCodeColors} onChange={(event) => updateWorkshop("useCodeColors", event.target.checked)} /> Behold farger fra Python</label>
            </div>
            <div className="maker-options">
              <label className="maker-check"><input type="checkbox" checked={settings.includeFills} onChange={(event) => updateWorkshop("includeFills", event.target.checked)} /> Ta med fyll og prikker</label>
              <label className="maker-check"><input type="checkbox" checked={settings.includeText} onChange={(event) => updateWorkshop("includeText", event.target.checked)} /> Ta med tekst</label>
              <label>Strekender på senterlinje
                <select value={settings.lineCap} onChange={(event) => updateWorkshop("lineCap", event.target.value as "round" | "square")}>
                  <option value="round">Runde</option>
                  <option value="square">Rette</option>
                </select>
              </label>
            </div>
            {settings.includeText && <p className="maker-warning">Tekst lagres som redigerbar SVG-tekst. Gjør teksten om til kurver i vektorprogrammet før kutting.</p>}
            <footer>
              <span>Transparent bakgrunn · ekte vektorer</span>
              <button type="button" onClick={() => onDownloadSvg(settings)}>Last ned SVG</button>
            </footer>
          </div>
        </details>
      </div>
      <div className="turtle-timeline">
        <input
          type="range"
          min="0"
          max={Math.max(1, lastFrame)}
          value={frame}
          onChange={(event) => { setWorkshopPreview(false); setPlaying(false); setFrame(Number(event.target.value)); }}
          aria-label="Velg steg i Turtle-tegningen"
        />
      </div>
      <figcaption className="turtle-controls">
        <div className="turtle-playback" aria-label="Avspillingsknapper">
          <button type="button" onClick={() => { setWorkshopPreview(false); setPlaying(false); setFrame(0); }} aria-label="Start på nytt">↺</button>
          <button type="button" onClick={() => { setWorkshopPreview(false); setPlaying(false); setFrame((current) => Math.max(0, current - 1)); }} disabled={frame === 0} aria-label="Ett steg tilbake">←</button>
          <button className="turtle-play" type="button" onClick={() => { setWorkshopPreview(false); if (frame >= lastFrame) setFrame(0); setPlaying((current) => !current); }} disabled={lastFrame === 0}>
            {playing ? "Pause" : "Spill"}
          </button>
          <button type="button" onClick={() => { setWorkshopPreview(false); setPlaying(false); setFrame((current) => Math.min(lastFrame, current + 1)); }} disabled={frame >= lastFrame} aria-label="Ett steg fram">→</button>
          <button type="button" onClick={() => { setWorkshopPreview(false); setPlaying(false); setFrame(lastFrame); }}>{workshopPreview ? "Vis Turtle" : "Vis ferdig"}</button>
        </div>
        <label className="turtle-speed">Hastighet
          <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
            <option value="0.25">0,25×</option>
            <option value="0.5">0,5×</option>
            <option value="1">1×</option>
            <option value="2">2×</option>
            <option value="4">4×</option>
          </select>
        </label>
        <div className="turtle-actions">
          {onExpand && <button type="button" onClick={onExpand}>Åpne stort</button>}
          <button type="button" onClick={() => onDownload(settings)}>Lagre PNG</button>
          <button className="turtle-svg-button" type="button" onClick={() => onDownloadSvg(settings)}>Lagre SVG</button>
        </div>
      </figcaption>
      {drawing.truncated && <p className="turtle-warning">Tegningen har over 5000 steg. De første 5000 vises for å holde appen rask.</p>}
    </figure>
  );
}

export default function Home() {
  const [activeId, setActiveId] = useState(1);
  const [playground, setPlayground] = useState(false);
  const [teacherMode, setTeacherMode] = useState(false);
  const [code, setCode] = useState("");
  const [labTab, setLabTab] = useState<"practice" | "solution">("practice");
  const [practiceCodes, setPracticeCodes] = useState<Record<number, string>>({});
  const [solutionCodes, setSolutionCodes] = useState<Record<number, string>>(
    Object.fromEntries(modules.map((module) => [module.id, module.starterCode])),
  );
  const [output, setOutput] = useState("Trykk «Kjør kode» når du er klar.");
  const [runnerStatus, setRunnerStatus] = useState<"idle" | "loading" | "running" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState<number[]>([]);
  const [projects, setProjects] = useState<LocalProject[]>([firstProject]);
  const [activeProjectId, setActiveProjectId] = useState(firstProject.id);
  const [shareStatus, setShareStatus] = useState("");
  const [plotImages, setPlotImages] = useState<string[]>([]);
  const [expandedPlotIndex, setExpandedPlotIndex] = useState<number | null>(null);
  const [turtleDrawing, setTurtleDrawing] = useState<TurtleDrawing | null>(null);
  const [turtleWorkshop, setTurtleWorkshop] = useState<TurtleWorkshopSettings>(defaultTurtleWorkshop);
  const [turtleExpanded, setTurtleExpanded] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(19);
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const [desktopFilePath, setDesktopFilePath] = useState("");
  const [referenceQuery, setReferenceQuery] = useState("");
  const [referenceCategory, setReferenceCategory] = useState<ReferenceCategory>("Alle");
  const [referenceStatus, setReferenceStatus] = useState("");
  const [snippetCategory, setSnippetCategory] = useState<SnippetCategory>("Alle");
  const [snippetStatus, setSnippetStatus] = useState("");
  const workbenchRef = useRef<HTMLDivElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = useMemo(
    () => modules.find((item) => item.id === activeId) ?? modules[0],
    [activeId],
  );

  const filteredReferences = useMemo(() => {
    const query = referenceQuery.trim().toLocaleLowerCase("nb");
    return playgroundReferences.filter((reference) => {
      if (referenceCategory !== "Alle" && reference.category !== referenceCategory) return false;
      if (!query) return true;
      const searchable = [
        reference.title,
        reference.purpose,
        reference.category,
        reference.level,
        reference.example,
        reference.tip ?? "",
        ...reference.commands.flatMap((command) => [command.code, command.explanation]),
        ...reference.experiments,
      ].join(" ").toLocaleLowerCase("nb");
      return searchable.includes(query);
    });
  }, [referenceCategory, referenceQuery]);

  const filteredSnippets = useMemo(
    () => codeSnippets.filter((snippet) => snippetCategory === "Alle" || snippet.category === snippetCategory),
    [snippetCategory],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("pythonverkstedet-progress");
    const savedMode = window.localStorage.getItem("pythonverkstedet-mode");
    const savedProjects = window.localStorage.getItem("bjornsveen-python-projects");
    const savedActiveProject = window.localStorage.getItem("bjornsveen-python-active-project");
    const savedEditorFontSize = Number(window.localStorage.getItem("bjornsveen-editor-font-size"));
    if (saved) setCompleted(JSON.parse(saved));
    if (savedMode === "teacher") setTeacherMode(true);
    if (savedProjects) {
      try {
        const parsed = (JSON.parse(savedProjects) as LocalProject[]).map((project) =>
          project.id === firstProject.id && project.code === legacyPlaygroundCode
            ? { ...project, code: "" }
            : project,
        );
        if (parsed.length) {
          setProjects(parsed);
          const selected = parsed.find((project) => project.id === savedActiveProject) ?? parsed[0];
          setActiveProjectId(selected.id);
          window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(parsed));
        }
      } catch {
        window.localStorage.removeItem("bjornsveen-python-projects");
      }
    }
    if (savedEditorFontSize >= 15 && savedEditorFontSize <= 28) setEditorFontSize(savedEditorFontSize);
    const handleFullscreenChange = () => setEditorFullscreen(document.fullscreenElement === workbenchRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      workerRef.current?.terminate();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function changeEditorFontSize(change: number) {
    const next = Math.min(28, Math.max(15, editorFontSize + change));
    setEditorFontSize(next);
    window.localStorage.setItem("bjornsveen-editor-font-size", String(next));
  }

  async function toggleEditorFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    if (!workbenchRef.current?.requestFullscreen) {
      setShareStatus("Fullskjerm støttes ikke av denne nettleseren.");
      return;
    }
    try {
      await workbenchRef.current.requestFullscreen();
    } catch {
      setShareStatus("Nettleseren tillot ikke fullskjerm. Prøv knappen på nytt.");
    }
  }

  function chooseModule(module: Module) {
    setPlayground(false);
    setActiveId(module.id);
    setLabTab("practice");
    setCode(practiceCodes[module.id] ?? "");
    setOutput("Trykk «Kjør kode» når du er klar.");
    setFeedback("");
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choosePlayground() {
    setPlayground(true);
    const project = projects.find((item) => item.id === activeProjectId) ?? projects[0];
    setCode(project?.code ?? playgroundCode);
    setOutput("Skriv eller endre koden, og trykk «Kjør kode».");
    setFeedback("");
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleMode() {
    const next = !teacherMode;
    setTeacherMode(next);
    window.localStorage.setItem("pythonverkstedet-mode", next ? "teacher" : "student");
  }

  function updateCode(nextCode: string) {
    setCode(nextCode);
    if (!playground) {
      if (labTab === "practice") setPracticeCodes((current) => ({ ...current, [active.id]: nextCode }));
      else setSolutionCodes((current) => ({ ...current, [active.id]: nextCode }));
      return;
    }
    const nextProjects = projects.map((project) =>
      project.id === activeProjectId
        ? { ...project, code: nextCode, updatedAt: new Date().toISOString() }
        : project,
    );
    setProjects(nextProjects);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(nextProjects));
  }

  function openReferenceProject(reference: PlaygroundReference) {
    const project: LocalProject = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: safeProjectName(`Eksempel ${reference.title}`),
      code: reference.example,
      updatedAt: new Date().toISOString(),
    };
    const nextProjects = [...projects, project];
    setProjects(nextProjects);
    setActiveProjectId(project.id);
    setDesktopFilePath("");
    setCode(project.code);
    setOutput(`«${reference.title}» er åpnet som et nytt prosjekt. Forutsi resultatet før du kjører.`);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setReferenceStatus(`Eksemplet «${reference.title}» ble åpnet som et nytt prosjekt. Det gamle prosjektet er bevart.`);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(nextProjects));
    window.localStorage.setItem("bjornsveen-python-active-project", project.id);
    requestAnimationFrame(() => workbenchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function copyReferenceCode(reference: PlaygroundReference) {
    try {
      await navigator.clipboard.writeText(reference.example);
      setReferenceStatus(`Koden til «${reference.title}» er kopiert.`);
    } catch {
      setReferenceStatus("Nettleseren tillot ikke kopiering. Åpne kortet og marker koden manuelt.");
    }
  }

  function appendSnippet(snippet: CodeSnippet) {
    const nextCode = code.trimEnd() ? `${code.trimEnd()}\n\n${snippet.code}` : snippet.code;
    updateCode(nextCode);
    setSnippetStatus(`«${snippet.title}» er lagt til nederst i editoren. Endre navn, tall og tekst slik dere vil.`);
    requestAnimationFrame(() => {
      const editor = document.getElementById("playground-code") as HTMLTextAreaElement | null;
      editor?.focus();
      editor?.setSelectionRange(nextCode.length, nextCode.length);
      workbenchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function copySnippet(snippet: CodeSnippet) {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setSnippetStatus(`«${snippet.title}» er kopiert. Lim den inn der dere vil.`);
    } catch {
      setSnippetStatus("Nettleseren tillot ikke kopiering. Marker koden i kortet og kopier manuelt.");
    }
  }

  function switchLabTab(nextTab: "practice" | "solution") {
    if (nextTab === labTab) return;
    if (labTab === "practice") setPracticeCodes((current) => ({ ...current, [active.id]: code }));
    else setSolutionCodes((current) => ({ ...current, [active.id]: code }));
    setLabTab(nextTab);
    setCode(nextTab === "practice" ? (practiceCodes[active.id] ?? "") : (solutionCodes[active.id] ?? active.starterCode));
    setOutput("Trykk «Kjør kode» når du er klar.");
    setFeedback("");
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
  }

  function resetCurrentEditor() {
    const nextCode = labTab === "practice" ? "" : active.starterCode;
    setCode(nextCode);
    if (labTab === "practice") setPracticeCodes((current) => ({ ...current, [active.id]: nextCode }));
    else setSolutionCodes((current) => ({ ...current, [active.id]: nextCode }));
    setFeedback("");
    setOutput("Trykk «Kjør kode» når du er klar.");
  }

  function tryProgressionCode(nextCode: string) {
    setLabTab("practice");
    setCode(nextCode);
    setPracticeCodes((current) => ({ ...current, [active.id]: nextCode }));
    setOutput("Forutsi resultatet, og trykk «Kjør kode» når du er klar.");
    setFeedback("");
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    requestAnimationFrame(() => document.getElementById("module-lab")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function selectProject(projectId: string) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;
    setActiveProjectId(projectId);
    setDesktopFilePath("");
    setCode(project.code);
    setOutput("Prosjektet er åpnet. Trykk «Kjør kode» når du er klar.");
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setShareStatus("");
    window.localStorage.setItem("bjornsveen-python-active-project", projectId);
  }

  function createProject() {
    const name = window.prompt("Hva skal prosjektet hete?", `Nytt prosjekt ${projects.length + 1}`);
    if (!name?.trim()) return;
    const project: LocalProject = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: safeProjectName(name),
      code: "",
      updatedAt: new Date().toISOString(),
    };
    const next = [...projects, project];
    setProjects(next);
    setActiveProjectId(project.id);
    setDesktopFilePath("");
    setCode(project.code);
    setOutput("Nytt prosjekt opprettet lokalt på denne enheten.");
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
    window.localStorage.setItem("bjornsveen-python-active-project", project.id);
  }

  function renameProject() {
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return;
    const name = window.prompt("Nytt navn på prosjektet:", project.name);
    if (!name?.trim()) return;
    const next = projects.map((item) => item.id === project.id ? { ...item, name: safeProjectName(name) } : item);
    setProjects(next);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
  }

  function deleteProject() {
    if (projects.length === 1) {
      setShareStatus("Du må ha minst ett prosjekt.");
      return;
    }
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project || !window.confirm(`Slette «${project.name}» fra denne enheten?`)) return;
    const next = projects.filter((item) => item.id !== activeProjectId);
    setProjects(next);
    setActiveProjectId(next[0].id);
    setCode(next[0].code);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
    window.localStorage.setItem("bjornsveen-python-active-project", next[0].id);
  }

  function downloadProject() {
    const project = projects.find((item) => item.id === activeProjectId) ?? firstProject;
    const blob = new Blob([code], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeProjectName(project.name)}.py`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function openDesktopProject() {
    const opened = await window.bjornsveenDesktop?.openProject();
    if (!opened) return;
    const project: LocalProject = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: opened.name,
      code: opened.code,
      updatedAt: new Date().toISOString(),
    };
    const next = [...projects, project];
    setProjects(next);
    setActiveProjectId(project.id);
    setDesktopFilePath(opened.filePath);
    setCode(opened.code);
    setOutput("Prosjektet er åpnet fra Mac-en.");
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
  }

  async function saveDesktopProject(saveAs = false) {
    const project = projects.find((item) => item.id === activeProjectId) ?? firstProject;
    const saved = await window.bjornsveenDesktop?.saveProject({
      filePath: saveAs ? undefined : desktopFilePath || undefined,
      name: project.name,
      code,
    });
    if (!saved) return;
    setDesktopFilePath(saved.filePath);
    const next = projects.map((item) => item.id === activeProjectId ? { ...item, name: saved.name } : item);
    setProjects(next);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
    setShareStatus("Prosjektet er lagret som en vanlig .py-fil på Mac-en.");
  }

  async function importProject(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const importedCode = await file.text();
    const project: LocalProject = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: safeProjectName(file.name.replace(/\.py$/i, "")),
      code: importedCode,
      updatedAt: new Date().toISOString(),
    };
    const next = [...projects, project];
    setProjects(next);
    setActiveProjectId(project.id);
    setDesktopFilePath("");
    setCode(importedCode);
    setOutput("Python-filen er importert som et lokalt prosjekt.");
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
    window.localStorage.setItem("bjornsveen-python-active-project", project.id);
    event.target.value = "";
  }

  async function copyCodeAsText() {
    const answer = output.trim() || "Ingen utskrift ennå.";
    const plainText = `Python-kode:\n${code || "(tom editor)"}\n\nSvar / resultat:\n${answer}`;
    try {
      if ("ClipboardItem" in window && navigator.clipboard?.write) {
        const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const html = `<div style="font-family: ui-monospace, SFMono-Regular, Consolas, monospace;"><h3>Python-kode</h3><pre style="white-space: pre-wrap; background: #102e2b; color: #eef5ef; padding: 16px; border-radius: 8px;"><code>${escape(code || "(tom editor)")}</code></pre><h3>Svar / resultat</h3><pre style="white-space: pre-wrap; background: #f4f4f4; padding: 16px; border-radius: 8px;">${escape(answer)}</pre></div>`;
        await navigator.clipboard.write([new ClipboardItem({
          "text/plain": new Blob([plainText], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        })]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      setShareStatus("Koden og svaret er kopiert som formatert tekst.");
    } catch {
      setShareStatus("Nettleseren tillot ikke kopiering. Marker koden og kopier manuelt.");
    }
  }

  async function copyCodeAsImage(filename: string) {
    const lines = (code || "(tom editor)").replace(/\t/g, "    ").split("\n");
    const answerLines = (output.trim() || "Ingen utskrift ennå.").split("\n");
    const fontSize = 20;
    const lineHeight = 31;
    const padding = 34;
    const titleHeight = 58;
    const canvas = document.createElement("canvas");
    const measure = canvas.getContext("2d");
    if (!measure) return;
    measure.font = `${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    const width = Math.min(1800, Math.max(720, ...[...lines, ...answerLines].map((line) => measure.measureText(line).width + padding * 2)));
    const visualSources = plotImages.map((plotImage) => `data:image/png;base64,${plotImage}`);
    if (turtleDrawing) {
      const turtleCanvas = document.createElement("canvas");
      renderTurtleFrame(turtleCanvas, turtleDrawing, turtleDrawing.events.length, turtleWorkshop);
      visualSources.unshift(turtleCanvas.toDataURL("image/png"));
    }
    const plots = await Promise.all(visualSources.map(async (plotSource) => {
      const plot = new Image();
      plot.src = plotSource;
      await plot.decode();
      return plot;
    }));
    const codeHeight = padding + lines.length * lineHeight + padding;
    const answerHeaderHeight = 48;
    const answerHeight = padding + answerLines.length * lineHeight + padding;
    const plotHeights = plots.map((plot) => Math.min(430, (plot.height / plot.width) * (width - padding * 2)));
    const plotHeight = plotHeights.reduce((sum, item) => sum + item + padding, 0);
    const height = Math.max(320, titleHeight + codeHeight + answerHeaderHeight + answerHeight + plotHeight);
    canvas.width = width * 2;
    canvas.height = height * 2;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(2, 2);
    context.fillStyle = "#102e2b";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#183a36";
    context.fillRect(0, 0, width, titleHeight);
    context.fillStyle = "#f06f51";
    context.beginPath(); context.arc(25, 29, 6, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#f4c95d";
    context.beginPath(); context.arc(45, 29, 6, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#6fd79f";
    context.beginPath(); context.arc(65, 29, 6, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#d9e8df";
    context.font = "700 14px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.fillText(filename, 92, 34);
    context.fillStyle = "#e7eee9";
    context.font = `${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    lines.forEach((line, index) => context.fillText(line, padding, titleHeight + padding + (index + 1) * lineHeight));
    const answerTop = titleHeight + codeHeight;
    context.fillStyle = "#234b46";
    context.fillRect(0, answerTop, width, answerHeaderHeight);
    context.fillStyle = "#9fe5bd";
    context.font = "700 15px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.fillText("SVAR / RESULTAT", padding, answerTop + 31);
    context.fillStyle = "#0c2421";
    context.fillRect(0, answerTop + answerHeaderHeight, width, answerHeight + plotHeight);
    context.fillStyle = "#e7eee9";
    context.font = `${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    answerLines.forEach((line, index) => context.fillText(line, padding, answerTop + answerHeaderHeight + padding + (index + 1) * lineHeight));
    let nextPlotTop = answerTop + answerHeaderHeight + answerHeight;
    plots.forEach((plot, index) => {
      const drawWidth = width - padding * 2;
      const drawHeight = plotHeights[index];
      context.drawImage(plot, padding, nextPlotTop, drawWidth, drawHeight);
      nextPlotTop += drawHeight + padding;
    });
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setShareStatus("Hele kodeeditoren og svaret er kopiert som bilde.");
    } catch {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${filename.replace(/\.py$/, "")}-kode.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setShareStatus("Bildet ble lastet ned fordi nettleseren ikke tillot bildekopiering.");
    }
  }

  function downloadPlot(index: number) {
    const plotImage = plotImages[index];
    if (!plotImage) return;
    const activeProject = projects.find((item) => item.id === activeProjectId);
    const baseName = playground ? safeProjectName(activeProject?.name ?? "python-graf") : `modul-${active.id}-graf`;
    const anchor = document.createElement("a");
    anchor.href = `data:image/png;base64,${plotImage}`;
    anchor.download = `${baseName}${plotImages.length > 1 ? `-${index + 1}` : ""}.png`;
    anchor.click();
    setShareStatus("Grafen er lagret som PNG-bilde.");
  }

  function turtleBaseName() {
    const activeProject = projects.find((item) => item.id === activeProjectId);
    return playground ? safeProjectName(activeProject?.name ?? "turtle-tegning") : `modul-${active.id}-turtle`;
  }

  function downloadTurtle(settings: TurtleWorkshopSettings) {
    if (!turtleDrawing) return;
    const canvas = document.createElement("canvas");
    renderTurtleFrame(canvas, turtleDrawing, turtleDrawing.events.length, settings);
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `${turtleBaseName()}.png`;
    anchor.click();
    setShareStatus("Turtle-forhåndsvisningen er lagret som et skarpt PNG-bilde.");
  }

  function downloadTurtleSvg(settings: TurtleWorkshopSettings) {
    if (!turtleDrawing) return;
    const svg = createTurtleSvg(turtleDrawing, settings);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${turtleBaseName()}-${settings.mode}.svg`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    const modeNames: Record<TurtleVectorMode, string> = { centerline: "senterlinje", edges: "to ytterlinjer", outline: "lukket omriss" };
    setShareStatus(`SVG med ${modeNames[settings.mode]} er lagret i riktig millimeterstørrelse.`);
  }

  function plotGallery() {
    if (!plotImages.length && !turtleDrawing) return null;
    return (
      <div className={`plot-gallery ${turtleDrawing ? "has-turtle" : ""}`} aria-label={turtleDrawing ? "Turtle-tegning og grafer" : plotImages.length === 1 ? "Graf" : `${plotImages.length} grafer`}>
        {turtleDrawing && (
          <TurtlePlayer
            drawing={turtleDrawing}
            settings={turtleWorkshop}
            onSettingsChange={setTurtleWorkshop}
            onDownload={downloadTurtle}
            onDownloadSvg={downloadTurtleSvg}
            onExpand={() => setTurtleExpanded(true)}
          />
        )}
        {plotImages.map((plotImage, index) => (
          <figure className="plot-card" key={`${index}-${plotImage.slice(0, 18)}`}>
            <img className="plot-output" src={`data:image/png;base64,${plotImage}`} alt={`Graf ${index + 1} laget av Python-koden`} />
            <figcaption>
              <span>{plotImages.length === 1 ? "Graf" : `Graf ${index + 1}`}</span>
              <span className="plot-actions">
                <button type="button" onClick={() => setExpandedPlotIndex(index)}>Åpne stort</button>
                <button type="button" onClick={() => downloadPlot(index)}>Lagre bilde</button>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  function makeWorker() {
    workerRef.current?.terminate();
    const worker = new Worker(new URL("pyodide-worker.mjs", document.baseURI), {
      type: "module",
    });
    workerRef.current = worker;
    return worker;
  }

  async function runCode() {
    setRunnerStatus("loading");
    setOutput("Starter Python … Første kjøring kan ta litt tid.");
    setFeedback("");
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);

    const worker = makeWorker();
    let executionStarted = false;

    worker.onmessage = (event) => {
      const data = event.data as { type: string; output?: string; error?: string; plots?: string[]; turtle?: TurtleDrawing | null };
      if (data.type === "ready") {
        executionStarted = true;
        setRunnerStatus("running");
        setOutput("Kjører …");
        worker.postMessage({ code });
        timeoutRef.current = setTimeout(() => {
          worker.terminate();
          setRunnerStatus("error");
          setOutput("Programmet brukte for lang tid og ble stoppet. Sjekk særlig løkker som kanskje aldri avsluttes.");
        }, playground ? 90000 : 8000);
      }

      if (data.type === "result") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setRunnerStatus("idle");
        const nextPlots = data.plots ?? [];
        const nextTurtle = data.turtle ?? null;
        setOutput(data.output?.trim() || (nextTurtle ? "Turtle-tegningen kan spilles av steg for steg under." : nextPlots.length ? `${nextPlots.length === 1 ? "Grafen" : `${nextPlots.length} grafer`} vises under.` : "Koden kjørte ferdig uten utskrift."));
        setPlotImages(nextPlots);
        setTurtleDrawing(nextTurtle);
        worker.terminate();
      }

      if (data.type === "error") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setRunnerStatus("error");
        setOutput(data.error || "Noe gikk galt.");
        worker.terminate();
      }
    };

    worker.onerror = (event) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setRunnerStatus("error");
      const detail = event.message ? ` Teknisk detalj: ${event.message}` : "";
      setOutput(
        executionStarted
          ? `Python-motoren stoppet. Prøv å kjøre på nytt.${detail}`
          : `Kunne ikke laste Python-motoren. Sjekk nettilkoblingen og prøv igjen.${detail}`,
      );
      worker.terminate();
    };
  }

  function checkAnswer() {
    const normalized = output.trim().toLowerCase();
    if (active.expected.length === 0) {
      setFeedback(
        normalized && !normalized.startsWith("trykk")
          ? "Godt jobbet. Sammenlign resultatet med 0,333 og forklar avviket."
          : "Kjør den endrede koden først.",
      );
      return;
    }
    const correct = active.expected.some((answer) => normalized.includes(answer.toLowerCase()));
    setFeedback(
      correct
        ? "Ja! Nå gjenstår den viktigste delen: Forklar med egne ord hvorfor koden gir dette svaret."
        : `Ikke helt ennå. ${active.taskHint}`,
    );
  }

  function completeModule() {
    const next = completed.includes(active.id) ? completed : [...completed, active.id];
    setCompleted(next);
    window.localStorage.setItem("pythonverkstedet-progress", JSON.stringify(next));
  }

  const progress = Math.round((completed.length / modules.length) * 100);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Bjørnsveen Pythonverksted hjem">
          <span className="brand-mark"><img src="./brand/kodeormen-256.png" width="58" height="58" alt="" decoding="sync" /></span>
          <span>
            <strong>Bjørnsveen Pythonverksted</strong>
            <small>Matematikk · 8.–10. trinn</small>
          </span>
        </a>
        <div className="module-picker">
          <label htmlFor="module-select">Velg modul</label>
          <select
            id="module-select"
            value={playground ? "playground" : String(active.id)}
            onChange={(event) => {
              if (event.target.value === "playground") choosePlayground();
              else chooseModule(modules[Number(event.target.value) - 1]);
            }}
          >
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {completed.includes(module.id) ? "✓ " : ""}Modul {module.id}: {module.shortTitle}
              </option>
            ))}
            <option value="playground">✦ Fritt Python-rom</option>
          </select>
          <span className="module-position">{completed.length} av {modules.length} fullført</span>
        </div>
        <nav className="top-actions" aria-label="Verktøy">
          <button className="text-button print-button" type="button" onClick={() => window.print()}>
            Skriv ut
          </button>
          <button
            className={`mode-switch ${teacherMode ? "is-teacher" : ""}`}
            type="button"
            onClick={toggleMode}
            aria-pressed={teacherMode}
          >
            <span className="switch-track"><span /></span>
            {teacherMode ? "Lærermodus" : "Elevmodus"}
          </button>
        </nav>
      </header>
      <div className="course-progress" aria-label={`${progress} prosent fullført`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="app-shell" id="top">
        {playground && (
          <article className="lesson playground-page">
            <section className="lesson-hero playground-hero">
              <div className="hero-copy">
                <p className="kicker">Fritt verksted · Ingen fasit</p>
                <h1>La oss prøve noe sammen</h1>
                <p className="hero-intro">Her kan dere skrive egne Python-programmer fra bunnen av. Still et spørsmål, gjett hva som vil skje, kjør koden og bruk resultatet til å stille et nytt spørsmål.</p>
                <div className="playground-prompts">
                  <span>1 · Hva tror vi skjer?</span>
                  <span>2 · Prøv</span>
                  <span>3 · Observer</span>
                  <span>4 · Endre én ting</span>
                </div>
              </div>
              <div className="hero-stamp playground-stamp" aria-hidden="true">
                <span>Python</span>
                <strong>&gt;_</strong>
                <small>fritt rom</small>
              </div>
            </section>

            <section className="content-section lab-section playground-lab" id="python-editor">
              <div className="section-heading lab-heading">
                <div>
                  <p className="section-label inverse"><span>1</span> Start her · Python-editor</p>
                  <h2>Skriv, bygg og kjør med én gang</h2>
                  <p className="playground-lab-intro">Skriv selv, eller legg sammen ferdige byggeklosser fra kodebyggeren rett under editoren. Alt kan endres.</p>
                </div>
                <div className="live-badge"><span /> Ekte Python i nettleseren</div>
              </div>
              <div className={`code-workbench ${turtleDrawing ? "has-turtle" : ""}`} ref={workbenchRef}>
                <div className="editor-panel">
                  <div className="panel-bar">
                    <span><i className="dot coral" /><i className="dot cream" /><i className="dot green" /></span>
                    <strong>{safeProjectName(projects.find((item) => item.id === activeProjectId)?.name ?? "mitt-program")}.py</strong>
                    <span className="panel-tools">
                      <button type="button" onClick={copyCodeAsText}>Kopier kode + svar</button>
                      <button type="button" onClick={() => copyCodeAsImage(`${safeProjectName(projects.find((item) => item.id === activeProjectId)?.name ?? "mitt-program")}.py`)}>Bilde av kode + svar</button>
                      <span className="editor-size-controls" aria-label="Skriftstørrelse i kodefeltet">
                        <button type="button" onClick={() => changeEditorFontSize(-2)} disabled={editorFontSize <= 15} aria-label="Mindre kodetekst">A−</button>
                        <output aria-live="polite">{editorFontSize} px</output>
                        <button type="button" onClick={() => changeEditorFontSize(2)} disabled={editorFontSize >= 28} aria-label="Større kodetekst">A+</button>
                      </span>
                      <button type="button" onClick={toggleEditorFullscreen} aria-pressed={editorFullscreen}>{editorFullscreen ? "Avslutt fullskjerm" : "Fullskjerm"}</button>
                    </span>
                  </div>
                  <label htmlFor="playground-code" className="sr-only">Skriv fri Python-kode</label>
                  <PythonEditor
                    id="playground-code"
                    value={code}
                    onChange={updateCode}
                    describedBy="playground-help"
                    fontSize={editorFontSize}
                    tall
                  />
                  <div className="editor-footer" id="playground-help">
                    <span>Start tomt, eller bruk kodebyggeren under.</span>
                    <button type="button" className="run-button" onClick={runCode} disabled={runnerStatus === "loading" || runnerStatus === "running"}>
                      <span>▶</span>{runnerStatus === "loading" ? "Laster Python …" : runnerStatus === "running" ? "Kjører …" : "Kjør kode"}
                    </button>
                  </div>
                </div>
                <div className="output-panel" aria-live="polite">
                  <div className="panel-bar output-bar">
                    <strong>Resultat</strong>
                    <span className={`status-dot ${runnerStatus}`} />
                  </div>
                  <pre>{output}</pre>
                  {plotGallery()}
                  <div className="output-tip"><strong>Neste spørsmål:</strong> Hva kan dere endre for å få et annet resultat?</div>
                </div>
              </div>
              {shareStatus && <p className="share-status" role="status">{shareStatus}</p>}

              <div className="snippet-builder" id="kodebygger">
                <div className="snippet-heading">
                  <div>
                    <p className="section-label"><span>+</span> Kodebygger</p>
                    <h3>Bygg et program av små deler</h3>
                    <p>Velg en byggekloss. «Legg til i editor» beholder koden dere allerede har og setter den nye delen nederst.</p>
                  </div>
                  <a href="#python-handbok">Trenger dere mer? Åpne hele håndboken ↓</a>
                </div>
                <div className="snippet-categories" aria-label="Filtrer kodesnutter etter emne">
                  {snippetCategories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      className={snippetCategory === category ? "is-active" : ""}
                      aria-pressed={snippetCategory === category}
                      onClick={() => setSnippetCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="snippet-grid">
                  {filteredSnippets.map((snippet) => (
                    <article className="snippet-card" key={snippet.id}>
                      <div className="snippet-card-heading">
                        <span>{snippet.category}</span>
                        <h4>{snippet.title}</h4>
                        <p>{snippet.purpose}</p>
                      </div>
                      <pre><code>{snippet.code}</code></pre>
                      <p className="snippet-change"><strong>Endre selv:</strong> {snippet.change}</p>
                      <div className="snippet-actions">
                        <button type="button" className="snippet-add" onClick={() => appendSnippet(snippet)}>+ Legg til i editor</button>
                        <button type="button" onClick={() => copySnippet(snippet)}>Kopier</button>
                      </div>
                    </article>
                  ))}
                </div>
                {snippetStatus && <p className="snippet-status" role="status">{snippetStatus}</p>}
              </div>

              <div className="package-guide">
                <div>
                  <strong>Datapakker som fungerer her</strong>
                  <p>NumPy, pandas, Matplotlib, SciPy, SymPy, scikit-learn, Pillow og NetworkX lastes automatisk når de importeres.</p>
                </div>
                <div>
                  <strong>Turtle for geometri og mønstre</strong>
                  <p>Bruk <code>from turtle import *</code>. Tegningen kan spilles av, åpnes stort og lagres som PNG eller SVG.</p>
                </div>
                <div>
                  <strong>Ikke helt som installert Python</strong>
                  <p>Pakker som krever maskinvare, egne skjermvinduer eller en server kan ikke kjøre i nettleseren.</p>
                </div>
              </div>
            </section>

            <section className="content-section playground-guide">
              <p className="section-label"><span>?</span> Start med undring</p>
              <h2>Hva har dere lyst til å undersøke?</h2>
              <div className="idea-chips" aria-label="Forslag til ting dere kan undersøke">
                <button type="button" onClick={() => updateCode('for tall in range(1, 11):\n    print(tall, tall ** 2)')}>Lag et tallmønster</button>
                <button type="button" onClick={() => updateCode('import random\n\nfor _ in range(10):\n    print(random.randint(1, 6))')}>Kast en terning</button>
                <button type="button" onClick={() => updateCode('def areal(lengde, bredde):\n    return lengde * bredde\n\nprint(areal(8, 5))')}>Lag en funksjon</button>
                <button type="button" onClick={() => updateCode('import numpy as np\nimport matplotlib.pyplot as plt\n\nx = np.linspace(-5, 5, 100)\ny = x ** 2\n\nplt.plot(x, y)\nplt.title("Grafen til y = x²")\nplt.grid()\nplt.show()')}>Tegn en graf</button>
                <button type="button" onClick={() => updateCode('from turtle import *\n\ncolor("#f06f51", "#f4c95d")\npensize(5)\n\nbegin_fill()\nfor side in range(4):\n    forward(120)\n    left(90)\nend_fill()\n\ndone()')}>Tegn et Turtle-kvadrat</button>
                <button type="button" onClick={() => updateCode('from turtle import *\n\nbgcolor("#fffdf8")\ncolor("#2f6b5f")\npensize(3)\n\nfor lengde in range(10, 190, 6):\n    forward(lengde)\n    left(91)\n\ndone()')}>Lag en geometrisk spiral</button>
                <button type="button" onClick={() => updateCode('import pandas as pd\n\ndata = {"navn": ["Ada", "Bo", "Celine"], "poeng": [8, 12, 10]}\ntabell = pd.DataFrame(data)\nprint(tabell.to_string(index=False))')}>Lag en tabell</button>
                <button type="button" onClick={() => updateCode("")}>Tøm kodefeltet</button>
              </div>
              <a className="reference-jump" href="#python-handbok">Trenger du en oppskrift? Åpne Python-håndboken ↓</a>
            </section>

            <section className="content-section playground-reference" id="python-handbok">
              <div className="reference-heading">
                <div>
                  <p className="section-label"><span>⌘</span> Python-håndbok</p>
                  <h2>Finn det du trenger – og prøv med én gang</h2>
                  <p>Dette er oppslagsverket for det frie rommet. Finn en kommando, se et komplett eksempel og åpne det som et nytt prosjekt. Det du allerede arbeider med, blir bevart.</p>
                </div>
                <div className="reference-method" aria-label="Arbeidsmåte">
                  <span><b>1</b> Finn</span>
                  <span><b>2</b> Forutsi</span>
                  <span><b>3</b> Prøv</span>
                  <span><b>4</b> Endre</span>
                </div>
              </div>

              <div className="reference-controls">
                <label className="reference-search" htmlFor="reference-search">
                  <span>Søk i håndboken</span>
                  <div>
                    <span aria-hidden="true">⌕</span>
                    <input
                      id="reference-search"
                      type="search"
                      value={referenceQuery}
                      onChange={(event) => setReferenceQuery(event.target.value)}
                      placeholder="Prøv: løkke, graf, tilfeldig, gjennomsnitt …"
                    />
                    {referenceQuery && <button type="button" onClick={() => setReferenceQuery("")}>Tøm</button>}
                  </div>
                </label>
                <div className="reference-categories" aria-label="Filtrer håndboken etter emne">
                  {referenceCategories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      className={referenceCategory === category ? "is-active" : ""}
                      aria-pressed={referenceCategory === category}
                      onClick={() => setReferenceCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <p className="reference-count" aria-live="polite">
                  Viser {filteredReferences.length} av {playgroundReferences.length} emner
                </p>
              </div>

              {filteredReferences.length > 0 ? (
                <div className="reference-grid">
                  {filteredReferences.map((reference) => (
                    <details className="reference-card" key={reference.id}>
                      <summary>
                        <span className={`reference-level level-${reference.level.toLocaleLowerCase("nb")}`}>{reference.level}</span>
                        <span className="reference-category">{reference.category}</span>
                        <h3>{reference.title}</h3>
                        <p>{reference.purpose}</p>
                        <span className="reference-open">Åpne forklaring og kode</span>
                      </summary>
                      <div className="reference-card-content">
                        <h4>Viktige koder og kommandoer</h4>
                        <dl className="command-list">
                          {reference.commands.map((command) => (
                            <div key={command.code}>
                              <dt><code>{command.code}</code></dt>
                              <dd>{command.explanation}</dd>
                            </div>
                          ))}
                        </dl>

                        <div className="reference-example-heading">
                          <div><small>Kjørbart eksempel</small><strong>Skriv det selv, eller åpne en kopi</strong></div>
                          <button type="button" onClick={() => copyReferenceCode(reference)}>Kopier kode</button>
                        </div>
                        <pre className="reference-code"><code>{reference.example}</code></pre>

                        <div className="reference-experiments">
                          <h4>Eksperimenter videre</h4>
                          <ul>{reference.experiments.map((experiment) => <li key={experiment}>{experiment}</li>)}</ul>
                        </div>
                        {reference.tip && <p className="reference-tip"><strong>Husk:</strong> {reference.tip}</p>}
                        <button className="reference-open-project" type="button" onClick={() => openReferenceProject(reference)}>
                          Åpne som nytt prosjekt <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <div className="reference-empty">
                  <strong>Ingen emner traff søket.</strong>
                  <p>Prøv et kortere ord, eller velg «Alle».</p>
                  <button type="button" onClick={() => { setReferenceQuery(""); setReferenceCategory("Alle"); }}>Vis hele håndboken</button>
                </div>
              )}
              {referenceStatus && <p className="reference-status" role="status">{referenceStatus}</p>}

              <div className="debug-guide">
                <div>
                  <p className="section-label"><span>!</span> Når koden ikke virker</p>
                  <h3>Les feilmeldingen nedenfra</h3>
                  <p>Den siste linjen forteller vanligvis hva Python reagerte på. Finn linjenummeret, og kontroller én ting om gangen.</p>
                </div>
                <ul>
                  <li><code>SyntaxError</code><span>Se etter manglende kolon, parentes eller anførselstegn.</span></li>
                  <li><code>IndentationError</code><span>Kontroller innrykket etter if, for, else og def.</span></li>
                  <li><code>NameError</code><span>Er navnet skrevet likt – og laget før det brukes?</span></li>
                  <li><code>TypeError</code><span>Blander du tekst og tall på en måte Python ikke forstår?</span></li>
                </ul>
              </div>
            </section>

            <section className="content-section project-section">
              <div className="project-heading">
                <div>
                  <p className="section-label"><span>⌂</span> Lokale prosjekter</p>
                  <h2>Fortsett der dere slapp</h2>
                  <p>Prosjektene lagres automatisk i nettleseren på denne enheten. Last ned en <code>.py</code>-fil hvis prosjektet skal flyttes eller sikkerhetskopieres.</p>
                </div>
                <button type="button" className="new-project-button" onClick={createProject}>+ Nytt prosjekt</button>
              </div>
              <div className="project-toolbar">
                <label>
                  <span>Åpent prosjekt</span>
                  <select value={activeProjectId} onChange={(event) => selectProject(event.target.value)}>
                    {projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}
                  </select>
                </label>
                <button type="button" onClick={renameProject}>Gi nytt navn</button>
                <button type="button" onClick={downloadProject}>Last ned .py</button>
                <label className="import-button">Importer .py<input type="file" accept=".py,text/x-python" onChange={importProject} /></label>
                {window.bjornsveenDesktop?.isDesktop && <button type="button" onClick={openDesktopProject}>Åpne fra Mac</button>}
                {window.bjornsveenDesktop?.isDesktop && <button type="button" onClick={() => saveDesktopProject(false)}>Lagre</button>}
                {window.bjornsveenDesktop?.isDesktop && <button type="button" onClick={() => saveDesktopProject(true)}>Lagre som …</button>}
                <button type="button" className="delete-project-button" onClick={deleteProject}>Slett</button>
              </div>
            </section>

            <section className="content-section playground-reflection">
              <p className="section-label"><span>↻</span> Utforsk videre</p>
              <h2>En god arbeidsmåte i det frie rommet</h2>
              <ol className="question-list">
                <li><span>1</span><p>Forutsi resultatet før dere kjører.</p></li>
                <li><span>2</span><p>Endre bare én ting om gangen.</p></li>
                <li><span>3</span><p>Forklar hva endringen gjorde – og hvorfor.</p></li>
              </ol>
            </section>
          </article>
        )}

        {!playground && (
        <article className="lesson">
          <section className="lesson-hero">
            <div className="hero-copy">
              <p className="kicker">Modul {active.id} · {active.eyebrow}</p>
              <h1>{active.title}</h1>
              <p className="hero-intro">{active.intro}</p>
              <div className="step-row" aria-label="Arbeidsflyt">
                {steps.map((step, index) => (
                  <span key={step}><b>{index + 1}</b>{step}</span>
                ))}
              </div>
            </div>
            <div className="hero-stamp" aria-hidden="true">
              <span>Modul</span>
              <strong>{String(active.id).padStart(2, "0")}</strong>
              <small>av 06</small>
            </div>
          </section>

          <section className="problem-card content-section">
            <p className="section-label"><span>1</span> Problemstilling</p>
            <h2>{active.question}</h2>
            <p>Gjør et overslag eller tenk ut en strategi før du ser på koden. Hva forventer du at programmet må gjøre?</p>
          </section>

          <section className="content-section refresh-section">
            <div className="refresh-copy">
              <p className="section-label"><span>2</span> Kort oppfriskning</p>
              <h2>{active.refresh.title}</h2>
              <p>{active.refresh.body}</p>
              <p className="refresh-note">Les eksemplene høyt med egne ord. Da blir tegnene i koden lettere å forstå.</p>
            </div>
            <div className="refresh-examples">
              {active.refresh.examples.map((example) => (
                <div className="refresh-example" key={example.code}>
                  <code>{example.code}</code>
                  <p>{example.explanation}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="content-section theory-section">
            <div className="section-heading">
              <div>
                <p className="section-label"><span>3</span> Slik gjør du det</p>
                <h2>Én idé om gangen – steg for steg</h2>
              </div>
              <p>Følg rekkefølgen, og si hva hver linje gjør.</p>
            </div>
            <div className="theory-grid">
              {active.theory.map((item, index) => (
                <div className="theory-card" key={item.title}>
                  <span className="theory-index">0{index + 1}</span>
                  <div className="theory-content">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    {item.code && <code>{item.code}</code>}
                    <ol className="how-to-list">
                      {item.steps.map((step) => <li key={step}>{step}</li>)}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="content-section progression-section">
            <div className="section-heading">
              <div>
                <p className="section-label"><span>+</span> Bygg kompetanse</p>
                <h2>Små steg som bygger på hverandre</h2>
              </div>
              <p>{active.progression.intro}</p>
            </div>
            <div className="progression-grid">
              {active.progression.steps.map((step, index) => (
                <article className="progression-card" key={step.title}>
                  <div className="progression-card-heading">
                    <span>{index + 1}</span>
                    <div><small>{step.label}</small><h3>{step.title}</h3></div>
                  </div>
                  <p>{step.body}</p>
                  <pre><code>{step.code}</code></pre>
                  <div className="progression-task"><strong>Prøv selv:</strong> {step.tryThis}</div>
                  {step.upgrade && (
                    <details className="progression-upgrade">
                      <summary>✦ {step.upgrade.title}</summary>
                      <p>{step.upgrade.body}</p>
                      <pre><code>{step.upgrade.code}</code></pre>
                    </details>
                  )}
                  <button type="button" onClick={() => tryProgressionCode(step.code)}>Prøv koden i laboratoriet</button>
                </article>
              ))}
            </div>
          </section>

          <section className="content-section polish-section">
            <details>
              <summary>
                <span className="polish-spark">✦</span>
                <span><small>Valgfritt ekstratriks</small><strong>{active.polish.title}</strong></span>
                <span className="polish-open">Vis trikset</span>
              </summary>
              <div className="polish-content">
                <div>
                  <p>{active.polish.body}</p>
                  <p className="polish-explanation"><strong>Hva betyr det?</strong> {active.polish.explanation}</p>
                </div>
                <div className="polish-code-change">
                  <span>Før</span><code>{active.polish.before}</code>
                  <span>Etter</span><code>{active.polish.after}</code>
                </div>
              </div>
            </details>
          </section>

          <section className="content-section lab-section" id="module-lab">
            <div className="section-heading lab-heading">
              <div>
                <p className="section-label inverse"><span>4</span> Python-laboratorium</p>
                <h2>Prøv. Endre. Kjør igjen.</h2>
              </div>
              <div className="live-badge"><span /> Ekte Python i nettleseren</div>
            </div>

            <div className="lab-tabs" role="tablist" aria-label="Velg arbeidsmåte">
              <button type="button" role="tab" aria-selected={labTab === "practice"} className={labTab === "practice" ? "is-active" : ""} onClick={() => switchLabTab("practice")}>
                <span>1</span><strong>Skriv selv</strong><small>Tom editor med hjelp</small>
              </button>
              <button type="button" role="tab" aria-selected={labTab === "solution"} className={labTab === "solution" ? "is-active" : ""} onClick={() => switchLabTab("solution")}>
                <span>2</span><strong>Fasit</strong><small>Ferdig, men redigerbar</small>
              </button>
            </div>

            {labTab === "practice" && (
              <div className="typing-guide">
                <div className="typing-guide-intro">
                  <span className="keyboard-icon">⌨</span>
                  <h3>Skriv programmet selv</h3>
                  <p>Ta én rad om gangen. Det som står i kodefeltet, skal skrives. Teksten under forklarer hva koden gjør.</p>
                  <div className="typing-legend" aria-label="Forklaring av merkingen">
                    <span><i className="legend-code" /> Skriv i editoren</span>
                    <span><i className="legend-explanation" /> Forklaring eller handling</span>
                  </div>
                </div>
                <ol className="typing-steps">
                  {active.typingSteps.map((instruction, index) => (
                    <li className={instruction.kind === "write" ? "is-code-step" : "is-action-step"} key={`${index}-${instruction.code ?? instruction.explanation}`}>
                      <span className="typing-step-number">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <span className="typing-step-kind">{instruction.kind === "write" ? "Skriv dette i kodefeltet" : "Gjør dette"}</span>
                        {instruction.code && <code>{instruction.code}</code>}
                        <div className="typing-explanation"><strong>{instruction.kind === "write" ? "Forklaring" : "Neste handling"}</strong><p>{instruction.explanation}</p></div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {labTab === "solution" && (
              <div className="solution-note"><strong>Fasit er ikke låst.</strong> Endre tall, tekst eller uttrykk, kjør på nytt og se hva som skjer.</div>
            )}

            <div className={`code-workbench module-workbench ${turtleDrawing ? "has-turtle" : ""}`} ref={workbenchRef}>
              <div className="editor-panel">
                <div className="panel-bar">
                  <span><i className="dot coral" /><i className="dot cream" /><i className="dot green" /></span>
                  <strong>verksted.py</strong>
                  <span className="panel-tools">
                    <button type="button" onClick={copyCodeAsText}>Kopier kode + svar</button>
                    <button type="button" onClick={() => copyCodeAsImage("verksted.py")}>Bilde av kode + svar</button>
                    <button type="button" onClick={resetCurrentEditor}>{labTab === "practice" ? "Tøm editor" : "Tilbakestill fasit"}</button>
                    <span className="editor-size-controls" aria-label="Skriftstørrelse i kodefeltet">
                      <button type="button" onClick={() => changeEditorFontSize(-2)} disabled={editorFontSize <= 15} aria-label="Mindre kodetekst">A−</button>
                      <output aria-live="polite">{editorFontSize} px</output>
                      <button type="button" onClick={() => changeEditorFontSize(2)} disabled={editorFontSize >= 28} aria-label="Større kodetekst">A+</button>
                    </span>
                    <button type="button" onClick={toggleEditorFullscreen} aria-pressed={editorFullscreen}>{editorFullscreen ? "Avslutt fullskjerm" : "Fullskjerm"}</button>
                  </span>
                </div>
                <label htmlFor="python-code" className="sr-only">Python-kode</label>
                <PythonEditor
                  id="python-code"
                  value={code}
                  onChange={updateCode}
                  describedBy="editor-help"
                  fontSize={editorFontSize}
                />
                <div className="editor-footer" id="editor-help">
                  <span>{labTab === "practice" ? "Skriv én linje om gangen. Feil er en del av øvingen." : "Du kan endre alt i fasiten."}</span>
                  <button type="button" className="run-button" onClick={runCode} disabled={runnerStatus === "loading" || runnerStatus === "running"}>
                    <span>▶</span>{runnerStatus === "loading" ? "Laster Python …" : runnerStatus === "running" ? "Kjører …" : "Kjør kode"}
                  </button>
                </div>
              </div>

              <div className="output-panel" aria-live="polite">
                <div className="panel-bar output-bar">
                  <strong>Resultat</strong>
                  <span className={`status-dot ${runnerStatus}`} />
                </div>
                <pre>{output}</pre>
                {plotGallery()}
                <div className="output-tip"><strong>Observer:</strong> Stemmer resultatet med det du forventet?</div>
              </div>
            </div>
            {shareStatus && <p className="share-status" role="status">{shareStatus}</p>}
          </section>

          <section className="content-section observe-section">
            <div className="section-heading">
              <div>
                <p className="section-label"><span>5</span> Observer og forklar</p>
                <h2>Stopp før du går videre</h2>
              </div>
              <p>Snakk med en medelev, eller skriv to setninger.</p>
            </div>
            <ol className="question-list">
              {active.observe.map((question, index) => (
                <li key={question}><span>{index + 1}</span><p>{question}</p></li>
              ))}
            </ol>
            <div className="sentence-starter">
              <span>Setningsstarter</span>
              <p>«Programmet skal … Først … Deretter … Resultatet blir … fordi …»</p>
            </div>
          </section>

          <section className="content-section task-section">
            <div className="task-copy">
              <p className="section-label inverse"><span>6</span> Din oppgave</p>
              <h2>{active.task}</h2>
              <p>Gå tilbake til laboratoriet, gjør endringen og kjør programmet.</p>
            </div>
            <div className="task-actions">
              <button type="button" className="check-button" onClick={checkAnswer}>Sjekk resultatet</button>
              <button type="button" className="complete-button" onClick={completeModule}>
                {completed.includes(active.id) ? "✓ Modul fullført" : "Marker som fullført"}
              </button>
            </div>
            {feedback && <p className="feedback" role="status">{feedback}</p>}
          </section>

          {teacherMode && (
            <section className="teacher-section content-section">
              <div className="teacher-heading">
                <div>
                  <p className="section-label"><span>L</span> Lærerverksted</p>
                  <h2>Undervisningstips og vurderingsstøtte</h2>
                </div>
                <span className="teacher-only">Bare synlig i lærermodus</span>
              </div>
              <p className="teacher-purpose">{active.teacher.purpose}</p>
              <div className="teacher-grid">
                <div>
                  <h3>Før dere koder</h3>
                  <ul>{active.teacher.before.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h3>Se opp for</h3>
                  <ul>{active.teacher.misconceptions.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h3>Vurdering</h3>
                  <p>{active.teacher.assess}</p>
                </div>
                <div>
                  <h3>Utvidelse</h3>
                  <p>{active.teacher.extension}</p>
                </div>
              </div>
            </section>
          )}

          <nav className="lesson-nav" aria-label="Neste og forrige modul">
            <button
              type="button"
              disabled={active.id === 1}
              onClick={() => chooseModule(modules[active.id - 2])}
            >
              <span>←</span><small>Forrige</small>
            </button>
            <p>Modul {active.id} av {modules.length}</p>
            <button
              type="button"
              disabled={active.id === modules.length}
              onClick={() => chooseModule(modules[active.id])}
            >
              <small>Neste modul</small><span>→</span>
            </button>
          </nav>
        </article>
        )}
      </div>
      {turtleExpanded && turtleDrawing && (
        <div className="plot-modal turtle-modal" role="dialog" aria-modal="true" aria-label="Turtle-tegning i stor visning" onClick={() => setTurtleExpanded(false)}>
          <div className="plot-modal-card turtle-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="plot-modal-bar">
              <strong>Stegvis Turtle-tegning</strong>
              <button type="button" className="plot-close" onClick={() => setTurtleExpanded(false)} aria-label="Lukk stor Turtle-visning">Lukk</button>
            </div>
            <TurtlePlayer
              drawing={turtleDrawing}
              settings={turtleWorkshop}
              onSettingsChange={setTurtleWorkshop}
              onDownload={downloadTurtle}
              onDownloadSvg={downloadTurtleSvg}
              large
            />
          </div>
        </div>
      )}
      {expandedPlotIndex !== null && plotImages[expandedPlotIndex] && (
        <div className="plot-modal" role="dialog" aria-modal="true" aria-label={`Graf ${expandedPlotIndex + 1} i stor visning`} onClick={() => setExpandedPlotIndex(null)}>
          <div className="plot-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="plot-modal-bar">
              <strong>{plotImages.length === 1 ? "Graf" : `Graf ${expandedPlotIndex + 1}`}</strong>
              <span>
                <button type="button" onClick={() => downloadPlot(expandedPlotIndex)}>Lagre PNG</button>
                <button type="button" className="plot-close" onClick={() => setExpandedPlotIndex(null)} aria-label="Lukk stor graf">Lukk</button>
              </span>
            </div>
            <img src={`data:image/png;base64,${plotImages[expandedPlotIndex]}`} alt={`Graf ${expandedPlotIndex + 1} laget av Python-koden`} />
          </div>
        </div>
      )}
    </main>
  );
}
