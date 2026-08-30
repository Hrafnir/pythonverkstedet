export const examLevels = ["Alle", "Grunnleggende", "Sammensatt", "Utforskende"] as const;
export type ExamLevel = (typeof examLevels)[number];

export type ExamChoice = {
  text: string;
  feedback: string;
};

export type ExamQuestion = {
  id: string;
  prompt: string;
  choices: ExamChoice[];
  correctIndex: number;
  explanation: string;
};

export type ExamHint = {
  title: string;
  body: string;
  code?: string;
};

export type ExamTask = {
  id: string;
  level: Exclude<ExamLevel, "Alle">;
  title: string;
  area: string;
  estimatedMinutes: number;
  points: number;
  shortDescription: string;
  situation: string;
  taskText: string;
  competenceGoals: string[];
  sourceCode: string;
  questions: ExamQuestion[];
  planPrompts: string[];
  codingMission: string;
  successCriteria: string[];
  starterCode: string;
  testCases: { change: string; expect: string; why: string }[];
  hints: ExamHint[];
  solutionCode: string;
  solutionNotes: string[];
  sensorTip: string;
  reflection: string;
  checks: { label: string; codeIncludes?: string[]; outputIncludes?: string[] }[];
};

export const examTasks: ExamTask[] = [
  {
    id: "discount-code-reading",
    level: "Grunnleggende",
    title: "Forstå rabattkoden",
    area: "Prosent · personlig økonomi · kodeforståelse",
    estimatedMinutes: 20,
    points: 6,
    shortDescription: "Les et kort program, forklar vekstfaktoren og bygg en bedre utskrift.",
    situation: "En nettbutikk bruker Python til å regne ut salgsprisen på en vare.",
    taskText: "Forklar hva programmet gjør, velg riktige tolkninger og endre deretter programmet slik at det også viser hvor mange kroner kunden sparer.",
    competenceGoals: ["lese og forklare tekstbasert programkode i Python", "utforske sammenhengen mellom prosent og vekstfaktor", "hente ut og tolke informasjon ved kjøp og salg"],
    sourceCode: "pris = 1200\nrabatt = 0.30\nny_pris = pris * (1 - rabatt)\nprint(ny_pris)",
    questions: [
      {
        id: "discount-one",
        prompt: "Hva betyr tallet 1 i uttrykket (1 - rabatt)?",
        choices: [
          { text: "Én krone", feedback: "Se på rabatt som en del av hele prisen, ikke som kroner." },
          { text: "Hele den opprinnelige prisen, altså 100 %", feedback: "Riktig. 1 er det samme som 100 % når prosent skrives som desimaltall." },
          { text: "Én prosent", feedback: "Én prosent skrives 0.01. Her representerer 1 hele mengden." },
          { text: "Den første varen", feedback: "Variabelen beskriver én vare, men tallet 1 brukes her som en andel." },
        ],
        correctIndex: 1,
        explanation: "Hele prisen kan skrives som 1 eller 100 %. Når 0.30 trekkes fra 1, står 0.70 igjen. Kunden betaler derfor 70 % av den gamle prisen.",
      },
      {
        id: "discount-output",
        prompt: "Hva skriver programmet ut?",
        choices: [
          { text: "360", feedback: "360 er selve rabattbeløpet: 30 % av 1200." },
          { text: "840", feedback: "Riktig. 1200 · 0.70 = 840." },
          { text: "1200", feedback: "Det ville vært prisen uten rabatt." },
          { text: "1560", feedback: "Det tilsvarer at rabatten legges til i stedet for å trekkes fra." },
        ],
        correctIndex: 1,
        explanation: "Parentesen blir 0.70. Python regner derfor 1200 · 0.70 = 840.",
      },
    ],
    planPrompts: ["Hvilken verdi er den gamle prisen?", "Hvordan finner du bare rabattbeløpet?", "Hvordan kan utskriften gjøre svaret forståelig for en kunde?"],
    codingMission: "Skriv et program som viser både «Du sparer 360 kr» og «Ny pris er 840 kr». Bruk variablene i regnestykkene – ikke skriv svarene direkte.",
    successCriteria: ["rabattbeløpet regnes ut med pris og rabatt", "ny pris regnes ut med vekstfaktor", "begge svarene har forklarende tekst og kr"],
    starterCode: "pris = 1200\nrabatt = 0.30\n\n# Regn ut rabattbelop\n# Regn ut ny_pris\n\n# Skriv to forklarende svar",
    testCases: [
      { change: "pris = 1200, rabatt = 0.30", expect: "Du sparer 360 kr og ny pris er 840 kr", why: "Dette er tallene fra oppgaven." },
      { change: "pris = 500, rabatt = 0.20", expect: "Du sparer 100 kr og ny pris er 400 kr", why: "Nye tall avslører om programmet regner eller bare gjentar fasiten." },
    ],
    hints: [
      { title: "Skill mellom det som fjernes og det som beholdes", body: "Rabattbeløpet er rabatt-delen av prisen. Ny pris er delen som står igjen." },
      { title: "Bygg to mellomresultater", body: "Lag én variabel for hver størrelse du skal forklare.", code: "rabattbelop = pris * rabatt\nny_pris = pris * (1 - rabatt)" },
      { title: "Gjør svaret lesbart", body: "En f-tekst kan kombinere ord, variabler og enhet.", code: "print(f\"Du sparer {rabattbelop:.0f} kr.\")" },
    ],
    solutionCode: "pris = 1200\nrabatt = 0.30\n\nrabattbelop = pris * rabatt\nny_pris = pris * (1 - rabatt)\n\nprint(f\"Du sparer {rabattbelop:.0f} kr.\")\nprint(f\"Ny pris er {ny_pris:.0f} kr.\")",
    solutionNotes: ["rabattbelop finner 30 % av den gamle prisen", "1 - rabatt finner andelen kunden skal betale", ":.0f viser kroner uten unødvendige desimaler"],
    sensorTip: "En sterk besvarelse viser både regningen og hva tallene betyr. Det er bedre å skrive «840 kr er prisen etter rabatt» enn bare «840».",
    reflection: "Hvorfor er programmet mer troverdig når du tester det med en annen pris og rabatt?",
    checks: [{ label: "Rabattbeløpet beregnes", codeIncludes: ["pris * rabatt"] }, { label: "Vekstfaktoren er synlig", codeIncludes: ["1 - rabatt"] }, { label: "Begge beløp vises", outputIncludes: ["360", "840"] }],
  },
  {
    id: "taxi-linear-model",
    level: "Grunnleggende",
    title: "Hva koster taxituren?",
    area: "Lineære funksjoner · stigningstall · modell",
    estimatedMinutes: 25,
    points: 7,
    shortDescription: "Tolk startpris og kilometerpris før du lager en funksjon.",
    situation: "Et taxiselskap tar 85 kr i startpris og 17 kr per kilometer.",
    taskText: "Les koden, forklar den lineære modellen og lag en funksjon som kan regne ut prisen for valgfri kjørelengde.",
    competenceGoals: ["forklare endring per enhet og regne ut stigningstall", "modellere situasjoner og presentere resultater", "lese og forklare Python-kode"],
    sourceCode: "startpris = 85\nkm_pris = 17\nx = 8\ny = startpris + km_pris * x\nprint(y)",
    questions: [
      {
        id: "taxi-slope",
        prompt: "Hva representerer tallet 17 i modellen?",
        choices: [
          { text: "Prisen øker med 17 kr for hver kilometer", feedback: "Riktig. Dette er endring per enhet – modellens stigningstall." },
          { text: "Turen er alltid 17 km", feedback: "x er antall kilometer og kan endres." },
          { text: "Startprisen", feedback: "Startprisen er beløpet kunden betaler før bilen har kjørt." },
          { text: "Sluttprisen", feedback: "Sluttprisen avhenger av hvor langt bilen kjører." },
        ],
        correctIndex: 0,
        explanation: "17 er stigningstallet. Når x øker med 1 km, øker y med 17 kr.",
      },
      {
        id: "taxi-zero",
        prompt: "Hva blir y når x = 0, og hva betyr det?",
        choices: [
          { text: "0 kr, fordi bilen står stille", feedback: "Kunden må fortsatt betale startprisen." },
          { text: "17 kr, fordi det er kilometerprisen", feedback: "Kilometerdelen blir 17 · 0 = 0." },
          { text: "85 kr, som er startprisen", feedback: "Riktig. Skjæringen med y-aksen er startverdien i modellen." },
          { text: "102 kr, startpris pluss én kilometer", feedback: "Det ville vært prisen når x = 1." },
        ],
        correctIndex: 2,
        explanation: "Når x = 0, forsvinner kilometerleddet. Da står startverdien 85 igjen.",
      },
    ],
    planPrompts: ["Hva er uavhengig variabel?", "Hva er startverdien?", "Hva endres for hver kilometer?"],
    codingMission: "Lag funksjonen taxi_pris(km). Bruk den til å skrive forståelige priser for 0 km, 5 km og 12 km.",
    successCriteria: ["funksjonen har parameteren km", "startpris og endring per kilometer er synlige", "minst tre avstander testes"],
    starterCode: "def taxi_pris(km):\n    # Regn ut og returner prisen\n    pass\n\n# Test funksjonen med 0, 5 og 12 km",
    testCases: [
      { change: "km = 0", expect: "85 kr", why: "Tester om startverdien er med." },
      { change: "km = 5", expect: "170 kr", why: "85 + 17 · 5 = 170." },
      { change: "km = 12", expect: "289 kr", why: "Et tredje punkt styrker dokumentasjonen av modellen." },
    ],
    hints: [
      { title: "Skriv modellen med ord", body: "Totalpris = startpris + kilometerpris · antall kilometer." },
      { title: "La funksjonen levere en verdi", body: "return sender resultatet tilbake til stedet der funksjonen brukes.", code: "return 85 + 17 * km" },
      { title: "Test systematisk", body: "En løkke kan bruke samme funksjon på flere avstander.", code: "for km in [0, 5, 12]:\n    print(km, taxi_pris(km))" },
    ],
    solutionCode: "def taxi_pris(km):\n    startpris = 85\n    km_pris = 17\n    return startpris + km_pris * km\n\nfor km in [0, 5, 12]:\n    pris = taxi_pris(km)\n    print(f\"{km} km koster {pris} kr.\")",
    solutionNotes: ["parameteren km kan få ulike verdier", "17 er endring per enhet", "85 er startverdien", "løkken dokumenterer tre testtilfeller"],
    sensorTip: "Forklar alltid hva stigningstallet og konstantleddet betyr i situasjonen – ikke bare hva symbolene heter.",
    reflection: "Når kan denne enkle modellen være mindre gyldig, for eksempel ved ventetid eller ulike takster?",
    checks: [{ label: "En funksjon med km er laget", codeIncludes: ["def taxi_pris", "km"] }, { label: "Den lineære modellen er synlig", codeIncludes: ["85", "17", "*"] }, { label: "Alle tre testprisene vises", outputIncludes: ["85", "170", "289"] }],
  },
  {
    id: "savings-growth",
    level: "Sammensatt",
    title: "Når passerer sparingen målet?",
    area: "Eksponentialfunksjon · vekstfaktor · while-løkke",
    estimatedMinutes: 35,
    points: 9,
    shortDescription: "Tolk konstant prosentvis vekst og la en løkke finne tidspunktet.",
    situation: "Mina setter 12 000 kr på en konto med 4 % årlig rente. Hun vil vite når saldoen passerer 15 000 kr.",
    taskText: "Undersøk hva koden gjør, rett tankegangen dersom det trengs, og bygg et program som finner det første hele året saldoen er over målet.",
    competenceGoals: ["forklare sammenhengen mellom konstant prosentvis endring, vekstfaktor og eksponentialfunksjon", "utforske matematiske sammenhenger med programmering", "vurdere en modell"],
    sourceCode: "saldo = 12000\nrente = 0.04\nfor ar in range(1, 8):\n    saldo = saldo * (1 + rente)\n    print(ar, saldo)",
    questions: [
      {
        id: "growth-factor",
        prompt: "Hvorfor brukes (1 + rente) og ikke bare rente?",
        choices: [
          { text: "1 beholder den gamle saldoen, og rente legger til 4 %", feedback: "Riktig. Vekstfaktoren 1.04 betyr 104 % av saldoen året før." },
          { text: "1 betyr ett år", feedback: "Tallet 1 beskriver hele den gamle saldoen, ikke tid." },
          { text: "Python krever alltid + 1 i en løkke", feedback: "Løkker krever ikke dette; det kommer fra prosentmodellen." },
          { text: "Det runder av svaret", feedback: "Uttrykket endrer selve saldoen. Avrunding er en annen operasjon." },
        ],
        correctIndex: 0,
        explanation: "1.04 er vekstfaktoren: 100 % gammel saldo + 4 % rente.",
      },
      {
        id: "growth-loop",
        prompt: "Hvorfor passer en while-løkke bedre enn range(1, 8) når vi ikke kjenner året?",
        choices: [
          { text: "while skriver alltid penere svar", feedback: "Utskriften bestemmes av print, ikke løkketypen." },
          { text: "while kan fortsette helt til saldoen passerer målet", feedback: "Riktig. Stoppbetingelsen bygger på selve problemstillingen." },
          { text: "range kan ikke brukes med tall", feedback: "range er nettopp laget for heltall." },
          { text: "while regner renten automatisk", feedback: "Du må fortsatt skrive oppdateringen av saldoen." },
        ],
        correctIndex: 1,
        explanation: "Når antall runder er ukjent, kan while gjenta så lenge saldo <= mål.",
      },
    ],
    planPrompts: ["Hva er startverdien?", "Hva er vekstfaktoren?", "Hva skal være sant så lenge løkken fortsetter?", "Når skal årstelleren økes?"],
    codingMission: "Lag en while-løkke som finner det første året saldoen passerer 15 000 kr. Skriv år og saldo med to desimaler.",
    successCriteria: ["vekstfaktoren er 1.04", "saldo og år oppdateres i løkken", "løkken stopper ved målet", "svaret forklares med tekst"],
    starterCode: "saldo = 12000\nrente = 0.04\nmal = 15000\nar = 0\n\n# Gjenta så lenge saldoen ikke har passert målet\n\n# Skriv år og saldo",
    testCases: [
      { change: "start 12000, rente 4 %, mål 15000", expect: "år 6, omtrent 15183.83 kr", why: "Dette er hovedoppgaven." },
      { change: "mål = 12400", expect: "år 1", why: "Tester at første oppdatering og årstelling skjer i riktig rekkefølge." },
    ],
    hints: [
      { title: "Formuler stoppgrensen", body: "Løkken skal fortsette mens saldoen er mindre enn eller lik målet." },
      { title: "To ting endrer seg", body: "Både saldo og antall år må oppdateres én gang per runde.", code: "saldo *= 1 + rente\nar += 1" },
      { title: "Sett delene sammen", body: "Start på år 0, oppdater saldoen, og øk deretter årstelleren med 1." },
    ],
    solutionCode: "saldo = 12000\nrente = 0.04\nmal = 15000\nar = 0\n\nwhile saldo <= mal:\n    saldo *= 1 + rente\n    ar += 1\n\nprint(f\"Saldoen passerer målet etter {ar} år.\")\nprint(f\"Da er saldoen {saldo:.2f} kr.\")",
    solutionNotes: ["saldo <= mal beskriver når programmet skal fortsette", "saldo *= 1.04 bruker den nye saldoen som grunnlag hvert år", "årstelleren følger samme antall oppdateringer som saldoen"],
    sensorTip: "Et svar med full uttelling forklarer at renten beregnes av en saldo som vokser. Det er derfor utviklingen er eksponentiell, ikke lineær.",
    reflection: "Modellen antar samme rente hvert år. Hvordan påvirker det hvor gyldig svaret er?",
    checks: [{ label: "Programmet bruker while og målet", codeIncludes: ["while", "mal"] }, { label: "Saldo og år oppdateres", codeIncludes: ["saldo", "+= 1"] }, { label: "Riktig år finnes", outputIncludes: ["6", "15183"] }],
  },
  {
    id: "statistics-outlier",
    level: "Sammensatt",
    title: "Målingen som ikke passer inn",
    area: "Statistikk · lister · kritisk vurdering",
    estimatedMinutes: 35,
    points: 9,
    shortDescription: "Finn gjennomsnittet, oppdag en mulig feil og vurder datagrunnlaget.",
    situation: "En elevgruppe måler lengden på samme bord i centimeter og får resultatene 124, 125, 123, 124, 182 og 125.",
    taskText: "Les programmet og vurder hva gjennomsnittet forteller. Lag deretter kode som finner gjennomsnittet og peker ut målinger som ligger mer enn 20 cm fra det.",
    competenceGoals: ["modellere situasjoner og vurdere hvor gyldige modellene er", "bruke programmering til å utforske sammenhenger", "argumentere og vurdere kritisk egne og andres løsninger"],
    sourceCode: "malinger = [124, 125, 123, 124, 182, 125]\ngjennomsnitt = sum(malinger) / len(malinger)\nprint(gjennomsnitt)",
    questions: [
      {
        id: "stats-mean",
        prompt: "Hvorfor kan gjennomsnittet gi et misvisende bilde her?",
        choices: [
          { text: "Listen har for mange tall", feedback: "Seks målinger kan brukes, men kvaliteten på tallene må vurderes." },
          { text: "182 ligger langt fra de andre og trekker gjennomsnittet opp", feedback: "Riktig. En ekstremverdi kan påvirke gjennomsnittet mye." },
          { text: "Python kan ikke regne gjennomsnitt", feedback: "sum delt på len er en gyldig måte å finne gjennomsnittet på." },
          { text: "Centimeter kan ikke brukes i statistikk", feedback: "Målinger i centimeter kan analyseres statistisk." },
        ],
        correctIndex: 1,
        explanation: "De fleste målingene ligger rundt 124–125 cm. 182 cm kan være en måle- eller skrivefeil og flytter gjennomsnittet tydelig.",
      },
      {
        id: "stats-action",
        prompt: "Hva er den mest faglig forsvarlige neste handlingen?",
        choices: [
          { text: "Slette 182 uten å si fra", feedback: "Data bør ikke fjernes uten begrunnelse og dokumentasjon." },
          { text: "Godta alle tall fordi Python regnet dem ut", feedback: "Koden regner riktig på tallene, men kan ikke vite om målingen er troverdig." },
          { text: "Kontrollere målingen og vise resultat både med og uten den", feedback: "Riktig. Da vurderer du datakvalitet og gjør valget synlig." },
          { text: "Endre 182 til 128 fordi det ser bedre ut", feedback: "En antakelse må ikke erstatte en faktisk kontrollmåling." },
        ],
        correctIndex: 2,
        explanation: "Matematisk modellering krever at vi vurderer datagrunnlaget, ikke bare utfører regningen.",
      },
    ],
    planPrompts: ["Hvordan finner du gjennomsnittet?", "Hvordan går du gjennom én måling om gangen?", "Hvordan finner du avstanden fra gjennomsnittet uansett hvilken side tallet ligger på?"],
    codingMission: "Finn gjennomsnittet. Bruk en løkke og abs til å skrive ut målinger som ligger mer enn 20 cm fra gjennomsnittet.",
    successCriteria: ["gjennomsnittet beregnes fra listen", "alle målinger undersøkes i en løkke", "absolutt avstand sammenlignes med 20", "programmet peker ut 182"],
    starterCode: "malinger = [124, 125, 123, 124, 182, 125]\n\n# Finn gjennomsnittet\n\n# Undersøk hver måling\n# Skriv ut mulige avvik",
    testCases: [
      { change: "den oppgitte listen", expect: "gjennomsnitt 133.83 og mulig avvik 182", why: "Viser hvordan ekstremverdien påvirker gjennomsnittet." },
      { change: "[124, 125, 123, 124, 126, 125]", expect: "ingen mulige avvik", why: "Tester at programmet ikke alltid varsler." },
    ],
    hints: [
      { title: "Finn sentrum først", body: "Bruk summen av verdiene delt på antall verdier." },
      { title: "Avstand skal være positiv", body: "abs gjør både -48 og 48 om til en avstand på 48.", code: "avstand = abs(maling - gjennomsnitt)" },
      { title: "Undersøk alle", body: "Legg if-testen med innrykk inni en for-løkke." },
    ],
    solutionCode: "malinger = [124, 125, 123, 124, 182, 125]\n\ngjennomsnitt = sum(malinger) / len(malinger)\nprint(f\"Gjennomsnitt: {gjennomsnitt:.2f} cm\")\n\nfor maling in malinger:\n    avstand = abs(maling - gjennomsnitt)\n    if avstand > 20:\n        print(f\"Mulig avvik: {maling} cm\")",
    solutionNotes: ["sum / len finner gjennomsnittet", "abs gjør forskjellen om til en positiv avstand", "if-testen bruker den valgte grensen på 20 cm"],
    sensorTip: "Sensor ser etter vurdering, ikke bare kode. Forklar hvorfor 182 bør undersøkes, og at det ikke automatisk kan slettes.",
    reflection: "Ville medianen vært et bedre sentralmål her? Begrunn uten å bare svare ja eller nei.",
    checks: [{ label: "Gjennomsnittet beregnes", codeIncludes: ["sum(", "len("] }, { label: "Avstanden undersøkes", codeIncludes: ["abs(", "> 20"] }, { label: "Avviket oppdages", outputIncludes: ["182"] }],
  },
  {
    id: "dice-simulation",
    level: "Sammensatt",
    title: "Hvor ofte blir summen sju?",
    area: "Sannsynlighet · simulering · løkker",
    estimatedMinutes: 35,
    points: 9,
    shortDescription: "Tolk en simulering og skill mellom teoretisk og eksperimentell sannsynlighet.",
    situation: "To vanlige terninger kastes. En elev vil undersøke hvor ofte summen blir 7.",
    taskText: "Forklar hva programmet simulerer, og bygg en forbedret versjon som gjennomfører 10 000 forsøk og viser andelen både som desimaltall og prosent.",
    competenceGoals: ["utforske matematiske egenskaper og sammenhenger ved programmering", "simulere tilfeldige forsøk", "vurdere resultater kritisk"],
    sourceCode: "import random\ntreff = 0\nfor forsok in range(100):\n    a = random.randint(1, 6)\n    b = random.randint(1, 6)\n    if a + b == 7:\n        treff += 1\nprint(treff / 100)",
    questions: [
      {
        id: "dice-counter",
        prompt: "Når øker variabelen treff?",
        choices: [
          { text: "Etter hvert kast, uansett resultat", feedback: "Innrykket viser at økningen bare skjer under if-vilkåret." },
          { text: "Når en av terningene viser 7", feedback: "En vanlig terning kan bare vise 1 til 6." },
          { text: "Når summen av terningene er 7", feedback: "Riktig. if-testen styrer når telleren øker." },
          { text: "Bare på det sjuende forsøket", feedback: "7 i koden beskriver summen, ikke nummeret på forsøket." },
        ],
        correctIndex: 2,
        explanation: "treff teller antall gunstige utfall. Den økes bare når a + b == 7 er sant.",
      },
      {
        id: "dice-variation",
        prompt: "Hvorfor kan programmet gi litt forskjellig svar hver gang?",
        choices: [
          { text: "Python regner unøyaktig", feedback: "Divisjonen er nøyaktig nok; variasjonen kommer fra tilfeldige kast." },
          { text: "Forsøkene er tilfeldige, og 100 forsøk er et begrenset utvalg", feedback: "Riktig. Flere forsøk gir vanligvis en mer stabil andel." },
          { text: "Summen 7 endrer verdi", feedback: "Tallet 7 er konstant." },
          { text: "range hopper over noen forsøk", feedback: "range(100) gir nøyaktig 100 runder." },
        ],
        correctIndex: 1,
        explanation: "En simulering gir en eksperimentell sannsynlighet. Den nærmer seg ofte den teoretiske verdien 6/36 ≈ 16,7 % når antall forsøk øker.",
      },
    ],
    planPrompts: ["Hva teller alle forsøk?", "Hva teller gunstige utfall?", "Hvordan regnes andelen?", "Hvordan gjøres et desimaltall om til prosent?"],
    codingMission: "Simuler 10 000 kast med to terninger. Skriv antall treff, andel og prosent med én desimal.",
    successCriteria: ["begge terningene trekkes tilfeldig i hver runde", "treff øker bare ved sum 7", "andelen bruker treff / antall_forsok", "prosenten forklares"],
    starterCode: "import random\n\nantall_forsok = 10000\ntreff = 0\n\n# Gjenta forsøket\n# Kast to terninger\n# Tell sum 7\n\n# Regn ut og skriv andelen",
    testCases: [
      { change: "10 000 forsøk", expect: "en prosent som ofte ligger nær 16,7 %", why: "Mange forsøk gjør resultatet mer stabilt." },
      { change: "100 forsøk", expect: "større variasjon mellom kjøringer", why: "Viser forskjellen på sannsynlighet og ett tilfeldig resultat." },
    ],
    hints: [
      { title: "Lag ett tilfeldig utfall", body: "randint(1, 6) gir et heltall fra og med 1 til og med 6." },
      { title: "Tell bare gunstige utfall", body: "if-linjen og treff += 1 skal ligge inni løkken." },
      { title: "Fra antall til prosent", body: "Andel er treff delt på forsøk. Prosent er andelen ganger 100.", code: "andel = treff / antall_forsok\nprosent = andel * 100" },
    ],
    solutionCode: "import random\n\nantall_forsok = 10000\ntreff = 0\n\nfor forsok in range(antall_forsok):\n    a = random.randint(1, 6)\n    b = random.randint(1, 6)\n    if a + b == 7:\n        treff += 1\n\nandel = treff / antall_forsok\nprosent = andel * 100\nprint(f\"Treff: {treff}\")\nprint(f\"Andel: {andel:.3f}\")\nprint(f\"Prosent: {prosent:.1f} %\")",
    solutionNotes: ["løkka gjør 10 000 uavhengige forsøk", "treff er en teller", "andelen vil variere litt mellom kjøringer", "6 av 36 mulige kombinasjoner gir sum 7"],
    sensorTip: "Ikke påstå at simuleringen beviser den eksakte sannsynligheten. Sammenlign resultatet med 1/6 og kommenter tilfeldig variasjon.",
    reflection: "Hvorfor blir ikke resultatet nødvendigvis nøyaktig 16,7 %, selv med 10 000 forsøk?",
    checks: [{ label: "To terninger simuleres", codeIncludes: ["random.randint", "a", "b"] }, { label: "Sum 7 telles", codeIncludes: ["a + b == 7", "+= 1"] }, { label: "Resultatet viser prosent", outputIncludes: ["prosent", "%"] }],
  },
  {
    id: "right-triangle-exam",
    level: "Sammensatt",
    title: "Er hjørnet rett?",
    area: "Pytagoras · vilkår · måleusikkerhet",
    estimatedMinutes: 35,
    points: 10,
    shortDescription: "Bruk Pytagoras i kode og vurder hva måleusikkerhet gjør med svaret.",
    situation: "Et skaperverksted måler tre sider i en trekant til 60 cm, 80 cm og 100 cm for å kontrollere et hjørne.",
    taskText: "Tolk koden og lag et program som undersøker om trekanten er rettvinklet. Utvid det deretter slik at små måleavvik kan godtas.",
    competenceGoals: ["bruke regneregler og matematiske sammenhenger", "utforske med programmering", "vurdere hvor gyldig en modell er"],
    sourceCode: "a = 60\nb = 80\nc = 100\nprint(a ** 2 + b ** 2 == c ** 2)",
    questions: [
      {
        id: "triangle-output",
        prompt: "Hva skriver koden ut, og hvorfor?",
        choices: [
          { text: "True, fordi 60² + 80² = 100²", feedback: "Riktig. Sammenligningen er sann for disse målene." },
          { text: "100, fordi c er lengst", feedback: "print skriver resultatet av sammenligningen, ikke variabelen c." },
          { text: "False, fordi alle sidene er ulike", feedback: "En rettvinklet trekant trenger ikke ha like sider." },
          { text: "En syntaksfeil", feedback: "** og == er gyldige operatorer i Python." },
        ],
        correctIndex: 0,
        explanation: "Venstresiden blir 3600 + 6400 = 10000, det samme som 100².",
      },
      {
        id: "triangle-measurement",
        prompt: "Hvorfor kan == være for strengt med virkelige målinger?",
        choices: [
          { text: "Python kan ikke sammenligne tall", feedback: "Python kan sammenligne tall, men målinger er sjelden helt eksakte." },
          { text: "Et avvik på noen millimeter kan gjøre to beregnede tall ulike", feedback: "Riktig. En toleranse kan være mer realistisk enn helt nøyaktig likhet." },
          { text: "== betyr at variabelen får en verdi", feedback: "= gir verdi; == sammenligner." },
          { text: "Pytagoras gjelder bare for heltall", feedback: "Pytagoras gjelder også når sidene er desimaltall." },
        ],
        correctIndex: 1,
        explanation: "En modell av målinger må ta hensyn til måleusikkerhet. Derfor kan vi undersøke om forskjellen er liten nok.",
      },
    ],
    planPrompts: ["Hvilken side må være lengst?", "Hva sammenligner Pytagoras?", "Hvordan kan abs uttrykke størrelsen på et avvik?"],
    codingMission: "Lag et program som sorterer tre sidelengder, bruker Pytagoras og skriver en konklusjon. Godta et avvik i de kvadrerte sidene på maksimalt 25.",
    successCriteria: ["lengste side velges sikkert", "Pytagoras er synlig", "abs brukes til avvik", "if/else gir en forståelig konklusjon"],
    starterCode: "sider = [60, 80, 100]\nsider.sort()\na, b, c = sider\n\n# Finn avviket mellom a² + b² og c²\n# Sammenlign med toleransen 25\n# Skriv en konklusjon",
    testCases: [
      { change: "[60, 80, 100]", expect: "rettvinklet", why: "Et eksakt pytagoreisk trippel." },
      { change: "[60, 80, 100.2]", expect: "ikke rettvinklet med toleranse 25", why: "Tester den valgte grensen og måleusikkerheten." },
    ],
    hints: [
      { title: "Gjør rekkefølgen trygg", body: "Etter sortering er c den lengste siden." },
      { title: "Finn størrelsen på forskjellen", body: "abs gjør avviket positivt uansett hvilken side som er størst.", code: "avvik = abs(a ** 2 + b ** 2 - c ** 2)" },
      { title: "Trekk en tydelig konklusjon", body: "Sammenlign avviket med toleransen i et if-vilkår." },
    ],
    solutionCode: "sider = [60, 80, 100]\nsider.sort()\na, b, c = sider\ntoleranse = 25\n\navvik = abs(a ** 2 + b ** 2 - c ** 2)\n\nif avvik <= toleranse:\n    print(f\"Trekanten kan regnes som rettvinklet. Avvik: {avvik:.2f}\")\nelse:\n    print(f\"Trekanten er ikke rettvinklet. Avvik: {avvik:.2f}\")",
    solutionNotes: ["sortering sikrer at c er lengst", "Pytagoras sammenlignes som én forskjell", "toleransen er et modellvalg som må begrunnes"],
    sensorTip: "Toleransen 25 er ikke en universell sannhet. Full uttelling krever at du forklarer at grensen må passe målemetode og enhet.",
    reflection: "Hvordan ville konklusjonen endret seg hvis måleutstyret bare var nøyaktig til nærmeste centimeter?",
    checks: [{ label: "Sidene sorteres", codeIncludes: ["sort"] }, { label: "Avviket fra Pytagoras beregnes", codeIncludes: ["abs(", "** 2"] }, { label: "Programmet konkluderer", outputIncludes: ["rettvinklet", "avvik"] }],
  },
  {
    id: "ticket-equation-search",
    level: "Utforskende",
    title: "Finn billettfordelingen",
    area: "Ligningssett · systematisk søk · algoritme",
    estimatedMinutes: 45,
    points: 12,
    shortDescription: "Gjør et ligningssett om til et systematisk Python-søk.",
    situation: "På en forestilling ble det solgt 120 billetter. Voksenbilletten kostet 150 kr, barnebilletten 90 kr, og inntekten ble 14 400 kr.",
    taskText: "Tolk søkekoden og lag et program som finner hvor mange voksen- og barnebilletter som ble solgt. Forklar hvorfor søket finner alle muligheter.",
    competenceGoals: ["lage, løse og forklare ligningssett knyttet til praktiske situasjoner", "utforske sammenhenger ved programmering", "forklare en algoritme"],
    sourceCode: "for voksne in range(121):\n    barn = 120 - voksne\n    inntekt = 150 * voksne + 90 * barn\n    if inntekt == 14400:\n        print(voksne, barn)",
    questions: [
      {
        id: "tickets-range",
        prompt: "Hvorfor brukes range(121)?",
        choices: [
          { text: "Fordi det er 121 billetter", feedback: "Det er 120 billetter, men antall voksne kan ha 121 mulige heltallsverdier." },
          { text: "For å teste 0 til og med 120 voksenbilletter", feedback: "Riktig. Stoppverdien 121 er ikke med." },
          { text: "For å gjenta beregningen 121 ganger for samme verdi", feedback: "voksne får en ny verdi i hver runde." },
          { text: "Fordi inntekten deles på 121", feedback: "range styrer bare verdiene som testes." },
        ],
        correctIndex: 1,
        explanation: "Antall voksne kan være 0, 1, 2, …, 120. Det er 121 muligheter.",
      },
      {
        id: "tickets-relation",
        prompt: "Hvorfor settes barn = 120 - voksne?",
        choices: [
          { text: "Fordi barn alltid er billigere", feedback: "Prisen forklarer ikke antallet." },
          { text: "Fordi antall voksne og barn til sammen må være 120", feedback: "Riktig. Dette bygger inn den første likningen i algoritmen." },
          { text: "For at barn skal bli et negativt tall", feedback: "I det valgte området blir barn fra 120 ned til 0." },
          { text: "Fordi Python ikke kan bruke to løkker", feedback: "To løkker er mulig, men unødvendig når den ene verdien bestemmer den andre." },
        ],
        correctIndex: 1,
        explanation: "Likningen voksne + barn = 120 kan skrives om til barn = 120 - voksne.",
      },
    ],
    planPrompts: ["Hvilke to krav må være oppfylt samtidig?", "Hvilke heltallsverdier er mulige?", "Hvordan kan én ukjent bestemmes når den andre er valgt?"],
    codingMission: "Bygg søket selv og skriv en full setning med løsningen. Legg også inn en teller som viser hvor mange kandidater programmet undersøkte før det fant svaret.",
    successCriteria: ["alle mulige voksenantall kan testes", "barneantallet følger totalen 120", "inntekten kontrolleres", "løsningen og antall undersøkte kandidater forklares"],
    starterCode: "antall_billetter = 120\nmal_inntekt = 14400\nundersokt = 0\n\n# Test alle mulige antall voksenbilletter\n# Finn antall barn\n# Regn ut inntekten\n# Skriv løsningen når begge krav stemmer",
    testCases: [
      { change: "120 billetter og 14 400 kr", expect: "60 voksne og 60 barn", why: "150 · 60 + 90 · 60 = 14 400." },
      { change: "20 billetter og 2400 kr", expect: "10 voksne og 10 barn", why: "Tester at modellen kan brukes med andre totaler." },
    ],
    hints: [
      { title: "La én ukjent styre den andre", body: "Når voksne er valgt, må resten av billettene være barn." },
      { title: "Test inntektskravet", body: "Regn ut inntekten for hver kandidat og sammenlign med målet." },
      { title: "Tell arbeidet", body: "Øk undersokt én gang i hver runde, før if-testen.", code: "undersokt += 1" },
    ],
    solutionCode: "antall_billetter = 120\nmal_inntekt = 14400\nundersokt = 0\n\nfor voksne in range(antall_billetter + 1):\n    undersokt += 1\n    barn = antall_billetter - voksne\n    inntekt = 150 * voksne + 90 * barn\n    if inntekt == mal_inntekt:\n        print(f\"Det ble solgt {voksne} voksenbilletter og {barn} barnebilletter.\")\n        print(f\"Programmet undersøkte {undersokt} kandidater.\")\n        break",
    solutionNotes: ["range dekker alle ikke-negative heltallsløsninger", "første krav brukes til å finne barn", "andre krav kontrolleres i if-testen", "break stopper når løsningen er funnet"],
    sensorTip: "Koden alene er ikke hele svaret. Forklar hvordan de to kravene fra teksten finnes igjen i programmet.",
    reflection: "Hva er fordelen og ulempen med systematisk søk sammenlignet med å løse ligningssettet algebraisk?",
    checks: [{ label: "Alle kandidater kan testes", codeIncludes: ["for", "range"] }, { label: "Begge kravene brukes", codeIncludes: ["120", "14400"] }, { label: "Riktig fordeling vises", outputIncludes: ["60", "60"] }],
  },
  {
    id: "water-model-validity",
    level: "Utforskende",
    title: "Når slutter modellen å gi mening?",
    area: "Modellering · funksjon · gyldighet",
    estimatedMinutes: 45,
    points: 12,
    shortDescription: "Bruk en lineær modell, finn en grense og forklar når modellen bryter sammen.",
    situation: "En vanntank inneholder 900 liter. En pumpe tapper 65 liter per minutt. Modellen V(t) = 900 - 65t beskriver vannmengden etter t minutter.",
    taskText: "Tolk modellen, lag en tabell med Python og finn det første hele minuttet modellen gir negativ vannmengde. Forbedre så programmet slik at det aldri rapporterer mindre enn 0 liter.",
    competenceGoals: ["modellere situasjoner og vurdere hvor gyldige modellene er", "utforske lineære funksjoner med digitale verktøy", "forklare endring per enhet"],
    sourceCode: "for t in range(0, 18, 2):\n    V = 900 - 65 * t\n    print(t, V)",
    questions: [
      {
        id: "water-slope",
        prompt: "Hva betyr -65 i modellen?",
        choices: [
          { text: "Tanken starter med -65 liter", feedback: "Startverdien er 900 liter." },
          { text: "Vannmengden minker med 65 liter per minutt", feedback: "Riktig. Det negative stigningstallet beskriver nedgang per enhet." },
          { text: "Pumpen starter etter 65 minutter", feedback: "65 beskriver liter per minutt, ikke et tidspunkt." },
          { text: "Tanken kan inneholde maksimalt 65 liter", feedback: "Kapasiteten er ikke oppgitt som 65 liter." },
        ],
        correctIndex: 1,
        explanation: "Når t øker med 1, synker V med 65. Stigningstallet er derfor -65 liter per minutt.",
      },
      {
        id: "water-validity",
        prompt: "Hvorfor er modellen ikke gyldig for alle t-verdier?",
        choices: [
          { text: "En fysisk tank kan ikke ha negativt vann", feedback: "Riktig. Etter at tanken er tom, må modellen avgrenses eller endres." },
          { text: "Python kan bare bruke positive stigningstall", feedback: "Python kan regne med negative tall." },
          { text: "range kan ikke gå høyere enn 18", feedback: "range kan ha langt større stoppverdi." },
          { text: "900 er for stort for en variabel", feedback: "Python håndterer 900 uten problemer." },
        ],
        correctIndex: 0,
        explanation: "Matematikken kan fortsette under null, men situasjonen kan ikke. Modellens gyldighetsområde slutter når tanken er tom.",
      },
    ],
    planPrompts: ["Hva er startverdien?", "Hva er endring per minutt?", "Hvilken fysisk grense kan ikke krysses?", "Hvordan kan max brukes til å håndheve grensen?"],
    codingMission: "Lag funksjonen vann(t) som returnerer minst 0 liter. Skriv en tabell for t = 0 til 16, og marker første hele minutt den opprinnelige modellen ville blitt negativ.",
    successCriteria: ["funksjonen bruker 900 - 65 * t", "resultatet begrenses ved 0", "en løkke lager tabell", "første negative modellverdi identifiseres og forklares"],
    starterCode: "def vann(t):\n    modell = 900 - 65 * t\n    # Returner aldri mindre enn 0\n\n# Lag tabell fra 0 til 16 minutter\n\n# Finn første hele minutt der den opprinnelige modellen blir negativ",
    testCases: [
      { change: "t = 0", expect: "900 liter", why: "Tester startverdien." },
      { change: "t = 10", expect: "250 liter", why: "Tester endringen per minutt." },
      { change: "t = 14", expect: "0 liter, opprinnelig modell -10", why: "Tester skillet mellom matematisk formel og fysisk modell." },
    ],
    hints: [
      { title: "Bevar den opprinnelige modellen", body: "Regn først ut 900 - 65 * t i en egen variabel." },
      { title: "Legg inn den fysiske grensen", body: "max velger den største av 0 og modellverdien.", code: "return max(0, modell)" },
      { title: "Finn det første bruddet", body: "Gå gjennom heltallstider og stopp første gang 900 - 65 * t < 0." },
    ],
    solutionCode: "def vann(t):\n    modell = 900 - 65 * t\n    return max(0, modell)\n\nfor t in range(17):\n    print(f\"{t:2d} min: {vann(t)} liter\")\n\nfor t in range(17):\n    opprinnelig = 900 - 65 * t\n    if opprinnelig < 0:\n        print(f\"Modellen blir negativ første gang ved {t} minutter ({opprinnelig} liter).\")\n        break",
    solutionNotes: ["den lineære formelen beholdes slik at tankegangen er synlig", "max hindrer fysisk meningsløse negative svar", "den andre løkken finner grensen for modellens gyldighet"],
    sensorTip: "Et eksamenssvar bør skille mellom «formelen gir -10» og «tanken har 0 liter». Det viser at du vurderer modellen, ikke bare regner.",
    reflection: "Hvilke andre antakelser gjør modellen – for eksempel om pumpefarten – og hvordan kan de svikte i virkeligheten?",
    checks: [{ label: "Funksjonen bruker modellen", codeIncludes: ["def vann", "900 - 65 * t"] }, { label: "Negativt vann hindres", codeIncludes: ["max(0"] }, { label: "Gyldighetsgrensen forklares", outputIncludes: ["14", "negativ"] }],
  },
];
