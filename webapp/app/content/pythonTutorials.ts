export type TutorialStep = { title:string; explanation:string; code:string; check:string; experiment:string; testInputs:string[] };
export type PythonTutorial = { id:string; title:string; summary:string; minutes:number; concepts:string[]; steps:TutorialStep[] };
export const pythonTutorials: PythonTutorial[] = [
  {
    "id": "hei",
    "title": "Et program som blir kjent med deg",
    "summary": "Begynn med utskrift, variabler og svar fra brukeren.",
    "minutes": 10,
    "concepts": [
      "print",
      "variabler",
      "input",
      "int",
      "f-strenger"
    ],
    "steps": [
      {
        "title": "Vis en hilsen",
        "explanation": "print() viser tekst i resultatflaten. Anførselstegn markerer hvor teksten begynner og slutter.",
        "code": "print(\"Hei! Velkommen til Python.\")",
        "check": "Ser du hilsenen i resultatflaten?",
        "experiment": "Skriv to forskjellige hilsener.",
        "testInputs": []
      },
      {
        "title": "Husk et navn",
        "explanation": "input() venter på et svar i resultatflaten. Variabelen navn husker teksten du skrev. En f-streng setter verdien inn der det står {navn}.",
        "code": "navn = input(\"Hva heter du? \")\nprint(f\"Hei, {navn}!\")",
        "check": "Skriv Ada. Blir utskriften Hei, Ada!?",
        "experiment": "Legg til et spørsmål om favorittfargen din.",
        "testInputs": [
          "Ada"
        ]
      },
      {
        "title": "Regn med et svar",
        "explanation": "input() gir tekst, også når du skriver sifre. int() gjør heltallsteksten om til et tall. Her forutsetter vi at du skriver et heltall.",
        "code": "navn = input(\"Hva heter du? \")\nalder = int(input(\"Hvor gammel er du? \"))\nprint(f\"Hei, {navn}! Neste år blir du {alder + 1} år.\")",
        "check": "Med alder 13 skal programmet vise 14. Hvorfor ligger + 1 inni klammeparentesene?",
        "experiment": "Regn ut hvor gammel du blir om fem år.",
        "testInputs": [
          "Ada",
          "13"
        ]
      }
    ]
  },
  {
    "id": "gjett-tallet",
    "title": "Gjett det hemmelige tallet",
    "summary": "Bygg spillet ditt fra én gjetning til en løkke med hint og forsøksteller.",
    "minutes": 25,
    "concepts": [
      "random",
      "if / elif / else",
      "while",
      "bool",
      "teller",
      "try / except"
    ],
    "steps": [
      {
        "title": "Trekk et hemmelig tall",
        "explanation": "randint(1, 100) kan velge både 1 og 100. Vi viser tallet mens vi tester. Senere skjuler vi det. Variabelnavnet skrives hemmelig_tall uten omvendt skråstrek.",
        "code": "import random\n\nhemmelig_tall = random.randint(1, 100)\nprint(f\"Test: det hemmelige tallet er {hemmelig_tall}\")",
        "check": "Kjør flere ganger. Er tallet alltid innenfor intervallet? Det kan bli samme tall flere ganger.",
        "experiment": "Bytt intervallet til 1–6. Hva ligner programmet på?",
        "testInputs": []
      },
      {
        "title": "Sammenlign én gjetning",
        "explanation": "if, elif og else velger én av tre veier. == sammenligner, mens = lagrer en verdi. Bruk fire mellomrom foran koden som hører til hver gren.",
        "code": "import random\n\nhemmelig_tall = random.randint(1, 100)\nsvar = int(input(\"Gjett et tall mellom 1 og 100: \"))\n\nif svar == hemmelig_tall:\n    print(\"Riktig!\")\nelif svar < hemmelig_tall:\n    print(\"Det hemmelige tallet er høyere!\")\nelse:\n    print(\"Det hemmelige tallet er lavere!\")",
        "check": "Bytt midlertidig randint(1, 100) med 50. Test 25, 75 og 50 i tre kjøringer. Får du høyere, lavere og riktig?",
        "experiment": "Vis også hvor langt unna gjetningen er, med abs(hemmelig_tall - svar).",
        "testInputs": [
          "50"
        ]
      },
      {
        "title": "Gjenta og tell forsøk",
        "explanation": "Dette er spillet ditt med riktig innrykk. while key betyr det samme som while key == True. Alt i løkken er rykket inn fire mellomrom; utskriftene i if-grenene er rykket inn åtte. tries += 1 teller hver gjetning. key = False avslutter etter riktig svar. Svar trenger ingen startverdi, siden input setter den før den brukes.",
        "code": "import random\n\nhemmelig_tall = random.randint(1, 100)\nkey = True\ntries = 0\n\nwhile key:\n    svar = int(input(\"Gjett et tall mellom 1 og 100: \"))\n    tries += 1\n    if svar == hemmelig_tall:\n        print(f\"Du fant det hemmelige tallet! Det var {hemmelig_tall}!\")\n        print(f\"Du trengte {tries} forsøk!\")\n        key = False\n    elif svar < hemmelig_tall:\n        print(\"Det hemmelige tallet er høyere!\")\n    else:\n        print(\"Det hemmelige tallet er lavere!\")",
        "check": "Sett hemmelig_tall til 50 mens du tester. Gjett 25, 75, 50. Du skal få begge hintene, vinne på 3 forsøk, og slippe et nytt spørsmål.",
        "experiment": "Prøv å finne tallet med halvering: start på 50, og velg midten av det gjenværende intervallet. Hvor mange forsøk trenger du?",
        "testInputs": [
          "25",
          "75",
          "50"
        ]
      },
      {
        "title": "Tål feil i svaret",
        "explanation": "try / except fanger tekst som ikke kan bli et heltall. continue hopper til starten av løkken. Ugyldig tekst og tall utenfor intervallet telles ikke som forsøk, fordi telleren står etter kontrollene.",
        "code": "import random\n\nhemmelig_tall = random.randint(1, 100)\nkey = True\ntries = 0\n\nwhile key:\n    try:\n        svar = int(input(\"Gjett et tall mellom 1 og 100: \"))\n    except ValueError:\n        print(\"Skriv et heltall, for eksempel 42.\")\n        continue\n    if svar < 1 or svar > 100:\n        print(\"Tallet må være mellom 1 og 100.\")\n        continue\n    tries += 1\n    if svar == hemmelig_tall:\n        print(f\"Du fant det hemmelige tallet! Det var {hemmelig_tall}!\")\n        print(f\"Du trengte {tries} forsøk!\")\n        key = False\n    elif svar < hemmelig_tall:\n        print(\"Det hemmelige tallet er høyere!\")\n    else:\n        print(\"Det hemmelige tallet er lavere!\")",
        "check": "Test hei, 0, 101 og deretter 50 med hemmelig_tall = 50. Programmet skal forklare feilene og vise 1 gyldig forsøk.",
        "experiment": "Gi spilleren høyst 7 gyldige forsøk. Husk å vise tallet hvis spilleren taper.",
        "testInputs": [
          "hei",
          "0",
          "101",
          "50"
        ]
      }
    ]
  },
  {
    "id": "quiz",
    "title": "Lag en liten quiz",
    "summary": "Still spørsmål, sjekk svar og bygg en poengteller.",
    "minutes": 20,
    "concepts": [
      "tekst",
      "if",
      "poeng",
      "lister",
      "for"
    ],
    "steps": [
      {
        "title": "Still ett spørsmål",
        "explanation": "Vi sammenligner tekst med tekst. I dette steget må svaret skrives nøyaktig likt som fasiten.",
        "code": "svar = input(\"Hva heter hovedstaden i Norge? \")\nif svar == \"Oslo\":\n    print(\"Riktig!\")\nelse:\n    print(\"Svaret er Oslo.\")",
        "check": "Test både Oslo og oslo. Hvorfor gir de ulikt resultat?",
        "experiment": "Bytt til et spørsmål du selv finner på.",
        "testInputs": [
          "Oslo"
        ]
      },
      {
        "title": "Godta ulik skrivemåte",
        "explanation": "strip() fjerner mellomrom ytterst. lower() gjør bokstavene små. Poengene starter på null og øker bare ved riktig svar.",
        "code": "poeng = 0\nsvar = input(\"Hva heter hovedstaden i Norge? \").strip().lower()\nif svar == \"oslo\":\n    poeng += 1\n    print(\"Riktig!\")\nelse:\n    print(\"Svaret er Oslo.\")\nprint(f\"Du fikk {poeng} poeng.\")",
        "check": "Test OSLO med mellomrom rundt. Gir det fortsatt ett poeng?",
        "experiment": "Legg til et nytt spørsmål og la begge påvirke samme poengteller.",
        "testInputs": [
          " OSLO "
        ]
      },
      {
        "title": "Bruk en liste med spørsmål",
        "explanation": "Listen inneholder par: spørsmål og fasit. for henter ett par om gangen. len() teller hvor mange spørsmål listen har. Nå utvider du quizen ved å legge til data, uten å kopiere hele if-blokken.",
        "code": "sporsmal = [\n    (\"Hva heter hovedstaden i Norge? \", \"oslo\"),\n    (\"Hva er 7 ganger 8? \", \"56\"),\n    (\"Hvilket språk lærer du nå? \", \"python\"),\n]\npoeng = 0\nfor tekst, fasit in sporsmal:\n    svar = input(tekst).strip().lower()\n    if svar == fasit:\n        poeng += 1\n        print(\"Riktig!\")\n    else:\n        print(f\"Svaret er {fasit}.\")\nprint(f\"Du fikk {poeng} av {len(sporsmal)} poeng.\")",
        "check": "Svar riktig på to spørsmål og feil på ett. Blir poengsummen 2 av 3?",
        "experiment": "Legg til to egne spørsmål. Endres maksimal poengsum automatisk?",
        "testInputs": [
          "Oslo",
          "55",
          "Python"
        ]
      }
    ]
  },
  {
    "id": "kalkulator",
    "title": "Bygg en kalkulator",
    "summary": "Regn med brukerens tall og del koden opp i en funksjon.",
    "minutes": 20,
    "concepts": [
      "float",
      "regnearter",
      "vilkår",
      "funksjoner",
      "return"
    ],
    "steps": [
      {
        "title": "Legg sammen to tall",
        "explanation": "float() godtar desimaltall. Skriv punktum, for eksempel 2.5. Her forutsetter vi gyldige tall.",
        "code": "a = float(input(\"Første tall: \"))\nb = float(input(\"Andre tall: \"))\nprint(f\"Summen er {a + b}\")",
        "check": "Test 2.5 og 3.5. Får du 6.0?",
        "experiment": "Vis differansen og produktet også.",
        "testInputs": [
          "2.5",
          "3.5"
        ]
      },
      {
        "title": "La brukeren velge",
        "explanation": "Regnetegnet er tekst. if-grenene bestemmer hvilken utregning vi gjør. Kontroller null før divisjon.",
        "code": "a = float(input(\"Første tall: \"))\ntegn = input(\"Velg +, -, * eller /: \").strip()\nb = float(input(\"Andre tall: \"))\nif tegn == \"+\":\n    print(a + b)\nelif tegn == \"-\":\n    print(a - b)\nelif tegn == \"*\":\n    print(a * b)\nelif tegn == \"/\":\n    if b == 0:\n        print(\"Du kan ikke dele på null.\")\n    else:\n        print(a / b)\nelse:\n    print(\"Ukjent regnetegn.\")",
        "check": "Test 8 / 2, 8 / 0 og et ukjent regnetegn. Forklar hvilken gren som kjøres.",
        "experiment": "Legg til ** for potens.",
        "testInputs": [
          "8",
          "/",
          "0"
        ]
      },
      {
        "title": "Samle beregningen i en funksjon",
        "explanation": "def lager en funksjon med parametere. return sender et svar tilbake og avslutter funksjonen. input og print ligger utenfor, slik at beregningen kan brukes flere steder.",
        "code": "def regn(a, tegn, b):\n    if tegn == \"+\":\n        return a + b\n    if tegn == \"-\":\n        return a - b\n    if tegn == \"*\":\n        return a * b\n    if tegn == \"/\":\n        if b == 0:\n            return \"Du kan ikke dele på null.\"\n        return a / b\n    return \"Ukjent regnetegn.\"\n\na = float(input(\"Første tall: \"))\ntegn = input(\"Velg +, -, * eller /: \").strip()\nb = float(input(\"Andre tall: \"))\nprint(regn(a, tegn, b))",
        "check": "Hva returnerer regn(8, \"/\", 2)? Hvorfor trenger ikke funksjonen sin egen input()?",
        "experiment": "Bruk funksjonen to ganger med ulike tall uten å spørre brukeren.",
        "testInputs": [
          "8",
          "/",
          "2"
        ]
      }
    ]
  },
  {
    "id": "terninger",
    "title": "Undersøk terningkast",
    "summary": "Fra ett tilfeldig kast til en liste med resultater og statistikk.",
    "minutes": 15,
    "concepts": [
      "random",
      "for",
      "range",
      "liste",
      "append",
      "sum",
      "len"
    ],
    "steps": [
      {
        "title": "Kast én terning",
        "explanation": "random.randint(1, 6) velger et heltall fra 1 til 6, med begge endepunktene med.",
        "code": "import random\nkast = random.randint(1, 6)\nprint(f\"Du kastet {kast}\")",
        "check": "Kan du få både 1 og 6? Hvorfor blir ikke svaret alltid forskjellig?",
        "experiment": "Lag to terninger og vis summen.",
        "testInputs": []
      },
      {
        "title": "Kast flere ganger",
        "explanation": "range(1, 11) gir tallene 1 til 10. Løkken trekker et nytt tilfeldig tall hver gang.",
        "code": "import random\nfor nummer in range(1, 11):\n    kast = random.randint(1, 6)\n    print(f\"Kast {nummer}: {kast}\")",
        "check": "Hvor mange linjer skrives ut? Hvorfor er stopptallet 11?",
        "experiment": "Flytt randint foran løkken. Forutsi forskjellen, og test.",
        "testInputs": []
      },
      {
        "title": "Husk kastene og regn ut snittet",
        "explanation": "En liste husker flere verdier. append() legger til et kast. sum(kastene) / len(kastene) gir gjennomsnittet. For en rettferdig terning forventer vi et snitt nær 3.5 ved mange kast, men ikke nødvendigvis nøyaktig 3.5.",
        "code": "import random\nkastene = []\nfor nummer in range(100):\n    kastene.append(random.randint(1, 6))\n\nsnitt = sum(kastene) / len(kastene)\nprint(f\"Antall kast: {len(kastene)}\")\nprint(f\"Gjennomsnitt: {snitt:.2f}\")\nprint(f\"Antall seksere: {kastene.count(6)}\")",
        "check": "Kjør tre ganger. Hvorfor varierer både snittet og antall seksere?",
        "experiment": "Sammenlign 10, 100 og 1000 kast. Hold antall kast større enn null.",
        "testInputs": []
      }
    ]
  }
];
