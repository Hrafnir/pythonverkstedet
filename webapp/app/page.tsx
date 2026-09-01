"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent, KeyboardEvent, ReactNode } from "react";
import { commandCategories, pythonCommands } from "./pythonCommands";
import type { CommandCategory, PythonCommand } from "./pythonCommands";
import { challengeDifficulties, evaluateChallengeAttempt, pythonChallenges } from "./challenges";
import type { ChallengeDifficulty, PythonChallenge } from "./challenges";
import { evaluateExamAttempt, examLevels, examTasks } from "./examTraining";
import type { ExamLevel, ExamTask } from "./examTraining";
import { mathHelpTutorials } from "./mathHelp";
import { pygameTutorials } from "./pygameTutorials";
import type { PygameTutorial } from "./pygameTutorials";
import { libraryGuideGroups, libraryGuides } from "./libraryGuides";
import type { LibraryGuide, LibraryGuideGroup } from "./libraryGuides";

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
  theory: {
    title: string;
    body: string;
    code?: string;
    steps: string[];
    reflection?: string;
    why?: string;
  }[];
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
    think?: string;
    breakdown?: string[];
    why?: string;
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
  files?: ProjectFile[];
  activeFileId?: string;
};

type ProjectFile = {
  id: string;
  name: string;
  code: string;
};

type PythonDataFile = {
  name: string;
  content: string;
  size: number;
};

type PythonVariable = {
  name: string;
  type: string;
  value: string;
  size?: string;
  shape?: string;
};

type PythonTraceStep = {
  line: number;
  code: string;
  variables: PythonVariable[];
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

type SnakeGameConfig = {
  width: number;
  height: number;
  speed: number;
  snakeColor: string;
  headColor: string;
  foodColor: string;
  background: string;
  gridColor: string;
  wrap: boolean;
  title: string;
};

type ErrorCoach = {
  kind: "syntax" | "indent" | "name" | "type" | "file" | "data" | "runtime";
  title: string;
  summary: string;
  lineNumber?: number;
  codeLine?: string;
  questions: string[];
  hint: string;
  technical: string;
};

function normalizeCommandSearch(value: string) {
  return value
    .toLocaleLowerCase("nb")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .trim();
}

function plainLibraryExplanation(guide: LibraryGuide) {
  const uses = guide.useCases.map((item) => `${item.charAt(0).toLocaleLowerCase("nb-NO")}${item.slice(1)}`);
  const readableUses = uses.length > 1 ? `${uses.slice(0, -1).join(", ")} eller ${uses.at(-1)}` : uses[0];
  return `Dette biblioteket bruker du hvis du skal arbeide med ${readableUses}. ${guide.intro}`;
}

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

const referenceCategories = ["Alle", "Kom i gang", "Matematikk", "Styring", "Byggeklosser", "Utforske data", "Tegne og vise", "Spill", "Videre"] as const;
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

const snippetCategories = ["Alle", "Kom i gang", "Styring", "Byggeklosser", "Datafiler", "Tilfeldighet", "Tegning", "Spill"] as const;
type SnippetCategory = (typeof snippetCategories)[number];

type CodeSnippet = {
  id: string;
  category: Exclude<SnippetCategory, "Alle">;
  title: string;
  purpose: string;
  code: string;
  change: string;
};

const tutorialCategories = ["Alle", "Matematikk", "Biblioteker", "Utskrift", "Variabler", "Styring", "Funksjoner", "Data", "Grafikk", "Feilsøking"] as const;
type TutorialCategory = (typeof tutorialCategories)[number];

type QuickTutorial = {
  id: string;
  category: Exclude<TutorialCategory, "Alle">;
  title: string;
  question: string;
  intro: string;
  steps: string[];
  example: string;
  notice: string;
  challenge: string;
};

const quickTutorials: QuickTutorial[] = [
  {
    id: "print-mix",
    category: "Utskrift",
    title: "Tekst, variabler og regning i print",
    question: "Hvordan får jeg et forståelig svar med både tekst og matematikk?",
    intro: "Gi print flere deler, skilt med komma. Python regner ut uttrykkene og setter automatisk inn mellomrom mellom delene.",
    steps: [
      "Tekst må stå mellom anførselstegn: \"Til sammen blir det\".",
      "Variabler og regnestykker skal ikke ha anførselstegn. Da bruker Python verdiene og regner.",
      "Et komma skiller delene. Det betyr ikke desimalkomma.",
      "Python regner a + b før hele svaret vises.",
    ],
    example: 'epler = 4\npaerer = 3\n\nprint("Til sammen blir det", epler + paerer, "frukter.")',
    notice: 'Skriver du "epler + paerer" med anførselstegn, vises ordene i stedet for svaret på regnestykket.',
    challenge: "Bytt fruktene og tallene. Kan du også vise hvor mange flere epler enn pærer du har?",
  },
  {
    id: "f-text",
    category: "Utskrift",
    title: "Lag pene setninger med f-tekst",
    question: "Hvordan setter jeg verdier inn midt i en setning?",
    intro: "En f foran anførselstegnet gjør teksten til en mal. Alt i {krøllparenteser} blir byttet ut med en verdi eller et regnestykke.",
    steps: [
      "Skriv bokstaven f rett foran det første anførselstegnet.",
      "Skriv variabelen eller regnestykket inni { og }.",
      "Resten er vanlig tekst og kan skrives akkurat slik svaret skal leses.",
      "Bruk :.2f etter et desimaltall for å vise nøyaktig to desimaler.",
    ],
    example: 'pris = 79.9\nantall = 3\ntotal = pris * antall\n\nprint(f"{antall} varer koster {total:.2f} kr til sammen.")',
    notice: "Glemmer du f-en, vises {total:.2f} som vanlig tekst. Krøllparentesene må også ha både start og slutt.",
    challenge: "Vis også prisen per vare uten desimaler ved å bruke {pris:.0f}.",
  },
  {
    id: "variables-math",
    category: "Variabler",
    title: "Regn med og endre variabler",
    question: "Hvordan lagrer jeg et svar og endrer det senere?",
    intro: "En variabel er en navnelapp på en verdi. Python regner ut høyresiden først og lagrer svaret under navnet til venstre.",
    steps: [
      "total = pris * antall lager først regnestykket og lagrer svaret i total.",
      "total += frakt betyr det samme som total = total + frakt.",
      "total -= rabatt trekker fra rabatt og lagrer det nye svaret i total.",
      "Velg navn som forklarer hva tallet betyr.",
    ],
    example: 'pris = 120\nantall = 2\nfrakt = 49\nrabatt = 30\n\ntotal = pris * antall\ntotal += frakt\ntotal -= rabatt\nprint("Å betale:", total, "kr")',
    notice: "Likhetstegnet betyr her «gi variabelen en verdi». Variabelen må lages før den kan brukes eller endres.",
    challenge: "Legg til mva som et desimaltall, og lagre en ny variabel som heter total_med_mva.",
  },
  {
    id: "input-text",
    category: "Variabler",
    title: "Spør brukeren med input",
    question: "Hvordan lar jeg den som kjører programmet skrive inn en verdi?",
    intro: "input viser et spørsmål og stopper programmet til brukeren har svart. Svaret lagres i en variabel, slik at resten av programmet kan bruke det.",
    steps: [
      "Skriv spørsmålet som tekst inni input(...). En tydelig prompt forteller hva brukeren skal skrive.",
      "Lagre svaret i en variabel: navn = input(\"Hva heter du? \").",
      "input gir alltid tekst, også når brukeren skriver siffer.",
      "Når du kjører koden i Skolepython, åpnes et eget svarvindu. Skriv svaret og trykk Enter.",
    ],
    example: 'navn = input("Hva heter du? ")\nby = input("Hvor bor du? ")\n\nprint("Hei", navn, "fra", by + "!")',
    notice: "Variabelen får det brukeren faktisk skriver. Velg derfor spørsmål som gjør det tydelig om du ønsker navn, tall eller noe annet.",
    challenge: "Spør også om favorittfag, og lag en hel setning som bruker alle tre svarene.",
  },
  {
    id: "input-number",
    category: "Variabler",
    title: "Regn med tall fra input",
    question: "Hvorfor må et tall fra input gjøres om før Python kan regne med det?",
    intro: "Selv om brukeren skriver 14, mottar input teksten \"14\". int gjør heltallsteksten om til tallet 14. Da kan Python legge til, trekke fra og sammenligne.",
    steps: [
      "alder_tekst lagrer først akkurat det brukeren skrev. Datatypen er tekst, altså str.",
      "int(alder_tekst) lager et heltall og lagrer det i alder.",
      "Nå betyr alder + 1 vanlig addisjon. Uten int kan ikke Python legge sammen tekst og tall.",
      "Bruk float i stedet for int når brukeren skal kunne skrive et desimaltall som 3.5.",
    ],
    example: 'alder_tekst = input("Hvor gammel er du? ")\nalder = int(alder_tekst)\n\nom_et_aar = alder + 1\nprint("Neste år er du", om_et_aar, "år.")',
    notice: "Hvis brukeren skriver et ord der int forventer et heltall, får programmet ValueError. Start gjerne med å be tydelig om et heltall.",
    challenge: "Spør om to heltall, gjør begge om med int og vis både summen og produktet.",
  },
  {
    id: "if-choice",
    category: "Styring",
    title: "La programmet velge med if",
    question: "Hvordan kjører jeg kode bare når noe er sant?",
    intro: "Et if-vilkår er et spørsmål som blir sant eller usant. Kolon åpner kodeblokken, og innrykket viser hva som hører til valget.",
    steps: [
      "Bruk == når du sammenligner. Ett = lagrer en verdi.",
      "Avslutt if-, elif- og else-linjer med kolon.",
      "Trykk Tab én gang for koden som skal høre til vilkåret.",
      "elif gir et nytt spørsmål; else brukes når ingen spørsmål var sanne.",
    ],
    example: 'poeng = 8\n\nif poeng >= 10:\n    print("Toppnivå")\nelif poeng >= 5:\n    print("Godt i gang")\nelse:\n    print("Prøv en gang til")',
    notice: "Python ser innrykket som en del av språket. Linjer på samme nivå må starte like langt fra venstre.",
    challenge: "Test poeng 4, 5, 9 og 10. Kan du forklare hvorfor grensene havner i riktig gruppe?",
  },
  {
    id: "for-loop",
    category: "Styring",
    title: "Gjenta kode med en for-løkke",
    question: "Hvordan gjør jeg nesten det samme flere ganger?",
    intro: "En for-løkke gir variabelen én verdi om gangen. range lager tallfølgen løkken skal gå gjennom.",
    steps: [
      "range(1, 6) lager 1, 2, 3, 4 og 5. Stoppverdien 6 er ikke med.",
      "Kolon varsler at en gjentatt kodeblokk kommer.",
      "Koden med innrykk kjøres én gang for hver verdi.",
      "Bruk range(start, stopp, steg) når du vil hoppe med for eksempel 2.",
    ],
    example: 'for tall in range(1, 6):\n    kvadrat = tall ** 2\n    print(tall, "i andre er", kvadrat)',
    notice: "Hvis print-linjen ikke har innrykk, er den ikke en del av løkken. Hvis stoppverdien er 6, stopper Python før 6.",
    challenge: "Lag femgangen. Prøv deretter range(10, 0, -1) og forutsi rekkefølgen.",
  },
  {
    id: "function",
    category: "Funksjoner",
    title: "Lag en funksjon du kan bruke igjen",
    question: "Hvordan gir jeg en liten oppskrift et navn?",
    intro: "def beskriver en funksjon. Parameterne er verdier funksjonen får, og return sender svaret tilbake dit funksjonen ble kalt.",
    steps: [
      "Skriv def, funksjonsnavn, parenteser og kolon.",
      "Parameterne inni parentesen får verdier når funksjonen kalles.",
      "Funksjonskroppen må ha innrykk.",
      "return gir et svar; print bare viser noe på skjermen.",
    ],
    example: 'def areal(lengde, bredde):\n    svar = lengde * bredde\n    return svar\n\nrom = areal(8, 5)\nprint("Arealet er", rom, "m²")',
    notice: "Å definere funksjonen kjører ikke regnestykket. Det skjer først når du skriver for eksempel areal(8, 5).",
    challenge: "Lag en funksjon for omkrets. Hvilke parametere trenger den?",
  },
  {
    id: "lists",
    category: "Data",
    title: "Samle mange verdier i en liste",
    question: "Hvordan lagrer og undersøker jeg flere tall?",
    intro: "En liste er én variabel som kan holde mange verdier i en bestemt rekkefølge. Python teller plassene fra 0, så liste[0] er den første verdien.",
    steps: [
      "Skriv verdiene mellom [hakeparenteser] og skill dem med komma.",
      "Bruk liste[0] for første verdi og liste[-1] for siste verdi.",
      "append legger til bakerst, remove fjerner en bestemt verdi og pop fjerner en plass.",
      "len, sum, min og max undersøker hele listen, mens en for-løkke behandler én verdi om gangen.",
    ],
    example: 'poeng = [4, 7, 9, 6]\npoeng.append(10)\n\nprint("Første:", poeng[0])\nprint("Siste:", poeng[-1])\n\ngjennomsnitt = sum(poeng) / len(poeng)\nprint("Gjennomsnitt:", round(gjennomsnitt, 1))\n\nfor verdi in poeng:\n    print("Poeng:", verdi)',
    notice: "liste[1] er den andre verdien, ikke den første. En indeks som ikke finnes, gir IndexError.",
    challenge: "Skriv bare ut verdier over gjennomsnittet ved å bruke if inni løkken.",
  },
  {
    id: "read-txt-list",
    category: "Data",
    title: "Les en liste fra en tekstfil",
    question: "Hvordan gjør jeg én linje i en .txt-fil om til én verdi i en liste?",
    intro: "Når en tekstfil åpnes i en for-løkke, får Python én linje om gangen. strip fjerner linjeskiftet, og append legger den ferdige verdien inn i listen.",
    steps: [
      "Velg filen med «Legg til .txt eller .csv» ved editoren. Filnavnet i open må være helt likt.",
      "with open(...) åpner filen og lukker den automatisk etter den innrykkede blokken.",
      "linje.strip() fjerner linjeskift og tomrom rundt teksten.",
      "float gjør tekst som \"12.5\" om til tallet 12.5. Uten omgjøring kan ikke sum regne med verdiene.",
    ],
    example: 'temperaturer = []\n\nwith open("temperaturer.txt", encoding="utf-8") as fil:\n    for linje in fil:\n        tekst = linje.strip()\n        if tekst:\n            temperaturer.append(float(tekst))\n\nprint("Temperaturer:", temperaturer)\nprint("Gjennomsnitt:", sum(temperaturer) / len(temperaturer))',
    notice: "open gir tekst. Bruk int for heltall eller float for desimaltall før du regner. Norske desimalkomma kan endres med tekst.replace(\",\", \".\").",
    challenge: "Finn laveste og høyeste temperatur. Hvor mange målinger er høyere enn gjennomsnittet?",
  },
  {
    id: "read-csv-list",
    category: "Data",
    title: "Les rader og kolonner fra CSV",
    question: "Hvordan henter jeg en bestemt kolonne fra en .csv-fil?",
    intro: "En CSV-fil er en enkel tabell lagret som tekst. csv.DictReader bruker overskriftene i første rad som navn, slik at rad[\"temperatur\"] henter riktig kolonne.",
    steps: [
      "Importer csv, som følger med Python.",
      "Åpne filen med newline=\"\" og riktig encoding.",
      "Velg skilletegn: Norske regneark bruker ofte semikolon, så eksemplet har delimiter=\";\".",
      "Hver rad er en ordbok. Gjør talltekst om til float før den legges i en talliste.",
    ],
    example: 'import csv\n\ndager = []\ntemperaturer = []\n\nwith open("maalinger.csv", encoding="utf-8-sig", newline="") as fil:\n    leser = csv.DictReader(fil, delimiter=";")\n    for rad in leser:\n        dager.append(rad["dag"])\n        temperaturer.append(float(rad["temperatur"]))\n\nprint("Dager:", dager)\nprint("Høyest:", max(temperaturer))',
    notice: "Hvis hele raden blir én lang tekst, er skilletegnet trolig feil. Prøv delimiter=\",\" hvis filen bruker komma mellom kolonnene.",
    challenge: "Finn dagen med høyest temperatur ved å bruke max og index, eller les filen med pandas.read_csv.",
  },
  {
    id: "random",
    category: "Data",
    title: "Lag tilfeldige forsøk",
    question: "Hvordan kaster jeg en digital terning?",
    intro: "random er et bibliotek i Python. import gjør verktøyene tilgjengelige, og randint gir et heltall mellom begge grensene.",
    steps: [
      "Importer biblioteket én gang øverst i programmet.",
      "random.randint(1, 6) kan gi 1, 2, 3, 4, 5 eller 6.",
      "En løkke kan gjenta forsøket mange ganger.",
      "Tell resultatene med en variabel som starter på 0.",
    ],
    example: 'import random\n\nantall_seksere = 0\n\nfor forsok in range(20):\n    kast = random.randint(1, 6)\n    if kast == 6:\n        antall_seksere += 1\n\nprint("Antall seksere:", antall_seksere)',
    notice: "Tilfeldige svar kan variere selv om koden er helt lik. Det er ikke nødvendigvis en feil.",
    challenge: "Øk til 1000 kast og regn ut andelen seksere. Hvor nær 1/6 kommer du?",
  },
  {
    id: "graph",
    category: "Grafikk",
    title: "Tegn en enkel graf",
    question: "Hvordan viser jeg x- og y-verdier som en graf?",
    intro: "Matplotlib tegner. x-listen og y-listen må ha like mange verdier, fordi hvert x-tall skal pares med ett y-tall.",
    steps: [
      "Importer pyplot som plt.",
      "Lag x- og y-verdier med samme antall elementer.",
      "plot tegner linjen; xlabel og ylabel gir aksetitler.",
      "grid gir rutenett, og show viser grafen i resultatfeltet.",
    ],
    example: 'import matplotlib.pyplot as plt\n\nx = [0, 1, 2, 3, 4]\ny = [0, 1, 4, 9, 16]\n\nplt.plot(x, y, marker="o")\nplt.xlabel("x")\nplt.ylabel("y")\nplt.title("Kvadrattall")\nplt.grid()\nplt.show()',
    notice: "Hvis x har fem verdier og y har fire, vet ikke Python hvilke punkter som skal kobles sammen.",
    challenge: "Endre y til dobbelt av x. Gi grafen en tittel som forklarer sammenhengen.",
  },
  {
    id: "turtle",
    category: "Grafikk",
    title: "Tegn figurer med Turtle",
    question: "Hvordan styrer jeg en digital penn?",
    intro: "Turtle flytter en penn framover og roterer den. En regulær mangekant bruker samme lengde og samme dreievinkel på hver side.",
    steps: [
      "Importer Turtle-kommandoene.",
      "forward flytter pennen; left og right dreier i grader.",
      "En hel runde er 360°. En femkant dreier derfor 360 / 5 = 72°.",
      "done avslutter og viser tegningen i appen.",
    ],
    example: 'from turtle import *\n\nantall_sider = 5\nlengde = 100\nvinkel = 360 / antall_sider\n\nfor side in range(antall_sider):\n    forward(lengde)\n    left(vinkel)\n\ndone()',
    notice: "Hvis figuren ikke lukker seg, undersøk om dreievinkelen til sammen blir 360 grader.",
    challenge: "Bytt til 3, 6 og 8 sider. Hva må skje med vinkelen når antallet sider øker?",
  },
  {
    id: "comments-imports",
    category: "Feilsøking",
    title: "Kommentarer og import",
    question: "Hvordan forklarer jeg koden, og hvordan henter jeg verktøy?",
    intro: "En kommentar er en beskjed til mennesket som leser. import henter ferdige verktøy Python ikke laster inn automatisk.",
    steps: [
      "En Python-kommentar starter med #. Tegnet // brukes ikke til kommentarer.",
      "Skriv import øverst før verktøyet brukes.",
      "import math gir navn som math.sqrt og math.pi.",
      "Kommentarer kan forklare hvorfor, mens tydelige variabelnavn viser hva.",
    ],
    example: 'import math\n\n# Radius måles i centimeter\nradius = 4\nareal = math.pi * radius ** 2\n\nprint("Areal:", round(areal, 2), "cm²")',
    notice: "ModuleNotFoundError betyr ofte at biblioteket ikke finnes. Sjekk også stavemåten i import-linjen.",
    challenge: "Legg inn en kommentar som forklarer hvorfor radius opphøyes i andre.",
  },
  {
    id: "debug-small",
    category: "Feilsøking",
    title: "Finn små syntaksfeil uten å miste flyten",
    question: "Hva sjekker jeg først når Python stopper?",
    intro: "Les Feildetektivens markerte linje, men se også på linjen rett over. Python peker ofte på stedet der språket ikke lenger kunne forstå koden.",
    steps: [
      "Se etter kolon etter if, elif, else, for, while og def.",
      "Tell anførselstegn og parenteser: Har alle en start og en slutt?",
      "Kontroller at innrykk på samme nivå er likt.",
      "Sjekk om variabelnavnet er skrevet nøyaktig likt som da det ble laget.",
    ],
    example: 'tall = 7\n\nif tall > 5:\n    print("Tallet er større enn 5")',
    notice: "Endre én liten ting av gangen og kjør på nytt. Da vet du hvilken endring som løste problemet.",
    challenge: "Lag med vilje én feil i eksemplet. Kan du bruke Feildetektiven til å finne den igjen?",
  },
  ...mathHelpTutorials,
];

type CurriculumFit = "Direkte" | "God støtte" | "Supplerende";
type CurriculumGrade = "Alle" | "8" | "9" | "10";

type CurriculumGoal = {
  id: string;
  grade: "8" | "9" | "10";
  goal: string;
  fit: CurriculumFit;
  activity: string;
  tools: string[];
  moduleIds: number[];
};

const examGraphTemplate = `import numpy as np
import matplotlib.pyplot as plt

# =====================================================
# DEL 1: ENDRE BARE VERDIENE I DENNE DELEN
# =====================================================

def f(x):
    return 2 * x + 3  # Skriv funksjonsuttrykket etter return

funksjonsnavn = "f(x) = 2x + 3"  # Teksten som forklarer grafen
graf_tittel = "Grafen til f"      # Her skriver du tittelen på grafen
x_aksetittel = "x"                # Her skriver du aksetittelen for x-aksen
y_aksetittel = "f(x)"             # Her skriver du aksetittelen for y-aksen

x_min = -5   # Minste x-verdi som skal vises
x_maks = 5   # Største x-verdi som skal vises
y_min = -8   # Minste y-verdi som skal vises
y_maks = 14  # Største y-verdi som skal vises

x_steg = 1   # Avstand mellom tallene på x-aksen
y_steg = 2   # Avstand mellom tallene på y-aksen

# "auto" fyller plassen automatisk.
# Bruk 1 hvis én x-enhet og én y-enhet skal være like lange på arket.
# Bruk for eksempel 2 hvis én y-enhet skal tegnes dobbelt så lang som én x-enhet.
akseforhold = "auto"

# =====================================================
# DEL 2: DENNE DELEN KAN VANLIGVIS STÅ UENDRET
# =====================================================

x = np.linspace(x_min, x_maks, 500)
y = f(x)  # y-verdiene er funksjonsverdiene f(x)

fig, ax = plt.subplots(figsize=(9, 6))
ax.plot(x, y, color="#d94f3d", linewidth=2.5, label=funksjonsnavn)

ax.set_title(graf_tittel, fontsize=16)
ax.set_xlabel(x_aksetittel, fontsize=13)
ax.set_ylabel(y_aksetittel, fontsize=13)

ax.set_xlim(x_min, x_maks)
ax.set_ylim(y_min, y_maks)
ax.set_xticks(np.arange(x_min, x_maks + x_steg * 0.5, x_steg))
ax.set_yticks(np.arange(y_min, y_maks + y_steg * 0.5, y_steg))
ax.set_aspect(akseforhold, adjustable="box")

ax.axhline(0, color="black", linewidth=1)
ax.axvline(0, color="black", linewidth=1)
ax.grid(True, linestyle="--", alpha=0.5)
ax.legend()

fig.tight_layout()
plt.show()
print("Grafen er klar til kontroll og lagring.")`;

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
    id: "input-alder",
    category: "Kom i gang",
    title: "Spør om navn og alder",
    purpose: "Hent tekst og et heltall fra den som kjører programmet.",
    code: 'navn = input("Hva heter du? ")\nalder = int(input("Hvor gammel er du? "))\n\nprint("Hei", navn)\nprint("Neste år er du", alder + 1, "år.")',
    change: "Bytt spørsmålene og bruk svarene i en ny beregning eller beskjed.",
  },
  {
    id: "input-trekant",
    category: "Kom i gang",
    title: "Bygg en trekantdetektiv",
    purpose: "Spør om tre sider og bruk Pytagoras til å undersøke trekanten.",
    code: 'a = float(input("Skriv første katet: "))\nb = float(input("Skriv andre katet: "))\nc = float(input("Skriv hypotenusen: "))\n\nif a ** 2 + b ** 2 == c ** 2:\n    print("Dette er en rettvinklet trekant.")\nelse:\n    print("Dette er ikke en rettvinklet trekant.")',
    change: "Test først 3, 4 og 5. Prøv deretter 5, 6 og 7.",
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
    id: "les-txt",
    category: "Datafiler",
    title: "Les én verdi per linje fra .txt",
    purpose: "Gjør linjene i en tekstfil om til en liste med tall.",
    code: 'tall = []\n\nwith open("tall.txt", encoding="utf-8") as fil:\n    for linje in fil:\n        tekst = linje.strip()\n        if tekst:\n            tall.append(float(tekst.replace(",", ".")))\n\nprint(tall)',
    change: "Bytt filnavnet til navnet som vises ved editoren. Bruk int i stedet for float hvis alle verdiene er heltall.",
  },
  {
    id: "les-csv",
    category: "Datafiler",
    title: "Les en CSV-tabell",
    purpose: "Hent navngitte kolonner fra en fil med overskrifter.",
    code: 'import csv\n\nwith open("data.csv", encoding="utf-8-sig", newline="") as fil:\n    leser = csv.DictReader(fil, delimiter=";")\n    for rad in leser:\n        print(rad["navn"], rad["verdi"])',
    change: "Bytt filnavn, kolonnenavn og eventuelt skilletegnet ; slik at det passer til filen.",
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
    id: "eksamensgraf",
    category: "Tegning",
    title: "Lag en eksamensklar funksjonsgraf",
    purpose: "Hent en komplett mal med aksetitler, utsnitt, målestokk, rutenett og forklaringer i koden.",
    code: examGraphTemplate,
    change: "Endre først bare verdiene i DEL 1. Resten av grafkoden kan stå uendret.",
  },
  {
    id: "turtle",
    category: "Tegning",
    title: "Tegn et Turtle-kvadrat",
    purpose: "Kombiner en løkke med lengde og vinkel.",
    code: 'from turtle import *\n\nfor side in range(4):\n    forward(120)\n    left(90)\n\ndone()',
    change: "Endre antall sider, lengde og vinkel.",
  },
  {
    id: "snake",
    category: "Spill",
    title: "Start et Snake-spill",
    purpose: "Lag et spillbart Snake-brett med det lokale spill-biblioteket.",
    code: 'from spill import Snake\n\nspill = Snake(bredde=18, hoyde=12, fart=6)\nspill.start()',
    change: "Endre brettstørrelse og fart, eller åpne spillmodulen for flere regler og farger.",
  },
];

const playgroundReferences: PlaygroundReference[] = [
  {
    id: "matematikk-verktoykasse",
    category: "Matematikk",
    level: "Start",
    title: "Velg riktig matematikkverktøy",
    purpose: "Finn den enkleste veien fra et matematisk spørsmål til en passende Python-kommando.",
    commands: [
      { code: "sum / min / max / round", explanation: "Grunnleggende verktøy som virker uten import." },
      { code: "import math", explanation: "Én beregning: kvadratrot, π, trigonometri, logaritmer og kombinatorikk." },
      { code: "import statistics", explanation: "En vanlig talliste: gjennomsnitt, median, typetall, kvartiler og spredning." },
      { code: "import numpy as np", explanation: "Mange tall samtidig: verditabeller, arrays, funksjoner og statistikk." },
      { code: "import pandas as pd", explanation: "Data i rader og kolonner: CSV, filtrering, grupper og tabellstatistikk." },
      { code: "import sympy as sp", explanation: "Eksakt algebra: ligninger, forenkling, utviding og faktorisering." },
      { code: "from scipy import stats", explanation: "Videre statistikk: regresjon og sannsynlighetsfordelinger." },
      { code: "import matplotlib.pyplot as plt", explanation: "Vis resultatene som grafer, punktdiagram, stolper eller histogram." },
    ],
    example: `import math
import statistics

maalinger = [4, 7, 7, 9, 13]

print("Kvadratrot av 81:", math.sqrt(81))
print("Gjennomsnitt:", statistics.mean(maalinger))
print("Median:", statistics.median(maalinger))
print("Typetall:", statistics.multimode(maalinger))`,
    experiments: [
      "Åpne «Hjelp mens du koder», velg Matematikk og finn en oppskrift du ikke har brukt før.",
      "Søk etter «kvartil», «løs ligning» og «punktdiagram» i Kommandobiblioteket.",
      "Løs samme gjennomsnittsoppgave først med sum/len og deretter med statistics.mean. Hvilken kode forklarer hensikten best?",
    ],
    tip: "Et bibliotek erstatter ikke den matematiske tankegangen. Skriv først ned hva tallene betyr og hvilken beregning oppgaven krever.",
  },
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
    id: "tekstfiler",
    category: "Utforske data",
    level: "Grunnmur",
    title: "Tekstfiler: én linje blir én listeverdi",
    purpose: "Hent en ekstern liste fra .txt og gjør tekst om til tall det går an å regne med.",
    commands: [
      { code: 'open("tall.txt", encoding="utf-8")', explanation: "Åpner den valgte filen med riktig navn og norsk tegnsett." },
      { code: "with ... as fil:", explanation: "Holder filen åpen i den innrykkede blokken og lukker den etterpå." },
      { code: "linje.strip()", explanation: "Fjerner linjeskift og tomrom rundt én linje." },
      { code: "float(tekst)", explanation: "Gjør tall som er lest som tekst, om til desimaltall." },
    ],
    example: `temperaturer = []

with open("temperaturer.txt", encoding="utf-8") as fil:
    for linje in fil:
        tekst = linje.strip()
        if tekst:
            temperaturer.append(float(tekst.replace(",", ".")))

print("Målinger:", temperaturer)
print("Antall:", len(temperaturer))
print("Gjennomsnitt:", round(sum(temperaturer) / len(temperaturer), 1))`,
    experiments: [
      "Bruk eksempel-filen temperaturer.txt ved editoren og kjør koden.",
      "Finn min, max og forskjellen mellom høyeste og laveste verdi.",
      "Lag en ny tekstfil med ett navn per linje. Da skal float-linjen fjernes.",
    ],
    tip: "Filen blir værende lokalt på enheten. Filnavnet i open må være helt likt navnet som vises ved editoren.",
  },
  {
    id: "csv-filer",
    category: "Utforske data",
    level: "Utforsk",
    title: "CSV: lister i rader og kolonner",
    purpose: "Les tabeller fra regneark og bygg lister fra kolonnene du trenger.",
    commands: [
      { code: "import csv", explanation: "Henter CSV-verktøyet som følger med Python." },
      { code: "csv.DictReader(fil, delimiter=\";\")", explanation: "Leser hver rad med overskriftene som navn. Semikolon er vanlig i norske CSV-filer." },
      { code: 'rad["temperatur"]', explanation: "Henter verdien i kolonnen temperatur fra én rad." },
      { code: 'pd.read_csv("data.csv", sep=";")', explanation: "Kortere alternativ med pandas når du vil arbeide med en hel tabell." },
    ],
    example: `import csv

dager = []
temperaturer = []

with open("maalinger.csv", encoding="utf-8-sig", newline="") as fil:
    leser = csv.DictReader(fil, delimiter=";")
    for rad in leser:
        dager.append(rad["dag"])
        temperaturer.append(float(rad["temperatur"]))

print("Dager:", dager)
print("Temperaturer:", temperaturer)
print("Varmest dag:", dager[temperaturer.index(max(temperaturer))])`,
    experiments: [
      "Bruk eksempel-filen maalinger.csv ved editoren og se hvordan de to listene bygges.",
      "Skriv ut alle dager med temperatur over 13 grader.",
      "Importer pandas og sammenlign med pd.read_csv(\"maalinger.csv\", sep=\";\").",
    ],
    tip: "Sjekk første linje i filen. Den viser kolonnenavnene, og skilletegnet avslører om du trenger ; eller , som delimiter.",
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
      { code: "tabell.describe()", explanation: "Viser antall, gjennomsnitt, standardavvik, kvartiler og ytterverdier for tallkolonnene." },
      { code: 'tabell[tabell["poeng"] >= 10]', explanation: "Filtrerer og beholder radene som oppfyller vilkåret." },
      { code: 'tabell.groupby("klasse")["poeng"].mean()', explanation: "Finner gjennomsnittet separat for hver gruppe." },
      { code: 'tabell["poeng"].value_counts()', explanation: "Teller hvor mange ganger hver verdi forekommer." },
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
      { code: "plt.scatter(x, y)", explanation: "Tegner et punktdiagram for to variabler." },
      { code: "plt.bar(kategorier, verdier)", explanation: "Tegner et stolpediagram for kategorier." },
      { code: "plt.hist(tall, bins=5)", explanation: "Grupperer tall i intervaller og viser frekvensen." },
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
    id: "eksamensgraf",
    category: "Tegne og vise",
    level: "Utforsk",
    title: "Komplett mal for funksjonsgraf",
    purpose: "Lag en ryddig graf som kan brukes i en matematisk besvarelse ved å endre en samlet innstillingsdel.",
    commands: [
      { code: "def f(x): return ...", explanation: "Definerer selve funksjonsregelen. Potens skrives med **, ikke ^." },
      { code: "ax.set_xlabel / set_ylabel", explanation: "Gir begge aksene tydelige navn og eventuelle enheter." },
      { code: "ax.set_xlim / set_ylim", explanation: "Bestemmer hvilket utsnitt av koordinatsystemet som vises." },
      { code: "ax.set_xticks / set_yticks", explanation: "Bestemmer avstanden mellom tallene og rutenettlinjene." },
      { code: "ax.set_aspect(...) ", explanation: "Bestemmer det visuelle lengdeforholdet mellom én x-enhet og én y-enhet." },
    ],
    example: examGraphTemplate,
    experiments: [
      "Tegn f(x) = -3x + 6 og velg et utsnitt som viser nullpunktet tydelig.",
      "Bytt til f(x) = x ** 2 - 4 og sammenlign akseforhold 'auto' og 1.",
      "Gi aksene navn med enheter, for eksempel Tid (timer) og Pris (kr).",
    ],
    tip: "Python-kommentarer begynner med #. Tegnet // brukes ikke til kommentarer i Python.",
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
    category: "Matematikk",
    level: "Videre",
    title: "Mange tall med NumPy",
    purpose: "Regn på hele tallserier samtidig og finn statistiske mål.",
    commands: [
      { code: "import numpy as np", explanation: "Laster NumPy med kortnavnet np." },
      { code: "np.array([...])", explanation: "Lager en tallserie som NumPy kan regne på." },
      { code: "np.arange(start, stopp, steg)", explanation: "Lager en tallserie med fast steg; stoppverdien er normalt ikke med." },
      { code: "np.linspace(start, stopp, antall)", explanation: "Lager et bestemt antall jevnt fordelte verdier med begge endepunkter." },
      { code: "verdier * 2", explanation: "Ganger alle verdiene med 2 på én gang." },
      { code: "np.mean / median / std", explanation: "Gjennomsnitt, median og standardavvik." },
      { code: "np.sum / min / max", explanation: "Sum og ytterverdier i hele serien." },
      { code: "np.percentile(tall, [25, 50, 75])", explanation: "Finner kvartiler som prosentiler." },
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
    category: "Matematikk",
    level: "Videre",
    title: "Løs og undersøk uttrykk med SymPy",
    purpose: "Arbeid med bokstaver og algebraiske uttrykk i stedet for bare desimaltall.",
    commands: [
      { code: "import sympy as sp", explanation: "Laster SymPy med kortnavnet sp." },
      { code: 'x = sp.symbols("x")', explanation: "Gjør x til et matematisk symbol." },
      { code: "sp.expand(...) ", explanation: "Ganger ut parenteser." },
      { code: "sp.factor(...) ", explanation: "Faktoriserer et algebraisk uttrykk." },
      { code: "sp.simplify(...) ", explanation: "Prøver å skrive uttrykket på en enklere, men likeverdig form." },
      { code: "sp.solve(ligning, x)", explanation: "Løser en ligning med hensyn på x." },
      { code: "sp.Eq(venstre, høyre)", explanation: "Lager en ligning med venstre og høyre side." },
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
  {
    id: "mattebibliotek",
    category: "Matematikk",
    level: "Utforsk",
    title: "math, statistics og brøker",
    purpose: "Bruk nyttige verktøy som allerede følger med Python – uten å installere noe.",
    commands: [
      { code: "import math", explanation: "Kvadratrøtter, pi, trigonometri og andre matematiske funksjoner." },
      { code: "import statistics", explanation: "Gjennomsnitt, median, typetall og spredning for vanlige lister." },
      { code: "from fractions import Fraction", explanation: "Regner med eksakte brøker i stedet for avrundede desimaltall." },
      { code: "from decimal import Decimal", explanation: "Gir kontrollert desimalregning, blant annet for penger." },
      { code: "math.sqrt / math.hypot / math.pi", explanation: "Kvadratrot, Pytagoras og sirkelberegninger." },
      { code: "math.sin / cos / tan", explanation: "Trigonometri; gjør grader om med math.radians først." },
      { code: "math.gcd / math.lcm", explanation: "Største felles divisor og minste felles multiplum." },
      { code: "statistics.mean / median / multimode", explanation: "Gjennomsnitt, median og alle typetall." },
      { code: "statistics.quantiles(..., n=4)", explanation: "Finner kvartilgrensene i et datasett." },
      { code: "statistics.pstdev / stdev", explanation: "Standardavvik for hele gruppen eller et utvalg." },
    ],
    example: `import math\nimport statistics\nfrom fractions import Fraction\n\nverdier = [4, 7, 7, 9, 13]\n\nprint("Kvadratrot av 81:", math.sqrt(81))\nprint("Median:", statistics.median(verdier))\nprint("Gjennomsnitt:", statistics.mean(verdier))\nprint("Eksakt sum:", Fraction(1, 3) + Fraction(1, 6))`,
    experiments: [
      "Legg til en svært stor verdi og sammenlign gjennomsnitt og median.",
      "Regn ut 2/5 + 3/10 med Fraction.",
      "Bruk math.pi til å finne omkrets og areal av en sirkel.",
    ],
    tip: "Disse er del av standardbiblioteket. De virker derfor også offline uten at pakken blir større.",
  },
  {
    id: "scipy",
    category: "Matematikk",
    level: "Videre",
    title: "SciPy: statistikk og matematiske verktøy",
    purpose: "Gå videre fra enkle beregninger til regresjon, sannsynlighetsfordelinger og numeriske metoder.",
    commands: [
      { code: "from scipy import stats", explanation: "Henter statistikkverktøyene." },
      { code: "stats.linregress(x, y)", explanation: "Finner en lineær modell og mål på hvor godt den passer." },
      { code: "stats.binom.pmf(...) ", explanation: "Beregner sannsynlighet i en binomisk modell." },
      { code: "stats.binom.cdf(...) ", explanation: "Beregner samlet sannsynlighet opp til og med en verdi." },
      { code: "from scipy.optimize import root_scalar", explanation: "Finner en tilnærmet løsning av en ligning." },
      { code: "root_scalar(f, bracket=[a, b]).root", explanation: "Gir et numerisk nullpunkt når funksjonen skifter fortegn i intervallet." },
    ],
    example: `from scipy import stats\n\nx = [1, 2, 3, 4, 5]\ny = [3, 5, 8, 9, 12]\n\nmodell = stats.linregress(x, y)\nprint("Stigningstall:", round(modell.slope, 2))\nprint("Konstantledd:", round(modell.intercept, 2))\nprint("Forklaringsstyrke:", round(modell.rvalue ** 2, 3))`,
    experiments: [
      "Endre én y-verdi og se hvordan modellen påvirkes.",
      "Bruk modellen til å beregne en forventet y-verdi når x er 8.",
      "Sammenlign SciPy-resultatet med en graf i Matplotlib.",
    ],
  },
  {
    id: "maskinlaering",
    category: "Utforske data",
    level: "Videre",
    title: "scikit-learn: la data lage en modell",
    purpose: "Se grunnideen i maskinlæring gjennom en enkel lineær modell dere kan undersøke kritisk.",
    commands: [
      { code: "from sklearn.linear_model import LinearRegression", explanation: "Henter en modell for lineære sammenhenger." },
      { code: "modell.fit(x, y)", explanation: "Tilpasser modellen til eksemplene." },
      { code: "modell.predict(...) ", explanation: "Bruker modellen til å lage et anslag." },
      { code: "modell.score(x, y)", explanation: "Måler hvor mye av variasjonen modellen forklarer." },
    ],
    example: `import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\ntimer = np.array([[1], [2], [3], [4], [5]])\npoeng = np.array([3, 5, 8, 9, 12])\n\nmodell = LinearRegression()\nmodell.fit(timer, poeng)\n\nprint("Anslag for 6 timer:", round(modell.predict([[6]])[0], 1))\nprint("Stigningstall:", round(modell.coef_[0], 2))`,
    experiments: [
      "Endre datasettet og sammenlign anslaget.",
      "Lag et datapunkt som ligger langt fra de andre. Hva skjer?",
      "Diskuter hvorfor en modell ikke beviser at den ene variabelen forårsaker den andre.",
    ],
    tip: "Dette er et videre-verktøy. Den viktigste kompetansen er å forstå dataene og vurdere modellens gyldighet.",
  },
  {
    id: "pillow",
    category: "Tegne og vise",
    level: "Utforsk",
    title: "Pillow: lag bilder med kode",
    purpose: "Tegn former, mønstre og pikselbilder og vis resultatet i appen.",
    commands: [
      { code: "from PIL import Image, ImageDraw", explanation: "Henter verktøy for bilder og tegning." },
      { code: "Image.new(...) ", explanation: "Lager et tomt bilde med bestemt størrelse og bakgrunn." },
      { code: "ImageDraw.Draw(bilde)", explanation: "Lager en tegneflate knyttet til bildet." },
      { code: "draw.rectangle / ellipse / line", explanation: "Tegner geometriske elementer med koordinater." },
    ],
    example: `from PIL import Image, ImageDraw\nimport matplotlib.pyplot as plt\n\nbilde = Image.new("RGB", (600, 400), "#fffdf8")\ntegn = ImageDraw.Draw(bilde)\n\nfor x in range(50, 550, 50):\n    tegn.ellipse((x - 20, 180, x + 20, 220), fill="#f06f51")\n\nplt.imshow(bilde)\nplt.axis("off")\nplt.show()`,
    experiments: [
      "Endre sirklene til rektangler.",
      "Bruk en løkke til et rutenett eller en fargegradient.",
      "Kombiner symmetri, koordinater og tilfeldige farger.",
    ],
  },
  {
    id: "networkx",
    category: "Tegne og vise",
    level: "Videre",
    title: "NetworkX: nettverk og forbindelser",
    purpose: "Utforsk ruter, forbindelser og grafer – fra veinett til sosiale nettverk.",
    commands: [
      { code: "import networkx as nx", explanation: "Henter biblioteket for matematiske grafer og nettverk." },
      { code: "graf.add_edge(a, b)", explanation: "Lager en forbindelse mellom to punkter." },
      { code: "nx.shortest_path(...) ", explanation: "Finner en korteste rute i nettverket." },
      { code: "nx.draw(graf)", explanation: "Tegner nettverket med Matplotlib." },
    ],
    example: `import networkx as nx\nimport matplotlib.pyplot as plt\n\ngraf = nx.Graph()\ngraf.add_edges_from([\n    ("Skole", "Bibliotek"),\n    ("Skole", "Idrettshall"),\n    ("Bibliotek", "Sentrum"),\n    ("Idrettshall", "Sentrum"),\n])\n\nprint("Korteste rute:", nx.shortest_path(graf, "Skole", "Sentrum"))\nnx.draw(graf, with_labels=True, node_color="#f4c95d", node_size=1800)\nplt.show()`,
    experiments: [
      "Legg til flere steder og forbindelser.",
      "Gi forbindelser avstander og finn korteste vei med vekt.",
      "Finn punktet som har flest forbindelser.",
    ],
  },
  {
    id: "shapely",
    category: "Tegne og vise",
    level: "Videre",
    title: "Shapely: analyser geometriske figurer",
    purpose: "Arbeid presist med areal, omkrets, avstand, overlapp og soner rundt figurer.",
    commands: [
      { code: "from shapely.geometry import Polygon", explanation: "Lager en mangekant fra koordinater." },
      { code: "figur.area / figur.length", explanation: "Finner areal og omkrets." },
      { code: "figur.buffer(avstand)", explanation: "Lager en sone rundt eller innenfor figuren." },
      { code: "a.intersection(b)", explanation: "Finner området der to figurer overlapper." },
    ],
    example: `from shapely.geometry import Polygon\nimport matplotlib.pyplot as plt\n\nfigur = Polygon([(0, 0), (6, 0), (5, 4), (1, 5)])\nsone = figur.buffer(0.7)\n\nprint("Areal:", figur.area)\nprint("Omkrets:", round(figur.length, 2))\n\nx, y = sone.exterior.xy\nplt.fill(x, y, color="#d9e8df")\nx, y = figur.exterior.xy\nplt.plot(x, y, color="#2f6b5f", linewidth=3)\nplt.axis("equal")\nplt.grid()\nplt.show()`,
    experiments: [
      "Flytt ett hjørne og sammenlign areal og omkrets.",
      "Prøv negativ buffer for å lage en sone innenfor figuren.",
      "Lag to figurer og finn arealet av overlappen.",
    ],
  },
  {
    id: "spill-snake",
    category: "Spill",
    level: "Utforsk",
    title: "Snake med det lokale spill-biblioteket",
    purpose: "Start et ekte, lokalt spill og lær hvordan koordinater, lister, vilkår og en spill-løkke henger sammen.",
    commands: [
      { code: "from spill import Snake", explanation: "Henter den innebygde spillmotoren." },
      { code: "Snake(bredde=..., hoyde=...)", explanation: "Bestemmer størrelsen på rutenettet." },
      { code: "fart=6", explanation: "Bestemmer omtrent hvor mange trekk som skjer per sekund." },
      { code: "spill.start()", explanation: "Viser spillet i resultatpanelet." },
    ],
    example: `from spill import Snake\n\nspill = Snake(\n    bredde=18,\n    hoyde=12,\n    fart=6,\n    slangefarge="#62b88b",\n    matfarge="#f06f51",\n    gjennom_vegg=False,\n    tittel="Mitt Snake-spill",\n)\n\nspill.start()`,
    experiments: [
      "Sammenlign fart 3, 6 og 10.",
      "Endre gjennom_vegg fra False til True.",
      "Velg egne farger og lag en tydelig spillidé.",
    ],
    tip: "Åpne Modul 8 for en trinnvis forklaring av hvordan Snake-reglene kan programmeres fra bunnen.",
  },
];

const curriculumSources = {
  "8": "https://www.udir.no/lk20/mat01-06/kompetansemaal-og-vurdering/kv1027?lang=nob",
  "9": "https://www.udir.no/lk20/mat01-06/kompetansemaal-og-vurdering/kv1028?lang=nob",
  "10": "https://www.udir.no/lk20/mat01-06/kompetansemaal-og-vurdering/kv1029?lang=nob",
} as const;

const curriculumGoals: CurriculumGoal[] = [
  {
    id: "8-potenser",
    grade: "8",
    goal: "regne med potenser og kvadratrøtter og forklare framgangsmåter og resultater",
    fit: "God støtte",
    activity: "Sammenlign gjentatt multiplikasjon med **, lag en tabell med kvadrattall og kontroller kvadratrøtter med math.sqrt.",
    tools: ["**", "math.sqrt", "løkker", "tabeller"],
    moduleIds: [1, 3],
  },
  {
    id: "8-regneegenskaper",
    grade: "8",
    goal: "bruke kommutative, assosiative og distributive egenskaper til å utvikle og kommunisere strategier for hoderegning og skriftlig regning",
    fit: "Supplerende",
    activity: "La Python kontrollere flere omskrivinger, og forklar hvorfor uttrykkene gir samme svar for ulike verdier.",
    tools: ["variabler", "uttrykk", "print", "SymPy"],
    moduleIds: [1],
  },
  {
    id: "8-faktorisering",
    grade: "8",
    goal: "beskrive og utforske faktorisering og primtallsfaktorisering og bruke det i brøkregning",
    fit: "God støtte",
    activity: "Test divisorer med %, bygg en primtallsalgoritme og bruk SymPy til å kontrollere faktoriseringen.",
    tools: ["%", "if", "løkker", "SymPy"],
    moduleIds: [2, 3],
  },
  {
    id: "8-monstre",
    grade: "8",
    goal: "utforske og generalisere geometriske mønstre og tallmønstre med egne ord og algebraisk",
    fit: "Direkte",
    activity: "Lag tallfølger med løkker og geometriske mønstre med Turtle. Endre regelen og beskriv hva som alltid skjer.",
    tools: ["range", "løkker", "Turtle", "variabler"],
    moduleIds: [3, 7],
  },
  {
    id: "8-uttrykk",
    grade: "8",
    goal: "lage og forklare regneuttrykk med tall, variabler og konstanter knyttet til praktiske situasjoner",
    fit: "Direkte",
    activity: "Oversett pris, rabatt, lengde eller fart til navngitte variabler og forklar uttrykket linje for linje.",
    tools: ["variabler", "regneoperatorer", "f-tekst"],
    moduleIds: [1],
  },
  {
    id: "8-ligninger",
    grade: "8",
    goal: "lage og løse ligninger knyttet til praktiske situasjoner og kritisk vurdere løsninger",
    fit: "God støtte",
    activity: "Søk etter løsninger med en løkke, eller bruk SymPy. Sett svaret tilbake i situasjonen og vurder om det er rimelig.",
    tools: ["løkker", "if", "SymPy", "kontrollregning"],
    moduleIds: [1, 2, 3],
  },
  {
    id: "8-ulikheter",
    grade: "8",
    goal: "bruke ulike strategier for å løse ulikheter og vurdere om løsninger er gyldige",
    fit: "God støtte",
    activity: "Bruk sammenligninger og if til å teste hvilke verdier som oppfyller en ulikhet, og vis løsningene i en tabell.",
    tools: ["< og >", "if/else", "range", "tabeller"],
    moduleIds: [2, 3],
  },
  {
    id: "8-funksjoner",
    grade: "8",
    goal: "beskrive, sammenligne og utforske funksjoner knyttet til praktiske situasjoner",
    fit: "Direkte",
    activity: "Skriv funksjoner for to praktiske modeller, endre parameterne og sammenlign tabeller og grafer.",
    tools: ["def", "return", "Matplotlib", "tabeller"],
    moduleIds: [4, 6, 9],
  },
  {
    id: "8-representasjoner",
    grade: "8",
    goal: "bruke situasjoner, tabeller, grafer og uttrykk til å representere funksjoner og vise sammenhenger mellom representasjonene",
    fit: "Direkte",
    activity: "La samme funksjon vises som tekstsituasjon, uttrykk, verditabell og graf. Pek ut hvor samme informasjon finnes i alle fire.",
    tools: ["funksjoner", "Pandas", "Matplotlib", "lister", "uttrykk"],
    moduleIds: [4, 6, 9, 10],
  },
  {
    id: "8-algoritmer",
    grade: "8",
    goal: "utforske hvordan algoritmer kan skapes, testes og forbedres ved hjelp av programmering",
    fit: "Direkte",
    activity: "Lag en første løsning, test den med ulike verdier, finn en svakhet og forbedre algoritmen i små steg.",
    tools: ["if/else", "løkker", "funksjoner", "Turtle"],
    moduleIds: [2, 3, 4, 7, 8],
  },
  {
    id: "9-maleenheter",
    grade: "9",
    goal: "lage og løse problemer som handler om sammensatte måleenheter",
    fit: "God støtte",
    activity: "Lag omregningsfunksjoner for km/t og m/s, pris per kilogram eller energiforbruk per time.",
    tools: ["variabler", "funksjoner", "enhetstekst"],
    moduleIds: [1, 4],
  },
  {
    id: "9-figurer",
    grade: "9",
    goal: "utforske egenskapene ved ulike todimensjonale figurer og forklare begrepene formlikhet og kongruens",
    fit: "Direkte",
    activity: "Tegn figurer med Turtle, kopier dem med samme eller endret målestokk og sammenlign sider og vinkler.",
    tools: ["Turtle", "løkker", "målestokk", "vinkler"],
    moduleIds: [7],
  },
  {
    id: "9-pytagoras",
    grade: "9",
    goal: "bruke formlikhet og Pytagoras’ læresetning til utforsking av praktiske situasjoner",
    fit: "Direkte",
    activity: "Beregn den ukjente siden, tegn trekanten i riktig målestokk og kontroller avstanden mellom koordinatene.",
    tools: ["Turtle", "math.sqrt", "koordinater", "funksjoner"],
    moduleIds: [4, 7],
  },
  {
    id: "9-trekanter",
    grade: "9",
    goal: "utforske, beskrive og argumentere for sammenhenger mellom sidelengdene i trekanter",
    fit: "Direkte",
    activity: "Test trekantulikheten for mange sidelengder, og tegn bare kombinasjonene som faktisk kan danne en trekant.",
    tools: ["if/else", "løkker", "Turtle"],
    moduleIds: [2, 3, 7],
  },
  {
    id: "9-forutsetninger",
    grade: "9",
    goal: "utforske og argumentere for hvordan det å endre forutsetninger i geometriske problemstillinger påvirker løsninger både praktisk og algebraisk",
    fit: "Direkte",
    activity: "Gjør sidelengde, antall sider og vinkel til variabler. Endre én verdi om gangen og forklar virkningen på figuren.",
    tools: ["Turtle", "variabler", "løkker", "SVG"],
    moduleIds: [1, 7],
  },
  {
    id: "9-overflate-volum",
    grade: "9",
    goal: "bruke og argumentere for formler for overflateareal og volum av tredimensjonale figurer",
    fit: "God støtte",
    activity: "Lag funksjoner for overflate og volum, sammenlign figurer i en tabell og undersøk hvordan dobling av mål påvirker resultatet.",
    tools: ["funksjoner", "potenser", "tabeller"],
    moduleIds: [1, 4],
  },
  {
    id: "9-statistikk-kritikk",
    grade: "9",
    goal: "tolke og kritisk vurdere statistiske framstillinger fra media og lokalsamfunnet",
    fit: "God støtte",
    activity: "Gjenskap en graf med Matplotlib, endre aksestart og skala og diskuter hvordan inntrykket forandres.",
    tools: ["Matplotlib", "Pandas", "CSV", "akser", "datasett"],
    moduleIds: [4, 9, 10],
  },
  {
    id: "9-sentral-spredning",
    grade: "9",
    goal: "regne på sentralmål og spredningsmål i egne og reelle datasett og bruke resultatene til å beskrive dataene",
    fit: "Direkte",
    activity: "Importer data fra .txt eller .csv og beregn gjennomsnitt, median, variasjonsbredde og standardavvik.",
    tools: ["NumPy", "Pandas", "lister", "CSV", "tabeller"],
    moduleIds: [4, 10],
  },
  {
    id: "9-framstillinger",
    grade: "9",
    goal: "sammenligne og argumentere for hvordan framstillinger av tall og data kan brukes for å fremme ulike synspunkter",
    fit: "Direkte",
    activity: "Lag to korrekte grafer av samme datasett med ulike utsnitt, diagramtyper eller skalaer og vurder budskapet.",
    tools: ["Matplotlib", "Pandas", "CSV", "grafer", "akser"],
    moduleIds: [4, 9, 10],
  },
  {
    id: "9-sannsynlighet",
    grade: "9",
    goal: "beregne og vurdere sannsynlighet i statistikk og spill",
    fit: "Direkte",
    activity: "Beregn teoretisk sannsynlighet, simuler spillet og vurder om regelen er rettferdig.",
    tools: ["random", "tellere", "andeler", "if"],
    moduleIds: [2, 5],
  },
  {
    id: "9-simulering",
    grade: "9",
    goal: "simulere utfall i tilfeldige forsøk og beregne sannsynligheten for at noe skal inntreffe, ved å bruke programmering",
    fit: "Direkte",
    activity: "Gjenta et tilfeldig forsøk mange ganger, tell ønskede utfall og sammenlign relativ frekvens med teoretisk sannsynlighet.",
    tools: ["random", "for-løkke", "if", "tellere"],
    moduleIds: [5],
  },
  {
    id: "10-regneregler",
    grade: "10",
    goal: "bruke regneregler og generalisere sammenhenger algebraisk",
    fit: "God støtte",
    activity: "Test en påstand for mange tall, beskriv mønsteret og bruk SymPy til å vise den algebraiske sammenhengen.",
    tools: ["løkker", "SymPy", "variabler", "uttrykk"],
    moduleIds: [1, 3, 4],
  },
  {
    id: "10-kvadratsetninger",
    grade: "10",
    goal: "utforske kvadratsetningene geometrisk og algebraisk og bruke kvadratsetningene som regnestrategier",
    fit: "Direkte",
    activity: "Tegn arealdelene med Turtle og sammenlign den geometriske modellen med et uttrykk som utvides i SymPy.",
    tools: ["Turtle", "areal", "SymPy", "farger"],
    moduleIds: [4, 7],
  },
  {
    id: "10-ligningssett",
    grade: "10",
    goal: "lage, løse og forklare ligningssett knyttet til praktiske situasjoner",
    fit: "God støtte",
    activity: "Modeller en praktisk situasjon med to funksjoner, finn skjæringspunktet grafisk og kontroller med SymPy.",
    tools: ["funksjoner", "Matplotlib", "SymPy", "grafer"],
    moduleIds: [4, 6, 9],
  },
  {
    id: "10-funksjonstyper",
    grade: "10",
    goal: "utforske og sammenligne egenskaper ved lineære funksjoner, eksponentialfunksjoner, brøkfunksjoner og andregradsfunksjoner ved å bruke digitale verktøy",
    fit: "Direkte",
    activity: "Tegn flere funksjonstyper i samme koordinatsystem og undersøk nullpunkter, vekst, asymptoter og parameterendringer.",
    tools: ["NumPy", "Matplotlib", "funksjoner", "grafer"],
    moduleIds: [4, 6, 9],
  },
  {
    id: "10-stigningstall",
    grade: "10",
    goal: "forklare begrepet endring per enhet og regne ut stigningstallet til lineære funksjoner",
    fit: "Direkte",
    activity: "Beregn endring i y delt på endring i x, tegn linjen og koble stigningstallet til den praktiske situasjonen.",
    tools: ["funksjoner", "tabeller", "Matplotlib", "variabler"],
    moduleIds: [1, 4, 9],
  },
  {
    id: "10-prosentvekst",
    grade: "10",
    goal: "utforske og forklare sammenhengen mellom konstant prosentvis endring, vekstfaktor og eksponentialfunksjoner",
    fit: "Direkte",
    activity: "Sammenlign prosentvis endring periode for periode med potensmodellen, og vis utviklingen som tabell og graf.",
    tools: ["vekstfaktor", "**", "løkker", "Matplotlib"],
    moduleIds: [1, 4, 6, 9],
  },
  {
    id: "10-okonomi-konsekvenser",
    grade: "10",
    goal: "hente ut og tolke relevant informasjon og reflektere over mulige konsekvenser ved kjøp og salg, renter på sparing, lån og kredittkjøp",
    fit: "Direkte",
    activity: "Lag sammenlignbare modeller for sparing, lån og kreditt. Vis total kostnad og undersøk virkningen av rente og tid.",
    tools: ["variabler", "vekstfaktor", "tabeller", "grafer"],
    moduleIds: [1, 6, 9],
  },
  {
    id: "10-okonomi-arbeid",
    grade: "10",
    goal: "planlegge, utføre og presentere et utforskende arbeid knyttet til personlig økonomi",
    fit: "Direkte",
    activity: "Formuler et økonomisk spørsmål, samle forutsetninger, programmer en modell og presenter funn og begrensninger.",
    tools: ["Pandas", "Matplotlib", "modeller", "f-tekst"],
    moduleIds: [1, 6, 9],
  },
  {
    id: "10-modellering",
    grade: "10",
    goal: "modellere situasjoner, presentere resultatene og vurdere hvor gyldige modellene er",
    fit: "Direkte",
    activity: "Gjør antakelser om til variabler, beregn eller simuler utviklingen, presenter resultatet og test modellens grenser.",
    tools: ["funksjoner", "tabeller", "grafer", "simulering"],
    moduleIds: [4, 5, 6, 9],
  },
  {
    id: "10-programmering",
    grade: "10",
    goal: "utforske matematiske egenskaper og sammenhenger ved å bruke programmering",
    fit: "Direkte",
    activity: "Still et matematisk spørsmål, lag kode som produserer eksempler, og bruk mønsteret til å formulere og begrunne en sammenheng.",
    tools: ["løkker", "funksjoner", "Turtle", "grafer"],
    moduleIds: [3, 4, 5, 7, 8, 9],
  },
  {
    id: "10-pythonkode",
    grade: "10",
    goal: "lese og forklare tekstbasert programkode i Python",
    fit: "Direkte",
    activity: "Følg variabelverdier linje for linje, forutsi resultatet, forklar matematikken og foreslå en begrunnet endring.",
    tools: ["variabler", "if/else", "løkker", "funksjoner"],
    moduleIds: [1, 2, 3, 4, 8, 9],
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
        body: "Når Python leser pris = 800, lagres tallet 800 under navnet pris. Tenk på variabelen som en navnelapp vi kan bruke i resten av programmet. Her betyr likhetstegnet «gi variabelen en verdi» – ikke «regn ut begge sider» slik det ofte gjør i en matematisk ligning.",
        code: "pris = 800",
        steps: ["Python regner eller leser høyresiden først: 800.", "Deretter lagres verdien under navnet på venstre side: pris.", "Når pris brukes senere, henter Python fram 800.", "Les derfor linjen fra høyre: «pris får verdien 800»."],
        reflection: "Hvis neste linje er pris = 950, hvilken verdi ligger da i pris – 800 eller 950?",
        why: "En variabel gjør at vi kan bruke et meningsfullt navn i stedet for å skrive tallet på nytt overalt. Endrer vi startverdien ett sted, bruker resten av programmet den nye verdien.",
      },
      {
        title: "Et uttrykk blir regnet ut",
        body: "Rabatt betyr at en del av den opprinnelige prisen skal trekkes bort. Hele prisen er 100 %, og som desimaltall er 100 % det samme som 1. Rabatten 25 % skrives 0.25 i Python. Derfor er delen vi fortsatt skal betale 1 − 0.25 = 0.75, altså 75 % av den gamle prisen.",
        code: "ny_pris = pris * (1 - rabatt)",
        steps: ["1 står for hele den gamle prisen: 100 %.", "rabatt er 0.25, som betyr 25 av 100, altså 25 %.", "Parentesen blir 1 − 0.25 = 0.75. Vi skal derfor beholde 75 %.", "Python regner 800 · 0.75 = 600 og lagrer svaret i ny_pris."],
        reflection: "Hvorfor ville pris * rabatt gitt et annet svar? Hva ville 800 · 0.25 egentlig fortalt oss?",
        why: "Vi ganger med 0.75 fordi 0.75 er delen av prisen som er igjen etter rabatten. Uttrykket pris * rabatt finner bare rabattbeløpet, mens pris * (1 - rabatt) finner det kunden faktisk skal betale.",
      },
      {
        title: "print viser resultatet",
        body: "En beregning kan være riktig selv om vi ikke ser den. print(...) ber Python vise en verdi i resultatfeltet, slik at vi kan kontrollere hva programmet faktisk regnet ut.",
        code: "print(ny_pris)",
        steps: ["Python henter verdien som nå ligger i ny_pris.", "print viser verdien, men endrer den ikke.", "Sammenlign 600.0 med overslaget: 25 % rabatt bør gi en pris som er lavere enn 800."],
        reflection: "Hva tror du vises hvis du skriver print(rabatt) i stedet? Forutsi før du prøver.",
        why: "Utskrift er et kontrollverktøy. Når vi viser mellomresultater, blir det lettere å finne hvilken linje som eventuelt gir feil.",
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
        {
          label: "Gjør programmet levende",
          title: "La brukeren gi variablene verdi",
          body: "input stopper programmet og viser spørsmålet. Svaret er først tekst. Derfor bruker vi int når teksten skal bli et heltall vi kan regne med.",
          code: 'navn = input("Hva heter du? ")\nalder_tekst = input("Hvor gammel er du? ")\nalder = int(alder_tekst)\n\nprint("Hei", navn)\nprint("Neste år er du", alder + 1, "år.")',
          tryThis: "Lag et program som spør om to tall og skriver «Summen er ...». Hvilke to svar må gjøres om med int?",
          upgrade: {
            title: "Kortere når du forstår rekkefølgen",
            body: "input kan ligge rett inni int. Python gjør fortsatt én ting om gangen: spør først, gjør svaret om til heltall og lagrer tallet til slutt.",
            code: 'alder = int(input("Hvor gammel er du? "))\nprint("Om fem år er du", alder + 5, "år.")',
          },
        },
      ],
    },
    starterCode: `pris = 800\nrabatt = 0.25\nny_pris = pris * (1 - rabatt)\nprint(ny_pris)`,
    typingSteps: [
      { kind: "write", code: "pris = 800", explanation: "Variabelen pris får startverdien 800.", think: "Hva er navnet på variabelen, og hva er verdien som lagres?", breakdown: ["Høyresiden 800 leses først.", "Tallet lagres under navnet pris."], why: "Senere kan vi skrive pris i stedet for å gjenta tallet 800." },
      { kind: "write", code: "rabatt = 0.25", explanation: "Python bruker punktum i desimaltall. 0.25 betyr 25 hundredeler, altså 25 %.", think: "Hvorfor skriver vi 0.25 og ikke 25 når rabatten er 25 %?", breakdown: ["Prosent betyr «av hundre».", "25 % = 25 / 100 = 0.25."], why: "Når prosenten er skrevet som desimaltall, kan den brukes direkte i multiplikasjon." },
      { kind: "write", code: "ny_pris = pris * (1 - rabatt)", explanation: "Uttrykket finner den delen av prisen som er igjen etter rabatten.", think: "Hvis 1 er hele prisen, hvor stor del er igjen når 0.25 trekkes bort?", breakdown: ["1 betyr 100 % av den gamle prisen.", "1 − 0.25 = 0.75.", "0.75 er det samme som 75 %.", "800 · 0.75 = 600."], why: "Vi ganger med 0.75 fordi kunden skal betale de 75 prosentene som er igjen – ikke de 25 prosentene som trekkes fra." },
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
        body: "Uttrykket rest == 0 er et spørsmål: «Har rest verdien 0?» To likhetstegn sammenligner verdier. Ett likhetstegn ville i stedet forsøkt å gi en variabel en verdi.",
        code: "rest == 0",
        steps: ["Finn først verdien som er lagret i rest.", "Sammenlign denne verdien med 0.", "Hvis de er like, blir svaret True (sant). Hvis ikke, blir svaret False (usant)."],
        reflection: "Hvis rest er 1, blir rest == 0 sant eller usant? Hvilken programvei tror du velges?",
        why: "if trenger et spørsmål som kan besvares sant eller usant. Sammenligningen gir nettopp et slikt svar og lar programmet velge vei.",
      },
      {
        title: "% finner divisjonsresten",
        body: "% betyr ikke prosent i denne koden. Det er modulo-operatoren, som finner resten etter en heltallsdivisjon. 18 kan deles i ni hele grupper på 2 uten noe til overs, mens 17 gir åtte hele grupper og 1 til overs.",
        code: "rest = tall % 2",
        steps: ["18 ÷ 2 = 9 med rest 0, derfor blir 18 % 2 lik 0.", "17 ÷ 2 = 8 med rest 1, derfor blir 17 % 2 lik 1.", "Alle partall kan deles på 2 uten rest. Derfor kan rest 0 brukes som kjennetegn på partall."],
        reflection: "Hva tror du 21 % 2 og 21 % 3 blir? Regn ut før du prøver i Python.",
        why: "Vi gjør regelen «partall kan deles på 2» om til et presist spørsmål Python kan undersøke: Er divisjonsresten lik 0?",
      },
      {
        title: "Innrykk viser hva som hører sammen",
        body: "Linjene under if og else må rykkes inn. Innrykket fungerer som en synlig ramme rundt koden som hører til hver vei. Det er derfor en del av Python-språket, ikke bare pynt.",
        code: 'if rest == 0:\n    print("partall")',
        steps: ["Python undersøker vilkåret etter if.", "Er vilkåret sant, kjøres den innrykkede print-linjen under if.", "Er vilkåret usant, hopper Python over den linjen og går til else.", "Bare én av de to innrykkede grenene kjøres."],
        reflection: "Hva ville skjedd dersom den første print-linjen ikke hadde innrykk? Ville den fortsatt bare høre til if?",
        why: "Kolon varsler at en blokk kommer, og innrykket viser nøyaktig hvilke linjer blokken inneholder. Dermed vet Python hvor hver programvei starter og slutter.",
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
      { kind: "write", code: "rest = tall % 2", explanation: "% finner resten etter divisjon med 2.", think: "Kan 18 deles i hele grupper på 2 uten at noe blir til overs?", breakdown: ["18 ÷ 2 = 9 med rest 0.", "Derfor lagres 0 i variabelen rest."], why: "Partall gir alltid rest 0 ved divisjon med 2. Oddetall gir rest 1." },
      { kind: "write", code: "if rest == 0:", explanation: "Python spør om verdien i rest er lik 0. Kolon varsler at en innrykket kodeblokk kommer.", think: "Hva blir svaret på spørsmålet når rest er 0?", breakdown: ["== sammenligner; det lagrer ikke en ny verdi.", "0 == 0 blir True.", "Python velger derfor koden under if."], why: "Et sant/usant-spørsmål gjør den matematiske regelen om partall om til et valg programmet kan ta." },
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
        body: "En for-løkke går gjennom en samling verdier én etter én. I denne løkken får variabelen n en ny verdi for hver runde, og hele den innrykkede kodeblokken kjøres én gang per verdi.",
        code: "for n in range(1, 6):",
        steps: ["range lager tallfølgen som løkken skal gå gjennom.", "n får den første verdien i følgen.", "Den innrykkede koden kjøres med denne n-verdien.", "Python gir n neste verdi og gjentar til det ikke er flere verdier igjen."],
        reflection: "Er n fem forskjellige variabler, eller én variabel som endrer verdi fem ganger?",
        why: "Løkken lar oss beskrive selve mønsteret én gang. Python gjør den samme handlingen for alle verdiene uten at vi må kopiere kodelinjen.",
      },
      {
        title: "Sluttverdien er ikke med",
        body: "range(1, 6) starter på 1 og stopper rett før 6. Derfor blir verdiene 1, 2, 3, 4 og 5. Det siste tallet er en stoppgrense, ikke en verdi løkken skal bruke.",
        code: "range(start, stopp)",
        steps: ["Startverdien 1 er med.", "Python øker med 1: 2, 3, 4 og 5.", "Neste verdi ville vært 6, men da er stoppgrensen nådd.", "Det blir derfor fem runder, selv om stoppverdien er 6."],
        reflection: "Hva må stoppverdien være hvis du vil ha tallene 1 til og med 10? Hvor mange runder blir det?",
        why: "At stoppverdien ikke er med, gjør det enkelt å angi grenser og passer med måten Python teller posisjoner fra 0. Men i starten er det tryggest å skrive ut tallfølgen eller liste den før du bruker den.",
      },
      {
        title: "Uttrykket endres hver runde",
        body: "Når n får en ny verdi, regnes 2 * n ut på nytt. Regelen er den samme, men tallet som settes inn endres. Slik lager én kodelinje en hel tallfølge.",
        code: "print(2 * n)",
        steps: ["Første runde: n = 1, så 2 · n = 2.", "Andre runde: n = 2, så 2 · n = 4.", "Deretter blir svarene 6, 8 og 10.", "Etter n = 5 finnes ingen flere verdier i range, og løkken stopper."],
        reflection: "Hva må stå i uttrykket for at de samme n-verdiene skal gi 3, 6, 9, 12 og 15?",
        why: "Løkkevariabelen fungerer som en plassholder. Ved å følge n og utskriften i en sportabell kan vi forklare hvert eneste resultat.",
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
      { kind: "write", code: "for n in range(1, 6):", explanation: "Løkken lar n få verdiene 1, 2, 3, 4 og 5, én om gangen.", think: "Hvor mange verdier ligger mellom startverdien 1 og stoppgrensen 6?", breakdown: ["1 er med.", "6 er ikke med.", "Tallfølgen blir 1, 2, 3, 4, 5 – altså fem runder."], why: "for-linjen bestemmer både hvilke verdier som skal brukes, og hvor mange ganger den innrykkede koden skal gjentas." },
      { kind: "do", explanation: "Kontroller at løkkelinjen slutter med kolon (:)." },
      { kind: "do", explanation: "Lag innrykk på neste linje med Tab eller fire mellomrom." },
      { kind: "write", code: "    print(2 * n)", explanation: "Mellomrommene viser at print hører til løkken. Uttrykket regnes på nytt i hver runde.", think: "Hva blir 2 * n når n først er 1 og deretter 2?", breakdown: ["n = 1 gir 2 · 1 = 2.", "n = 2 gir 2 · 2 = 4.", "Slik fortsetter det til n = 5 gir 10."], why: "Regelen 2 * n er fast, men n endrer seg. Det er dette som skaper mønsteret." },
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
        body: "def betyr at vi definerer – lager – en funksjon. Vi gir en oppskrift navnet f. Bokstaven x i parentes er en parameter: en tom plass som får en konkret verdi først når funksjonen brukes.",
        code: "def f(x):",
        steps: ["def forteller Python at en funksjon skal beskrives.", "f er navnet vi senere bruker for å kalle funksjonen.", "x er navnet på verdien funksjonen skal ta imot.", "Kolon og innrykk viser hvilke linjer som tilhører funksjonen."],
        reflection: "Kjører regnestykket allerede når Python leser def-linjen, eller venter programmet til vi skriver f(6)?",
        why: "Definisjonen lagrer en gjenbrukbar oppskrift. Den utføres ikke før vi kaller funksjonen, og samme oppskrift kan derfor brukes med mange forskjellige verdier.",
      },
      {
        title: "return sender svaret tilbake",
        body: "Uttrykket etter return bestemmer funksjonsverdien. Når funksjonen kalles, regner Python ut uttrykket med den aktuelle x-verdien og sender resultatet tilbake til stedet der funksjonen ble brukt.",
        code: "return 2 * x + 3",
        steps: ["Hvis x er 6, erstattes x med 6 i uttrykket.", "Python regner gange før pluss: 2 · 6 = 12, deretter 12 + 3 = 15.", "return sender tallet 15 tilbake.", "return viser ikke svaret automatisk; det må lagres eller skrives ut."],
        reflection: "Hva ville funksjonen returnert for x = 0? Hvilken del av uttrykket avgjør svaret da?",
        why: "return gjør resultatet brukbart videre i programmet. Vi kan lagre det, regne videre med det eller sende det til print.",
      },
      {
        title: "Et funksjonskall setter inn en verdi",
        body: "f(6) er et funksjonskall. Tallet 6 sendes inn i funksjonen og får rollen som x akkurat i dette kallet. Resultatet blir 2 · 6 + 3 = 15.",
        code: "resultat = f(6)",
        steps: ["Python ser funksjonskallet f(6) på høyresiden.", "Inne i funksjonen får x verdien 6.", "Funksjonen returnerer 15.", "Til slutt lagres 15 i variabelen resultat."],
        reflection: "Hvis vi skriver f(10) på neste linje, endres den gamle variabelen resultat automatisk? Hvorfor eller hvorfor ikke?",
        why: "Hvert funksjonskall er en ny tur gjennom den samme oppskriften. Verdien i parentes kan endres uten at vi skriver selve regelen på nytt.",
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
      { kind: "write", code: "def f(x):", explanation: "Dette lager en funksjon med navnet f og parameteren x.", think: "Hva tror du x betyr før funksjonen er kalt med en konkret verdi?", breakdown: ["def betyr «definer en funksjon».", "f er funksjonsnavnet.", "x er en plassholder for verdien som kommer inn."], why: "Funksjonen er nå en lagret oppskrift, men regnestykket kjøres først når funksjonen blir kalt." },
      { kind: "write", code: "    return 2 * x + 3", explanation: "Den innrykkede linjen er regelen funksjonen bruker. return sender svaret tilbake.", think: "Hvis x blir 6, i hvilken rekkefølge regnes 2 * 6 + 3?", breakdown: ["Gange regnes før pluss: 2 · 6 = 12.", "Deretter legges 3 til: 12 + 3 = 15.", "return sender 15 tilbake til funksjonskallet."], why: "Uten return får ikke resten av programmet funksjonsverdien som det kan lagre eller regne videre med." },
      { kind: "do", explanation: "Lag en tom linje. Gå deretter helt tilbake til venstre uten innrykk." },
      { kind: "write", code: "resultat = f(6)", explanation: "Her kalles funksjonen. x får verdien 6, og svaret lagres i resultat.", think: "Les linjen fra høyre: Hva må Python regne ut før resultat kan få en verdi?", breakdown: ["f(6) kjøres først.", "Funksjonen returnerer 15.", "Deretter får resultat verdien 15."], why: "Et funksjonskall kan stå på høyresiden av en tildeling fordi kallet gir én verdi tilbake." },
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
        body: "random.randint(1, 6) etterligner ett terningkast ved å velge et heltall fra 1 til og med 6. Begge grensene er med, så alle de seks mulige terningverdiene kan bli valgt.",
        code: "kast = random.randint(1, 6)",
        steps: ["import random gjør tilfeldighetsverktøyet tilgjengelig.", "randint(1, 6) velger én av verdiene 1, 2, 3, 4, 5 eller 6.", "Den valgte verdien lagres i kast.", "Neste gang linjen kjøres, kan kast få en ny verdi."],
        reflection: "Kan to kast etter hverandre bli like? Ville det vært mer eller mindre tilfeldig om Python forbød det?",
        why: "En simulering trenger samme mulige utfall som forsøket den etterligner. En vanlig terning har seks sider, derfor bruker vi heltallene 1 til 6.",
      },
      {
        title: "En teller samler resultater",
        body: "Variabelen antall_seksere er en teller. Den starter på 0 før løkken. Hver gang vilkåret kast == 6 er sant, økes den gamle verdien med 1 og den nye verdien lagres tilbake.",
        code: "antall_seksere += 1",
        steps: ["Før første kast har vi observert 0 seksere.", "if undersøker ett kast om gangen.", "Ved en sekser betyr += 1 det samme som antall_seksere = antall_seksere + 1.", "Ved alle andre kast hoppes økningen over, så telleren beholder verdien sin."],
        reflection: "Hvorfor må telleren stå før løkken? Hva ville skjedd hvis antall_seksere = 0 sto inne i løkken?",
        why: "Telleren må huske treff fra alle rundene. Derfor opprettes den én gang før gjentakelsen og oppdateres bare når hendelsen vi teller, skjer.",
      },
      {
        title: "Relativ frekvens",
        body: "Antall seksere alene sier lite uten å vite hvor mange kast vi gjorde. Relativ frekvens er treff delt på alle forsøk. Får vi 98 seksere på 600 kast, blir andelen 98 / 600 ≈ 0.163, altså omtrent 16,3 %.",
        code: "andel = antall_seksere / antall_kast",
        steps: ["Tell hvor mange ganger hendelsen skjedde: for eksempel 98.", "Del på totalt antall forsøk: 98 / 600 ≈ 0.163.", "Gjør om til prosent: 0.163 ≈ 16,3 %.", "Sammenlign med teorien 1 / 6 ≈ 0.167 = 16,7 %, uten å kreve at tallene er helt like."],
        reflection: "Er 98 seksere et dårlig resultat fordi vi forventet omtrent 100? Hva betyr «omtrent» i et tilfeldig forsøk?",
        why: "Tilfeldighet gir naturlig variasjon. Når antall forsøk blir stort, pleier relativ frekvens å stabilisere seg nær den teoretiske sannsynligheten, men den blir ikke garantert nøyaktig 1/6.",
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
      { kind: "write", code: "antall_kast = 600\nantall_seksere = 0", explanation: "Den første variabelen bestemmer antall forsøk. Telleren starter på 0 fordi ingen kast er gjort ennå.", think: "Hvorfor skal antall_seksere ikke starte på 1?", breakdown: ["Før løkken har programmet ikke observert noen terningkast.", "Dermed er antall observerte seksere 0.", "Telleren skal økes senere, bare når et kast faktisk blir 6."], why: "Startverdien må beskrive situasjonen før forsøket begynner. Ellers ville sluttresultatet fått med en sekser som aldri ble kastet." },
      { kind: "write", code: "for _ in range(antall_kast):\n    kast = random.randint(1, 6)", explanation: "kast-linjen har fire mellomrom fordi den hører til løkken." },
      { kind: "write", code: "    if kast == 6:\n        antall_seksere += 1", explanation: "if undersøker hvert kast. Telleren økes bare når kastet er 6.", think: "Hva skjer med telleren når kast er 4? Hva skjer når kast er 6?", breakdown: ["Ved kast = 4 er vilkåret usant, og økningen hoppes over.", "Ved kast = 6 er vilkåret sant.", "+= 1 legger da én til den gamle tellerverdien og lagrer den nye."], why: "De to innrykksnivåene viser rekkefølgen: if kjøres inni løkken, og tellerøkningen kjøres inni if." },
      { kind: "write", code: "andel = antall_seksere / antall_kast\nprint(round(andel, 3))", explanation: "Etter alle kastene deler vi antall treff på antall forsøk.", think: "Hvis telleren ender på 100, hvilken brøk og hvilket desimaltall får vi?", breakdown: ["100 / 600 forkortes til 1 / 6.", "Som desimaltall er dette omtrent 0.167.", "Det tilsvarer omtrent 16,7 %."], why: "En andel gjør resultatet sammenlignbart med sannsynligheten 1/6 og med simuleringer som bruker et annet antall kast." },
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
        body: "Ved 10 % vekst skal vi beholde hele den gamle verdien og legge til 10 %. Hele verdien er 100 % = 1, og økningen er 10 % = 0.10. Derfor blir vekstfaktoren 1 + 0.10 = 1.10. Faktoren brukes på nytt for hver periode.",
        code: "verdi = start * vekstfaktor ** tid",
        steps: ["start er verdien før veksten begynner: 1000.", "vekstfaktor 1.10 betyr 110 % av verdien fra perioden før.", "tid = 2 betyr at faktoren skal brukes to ganger.", "Regnestykket blir 1000 · 1.10 · 1.10 = 1210."],
        reflection: "Hvorfor blir svaret 1210 og ikke 1200 når veksten er 10 % i to perioder?",
        why: "Den andre veksten regnes av 1100, ikke av den opprinnelige 1000. Vi får altså vekst også på den første økningen. Det er kjernen i eksponentiell vekst.",
      },
      {
        title: "** betyr potens",
        body: "1.10 ** 2 betyr 1,10². Eksponenten 2 forteller hvor mange ganger 1.10 skal være faktor: 1.10 · 1.10. Python bruker to stjerner for potens; én stjerne betyr vanlig multiplikasjon.",
        code: "vekstfaktor ** tid",
        steps: ["Grunntallet er vekstfaktoren 1.10.", "Eksponenten er tid, her 2.", "Python regner potensen først: 1.10² = 1.21.", "Deretter ganges startverdien med 1.21: 1000 · 1.21 = 1210."],
        reflection: "Hva betyr 1.10 ** 0? Hva bør verdien være etter null perioder?",
        why: "Potens er en kort skrivemåte for gjentatt multiplikasjon. Den passer bare når den samme vekstfaktoren brukes i hver periode.",
      },
      {
        title: "En modell har forutsetninger",
        body: "Koden gir et nøyaktig svar på modellen, men modellen er en forenkling av virkeligheten. Her antar vi blant annet at veksten er nøyaktig 10 % i hver periode, at ingen penger tas ut eller settes inn, og at periodene er like lange.",
        code: "vekstfaktor = 1.10  # holdes konstant",
        steps: ["Finn hvilke størrelser modellen holder faste.", "Undersøk hvilke hendelser modellen ikke tar med.", "Vurder om tidsrommet er så langt at antakelsene blir urimelige.", "Skill mellom «programmet regnet riktig» og «modellen beskriver virkeligheten godt»."],
        reflection: "Kan 1210 være riktig beregnet, men likevel et dårlig anslag for virkeligheten? Nevn én mulig grunn.",
        why: "Programmer regner konsekvent ut det vi ber om, også når antakelsene våre er svake. Derfor må modeller alltid forklares og vurderes, ikke bare kjøres.",
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
      { kind: "write", code: "vekstfaktor = 1.10\ntid = 2", explanation: "1.10 betyr at 100 % beholdes og 10 % legges til. tid = 2 betyr to vekstperioder.", think: "Hvilke to prosentdeler er samlet i tallet 1.10?", breakdown: ["1 står for hele den gamle verdien: 100 %.", "0.10 står for økningen: 10 %.", "1 + 0.10 = 1.10, altså 110 %.", "Faktoren skal brukes to ganger fordi tid er 2."], why: "En vekstfaktor samler den gamle verdien og økningen i ett tall som vi kan multiplisere med." },
      { kind: "do", explanation: "Lag en tom linje. Den gjør koden lettere å lese, men endrer ikke svaret." },
      { kind: "write", code: "verdi = start * vekstfaktor ** tid", explanation: "Potensen gjentar vekstfaktoren én gang for hver periode.", think: "Hvorfor holder det ikke å regne start * 1.10 bare én gang når tid er 2?", breakdown: ["vekstfaktor ** tid blir 1.10 ** 2.", "Det betyr 1.10 · 1.10 = 1.21.", "1000 · 1.21 = 1210.", "Den andre 10-prosentveksten regnes av 1100, derfor blir økningen 110 i periode 2."], why: "Veksten bygger på forrige periodes nye verdi. Potensen beskriver denne gjentatte multiplikasjonen." },
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
  {
    id: 7,
    title: "Turtle og geometriske figurer",
    shortTitle: "Turtle og geometri",
    eyebrow: "Tegn matematikk med kode",
    question: "Hvordan kan én løkke tegne en regulær mangekant med så mange sider vi vil?",
    intro:
      "Turtle er en digital penn som flytter seg og snur. Når vi styrer pennen med lengder, vinkler, variabler og løkker, blir geometrien synlig – og koden kan bli til mønstre for vinylkutter og laser.",
    refresh: {
      title: "En hel runde er 360 grader",
      body: "For å tegne en lukket, regulær mangekant må Turtle til sammen snu én hel runde. Derfor deler vi 360° på antall sider for å finne vinkelen pennen skal snu ved hvert hjørne.",
      examples: [
        { code: "trekant: 360 / 3 = 120°", explanation: "Tre like svinger på 120° gir til sammen 360°." },
        { code: "kvadrat: 360 / 4 = 90°", explanation: "Fire like svinger på 90° gir til sammen 360°." },
        { code: "sekskant: 360 / 6 = 60°", explanation: "Seks mindre svinger gjør at figuren får flere sider." },
      ],
    },
    theory: [
      {
        title: "Turtle går fram og snur",
        body: "forward(80) flytter pennen 80 enheter rett fram og tegner en strek. left(90) flytter ikke pennen; kommandoen vrir bare retningen 90 grader mot venstre. Den neste streken starter derfor i samme punkt, men peker en ny vei.",
        code: "forward(80)\nleft(90)",
        steps: ["Turtle starter i et punkt og peker mot høyre.", "forward tegner den første siden.", "left endrer retningen uten å endre plasseringen.", "Neste forward tegner fra hjørnet i den nye retningen."],
        reflection: "Hva tror du forskjellen blir mellom left(90) og right(90)? Vil sidelengden endre seg?",
        why: "En figur kan beskrives som en serie bevegelser: gå en bestemt lengde, snu en bestemt vinkel og gjenta. Det er en geometrisk algoritme.",
      },
      {
        title: "Løkken gjentar én side og én sving",
        body: "Alle sidene i en regulær mangekant er like lange, og alle svingene er like store. Derfor kan vi skrive oppskriften én gang og la en for-løkke gjenta den. Variabelen side teller rundene, men selve tegningen lages av de to innrykkede linjene.",
        code: "for side in range(4):\n    forward(80)\n    left(90)",
        steps: ["range(4) gir fire runder.", "I hver runde tegnes én side på 80.", "Deretter snur Turtle 90°.", "Etter fire runder er samlet sving 4 · 90° = 360°, og kvadratet lukkes."],
        reflection: "Hva skjer hvis range(4) endres til range(3), men vinkelen fortsatt er 90°? Hvorfor lukkes ikke figuren?",
        why: "Løkken viser hva som er likt i mønsteret. Vi slipper å kopiere de samme linjene, og det blir enklere å endre hele figuren på ett sted.",
      },
      {
        title: "Variabler gjør oppskriften generell",
        body: "Når antall_sider er en variabel, kan samme program tegne trekant, femkant, åttekant og mye mer. Svingvinkelen må regnes på nytt når antall sider endres. Uttrykket 360 / antall_sider sørger for nettopp det.",
        code: "vinkel = 360 / antall_sider",
        steps: ["360 står for én hel omdreining.", "antall_sider forteller hvor mange like svinger omdreiningen skal deles i.", "Med 6 sider blir vinkelen 60°.", "Løkken gjentas 6 ganger, så samlet sving blir 6 · 60° = 360°."],
        reflection: "Når antall sider øker, blir svingvinkelen større eller mindre? Hvordan vil figuren se ut når antallet blir veldig stort?",
        why: "Programmet inneholder nå en regel, ikke bare én ferdig figur. Det er generalisering: Vi uttrykker en sammenheng som virker for mange tilfeller.",
      },
    ],
    progression: {
      intro: "Begynn med å styre pennen direkte. Bruk så en løkke, gjør figuren variabel og bygg til slutt et mønster som kan eksporteres.",
      steps: [
        {
          label: "Første bevegelse",
          title: "Tegn en vinkel",
          body: "To streker og én sving gjør det tydelig at forward tegner, mens left bare endrer retningen.",
          code: `from turtle import *\n\nforward(120)\nleft(90)\nforward(80)\n\ndone()`,
          tryThis: "Bytt 90 med 60 og deretter 120. Beskriv vinkelen før du kjører koden.",
        },
        {
          label: "Gjenta",
          title: "Tegn en trekant med løkke",
          body: "En likesidet trekant har tre like sider. Turtle må snu 120° ved hvert hjørne for å fullføre 360°.",
          code: `from turtle import *\n\nfor side in range(3):\n    forward(120)\n    left(120)\n\ndone()`,
          tryThis: "Gjør trekanten mindre. Hvilken verdi kan du endre uten at vinklene forandres?",
          upgrade: {
            title: "Legg til farge og fyll",
            body: "begin_fill og end_fill markerer området som skal fylles. Fargen kan fortsatt endres i koden.",
            code: `from turtle import *\n\ncolor("#2f6b5f", "#f4c95d")\nbegin_fill()\nfor side in range(3):\n    forward(120)\n    left(120)\nend_fill()\n\ndone()`,
          },
        },
        {
          label: "Generaliser",
          title: "Tegn en valgfri mangekant",
          body: "Antall sider brukes både i range og i beregningen av svingvinkelen. De to delene må passe sammen for at figuren skal lukkes.",
          code: `from turtle import *\n\nantall_sider = 6\nsidelengde = 80\nvinkel = 360 / antall_sider\n\nfor side in range(antall_sider):\n    forward(sidelengde)\n    left(vinkel)\n\ndone()`,
          tryThis: "Prøv 5, 8 og 12 sider. Forutsi svingvinkelen hver gang.",
        },
        {
          label: "Skap et mønster",
          title: "Roter figuren og tegn den på nytt",
          body: "En løkke kan ligge inni en annen. Den innerste tegner mangekanten; den ytterste roterer hele figuren før den tegnes igjen.",
          code: `from turtle import *\n\nantall_sider = 4\nsidelengde = 100\nvinkel = 360 / antall_sider\n\nfor figur in range(12):\n    for side in range(antall_sider):\n        forward(sidelengde)\n        left(vinkel)\n    left(30)\n\ndone()`,
          tryThis: "Hvorfor passer 12 repetisjoner og 30° sammen? Endre begge slik at samlet rotasjon fortsatt blir 360°.",
        },
      ],
    },
    starterCode: `from turtle import *\n\nantall_sider = 6\nsidelengde = 80\nvinkel = 360 / antall_sider\n\nfor side in range(antall_sider):\n    forward(sidelengde)\n    left(vinkel)\n\ndone()`,
    typingSteps: [
      { kind: "write", code: "from turtle import *", explanation: "Denne linjen henter inn Turtle-kommandoene, slik at Python kjenner forward, left og done.", think: "Hvorfor må Python få vite hvilket verktøy vi vil bruke?", breakdown: ["Python har en grunnpakke med kommandoer.", "Turtle er et eget bibliotek.", "import gjør bibliotekets kommandoer tilgjengelige i programmet."], why: "Et bibliotek er en samling ferdige verktøy. Vi kan bruke dem uten å programmere hele tegnemotoren selv." },
      { kind: "do", explanation: "Lag en tom linje. Deretter skal du lage tre variabler som beskriver figuren." },
      { kind: "write", code: "antall_sider = 6\nsidelengde = 80", explanation: "Variablene bestemmer formen og størrelsen. Start med en sekskant med sider på 80.", think: "Hvilken variabel endrer formen, og hvilken endrer bare størrelsen?", breakdown: ["antall_sider bestemmer hvor mange streker figuren får.", "sidelengde bestemmer hvor lang hver strek blir.", "Ingen av dem forteller ennå hvor mye Turtle skal snu."], why: "Tydelige variabelnavn gjør den geometriske oppskriften lettere å lese og lettere å endre." },
      { kind: "write", code: "vinkel = 360 / antall_sider", explanation: "En hel runde deles på antall like svinger.", think: "Hva blir vinkel når antall_sider er 6?", breakdown: ["En hel omdreining er 360°.", "Seks like svinger betyr 360 / 6.", "Vinkelen blir 60°.", "Seks svinger på 60° gir til sammen 360°."], why: "Når samlet sving er én hel runde, ender Turtle med samme retning som den startet og mangekanten kan lukkes." },
      { kind: "do", explanation: "Lag en ny tom linje. Nå kommer løkken som gjentar side og sving." },
      { kind: "write", code: "for side in range(antall_sider):\n    forward(sidelengde)\n    left(vinkel)", explanation: "Skriv kolon etter range. Bruk Tab foran de to linjene som skal gjentas.", think: "Hvor mange ganger kjøres de innrykkede linjene når antall_sider er 6?", breakdown: ["range(antall_sider) lager seks runder.", "forward tegner én side i hver runde.", "left snur før neste side.", "Etter seks runder er alle sidene tegnet."], why: "Innrykket viser nøyaktig hvilke kommandoer som hører til løkken. Både bevegelsen og svingen må gjentas." },
      { kind: "write", code: "done()", explanation: "Denne linjen markerer at Turtle-programmet er ferdig. Trykk så «Kjør kode» og spill av tegningen steg for steg." },
    ],
    polish: {
      title: "Gjør figuren klar for skaperverkstedet",
      body: "En tydelig tittel, farge og strektykkelse gjør tegningen lettere å kjenne igjen. Etter kjøring kan Skaperverksted-menyen brukes til å velge senterlinje, ytterlinjer eller lukket omriss.",
      before: "from turtle import *",
      after: `from turtle import *\ntitle("Min sekskant")\ncolor("#2f6b5f")\npensize(4)`,
      explanation: "title navngir tegningen, color velger strekfarge og pensize bestemmer tykkelsen. SVG-eksporten kan bearbeide streken videre for vinylkutter og laser.",
    },
    observe: [
      "Hvorfor brukes 360 / antall_sider som svingvinkel?",
      "Hva endres når sidelengden dobles, og hva forblir likt?",
      "Hvordan ser du i koden at alle sidene og vinklene skal være like?",
      "Hva tror du skjer når antall_sider blir 30 eller 60?",
    ],
    task:
      "Endre programmet til en regulær åttekant. Velg en tydelig farge og strektykkelse, spill av tegningen og lagre den som SVG.",
    taskHint: "Sett antall_sider til 8. Programmet regner ut riktig svingvinkel for deg.",
    expected: ["turtle"],
    teacher: {
      purpose:
        "Koble vinkler, regulære mangekanter, generalisering, løkker og algoritmisk tenkning i en synlig aktivitet med et fysisk sluttprodukt.",
      before: [
        "La en elev være Turtle på gulvet: gå fram, stopp og snu.",
        "Regn ut svingvinkelen for trekant og kvadrat uten kode først.",
        "Skill mellom figurens innvendige vinkel og vinkelen Turtle faktisk snur.",
      ],
      misconceptions: [
        "Eleven bruker den innvendige vinkelen som svingvinkel.",
        "Bare forward-linjen rykkes inn, slik at Turtle ikke snur i hver runde.",
        "range-verdien endres uten at svingvinkelen beregnes på nytt.",
      ],
      assess:
        "Eleven kan forklare samlet rotasjon på 360°, koble variablene til geometriske egenskaper og forutsi virkningen av en kodeendring.",
      extension:
        "La elevene designe et repeterende mønster, begrunne symmetrien og eksportere en senterlinje eller et lukket omriss til skaperverkstedet.",
    },
  },
  {
    id: 8,
    title: "Bygg et spill: Snake",
    shortTitle: "Spill og Snake",
    eyebrow: "Fra regler til spill",
    question: "Hvordan kan lister, koordinater, vilkår og en løkke bli til et spill vi faktisk kan styre?",
    intro:
      "Snake ser enkelt ut, men samler mange viktige ideer i programmering: en spilltilstand, en retning, en oppdatering som gjentas, tilfeldige plasseringer og regler for kollisjon. Vi bygger forståelsen bit for bit før vi starter den spillbare versjonen.",
    refresh: {
      title: "Et spill er en tilstand som endres",
      body: "På hvert tidspunkt må programmet vite hvor slangen er, hvor maten ligger, hvilken vei slangen beveger seg og hvor mange poeng spilleren har. Én runde i spill-løkken regner ut den neste tilstanden og tegner brettet på nytt.",
      examples: [
        { code: "hode = [5, 4]", explanation: "Hodet ligger i kolonne 5 og rad 4 på et rutenett." },
        { code: "retning = [1, 0]", explanation: "x øker med 1 og y endres ikke: Slangen går mot høyre." },
        { code: "slange = [[5, 4], [4, 4], [3, 4]]", explanation: "En liste med ruter beskriver hele kroppen, fra hode til hale." },
      ],
    },
    theory: [
      {
        title: "Koordinater plasserer alt på brettet",
        body: "Vi kan tenke på spillbrettet som et koordinatsystem av ruter. Et punkt [x, y] sier hvilken kolonne og rad noe ligger i. Når slangen går mot høyre, øker x med 1. Når den går nedover på en skjerm, øker y med 1 fordi radene telles fra toppen.",
        code: "nytt_hode = [hode[0] + dx, hode[1] + dy]",
        steps: ["hode[0] er den gamle x-koordinaten.", "hode[1] er den gamle y-koordinaten.", "dx og dy beskriver endringen i én spillrunde.", "Det nye hodet er gammel plassering pluss retningsendringen."],
        reflection: "Hvis hodet er [5, 4] og retningen er [0, -1], hvor havner hodet etter én runde?",
        why: "Bevegelse blir enkel når den uttrykkes som endring i koordinater. Samme regel virker uansett hvor på brettet slangen er.",
      },
      {
        title: "En liste holder orden på hele slangen",
        body: "Første element i listen er hodet. For hver runde legger vi det nye hodet først. Hvis slangen ikke spiser, fjerner vi siste element – halen. Da ser kroppen ut til å flytte seg uten at lengden endres.",
        code: "slange.insert(0, nytt_hode)\nslange.pop()",
        steps: ["insert(0, ...) legger en ny rute først i listen.", "Alle de gamle kroppsdelene skyves én plass bakover.", "pop() fjerner den siste ruten.", "Når pop hoppes over etter at mat er spist, blir slangen én rute lengre."],
        reflection: "Hvorfor vokser slangen hvis vi legger til et hode, men ikke fjerner halen?",
        why: "Listen er spillets modell av kroppen. Ved å endre listen etter faste regler endrer vi også det som blir tegnet på brettet.",
      },
      {
        title: "Vilkår bestemmer mat, poeng og game over",
        body: "Etter at nytt_hode er beregnet, må programmet stille flere spørsmål: Er hodet utenfor brettet? Ligger det allerede i kroppen? Er hodet på samme rute som maten? Svarene bestemmer hva som skjer videre.",
        code: "if nytt_hode in slange:\n    game_over = True",
        steps: ["Veggkollisjon undersøker om x eller y er utenfor brettets grenser.", "Kroppskollisjon bruker in for å se om ruten allerede finnes i slangen.", "Mat treffes når nytt_hode == mat.", "Bare når ingen kollisjon har skjedd, fortsetter neste spillrunde."],
        reflection: "I hvilken rekkefølge bør programmet sjekke kollisjon og mat? Kan mat ligge inni slangen?",
        why: "Vilkårene er spillreglene skrevet presist. Uten dem ville vi hatt en animasjon, men ikke et spill med mål, risiko og poeng.",
      },
    ],
    progression: {
      intro: "Følg én koordinat først, bygg deretter en kropp av flere ruter, legg til spillregler og start til slutt den spillbare Snake-motoren.",
      steps: [
        {
          label: "Plassering",
          title: "Flytt ett punkt på rutenettet",
          body: "Vi begynner med bare hodet og en retning. Løkken viser de fem neste plasseringene som tekst.",
          code: `hode = [3, 4]\nretning = [1, 0]\n\nfor runde in range(5):\n    hode[0] += retning[0]\n    hode[1] += retning[1]\n    print(hode)`,
          tryThis: "Endre retningen til [0, -1]. Forutsi alle fem koordinatene før du kjører.",
        },
        {
          label: "Kropp",
          title: "Legg til nytt hode og fjern halen",
          body: "Listen starter med tre kroppsdeler. Hver runde lager vi en ny liste med det nye hodet først og alle unntatt den gamle halen etterpå.",
          code: `slange = [[5, 4], [4, 4], [3, 4]]\ndx, dy = 1, 0\n\nfor runde in range(3):\n    hode = slange[0]\n    nytt_hode = [hode[0] + dx, hode[1] + dy]\n    slange = [nytt_hode] + slange[:-1]\n    print(slange)`,
          tryThis: "Tegn rutene på papir. Hvorfor er lengden fortsatt 3 etter hver runde?",
          upgrade: {
            title: "Hva betyr slange[:-1]?",
            body: "Dette er et utsnitt av listen fra starten fram til, men ikke med, det siste elementet. Dermed beholdes kroppen uten den gamle halen.",
            code: `slange = [[5, 4], [4, 4], [3, 4]]\nprint(slange[:-1])  # [[5, 4], [4, 4]]`,
          },
        },
        {
          label: "Regler",
          title: "Finn vegg, kropp og mat",
          body: "En funksjon samler det som skal skje i én spillrunde. Den returnerer oppdatert slange, poeng og beskjed.",
          code: `def ett_steg(slange, retning, mat, bredde, hoyde, poeng):\n    hode = slange[0]\n    dx, dy = retning\n    nytt_hode = [hode[0] + dx, hode[1] + dy]\n\n    x, y = nytt_hode\n    traff_vegg = x < 0 or x >= bredde or y < 0 or y >= hoyde\n    traff_kropp = nytt_hode in slange[:-1]\n\n    if traff_vegg or traff_kropp:\n        return slange, poeng, "game over"\n\n    ny_slange = [nytt_hode] + slange\n    if nytt_hode == mat:\n        return ny_slange, poeng + 1, "mat"\n\n    return ny_slange[:-1], poeng, "fortsett"`,
          tryThis: "Følg funksjonen med nytt_hode [10, 4] når bredde er 10. Hvorfor blir det veggkollisjon?",
        },
        {
          label: "Spillbar versjon",
          title: "Start Snake med spill-biblioteket",
          body: "Bjørnsveens lokale spill-bibliotek tar seg av tegning, tastatur og den gjentatte spill-løkken. Variablene i koden bestemmer brett, fart, farger og veggregel.",
          code: `from spill import Snake\n\nspill = Snake(\n    bredde=18,\n    hoyde=12,\n    fart=6,\n    gjennom_vegg=False,\n    tittel="Mitt Snake-spill",\n)\n\nspill.start()`,
          tryThis: "Prøv fart 3 og 10. Endre gjennom_vegg til True og undersøk hva som skjer ved kanten.",
        },
      ],
    },
    starterCode: `from spill import Snake\n\nspill = Snake(\n    bredde=18,\n    hoyde=12,\n    fart=6,\n    slangefarge="#62b88b",\n    hodefarge="#f4c95d",\n    matfarge="#f06f51",\n    gjennom_vegg=False,\n    tittel="Mitt Snake-spill",\n)\n\nspill.start()`,
    typingSteps: [
      { kind: "write", code: "from spill import Snake", explanation: "Dette henter den lokale Snake-motoren. Den fungerer både på nettsiden og i offline-appen.", think: "Hvilke oppgaver kan et spill-bibliotek gjøre for oss?", breakdown: ["Det tegner rutenettet og figurene.", "Det leser piltaster og knapper.", "Det gjentar spillrunden i riktig fart.", "Det lar vår Python-kode bestemme regler og utseende."], why: "Et bibliotek lar nybegynnere arbeide med viktige ideer uten først å måtte bygge hele skjermmotoren." },
      { kind: "do", explanation: "Lag en tom linje. Nå skal du opprette ett spill og gi innstillingene som navngitte argumenter." },
      { kind: "write", code: "spill = Snake(\n    bredde=18,\n    hoyde=12,\n    fart=6,\n)", explanation: "Parentesen kan gå over flere linjer. Innrykket gjør innstillingene lettere å lese.", think: "Hva beskriver de tre tallene?", breakdown: ["bredde er antall kolonner.", "hoyde er antall rader.", "fart er antall spillrunder per sekund.", "Større fart betyr kortere tid til neste bevegelse."], why: "Navngitte argumenter viser tydelig hva hver verdi styrer. Rekkefølgen blir mindre viktig." },
      { kind: "write", code: "spill.slangefarge = \"#62b88b\"\nspill.matfarge = \"#f06f51\"", explanation: "Fargekodene endrer kroppen og maten. Teksten må stå i anførselstegn." },
      { kind: "write", code: "spill.gjennom_vegg = False", explanation: "False betyr at veggen gir game over. Bytt til True for et spill der slangen kommer inn på motsatt side.", think: "Hvilken av de to regelvariantene gjør spillet enklest?", breakdown: ["False aktiverer veggkollisjon.", "True bruker rutenettet som om venstre og høyre kant henger sammen.", "Verdien er en boolsk verdi: sant eller usant."], why: "En enkelt variabel kan representere en hel spillregel og gjøre det lett å lage varianter." },
      { kind: "write", code: "spill.start()", explanation: "Denne linjen starter visningen. Trykk deretter «Kjør kode», klikk Start i spillet og bruk piltastene." },
    ],
    polish: {
      title: "Lag deres egen spillvariant",
      body: "Et spill blir mer personlig når reglene og det visuelle uttrykket henger sammen. Prøv et lite, raskt brett eller et stort, rolig brett med egne farger.",
      before: "spill = Snake(bredde=18, hoyde=12, fart=6)",
      after: `spill = Snake(\n    bredde=14, hoyde=10, fart=8,\n    slangefarge="#65d6ad",\n    hodefarge="#ffe06b",\n    matfarge="#ff7058",\n    bakgrunn="#102e2b",\n    gjennom_vegg=True,\n    tittel="Neon-Snake",\n)`,
      explanation: "Alle disse er valgfrie argumenter. Start med å endre én ting om gangen, slik at dere kan forklare hvilken virkning hvert valg har.",
    },
    observe: [
      "Hvordan er slangen representert som data i programmet?",
      "Hvorfor må programmet oppdatere og tegne spillet mange ganger per sekund?",
      "Hvilke vilkår kan føre til mat, poeng eller game over?",
      "Hvordan påvirker fart og brettstørrelse vanskelighetsgraden?",
    ],
    task:
      "Lag deres egen Snake-variant: velg brettstørrelse, fart, minst tre farger og om slangen kan gå gjennom veggen. Spill, test og begrunn valgene.",
    taskHint: "Kontroller at spill.start() står etter alle innstillingene, og at farger står i anførselstegn.",
    expected: ["snake"],
    teacher: {
      purpose:
        "Samle koordinater, lister, funksjoner, vilkår, tilfeldighet og algoritmisk tenkning i et motiverende produkt elevene kan teste og forbedre.",
      before: [
        "Spill én kort runde og be elevene liste opp alt programmet må huske.",
        "Bruk et fysisk rutenett og la elever være hode, kropp og mat.",
        "Følg tre spillrunder på papir før editoren åpnes.",
      ],
      misconceptions: [
        "x og y blandes, særlig fordi y øker nedover på skjermen.",
        "Eleven tror at hele slangen flyttes direkte i stedet for at nytt hode legges til og hale fjernes.",
        "En høyere fart-verdi tolkes som lengre ventetid og dermed lavere fart.",
      ],
      assess:
        "Eleven kan forklare datastrukturen for slangen, regne ut neste hode og peke ut vilkårene for vekst og kollisjon.",
      extension:
        "La elevene utvide ett_steg-funksjonen med hindringer, bonusmat eller en regel som gir ulike poeng for ulike mattyper.",
    },
  },
  {
    id: 9,
    title: "Tegn grafer/funksjoner med Python",
    shortTitle: "Eksamensklare grafer",
    eyebrow: "Fra funksjonsuttrykk til ferdig figur",
    question: "Hvordan lager vi en funksjonsgraf som er matematisk riktig, lett å lese og klar til å leveres?",
    intro:
      "En god graf er mer enn en kurve. Den må vise hvilken funksjon som er tegnet, hva aksene betyr, hvilket utsnitt som er valgt og hvordan enhetene er skalert. Her bygger vi en leveringsklar graf og lærer hva hver del av koden gjør.",
    refresh: {
      title: "En graf viser sammenhengen mellom x og f(x)",
      body: "Funksjonen er en regel som gir én funksjonsverdi for hver tillatte x-verdi. Punktene (x, f(x)) danner grafen. I Python lager vi først mange x-verdier, regner ut de tilhørende funksjonsverdiene og sender begge listene til tegneverktøyet.",
      examples: [
        { code: "f(x) = 2x + 3", explanation: "Matematisk skrivemåte for funksjonsregelen." },
        { code: "def f(x): return 2 * x + 3", explanation: "Den samme regelen definert som en Python-funksjon." },
        { code: "y = f(x)", explanation: "Python regner ut funksjonsverdiene. Her representerer y de samme utverdiene som f(x)." },
      ],
    },
    theory: [
      {
        title: "y-verdiene er f(x), men = er en tildeling",
        body: "I matematikk kan vi skrive y = f(x). Da er y og f(x) to navn på funksjonens utverdi. I Python betyr y = f(x) mer konkret: Kjør funksjonen med x-verdiene og lagre svarene under navnet y. Selve funksjonsregelen defineres i def f(x)-blokken.",
        code: "def f(x):\n    return 2 * x + 3\n\ny = f(x)",
        steps: ["def f(x) oppretter en regel som kan brukes flere ganger.", "return-linjen er stedet der funksjonsuttrykket skrives.", "x kan være ett tall eller mange NumPy-verdier.", "y = f(x) beregner og lagrer alle punktenes y-verdier."],
        reflection: "Hvor i koden må du endre hvis grafen skal vise f(x) = x² − 4? Hvorfor brukes ** og ikke ^?",
        why: "Når regelen samles i f, kan samme funksjon brukes til både graf, verditabell og beregning av bestemte funksjonsverdier uten at uttrykket gjentas flere steder.",
      },
      {
        title: "Utsnitt, tallsteg og akseforhold er tre ulike valg",
        body: "x_min og x_maks bestemmer hvilket område av x-aksen vi ser. x_steg bestemmer avstanden mellom tallmerkene. akseforhold bestemmer hvor lang én x-enhet ser ut sammenlignet med én y-enhet. Det er derfor mulig å beholde samme utsnitt, men endre det visuelle forholdet mellom aksene.",
        code: "ax.set_xlim(-5, 5)\nax.set_xticks(range(-5, 6, 1))\nax.set_aspect(1, adjustable=\"box\")",
        steps: ["set_xlim og set_ylim velger det synlige koordinatområdet.", "set_xticks og set_yticks bestemmer hvor tallene plasseres.", "aspect = 1 gir like lange x- og y-enheter på skjermen.", "aspect = 'auto' lar grafen fylle plassen, selv om enhetene da kan få ulik visuell lengde."],
        reflection: "Kan en sirkel se ut som en oval selv om koordinatene er riktige? Hvilket akseforhold vil hindre dette?",
        why: "Aksevalg påvirker hvordan grafen oppfattes. En korrekt graf kan bli misvisende hvis utsnitt eller målestokk skjuler viktige egenskaper eller overdriver en endring.",
      },
      {
        title: "En leveringsklar graf kommuniserer matematikk",
        body: "En leser skal kunne forstå grafen uten å gjette. Begge aksene trenger navn og eventuelle enheter. Flere grafer trenger tegnforklaring. Utsnittet må vise de punktene oppgaven handler om, og elevens tekst må forklare hva grafen viser – bildet alene er ikke hele besvarelsen.",
        code: "ax.set_xlabel(\"Tid (timer)\")\nax.set_ylabel(\"Pris (kr)\")\nax.legend()",
        steps: ["Skriv størrelsen og enheten i hver aksetittel.", "Gi kurven et matematisk navn med label.", "Bruk tittel til å beskrive situasjonen kort.", "Kontroller at relevante skjæringspunkter, nullpunkter eller vendepunkter faktisk er synlige."],
        reflection: "Hva mangler hvis en graf har pene farger, men aksene bare heter x og y i en praktisk prisoppgave?",
        why: "Matematisk kommunikasjon handler om at representasjonen er presis og tilpasset situasjonen. Aksetitler og forklaring knytter kurven til problemet som løses.",
      },
    ],
    progression: {
      intro: "Begynn med å kontrollere funksjonsverdier. Tegn deretter kurven, legg til nødvendige akser og avslutt med den komplette endre-bare-her-malen.",
      steps: [
        {
          label: "Kontroller regelen",
          title: "Regn ut noen funksjonsverdier",
          body: "Før grafen tegnes, bør vi kontrollere at Python-regelen stemmer med matematikkuttrykket.",
          code: `def f(x):\n    return 2 * x + 3\n\nprint(f(-1))\nprint(f(0))\nprint(f(2))`,
          tryThis: "Regn ut de tre svarene for hånd. Hvis de ikke stemmer, bør funksjonen rettes før grafen lages.",
        },
        {
          label: "Tegn kurven",
          title: "Lag mange x-verdier og beregn y",
          body: "linspace lager mange jevnt fordelte x-verdier. y = f(x) beregner funksjonsverdien for hver av dem.",
          code: `import numpy as np\nimport matplotlib.pyplot as plt\n\ndef f(x):\n    return 2 * x + 3\n\nx = np.linspace(-5, 5, 500)\ny = f(x)\n\nplt.plot(x, y)\nplt.show()`,
          tryThis: "Endre 500 til 5. Hvorfor består grafen fortsatt av en linje, men med langt færre beregnede punkter?",
        },
        {
          label: "Gjør den lesbar",
          title: "Legg til navn, utsnitt og koordinatakser",
          body: "Axes-variabelen ax gir ryddige kommandoer for alle delene av koordinatsystemet.",
          code: `fig, ax = plt.subplots()\nax.plot(x, y, label="f(x) = 2x + 3")\nax.set_xlabel("x")\nax.set_ylabel("f(x)")\nax.set_xlim(-5, 5)\nax.set_ylim(-8, 14)\nax.axhline(0, color="black")\nax.axvline(0, color="black")\nax.grid()\nax.legend()\nplt.show()`,
          tryThis: "Gjør dette om til en prisoppgave. Hvilke aksetitler og enheter ville vært presise?",
        },
        {
          label: "Eksamensmal",
          title: "Endre bare innstillingene øverst",
          body: "Den fullstendige malen samler alt eleven vanligvis skal endre i DEL 1. Kommentarene begynner med # og forklarer hvert valg direkte i koden.",
          code: examGraphTemplate,
          tryThis: "Tegn f(x) = x ** 2 - 4. Velg et utsnitt og tallsteg som viser begge nullpunktene tydelig.",
          upgrade: {
            title: "Husk: ^ betyr ikke potens i Python",
            body: "Python bruker to stjerner til potens. Skriv x ** 2 for x². Tegnet ^ har en annen teknisk betydning og gir ikke funksjonen du forventer.",
            code: `def f(x):\n    return x ** 2 - 4`,
          },
        },
      ],
    },
    starterCode: examGraphTemplate,
    typingSteps: [
      { kind: "write", code: "import numpy as np\nimport matplotlib.pyplot as plt", explanation: "NumPy lager x-verdiene. Matplotlib tegner koordinatsystemet og grafen." },
      { kind: "do", explanation: "Skriv overskriften # DEL 1: ENDRE BARE VERDIENE HER. Python ignorerer tekst som står etter #, så kommentaren er hjelp til mennesket som leser koden." },
      { kind: "write", code: "def f(x):\n    return 2 * x + 3", explanation: "Dette er funksjonen. Endre bare uttrykket etter return når en ny funksjon skal tegnes.", think: "Hva må stå etter return for f(x) = x² − 4?", breakdown: ["x² skrives x ** 2.", "Deretter trekkes 4 fra.", "Hele linjen blir return x ** 2 - 4."], why: "def lager en virkelig Python-funksjon. Senere kan y = f(x) beregne mange funksjonsverdier samtidig." },
      { kind: "write", code: "x_aksetittel = \"x\"\ny_aksetittel = \"f(x)\"", explanation: "Skriv tydelige navn og enheter mellom anførselstegn. I en praktisk oppgave kan dette være Tid (timer) og Pris (kr)." },
      { kind: "write", code: "x_min = -5\nx_maks = 5\ny_min = -8\ny_maks = 14", explanation: "Disse fire tallene velger utsnittet. De endrer ikke funksjonen, bare hva vi ser." },
      { kind: "write", code: "x_steg = 1\ny_steg = 2", explanation: "Dette bestemmer avstanden mellom tallmerkene på aksene, ikke det visuelle lengdeforholdet mellom enhetene." },
      { kind: "write", code: "akseforhold = \"auto\"", explanation: "auto bruker plassen godt. Bytt til 1 når én enhet skal være like lang på begge aksene.", think: "Når er like enheter særlig viktig?", breakdown: ["Geometriske figurer bør ikke strekkes.", "En sirkel skal se rund ut.", "På mange funksjonsgrafer kan auto gi bedre plass, men valget må vurderes."], why: "Målestokk er et faglig valg. Koden gjør valget synlig og mulig å begrunne." },
      { kind: "do", explanation: "Hent resten fra fasitfanen eller kodekortet «Lag en eksamensklar funksjonsgraf». Kjør, kontroller grafen og bruk sjekklisten før du lagrer bildet." },
    ],
    polish: {
      title: "Marker og forklar et viktig punkt",
      body: "Når oppgaven handler om et nullpunkt eller skjæringspunkt, kan punktet markeres og få en kort tekst. Beregningen må fortsatt forklares i besvarelsen.",
      before: "ax.plot(x, y, label=funksjonsnavn)",
      after: `ax.plot(x, y, label=funksjonsnavn)\nnullpunkt = -1.5\nax.scatter(nullpunkt, 0, color=\"#173f3a\", zorder=5)\nax.annotate(\"Nullpunkt (-1,5, 0)\", (nullpunkt, 0), xytext=(8, 10), textcoords=\"offset points\")`,
      explanation: "scatter tegner punktet, mens annotate setter forklarende tekst ved siden av. Bruk bare markeringer som er relevante for oppgaven.",
    },
    observe: [
      "Stemmer noen utvalgte funksjonsverdier med regning for hånd?",
      "Har begge aksene navn og eventuelle enheter?",
      "Viser utsnittet alle punktene oppgaven handler om?",
      "Er tallsteg og akseforhold valgt slik at grafen er lett å lese og ikke misvisende?",
      "Har besvarelsen en tekst som forklarer hva grafen viser?",
    ],
    task:
      "Bruk eksamensmalen til å tegne f(x) = -3x + 6. Vis nullpunktet tydelig, bruk aksetitler, velg et fornuftig utsnitt og skriv én setning som tolker grafen.",
    taskHint: "Endre return-linjen, funksjonsnavnet, titlene og aksegrensene i DEL 1. Nullpunktet er der grafen krysser x-aksen.",
    expected: ["grafen er klar"],
    teacher: {
      purpose:
        "Gi elevene en trygg arbeidsflyt for å produsere og kontrollere funksjonsgrafer, samtidig som de begrunner representasjonsvalgene matematisk.",
      before: [
        "Vis to grafer av samme funksjon med ulike utsnitt og diskuter hvilket inntrykk de gir.",
        "Repeter forskjellen mellom funksjonsuttrykk, definisjonsområde og verdimengde.",
        "La elevene finne tre funksjonsverdier for hånd før grafen kjøres.",
      ],
      misconceptions: [
        "Elevene bruker // som kommentar i stedet for #.",
        "x_min og y_min oppfattes som en del av funksjonsuttrykket.",
        "Tallsteg, utsnitt og akseforhold blandes sammen.",
        "^ brukes som potens i stedet for **.",
        "En pen graf leveres uten forklaring eller vurdering.",
      ],
      assess:
        "Eleven kan forklare funksjonsregelen, velge og begrunne utsnitt og målestokk, navngi aksene presist og tolke et relevant punkt på grafen.",
      extension:
        "Tegn to modeller i samme koordinatsystem, finn skjæringspunktet og vurder i hvilket område hver modell er mest fordelaktig.",
    },
  },
  {
    id: 10,
    title: "Lister og datafiler",
    shortTitle: "Lister og datafiler",
    eyebrow: "Fra mange verdier til nyttig informasjon",
    question: "Hvordan kan én variabel holde mange verdier – og hvordan henter vi listene fra .txt- og .csv-filer?",
    intro:
      "Lister lar et program huske mange verdier i riktig rekkefølge. Det gjør det mulig å undersøke målinger, navn, poeng eller koordinater uten å lage én variabel for hver verdi. I denne modulen bygger vi listene selv, endrer dem og leser ekte datafiler som blir værende lokalt på maskinen.",
    refresh: {
      title: "En liste er en samling med rekkefølge",
      body: "En vanlig variabel peker på én verdi. En liste samler mange verdier under ett navn. Hver plass har et indeksnummer. Python begynner å telle plassene på 0, selv om vi mennesker vanligvis kaller den første plassen nummer 1.",
      examples: [
        { code: "temperatur = 12", explanation: "Én variabel med én verdi." },
        { code: "temperaturer = [12, 14, 11, 15]", explanation: "Én variabel med fire verdier i en bestemt rekkefølge." },
        { code: "temperaturer[0]", explanation: "Henter den første verdien, altså 12." },
      ],
    },
    theory: [
      {
        title: "Indeksen forteller hvilken plass vi vil bruke",
        body: "Hakeparentesene etter listen betyr «hent denne plassen». Den første plassen har indeks 0, den andre har indeks 1, og den siste kan hentes med -1. Verdien og indeksen er ikke det samme: I listen [12, 14, 11] er verdien 14 på indeks 1.",
        code: "tall = [12, 14, 11]\nprint(tall[0])\nprint(tall[-1])",
        steps: ["Python lager listen og bevarer rekkefølgen.", "tall[0] går til første plass og henter 12.", "tall[-1] teller bakfra og henter 11.", "len(tall) gir antall verdier, her 3."],
        reflection: "Hva tror du tall[1] og tall[len(tall) - 1] gir? Hvorfor peker det siste uttrykket på siste plass?",
        why: "Når vi kan peke på én bestemt plass, kan vi sammenligne naboer, finne en tilhørende verdi i en annen liste eller endre bare én del av datasettet.",
      },
      {
        title: "Listen kan vokse, endres og undersøkes",
        body: "append legger én ny verdi bakerst. remove leter etter en bestemt verdi og fjerner den første forekomsten. pop bruker et indeksnummer og returnerer verdien som ble fjernet. Funksjonene len, sum, min og max gir informasjon om hele listen med korte, lesbare uttrykk.",
        code: "poeng = [4, 7, 9]\npoeng.append(10)\npoeng[0] = 5\nprint(sum(poeng) / len(poeng))",
        steps: ["Listen starter med tre verdier.", "append gjør listen én plass lengre.", "poeng[0] = 5 erstatter verdien på første plass.", "sum delt på len gir gjennomsnittet når listen ikke er tom."],
        reflection: "Hvorfor må vi dele summen på antallet verdier? Hva skjer hvis listen er tom?",
        why: "Lister gjør at samme kode virker for tre, tretti eller tre tusen verdier. Programmet trenger ikke vite antallet på forhånd.",
      },
      {
        title: "En datafil inneholder tekst som må tolkes",
        body: "Både .txt og .csv er tekstfiler. Når Python leser tegnene 12.5 fra en fil, er verdien først teksten \"12.5\". float gjør teksten om til et desimaltall. En CSV-fil har i tillegg rader, kolonner og et skilletegn. Norske regneark bruker ofte semikolon fordi komma brukes som desimaltegn.",
        code: "tekst = \"12.5\"\ntall = float(tekst)\nprint(tall + 1)",
        steps: ["Filvelgeren gjør filen tilgjengelig lokalt med det viste navnet.", "open åpner filen, og with sørger for at den lukkes etterpå.", "strip fjerner linjeskift rundt hver tekstlinje.", "int eller float brukes bare når teksten faktisk skal behandles som et tall."],
        reflection: "Hvorfor gir \"12.5\" + 1 en feil, mens float(\"12.5\") + 1 gir 13.5?",
        why: "Python gjetter ikke om tekst skal være navn, dato, kategori eller tall. Den tydelige omgjøringen gjør databehandlingen tryggere og lettere å kontrollere.",
      },
    ],
    progression: {
      intro: "Start med en liten liste skrevet i koden. Bruk deretter løkke og listeverktøy før de samme ideene flyttes over til eksterne tekst- og CSV-filer.",
      steps: [
        {
          label: "Lag listen",
          title: "Samle og hent verdier",
          body: "Skriv verdiene mellom hakeparenteser. Bruk indeks når du trenger én bestemt plass.",
          code: `temperaturer = [12, 14, 11, 15]

print("Hele listen:", temperaturer)
print("Første måling:", temperaturer[0])
print("Siste måling:", temperaturer[-1])`,
          tryThis: "Legg til en femte verdi med append. Hva blir len(temperaturer) før og etter?",
        },
        {
          label: "Undersøk listen",
          title: "Bruk funksjoner og løkke",
          body: "Listefunksjonene gir et raskt sammendrag. En løkke lar deg undersøke hver verdi og velge dem som oppfyller et vilkår.",
          code: `temperaturer = [12, 14, 11, 15]
gjennomsnitt = sum(temperaturer) / len(temperaturer)

print("Gjennomsnitt:", gjennomsnitt)

for temperatur in temperaturer:
    if temperatur > gjennomsnitt:
        print("Over gjennomsnittet:", temperatur)`,
          tryThis: "Tell hvor mange verdier som ligger under gjennomsnittet. Start en teller på 0 og bruk += 1.",
        },
        {
          label: "Les .txt",
          title: "Én linje blir én verdi",
          body: "Trykk «Bruk eksempel .txt» ved editoren. Koden går gjennom filen linje for linje, fjerner linjeskift og bygger en liste.",
          code: `temperaturer = []

with open("temperaturer.txt", encoding="utf-8") as fil:
    for linje in fil:
        tekst = linje.strip()
        if tekst:
            temperaturer.append(float(tekst.replace(",", ".")))

print("Fra fil:", temperaturer)
print("Lavest:", min(temperaturer))
print("Høyest:", max(temperaturer))`,
          tryThis: "Lag eller velg en egen .txt-fil med én verdi per linje. Bytt bare filnavnet og kjør igjen.",
          upgrade: {
            title: "Kortere senere: list comprehension",
            body: "Når arbeidsmåten er forstått, kan en enkel fil gjøres om til en liste på én linje. Den lange versjonen er ofte lettere å feilsøke i starten.",
            code: `with open("temperaturer.txt", encoding="utf-8") as fil:
    temperaturer = [float(linje.strip().replace(",", ".")) for linje in fil if linje.strip()]`,
          },
        },
        {
          label: "Les .csv",
          title: "Bruk overskriftene som navn",
          body: "Trykk «Bruk eksempel .csv». DictReader leser første rad som kolonnenavn, og hver senere rad blir en liten ordbok.",
          code: `import csv

dager = []
temperaturer = []

with open("maalinger.csv", encoding="utf-8-sig", newline="") as fil:
    leser = csv.DictReader(fil, delimiter=";")
    for rad in leser:
        dager.append(rad["dag"])
        temperaturer.append(float(rad["temperatur"]))

print("Dager:", dager)
print("Temperaturer:", temperaturer)`,
          tryThis: "Skriv ut dag og temperatur sammen i en løkke. Hva må endres hvis filen bruker komma mellom kolonnene?",
          upgrade: {
            title: "Kortere senere: pandas",
            body: "pandas er praktisk for større tabeller. sep forteller hvilket tegn som skiller kolonnene.",
            code: `import pandas as pd

tabell = pd.read_csv("maalinger.csv", sep=";")
print(tabell.to_string(index=False))
print("Gjennomsnitt:", tabell["temperatur"].mean())`,
          },
        },
      ],
    },
    starterCode: `# 1. Trykk «Bruk eksempel .txt» ved editoren.
# 2. Kjør koden og undersøk listen.

temperaturer = []

with open("temperaturer.txt", encoding="utf-8") as fil:
    for linje in fil:
        tekst = linje.strip()
        if tekst:
            temperaturer.append(float(tekst.replace(",", ".")))

gjennomsnitt = sum(temperaturer) / len(temperaturer)

print("Temperaturer:", temperaturer)
print("Gjennomsnitt:", round(gjennomsnitt, 1))`,
    typingSteps: [
      { kind: "write", code: "temperaturer = []", explanation: "Dette lager en tom liste. Den er en beholder vi skal fylle med verdier fra filen.", think: "Hvorfor starter vi med en tom liste i stedet for tallet 0?", breakdown: ["Hver linje skal bli en egen verdi.", "Vi vet kanskje ikke på forhånd hvor mange linjer filen har.", "append kan utvide en liste én verdi om gangen."], why: "Datamengden kan endres uten at programmet må skrives om." },
      { kind: "write", code: "with open(\"temperaturer.txt\", encoding=\"utf-8\") as fil:", explanation: "Filnavnet må være identisk med navnet ved editoren. with lukker filen automatisk når den innrykkede blokken er ferdig." },
      { kind: "write", code: "    for linje in fil:", explanation: "Løkken gir linje én tekstlinje om gangen. Den har innrykk fordi den hører til while filen er åpen.", think: "Hva vil linje inneholde i første runde?", breakdown: ["Python begynner øverst i filen.", "Linjeskiftet følger vanligvis med.", "Neste runde henter neste linje."], why: "Løkken virker uansett om filen har fem eller fem tusen linjer." },
      { kind: "write", code: "        tekst = linje.strip()", explanation: "strip fjerner linjeskiftet og tomrom rundt verdien. To innrykk viser at linjen hører til både with og for." },
      { kind: "write", code: "        if tekst:\n            temperaturer.append(float(tekst.replace(\",\", \".\")))", explanation: "Tomme linjer hoppes over. Desimalkomma endres til punktum før float lager et tall.", think: "Hvorfor kan vi ikke legge teksten rett inn hvis vi senere skal bruke sum?", breakdown: ["open leser tegn, altså tekst.", "sum trenger tall.", "float gjør både 12 og 12.5 til desimaltall."], why: "Tydelig datavask hindrer at linjeskift, tomme rader eller desimalkomma ødelegger beregningen." },
      { kind: "write", code: "gjennomsnitt = sum(temperaturer) / len(temperaturer)", explanation: "sum legger sammen tallene. len forteller hvor mange målinger vi deler på." },
      { kind: "write", code: "print(\"Gjennomsnitt:\", round(gjennomsnitt, 1))", explanation: "round gjør svaret lettere å lese ved å vise én desimal." },
    ],
    polish: {
      title: "Koble sammen to lister med samme indeks",
      body: "I CSV-eksemplet hører hver dag sammen med temperaturen på samme plass. enumerate gir både indeks og verdi, slik at vi kan hente den tilhørende dagen.",
      before: "for temperatur in temperaturer:\n    print(temperatur)",
      after: `for indeks, temperatur in enumerate(temperaturer):
    print(dager[indeks], "hadde", temperatur, "grader")`,
      explanation: "Når indeks er 0, brukes både dager[0] og temperaturer[0]. Slik beholdes koblingen mellom kolonnene.",
    },
    observe: [
      "Hvilken datatype har en linje rett etter at den er lest fra filen?",
      "Hvorfor bruker Python indeks 0 for den første verdien?",
      "Hva er forskjellen på append, remove og pop?",
      "Hvilket skilletegn bruker CSV-filen, og stemmer det med delimiter i koden?",
      "Hvordan kontrollerer du at antallet og noen av verdiene ble lest riktig før du regner videre?",
    ],
    task:
      "Bruk eksempel-filen maalinger.csv eller en egen anonym CSV-fil. Lag listene dager og temperaturer, regn ut gjennomsnittet og skriv hvilken dag som var varmest. Forklar hvorfor de to listene må ha samme rekkefølge.",
    taskHint: "Finn max(temperaturer). Bruk temperaturer.index(...) for å finne plassen, og hent dagen fra dager med den samme indeksen.",
    expected: ["gjennomsnitt", "varmest"],
    teacher: {
      purpose:
        "La elevene gå fra konkrete lister til enkel, etterprøvbar databehandling med lokale filer, samtidig som de øver på typer, løkker, vilkår og representasjon.",
      before: [
        "Vis en fysisk rad med lapper og nummerer plassene 0, 1, 2 og 3.",
        "Åpne eksempelfilene som vanlig tekst før de leses med Python.",
        "La elevene forutsi datatype og innhold etter hver linje i fil-løkken.",
      ],
      misconceptions: [
        "Første verdi forventes på indeks 1 i stedet for 0.",
        "Tall fra filer oppfattes som tall allerede før int eller float brukes.",
        "Filnavn, store bokstaver eller skilletegn stemmer ikke med koden.",
        "To parallelle lister sorteres hver for seg og mister koblingen mellom radene.",
        "Eleven regner før det er kontrollert at listen faktisk inneholder verdier.",
      ],
      assess:
        "Eleven kan forklare indeks, bygge og endre en liste, lese minst ett filformat, konvertere talltekst og kontrollere resultatet før videre beregning.",
      extension:
        "La elevene rense manglende verdier, tegne målingene som graf eller sammenligne den grunnleggende csv-løsningen med pandas.",
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

const pygameStarterCode = `import pygame
import asyncio

pygame.init()
bredde = 800
hoyde = 500
skjerm = pygame.display.set_mode((bredde, hoyde))
pygame.display.set_caption("Mitt første Pygame-spill")

spiller = pygame.Rect(bredde // 2 - 25, hoyde // 2 - 25, 50, 50)
fart = 5
klokke = pygame.time.Clock()

async def spill():
    kjorer = True
    while kjorer:
        for hendelse in pygame.event.get():
            if hendelse.type == pygame.QUIT:
                kjorer = False

        taster = pygame.key.get_pressed()
        if taster[pygame.K_LEFT]:
            x_flytt = -fart
        elif taster[pygame.K_RIGHT]:
            x_flytt = fart
        else:
            x_flytt = 0

        spiller.x += x_flytt

        skjerm.fill((244, 241, 233))
        pygame.draw.rect(skjerm, (240, 111, 81), spiller, border_radius=8)
        pygame.display.flip()
        klokke.tick(60)
        await asyncio.sleep(0)

    pygame.quit()

await spill()`;

const exampleDataFiles: Record<"txt" | "csv", PythonDataFile> = {
  txt: {
    name: "temperaturer.txt",
    content: "12\n14\n11\n15\n13\n",
    size: 15,
  },
  csv: {
    name: "maalinger.csv",
    content: "dag;temperatur\nmandag;12\ntirsdag;14\nonsdag;11\ntorsdag;15\nfredag;13\n",
    size: 76,
  },
};

const firstProject: LocalProject = {
  id: "mitt-forste-prosjekt",
  name: "Nytt program",
  code: playgroundCode,
  updatedAt: new Date(0).toISOString(),
};

function projectMainFile(project: LocalProject): ProjectFile {
  return {
    id: `${project.id}-main`,
    name: `${safeProjectName(project.name)}.py`,
    code: project.code ?? "",
  };
}

function normalizeProject(project: LocalProject): LocalProject {
  const files = project.files?.length
    ? project.files.map((file) => ({ ...file, name: file.name.toLowerCase().endsWith(".py") ? file.name : `${file.name}.py` }))
    : [projectMainFile(project)];
  const activeFileId = files.some((file) => file.id === project.activeFileId) ? project.activeFileId : files[0].id;
  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];
  return { ...project, code: activeFile.code, files, activeFileId };
}

function activeProjectFile(project: LocalProject) {
  const normalized = normalizeProject(project);
  return normalized.files?.find((file) => file.id === normalized.activeFileId) ?? normalized.files?.[0] ?? projectMainFile(project);
}

function updateActiveProjectFile(project: LocalProject, nextCode: string): LocalProject {
  const normalized = normalizeProject(project);
  const files = normalized.files!.map((file) => file.id === normalized.activeFileId ? { ...file, code: nextCode } : file);
  return { ...normalized, code: nextCode, files, updatedAt: new Date().toISOString() };
}

function safeProjectName(name: string) {
  return name.trim().replace(/[\\/:*?"<>|]+/g, "-") || "python-prosjekt";
}

function analyzePythonError(rawError: string, source: string): ErrorCoach {
  const technical = rawError.trim() || "Python stoppet uten en teknisk feilmelding.";
  const lines = source.split("\n");
  const userLineMatches = [...technical.matchAll(/File ["']<(?:exec|string)>["'], line (\d+)/g)];
  const syntaxLineMatch = technical.match(/line (\d+)[\s\S]*?(?:SyntaxError|IndentationError|TabError)/);
  const parsedLine = Number(userLineMatches.at(-1)?.[1] ?? syntaxLineMatch?.[1] ?? 0);
  const lineNumber = parsedLine >= 1 && parsedLine <= lines.length ? parsedLine : undefined;
  const codeLine = lineNumber ? lines[lineNumber - 1] : undefined;
  const lineLabel = lineNumber ? `linje ${lineNumber}` : "koden";
  const trimmedLine = codeLine?.trim() ?? "";
  const blockHeader = /^\s*(?:if|elif|else|for|while|def|class|try|except|finally|with)\b/;
  const semicolonHeader = blockHeader.test(codeLine ?? "") && /;\s*(?:#.*)?$/.test(codeLine ?? "");
  const missingColon = blockHeader.test(codeLine ?? "") && !/:\s*(?:#.*)?$/.test(codeLine ?? "");
  const errorName = technical.match(/\b(SyntaxError|IndentationError|TabError|NameError|TypeError|IndexError|ValueError|ZeroDivisionError|ModuleNotFoundError):\s*([^\n]*)/);
  const detail = errorName?.[2]?.trim() ?? "";

  if (semicolonHeader) {
    return {
      kind: "syntax",
      title: "Et lite tegn står i veien",
      summary: `Python stoppet ved ${lineLabel}. Linjen ser ut som starten på en kodeblokk, men avslutningstegnet passer ikke med Python-reglene.`,
      lineNumber,
      codeLine,
      questions: [
        "Starter linjen med if, for, while eller def?",
        "Hvilket tegn bruker eksemplene i modulene rett før en innrykket blokk?",
        "Er det et semikolon der du forventet dette tegnet?",
      ],
      hint: "I Python åpnes en blokk med kolon (:). Sammenlign det siste tegnet på linjen med et fungerende if- eller for-eksempel.",
      technical,
    };
  }

  if (/SyntaxError/.test(technical) && (missingColon || /expected ['\"]?:['\"]?/i.test(detail))) {
    return {
      kind: "syntax",
      title: "Python venter på et kolon",
      summary: `Se nøye på slutten av ${lineLabel}. Python tror linjen skal starte en innrykket kodeblokk.`,
      lineNumber,
      codeLine,
      questions: [
        "Er dette en if-, elif-, else-, for-, while- eller def-linje?",
        "Skal de neste linjene ha innrykk og høre til denne linjen?",
        "Hvilket tegn mangler helt til slutt?",
      ],
      hint: "En linje som starter en innrykket blokk, avsluttes med kolon (:). Du må selv plassere tegnet på riktig sted.",
      technical,
    };
  }

  if (/unterminated string|EOL while scanning|string literal/i.test(technical)) {
    return {
      kind: "syntax",
      title: "Python finner ikke slutten på teksten",
      summary: `På ${lineLabel} ser en tekst ut til å begynne uten å bli avsluttet på samme måte.`,
      lineNumber,
      codeLine,
      questions: [
        "Hvor begynner teksten med et anførselstegn?",
        "Finnes det et tilsvarende anførselstegn etter siste bokstav?",
        "Er samme type tegn brukt på begge sider – ' eller \"?",
      ],
      hint: "Tekst må ha et par anførselstegn. Tell tegnene på linjen og kontroller at det finnes en tydelig start og slutt.",
      technical,
    };
  }

  if (/was never closed|unmatched ['\")\]}]|closing parenthesis|does not match opening/i.test(technical)) {
    return {
      kind: "syntax",
      title: "Et tegn mangler partneren sin",
      summary: `Python tror en parentes, hakeparentes eller krøllparentes rundt ${lineLabel} ikke er lukket riktig.`,
      lineNumber,
      codeLine,
      questions: [
        "Kan du peke på hvert åpningstegn: (, [ eller {?",
        "Har hvert åpningstegn et lukketegn av samme type?",
        "Er tegnene lukket i motsatt rekkefølge av den de ble åpnet i?",
      ],
      hint: "Tell åpne og lukkede tegn. Parene er (), [] og {}. Begynn på den markerte linjen og se også på linjen rett over.",
      technical,
    };
  }

  if (/IndentationError|TabError/.test(technical)) {
    const expectedBlock = /expected an indented block/i.test(technical);
    return {
      kind: "indent",
      title: expectedBlock ? "Python venter på innrykk" : "Innrykket følger ikke mønsteret",
      summary: expectedBlock
        ? `Python fant ikke en innrykket handling ved ${lineLabel}.`
        : `Ved ${lineLabel} er det sannsynligvis for mange, for få eller ulike typer innrykk.`,
      lineNumber,
      codeLine,
      questions: [
        "Hvilken if-, for-, while- eller def-linje skal denne linjen høre til?",
        "Har alle linjene i samme blokk like mange mellomrom?",
        "Kan Tab-knappen i editoren brukes til å lage fire mellomrom?",
      ],
      hint: expectedBlock
        ? "Linjen etter kolon må vanligvis rykkes inn ett nivå. Bruk Tab én gang i editoren."
        : "Marker linjene som skal høre sammen, og sammenlign hvor teksten begynner. Bruk Tab eller Shift+Tab for ett helt nivå.",
      technical,
    };
  }

  if (/SyntaxError/.test(technical)) {
    const assignmentInCondition = /^\s*(?:if|elif|while)\b/.test(codeLine ?? "") && /(?<![<>=!])=(?!=)/.test(codeLine ?? "");
    return {
      kind: "syntax",
      title: "Python forstår ikke skrivemåten ennå",
      summary: `Python peker mot ${lineLabel}${trimmedLine ? ", men årsaken kan også stå like før stedet den peker på" : ""}.`,
      lineNumber,
      codeLine,
      questions: assignmentInCondition
        ? ["Prøver linjen å sammenligne to verdier?", "Hvor mange likhetstegn brukes når Python skal spørre «er lik»?", "Er kolon plassert helt til slutt?"]
        : ["Er kolon, komma og anførselstegn på riktig plass?", "Har alle parenteser en partner?", "Ser linjen rett over ferdig ut?"],
      hint: assignmentInCondition
        ? "Ett likhetstegn gir en variabel en verdi. To likhetstegn sammenligner verdier. Finn selv hvilket av dem denne linjen trenger."
        : "Les den markerte linjen tegn for tegn og sammenlign med nærmeste fungerende eksempel. Python markerer ofte stedet der den ga opp, ikke nødvendigvis det første gale tegnet.",
      technical,
    };
  }

  if (/FileNotFoundError/.test(technical)) {
    const missingFile = technical.match(/No such file or directory: ['"]([^'"]+)['"]/)?.[1];
    return {
      kind: "file",
      title: "Python finner ikke datafilen",
      summary: missingFile
        ? `Programmet prøver å åpne «${missingFile}», men denne filen er ikke lagt til med nøyaktig samme navn.`
        : "Programmet prøver å åpne en fil som ikke finnes i Python-miljøet ennå.",
      lineNumber,
      codeLine,
      questions: [
        "Vises filen i Datafiler-feltet over editoren?",
        "Er filnavnet i open skrevet helt likt, også punktum, mellomrom og store bokstaver?",
        "Har du valgt riktig .txt- eller .csv-fil etter at siden ble lastet på nytt?",
      ],
      hint: missingFile
        ? `Legg til filen, og sammenlign navnet ved editoren med «${missingFile}» tegn for tegn. Filen sendes ikke til en server.`
        : "Trykk «Legg til .txt eller .csv», og bruk filnavnet som vises ved editoren i open eller read_csv.",
      technical,
    };
  }

  if (/KeyError/.test(technical)) {
    const missingKey = technical.match(/KeyError:\s*['"]([^'"]+)['"]/)?.[1];
    return {
      kind: "data",
      title: "Python finner ikke kolonnenavnet",
      summary: missingKey
        ? `Koden spør etter kolonnen «${missingKey}», men CSV-leseren finner ikke en overskrift med nøyaktig dette navnet.`
        : "Koden spør etter et navn som ikke finnes i raden eller ordboken.",
      lineNumber,
      codeLine,
      questions: [
        "Hva står det i den aller første raden i CSV-filen?",
        "Er store bokstaver, mellomrom og norske tegn skrevet helt likt i rad[...]?",
        "Ble riktig skilletegn valgt, eller ligger hele overskriftsraden i én kolonne?",
      ],
      hint: "Skriv midlertidig print(leser.fieldnames) rett etter DictReader-linjen. Da ser du navnene Python faktisk har lest, men du må selv velge riktig navn eller delimiter.",
      technical,
    };
  }

  if (/ValueError:[^\n]*could not convert string to float/i.test(technical)) {
    const badValue = technical.match(/could not convert string to float:\s*['"]([^'"]*)['"]/)?.[1];
    return {
      kind: "data",
      title: "En tekstverdi kan ikke gjøres om til tall",
      summary: badValue
        ? `float prøver å gjøre «${badValue}» om til et tall, men teksten har et tegn eller en form Python ikke forstår.`
        : "float har fått tekst som ikke kan tolkes som et tall.",
      lineNumber,
      codeLine,
      questions: [
        "Er dette en overskrift, en tom celle eller en manglende verdi?",
        "Bruker tallet desimalkomma som må erstattes med punktum?",
        "Kan du skrive ut teksten rett før float-linjen for å se hva som faktisk ble lest?",
      ],
      hint: "Undersøk verdien med print(repr(tekst)). Bruk strip for tomrom og replace(\",\", \".\") for desimalkomma, men ikke slett data uten å forstå hva raden betyr.",
      technical,
    };
  }

  if (/NameError/.test(technical)) {
    const unknownName = detail.match(/name ['\"]([^'\"]+)['\"] is not defined/)?.[1];
    return {
      kind: "name",
      title: "Python kjenner ikke igjen et navn",
      summary: unknownName
        ? `Navnet «${unknownName}» brukes ved ${lineLabel}, men Python har ikke sett en verdi eller definisjon med nøyaktig samme navn.`
        : `Et navn ved ${lineLabel} er ikke definert før det brukes.`,
      lineNumber,
      codeLine,
      questions: [
        "Er navnet skrevet helt likt hver gang, også store og små bokstaver?",
        "Blir variabelen eller funksjonen laget før denne linjen kjøres?",
        "Mangler det en import øverst i programmet?",
      ],
      hint: unknownName ? `Søk etter «${unknownName}» i koden. Sammenlign bokstav for bokstav med stedet der navnet skulle bli opprettet.` : "Finn første gang navnet brukes, og let etter en tidligere linje som gir det en verdi.",
      technical,
    };
  }

  if (/TypeError/.test(technical)) {
    return {
      kind: "type",
      title: "Verdiene passer ikke til denne handlingen",
      summary: `Programmet kom fram til ${lineLabel}, men verdiene der kan være av ulike typer – for eksempel tekst og tall.`,
      lineNumber,
      codeLine,
      questions: [
        "Hvilke verdier brukes på linjen, og er de tekst, heltall eller desimaltall?",
        "Prøver koden å legge sammen tekst og tall direkte?",
        "Kan print med komma brukes dersom målet bare er å vise verdiene?",
      ],
      hint: "Skriv eventuelt print(type(verdi)) rett før linjen for å undersøke typen. Endre deretter bare det som ikke passer til handlingen.",
      technical,
    };
  }

  return {
    kind: "runtime",
    title: "Programmet kom i gang, men stoppet underveis",
    summary: lineNumber ? `Python stoppet ved linje ${lineNumber}. Undersøk verdiene på denne linjen og linjene som førte fram til den.` : "Python stoppet under kjøring. Del problemet opp og undersøk én verdi om gangen.",
    lineNumber,
    codeLine,
    questions: [
      "Hva var den siste linjen som virket?",
      "Hvilke verdier har variablene rett før programmet stopper?",
      "Kan du legge inn en midlertidig print-linje for å undersøke dem?",
    ],
    hint: "Kjør en mindre del av programmet, eller legg inn print rett før stedet som stopper. Målet er først å finne hvilken verdi som ikke er som forventet.",
    technical,
  };
}

type PythonLibraryDefinition = {
  label: string;
  availability: "standard" | "offline" | "local";
  highlightedNames: string[];
};

type PythonImportStatus = {
  module: string;
  label: string;
  alias?: string;
  available: boolean;
  availability?: PythonLibraryDefinition["availability"];
};

const pythonLibraryCatalog: Record<string, PythonLibraryDefinition> = {
  math: { label: "math", availability: "standard", highlightedNames: ["math"] },
  statistics: { label: "statistics", availability: "standard", highlightedNames: ["statistics"] },
  fractions: { label: "fractions", availability: "standard", highlightedNames: ["fractions", "Fraction"] },
  decimal: { label: "decimal", availability: "standard", highlightedNames: ["decimal", "Decimal"] },
  random: { label: "random", availability: "standard", highlightedNames: ["random"] },
  csv: { label: "csv", availability: "standard", highlightedNames: ["csv"] },
  collections: { label: "collections", availability: "standard", highlightedNames: ["collections", "Counter"] },
  itertools: { label: "itertools", availability: "standard", highlightedNames: ["itertools"] },
  datetime: { label: "datetime", availability: "standard", highlightedNames: ["datetime", "date", "timedelta"] },
  json: { label: "json", availability: "standard", highlightedNames: ["json"] },
  re: { label: "re", availability: "standard", highlightedNames: ["re"] },
  time: { label: "time", availability: "standard", highlightedNames: ["time"] },
  pathlib: { label: "pathlib", availability: "standard", highlightedNames: ["pathlib", "Path"] },
  os: { label: "os", availability: "standard", highlightedNames: ["os"] },
  sys: { label: "sys", availability: "standard", highlightedNames: ["sys"] },
  string: { label: "string", availability: "standard", highlightedNames: ["string"] },
  textwrap: { label: "textwrap", availability: "standard", highlightedNames: ["textwrap"] },
  copy: { label: "copy", availability: "standard", highlightedNames: ["copy"] },
  functools: { label: "functools", availability: "standard", highlightedNames: ["functools"] },
  operator: { label: "operator", availability: "standard", highlightedNames: ["operator"] },
  bisect: { label: "bisect", availability: "standard", highlightedNames: ["bisect"] },
  heapq: { label: "heapq", availability: "standard", highlightedNames: ["heapq"] },
  array: { label: "array", availability: "standard", highlightedNames: ["array"] },
  enum: { label: "enum", availability: "standard", highlightedNames: ["enum"] },
  typing: { label: "typing", availability: "standard", highlightedNames: ["typing"] },
  unicodedata: { label: "unicodedata", availability: "standard", highlightedNames: ["unicodedata"] },
  numpy: { label: "NumPy", availability: "offline", highlightedNames: ["numpy", "np"] },
  pandas: { label: "pandas", availability: "offline", highlightedNames: ["pandas", "pd"] },
  matplotlib: { label: "Matplotlib", availability: "offline", highlightedNames: ["matplotlib", "pyplot", "plt"] },
  scipy: { label: "SciPy", availability: "offline", highlightedNames: ["scipy", "stats"] },
  sympy: { label: "SymPy", availability: "offline", highlightedNames: ["sympy", "sp"] },
  sklearn: { label: "scikit-learn", availability: "offline", highlightedNames: ["sklearn", "LinearRegression"] },
  PIL: { label: "Pillow", availability: "offline", highlightedNames: ["PIL", "Image", "ImageDraw"] },
  networkx: { label: "NetworkX", availability: "offline", highlightedNames: ["networkx", "nx"] },
  shapely: { label: "Shapely", availability: "offline", highlightedNames: ["shapely", "Polygon"] },
  pygame: { label: "Pygame", availability: "offline", highlightedNames: ["pygame"] },
  turtle: { label: "Turtle", availability: "local", highlightedNames: ["turtle"] },
  spill: { label: "Spill", availability: "local", highlightedNames: ["spill", "Snake"] },
};

const pythonLibraryNames = new Set(Object.values(pythonLibraryCatalog).flatMap((library) => library.highlightedNames));

function analyzePythonImports(source: string): PythonImportStatus[] {
  const imports: PythonImportStatus[] = [];
  const seen = new Set<string>();
  const addImport = (module: string, alias?: string) => {
    const root = module.split(".")[0];
    const definition = pythonLibraryCatalog[root];
    const key = `${module}:${alias ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    imports.push({
      module,
      alias,
      label: definition?.label ?? module,
      available: Boolean(definition),
      availability: definition?.availability,
    });
  };

  for (const line of source.split("\n")) {
    const code = line.replace(/#.*$/, "").trim();
    const fromMatch = code.match(/^from\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s+import\s+/);
    if (fromMatch) {
      addImport(fromMatch[1]);
      continue;
    }
    const importMatch = code.match(/^import\s+(.+)$/);
    if (!importMatch) continue;
    for (const part of importMatch[1].split(",")) {
      const moduleMatch = part.trim().match(/^([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)(?:\s+as\s+([A-Za-z_]\w*))?$/);
      if (moduleMatch) addImport(moduleMatch[1], moduleMatch[2]);
    }
  }
  return imports;
}

const pythonTokens = /(#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:False|None|True|and|as|break|class|continue|def|elif|else|for|from|if|import|in|is|not|or|pass|return|while)\b|\b(?:abs|float|int|len|max|min|print|range|round|str|sum)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;

function colorPython(source: string, importedAliases = new Set<string>()): ReactNode[] {
  return source.split(pythonTokens).map((token, index) => {
    let kind = "plain";
    if (token.startsWith("#")) kind = "comment";
    else if (token.startsWith('"') || token.startsWith("'")) kind = "string";
    else if (/^(?:False|None|True|and|as|break|class|continue|def|elif|else|for|from|if|import|in|is|not|or|pass|return|while)$/.test(token)) kind = "keyword";
    else if (/^(?:abs|float|int|len|max|min|print|range|round|str|sum)$/.test(token)) kind = "builtin";
    else if (pythonLibraryNames.has(token) || importedAliases.has(token)) kind = "library";
    else if (/^\d+(?:\.\d+)?$/.test(token)) kind = "number";
    return <span className={`py-${kind}`} key={`${index}-${token}`}>{token}</span>;
  });
}

function colorPythonLines(source: string, errorLine?: number) {
  const importedAliases = new Set(analyzePythonImports(source).flatMap((status) => status.available && status.alias ? [status.alias] : []));
  return source.split("\n").map((line, lineIndex) => {
    const leadingSpaces = line.match(/^ */)?.[0].length ?? 0;
    const indentLevels = Math.floor(leadingSpaces / 4);
    return (
      <span className={`syntax-line ${errorLine === lineIndex + 1 ? "is-error-line" : ""}`} key={`${lineIndex}-${line}`}>
        <span className="indent-guide-layer" aria-hidden="true">
          {Array.from({ length: indentLevels }, (_, level) => (
            <i key={level} style={{ left: `${(level + 1) * 4}ch` }} />
          ))}
        </span>
        {colorPython(line, importedAliases)}
      </span>
    );
  });
}

type EditorDiagnostic = {
  kind: "tip" | "warning";
  message: string;
  fixLabel?: string;
  find?: string;
  fixPattern?: RegExp;
  replacement?: string;
};

function pythonRangePreview(line: string) {
  const match = line.match(/\brange\(\s*(-?\d+)\s*(?:,\s*(-?\d+)\s*)?(?:,\s*(-?\d+)\s*)?\)/);
  if (!match) return "";
  const first = Number(match[1]);
  const second = match[2] === undefined ? undefined : Number(match[2]);
  const third = match[3] === undefined ? undefined : Number(match[3]);
  const start = second === undefined ? 0 : first;
  const stop = second === undefined ? first : second;
  const step = third ?? 1;
  if (step === 0) return "range kan ikke ha 0 som steg.";
  const values: number[] = [];
  for (let number = start; step > 0 ? number < stop : number > stop; number += step) {
    values.push(number);
    if (values.length === 9) break;
  }
  const hasMore = values.length === 9 && (step > 0 ? values[8] + step < stop : values[8] + step > stop);
  const expression = match[0];
  return values.length
    ? `${expression} gir ${values.join(", ")}${hasMore ? ", …" : ""}. Stopptallet ${stop} er ikke med.`
    : `${expression} gir ingen tall. Start, stopp og steg peker ikke mot hverandre.`;
}

function pythonLineDiagnostic(line: string): EditorDiagnostic | null {
  const code = line.replace(/#.*$/, "").trim();
  if (!code) return null;
  if (/[“”‘’]/.test(code)) return {
    kind: "warning",
    message: "Disse anførselstegnene kommer ofte fra et dokument. Python trenger rette anførselstegn.",
    fixLabel: "Bytt til rette tegn",
    find: code.match(/[“”‘’]/)?.[0],
    replacement: /[“”]/.test(code.match(/[“”‘’]/)?.[0] ?? "") ? "\"" : "'",
  };
  if (/^(?:if|elif|while)\b.*(?:&&|\|\|)/.test(code)) {
    const find = code.includes("&&") ? "&&" : "||";
    return {
      kind: "warning",
      message: `Python skriver ${find === "&&" ? "og" : "eller"} med ord: ${find === "&&" ? "and" : "or"}.`,
      fixLabel: `Bytt ${find} til ${find === "&&" ? "and" : "or"}`,
      find,
      replacement: find === "&&" ? "and" : "or",
    };
  }
  if (/^(?:if|elif|while)\b[^#]*(?<![<>=!:])=(?!=)/.test(code)) return {
    kind: "warning",
    message: "I en betingelse gir = en verdi. Når du vil sammenligne to verdier, bruker Python ==.",
    fixLabel: "Bytt = til ==",
    fixPattern: /(?<![<>=!:])=(?!=)/,
    replacement: "==",
  };
  if (/^(?:if|elif|else|for|while|def|class|with|try|except|finally|match|case)\b.*;\s*$/.test(code)) return {
    kind: "warning",
    message: "En linje som starter en løkke eller et kodeblokk avsluttes med kolon (:), ikke semikolon (;).",
    fixLabel: "Bytt ; til :",
    find: ";",
    replacement: ":",
  };
  if (/\d\s*\^\s*\d/.test(code)) return {
    kind: "tip",
    message: "I Python betyr ^ noe annet enn potens. Bruk ** når du vil opphøye et tall.",
    fixLabel: "Bytt ^ til **",
    find: "^",
    replacement: "**",
  };
  if (/\b\d+,\d+\b/.test(code) && !/range\s*\(/.test(code)) return {
    kind: "tip",
    message: "Ser dette ut som et desimaltall? Python bruker punktum: 2.5. Komma lager to separate verdier.",
  };
  return null;
}

function startsPythonBlockWithoutColon(line: string) {
  const code = line.replace(/#.*$/, "").trimEnd();
  return /^(?:if|elif|else|for|while|def|class|with|try|except|finally|match|case)\b/.test(code)
    && !code.endsWith(":")
    && !code.endsWith(";")
    && !/[([{]$/.test(code);
}

type PythonBlockSuggestion = { position: number; indent: string; hasFollowingNewline: boolean };

function findPythonBlockSuggestion(value: string, cursor: number): PythonBlockSuggestion | null {
  const safeCursor = Math.min(cursor, value.length);
  const currentStart = value.lastIndexOf("\n", Math.max(0, safeCursor - 1)) + 1;
  const nextNewline = value.indexOf("\n", safeCursor);
  const currentEnd = nextNewline === -1 ? value.length : nextNewline;
  const currentLine = value.slice(currentStart, currentEnd);
  if (startsPythonBlockWithoutColon(currentLine)) {
    return {
      position: currentEnd,
      indent: currentLine.match(/^\s*/)?.[0] ?? "",
      hasFollowingNewline: value[currentEnd] === "\n",
    };
  }
  if (currentLine.trim() || currentStart === 0) return null;
  const previousEnd = currentStart - 1;
  const previousStart = value.lastIndexOf("\n", Math.max(0, previousEnd - 1)) + 1;
  const previousLine = value.slice(previousStart, previousEnd);
  if (!startsPythonBlockWithoutColon(previousLine)) return null;
  return {
    position: previousEnd,
    indent: previousLine.match(/^\s*/)?.[0] ?? "",
    hasFollowingNewline: true,
  };
}

const pythonPairMap: Record<string, string> = { "(": ")", "[": "]", "{": "}", "\"": "\"", "'": "'" };
const pythonClosingCharacters = new Set(Object.values(pythonPairMap));

type EditorSuggestion = { label: string; insert: string; detail: string; cursorBack?: number };

const editorSuggestions: EditorSuggestion[] = [
  { label: "print", insert: "print()", detail: "Vis tekst eller verdier", cursorBack: 1 },
  { label: "input", insert: "input()", detail: "Spør brukeren om en verdi", cursorBack: 1 },
  { label: "range", insert: "range()", detail: "Lag en tallfølge til en løkke", cursorBack: 1 },
  { label: "len", insert: "len()", detail: "Finn antall elementer", cursorBack: 1 },
  { label: "round", insert: "round(, 2)", detail: "Avrund et tall", cursorBack: 4 },
  { label: "int", insert: "int()", detail: "Gjør tekst om til heltall", cursorBack: 1 },
  { label: "float", insert: "float()", detail: "Gjør tekst om til desimaltall", cursorBack: 1 },
  { label: "str", insert: "str()", detail: "Gjør en verdi om til tekst", cursorBack: 1 },
  { label: "sum", insert: "sum()", detail: "Legg sammen en liste", cursorBack: 1 },
  { label: "min", insert: "min()", detail: "Finn minste verdi", cursorBack: 1 },
  { label: "max", insert: "max()", detail: "Finn største verdi", cursorBack: 1 },
  { label: "for", insert: "for n in range():\n    ", detail: "Gjenta kode flere ganger", cursorBack: 7 },
  { label: "while", insert: "while vilkaar:\n    ", detail: "Gjenta så lenge et vilkår er sant", cursorBack: 5 },
  { label: "if", insert: "if vilkaar:\n    ", detail: "Kjør kode når et vilkår er sant", cursorBack: 5 },
  { label: "else", insert: "else:\n    ", detail: "Alternativet når if ikke er sant" },
  { label: "def", insert: "def funksjon():\n    ", detail: "Lag en funksjon", cursorBack: 8 },
  { label: "return", insert: "return ", detail: "Send en verdi ut av en funksjon" },
  { label: "import", insert: "import ", detail: "Hent et bibliotek" },
  { label: "math", insert: "import math", detail: "Kvadratrot, pi og annen matematikk" },
  { label: "random", insert: "import random", detail: "Tilfeldige tall og valg" },
  { label: "statistics", insert: "import statistics", detail: "Gjennomsnitt, median og typetall" },
  { label: "numpy", insert: "import numpy as np", detail: "Regn med mange tall" },
  { label: "pandas", insert: "import pandas as pd", detail: "Arbeid med tabeller" },
  { label: "matplotlib", insert: "import matplotlib.pyplot as plt", detail: "Tegn grafer" },
  { label: "pygame", insert: "import pygame", detail: "Lag 2D-spill i Pygame-laben" },
];

function suggestionsAtCursor(value: string, cursor: number) {
  const before = value.slice(0, cursor);
  const match = before.match(/[A-Za-z_][A-Za-z_0-9]*$/);
  const word = match?.[0] ?? "";
  if (word.length < 2) return { word: "", start: cursor, suggestions: [] as EditorSuggestion[] };
  const normalized = word.toLowerCase();
  return {
    word,
    start: cursor - word.length,
    suggestions: editorSuggestions.filter((suggestion) => suggestion.label.startsWith(normalized) && suggestion.label !== normalized).slice(0, 5),
  };
}

function pythonPairedEnter(value: string, cursor: number) {
  const opening = value[cursor - 1];
  const closing = value[cursor];
  if (!opening || pythonPairMap[opening] !== closing || opening === "\"" || opening === "'") return null;
  const lineStart = value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  const indent = value.slice(lineStart, cursor).match(/^\s*/)?.[0] ?? "";
  return {
    insertion: `\n${indent}    \n${indent}`,
    nextCursor: cursor + indent.length + 5,
  };
}

function PythonEditor({ id, value, onChange, describedBy, fontSize, tall = false, errorLine, onSelectionChange }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  describedBy: string;
  fontSize: number;
  tall?: boolean;
  errorLine?: number;
  onSelectionChange?: (start: number, end: number, selected: string) => void;
}) {
  const highlightRef = useRef<HTMLPreElement | null>(null);
  const gutterRef = useRef<HTMLPreElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [cursor, setCursor] = useState(0);
  const [pendingBlock, setPendingBlock] = useState<{ position: number; indent: string } | null>(null);

  useEffect(() => {
    if (cursor > value.length) setCursor(value.length);
  }, [cursor, value.length]);

  const lineStart = value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  const lineEndIndex = value.indexOf("\n", cursor);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const currentLine = value.slice(lineStart, lineEnd);
  const lineNumber = value.slice(0, cursor).split("\n").length;
  const columnNumber = cursor - lineStart + 1;
  const rangePreview = pythonRangePreview(currentLine);
  const lineDiagnostic = pythonLineDiagnostic(currentLine);
  const importStatuses = analyzePythonImports(value);
  const suggestionData = suggestionsAtCursor(value, cursor);
  const lineCount = Math.max(1, value.split("\n").length);
  const blockSuggestion = pendingBlock
    ? { ...pendingBlock, hasFollowingNewline: false }
    : findPythonBlockSuggestion(value, cursor);

  function moveCursor(next: number) {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.selectionStart = input.selectionEnd = next;
      setCursor(next);
      onSelectionChange?.(next, next, "");
      input.focus();
    });
  }

  function reportSelection(input: HTMLTextAreaElement) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    setCursor(start);
    onSelectionChange?.(start, end, input.value.slice(start, end));
  }

  function replaceSelection(start: number, end: number, replacement: string, nextCursor = start + replacement.length) {
    onChange(`${value.slice(0, start)}${replacement}${value.slice(end)}`);
    moveCursor(nextCursor);
  }

  function applyLineFix() {
    if (!lineDiagnostic || lineDiagnostic.replacement === undefined) return;
    const matchedText = lineDiagnostic.fixPattern
      ? currentLine.match(lineDiagnostic.fixPattern)?.[0]
      : lineDiagnostic.find;
    if (!matchedText) return;
    const localIndex = lineDiagnostic.fixPattern
      ? currentLine.search(lineDiagnostic.fixPattern)
      : currentLine.indexOf(matchedText);
    if (localIndex === -1) return;
    const start = lineStart + localIndex;
    replaceSelection(start, start + matchedText.length, lineDiagnostic.replacement, cursor + lineDiagnostic.replacement.length - matchedText.length);
  }

  function continueBlock(addColon: boolean) {
    if (!blockSuggestion) return;
    if (blockSuggestion.hasFollowingNewline) {
      if (addColon) replaceSelection(blockSuggestion.position, blockSuggestion.position, ":", cursor >= blockSuggestion.position ? cursor + 1 : cursor);
      setPendingBlock(null);
      return;
    }
    const insertion = `${addColon ? ":" : ""}\n${blockSuggestion.indent}${addColon ? "    " : ""}`;
    replaceSelection(blockSuggestion.position, blockSuggestion.position, insertion);
    setPendingBlock(null);
  }

  function acceptSuggestion(suggestion: EditorSuggestion, liveValue = value, liveCursor = cursor) {
    const match = suggestionsAtCursor(liveValue, liveCursor);
    if (!match.word) return;
    const nextCursor = match.start + suggestion.insert.length - (suggestion.cursorBack ?? 0);
    replaceSelection(match.start, liveCursor, suggestion.insert, nextCursor);
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const input = event.currentTarget;
    const liveValue = input.value;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const replaceLiveSelection = (replacement: string, nextCursor = start + replacement.length, selectionStart = start, selectionEnd = end) => {
      onChange(`${liveValue.slice(0, selectionStart)}${replacement}${liveValue.slice(selectionEnd)}`);
      moveCursor(nextCursor);
    };

    if (event.key === "Escape" && pendingBlock) {
      event.preventDefault();
      setPendingBlock(null);
      return;
    }

    const liveSuggestions = suggestionsAtCursor(liveValue, start);
    if (event.key === "Tab" && !event.shiftKey && start === end && liveSuggestions.suggestions.length) {
      event.preventDefault();
      const suggestion = liveSuggestions.suggestions[0];
      replaceLiveSelection(
        suggestion.insert,
        liveSuggestions.start + suggestion.insert.length - (suggestion.cursorBack ?? 0),
        liveSuggestions.start,
        start,
      );
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && !event.metaKey && !event.ctrlKey && start === end) {
      event.preventDefault();
      const pairedEnter = pythonPairedEnter(liveValue, start);
      if (pairedEnter) {
        replaceLiveSelection(pairedEnter.insertion, pairedEnter.nextCursor);
        setPendingBlock(null);
        return;
      }
      const activeLineStart = liveValue.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const beforeCursor = liveValue.slice(activeLineStart, start);
      const indent = beforeCursor.match(/^\s*/)?.[0] ?? "";
      if (startsPythonBlockWithoutColon(beforeCursor)) {
        setPendingBlock({ position: start, indent });
        return;
      }
      const codeBeforeComment = beforeCursor.replace(/#.*$/, "").trimEnd();
      replaceLiveSelection(`\n${indent}${codeBeforeComment.endsWith(":") ? "    " : ""}`);
      setPendingBlock(null);
      return;
    }

    // På norsk Mac-tastatur skrives både { } og [ ] med Option/Alt.
    // event.key inneholder allerede det ferdige tegnet, så Alt må ikke
    // diskvalifisere et ellers gyldig åpningstegn.
    if (pythonPairMap[event.key] && !event.ctrlKey && !event.metaKey) {
      if ((event.key === "\"" || event.key === "'") && start === end && liveValue[start] === event.key) {
        event.preventDefault();
        moveCursor(start + 1);
        return;
      }
      event.preventDefault();
      const selected = liveValue.slice(start, end);
      replaceLiveSelection(`${event.key}${selected}${pythonPairMap[event.key]}`, start + 1 + selected.length);
      setPendingBlock(null);
      return;
    }
    if (pythonClosingCharacters.has(event.key) && start === end && liveValue[start] === event.key) {
      event.preventDefault();
      moveCursor(start + 1);
      return;
    }
    if (event.key === "Backspace" && start === end && start > 0 && pythonPairMap[liveValue[start - 1]] === liveValue[start]) {
      event.preventDefault();
      replaceLiveSelection("", start - 1, start - 1, start + 1);
      setPendingBlock(null);
      return;
    }

    if (event.key !== "Tab") {
      if (pendingBlock) setPendingBlock(null);
      return;
    }
    event.preventDefault();
    const selectedLineStart = liveValue.lastIndexOf("\n", Math.max(0, start - 1)) + 1;

    if (event.shiftKey) {
      const blockEnd = end > start ? end : liveValue.indexOf("\n", start) === -1 ? liveValue.length : liveValue.indexOf("\n", start);
      const block = liveValue.slice(selectedLineStart, blockEnd);
      let removedBeforeStart = 0;
      let removedTotal = 0;
      const unindented = block.replace(/^(?: {1,4}|\t)/gm, (indent, offset) => {
        if (selectedLineStart + offset < start) removedBeforeStart += indent.length;
        removedTotal += indent.length;
        return "";
      });
      onChange(`${liveValue.slice(0, selectedLineStart)}${unindented}${liveValue.slice(blockEnd)}`);
      requestAnimationFrame(() => {
        input.selectionStart = Math.max(selectedLineStart, start - removedBeforeStart);
        input.selectionEnd = Math.max(selectedLineStart, end - removedTotal);
        setCursor(input.selectionEnd);
      });
      return;
    }

    if (end > start) {
      const blockEnd = liveValue[end - 1] === "\n" ? end - 1 : end;
      const block = liveValue.slice(selectedLineStart, blockEnd);
      const indented = block.replace(/^/gm, "    ");
      const lineCount = (block.match(/^/gm) ?? []).length;
      onChange(`${liveValue.slice(0, selectedLineStart)}${indented}${liveValue.slice(blockEnd)}`);
      requestAnimationFrame(() => {
        input.selectionStart = start + 4;
        input.selectionEnd = end + lineCount * 4;
        setCursor(input.selectionEnd);
      });
      return;
    }

    onChange(`${liveValue.slice(0, start)}    ${liveValue.slice(end)}`);
    requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd = start + 4;
      setCursor(start + 4);
    });
  }
  return (
    <div className={`python-editor ${tall ? "is-tall" : ""}`} style={{ "--editor-font-size": `${fontSize}px` } as CSSProperties}>
      <div className="python-editor-surface">
        <pre className="syntax-gutter" ref={gutterRef} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, index) => (
            <span className={errorLine === index + 1 ? "is-error-line" : ""} key={index + 1}>{index + 1}</span>
          ))}
        </pre>
        <pre className="syntax-layer" ref={highlightRef} aria-hidden="true">{colorPythonLines(`${value}\n`, errorLine)}</pre>
        <textarea
          ref={inputRef}
          id={id}
          className="syntax-input"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            reportSelection(event.target);
            setPendingBlock(null);
          }}
          onKeyDown={handleEditorKeyDown}
          onSelect={(event) => reportSelection(event.currentTarget)}
          onClick={(event) => reportSelection(event.currentTarget)}
          onKeyUp={(event) => reportSelection(event.currentTarget)}
          onScroll={(event) => {
            if (!highlightRef.current) return;
            highlightRef.current.scrollTop = event.currentTarget.scrollTop;
            highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
            if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-describedby={`${describedBy} ${id}-assist`}
        />
      </div>
      {suggestionData.suggestions.length > 0 && (
        <div className="editor-suggestions" aria-label="Forslag mens du skriver">
          <span>Forslag for <code>{suggestionData.word}</code></span>
          {suggestionData.suggestions.map((suggestion) => (
            <button type="button" key={suggestion.label} onMouseDown={(event) => event.preventDefault()} onClick={() => acceptSuggestion(suggestion)}>
              <code>{suggestion.label}</code><small>{suggestion.detail}</small>
            </button>
          ))}
          <small>Trykk Tab for første forslag</small>
        </div>
      )}
      {importStatuses.length > 0 && (
        <div className="editor-library-status" aria-label="Biblioteker i programmet" aria-live="polite">
          {importStatuses.map((status) => (
            <span className={status.available ? "is-available" : "is-unknown"} key={`${status.module}-${status.alias ?? ""}`}>
              <strong aria-hidden="true">{status.available ? "✓" : "?"}</strong>
              {status.available
                ? `${status.label}${status.alias ? ` som ${status.alias}` : ""} er tilgjengelig${status.availability === "offline" || status.availability === "local" ? " offline" : ""}`
                : `${status.module} er ikke bekreftet i offline-pakken`}
            </span>
          ))}
        </div>
      )}
      <div className="editor-assist-bar" id={`${id}-assist`} aria-live="polite">
        <span className="editor-position">Linje {lineNumber}, kolonne {columnNumber}</span>
        {blockSuggestion ? (
          <span className="editor-inline-help is-warning">
            <strong>Mangler det et kolon?</strong> Denne linjen ser ut som starten på en løkke eller et kodeblokk.
            <span>
              <button type="button" onClick={() => continueBlock(true)}>Legg til : og lag innrykk</button>
              <button type="button" onClick={() => continueBlock(false)}>Ny linje uten kolon</button>
            </span>
          </span>
        ) : lineDiagnostic ? (
          <span className={`editor-inline-help is-${lineDiagnostic.kind}`}>
            <strong>{lineDiagnostic.kind === "warning" ? "Sjekk denne linjen:" : "Lite Python-tips:"}</strong> {lineDiagnostic.message}
            {lineDiagnostic.fixLabel && <button type="button" onClick={applyLineFix}>{lineDiagnostic.fixLabel}</button>}
          </span>
        ) : rangePreview ? (
          <span className="editor-inline-help is-range"><strong>Løkken teller slik:</strong> {rangePreview}</span>
        ) : (
          <span className="editor-inline-help is-quiet">Enter lager innrykk. (), [], {`{}`} og anførselstegn lukkes automatisk. Tab flytter koden fire mellomrom.</span>
        )}
      </div>
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
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${Number(heightMm.toFixed(2))}mm" viewBox="${viewLeft} ${viewTop} ${viewport.worldWidth} ${viewport.worldHeight}">\n  <title>${xmlEscape(drawing.title || "Turtle-tegning")}</title>\n  <desc>Laget i Skolepython fra Bjørnsveen. Vektortype: ${modeNames[settings.mode]}. Transparent bakgrunn.</desc>\n  <g id="turtle-vektorer">\n    ${[...fillElements, ...vectorElements, ...textElements].join("\n    ")}\n  </g>\n</svg>\n`;
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

type SnakeDirection = "opp" | "ned" | "venstre" | "hoyre";
type SnakePoint = [number, number];
type SnakeRound = {
  snake: SnakePoint[];
  food: SnakePoint;
  direction: SnakeDirection;
  score: number;
  gameOver: boolean;
  message: string;
};

const snakeVectors: Record<SnakeDirection, SnakePoint> = {
  opp: [0, -1],
  ned: [0, 1],
  venstre: [-1, 0],
  hoyre: [1, 0],
};
const oppositeSnakeDirection: Record<SnakeDirection, SnakeDirection> = {
  opp: "ned",
  ned: "opp",
  venstre: "hoyre",
  hoyre: "venstre",
};

function nextSnakeFood(width: number, height: number, snake: SnakePoint[]): SnakePoint {
  const occupied = new Set(snake.map(([x, y]) => `${x},${y}`));
  const free: SnakePoint[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!occupied.has(`${x},${y}`)) free.push([x, y]);
    }
  }
  return free[Math.floor(Math.random() * free.length)] ?? [0, 0];
}

function initialSnakeRound(config: SnakeGameConfig): SnakeRound {
  const x = Math.max(3, Math.floor(config.width / 3));
  const y = Math.floor(config.height / 2);
  const snake: SnakePoint[] = [[x, y], [x - 1, y], [x - 2, y]];
  return {
    snake,
    food: nextSnakeFood(config.width, config.height, snake),
    direction: "hoyre",
    score: 0,
    gameOver: false,
    message: "Trykk Start og bruk piltastene.",
  };
}

function SnakePlayer({ config, onRestart }: { config: SnakeGameConfig; onRestart: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<HTMLDivElement | null>(null);
  const directionRef = useRef<SnakeDirection>("hoyre");
  const [round, setRound] = useState<SnakeRound>(() => initialSnakeRound(config));
  const [playing, setPlaying] = useState(false);

  function reset() {
    const next = initialSnakeRound(config);
    directionRef.current = next.direction;
    setRound(next);
    setPlaying(false);
    requestAnimationFrame(() => gameRef.current?.focus());
  }

  function turn(direction: SnakeDirection) {
    if (oppositeSnakeDirection[directionRef.current] === direction) return;
    directionRef.current = direction;
    setRound((current) => ({ ...current, direction }));
    gameRef.current?.focus();
  }

  useEffect(() => {
    reset();
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cell = Math.max(18, Math.floor(720 / Math.max(config.width, config.height)));
    canvas.width = config.width * cell;
    canvas.height = config.height * cell;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = config.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = config.gridColor;
    context.lineWidth = 1;
    for (let x = 0; x <= config.width; x += 1) {
      context.beginPath(); context.moveTo(x * cell + .5, 0); context.lineTo(x * cell + .5, canvas.height); context.stroke();
    }
    for (let y = 0; y <= config.height; y += 1) {
      context.beginPath(); context.moveTo(0, y * cell + .5); context.lineTo(canvas.width, y * cell + .5); context.stroke();
    }
    const drawCell = ([x, y]: SnakePoint, color: string, inset = 2) => {
      context.fillStyle = color;
      context.beginPath();
      context.roundRect(x * cell + inset, y * cell + inset, cell - inset * 2, cell - inset * 2, Math.max(3, cell * .18));
      context.fill();
    };
    drawCell(round.food, config.foodColor, Math.max(4, cell * .18));
    [...round.snake].reverse().forEach((point, index, reversed) => {
      const isHead = index === reversed.length - 1;
      drawCell(point, isHead ? config.headColor : config.snakeColor);
    });
    const [headX, headY] = round.snake[0];
    context.fillStyle = "#ffffff";
    const eye = Math.max(2, cell * .07);
    context.beginPath(); context.arc((headX + .68) * cell, (headY + .35) * cell, eye, 0, Math.PI * 2); context.fill();
    if (round.gameOver) {
      context.fillStyle = "#071f1cbb";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.textAlign = "center";
      context.font = `800 ${Math.max(24, cell * .85)}px Arial`;
      context.fillText("Spillet er slutt", canvas.width / 2, canvas.height / 2 - 10);
      context.font = `600 ${Math.max(14, cell * .42)}px Arial`;
      context.fillText(`Poeng: ${round.score}`, canvas.width / 2, canvas.height / 2 + 28);
    }
  }, [config, round]);

  useEffect(() => {
    if (!playing || round.gameOver) return;
    const interval = window.setInterval(() => {
      setRound((current) => {
        if (current.gameOver) return current;
        const direction = directionRef.current;
        const [dx, dy] = snakeVectors[direction];
        const [headX, headY] = current.snake[0];
        let nextX = headX + dx;
        let nextY = headY + dy;
        if (config.wrap) {
          nextX = (nextX + config.width) % config.width;
          nextY = (nextY + config.height) % config.height;
        }
        const hitWall = nextX < 0 || nextX >= config.width || nextY < 0 || nextY >= config.height;
        const ate = nextX === current.food[0] && nextY === current.food[1];
        const bodyToCheck = ate ? current.snake : current.snake.slice(0, -1);
        const hitSelf = bodyToCheck.some(([x, y]) => x === nextX && y === nextY);
        if (hitWall || hitSelf) {
          return { ...current, gameOver: true, message: hitWall ? "Slangen traff veggen." : "Slangen traff seg selv." };
        }
        const nextHead: SnakePoint = [nextX, nextY];
        const nextSnake = [nextHead, ...current.snake];
        if (!ate) nextSnake.pop();
        return {
          snake: nextSnake,
          food: ate ? nextSnakeFood(config.width, config.height, nextSnake) : current.food,
          direction,
          score: current.score + (ate ? 1 : 0),
          gameOver: false,
          message: ate ? "Mat! Slangen vokste med én rute." : "Spillet kjører.",
        };
      });
    }, Math.round(1000 / config.speed));
    return () => window.clearInterval(interval);
  }, [config, playing, round.gameOver]);

  useEffect(() => {
    if (round.gameOver) setPlaying(false);
  }, [round.gameOver]);

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    const direction = ({ ArrowUp: "opp", ArrowDown: "ned", ArrowLeft: "venstre", ArrowRight: "hoyre" } as Record<string, SnakeDirection>)[event.key];
    if (!direction) return;
    event.preventDefault();
    turn(direction);
    if (!round.gameOver) setPlaying(true);
  }

  function saveImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `${safeProjectName(config.title)}.png`;
    anchor.click();
  }

  return (
    <figure className="snake-player">
      <div className="snake-heading">
        <div><span>Python-spill</span><strong>{config.title}</strong></div>
        <div><span>Poeng</span><strong>{round.score}</strong></div>
      </div>
      <div className="snake-game" ref={gameRef} tabIndex={0} onKeyDown={handleKey} aria-label="Snake-spill. Bruk piltastene eller knappene under.">
        <canvas ref={canvasRef} className="snake-canvas" aria-label={`${config.title}, ${round.score} poeng`} />
      </div>
      <figcaption className="snake-controls">
        <div className="snake-status" aria-live="polite"><strong>{playing ? "Kjører" : round.gameOver ? "Spillet er slutt" : "Klar"}</strong><span>{round.message}</span></div>
        <div className="snake-arrows" aria-label="Styr slangen">
          <button type="button" className="snake-up" onClick={() => turn("opp")} aria-label="Opp">↑</button>
          <button type="button" onClick={() => turn("venstre")} aria-label="Venstre">←</button>
          <button type="button" onClick={() => turn("ned")} aria-label="Ned">↓</button>
          <button type="button" onClick={() => turn("hoyre")} aria-label="Høyre">→</button>
        </div>
        <div className="snake-actions">
          <button type="button" className="snake-play" onClick={() => { if (round.gameOver) reset(); else setPlaying((current) => !current); gameRef.current?.focus(); }}>{round.gameOver ? "Spill igjen" : playing ? "Pause" : "Start"}</button>
          <button type="button" onClick={reset}>Nullstill</button>
          <button type="button" onClick={onRestart}>Kjør koden på nytt</button>
          <button type="button" onClick={saveImage}>Lagre bilde</button>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Home() {
  const [activeId, setActiveId] = useState(1);
  const [playground, setPlayground] = useState(true);
  const [pygameView, setPygameView] = useState(false);
  const [curriculumView, setCurriculumView] = useState(false);
  const [libraryView, setLibraryView] = useState(false);
  const [selectedLibraryId, setSelectedLibraryId] = useState(libraryGuides[0].id);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryGroup, setLibraryGroup] = useState<"Alle" | LibraryGuideGroup>("Alle");
  const [libraryStatus, setLibraryStatus] = useState("");
  const [challengeView, setChallengeView] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [challengeDifficulty, setChallengeDifficulty] = useState<ChallengeDifficulty>("Alle");
  const [challengeCodes, setChallengeCodes] = useState<Record<string, string>>({});
  const [revealedChallengeHints, setRevealedChallengeHints] = useState<Record<string, number>>({});
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [challengeCheckFeedback, setChallengeCheckFeedback] = useState<string[]>([]);
  const [examTrainingView, setExamTrainingView] = useState(false);
  const [selectedExamTaskId, setSelectedExamTaskId] = useState<string | null>(null);
  const [examLevel, setExamLevel] = useState<ExamLevel>("Alle");
  const [examCodes, setExamCodes] = useState<Record<string, string>>({});
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [checkedExamInterpretations, setCheckedExamInterpretations] = useState<string[]>([]);
  const [revealedExamHints, setRevealedExamHints] = useState<Record<string, number>>({});
  const [completedExamTasks, setCompletedExamTasks] = useState<string[]>([]);
  const [examCheckFeedback, setExamCheckFeedback] = useState<string[]>([]);
  const [curriculumGrade, setCurriculumGrade] = useState<CurriculumGrade>("Alle");
  const [curriculumFit, setCurriculumFit] = useState<"Alle" | CurriculumFit>("Alle");
  const [teacherMode, setTeacherMode] = useState(false);
  const [code, setCode] = useState("");
  const [labTab, setLabTab] = useState<"practice" | "solution">("practice");
  const [practiceCodes, setPracticeCodes] = useState<Record<number, string>>({});
  const [solutionCodes, setSolutionCodes] = useState<Record<number, string>>(
    Object.fromEntries(modules.map((module) => [module.id, module.starterCode])),
  );
  const [output, setOutput] = useState("Trykk «Kjør kode» når du er klar.");
  const [executedCode, setExecutedCode] = useState<string | null>(null);
  const [runnerStatus, setRunnerStatus] = useState<"idle" | "loading" | "running" | "input" | "error">("idle");
  const [pythonInputRequest, setPythonInputRequest] = useState<{ prompt: string; index: number } | null>(null);
  const [pythonInputValue, setPythonInputValue] = useState("");
  const [errorCoach, setErrorCoach] = useState<ErrorCoach | null>(null);
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState<number[]>([]);
  const [projects, setProjects] = useState<LocalProject[]>([firstProject]);
  const [activeProjectId, setActiveProjectId] = useState(firstProject.id);
  const [shareStatus, setShareStatus] = useState("");
  const [plotImages, setPlotImages] = useState<string[]>([]);
  const [pythonVariables, setPythonVariables] = useState<PythonVariable[]>([]);
  const [variableQuery, setVariableQuery] = useState("");
  const [editorSelection, setEditorSelection] = useState({ start: 0, end: 0, selected: "" });
  const [traceSteps, setTraceSteps] = useState<PythonTraceStep[]>([]);
  const [traceIndex, setTraceIndex] = useState(0);
  const [pygameCode, setPygameCode] = useState("");
  const [pygameStatus, setPygameStatus] = useState<"loading" | "ready" | "running" | "error">("loading");
  const [pygameConsole, setPygameConsole] = useState("Pygame-motoren gjør seg klar …");
  const [pygameFrameKey, setPygameFrameKey] = useState(0);
  const [selectedPygameTutorialId, setSelectedPygameTutorialId] = useState(pygameTutorials[0].id);
  const [completedPygameTutorials, setCompletedPygameTutorials] = useState<string[]>([]);
  const [expandedPlotIndex, setExpandedPlotIndex] = useState<number | null>(null);
  const [turtleDrawing, setTurtleDrawing] = useState<TurtleDrawing | null>(null);
  const [snakeGame, setSnakeGame] = useState<SnakeGameConfig | null>(null);
  const [turtleWorkshop, setTurtleWorkshop] = useState<TurtleWorkshopSettings>(defaultTurtleWorkshop);
  const [turtleExpanded, setTurtleExpanded] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(19);
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const [desktopFilePath, setDesktopFilePath] = useState("");
  const [dataFiles, setDataFiles] = useState<PythonDataFile[]>([]);
  const [dataFileStatus, setDataFileStatus] = useState("Ingen datafiler er lagt til ennå.");
  const [referenceQuery, setReferenceQuery] = useState("");
  const [referenceCategory, setReferenceCategory] = useState<ReferenceCategory>("Alle");
  const [referenceStatus, setReferenceStatus] = useState("");
  const [snippetCategory, setSnippetCategory] = useState<SnippetCategory>("Alle");
  const [snippetStatus, setSnippetStatus] = useState("");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialQuery, setTutorialQuery] = useState("");
  const [tutorialCategory, setTutorialCategory] = useState<TutorialCategory>("Alle");
  const [selectedTutorialId, setSelectedTutorialId] = useState("print-mix");
  const [tutorialStatus, setTutorialStatus] = useState("");
  const [commandLibraryOpen, setCommandLibraryOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandCategory, setCommandCategory] = useState<CommandCategory>("Alle");
  const [selectedCommandId, setSelectedCommandId] = useState("assign");
  const [commandStatus, setCommandStatus] = useState("");
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackKind, setFeedbackKind] = useState("Forslag");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSchool, setFeedbackSchool] = useState("");
  const [feedbackName, setFeedbackName] = useState("");
  const workbenchRef = useRef<HTMLDivElement | null>(null);
  const pygameFrameRef = useRef<HTMLIFrameElement | null>(null);
  const pendingPygameRunRef = useRef<{ code: string; files: { name: string; content: string }[] } | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const executionRef = useRef<{ code: string; files: { name: string; content: string }[]; mode: "normal" | "selection" | "trace" } | null>(null);
  const inputDialogRef = useRef<HTMLFormElement | null>(null);
  const commandDialogRef = useRef<HTMLElement | null>(null);
  const feedbackDialogRef = useRef<HTMLElement | null>(null);
  const turtleDialogRef = useRef<HTMLDivElement | null>(null);
  const plotDialogRef = useRef<HTMLDivElement | null>(null);
  const runnerBusy = runnerStatus === "loading" || runnerStatus === "running" || runnerStatus === "input";
  const resultIsStale = executedCode !== null && code !== executedCode && !runnerBusy;
  const runButtonLabel = runnerStatus === "loading" ? "Laster Python …" : runnerStatus === "running" ? "Kjører …" : runnerStatus === "input" ? "Venter på svar …" : "Kjør kode";
  const activeLocalProject = normalizeProject(projects.find((item) => item.id === activeProjectId) ?? projects[0] ?? firstProject);
  const activePygameTutorial = pygameTutorials.find((tutorial) => tutorial.id === selectedPygameTutorialId) ?? pygameTutorials[0];
  const activeLibraryGuide = libraryGuides.find((guide) => guide.id === selectedLibraryId) ?? libraryGuides[0];
  const activeLocalFile = activeProjectFile(activeLocalProject);

  const active = useMemo(
    () => modules.find((item) => item.id === activeId) ?? modules[0],
    [activeId],
  );

  const activeChallenge = useMemo(
    () => pythonChallenges.find((challenge) => challenge.id === selectedChallengeId) ?? null,
    [selectedChallengeId],
  );

  const filteredChallenges = useMemo(
    () => pythonChallenges.filter((challenge) => challengeDifficulty === "Alle" || challenge.difficulty === challengeDifficulty),
    [challengeDifficulty],
  );

  const activeExamTask = useMemo(
    () => examTasks.find((task) => task.id === selectedExamTaskId) ?? null,
    [selectedExamTaskId],
  );

  const filteredExamTasks = useMemo(
    () => examTasks.filter((task) => examLevel === "Alle" || task.level === examLevel),
    [examLevel],
  );

  const filteredLibraryGuides = useMemo(() => {
    const terms = normalizeCommandSearch(libraryQuery).split(/\s+/).filter(Boolean);
    return libraryGuides.filter((guide) => {
      if (libraryGroup !== "Alle" && guide.group !== libraryGroup) return false;
      if (!terms.length) return true;
      const searchable = normalizeCommandSearch([
        guide.name,
        guide.tagline,
        guide.intro,
        guide.group,
        guide.importCode,
        ...guide.useCases,
        ...guide.steps,
        ...guide.commands.flatMap((command) => [command.code, command.explanation]),
      ].join(" "));
      return terms.every((term) => searchable.includes(term));
    });
  }, [libraryGroup, libraryQuery]);

  const filteredReferences = useMemo(() => {
    const terms = normalizeCommandSearch(referenceQuery).split(/\s+/).filter(Boolean);
    return playgroundReferences.filter((reference) => {
      if (referenceCategory !== "Alle" && reference.category !== referenceCategory) return false;
      if (!terms.length) return true;
      const searchable = normalizeCommandSearch([
        reference.title,
        reference.purpose,
        reference.category,
        reference.level,
        reference.example,
        reference.tip ?? "",
        ...reference.commands.flatMap((command) => [command.code, command.explanation]),
        ...reference.experiments,
      ].join(" "));
      return terms.every((term) => searchable.includes(term));
    });
  }, [referenceCategory, referenceQuery]);

  const filteredSnippets = useMemo(
    () => codeSnippets.filter((snippet) => snippetCategory === "Alle" || snippet.category === snippetCategory),
    [snippetCategory],
  );

  const filteredTutorials = useMemo(() => {
    const terms = normalizeCommandSearch(tutorialQuery).split(/\s+/).filter(Boolean);
    return quickTutorials.filter((tutorial) => {
      if (tutorialCategory !== "Alle" && tutorial.category !== tutorialCategory) return false;
      if (!terms.length) return true;
      const searchable = normalizeCommandSearch([
        tutorial.title,
        tutorial.question,
        tutorial.intro,
        tutorial.example,
        tutorial.notice,
        tutorial.challenge,
        ...tutorial.steps,
      ].join(" "));
      return terms.every((term) => searchable.includes(term));
    });
  }, [tutorialCategory, tutorialQuery]);

  const filteredCommands = useMemo(() => {
    const query = normalizeCommandSearch(commandQuery);
    const terms = query.split(/\s+/).filter(Boolean);
    return pythonCommands
      .filter((command) => commandCategory === "Alle" || command.category === commandCategory)
      .map((command, index) => {
        const normalizedTitle = normalizeCommandSearch(command.title);
        const normalizedSyntax = normalizeCommandSearch(command.syntax);
        const normalizedKeywords = command.keywords.map(normalizeCommandSearch);
        const searchable = normalizeCommandSearch([
          command.syntax,
          command.title,
          command.summary,
          command.explanation,
          command.example,
          command.result ?? "",
          command.commonMistake ?? "",
          command.category,
          ...command.keywords,
        ].join(" "));
        const matches = !terms.length || terms.every((term) => searchable.includes(term));
        let score = -index / 1000;
        if (query && normalizedSyntax === query) score += 120;
        if (query && normalizedTitle.includes(query)) score += 80;
        if (query && normalizedKeywords.includes(query)) score += 95;
        score += terms.filter((term) => normalizedSyntax.includes(term)).length * 20;
        score += terms.filter((term) => normalizedTitle.includes(term)).length * 12;
        return { command, matches, score };
      })
      .filter((item) => item.matches)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.command);
  }, [commandCategory, commandQuery]);

  const filteredCurriculumGoals = useMemo(
    () => curriculumGoals.filter((goal) =>
      (curriculumGrade === "Alle" || goal.grade === curriculumGrade)
      && (curriculumFit === "Alle" || goal.fit === curriculumFit)),
    [curriculumFit, curriculumGrade],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("pythonverkstedet-progress");
    const savedMode = window.localStorage.getItem("pythonverkstedet-mode");
    const savedProjects = window.localStorage.getItem("bjornsveen-python-projects");
    const savedPygameCode = window.localStorage.getItem("skolepython-pygame-code");
    const savedCompletedPygameTutorials = window.localStorage.getItem("skolepython-pygame-tutorials");
    const savedEditorFontSize = Number(window.localStorage.getItem("bjornsveen-editor-font-size"));
    const savedChallengeCodes = window.localStorage.getItem("skolepython-challenge-codes");
    const savedCompletedChallenges = window.localStorage.getItem("skolepython-completed-challenges");
    const savedExamCodes = window.localStorage.getItem("skolepython-exam-codes");
    const savedCompletedExamTasks = window.localStorage.getItem("skolepython-completed-exam-tasks");
    if (saved) setCompleted(JSON.parse(saved));
    if (savedMode === "teacher") setTeacherMode(true);
    if (savedProjects) {
      try {
        const parsed = (JSON.parse(savedProjects) as LocalProject[]).map((project) => normalizeProject(
          project.id === firstProject.id && project.code === legacyPlaygroundCode
            ? { ...project, code: "" }
            : project,
        ));
        const previousScratch = parsed.find((project) => project.id === firstProject.id);
        const preservedScratch = previousScratch?.code.trim()
          ? {
              ...previousScratch,
              id: `${firstProject.id}-lagret-${previousScratch.updatedAt.replace(/\D/g, "") || "eldre"}`,
              name: ["Mitt første prosjekt", "Nytt program"].includes(previousScratch.name) ? "Lagret program" : previousScratch.name,
            }
          : null;
        const nextProjects = [
          firstProject,
          ...(preservedScratch ? [preservedScratch] : []),
          ...parsed.filter((project) => project.id !== firstProject.id),
        ];
        setProjects(nextProjects);
        setActiveProjectId(firstProject.id);
        setCode("");
        window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(nextProjects));
        window.localStorage.setItem("bjornsveen-python-active-project", firstProject.id);
      } catch {
        window.localStorage.removeItem("bjornsveen-python-projects");
      }
    }
    if (savedPygameCode) setPygameCode(savedPygameCode);
    if (savedCompletedPygameTutorials) {
      try { setCompletedPygameTutorials(JSON.parse(savedCompletedPygameTutorials)); } catch { window.localStorage.removeItem("skolepython-pygame-tutorials"); }
    }
    if (savedEditorFontSize >= 15 && savedEditorFontSize <= 28) setEditorFontSize(savedEditorFontSize);
    if (savedChallengeCodes) {
      try { setChallengeCodes(JSON.parse(savedChallengeCodes)); } catch { window.localStorage.removeItem("skolepython-challenge-codes"); }
    }
    if (savedCompletedChallenges) {
      try { setCompletedChallenges(JSON.parse(savedCompletedChallenges)); } catch { window.localStorage.removeItem("skolepython-completed-challenges"); }
    }
    if (savedExamCodes) {
      try { setExamCodes(JSON.parse(savedExamCodes)); } catch { window.localStorage.removeItem("skolepython-exam-codes"); }
    }
    if (savedCompletedExamTasks) {
      try { setCompletedExamTasks(JSON.parse(savedCompletedExamTasks)); } catch { window.localStorage.removeItem("skolepython-completed-exam-tasks"); }
    }
    const handleFullscreenChange = () => setEditorFullscreen(document.fullscreenElement === workbenchRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      workerRef.current?.terminate();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    function handlePygameMessage(event: MessageEvent) {
      if (event.source !== pygameFrameRef.current?.contentWindow || event.data?.source !== "skolepython-pygame") return;
      const type = String(event.data.type ?? "");
      if (type === "ready") {
        setPygameStatus("ready");
        setPygameConsole("Pygame er klar. Skriv kode eller hent startpunktet.");
        const pending = pendingPygameRunRef.current;
        if (pending) {
          pendingPygameRunRef.current = null;
          setPygameStatus("running");
          pygameFrameRef.current?.contentWindow?.postMessage({ source: "skolepython", type: "run", ...pending }, "*");
        }
      } else if (type === "loading") {
        setPygameStatus("loading");
        setPygameConsole(String(event.data.message ?? "Laster Pygame …"));
      } else if (type === "stdout") {
        setPygameConsole((current) => `${current === "Kjører Pygame …" ? "" : `${current}\n`}${String(event.data.text ?? "")}`.trim());
      } else if (type === "result") {
        setPygameStatus("ready");
        setPygameConsole((current) => current.trim() || "Programmet ble avsluttet uten utskrift.");
      } else if (type === "error") {
        setPygameStatus("error");
        setPygameConsole(String(event.data.error ?? "Pygame-programmet stoppet."));
      }
    }
    window.addEventListener("message", handlePygameMessage);
    return () => window.removeEventListener("message", handlePygameMessage);
  }, [pygameFrameKey]);

  useEffect(() => {
    // Variabelvisningen beskriver alltid den koden som faktisk ble kjørt.
    // Så snart eleven endrer eller henter ny kode, skjules gamle verdier.
    setPythonVariables([]);
    setTraceSteps([]);
    setTraceIndex(0);
  }, [code]);

  useEffect(() => {
    const activeDialog = pythonInputRequest
      ? inputDialogRef.current
      : feedbackDialogOpen
        ? feedbackDialogRef.current
        : commandLibraryOpen
          ? commandDialogRef.current
          : turtleExpanded
            ? turtleDialogRef.current
            : expandedPlotIndex !== null
              ? plotDialogRef.current
              : null;
    if (!activeDialog) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
    const focusFirst = () => {
      if (pythonInputRequest) {
        (activeDialog.querySelector("input") as HTMLElement | null)?.focus();
        return;
      }
      (activeDialog.querySelector(focusableSelector) as HTMLElement | null)?.focus();
    };
    requestAnimationFrame(focusFirst);

    function handleModalKeyboard(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (pythonInputRequest) cancelPythonInput();
        else if (feedbackDialogOpen) setFeedbackDialogOpen(false);
        else if (commandLibraryOpen) setCommandLibraryOpen(false);
        else if (turtleExpanded) setTurtleExpanded(false);
        else if (expandedPlotIndex !== null) setExpandedPlotIndex(null);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(activeDialog.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) {
        event.preventDefault();
        activeDialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleModalKeyboard);
    return () => {
      document.removeEventListener("keydown", handleModalKeyboard);
      if (previouslyFocused?.isConnected) requestAnimationFrame(() => previouslyFocused.focus());
    };
  }, [commandLibraryOpen, expandedPlotIndex, feedbackDialogOpen, pythonInputRequest, turtleExpanded]);

  useEffect(() => {
    function closeTutorial(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && tutorialOpen && !pythonInputRequest && !feedbackDialogOpen && !commandLibraryOpen && !turtleExpanded && expandedPlotIndex === null) {
        setTutorialOpen(false);
      }
    }
    document.addEventListener("keydown", closeTutorial);
    return () => document.removeEventListener("keydown", closeTutorial);
  }, [commandLibraryOpen, expandedPlotIndex, feedbackDialogOpen, pythonInputRequest, turtleExpanded, tutorialOpen]);

  function changeEditorFontSize(change: number) {
    const next = Math.min(28, Math.max(15, editorFontSize + change));
    setEditorFontSize(next);
    window.localStorage.setItem("bjornsveen-editor-font-size", String(next));
  }

  async function importDataFiles(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const chosenFiles = Array.from(input.files ?? []);
    if (!chosenFiles.length) return;

    const accepted: PythonDataFile[] = [];
    const rejected: string[] = [];
    for (const file of chosenFiles) {
      if (!/\.(?:txt|csv)$/i.test(file.name)) {
        rejected.push(`${file.name} (må være .txt eller .csv)`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        rejected.push(`${file.name} (større enn 5 MB)`);
        continue;
      }
      const safeName = file.name.replace(/[\\/\0]/g, "-").trim();
      accepted.push({ name: safeName, content: await file.text(), size: file.size });
    }

    if (accepted.length) {
      setDataFiles((current) => {
        const names = new Set(accepted.map((file) => file.name.toLocaleLowerCase("nb")));
        return [...current.filter((file) => !names.has(file.name.toLocaleLowerCase("nb"))), ...accepted];
      });
    }
    const success = accepted.length
      ? `${accepted.map((file) => `«${file.name}»`).join(", ")} er klar i Python.`
      : "Ingen filer ble lagt til.";
    const warning = rejected.length ? ` Ikke lagt til: ${rejected.join(", ")}.` : "";
    setDataFileStatus(`${success}${warning} Filene blir bare behandlet lokalt på denne enheten.`);
    input.value = "";
  }

  function addExampleDataFile(kind: "txt" | "csv") {
    const example = exampleDataFiles[kind];
    setDataFiles((current) => [
      ...current.filter((file) => file.name.toLocaleLowerCase("nb") !== example.name.toLocaleLowerCase("nb")),
      example,
    ]);
    setDataFileStatus(`Eksempelfilen «${example.name}» er klar. Bruk nøyaktig dette navnet i open eller read_csv.`);
  }

  function removeDataFile(name: string) {
    setDataFiles((current) => current.filter((file) => file.name !== name));
    setDataFileStatus(`«${name}» er fjernet fra Python-miljøet.`);
  }

  function dataFileShelf() {
    return (
      <div className="data-file-shelf" aria-label="Datafiler til Python-programmet">
        <div className="data-file-actions">
          <strong>Datafiler</strong>
          <label className="data-file-button">
            + Legg til .txt eller .csv
            <input type="file" accept=".txt,.csv,text/plain,text/csv" multiple onChange={importDataFiles} />
          </label>
          <button type="button" onClick={() => addExampleDataFile("txt")}>Bruk eksempel .txt</button>
          <button type="button" onClick={() => addExampleDataFile("csv")}>Bruk eksempel .csv</button>
        </div>
        {dataFiles.length > 0 && (
          <div className="data-file-list" aria-label="Filer som er klare i Python">
            {dataFiles.map((file) => (
              <span key={file.name}>
                <code>{file.name}</code>
                <small>{file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(1)} KB`}</small>
                <button type="button" onClick={() => removeDataFile(file.name)} aria-label={`Fjern ${file.name}`}>×</button>
              </span>
            ))}
          </div>
        )}
        <p aria-live="polite">{dataFileStatus}</p>
      </div>
    );
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
    setPygameView(false);
    setCurriculumView(false);
    setLibraryView(false);
    setChallengeView(false);
    setExamTrainingView(false);
    setActiveId(module.id);
    setLabTab("practice");
    setCode(practiceCodes[module.id] ?? "");
    setOutput("Trykk «Kjør kode» når du er klar.");
    setFeedback("");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choosePlayground() {
    setPlayground(true);
    setPygameView(false);
    setCurriculumView(false);
    setLibraryView(false);
    setChallengeView(false);
    setExamTrainingView(false);
    const project = projects.find((item) => item.id === activeProjectId) ?? projects[0];
    setCode(project ? activeProjectFile(project).code : playgroundCode);
    setOutput("Skriv eller endre koden, og trykk «Kjør kode».");
    setFeedback("");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choosePygame() {
    setPlayground(false);
    setPygameView(true);
    setCurriculumView(false);
    setLibraryView(false);
    setChallengeView(false);
    setExamTrainingView(false);
    setErrorCoach(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updatePygameCode(nextCode: string) {
    setPygameCode(nextCode);
    window.localStorage.setItem("skolepython-pygame-code", nextCode);
  }

  function loadPygameStarter() {
    if (pygameCode.trim() && !window.confirm("Dette erstatter koden som står i Pygame-editoren. Vil du fortsette?")) return;
    updatePygameCode(pygameStarterCode);
    setPygameConsole("Startpunktet er hentet. Les kommentarene, endre én ting og trykk «Start spillet».");
    requestAnimationFrame(() => document.getElementById("pygame-code")?.focus());
  }

  function loadPygameTutorial(tutorial: PygameTutorial) {
    if (pygameCode.trim() && pygameCode !== tutorial.code && !window.confirm(`Dette erstatter koden i Pygame-editoren med steg ${tutorial.step}. Vil du fortsette?`)) return;
    pendingPygameRunRef.current = null;
    if (pygameStatus === "running") {
      setPygameStatus("loading");
      setPygameFrameKey((current) => current + 1);
    }
    updatePygameCode(tutorial.code);
    setPygameConsole(`Steg ${tutorial.step} er hentet: ${tutorial.shortTitle}. Les kommentarene, forutsi hva som skjer og start spillet.`);
    requestAnimationFrame(() => {
      document.getElementById("pygame-code")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("pygame-code")?.focus();
    });
  }

  function completePygameTutorial(tutorial: PygameTutorial) {
    const nextCompleted = completedPygameTutorials.includes(tutorial.id)
      ? completedPygameTutorials
      : [...completedPygameTutorials, tutorial.id];
    setCompletedPygameTutorials(nextCompleted);
    window.localStorage.setItem("skolepython-pygame-tutorials", JSON.stringify(nextCompleted));
    const nextTutorial = pygameTutorials[tutorial.step];
    if (nextTutorial) setSelectedPygameTutorialId(nextTutorial.id);
  }

  async function copyPygameTutorial(tutorial: PygameTutorial) {
    await navigator.clipboard.writeText(tutorial.code);
    setPygameConsole(`Koden fra steg ${tutorial.step} er kopiert. Du kan lime den inn i et dokument eller en annen Python-editor.`);
  }

  function runPygame() {
    if (!pygameCode.trim()) {
      setPygameConsole("Editoren er tom. Skriv Pygame-kode eller hent det spillbare startpunktet.");
      return;
    }
    const payload = { code: pygameCode, files: [] as { name: string; content: string }[] };
    setPygameConsole("Kjører Pygame …");
    if (pygameStatus === "ready" || pygameStatus === "error") {
      if (pygameStatus === "error") {
        pendingPygameRunRef.current = payload;
        setPygameStatus("loading");
        setPygameFrameKey((current) => current + 1);
        return;
      }
      setPygameStatus("running");
      pygameFrameRef.current?.contentWindow?.postMessage({ source: "skolepython", type: "run", ...payload }, "*");
    } else {
      pendingPygameRunRef.current = payload;
      setPygameConsole("Pygame-motoren lastes. Spillet starter automatisk når den er klar …");
    }
  }

  function stopPygame() {
    pendingPygameRunRef.current = null;
    setPygameStatus("loading");
    setPygameConsole("Spillet er stoppet. Pygame-flaten nullstilles …");
    setPygameFrameKey((current) => current + 1);
  }

  function savePygameImage() {
    pygameFrameRef.current?.contentWindow?.postMessage({ source: "skolepython", type: "save-image" }, "*");
  }

  function downloadPygameCode() {
    const url = URL.createObjectURL(new Blob([pygameCode], { type: "text/x-python;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pygame-spill.py";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function chooseCurriculum() {
    setPlayground(false);
    setPygameView(false);
    setCurriculumView(true);
    setLibraryView(false);
    setChallengeView(false);
    setExamTrainingView(false);
    setFeedback("");
    setErrorCoach(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseLibraries() {
    setPlayground(false);
    setPygameView(false);
    setCurriculumView(false);
    setLibraryView(true);
    setChallengeView(false);
    setExamTrainingView(false);
    setLibraryStatus("");
    setErrorCoach(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectLibraryGuide(guide: LibraryGuide) {
    setSelectedLibraryId(guide.id);
    setLibraryStatus("");
    requestAnimationFrame(() => document.getElementById("bibliotek-detalj")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function copyLibraryExample(guide: LibraryGuide) {
    try {
      await navigator.clipboard.writeText(guide.example);
      setLibraryStatus(`Eksemplet for ${guide.name} er kopiert.`);
    } catch {
      setLibraryStatus("Nettleseren tillot ikke kopiering. Marker koden og kopier manuelt.");
    }
  }

  function openLibraryExample(guide: LibraryGuide) {
    if (guide.id === "pygame") {
      updatePygameCode(guide.example);
      choosePygame();
      setPygameConsole("Bibliotekeksemplet er hentet. Les kommentarene, forutsi hva som skjer og start spillet.");
      return;
    }
    const project = normalizeProject({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: safeProjectName(`Eksempel ${guide.name}`),
      code: guide.example,
      updatedAt: new Date().toISOString(),
    });
    const nextProjects = [...projects, project];
    setProjects(nextProjects);
    setActiveProjectId(project.id);
    setDesktopFilePath("");
    setCode(project.code);
    setOutput(`Eksemplet for ${guide.name} er klart. Forutsi resultatet før du kjører.`);
    setPlayground(true);
    setPygameView(false);
    setCurriculumView(false);
    setLibraryView(false);
    setChallengeView(false);
    setExamTrainingView(false);
    setErrorCoach(null);
    setPlotImages([]);
    setTurtleDrawing(null);
    setSnakeGame(null);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(nextProjects));
    window.localStorage.setItem("bjornsveen-python-active-project", project.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseChallenges() {
    setPlayground(false);
    setPygameView(false);
    setCurriculumView(false);
    setLibraryView(false);
    setChallengeView(true);
    setExamTrainingView(false);
    setSelectedChallengeId(null);
    setChallengeCheckFeedback([]);
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseExamTraining() {
    setPlayground(false);
    setPygameView(false);
    setCurriculumView(false);
    setLibraryView(false);
    setChallengeView(false);
    setExamTrainingView(true);
    setSelectedExamTaskId(null);
    setExamCheckFeedback([]);
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openExamTask(task: ExamTask) {
    setPlayground(false);
    setPygameView(false);
    setCurriculumView(false);
    setChallengeView(false);
    setExamTrainingView(true);
    setSelectedExamTaskId(task.id);
    setCode(examCodes[task.id] ?? "");
    setOutput("Tolk oppgaven først. Når planen er klar, bygger og tester du programmet her.");
    setExamCheckFeedback([]);
    setFeedback("");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeExamTask() {
    setSelectedExamTaskId(null);
    setCode("");
    setExamCheckFeedback([]);
    setErrorCoach(null);
    setPlotImages([]);
    setTurtleDrawing(null);
    setSnakeGame(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openChallenge(challenge: PythonChallenge) {
    setPygameView(false);
    setChallengeView(true);
    setSelectedChallengeId(challenge.id);
    setCode(challengeCodes[challenge.id] ?? "");
    setOutput("Skriv løsningen din, og trykk «Kjør kode» når du vil undersøke den.");
    setChallengeCheckFeedback([]);
    setFeedback("");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeChallenge() {
    setSelectedChallengeId(null);
    setCode("");
    setChallengeCheckFeedback([]);
    setErrorCoach(null);
    setPlotImages([]);
    setTurtleDrawing(null);
    setSnakeGame(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleMode() {
    const next = !teacherMode;
    setTeacherMode(next);
    window.localStorage.setItem("pythonverkstedet-mode", next ? "teacher" : "student");
  }

  function updateCode(nextCode: string) {
    setCode(nextCode);
    setPythonVariables([]);
    if (examTrainingView && activeExamTask) {
      const nextExamCodes = { ...examCodes, [activeExamTask.id]: nextCode };
      setExamCodes(nextExamCodes);
      window.localStorage.setItem("skolepython-exam-codes", JSON.stringify(nextExamCodes));
      return;
    }
    if (challengeView && activeChallenge) {
      const nextChallengeCodes = { ...challengeCodes, [activeChallenge.id]: nextCode };
      setChallengeCodes(nextChallengeCodes);
      window.localStorage.setItem("skolepython-challenge-codes", JSON.stringify(nextChallengeCodes));
      return;
    }
    if (!playground) {
      if (labTab === "practice") setPracticeCodes((current) => ({ ...current, [active.id]: nextCode }));
      else setSolutionCodes((current) => ({ ...current, [active.id]: nextCode }));
      return;
    }
    const nextProjects = projects.map((project) =>
      project.id === activeProjectId
        ? updateActiveProjectFile(project, nextCode)
        : project,
    );
    setProjects(nextProjects);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(nextProjects));
  }

  function openReferenceProject(reference: PlaygroundReference) {
    const project = normalizeProject({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: safeProjectName(`Eksempel ${reference.title}`),
      code: reference.example,
      updatedAt: new Date().toISOString(),
    });
    const nextProjects = [...projects, project];
    setProjects(nextProjects);
    setActiveProjectId(project.id);
    setDesktopFilePath("");
    setCode(project.code);
    setOutput(`«${reference.title}» er åpnet som et nytt prosjekt. Forutsi resultatet før du kjører.`);
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
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

  function openTutorial() {
    setCommandLibraryOpen(false);
    setTutorialOpen(true);
    setTutorialStatus("");
  }

  function chooseTutorial(tutorial: QuickTutorial) {
    setSelectedTutorialId(tutorial.id);
    setTutorialStatus("");
  }

  function insertTutorialCode(tutorial: QuickTutorial) {
    const editorId = examTrainingView ? "exam-code" : challengeView ? "challenge-code" : playground ? "playground-code" : "python-code";
    const editor = document.getElementById(editorId) as HTMLTextAreaElement | null;
    const start = editor?.selectionStart ?? code.length;
    const end = editor?.selectionEnd ?? start;
    const before = code.slice(0, start);
    const after = code.slice(end);
    const prefix = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const suffix = after && !after.startsWith("\n") ? "\n\n" : "";
    const insertion = `${prefix}${tutorial.example}${suffix}`;
    const nextCode = `${before}${insertion}${after}`;
    const caret = before.length + insertion.length;
    updateCode(nextCode);
    setTutorialStatus(`«${tutorial.title}» er satt inn. Eksemplet kan endres fritt.`);
    requestAnimationFrame(() => {
      const nextEditor = document.getElementById(editorId) as HTMLTextAreaElement | null;
      nextEditor?.focus();
      nextEditor?.setSelectionRange(caret, caret);
    });
  }

  async function copyTutorialCode(tutorial: QuickTutorial) {
    try {
      await navigator.clipboard.writeText(tutorial.example);
      setTutorialStatus(`Koden til «${tutorial.title}» er kopiert.`);
    } catch {
      setTutorialStatus("Nettleseren tillot ikke kopiering. Marker koden i hjelpevinduet og kopier manuelt.");
    }
  }

  function openCommandLibrary(initialQuery = "") {
    setTutorialOpen(false);
    setCommandQuery(initialQuery);
    setCommandCategory("Alle");
    setCommandStatus("");
    setCommandLibraryOpen(true);
  }

  function chooseCommand(command: PythonCommand) {
    setSelectedCommandId(command.id);
    setCommandStatus("");
  }

  function insertCommandExample(command: PythonCommand) {
    if (curriculumView || libraryView) {
      const project = normalizeProject({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: safeProjectName(`Eksempel ${command.title.replace(/^[^\p{L}]+/u, "")}`),
        code: command.example,
        updatedAt: new Date().toISOString(),
      });
      const nextProjects = [...projects, project];
      setProjects(nextProjects);
      setActiveProjectId(project.id);
      setPlayground(true);
      setPygameView(false);
      setCurriculumView(false);
      setLibraryView(false);
      setCode(project.code);
      setOutput(`Eksemplet «${command.title}» er klart. Endre det og kjør når du vil.`);
      setCommandLibraryOpen(false);
      window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(nextProjects));
      window.localStorage.setItem("bjornsveen-python-active-project", project.id);
      requestAnimationFrame(() => workbenchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }

    const editorId = examTrainingView ? "exam-code" : challengeView ? "challenge-code" : playground ? "playground-code" : "python-code";
    const editor = document.getElementById(editorId) as HTMLTextAreaElement | null;
    const start = editor?.selectionStart ?? code.length;
    const end = editor?.selectionEnd ?? start;
    const before = code.slice(0, start);
    const after = code.slice(end);
    const prefix = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const suffix = after && !after.startsWith("\n") ? "\n\n" : "";
    const insertion = `${prefix}${command.example}${suffix}`;
    const nextCode = `${before}${insertion}${after}`;
    const caret = before.length + insertion.length;
    updateCode(nextCode);
    setCommandStatus(`Eksemplet «${command.title}» er satt inn ved markøren. Endre verdiene slik at koden blir deres egen.`);
    requestAnimationFrame(() => {
      const nextEditor = document.getElementById(editorId) as HTMLTextAreaElement | null;
      nextEditor?.focus();
      nextEditor?.setSelectionRange(caret, caret);
    });
  }

  async function copyCommandExample(command: PythonCommand) {
    try {
      await navigator.clipboard.writeText(command.example);
      setCommandStatus(`Eksemplet til «${command.title}» er kopiert.`);
    } catch {
      setCommandStatus("Nettleseren tillot ikke kopiering. Marker koden i oppslagsverket og kopier manuelt.");
    }
  }

  function composeFeedbackEmail() {
    const message = feedbackMessage.trim();
    if (!message) return;
    const context = playground ? "Python" : examTrainingView ? "Eksamenstrening" : challengeView ? "Utfordringer" : curriculumView ? "Læreplanmål" : `Modul ${active.id}: ${active.title}`;
    const subject = `Skolepython · Bjørnsveen: ${feedbackKind} – ${context}`;
    const body = [
      "Hei!",
      "",
      message,
      "",
      "---",
      `Type: ${feedbackKind}`,
      `Område: ${context}`,
      `Skole: ${feedbackSchool.trim() || "Ikke oppgitt"}`,
      `Navn: ${feedbackName.trim() || "Ikke oppgitt"}`,
      "Versjon: 0.12.0",
    ].join("\n");
    setFeedbackDialogOpen(false);
    window.location.href = `mailto:skolepython@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function switchLabTab(nextTab: "practice" | "solution") {
    if (nextTab === labTab) return;
    if (labTab === "practice") setPracticeCodes((current) => ({ ...current, [active.id]: code }));
    else setSolutionCodes((current) => ({ ...current, [active.id]: code }));
    setLabTab(nextTab);
    setCode(nextTab === "practice" ? (practiceCodes[active.id] ?? "") : (solutionCodes[active.id] ?? active.starterCode));
    setOutput("Trykk «Kjør kode» når du er klar.");
    setFeedback("");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
  }

  function resetCurrentEditor() {
    const nextCode = labTab === "practice" ? "" : active.starterCode;
    setCode(nextCode);
    if (labTab === "practice") setPracticeCodes((current) => ({ ...current, [active.id]: nextCode }));
    else setSolutionCodes((current) => ({ ...current, [active.id]: nextCode }));
    setFeedback("");
    setErrorCoach(null);
    setOutput("Trykk «Kjør kode» når du er klar.");
  }

  function revealNextChallengeHint(challenge: PythonChallenge) {
    setRevealedChallengeHints((current) => ({
      ...current,
      [challenge.id]: Math.min(challenge.hints.length, (current[challenge.id] ?? 0) + 1),
    }));
  }

  function loadChallengeScaffold(challenge: PythonChallenge) {
    if (code.trim() && !window.confirm("Dette erstatter koden i editoren med startpunktet. Vil du fortsette?")) return;
    updateCode(challenge.scaffold);
    setOutput("Startpunktet er hentet. Kommentarene viser hva du skal bygge – selve løsningen må du skrive.");
    setChallengeCheckFeedback([]);
    requestAnimationFrame(() => document.getElementById("challenge-code")?.focus());
  }

  function loadChallengeSolution(challenge: PythonChallenge) {
    if (code.trim() && !window.confirm("Dette erstatter forsøket i editoren med løsningsforslaget. Vil du fortsette?")) return;
    updateCode(challenge.solutionCode);
    setOutput("Løsningsforslaget er lagt i editoren. Les det linje for linje, forutsi svaret og kjør det.");
    setChallengeCheckFeedback([]);
    requestAnimationFrame(() => document.getElementById("challenge-code")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  function checkChallengeAttempt(challenge: PythonChallenge) {
    if (!code.trim()) {
      setChallengeCheckFeedback(["○ Editoren er tom ennå. Skriv ett lite steg eller hent startpunktet før du sjekker."]);
      return;
    }
    setChallengeCheckFeedback(evaluateChallengeAttempt(challenge, code, output));
  }

  function markChallengeComplete(challenge: PythonChallenge) {
    const next = completedChallenges.includes(challenge.id) ? completedChallenges : [...completedChallenges, challenge.id];
    setCompletedChallenges(next);
    window.localStorage.setItem("skolepython-completed-challenges", JSON.stringify(next));
  }

  function chooseExamAnswer(task: ExamTask, questionId: string, choiceIndex: number) {
    setExamAnswers((current) => ({ ...current, [`${task.id}:${questionId}`]: choiceIndex }));
    setCheckedExamInterpretations((current) => current.filter((taskId) => taskId !== task.id));
  }

  function checkExamInterpretation(task: ExamTask) {
    const allAnswered = task.questions.every((question) => examAnswers[`${task.id}:${question.id}`] !== undefined);
    if (!allAnswered) {
      setExamCheckFeedback(["○ Svar på alle tolkningsspørsmålene før du sjekker. Det er lov å være usikker."]);
      return;
    }
    setCheckedExamInterpretations((current) => current.includes(task.id) ? current : [...current, task.id]);
    setExamCheckFeedback([]);
  }

  function revealNextExamHint(task: ExamTask) {
    setRevealedExamHints((current) => ({
      ...current,
      [task.id]: Math.min(task.hints.length, (current[task.id] ?? 0) + 1),
    }));
  }

  function loadExamStarter(task: ExamTask) {
    if (code.trim() && !window.confirm("Dette erstatter koden i editoren med startpunktet. Vil du fortsette?")) return;
    updateCode(task.starterCode);
    setOutput("Startpunktet er hentet. Kommentarene viser delproblemene, men du må bygge løsningen.");
    setExamCheckFeedback([]);
    requestAnimationFrame(() => document.getElementById("exam-code")?.focus());
  }

  function loadExamSolution(task: ExamTask) {
    if (code.trim() && !window.confirm("Dette erstatter forsøket med løsningsforslaget. Vil du fortsette?")) return;
    updateCode(task.solutionCode);
    setOutput("Løsningsforslaget er lagt i editoren. Les det linje for linje og forutsi resultatet før du kjører.");
    setExamCheckFeedback([]);
    requestAnimationFrame(() => document.getElementById("exam-code")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  function checkExamAttempt(task: ExamTask) {
    if (!code.trim()) {
      setExamCheckFeedback(["○ Kodefeltet er tomt. Skriv ett lite steg eller hent startpunktet først."]);
      return;
    }
    setExamCheckFeedback(evaluateExamAttempt(task, code, output));
  }

  function markExamTaskComplete(task: ExamTask) {
    const next = completedExamTasks.includes(task.id) ? completedExamTasks : [...completedExamTasks, task.id];
    setCompletedExamTasks(next);
    window.localStorage.setItem("skolepython-completed-exam-tasks", JSON.stringify(next));
  }

  function tryProgressionCode(nextCode: string) {
    setLabTab("practice");
    setCode(nextCode);
    setPracticeCodes((current) => ({ ...current, [active.id]: nextCode }));
    setOutput("Forutsi resultatet, og trykk «Kjør kode» når du er klar.");
    setFeedback("");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    requestAnimationFrame(() => document.getElementById("module-lab")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function selectProject(projectId: string) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;
    const normalized = normalizeProject(project);
    const nextProjects = projects.map((item) => item.id === projectId ? normalized : item);
    setProjects(nextProjects);
    setActiveProjectId(projectId);
    setDesktopFilePath("");
    setCode(activeProjectFile(normalized).code);
    setOutput("Prosjektet er åpnet. Trykk «Kjør kode» når du er klar.");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.localStorage.setItem("bjornsveen-python-active-project", projectId);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(nextProjects));
  }

  function createProject() {
    const name = window.prompt("Hva skal prosjektet hete?", `Nytt prosjekt ${projects.length + 1}`);
    if (!name?.trim()) return;
    const project = normalizeProject({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: safeProjectName(name),
      code: "",
      updatedAt: new Date().toISOString(),
    });
    const next = [...projects, project];
    setProjects(next);
    setActiveProjectId(project.id);
    setDesktopFilePath("");
    setCode(project.code);
    setOutput("Nytt prosjekt opprettet lokalt på denne enheten.");
    setErrorCoach(null);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
    window.localStorage.setItem("bjornsveen-python-active-project", project.id);
  }

  function selectProjectFile(fileId: string) {
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return;
    const normalized = normalizeProject(project);
    const file = normalized.files?.find((item) => item.id === fileId);
    if (!file) return;
    const updated = { ...normalized, activeFileId: file.id, code: file.code };
    const next = projects.map((item) => item.id === project.id ? updated : item);
    setProjects(next);
    setCode(file.code);
    setExecutedCode(null);
    setOutput(`Filen «${file.name}» er åpnet.`);
    setErrorCoach(null);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
  }

  function createProjectFile() {
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return;
    const normalized = normalizeProject(project);
    const answer = window.prompt("Hva skal Python-filen hete?", `hjelp${normalized.files!.length}.py`);
    if (!answer?.trim()) return;
    const baseName = safeProjectName(answer.trim().replace(/\.py$/i, ""));
    const name = `${baseName}.py`;
    if (normalized.files!.some((file) => file.name.toLowerCase() === name.toLowerCase())) {
      setShareStatus(`Prosjektet har allerede en fil som heter «${name}».`);
      return;
    }
    const file: ProjectFile = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, code: "" };
    const updated: LocalProject = { ...normalized, files: [...normalized.files!, file], activeFileId: file.id, code: "", updatedAt: new Date().toISOString() };
    const next = projects.map((item) => item.id === project.id ? updated : item);
    setProjects(next);
    setCode("");
    setExecutedCode(null);
    setOutput(`«${name}» er opprettet. Filer i samme prosjekt kan importere hverandre.`);
    setShareStatus("");
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
  }

  function renameProjectFile() {
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return;
    const normalized = normalizeProject(project);
    const activeFile = activeProjectFile(normalized);
    const answer = window.prompt("Nytt filnavn:", activeFile.name);
    if (!answer?.trim()) return;
    const name = `${safeProjectName(answer.trim().replace(/\.py$/i, ""))}.py`;
    if (normalized.files!.some((file) => file.id !== activeFile.id && file.name.toLowerCase() === name.toLowerCase())) {
      setShareStatus(`Prosjektet har allerede en fil som heter «${name}».`);
      return;
    }
    const updated = { ...normalized, files: normalized.files!.map((file) => file.id === activeFile.id ? { ...file, name } : file) };
    const next = projects.map((item) => item.id === project.id ? updated : item);
    setProjects(next);
    setShareStatus(`Filen heter nå «${name}».`);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
  }

  function deleteProjectFile() {
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return;
    const normalized = normalizeProject(project);
    if (normalized.files!.length === 1) {
      setShareStatus("Et prosjekt må ha minst én Python-fil.");
      return;
    }
    const activeFile = activeProjectFile(normalized);
    if (!window.confirm(`Slette filen «${activeFile.name}» fra prosjektet?`)) return;
    const files = normalized.files!.filter((file) => file.id !== activeFile.id);
    const nextFile = files[0];
    const updated = { ...normalized, files, activeFileId: nextFile.id, code: nextFile.code, updatedAt: new Date().toISOString() };
    const next = projects.map((item) => item.id === project.id ? updated : item);
    setProjects(next);
    setCode(nextFile.code);
    setExecutedCode(null);
    setOutput(`«${activeFile.name}» ble slettet. «${nextFile.name}» er åpnet.`);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
  }

  function currentProjectFiles() {
    if (!playground) return [] as { name: string; content: string }[];
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return [];
    return normalizeProject(project).files!.map((file) => ({ name: file.name, content: file.id === normalizeProject(project).activeFileId ? code : file.code }));
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
    setCode(activeProjectFile(next[0]).code);
    setErrorCoach(null);
    window.localStorage.setItem("bjornsveen-python-projects", JSON.stringify(next));
    window.localStorage.setItem("bjornsveen-python-active-project", next[0].id);
  }

  function downloadProject() {
    const project = projects.find((item) => item.id === activeProjectId) ?? firstProject;
    const file = activeProjectFile(project);
    const blob = new Blob([code], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function openDesktopProject() {
    const opened = await window.bjornsveenDesktop?.openProject();
    if (!opened) return;
    const project = normalizeProject({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: opened.name,
      code: opened.code,
      updatedAt: new Date().toISOString(),
    });
    const next = [...projects, project];
    setProjects(next);
    setActiveProjectId(project.id);
    setDesktopFilePath(opened.filePath);
    setCode(opened.code);
    setOutput("Prosjektet er åpnet fra Mac-en.");
    setErrorCoach(null);
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
    const project = normalizeProject({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: safeProjectName(file.name.replace(/\.py$/i, "")),
      code: importedCode,
      updatedAt: new Date().toISOString(),
    });
    const next = [...projects, project];
    setProjects(next);
    setActiveProjectId(project.id);
    setDesktopFilePath("");
    setCode(importedCode);
    setOutput("Python-filen er importert som et lokalt prosjekt.");
    setErrorCoach(null);
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
    const snakeCanvas = document.querySelector<HTMLCanvasElement>(".snake-canvas");
    if (snakeGame && snakeCanvas) visualSources.unshift(snakeCanvas.toDataURL("image/png"));
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

  function focusErrorLine(lineNumber: number) {
    const editorId = examTrainingView ? "exam-code" : challengeView ? "challenge-code" : playground ? "playground-code" : "python-code";
    const input = document.getElementById(editorId) as HTMLTextAreaElement | null;
    if (!input) return;
    const lines = code.split("\n");
    const lineIndex = Math.max(0, Math.min(lines.length - 1, lineNumber - 1));
    const start = lines.slice(0, lineIndex).reduce((sum, line) => sum + line.length + 1, 0);
    const end = start + (lines[lineIndex]?.length ?? 0);
    input.focus();
    input.setSelectionRange(start, end);
    const lineHeight = Number.parseFloat(window.getComputedStyle(input).lineHeight) || 30;
    input.scrollTop = Math.max(0, (lineIndex - 3) * lineHeight);
  }

  function errorCoachPanel() {
    if (!errorCoach) return null;
    return (
      <section className={`error-coach is-${errorCoach.kind}`} aria-labelledby="error-coach-title">
        <header className="error-coach-heading">
          <div>
            <span className="error-coach-label">Feildetektiv</span>
            <h3 id="error-coach-title">{errorCoach.title}</h3>
          </div>
          {errorCoach.lineNumber && (
            <button type="button" onClick={() => focusErrorLine(errorCoach.lineNumber!)}>
              Gå til linje {errorCoach.lineNumber}
            </button>
          )}
        </header>
        <p className="error-coach-summary">{errorCoach.summary}</p>
        {errorCoach.lineNumber && (
          <div className="error-code-line" aria-label={`Kode på linje ${errorCoach.lineNumber}`}>
            <span>{errorCoach.lineNumber}</span>
            <code>{errorCoach.codeLine || "(tom linje)"}</code>
          </div>
        )}
        <div className="error-coach-questions">
          <strong>Undersøk før du endrer</strong>
          <ol>{errorCoach.questions.map((question) => <li key={question}>{question}</li>)}</ol>
        </div>
        <details className="error-hint">
          <summary>Vis et tydeligere hint</summary>
          <p>{errorCoach.hint}</p>
        </details>
        <details className="error-technical">
          <summary>Vis den tekniske Python-feilen</summary>
          <pre>{errorCoach.technical}</pre>
        </details>
        <p className="error-coach-next"><strong>Neste steg:</strong> Endre én liten ting, og kjør koden på nytt.</p>
      </section>
    );
  }

  function codingTutorialPanel() {
    if (!tutorialOpen) return null;
    const tutorial = filteredTutorials.find((item) => item.id === selectedTutorialId) ?? filteredTutorials[0];
    return (
      <section className="coding-help-drawer" role="dialog" aria-labelledby="coding-help-title">
        <header className="coding-help-header">
          <div>
            <span>Hjelp mens du koder</span>
            <h2 id="coding-help-title">Finn den lille detaljen</h2>
          </div>
          <button type="button" onClick={() => setTutorialOpen(false)} aria-label="Lukk kodehjelpen">Lukk</button>
        </header>

        <div className="coding-help-controls">
          <label htmlFor="tutorial-search">
            <span>Søk etter det du prøver å gjøre</span>
            <input
              id="tutorial-search"
              type="search"
              value={tutorialQuery}
              onChange={(event) => setTutorialQuery(event.target.value)}
              placeholder="Prøv: print, løkke, desimal, graf …"
              autoComplete="off"
            />
          </label>
          <label htmlFor="tutorial-category">
            <span>Emne</span>
            <select id="tutorial-category" value={tutorialCategory} onChange={(event) => setTutorialCategory(event.target.value as TutorialCategory)}>
              {tutorialCategories.map((category) => <option value={category} key={category}>{category}</option>)}
            </select>
          </label>
        </div>

        {tutorial ? (
          <div className="coding-help-body">
            <nav className="coding-help-list" aria-label="Mini-tutorials">
              <small>{filteredTutorials.length} treff</small>
              {filteredTutorials.map((item) => (
                <button
                  type="button"
                  className={tutorial.id === item.id ? "is-active" : ""}
                  aria-pressed={tutorial.id === item.id}
                  onClick={() => chooseTutorial(item)}
                  key={item.id}
                >
                  <span>{item.category}</span>
                  <strong>{item.title}</strong>
                  <small>{item.question}</small>
                </button>
              ))}
            </nav>

            <article className="coding-tutorial" key={tutorial.id}>
              <p className="coding-tutorial-category">{tutorial.category}</p>
              <h3>{tutorial.title}</h3>
              <p className="coding-tutorial-question">{tutorial.question}</p>
              <p className="coding-tutorial-intro">{tutorial.intro}</p>

              <div className="coding-tutorial-steps">
                <strong>Steg for steg</strong>
                <ol>{tutorial.steps.map((step) => <li key={step}>{step}</li>)}</ol>
              </div>

              <div className="coding-tutorial-example">
                <div><strong>Eksempel du kan endre</strong><span>Kjørbart Python</span></div>
                <pre><code>{tutorial.example}</code></pre>
                <div className="coding-tutorial-actions">
                  <button type="button" className="tutorial-insert" onClick={() => insertTutorialCode(tutorial)}>+ Sett inn ved markøren</button>
                  <button type="button" onClick={() => copyTutorialCode(tutorial)}>Kopier kode</button>
                </div>
              </div>

              <details className="coding-tutorial-notice">
                <summary>Vanlig feil å se etter</summary>
                <p>{tutorial.notice}</p>
              </details>
              <div className="coding-tutorial-challenge"><strong>Prøv selv</strong><p>{tutorial.challenge}</p></div>
              {tutorialStatus && <p className="tutorial-status" role="status">{tutorialStatus}</p>}
            </article>
          </div>
        ) : (
          <div className="coding-help-empty">
            <strong>Ingen tutorials traff søket.</strong>
            <p>Prøv et kortere ord, eller vis alle emner.</p>
            <button type="button" onClick={() => { setTutorialQuery(""); setTutorialCategory("Alle"); }}>Vis alle tutorials</button>
          </div>
        )}
      </section>
    );
  }

  function commandLibraryPanel() {
    if (!commandLibraryOpen) return null;
    const command = filteredCommands.find((item) => item.id === selectedCommandId) ?? filteredCommands[0];
    return (
      <div className="command-library-overlay" role="presentation" onMouseDown={() => setCommandLibraryOpen(false)}>
        <section ref={commandDialogRef} className="command-library" role="dialog" aria-modal="true" aria-labelledby="command-library-title" onMouseDown={(event) => event.stopPropagation()}>
          <header className="command-library-header">
            <div>
              <span>Python på vanlig norsk</span>
              <h2 id="command-library-title">Kommandobibliotek</h2>
            </div>
            <div className="command-library-total"><strong>{pythonCommands.length}</strong><small>oppslag</small></div>
            <button type="button" onClick={() => setCommandLibraryOpen(false)} aria-label="Lukk kommandobiblioteket">Lukk</button>
          </header>

          <div className="command-library-intro">
            <p><strong>Du trenger ikke vite hva kommandoen heter.</strong> Søk etter det du vil gjøre med vanlige ord.</p>
            <div aria-label="Eksempler på søk">
              {["større enn", "legg til i liste", "gjenta", "to desimaler", "tegn graf"].map((suggestion) => (
                <button type="button" onClick={() => { setCommandQuery(suggestion); setCommandCategory("Alle"); }} key={suggestion}>{suggestion}</button>
              ))}
            </div>
          </div>

          <div className="command-library-controls">
            <label htmlFor="command-search">
              <span>Søk etter tegn, kommando eller det du vil gjøre</span>
              <div>
                <span aria-hidden="true">⌕</span>
                <input
                  id="command-search"
                  type="search"
                  value={commandQuery}
                  onChange={(event) => setCommandQuery(event.target.value)}
                  placeholder="Prøv: større enn, variabel, gjennomsnitt …"
                  autoComplete="off"
                  autoFocus
                />
                {commandQuery && <button type="button" onClick={() => setCommandQuery("")}>Tøm</button>}
              </div>
            </label>
            <label htmlFor="command-category">
              <span>Vis emne</span>
              <select id="command-category" value={commandCategory} onChange={(event) => setCommandCategory(event.target.value as CommandCategory)}>
                {commandCategories.map((category) => <option value={category} key={category}>{category}</option>)}
              </select>
            </label>
          </div>

          {command ? (
            <div className="command-library-body">
              <nav className="command-result-list" aria-label="Søkeresultater i kommandobiblioteket">
                <small>{filteredCommands.length} treff</small>
                {filteredCommands.map((item) => (
                  <button
                    type="button"
                    className={command.id === item.id ? "is-active" : ""}
                    aria-pressed={command.id === item.id}
                    onClick={() => chooseCommand(item)}
                    key={item.id}
                  >
                    <code>{item.syntax}</code>
                    <strong>{item.title}</strong>
                    <span>{item.category}</span>
                  </button>
                ))}
              </nav>

              <article className="command-detail" key={command.id}>
                <p className="command-detail-category">{command.category}</p>
                <h3>{command.title}</h3>
                <code className="command-syntax">{command.syntax}</code>
                <p className="command-summary">{command.summary}</p>

                <section className="command-explanation">
                  <strong>Hva betyr det?</strong>
                  <p>{command.explanation}</p>
                </section>

                <section className="command-example">
                  <div><strong>Eksempel som virker</strong><span>Du kan endre alt</span></div>
                  <pre><code>{command.example}</code></pre>
                  {command.result && <div className="command-result"><strong>Dette vises</strong><pre>{command.result}</pre></div>}
                  <div className="command-example-actions">
                    <button type="button" className="command-insert" onClick={() => insertCommandExample(command)}>
                      {curriculumView ? "Åpne i Python" : "+ Sett inn ved markøren"}
                    </button>
                    <button type="button" onClick={() => copyCommandExample(command)}>Kopier eksempel</button>
                  </div>
                </section>

                {command.commonMistake && (
                  <div className="command-mistake"><strong>Vanlig feil</strong><p>{command.commonMistake}</p></div>
                )}

                <div className="command-related-searches">
                  <strong>Du kan også søke etter</strong>
                  <div>{command.keywords.slice(0, 7).map((keyword) => <button type="button" onClick={() => { setCommandQuery(keyword); setCommandCategory("Alle"); }} key={keyword}>{keyword}</button>)}</div>
                </div>
                {commandStatus && <p className="command-status" role="status">{commandStatus}</p>}
              </article>
            </div>
          ) : (
            <div className="command-library-empty">
              <strong>Ingen oppslag traff alle søkeordene.</strong>
              <p>Prøv ett kortere ord. Du kan for eksempel søke «større», «liste», «tilfeldig» eller selve tegnet <code>&gt;=</code>.</p>
              <button type="button" onClick={() => { setCommandQuery(""); setCommandCategory("Alle"); }}>Vis hele biblioteket</button>
            </div>
          )}
        </section>
      </div>
    );
  }

  function plotGallery() {
    if (!plotImages.length && !turtleDrawing && !snakeGame) return null;
    return (
      <div className={`plot-gallery ${turtleDrawing ? "has-turtle" : ""} ${snakeGame ? "has-game" : ""}`} aria-label={snakeGame ? "Python-spill og andre resultater" : turtleDrawing ? "Turtle-tegning og grafer" : plotImages.length === 1 ? "Graf" : `${plotImages.length} grafer`}>
        {snakeGame && <SnakePlayer config={snakeGame} onRestart={runCode} />}
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

  function variableInspector() {
    if (!pythonVariables.length) return null;
    const typeNames: Record<string, string> = {
      int: "heltall",
      float: "desimaltall",
      str: "tekst",
      bool: "sann/usann",
      list: "liste",
      tuple: "tuppel",
      dict: "ordbok",
      set: "mengde",
      ndarray: "NumPy-tabell",
      DataFrame: "tabell",
      Series: "kolonne",
    };
    const normalizedQuery = normalizeCommandSearch(variableQuery);
    const visibleVariables = pythonVariables.filter((variable) => normalizeCommandSearch(`${variable.name} ${variable.type} ${variable.value}`).includes(normalizedQuery));
    return (
      <section className="variable-inspector" aria-label="Variabler etter kjøring">
        <div className="variable-inspector-heading">
          <div><span>Etter kjøring</span><strong>Dette husker Python nå</strong></div>
          <small>{pythonVariables.length} {pythonVariables.length === 1 ? "variabel" : "variabler"}</small>
        </div>
        {pythonVariables.length > 5 && (
          <label className="variable-search"><span>Søk i variablene</span><input type="search" value={variableQuery} onChange={(event) => setVariableQuery(event.target.value)} placeholder="navn, type eller verdi" /></label>
        )}
        <div className="variable-table-wrap">
          <table>
            <thead><tr><th>Navn</th><th>Type</th><th>Størrelse</th><th>Siste verdi</th></tr></thead>
            <tbody>
              {visibleVariables.map((variable) => (
                <tr key={variable.name}>
                  <th scope="row"><code>{variable.name}</code></th>
                  <td>{typeNames[variable.type] ?? variable.type}</td>
                  <td>{variable.shape || variable.size || "én verdi"}</td>
                  <td><code>{variable.value}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Størrelse viser antall elementer eller formen på en tabell. Løkkevariabler viser den siste verdien de fikk.</p>
      </section>
    );
  }

  function tracePlayer() {
    if (!traceSteps.length) return null;
    const safeIndex = Math.min(traceIndex, traceSteps.length - 1);
    const step = traceSteps[safeIndex];
    return (
      <section className="trace-player" aria-label="Stegvis kjøring">
        <div className="trace-heading">
          <div><span>Følg programmet</span><strong>Steg {safeIndex + 1} av {traceSteps.length}</strong></div>
          <div className="trace-controls">
            <button type="button" onClick={() => setTraceIndex(0)} disabled={safeIndex === 0}>Første</button>
            <button type="button" onClick={() => setTraceIndex((current) => Math.max(0, current - 1))} disabled={safeIndex === 0}>← Forrige</button>
            <button type="button" onClick={() => setTraceIndex((current) => Math.min(traceSteps.length - 1, current + 1))} disabled={safeIndex === traceSteps.length - 1}>Neste →</button>
          </div>
        </div>
        <div className="trace-code-line"><span>{step.line}</span><code>{step.code || "(tom linje)"}</code></div>
        <p>Python står foran denne linjen. Tabellen viser verdiene som finnes akkurat nå.</p>
        {step.variables.length ? (
          <div className="trace-variables">
            {step.variables.map((variable) => <div key={variable.name}><code>{variable.name}</code><span>{variable.value}</span></div>)}
          </div>
        ) : <div className="trace-empty">Ingen egne variabler er laget ennå.</div>}
      </section>
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

  function armExecutionTimeout(worker: Worker) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      worker.terminate();
      workerRef.current = null;
      executionRef.current = null;
      setPythonInputRequest(null);
      setRunnerStatus("error");
      setOutput("Programmet brukte for lang tid og ble stoppet. Sjekk særlig løkker som kanskje aldri avsluttes.");
    }, playground ? 90000 : challengeView || examTrainingView ? 30000 : 8000);
  }

  function submitPythonInput(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const worker = workerRef.current;
    const execution = executionRef.current;
    if (!worker || !execution || !pythonInputRequest) return;
    const answer = pythonInputValue;
    setPythonInputRequest(null);
    setPythonInputValue("");
    setRunnerStatus("running");
    setOutput(`Svaret er sendt til Python. Programmet fortsetter fra samme sted …`);
    worker.postMessage({ type: "input-response", value: answer });
    armExecutionTimeout(worker);
  }

  function cancelPythonInput() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    workerRef.current?.terminate();
    workerRef.current = null;
    executionRef.current = null;
    setPythonInputRequest(null);
    setPythonInputValue("");
    setRunnerStatus("idle");
    setOutput("Kjøringen ble stoppet mens programmet ventet på et svar.");
  }

  function runCode() {
    void executeCode(code, "normal");
  }

  function runSelectedCode() {
    const editor = document.getElementById("playground-code") as HTMLTextAreaElement | null;
    const liveSelection = editor ? editor.value.slice(editor.selectionStart, editor.selectionEnd) : editorSelection.selected;
    const selected = liveSelection.trim();
    if (!selected) {
      setOutput("Marker én eller flere hele kodelinjer først. Deretter kan du kjøre bare det markerte området.");
      return;
    }
    void executeCode(liveSelection, "selection");
  }

  function runTrace() {
    if (!code.trim()) {
      setOutput("Skriv litt kode før du følger den steg for steg.");
      return;
    }
    void executeCode(code, "trace");
  }

  async function executeCode(sourceCode: string, mode: "normal" | "selection" | "trace") {
    setExecutedCode(code);
    setRunnerStatus("loading");
    setOutput(mode === "selection" ? "Kjører bare den markerte koden …" : mode === "trace" ? "Python lager en stegvis gjennomgang …" : "Starter Python … Første kjøring kan ta litt tid.");
    setPythonVariables([]);
    setTraceSteps([]);
    setTraceIndex(0);
    setErrorCoach(null);
    setFeedback("");
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setPythonInputRequest(null);
    setPythonInputValue("");

    const worker = makeWorker();
    executionRef.current = {
      code: sourceCode,
      files: [
        ...dataFiles.map(({ name, content }) => ({ name, content })),
        ...currentProjectFiles(),
      ],
      mode,
    };
    let executionStarted = false;

    worker.onmessage = (event) => {
      const data = event.data as { type: string; output?: string; error?: string; prompt?: string; index?: number; plots?: string[]; turtle?: TurtleDrawing | null; game?: SnakeGameConfig | null; variables?: PythonVariable[]; trace?: PythonTraceStep[] };
      if (data.type === "ready") {
        executionStarted = true;
        setRunnerStatus("running");
        setOutput(dataFiles.length ? `Kjører med ${dataFiles.length} datafil${dataFiles.length === 1 ? "" : "er"} …` : "Kjører …");
        worker.postMessage({ type: "run", ...executionRef.current });
        armExecutionTimeout(worker);
      }

      if (data.type === "input") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const execution = executionRef.current;
        if (!execution || (data.index ?? 0) >= 20) {
          worker.terminate();
          workerRef.current = null;
          executionRef.current = null;
          setRunnerStatus("error");
          setOutput("Programmet ba om mer enn 20 svar og ble stoppet. Sjekk om input() ligger i en løkke som aldri avsluttes.");
          return;
        }
        const prompt = data.prompt?.trim() || "Skriv et svar:";
        setRunnerStatus("input");
        setPythonInputValue("");
        setPythonInputRequest({ prompt, index: data.index ?? 0 });
        const partialOutput = data.output?.trim();
        setOutput(partialOutput ? `${partialOutput}\n\nProgrammet venter nå på et svar.` : `Programmet spør: ${prompt}`);
      }

      if (data.type === "result") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setRunnerStatus("idle");
        setErrorCoach(null);
        const nextPlots = data.plots ?? [];
        const nextTurtle = data.turtle ?? null;
        const nextGame = data.game ?? null;
        setOutput(data.output?.trim() || (nextGame ? "Snake-spillet er klart. Trykk Start og bruk piltastene." : nextTurtle ? "Turtle-tegningen kan spilles av steg for steg under." : nextPlots.length ? `${nextPlots.length === 1 ? "Grafen" : `${nextPlots.length} grafer`} vises under.` : "Koden kjørte ferdig uten utskrift."));
        setPlotImages(nextPlots);
        setPythonVariables(data.variables ?? []);
        setTraceSteps(data.trace ?? []);
        setTraceIndex(0);
        setTurtleDrawing(nextTurtle);
        setSnakeGame(nextGame);
        worker.terminate();
        workerRef.current = null;
        executionRef.current = null;
        setPythonInputRequest(null);
      }

      if (data.type === "error") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setRunnerStatus("error");
        const error = data.error || "Python stoppet uten en teknisk feilmelding.";
        setErrorCoach(analyzePythonError(error, sourceCode));
        setPythonVariables([]);
        setOutput("Python trenger litt hjelp før programmet kan kjøre ferdig.");
        worker.terminate();
        workerRef.current = null;
        executionRef.current = null;
        setPythonInputRequest(null);
      }
    };

    worker.onerror = (event) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setRunnerStatus("error");
      setErrorCoach(null);
      setPythonVariables([]);
      const detail = event.message ? ` Teknisk detalj: ${event.message}` : "";
      setOutput(
        executionStarted
          ? `Python-motoren stoppet. Prøv å kjøre på nytt.${detail}`
          : `Kunne ikke laste Python-motoren. Sjekk nettilkoblingen og prøv igjen.${detail}`,
      );
      worker.terminate();
      workerRef.current = null;
      executionRef.current = null;
      setPythonInputRequest(null);
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
  const visibleProgress = examTrainingView
    ? Math.round((completedExamTasks.length / examTasks.length) * 100)
    : challengeView
      ? Math.round((completedChallenges.length / pythonChallenges.length) * 100)
      : progress;

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Skolepython fra Bjørnsveen – hjem">
          <span className="brand-mark"><img src="./brand/kodeormen-256.png" width="58" height="58" alt="" decoding="sync" /></span>
          <span>
            <strong>Skolepython</strong>
            <small>Fra Bjørnsveen · Matematikk · 8.–10. trinn</small>
          </span>
        </a>
        <div className="module-picker">
          <label htmlFor="module-select">Velg område</label>
          <select
            id="module-select"
            value={playground ? "playground" : pygameView ? "pygame" : examTrainingView ? "exam-training" : challengeView ? "challenges" : curriculumView ? "curriculum" : libraryView ? "libraries" : String(active.id)}
            onChange={(event) => {
              if (event.target.value === "playground") choosePlayground();
              else if (event.target.value === "pygame") choosePygame();
              else if (event.target.value === "exam-training") chooseExamTraining();
              else if (event.target.value === "challenges") chooseChallenges();
              else if (event.target.value === "curriculum") chooseCurriculum();
              else if (event.target.value === "libraries") chooseLibraries();
              else chooseModule(modules[Number(event.target.value) - 1]);
            }}
          >
            <option value="playground">Python</option>
            <option value="exam-training">Eksamenstrening</option>
            <option value="challenges">Utfordringer</option>
            <option value="curriculum">Læreplanmål</option>
            <option value="libraries">Biblioteker · hjelp og eksempler</option>
            {modules.slice(0, 8).map((module) => (
              <option key={module.id} value={module.id}>
                {completed.includes(module.id) ? "✓ " : ""}Modul {module.id}: {module.shortTitle}
              </option>
            ))}
            <option value="pygame">Pygame-lab · bygg egne spill</option>
            {modules.slice(8).map((module) => (
              <option key={module.id} value={module.id}>
                {completed.includes(module.id) ? "✓ " : ""}Modul {module.id}: {module.shortTitle}
              </option>
            ))}
          </select>
          <span className="module-position">{playground ? "Python-editor" : pygameView ? "2D-spill i Python" : examTrainingView ? `${completedExamTasks.length} av ${examTasks.length} eksamensoppgaver` : challengeView ? `${completedChallenges.length} av ${pythonChallenges.length} mestret` : curriculumView ? "MAT01-06" : libraryView ? `${libraryGuides.length} bibliotek forklart` : `${completed.length} av ${modules.length} fullført`}</span>
        </div>
        <nav className="top-actions" aria-label="Verktøy">
          <button className="text-button command-library-button" type="button" onClick={() => openCommandLibrary()} aria-pressed={commandLibraryOpen}>
            <span aria-hidden="true">⌘</span> Kommandoer
          </button>
          <button className="text-button feedback-button" type="button" onClick={() => setFeedbackDialogOpen(true)}>
            Gi tilbakemelding
          </button>
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
      <div className="course-progress" aria-label={`${visibleProgress} prosent fullført`}>
        <span style={{ width: `${visibleProgress}%` }} />
      </div>

      <div className="app-shell" id="top">
        {playground && (
          <article className="lesson playground-page">
            <section className="content-section lab-section playground-lab" id="python-editor">
              <div className="section-heading lab-heading">
                <div>
                  <p className="section-label inverse"><span>&gt;_</span> Python</p>
                  <h1>Skriv og kjør</h1>
                  <p className="playground-lab-intro">Editoren starter tom. Skriv helt selv, eller hent byggeklosser fra kodebyggeren under når du trenger dem.</p>
                </div>
                <div className="live-badge"><span /> Ekte Python i nettleseren</div>
              </div>
              <div className={`code-workbench ${turtleDrawing ? "has-turtle" : ""} ${snakeGame ? "has-game" : ""}`} ref={workbenchRef}>
                <div className="editor-panel">
                  <div className="panel-bar">
                    <span><i className="dot coral" /><i className="dot cream" /><i className="dot green" /></span>
                    <strong>{activeLocalFile.name}</strong>
                    <span className="panel-tools">
                      <button type="button" className="command-help-button" onClick={() => openCommandLibrary()} aria-pressed={commandLibraryOpen}>⌘ Kommandoer</button>
                      <button type="button" className="coding-help-button" onClick={openTutorial} aria-pressed={tutorialOpen}>? Hjelp mens du koder</button>
                      <button type="button" onClick={copyCodeAsText}>Kopier kode + svar</button>
                      <button type="button" onClick={() => copyCodeAsImage(activeLocalFile.name)}>Bilde av kode + svar</button>
                      <span className="editor-size-controls" aria-label="Skriftstørrelse i kodefeltet">
                        <button type="button" onClick={() => changeEditorFontSize(-2)} disabled={editorFontSize <= 15} aria-label="Mindre kodetekst">A−</button>
                        <output aria-live="polite">{editorFontSize} px</output>
                        <button type="button" onClick={() => changeEditorFontSize(2)} disabled={editorFontSize >= 28} aria-label="Større kodetekst">A+</button>
                      </span>
                      <button type="button" onClick={toggleEditorFullscreen} aria-pressed={editorFullscreen}>{editorFullscreen ? "Avslutt fullskjerm" : "Fullskjerm"}</button>
                    </span>
                  </div>
                  <div className="project-file-tabs" aria-label="Python-filer i prosjektet">
                    <span>Filer</span>
                    <div>
                      {activeLocalProject.files!.map((file) => (
                        <button type="button" className={file.id === activeLocalProject.activeFileId ? "is-active" : ""} aria-pressed={file.id === activeLocalProject.activeFileId} onClick={() => selectProjectFile(file.id)} key={file.id}>{file.name}</button>
                      ))}
                      <button type="button" className="add-project-file" onClick={createProjectFile}>+ Ny fil</button>
                    </div>
                  </div>
                  {dataFileShelf()}
                  <label htmlFor="playground-code" className="sr-only">Skriv Python-kode</label>
                  <PythonEditor
                    id="playground-code"
                    value={code}
                    onChange={updateCode}
                    describedBy="playground-help"
                    fontSize={editorFontSize}
                    tall
                    errorLine={errorCoach?.lineNumber}
                    onSelectionChange={(start, end, selected) => setEditorSelection({ start, end, selected })}
                  />
                  <div className="editor-footer" id="playground-help">
                    <span>{editorSelection.selected.trim() ? `${editorSelection.selected.split("\n").length} markert${editorSelection.selected.includes("\n") ? "e linjer" : " linje"}` : "Marker kode for å kjøre bare en liten del."}</span>
                    <div className="editor-run-actions">
                      <button type="button" className="secondary-run-button" onClick={runSelectedCode} disabled={runnerBusy}>Kjør markert</button>
                      <button type="button" className="secondary-run-button" onClick={runTrace} disabled={runnerBusy || !code.trim()}>Følg stegvis</button>
                      <button type="button" className="run-button" onClick={runCode} disabled={runnerBusy}>
                        <span>▶</span>{runButtonLabel}
                      </button>
                    </div>
                  </div>
                </div>
                <div className={`output-panel ${resultIsStale ? "is-stale" : ""}`} aria-live="polite">
                  <div className="panel-bar output-bar">
                    <strong>Resultat</strong>
                    <span className={`status-dot ${runnerStatus}`} />
                  </div>
                  {resultIsStale && <p className="stale-result-notice" role="status"><strong>Koden er endret.</strong> Dette er resultatet fra forrige kjøring. Trykk «Kjør kode» for å oppdatere.</p>}
                  {errorCoach ? errorCoachPanel() : <pre>{output}</pre>}
                  {plotGallery()}
                  {variableInspector()}
                  {tracePlayer()}
                  <div className="output-tip"><strong>Neste spørsmål:</strong> Hva kan dere endre for å få et annet resultat?</div>
                </div>
                {codingTutorialPanel()}
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
                  <strong>Matematikk og data</strong>
                  <p>NumPy, pandas, Matplotlib, SciPy, SymPy, scikit-learn og Shapely lastes automatisk når de importeres.</p>
                </div>
                <div>
                  <strong>Bilder, nettverk og geometri</strong>
                  <p>Pillow, NetworkX, Turtle og Shapely lager bilder, forbindelser og figurer. Resultater kan vises som grafikk.</p>
                </div>
                <div>
                  <strong>Spill som virker her</strong>
                  <p>Bruk <code>from spill import Snake</code>. Det lokale spill-biblioteket gir et spillbart rutenett med tastatur og knapper.</p>
                </div>
                <div>
                  <strong>Standardbiblioteket er allerede med</strong>
                  <p><code>math</code>, <code>statistics</code>, <code>fractions</code>, <code>decimal</code>, <code>random</code>, <code>csv</code> og flere trenger ingen installasjon.</p>
                </div>
                <div>
                  <strong>Ikke helt som installert Python</strong>
                  <p>Pakker som krever maskinvare, egne systemvinduer, server eller tråder kan være uegnede selv om pakken kan importeres.</p>
                </div>
                <button type="button" className="package-library-link" onClick={chooseLibraries}><span>38 forklarte biblioteker</span><strong>Finn riktig bibliotek, forstå det og prøv et eksempel →</strong></button>
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
                <button type="button" onClick={() => updateCode(examGraphTemplate)}>Lag en eksamensklar graf</button>
                <button type="button" onClick={() => updateCode('from turtle import *\n\ncolor("#f06f51", "#f4c95d")\npensize(5)\n\nbegin_fill()\nfor side in range(4):\n    forward(120)\n    left(90)\nend_fill()\n\ndone()')}>Tegn et Turtle-kvadrat</button>
                <button type="button" onClick={() => updateCode('from turtle import *\n\nbgcolor("#fffdf8")\ncolor("#2f6b5f")\npensize(3)\n\nfor lengde in range(10, 190, 6):\n    forward(lengde)\n    left(91)\n\ndone()')}>Lag en geometrisk spiral</button>
                <button type="button" onClick={() => updateCode('import pandas as pd\n\ndata = {"navn": ["Ada", "Bo", "Celine"], "poeng": [8, 12, 10]}\ntabell = pd.DataFrame(data)\nprint(tabell.to_string(index=False))')}>Lag en tabell</button>
                <button type="button" onClick={() => { addExampleDataFile("txt"); updateCode('tall = []\n\nwith open("temperaturer.txt", encoding="utf-8") as fil:\n    for linje in fil:\n        tekst = linje.strip()\n        if tekst:\n            tall.append(float(tekst))\n\nprint("Tallene:", tall)\nprint("Gjennomsnitt:", sum(tall) / len(tall))'); }}>Les en liste fra fil</button>
                <button type="button" onClick={() => updateCode('from spill import Snake\n\nspill = Snake(bredde=18, hoyde=12, fart=6)\nspill.start()')}>Start et Snake-spill</button>
                <button type="button" onClick={() => updateCode("")}>Tøm kodefeltet</button>
              </div>
              <a className="reference-jump" href="#python-handbok">Trenger du en oppskrift? Åpne Python-håndboken ↓</a>
            </section>

            <section className="content-section playground-reference" id="python-handbok">
              <div className="reference-heading">
                <div>
                  <p className="section-label"><span>⌘</span> Python-håndbok</p>
                  <h2>Finn det du trenger – og prøv med én gang</h2>
                  <p>Dette er oppslagsverket for Python. Finn en kommando, se et komplett eksempel og åpne det som et nytt prosjekt. Det du allerede arbeider med, blir bevart.</p>
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
                  <h3>Feildetektiven hjelper – du retter</h3>
                  <p>Etter en feil får du sannsynlig linje, spørsmål og et valgfritt hint. Appen endrer aldri koden automatisk: Undersøk ett tegn eller én verdi om gangen, og kjør på nytt.</p>
                </div>
                <ul>
                  <li><code>SyntaxError</code><span>Se etter manglende kolon, parentes eller anførselstegn.</span></li>
                  <li><code>IndentationError</code><span>Kontroller innrykket etter if, for, else og def.</span></li>
                  <li><code>NameError</code><span>Er navnet skrevet likt – og laget før det brukes?</span></li>
                  <li><code>TypeError</code><span>Blander du tekst og tall på en måte Python ikke forstår?</span></li>
                  <li><code>FileNotFoundError</code><span>Er datafilen lagt til, og er filnavnet helt likt?</span></li>
                  <li><code>KeyError</code><span>Stemmer kolonnenavnet og skilletegnet med CSV-filen?</span></li>
                </ul>
              </div>
            </section>

            <section className="content-section project-section">
              <div className="project-heading">
                <div>
                  <p className="section-label"><span>⌂</span> Lokale prosjekter</p>
                  <h2>Fortsett der dere slapp</h2>
                  <p>Et prosjekt kan ha flere <code>.py</code>-filer som importerer hverandre. Alt lagres automatisk i nettleseren på denne enheten.</p>
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
                <button type="button" onClick={renameProjectFile}>Gi fil nytt navn</button>
                <button type="button" onClick={downloadProject}>Last ned åpen .py</button>
                <label className="import-button">Importer .py<input type="file" accept=".py,text/x-python" onChange={importProject} /></label>
                {window.bjornsveenDesktop?.isDesktop && <button type="button" onClick={openDesktopProject}>Åpne fra Mac</button>}
                {window.bjornsveenDesktop?.isDesktop && <button type="button" onClick={() => saveDesktopProject(false)}>Lagre</button>}
                {window.bjornsveenDesktop?.isDesktop && <button type="button" onClick={() => saveDesktopProject(true)}>Lagre som …</button>}
                <button type="button" className="delete-project-file-button" onClick={deleteProjectFile}>Slett åpen fil</button>
                <button type="button" className="delete-project-button" onClick={deleteProject}>Slett</button>
              </div>
            </section>

            <section className="content-section playground-reflection">
              <p className="section-label"><span>↻</span> Utforsk videre</p>
              <h2>En god arbeidsmåte i Python</h2>
              <ol className="question-list">
                <li><span>1</span><p>Forutsi resultatet før dere kjører.</p></li>
                <li><span>2</span><p>Endre bare én ting om gangen.</p></li>
                <li><span>3</span><p>Forklar hva endringen gjorde – og hvorfor.</p></li>
              </ol>
            </section>
          </article>
        )}

        {pygameView && (
          <article className="lesson pygame-page">
            <section className="pygame-hero">
              <div>
                <p className="section-label inverse"><span>▣</span> Pygame-lab</p>
                <h1>Lag et spill som faktisk kan spilles</h1>
                <p>Skriv vanlig <code>pygame</code>-kode, kjør den i spillflaten og styr med tastaturet. Hele spillet kjører lokalt på enheten.</p>
              </div>
              <div className="pygame-hero-note"><strong>Arbeidsmåte</strong><span>Bygg én bevegelse, én regel og én utfordring om gangen.</span><a href="#pygame-kurs">Start tutorialen med steg 1 →</a></div>
            </section>

            <section className="content-section pygame-lab-section">
              <div className="pygame-workbench">
                <div className="editor-panel">
                  <div className="panel-bar">
                    <span><i className="dot coral" /><i className="dot cream" /><i className="dot green" /></span>
                    <strong>pygame-spill.py</strong>
                    <span className="panel-tools">
                      <button type="button" onClick={loadPygameStarter}>Hent spillbart startpunkt</button>
                      <button type="button" onClick={downloadPygameCode}>Last ned .py</button>
                    </span>
                  </div>
                  <label htmlFor="pygame-code" className="sr-only">Skriv Pygame-kode</label>
                  <PythonEditor id="pygame-code" value={pygameCode} onChange={updatePygameCode} describedBy="pygame-editor-help" fontSize={editorFontSize} tall />
                  <div className="editor-footer pygame-editor-footer" id="pygame-editor-help">
                    <span>Koden lagres automatisk på denne enheten.</span>
                    <div className="editor-run-actions">
                      <button type="button" className="secondary-run-button" onClick={stopPygame}>■ Stopp og nullstill</button>
                      <button type="button" className="run-button" onClick={runPygame} disabled={pygameStatus === "running"}><span>▶</span>{pygameStatus === "running" ? "Spillet kjører" : "Start spillet"}</button>
                    </div>
                  </div>
                </div>
                <section className="pygame-stage-panel" aria-label="Pygame-resultat">
                  <div className="panel-bar output-bar">
                    <strong>Spillflate</strong>
                    <span className="panel-tools">
                      <button type="button" onClick={savePygameImage}>Lagre bilde</button>
                      <button type="button" onClick={() => pygameFrameRef.current?.requestFullscreen()}>Fullskjerm</button>
                      <i className={`status-dot ${pygameStatus}`} />
                    </span>
                  </div>
                  <div className="pygame-frame-wrap">
                    <iframe key={pygameFrameKey} ref={pygameFrameRef} src="./pygame-runner.html" title="Pygame-spillflate" allow="autoplay" />
                  </div>
                  <pre className="pygame-console" aria-live="polite">{pygameConsole}</pre>
                  <p className="pygame-focus-tip"><strong>For å styre:</strong> Klikk i spillflaten først. Deretter virker piltaster og andre taster i spillet.</p>
                </section>
              </div>
            </section>

            <section className="content-section pygame-course" id="pygame-kurs">
              <div className="pygame-course-heading">
                <div>
                  <p className="section-label"><span>▶</span> Læringssti</p>
                  <h2>Bygg «Fang mynten» i seks forståelige steg</h2>
                  <p>Hvert steg er et lite, kjørbart program. Les først, hent koden til editoren, endre én ting og spill. Til slutt har dere laget et helt spill.</p>
                </div>
                <div className="pygame-course-progress" aria-label={`${completedPygameTutorials.length} av ${pygameTutorials.length} Pygame-steg fullført`}>
                  <strong>{completedPygameTutorials.length}<span> / {pygameTutorials.length}</span></strong>
                  <small>steg utforsket</small>
                  <div><i style={{ width: `${Math.round((completedPygameTutorials.length / pygameTutorials.length) * 100)}%` }} /></div>
                </div>
              </div>

              <nav className="pygame-step-nav" aria-label="Tutorial-steg i Pygame">
                {pygameTutorials.map((tutorial) => (
                  <button
                    type="button"
                    className={tutorial.id === activePygameTutorial.id ? "is-active" : completedPygameTutorials.includes(tutorial.id) ? "is-complete" : ""}
                    aria-current={tutorial.id === activePygameTutorial.id ? "step" : undefined}
                    onClick={() => setSelectedPygameTutorialId(tutorial.id)}
                    key={tutorial.id}
                  >
                    <span>{completedPygameTutorials.includes(tutorial.id) ? "✓" : tutorial.step}</span>
                    <strong>{tutorial.shortTitle}</strong>
                  </button>
                ))}
              </nav>

              <article className="pygame-lesson-card" key={activePygameTutorial.id}>
                <header>
                  <div><span>Steg {activePygameTutorial.step} av {pygameTutorials.length}</span><h3>{activePygameTutorial.title}</h3><p>{activePygameTutorial.goal}</p></div>
                  <button type="button" className="pygame-load-step" onClick={() => loadPygameTutorial(activePygameTutorial)}>Hent steg {activePygameTutorial.step} i editoren ↑</button>
                </header>

                <div className="pygame-wonder"><span>?</span><div><strong>Tenk før dere koder</strong><p>{activePygameTutorial.question}</p></div></div>

                <div className="pygame-lesson-explanation">
                  <section>
                    <small>Forklaring</small>
                    <h4>Hva er den nye ideen?</h4>
                    <p>{activePygameTutorial.explanation}</p>
                  </section>
                  <section>
                    <small>Nye byggeklosser</small>
                    <div className="pygame-new-ideas">
                      {activePygameTutorial.newIdeas.map((idea) => <div key={idea.code}><code>{idea.code}</code><p>{idea.explanation}</p></div>)}
                    </div>
                  </section>
                </div>

                <section className="pygame-step-code">
                  <div><div><small>Hele programmet på dette steget</small><strong>Les kommentarene før dere kjører</strong></div><span><button type="button" onClick={() => copyPygameTutorial(activePygameTutorial)}>Kopier kode</button><button type="button" onClick={() => loadPygameTutorial(activePygameTutorial)}>Åpne i laben</button></span></div>
                  <pre><code>{colorPython(activePygameTutorial.code)}</code></pre>
                </section>

                <div className="pygame-investigation-grid">
                  <section><small>Observer og forklar</small><h4>Stopp og tenk</h4><ol>{activePygameTutorial.observe.map((question) => <li key={question}>{question}</li>)}</ol></section>
                  <section><small>Fikle og utforske</small><h4>Velg én endring</h4><ul>{activePygameTutorial.experiments.map((experiment) => <li key={experiment}>{experiment}</li>)}</ul></section>
                </div>

                <footer className="pygame-lesson-nav">
                  <button type="button" disabled={activePygameTutorial.step === 1} onClick={() => setSelectedPygameTutorialId(pygameTutorials[activePygameTutorial.step - 2]?.id ?? activePygameTutorial.id)}>← Forrige steg</button>
                  <button type="button" className="pygame-complete-step" onClick={() => completePygameTutorial(activePygameTutorial)}>{completedPygameTutorials.includes(activePygameTutorial.id) ? "✓ Steget er utforsket" : activePygameTutorial.step === pygameTutorials.length ? "Marker spillet som ferdig" : "Jeg har utforsket steget →"}</button>
                  <button type="button" disabled={activePygameTutorial.step === pygameTutorials.length} onClick={() => setSelectedPygameTutorialId(pygameTutorials[activePygameTutorial.step]?.id ?? activePygameTutorial.id)}>Neste steg →</button>
                </footer>
              </article>
            </section>

            <section className="content-section pygame-tutorial">
              <div className="pygame-tutorial-heading">
                <p className="section-label"><span>+</span> Hurtigoversikt</p>
                <h2>Fire deler finnes i nesten alle spill</h2>
                <p>Bruk denne oversikten når dere har fullført tutorialen og trenger en rask påminnelse.</p>
              </div>
              <div className="pygame-concepts">
                <article><span>1</span><h3>Start Pygame</h3><code>pygame.init()</code><p>Gjør spillverktøyene klare før dere lager vinduet.</p></article>
                <article><span>2</span><h3>Lag spillflaten</h3><code>pygame.display.set_mode((800, 500))</code><p>De to tallene er bredde og høyde i bildepunkter.</p></article>
                <article><span>3</span><h3>Les hendelser og taster</h3><code>pygame.key.get_pressed()</code><p>Programmet undersøker hvilke taster spilleren holder inne akkurat nå.</p></article>
                <article><span>4</span><h3>Tegn neste bilde</h3><code>pygame.display.flip()</code><p>Viser det nye bildet etter at bakgrunn og figurer er tegnet.</p></article>
              </div>
              <div className="pygame-browser-rule">
                <div><strong>Hvorfor står det <code>await asyncio.sleep(0)</code>?</strong><p>Et vanlig skrivebordsprogram kan eie spillvinduet hele tiden. I nettleseren må Pygame slippe nettleseren til mellom bildene, ellers fryser siden. Linjen endrer ikke spillreglene; den gir nettleseren tid til å vise bildet og lese tastene.</p></div>
                <ol>
                  <li>Endre fargen i <code>pygame.draw.rect</code>.</li>
                  <li>Legg til opp- og nedbevegelse med <code>K_UP</code> og <code>K_DOWN</code>.</li>
                  <li>Lag en vegg: Hva skal skje hvis <code>spiller.x &lt; 0</code>?</li>
                  <li>Lag et mål og undersøk kollisjon med <code>spiller.colliderect(maal)</code>.</li>
                </ol>
              </div>
            </section>
          </article>
        )}

        {examTrainingView && !activeExamTask && (
          <article className="lesson exam-training-page">
            <section className="exam-hero content-section">
              <div>
                <p className="section-label inverse"><span>✦</span> Eksamenstrening · MAT01-06</p>
                <h1>Les. Tolk. Bygg. Begrunn.</h1>
                <p>Øv på hele tankerekken en eksamensoppgave kan kreve: Finn matematikken i teksten, forstå koden, velg en strategi, test løsningen og forklar hvorfor svaret gir mening.</p>
                <div className="exam-hero-steps" aria-label="Arbeidsmåten i eksamenstreningen">
                  <span><b>1</b> Tolk oppgaven</span>
                  <span><b>2</b> Sjekk forståelsen</span>
                  <span><b>3</b> Bygg og test</span>
                  <span><b>4</b> Begrunn som til sensor</span>
                </div>
              </div>
              <div className="exam-progress-card" aria-label={`${completedExamTasks.length} av ${examTasks.length} eksamensoppgaver fullført`}>
                <small>Din treningsmappe</small>
                <strong>{completedExamTasks.length}<span> / {examTasks.length}</span></strong>
                <p>oppgaver forklart og testet</p>
                <div><i style={{ width: `${Math.round((completedExamTasks.length / examTasks.length) * 100)}%` }} /></div>
              </div>
            </section>

            <section className="content-section exam-foundation">
              <div>
                <p className="section-label"><span>LK</span> Ny læreplan fra 1. august 2026</p>
                <h2>Python er mer enn å skrive kode</h2>
                <p>På 10. trinn skal eleven kunne <strong>lese og forklare tekstbasert Python-kode</strong> og bruke programmering til å utforske matematikk. Oppgavene trener derfor både forståelse, regning, modellering, refleksjon og kritisk vurdering.</p>
              </div>
              <div className="exam-notice">
                <strong>Treningsoppgaver – ikke lekkede eksamensoppgaver</strong>
                <p>Oppgavene er utviklet for Skolepython med utgangspunkt i læreplanen og Udirs eksamensføringer. De viser realistiske arbeidsmåter, men er ikke offisielle Udir-oppgaver.</p>
              </div>
            </section>

            <section className="content-section exam-browser">
              <div className="exam-browser-heading">
                <div><p className="section-label"><span>→</span> Velg eksamensoppgave</p><h2>Fra trygg tolking til åpen modellering</h2></div>
                <div className="exam-filters" role="group" aria-label="Filtrer eksamensoppgaver etter nivå">
                  {examLevels.map((level) => <button type="button" className={examLevel === level ? "is-active" : ""} aria-pressed={examLevel === level} onClick={() => setExamLevel(level)} key={level}>{level}</button>)}
                </div>
              </div>
              <div className="exam-level-guide">
                <div><span className="exam-level level-grunnleggende">Grunnleggende</span><p>Én tydelig modell og korte kodelinjer.</p></div>
                <div><span className="exam-level level-sammensatt">Sammensatt</span><p>Flere matematiske og programmeringsfaglige valg må kobles sammen.</p></div>
                <div><span className="exam-level level-utforskende">Utforskende</span><p>Løsningen må bygges, vurderes og begrunnes.</p></div>
              </div>
              <div className="exam-grid">
                {filteredExamTasks.map((task) => {
                  const complete = completedExamTasks.includes(task.id);
                  const savedAttempt = Boolean(examCodes[task.id]?.trim());
                  const index = examTasks.indexOf(task) + 1;
                  return (
                    <article className={`exam-card ${complete ? "is-complete" : ""}`} key={task.id}>
                      <div className="exam-card-top"><span className={`exam-level level-${task.level.toLocaleLowerCase("nb")}`}>{task.level}</span><span>Oppgave {String(index).padStart(2, "0")}</span></div>
                      <p className="exam-area">{task.area}</p>
                      <h3>{task.title}</h3>
                      <p>{task.shortDescription}</p>
                      <div className="exam-card-facts"><span>{task.estimatedMinutes} min</span><span>{task.points} treningspoeng</span><span>{task.questions.length} tolkningsvalg</span></div>
                      <footer>
                        <span>{complete ? "✓ Forklart og testet" : savedAttempt ? "● Forsøk lagret" : "Klar når du er"}</span>
                        <button type="button" onClick={() => openExamTask(task)}>{savedAttempt ? "Fortsett" : "Start"} <b>→</b></button>
                      </footer>
                    </article>
                  );
                })}
              </div>
            </section>
          </article>
        )}

        {examTrainingView && activeExamTask && (() => {
          const taskIndex = examTasks.findIndex((task) => task.id === activeExamTask.id);
          const nextTask = examTasks[taskIndex + 1];
          const interpretationChecked = checkedExamInterpretations.includes(activeExamTask.id);
          const correctInterpretations = activeExamTask.questions.filter((question) => examAnswers[`${activeExamTask.id}:${question.id}`] === question.correctIndex).length;
          const hintCount = revealedExamHints[activeExamTask.id] ?? 0;
          const taskComplete = completedExamTasks.includes(activeExamTask.id);
          return (
            <article className="lesson exam-detail-page">
              <section className="content-section exam-detail-top">
                <button type="button" className="challenge-back" onClick={closeExamTask}>← Alle eksamensoppgaver</button>
                <div className="exam-detail-heading">
                  <div>
                    <div className="exam-detail-meta"><span className={`exam-level level-${activeExamTask.level.toLocaleLowerCase("nb")}`}>{activeExamTask.level}</span><span>Oppgave {taskIndex + 1} av {examTasks.length}</span><span>Ca. {activeExamTask.estimatedMinutes} min</span><span>{activeExamTask.points} treningspoeng</span></div>
                    <p className="exam-area">{activeExamTask.area}</p>
                    <h1>{activeExamTask.title}</h1>
                    <p>{activeExamTask.shortDescription}</p>
                  </div>
                  <div className="exam-stamp" aria-hidden="true"><small>Tren som</small><strong>sensor</strong><span>se etter tankegang</span></div>
                </div>
              </section>

              <section className="content-section exam-task-text">
                <div>
                  <p className="section-label"><span>1</span> Situasjonen</p>
                  <p className="exam-situation">{activeExamTask.situation}</p>
                  <h2>{activeExamTask.taskText}</h2>
                </div>
                <div className="exam-goals">
                  <strong>Denne oppgaven trener</strong>
                  <ul>{activeExamTask.competenceGoals.map((goal) => <li key={goal}>{goal}</li>)}</ul>
                </div>
              </section>

              <section className="content-section exam-read-code">
                <div>
                  <p className="section-label inverse"><span>2</span> Les kode før du skriver</p>
                  <h2>Følg verdiene linje for linje</h2>
                  <p>Dekk gjerne til svaralternativene først. Pek på hver linje og forklar hva Python lagrer, undersøker eller gjentar.</p>
                </div>
                <pre aria-label="Python-kode som skal tolkes"><code>{activeExamTask.sourceCode}</code></pre>
              </section>

              <section className="content-section exam-interpretation">
                <div className="exam-section-heading">
                  <div><p className="section-label"><span>3</span> Flervalg · tolk først</p><h2>Velg – og finn ut hvorfor</h2></div>
                  <p>Et feil svar er informasjon om hva du bør undersøke. Du kan endre svaret og prøve igjen.</p>
                </div>
                <div className="exam-question-list">
                  {activeExamTask.questions.map((question, questionIndex) => {
                    const answerKey = `${activeExamTask.id}:${question.id}`;
                    const selected = examAnswers[answerKey];
                    const isCorrect = selected === question.correctIndex;
                    return (
                      <fieldset className={`exam-question ${interpretationChecked ? isCorrect ? "is-correct" : "is-wrong" : ""}`} key={question.id}>
                        <legend><span>{questionIndex + 1}</span>{question.prompt}</legend>
                        <div className="exam-options">
                          {question.choices.map((choice, choiceIndex) => (
                            <label className={selected === choiceIndex ? "is-selected" : ""} key={choice.text}>
                              <input type="radio" name={answerKey} checked={selected === choiceIndex} onChange={() => chooseExamAnswer(activeExamTask, question.id, choiceIndex)} />
                              <span className="exam-option-letter">{String.fromCharCode(65 + choiceIndex)}</span>
                              <span>{choice.text}</span>
                            </label>
                          ))}
                        </div>
                        {interpretationChecked && selected !== undefined && <div className={`exam-choice-feedback ${isCorrect ? "is-correct" : "is-wrong"}`} role="status"><strong>{isCorrect ? "Godt tolket" : "Se på dette én gang til"}</strong><p>{isCorrect ? question.explanation : question.choices[selected].feedback}</p></div>}
                      </fieldset>
                    );
                  })}
                </div>
                <div className="exam-interpretation-actions">
                  <button type="button" onClick={() => checkExamInterpretation(activeExamTask)}>Sjekk tolkningen</button>
                  {interpretationChecked && <p aria-live="polite"><strong>{correctInterpretations} av {activeExamTask.questions.length}</strong> tolket riktig. {correctInterpretations === activeExamTask.questions.length ? "Nå har du et godt grunnlag for å bygge." : "Les responsen, endre svaret og prøv igjen."}</p>}
                  {!interpretationChecked && examCheckFeedback.length > 0 && <p aria-live="polite">{examCheckFeedback[0]}</p>}
                </div>
              </section>

              <section className="content-section exam-plan">
                <div>
                  <p className="section-label"><span>4</span> Lag en plan</p>
                  <h2>Fra tekst til små delproblemer</h2>
                  <p>Skriv korte stikkord før du koder. På eksamen kan en tydelig plan spare både tid og syntaksfeil.</p>
                </div>
                <ol>{activeExamTask.planPrompts.map((prompt, index) => <li key={prompt}><span>{index + 1}</span><p>{prompt}</p></li>)}</ol>
              </section>

              <section className="content-section exam-coding-mission">
                <div><p className="section-label"><span>5</span> Bygg programmet</p><h2>{activeExamTask.codingMission}</h2></div>
                <div className="exam-success"><strong>Sensor bør kunne se at</strong><ul>{activeExamTask.successCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul></div>
              </section>

              <section className="content-section exam-test-cases">
                <div><p className="section-label"><span>✓</span> Testplan</p><h2>Bestem forventningen før du kjører</h2></div>
                <div>{activeExamTask.testCases.map((testCase) => <article key={testCase.change}><strong>Endre eller prøv</strong><code>{testCase.change}</code><span>Forvent</span><p>{testCase.expect}</p><small>{testCase.why}</small></article>)}</div>
              </section>

              <section className="content-section lab-section exam-lab" id="exam-lab">
                <div className="section-heading lab-heading">
                  <div><p className="section-label inverse"><span>6</span> Python-lab</p><h2>Bygg, kjør og undersøk</h2><p className="challenge-lab-intro">Editoren starter tom. Skriv selv så langt du kommer. Startpunktet gir struktur, men ikke ferdig løsning.</p></div>
                  <div className="live-badge"><span /> Ekte Python i nettleseren</div>
                </div>
                <div className={`code-workbench exam-workbench ${turtleDrawing ? "has-turtle" : ""} ${snakeGame ? "has-game" : ""}`} ref={workbenchRef}>
                  <div className="editor-panel">
                    <div className="panel-bar">
                      <span><i className="dot coral" /><i className="dot cream" /><i className="dot green" /></span>
                      <strong>{activeExamTask.id}.py</strong>
                      <span className="panel-tools">
                        <button type="button" className="command-help-button" onClick={() => openCommandLibrary()} aria-pressed={commandLibraryOpen}>⌘ Kommandoer</button>
                        <button type="button" className="coding-help-button" onClick={openTutorial} aria-pressed={tutorialOpen}>? Hjelp mens du koder</button>
                        <button type="button" onClick={copyCodeAsText}>Kopier kode + svar</button>
                        <button type="button" onClick={() => copyCodeAsImage(`${activeExamTask.id}.py`)}>Bilde av kode + svar</button>
                        <span className="editor-size-controls" aria-label="Skriftstørrelse i kodefeltet"><button type="button" onClick={() => changeEditorFontSize(-2)} disabled={editorFontSize <= 15} aria-label="Mindre kodetekst">A−</button><output aria-live="polite">{editorFontSize} px</output><button type="button" onClick={() => changeEditorFontSize(2)} disabled={editorFontSize >= 28} aria-label="Større kodetekst">A+</button></span>
                        <button type="button" onClick={toggleEditorFullscreen} aria-pressed={editorFullscreen}>{editorFullscreen ? "Avslutt fullskjerm" : "Fullskjerm"}</button>
                      </span>
                    </div>
                    <label htmlFor="exam-code" className="sr-only">Skriv løsningen på eksamensoppgaven</label>
                    <PythonEditor id="exam-code" value={code} onChange={updateCode} describedBy="exam-editor-help" fontSize={editorFontSize} tall errorLine={errorCoach?.lineNumber} />
                    <div className="editor-footer challenge-editor-footer" id="exam-editor-help">
                      <button type="button" className="challenge-scaffold-button" onClick={() => loadExamStarter(activeExamTask)}>Hent startpunkt</button>
                      <span>Forsøket lagres lokalt på denne enheten.</span>
                      <button type="button" className="run-button" onClick={runCode} disabled={runnerBusy}><span>▶</span>{runButtonLabel}</button>
                    </div>
                  </div>
                  <div className={`output-panel ${resultIsStale ? "is-stale" : ""}`} aria-live="polite">
                    <div className="panel-bar output-bar"><strong>Resultat</strong><span className={`status-dot ${runnerStatus}`} /></div>
                    {resultIsStale && <p className="stale-result-notice" role="status"><strong>Koden er endret.</strong> Dette er resultatet fra forrige kjøring. Trykk «Kjør kode» for å oppdatere.</p>}
                    {errorCoach ? errorCoachPanel() : <pre>{output}</pre>}
                    {plotGallery()}
                    {variableInspector()}
                    {tracePlayer()}
                    <div className="output-tip"><strong>Eksamenstanke:</strong> Stemmer svaret med enheten, situasjonen og overslaget ditt?</div>
                  </div>
                  {codingTutorialPanel()}
                </div>
                {shareStatus && <p className="share-status" role="status">{shareStatus}</p>}
              </section>

              <section className="content-section exam-support">
                <div>
                  <div className="challenge-support-heading"><div><p className="section-label"><span>7</span> Gradvis hjelp</p><h2>Be om akkurat nok støtte</h2></div><span>{hintCount} av {activeExamTask.hints.length} hint åpnet</span></div>
                  <div className="challenge-hint-progress" aria-hidden="true">{activeExamTask.hints.map((hint, index) => <i className={index < hintCount ? "is-revealed" : ""} key={hint.title} />)}</div>
                  {hintCount === 0 && <div className="challenge-no-hint"><strong>Prøv planen først.</strong><p>Åpne ett hint når du kan si nøyaktig hvor du står fast.</p></div>}
                  <div className="challenge-hints">{activeExamTask.hints.slice(0, hintCount).map((hint, index) => <article key={hint.title}><div><span>Hint {index + 1}</span><small>{index === 0 ? "Retning" : index === 1 ? "Byggekloss" : "Nesten der"}</small></div><h3>{hint.title}</h3><p>{hint.body}</p>{hint.code && <pre><code>{hint.code}</code></pre>}</article>)}</div>
                  {hintCount < activeExamTask.hints.length ? <button type="button" className="reveal-hint-button" onClick={() => revealNextExamHint(activeExamTask)}>Vis hint {hintCount + 1} <span>↓</span></button> : <p className="all-hints-shown">Alle hintene er åpnet. Sammenlign dem med planen din før du ser løsningen.</p>}
                </div>
                <section className="exam-sensor-check">
                  <p className="section-label"><span>8</span> Sensorblikk</p>
                  <h2>Vis mer enn et riktig tall</h2>
                  <p>Sjekken godtar ulike variabelnavn og flere faglig riktige framgangsmåter. <strong>Rundt punkt</strong> betyr at et nødvendig krav ikke er synlig. <strong>Trekant</strong> er bare et forbedringsråd.</p>
                  <button type="button" onClick={() => checkExamAttempt(activeExamTask)} disabled={runnerBusy}>{runnerBusy ? "Vent til koden er kjørt …" : "Sjekk besvarelsen min"}</button>
                  {examCheckFeedback.length > 0 && <ul className="challenge-check-results" aria-live="polite">{examCheckFeedback.map((item) => <li className={item.startsWith("✓") ? "is-pass" : item.startsWith("△") ? "is-advice" : ""} key={item}>{item}</li>)}</ul>}
                  <blockquote>{activeExamTask.sensorTip}</blockquote>
                </section>
              </section>

              <section className="content-section exam-solution">
                <details>
                  <summary><span className="solution-lock">⌁</span><span><small>Etter et ekte forsøk</small><strong>Løsningsforslag og sensorens blikk</strong></span><b>Vis løsning</b></summary>
                  <div className="challenge-solution-content">
                    <div className="solution-code-panel"><div><strong>Én ryddig løsning</strong><span>Andre løsninger kan også være gode</span></div><pre><code>{activeExamTask.solutionCode}</code></pre><button type="button" onClick={() => loadExamSolution(activeExamTask)}>Prøv løsningen i editoren</button></div>
                    <div className="solution-walkthrough"><h3>Hvorfor gir dette uttelling?</h3><ol>{activeExamTask.solutionNotes.map((note) => <li key={note}>{note}</li>)}</ol><div className="solution-reflection"><strong>Refleksjon</strong><p>{activeExamTask.reflection}</p></div></div>
                  </div>
                </details>
              </section>

              <section className="content-section exam-complete">
                <div><p className="section-label"><span>✓</span> Avslutt som på eksamen</p><h2>Forklar løsningen uten å lese koden</h2><p>Kan du beskrive inndata, beregning, test og begrensning med egne ord? Da har du trent kompetanse – ikke bare kopiert syntaks.</p></div>
                <div className="challenge-complete-actions"><button type="button" className={taskComplete ? "is-complete" : ""} onClick={() => markExamTaskComplete(activeExamTask)}>{taskComplete ? "✓ Oppgaven er forklart og testet" : "Jeg kan forklare og vurdere løsningen"}</button>{nextTask && <button type="button" className="next-challenge-button" onClick={() => openExamTask(nextTask)}>Neste eksamensoppgave: {nextTask.title} →</button>}</div>
              </section>
            </article>
          );
        })()}

        {challengeView && !activeChallenge && (
          <article className="lesson challenges-page">
            <section className="challenge-hero content-section">
              <div>
                <p className="section-label inverse"><span>◆</span> Utfordringer</p>
                <h1>Tenk. Prøv. Oppdag.</h1>
                <p>Her trener dere programmeringslogikk gjennom små problemer som vokser i vanskelighetsgrad. Målet er ikke å skrive kortest mulig kode, men å forstå hvorfor løsningen virker.</p>
                <div className="challenge-principles" aria-label="Arbeidsmåten i utfordringene">
                  <span><b>1</b> Tenk før du skriver</span>
                  <span><b>2</b> Prøv ett lite steg</span>
                  <span><b>3</b> Hent bare hintet du trenger</span>
                  <span><b>4</b> Test med nye verdier</span>
                </div>
              </div>
              <div className="challenge-hero-progress" aria-label={`${completedChallenges.length} av ${pythonChallenges.length} utfordringer mestret`}>
                <strong>{completedChallenges.length}<small>av {pythonChallenges.length}</small></strong>
                <span>mestret</span>
                <div><i style={{ width: `${Math.round((completedChallenges.length / pythonChallenges.length) * 100)}%` }} /></div>
              </div>
            </section>

            <section className="content-section challenge-welcome">
              <div>
                <p className="section-label"><span>?</span> Slik lykkes du</p>
                <h2>Fast nok støtte – uten å ta fra deg oppdagelsen</h2>
                <p>Start med spørsmålene og et tomt kodefelt. Når du står fast, åpner du ett hint om gangen. Første hint gir bare retning; de neste viser gradvis mer struktur. Løsningsforslaget finnes, men læringen skjer i forsøket før du åpner det.</p>
              </div>
              <div className="challenge-zone-card">
                <strong>Den gode utfordringssonen</strong>
                <p>Oppgaven skal være litt for vanskelig alene, men mulig med riktig støtte. Frustrert? Ta ett hint. Full kontroll? Prøv utvidelsen eller bytt testverdier.</p>
              </div>
            </section>

            <section className="content-section challenge-browser">
              <div className="challenge-browser-heading">
                <div>
                  <p className="section-label"><span>→</span> Velg oppdrag</p>
                  <h2>Fra første mestring til skikkelig nøtt</h2>
                </div>
                <div className="challenge-filters" role="group" aria-label="Filtrer utfordringer etter nivå">
                  {challengeDifficulties.map((difficulty) => (
                    <button type="button" className={challengeDifficulty === difficulty ? "is-active" : ""} aria-pressed={challengeDifficulty === difficulty} onClick={() => setChallengeDifficulty(difficulty)} key={difficulty}>
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="challenge-level-guide">
                <div><span className="challenge-difficulty difficulty-enkel">Enkel</span><p>Én eller to byggeklosser. God start etter en modul.</p></div>
                <div><span className="challenge-difficulty difficulty-middels">Middels</span><p>Flere ideer må kobles sammen i riktig rekkefølge.</p></div>
                <div><span className="challenge-difficulty difficulty-utfordrende">Utfordrende</span><p>Problemet må deles opp, testes og forbedres.</p></div>
              </div>

              <div className="challenge-grid">
                {filteredChallenges.map((challenge, index) => {
                  const complete = completedChallenges.includes(challenge.id);
                  const savedAttempt = Boolean(challengeCodes[challenge.id]?.trim());
                  return (
                    <article className={`challenge-card ${complete ? "is-complete" : ""}`} key={challenge.id}>
                      <div className="challenge-card-top">
                        <span className={`challenge-difficulty difficulty-${challenge.difficulty.toLocaleLowerCase("nb")}`}>{challenge.difficulty}</span>
                        <span className="challenge-number">{String(pythonChallenges.indexOf(challenge) + 1).padStart(2, "0")}</span>
                      </div>
                      <p className="challenge-subject">{challenge.subject}</p>
                      <h3>{challenge.title}</h3>
                      <p>{challenge.teaser}</p>
                      <div className="challenge-concepts">{challenge.concepts.slice(0, 4).map((concept) => <code key={concept}>{concept}</code>)}</div>
                      <footer>
                        <span>{complete ? "✓ Mestret" : savedAttempt ? "● Forsøk lagret" : `Ca. ${challenge.estimatedMinutes} min`}</span>
                        <button type="button" onClick={() => openChallenge(challenge)}>{savedAttempt ? "Fortsett" : "Start utfordringen"} <b>→</b></button>
                      </footer>
                    </article>
                  );
                })}
              </div>
            </section>
          </article>
        )}

        {challengeView && activeChallenge && (() => {
          const hintCount = revealedChallengeHints[activeChallenge.id] ?? 0;
          const challengeIndex = pythonChallenges.findIndex((challenge) => challenge.id === activeChallenge.id);
          const nextChallenge = pythonChallenges[challengeIndex + 1];
          const challengeComplete = completedChallenges.includes(activeChallenge.id);
          return (
            <article className="lesson challenge-detail-page">
              <section className="challenge-detail-top content-section">
                <button type="button" className="challenge-back" onClick={closeChallenge}>← Alle utfordringer</button>
                <div className="challenge-detail-heading">
                  <div>
                    <div className="challenge-detail-meta">
                      <span className={`challenge-difficulty difficulty-${activeChallenge.difficulty.toLocaleLowerCase("nb")}`}>{activeChallenge.difficulty}</span>
                      <span>Utfordring {challengeIndex + 1} av {pythonChallenges.length}</span>
                      <span>Ca. {activeChallenge.estimatedMinutes} min</span>
                    </div>
                    <p className="challenge-subject">{activeChallenge.subject}</p>
                    <h1>{activeChallenge.title}</h1>
                    <p className="challenge-detail-teaser">{activeChallenge.teaser}</p>
                  </div>
                  <div className="challenge-detail-badge" aria-hidden="true"><span>Oppdrag</span><strong>{String(challengeIndex + 1).padStart(2, "0")}</strong></div>
                </div>
              </section>

              <section className="content-section challenge-mission">
                <div className="challenge-mission-main">
                  <p className="section-label"><span>1</span> Oppdraget</p>
                  <h2>{activeChallenge.mission}</h2>
                  <div className="challenge-brief" aria-label="Opplysninger og krav i oppgaven">
                    <section>
                      <strong>Dette får du vite</strong>
                      <ul>{activeChallenge.given.map((item) => <li key={item}>{item}</li>)}</ul>
                    </section>
                    <section>
                      <strong>Programmet ditt skal</strong>
                      <ul>{activeChallenge.programShould.map((item) => <li key={item}>{item}</li>)}</ul>
                    </section>
                  </div>
                  <div className="challenge-why"><strong>Hvorfor gjør vi dette?</strong><p>{activeChallenge.whyItMatters}</p></div>
                </div>
                <div className="challenge-success-box">
                  <strong>Dette betyr at løsningen virker</strong>
                  <ul>{activeChallenge.successCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul>
                </div>
              </section>

              <section className="content-section challenge-think-first">
                <div>
                  <p className="section-label"><span>2</span> Før du koder</p>
                  <h2>Stopp og bygg en plan</h2>
                  <p>Svar muntlig eller på papir. Det er helt greit å være usikker – spørsmålene peker mot delproblemene.</p>
                </div>
                <ol>{activeChallenge.beforeQuestions.map((question, index) => <li key={question}><span>{index + 1}</span><p>{question}</p></li>)}</ol>
              </section>

              <section className="content-section challenge-test-cases">
                <div><p className="section-label"><span>✓</span> Test før du bygger</p><h2>Hva skal programmet klare?</h2></div>
                <div>{activeChallenge.testCases.map((testCase) => <article key={testCase.change}><strong>Prøv med</strong><code>{testCase.change}</code><span>Forvent:</span><p>{testCase.expect}</p></article>)}</div>
              </section>

              <section className="content-section lab-section challenge-lab" id="challenge-lab">
                <div className="section-heading lab-heading">
                  <div>
                    <p className="section-label inverse"><span>3</span> Ditt forsøk</p>
                    <h2>Start så tomt som du tør</h2>
                    <p className="challenge-lab-intro">Skriv ett lite steg, kjør, og se hva Python forteller. Startpunktet gir kommentarer og struktur – ikke selve løsningen.</p>
                  </div>
                  <div className="live-badge"><span /> Ekte Python i nettleseren</div>
                </div>

                <div className={`code-workbench challenge-workbench ${turtleDrawing ? "has-turtle" : ""} ${snakeGame ? "has-game" : ""}`} ref={workbenchRef}>
                  <div className="editor-panel">
                    <div className="panel-bar">
                      <span><i className="dot coral" /><i className="dot cream" /><i className="dot green" /></span>
                      <strong>{activeChallenge.id}.py</strong>
                      <span className="panel-tools">
                        <button type="button" className="command-help-button" onClick={() => openCommandLibrary()} aria-pressed={commandLibraryOpen}>⌘ Kommandoer</button>
                        <button type="button" className="coding-help-button" onClick={openTutorial} aria-pressed={tutorialOpen}>? Hjelp mens du koder</button>
                        <button type="button" onClick={copyCodeAsText}>Kopier kode + svar</button>
                        <button type="button" onClick={() => copyCodeAsImage(`${activeChallenge.id}.py`)}>Bilde av kode + svar</button>
                        <span className="editor-size-controls" aria-label="Skriftstørrelse i kodefeltet">
                          <button type="button" onClick={() => changeEditorFontSize(-2)} disabled={editorFontSize <= 15} aria-label="Mindre kodetekst">A−</button>
                          <output aria-live="polite">{editorFontSize} px</output>
                          <button type="button" onClick={() => changeEditorFontSize(2)} disabled={editorFontSize >= 28} aria-label="Større kodetekst">A+</button>
                        </span>
                        <button type="button" onClick={toggleEditorFullscreen} aria-pressed={editorFullscreen}>{editorFullscreen ? "Avslutt fullskjerm" : "Fullskjerm"}</button>
                      </span>
                    </div>
                    <label htmlFor="challenge-code" className="sr-only">Skriv løsningen på utfordringen</label>
                    <PythonEditor id="challenge-code" value={code} onChange={updateCode} describedBy="challenge-editor-help" fontSize={editorFontSize} tall errorLine={errorCoach?.lineNumber} />
                    <div className="editor-footer challenge-editor-footer" id="challenge-editor-help">
                      <button type="button" className="challenge-scaffold-button" onClick={() => loadChallengeScaffold(activeChallenge)}>Hent startpunkt</button>
                      <span>Forsøket lagres lokalt på denne enheten.</span>
                      <button type="button" className="run-button" onClick={runCode} disabled={runnerBusy}>
                        <span>▶</span>{runButtonLabel}
                      </button>
                    </div>
                  </div>
                  <div className={`output-panel ${resultIsStale ? "is-stale" : ""}`} aria-live="polite">
                    <div className="panel-bar output-bar"><strong>Resultat</strong><span className={`status-dot ${runnerStatus}`} /></div>
                    {resultIsStale && <p className="stale-result-notice" role="status"><strong>Koden er endret.</strong> Dette er resultatet fra forrige kjøring. Trykk «Kjør kode» for å oppdatere.</p>}
                    {errorCoach ? errorCoachPanel() : <pre>{output}</pre>}
                    {plotGallery()}
                    {variableInspector()}
                    {tracePlayer()}
                    <div className="output-tip"><strong>Observer:</strong> Stemte resultatet med det du trodde før du kjørte?</div>
                  </div>
                  {codingTutorialPanel()}
                </div>
                {shareStatus && <p className="share-status" role="status">{shareStatus}</p>}
              </section>

              <section className="content-section challenge-support-section">
                <div className="challenge-hints-column">
                  <div className="challenge-support-heading">
                    <div><p className="section-label"><span>4</span> Hintestige</p><h2>Ta bare så mye hjelp som du trenger</h2></div>
                    <span>{hintCount} av {activeChallenge.hints.length} hint åpnet</span>
                  </div>
                  <div className="challenge-hint-progress" aria-hidden="true">{activeChallenge.hints.map((hint, index) => <i className={index < hintCount ? "is-revealed" : ""} key={hint.label} />)}</div>
                  {hintCount === 0 && <div className="challenge-no-hint"><strong>Prøv først i noen minutter.</strong><p>Når du står fast på ett bestemt punkt, åpner du det første hintet.</p></div>}
                  <div className="challenge-hints">
                    {activeChallenge.hints.slice(0, hintCount).map((hint, index) => (
                      <article key={hint.title}>
                        <div><span>Hint {index + 1}</span><small>{hint.label}</small></div>
                        <h3>{hint.title}</h3>
                        <p>{hint.body}</p>
                        {hint.code && <pre><code>{hint.code}</code></pre>}
                      </article>
                    ))}
                  </div>
                  {hintCount < activeChallenge.hints.length ? (
                    <button type="button" className="reveal-hint-button" onClick={() => revealNextChallengeHint(activeChallenge)}>
                      Vis hint {hintCount + 1}: {activeChallenge.hints[hintCount].label} <span>↓</span>
                    </button>
                  ) : <p className="all-hints-shown">Alle hintene er åpnet. Sammenlign planen med koden din før du ser på løsningsforslaget.</p>}
                </div>

                <section className="challenge-check-column">
                  <p className="section-label"><span>5</span> Mestringssjekk</p>
                  <h2>Sjekk retning – ikke bare fasit</h2>
                  <p>Sjekken godtar flere framgangsmåter og variabelnavn. Den ser etter noen viktige spor i koden og resultatet, men et åpent grønt punkt er støtte – ikke en dom over hele løsningen.</p>
                  <button type="button" onClick={() => checkChallengeAttempt(activeChallenge)} disabled={runnerBusy}>{runnerBusy ? "Vent til koden er kjørt …" : "Sjekk forsøket mitt"}</button>
                  {challengeCheckFeedback.length > 0 && <ul className="challenge-check-results" aria-live="polite">{challengeCheckFeedback.map((item) => <li className={item.startsWith("✓") ? "is-pass" : ""} key={item}>{item}</li>)}</ul>}
                  <div className="challenge-concepts-box"><strong>Byggeklosser i oppgaven</strong><div>{activeChallenge.concepts.map((concept) => <button type="button" onClick={() => openCommandLibrary(concept)} key={concept}>{concept}</button>)}</div></div>
                </section>
              </section>

              <section className="content-section challenge-solution-section">
                <details>
                  <summary>
                    <span className="solution-lock">⌁</span>
                    <span><small>Åpne når du har gjort et ekte forsøk</small><strong>Løsningsforslag med forklaring</strong></span>
                    <b>Vis løsning</b>
                  </summary>
                  <div className="challenge-solution-content">
                    <div className="solution-code-panel">
                      <div><strong>Én logisk løsning</strong><span>Ikke den eneste riktige</span></div>
                      <pre><code>{activeChallenge.solutionCode}</code></pre>
                      <button type="button" onClick={() => loadChallengeSolution(activeChallenge)}>Prøv løsningsforslaget i editoren</button>
                    </div>
                    <div className="solution-walkthrough">
                      <h3>Følg tankegangen</h3>
                      <ol>{activeChallenge.solutionWalkthrough.map((step) => <li key={step}>{step}</li>)}</ol>
                      <div className="solution-reflection"><strong>Forklar uten å se på koden</strong>{activeChallenge.reflection.map((question) => <p key={question}>{question}</p>)}</div>
                    </div>
                  </div>
                  {activeChallenge.shortcut && <details className="challenge-shortcut"><summary>✦ {activeChallenge.shortcut.title}</summary><p>{activeChallenge.shortcut.body}</p><pre><code>{activeChallenge.shortcut.code}</code></pre></details>}
                </details>
              </section>

              <section className="content-section challenge-extension">
                <div><p className="section-label"><span>+</span> Klar for mer?</p><h2>Utvid problemet</h2><p>{activeChallenge.extension}</p></div>
                <div className="challenge-complete-actions">
                  <button type="button" className={challengeComplete ? "is-complete" : ""} onClick={() => markChallengeComplete(activeChallenge)}>{challengeComplete ? "✓ Markert som mestret" : "Jeg kan forklare løsningen – marker som mestret"}</button>
                  {nextChallenge && <button type="button" className="next-challenge-button" onClick={() => openChallenge(nextChallenge)}>Neste utfordring: {nextChallenge.title} →</button>}
                </div>
              </section>
            </article>
          );
        })()}

        {curriculumView && (
          <article className="lesson curriculum-page">
            <section className="curriculum-hero content-section">
              <div>
                <p className="section-label inverse"><span>LK</span> Læreplan i matematikk · MAT01-06</p>
                <h1>Fra læreplanmål til Python-aktivitet</h1>
                <p>Her finner dere alle kompetansemålene etter 8., 9. og 10. trinn som Python kan brukes direkte i eller gi faglig støtte til. Hvert mål er koblet til en konkret arbeidsmåte, relevante verktøy og modulene som bygger kompetansen.</p>
              </div>
              <div className="curriculum-summary" aria-label="Oversikt over læreplankoblingene">
                <div><strong>{curriculumGoals.length}</strong><span>kompetansemål kartlagt</span></div>
                <div><strong>{curriculumGoals.filter((goal) => goal.fit === "Direkte").length}</strong><span>direkte Python-koblinger</span></div>
                <div><strong>8.–10.</strong><span>trinn samlet</span></div>
              </div>
            </section>

            <section className="content-section curriculum-explainer">
              <div>
                <p className="section-label"><span>?</span> Slik leser du oversikten</p>
                <h2>Python er et verktøy – matematikken er målet</h2>
                <p>«Direkte» betyr at programmering eller digitale representasjoner er en naturlig del av måloppnåelsen. «God støtte» betyr at Python egner seg godt til å utforske, kontrollere eller visualisere matematikken. «Supplerende» betyr at koden kan gi nyttige eksempler, men ikke bør erstatte hoderegning, skriftlig arbeid eller matematisk argumentasjon.</p>
              </div>
              <div className="fit-legend" aria-label="Forklaring av koblingsstyrke">
                <span className="fit-direct">Direkte</span>
                <span className="fit-support">God støtte</span>
                <span className="fit-supplement">Supplerende</span>
              </div>
            </section>

            <section className="content-section curriculum-controls" aria-label="Filtrer kompetansemål">
              <div>
                <strong>Trinn</strong>
                <div className="curriculum-filter" role="group" aria-label="Velg trinn">
                  {(["Alle", "8", "9", "10"] as CurriculumGrade[]).map((grade) => (
                    <button type="button" className={curriculumGrade === grade ? "is-active" : ""} aria-pressed={curriculumGrade === grade} onClick={() => setCurriculumGrade(grade)} key={grade}>
                      {grade === "Alle" ? "Alle trinn" : `${grade}. trinn`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <strong>Kobling til Python</strong>
                <div className="curriculum-filter" role="group" aria-label="Velg koblingsstyrke">
                  {(["Alle", "Direkte", "God støtte", "Supplerende"] as const).map((fit) => (
                    <button type="button" className={curriculumFit === fit ? "is-active" : ""} aria-pressed={curriculumFit === fit} onClick={() => setCurriculumFit(fit)} key={fit}>
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
              <output>{filteredCurriculumGoals.length} mål vises</output>
            </section>

            <div className="curriculum-grades">
              {(["8", "9", "10"] as const).map((grade) => {
                const gradeGoals = filteredCurriculumGoals.filter((goal) => goal.grade === grade);
                if (!gradeGoals.length) return null;
                return (
                  <section className="content-section curriculum-grade" key={grade}>
                    <div className="curriculum-grade-heading">
                      <div>
                        <p className="section-label"><span>{grade}</span> Etter {grade}. trinn</p>
                        <h2>{gradeGoals.length} relevante kompetansemål</h2>
                      </div>
                      <a href={curriculumSources[grade]} target="_blank" rel="noreferrer">Se originalen hos Udir ↗</a>
                    </div>
                    <div className="curriculum-grid">
                      {gradeGoals.map((goal) => (
                        <article className="curriculum-card" key={goal.id}>
                          <div className="curriculum-card-top">
                            <span className={goal.fit === "Direkte" ? "fit-direct" : goal.fit === "God støtte" ? "fit-support" : "fit-supplement"}>{goal.fit}</span>
                            <small>Kompetansemål etter {grade}. trinn</small>
                          </div>
                          <blockquote>«{goal.goal}»</blockquote>
                          <div className="curriculum-activity">
                            <strong>Slik kan Python brukes</strong>
                            <p>{goal.activity}</p>
                          </div>
                          <div className="curriculum-tools" aria-label="Relevante Python-verktøy">
                            {goal.tools.map((tool) => <span key={tool}>{tool}</span>)}
                          </div>
                          <div className="curriculum-links">
                            <button type="button" className="curriculum-python-button" onClick={choosePlayground}>Åpne Python</button>
                            {goal.moduleIds.map((moduleId) => {
                              const linkedModule = modules.find((module) => module.id === moduleId);
                              return linkedModule ? <button type="button" onClick={() => chooseModule(linkedModule)} key={moduleId}>Modul {moduleId}: {linkedModule.shortTitle}</button> : null;
                            })}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            <section className="content-section curriculum-note">
              <strong>Faglig avgrensning</strong>
              <p>Koblingene er didaktiske forslag fra Skolepython ved Bjørnsveen, ikke en del av Udirs ordlyd. Læreplanmålene er gjengitt fra MAT01-06, som gjelder fra 1. august 2026.</p>
              <div>{(["8", "9", "10"] as const).map((grade) => <a href={curriculumSources[grade]} target="_blank" rel="noreferrer" key={grade}>Udir: {grade}. trinn ↗</a>)}</div>
            </section>
          </article>
        )}

        {libraryView && (
          <article className="lesson libraries-page">
            <section className="library-hero content-section">
              <div>
                <p className="section-label inverse"><span>import</span> Biblioteker i Skolepython</p>
                <h1>Forstå verktøyet før du bruker kommandoen</h1>
                <p>Hvert bibliotek som editoren markerer som tilgjengelig, har sitt eget oppslag. Forklaringen begynner med hva biblioteket brukes til i vanlig språk. Deretter kommer import, byggeklosser, et komplett eksempel og noe dere kan utforske selv.</p>
              </div>
              <div className="library-hero-count" aria-label={`${libraryGuides.length} biblioteker dokumentert`}>
                <strong>{libraryGuides.length}</strong>
                <span>biblioteker forklart</span>
                <small>standard · offline · lokale</small>
              </div>
            </section>

            <section className="content-section library-method">
              <div><span>1</span><strong>Hva skal du gjøre?</strong><p>Start med oppgaven, ikke biblioteknavnet. Søk for eksempel etter «gjennomsnitt», «graf», «tekst» eller «spill».</p></div>
              <div><span>2</span><strong>Hva gjør biblioteket?</strong><p>Les forklaringen i vanlig språk og finn ut hvorfor verktøyet passer til akkurat denne oppgaven.</p></div>
              <div><span>3</span><strong>Prøv og endre</strong><p>Åpne hele eksemplet i Python, forutsi resultatet og endre én verdi om gangen.</p></div>
            </section>

            <section className="content-section library-directory" aria-labelledby="library-directory-title">
              <div className="library-directory-heading">
                <div><p className="section-label"><span>⌕</span> Finn bibliotek</p><h2 id="library-directory-title">Hva vil du få Python til å gjøre?</h2></div>
                <output>{filteredLibraryGuides.length} av {libraryGuides.length} vises</output>
              </div>
              <label className="library-search">
                <span>Søk med egne ord</span>
                <input type="search" value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="Prøv: gjennomsnitt, lese CSV, tegne graf, tilfeldig, spill …" />
              </label>
              <div className="library-group-filter" role="group" aria-label="Filtrer biblioteker etter område">
                {libraryGuideGroups.map((group) => <button type="button" className={libraryGroup === group ? "is-active" : ""} aria-pressed={libraryGroup === group} onClick={() => setLibraryGroup(group)} key={group}>{group}</button>)}
              </div>

              {filteredLibraryGuides.length ? (
                <div className="library-card-grid">
                  {filteredLibraryGuides.map((guide) => (
                    <button type="button" className={guide.id === activeLibraryGuide.id ? "library-card is-active" : "library-card"} aria-pressed={guide.id === activeLibraryGuide.id} onClick={() => selectLibraryGuide(guide)} key={guide.id}>
                      <span className={`library-availability ${guide.availability}`}>{guide.availability === "standard" ? "Følger med Python" : guide.availability === "offline" ? "Komplett offline" : "Laget for Skolepython"}</span>
                      <strong>{guide.name}</strong>
                      <p>{guide.tagline}</p>
                      <small>{guide.group} · {guide.level}</small>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="library-empty"><strong>Ingen treff ennå</strong><p>Prøv et enklere ord, eller velg «Alle».</p><button type="button" onClick={() => { setLibraryQuery(""); setLibraryGroup("Alle"); }}>Vis alle biblioteker</button></div>
              )}
            </section>

            <section className="content-section library-detail" id="bibliotek-detalj" key={activeLibraryGuide.id}>
              <header className="library-detail-header">
                <div>
                  <span className={`library-availability ${activeLibraryGuide.availability}`}>{activeLibraryGuide.availability === "standard" ? "Følger med Python" : activeLibraryGuide.availability === "offline" ? "Installert og virker offline" : "Laget for Skolepython"}</span>
                  <p>{activeLibraryGuide.group} · {activeLibraryGuide.level}</p>
                  <h2>{activeLibraryGuide.name}</h2>
                  <strong>{activeLibraryGuide.tagline}</strong>
                </div>
                <code>{activeLibraryGuide.importCode}</code>
              </header>

              <section className="library-plain-language">
                <p className="section-label"><span>?</span> Først: Hva bruker vi dette til?</p>
                <h3>Dette biblioteket bruker du hvis du skal …</h3>
                <p>{plainLibraryExplanation(activeLibraryGuide)}</p>
                <div>{activeLibraryGuide.useCases.map((useCase) => <span key={useCase}>{useCase}</span>)}</div>
              </section>

              <div className="library-start-grid">
                <section>
                  <p className="section-label"><span>1–3</span> Slik kommer du i gang</p>
                  <ol>{activeLibraryGuide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                </section>
                <section className="library-import-card">
                  <p className="section-label inverse"><span>import</span> Skriv dette øverst</p>
                  <pre><code>{colorPython(activeLibraryGuide.importCode)}</code></pre>
                  <p>Import-linjen gjør verktøyene tilgjengelige. Den gir vanligvis ingen utskrift alene.</p>
                </section>
              </div>

              <section className="library-command-section">
                <div><p className="section-label"><span>+</span> Viktige byggeklosser</p><h3>Kommandoer du kan begynne med</h3></div>
                <div className="library-command-grid">
                  {activeLibraryGuide.commands.map((command) => <article key={command.code}><code>{command.code}</code><p>{command.explanation}</p></article>)}
                </div>
              </section>

              <section className="library-example-section">
                <header><div><p className="section-label inverse"><span>▶</span> Komplett eksempel</p><h3>Les, forutsi, kjør og endre</h3></div><span><button type="button" onClick={() => copyLibraryExample(activeLibraryGuide)}>Kopier kode</button><button type="button" className="library-open-example" onClick={() => openLibraryExample(activeLibraryGuide)}>{activeLibraryGuide.id === "pygame" ? "Åpne i Pygame-laben" : "Åpne som nytt prosjekt"}</button></span></header>
                <pre><code>{colorPython(activeLibraryGuide.example)}</code></pre>
              </section>

              <div className="library-after-example">
                <section><p className="section-label"><span>?</span> Prøv selv</p><h3>Utforsk videre</h3><p>{activeLibraryGuide.challenge}</p></section>
                <div className="library-caution"><strong>Viktig å vite</strong><p>{activeLibraryGuide.note}</p></div>
              </div>
              {libraryStatus && <p className="library-status" role="status">{libraryStatus}</p>}
            </section>
          </article>
        )}

        {!playground && !pygameView && !curriculumView && !libraryView && !challengeView && !examTrainingView && (
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
              <small>av {String(modules.length).padStart(2, "0")}</small>
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
                    {item.reflection && (
                      <div className="theory-reflection">
                        <strong>Tenk først</strong>
                        <p>{item.reflection}</p>
                      </div>
                    )}
                    {item.why && (
                      <div className="theory-why">
                        <strong>Derfor virker det</strong>
                        <p>{item.why}</p>
                      </div>
                    )}
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
                        {(instruction.think || instruction.breakdown || instruction.why) && (
                          <div className="typing-deep-dive">
                            {instruction.think && (
                              <div className="typing-think"><strong>Tenk først</strong><p>{instruction.think}</p></div>
                            )}
                            {instruction.breakdown && (
                              <div className="typing-breakdown">
                                <strong>Dette skjer</strong>
                                <ol>{instruction.breakdown.map((step) => <li key={step}>{step}</li>)}</ol>
                              </div>
                            )}
                            {instruction.why && (
                              <div className="typing-why"><strong>Derfor virker koden</strong><p>{instruction.why}</p></div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {labTab === "solution" && (
              <div className="solution-note"><strong>Fasit er ikke låst.</strong> Endre tall, tekst eller uttrykk, kjør på nytt og se hva som skjer.</div>
            )}

            <div className={`code-workbench module-workbench ${turtleDrawing ? "has-turtle" : ""} ${snakeGame ? "has-game" : ""}`} ref={workbenchRef}>
              <div className="editor-panel">
                <div className="panel-bar">
                  <span><i className="dot coral" /><i className="dot cream" /><i className="dot green" /></span>
                  <strong>verksted.py</strong>
                  <span className="panel-tools">
                    <button type="button" className="command-help-button" onClick={() => openCommandLibrary()} aria-pressed={commandLibraryOpen}>⌘ Kommandoer</button>
                    <button type="button" className="coding-help-button" onClick={openTutorial} aria-pressed={tutorialOpen}>? Hjelp mens du koder</button>
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
                {dataFileShelf()}
                <label htmlFor="python-code" className="sr-only">Python-kode</label>
                <PythonEditor
                  id="python-code"
                  value={code}
                  onChange={updateCode}
                  describedBy="editor-help"
                  fontSize={editorFontSize}
                  errorLine={errorCoach?.lineNumber}
                />
                <div className="editor-footer" id="editor-help">
                  <span>{labTab === "practice" ? "Skriv én linje om gangen. Feil er en del av øvingen." : "Du kan endre alt i fasiten."}</span>
                  <button type="button" className="run-button" onClick={runCode} disabled={runnerBusy}>
                    <span>▶</span>{runButtonLabel}
                  </button>
                </div>
              </div>

              <div className={`output-panel ${resultIsStale ? "is-stale" : ""}`} aria-live="polite">
                <div className="panel-bar output-bar">
                  <strong>Resultat</strong>
                  <span className={`status-dot ${runnerStatus}`} />
                </div>
                {resultIsStale && <p className="stale-result-notice" role="status"><strong>Koden er endret.</strong> Dette er resultatet fra forrige kjøring. Trykk «Kjør kode» for å oppdatere.</p>}
                {errorCoach ? errorCoachPanel() : <pre>{output}</pre>}
                {plotGallery()}
                {variableInspector()}
                {tracePlayer()}
                <div className="output-tip"><strong>Observer:</strong> Stemmer resultatet med det du forventet?</div>
              </div>
              {codingTutorialPanel()}
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
      {commandLibraryPanel()}
      {turtleExpanded && turtleDrawing && (
        <div ref={turtleDialogRef} className="plot-modal turtle-modal" role="dialog" aria-modal="true" aria-label="Turtle-tegning i stor visning" onClick={() => setTurtleExpanded(false)} tabIndex={-1}>
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
        <div ref={plotDialogRef} className="plot-modal" role="dialog" aria-modal="true" aria-label={`Graf ${expandedPlotIndex + 1} i stor visning`} onClick={() => setExpandedPlotIndex(null)} tabIndex={-1}>
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
      {pythonInputRequest && (
        <div className="python-input-modal" role="presentation">
          <form ref={inputDialogRef} className="python-input-card" role="dialog" aria-modal="true" aria-labelledby="python-input-title" onSubmit={submitPythonInput}>
            <header>
              <span>Programmet ditt spør · input {pythonInputRequest.index + 1}</span>
              <h2 id="python-input-title">Skriv et svar til Python</h2>
            </header>
            <div className="python-input-body">
              <p className="python-input-prompt">{pythonInputRequest.prompt}</p>
              <label htmlFor="python-input-answer">Svaret ditt</label>
              <input
                id="python-input-answer"
                value={pythonInputValue}
                onChange={(event) => setPythonInputValue(event.target.value)}
                placeholder="Skriv her …"
                autoComplete="off"
                autoFocus
              />
              <p className="python-input-tip"><strong>Husk:</strong> <code>input()</code> gir alltid tekst. <code>int(...)</code> gjør heltallstekst om til et tall, mens <code>float(...)</code> brukes til desimaltall.</p>
            </div>
            <footer>
              <button type="button" className="python-input-cancel" onClick={cancelPythonInput}>Stopp programmet</button>
              <button type="submit" className="python-input-submit">Send svaret til Python →</button>
            </footer>
          </form>
        </div>
      )}
      {feedbackDialogOpen && (
        <div className="feedback-modal" role="presentation" onMouseDown={() => setFeedbackDialogOpen(false)}>
          <section ref={feedbackDialogRef} className="feedback-card" role="dialog" aria-modal="true" aria-labelledby="feedback-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span>Hjelp oss å bli bedre</span>
                <h2 id="feedback-title">Gi tilbakemelding</h2>
              </div>
              <button type="button" onClick={() => setFeedbackDialogOpen(false)} aria-label="Lukk tilbakemeldingsvinduet">Lukk</button>
            </header>
            <p className="feedback-intro">Fortell hva som fungerte, hva som var vanskelig eller hva dere savner. Knappen åpner e-postprogrammet med en ferdig strukturert melding.</p>

            <div className="feedback-fields">
              <label>
                <span>Hva gjelder det?</span>
                <select value={feedbackKind} onChange={(event) => setFeedbackKind(event.target.value)}>
                  <option>Forslag</option>
                  <option>Feil i appen</option>
                  <option>Faglig innhold</option>
                  <option>Lesbarhet og bruk</option>
                  <option>Ros eller annet</option>
                </select>
              </label>
              <label className="feedback-message">
                <span>Tilbakemelding <b>påkrevd</b></span>
                <textarea
                  value={feedbackMessage}
                  onChange={(event) => setFeedbackMessage(event.target.value)}
                  placeholder="Hva prøvde dere å gjøre? Hva skjedde? Hva ville gjort det bedre?"
                  rows={7}
                  autoFocus
                />
              </label>
              <div className="feedback-optional">
                <label><span>Skole <small>valgfritt</small></span><input value={feedbackSchool} onChange={(event) => setFeedbackSchool(event.target.value)} /></label>
                <label><span>Navn <small>valgfritt</small></span><input value={feedbackName} onChange={(event) => setFeedbackName(event.target.value)} /></label>
              </div>
            </div>

            <div className="feedback-privacy">
              <strong>Ingen skjult innsending</strong>
              <p>Appen lagrer ikke teksten. Du ser og kan endre hele e-posten før du sender den til <code>skolepython@gmail.com</code>.</p>
            </div>
            <footer>
              <button type="button" className="feedback-cancel" onClick={() => setFeedbackDialogOpen(false)}>Avbryt</button>
              <button type="button" className="feedback-send" onClick={composeFeedbackEmail} disabled={!feedbackMessage.trim()}>Åpne ferdig e-post →</button>
            </footer>
          </section>
        </div>
      )}
      <footer className="app-credit">
        © 2026 Eirik Ditlefsen Gaarde · tvang en stakkars KI til å lage dette programmet.
      </footer>
    </main>
  );
}
