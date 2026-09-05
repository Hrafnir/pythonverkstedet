import { examGraphTemplate } from "./course.ts";
import { mathHelpTutorials } from "../mathHelp.ts";


export const referenceCategories = ["Alle", "Kom i gang", "Matematikk", "Styring", "Byggeklosser", "Utforske data", "Tegne og vise", "Spill", "Videre"] as const;

export type ReferenceCategory = (typeof referenceCategories)[number];


export type PlaygroundReference = {
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


export const snippetCategories = ["Alle", "Kom i gang", "Styring", "Byggeklosser", "Datafiler", "Tilfeldighet", "Tegning", "Spill"] as const;

export type SnippetCategory = (typeof snippetCategories)[number];


export type CodeSnippet = {
  id: string;
  category: Exclude<SnippetCategory, "Alle">;
  title: string;
  purpose: string;
  code: string;
  change: string;
};


export const tutorialCategories = ["Alle", "Matematikk", "Biblioteker", "Utskrift", "Variabler", "Styring", "Funksjoner", "Data", "Grafikk", "Feilsøking"] as const;

export type TutorialCategory = (typeof tutorialCategories)[number];


export type QuickTutorial = {
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


export const quickTutorials: QuickTutorial[] = [
  { id: "while-growth", category: "Styring", title: "Gjenta til målet er nådd med while", question: "Hvordan gjentar jeg når jeg ikke vet antallet runder?", intro: "while undersøker vilkåret før hver runde. Verdien som styrer vilkåret må endres, ellers kan løkken fortsette uten slutt.", steps: ["Start med en kjent verdi.", "Spør om tallet fortsatt er under grensen.", "Endre verdien inne i løkken.", "Forklar hvorfor løkken til slutt stopper."], example: `tall = 3
while tall < 100:
    print(tall)
    tall = tall * 2
print("Ferdig:", tall)`, notice: "Utskriften blir 3, 6, 12, 24, 48, 96 og til slutt Ferdig: 192. Bruk Stopp hvis løkken ikke avsluttes.", challenge: "Start med 100. Hvorfor kjøres ikke kroppen i løkken?" },
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


export const codeSnippets: CodeSnippet[] = [
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


export const playgroundReferences: PlaygroundReference[] = [
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