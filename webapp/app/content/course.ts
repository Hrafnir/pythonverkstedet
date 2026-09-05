
export type Module = {
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


export const examGraphTemplate = `import numpy as np
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


export const modules: Module[] = [
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
      "Endre programmet til en regulær åttekant. Forklar hvorfor svingvinkelen er 45 grader, og bruk avspillingen til å kontrollere de åtte sidene.",
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
    title: "Utforsk et Snake-spill",
    shortTitle: "Utforsk Snake",
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
        "Eleven kan begrunne innstillinger og forklare hvilke regler som utføres inne i spill-biblioteket. Egen implementering av kropp, vekst og kollisjon er videreføring.",
      extension:
        "La elevene utvide ett_steg-funksjonen med hindringer, bonusmat eller en regel som gir ulike poeng for ulike mattyper.",
    },
  },
  {
    id: 9,
    title: "Tegn grafer/funksjoner med Python",
    shortTitle: "Funksjonsgrafer",
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
          code: `import matplotlib.pyplot as plt\n\ndef f(x):\n    return 2 * x + 3\n\nx = [-5, 0, 5]\ny = [f(verdi) for verdi in x]\n\nfig, ax = plt.subplots()\nax.plot(x, y, label="f(x) = 2x + 3")\nax.set_xlabel("x")\nax.set_ylabel("f(x)")\nax.set_xlim(-5, 5)\nax.set_ylim(-8, 14)\nax.axhline(0, color="black")\nax.axvline(0, color="black")\nax.grid()\nax.legend()\nplt.show()`,
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
    starterCode: `import matplotlib.pyplot as plt

def f(x):
    return 2 * x + 3

x = [-2, -1, 0, 1, 2, 3]
y = [f(verdi) for verdi in x]
plt.plot(x, y)
plt.xlabel("x")
plt.ylabel("f(x)")
plt.grid(True)
plt.show()`,
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
      "Endre grafprogrammet til f(x) = -3x + 6. Vis nullpunktet tydelig, bruk aksetitler, velg et fornuftig utsnitt og skriv én setning som tolker grafen.",
    taskHint: "Endre return-linjen og kontroller f(0), f(2) og f(4). Grafmalen under fordypning gir flere innstillinger. Nullpunktet er der grafen krysser x-aksen.",
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