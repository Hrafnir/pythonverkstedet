"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  starterCode: string;
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
    starterCode: `pris = 800\nrabatt = 0.25\nny_pris = pris * (1 - rabatt)\nprint(ny_pris)`,
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
    starterCode: `tall = 18\nrest = tall % 2\n\nif rest == 0:\n    print("partall")\nelse:\n    print("oddetall")`,
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
    starterCode: `for n in range(1, 6):\n    print(2 * n)`,
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
    starterCode: `def f(x):\n    return 2 * x + 3\n\nresultat = f(6)\nprint(resultat)`,
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
    starterCode: `import random\n\nantall_kast = 600\nantall_seksere = 0\n\nfor _ in range(antall_kast):\n    kast = random.randint(1, 6)\n    if kast == 6:\n        antall_seksere += 1\n\nandel = antall_seksere / antall_kast\nprint(round(andel, 3))`,
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
    starterCode: `start = 1000\nvekstfaktor = 1.10\ntid = 2\n\nverdi = start * vekstfaktor ** tid\nprint(round(verdi, 2))`,
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
const playgroundCode = `# Dette er deres frie Python-rom.
# Slett eksemplet eller bygg videre på det.

navn = "10. trinn"
for tall in range(1, 6):
    print(navn, "utforsker", tall ** 2)`;

export default function Home() {
  const [activeId, setActiveId] = useState(1);
  const [playground, setPlayground] = useState(false);
  const [teacherMode, setTeacherMode] = useState(false);
  const [code, setCode] = useState(modules[0].starterCode);
  const [output, setOutput] = useState("Trykk «Kjør kode» når du er klar.");
  const [runnerStatus, setRunnerStatus] = useState<"idle" | "loading" | "running" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState<number[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = useMemo(
    () => modules.find((item) => item.id === activeId) ?? modules[0],
    [activeId],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("pythonverkstedet-progress");
    const savedMode = window.localStorage.getItem("pythonverkstedet-mode");
    if (saved) setCompleted(JSON.parse(saved));
    if (savedMode === "teacher") setTeacherMode(true);
    return () => {
      workerRef.current?.terminate();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function chooseModule(module: Module) {
    setPlayground(false);
    setActiveId(module.id);
    setCode(module.starterCode);
    setOutput("Trykk «Kjør kode» når du er klar.");
    setFeedback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choosePlayground() {
    setPlayground(true);
    setCode(playgroundCode);
    setOutput("Skriv eller endre koden, og trykk «Kjør kode».");
    setFeedback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleMode() {
    const next = !teacherMode;
    setTeacherMode(next);
    window.localStorage.setItem("pythonverkstedet-mode", next ? "teacher" : "student");
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

    const worker = makeWorker();
    let executionStarted = false;

    worker.onmessage = (event) => {
      const data = event.data as { type: string; output?: string; error?: string };
      if (data.type === "ready") {
        executionStarted = true;
        setRunnerStatus("running");
        setOutput("Kjører …");
        worker.postMessage({ code });
        timeoutRef.current = setTimeout(() => {
          worker.terminate();
          setRunnerStatus("error");
          setOutput("Programmet brukte for lang tid og ble stoppet. Sjekk særlig løkker som kanskje aldri avsluttes.");
        }, 5000);
      }

      if (data.type === "result") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setRunnerStatus("idle");
        setOutput(data.output?.trim() || "Koden kjørte ferdig uten utskrift.");
        worker.terminate();
      }

      if (data.type === "error") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setRunnerStatus("error");
        setOutput(data.error || "Noe gikk galt.");
        worker.terminate();
      }
    };

    worker.onerror = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setRunnerStatus("error");
      setOutput(
        executionStarted
          ? "Python-motoren stoppet. Prøv å kjøre på nytt."
          : "Kunne ikke laste Python-motoren. Sjekk nettilkoblingen og prøv igjen.",
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
    const correct = active.expected.some((answer) => normalized === answer.toLowerCase());
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
        <a className="brand" href="#top" aria-label="Pythonverkstedet hjem">
          <span className="brand-mark">py</span>
          <span>
            <strong>Pythonverkstedet</strong>
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

            <section className="content-section playground-guide">
              <p className="section-label"><span>?</span> Start med undring</p>
              <h2>Hva har dere lyst til å undersøke?</h2>
              <div className="idea-chips" aria-label="Forslag til ting dere kan undersøke">
                <button type="button" onClick={() => setCode('for tall in range(1, 11):\n    print(tall, tall ** 2)')}>Lag et tallmønster</button>
                <button type="button" onClick={() => setCode('import random\n\nfor _ in range(10):\n    print(random.randint(1, 6))')}>Kast en terning</button>
                <button type="button" onClick={() => setCode('def areal(lengde, bredde):\n    return lengde * bredde\n\nprint(areal(8, 5))')}>Lag en funksjon</button>
                <button type="button" onClick={() => setCode(playgroundCode)}>Tilbake til startkoden</button>
              </div>
            </section>

            <section className="content-section lab-section playground-lab">
              <div className="section-heading lab-heading">
                <div>
                  <p className="section-label inverse"><span>▶</span> Python-editor</p>
                  <h2>Skriv, kjør og undersøk</h2>
                </div>
                <div className="live-badge"><span /> Ekte Python i nettleseren</div>
              </div>
              <div className="code-workbench">
                <div className="editor-panel">
                  <div className="panel-bar">
                    <span><i className="dot coral" /><i className="dot cream" /><i className="dot green" /></span>
                    <strong>mitt_program.py</strong>
                    <button type="button" onClick={() => setCode(playgroundCode)}>Tilbakestill</button>
                  </div>
                  <label htmlFor="playground-code" className="sr-only">Skriv fri Python-kode</label>
                  <textarea
                    id="playground-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    spellCheck={false}
                    autoCapitalize="off"
                    aria-describedby="playground-help"
                  />
                  <div className="editor-footer" id="playground-help">
                    <span>Prøv gjerne noe du ikke vet om virker.</span>
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
                  <div className="output-tip"><strong>Neste spørsmål:</strong> Hva kan dere endre for å få et annet resultat?</div>
                </div>
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

          <section className="content-section lab-section">
            <div className="section-heading lab-heading">
              <div>
                <p className="section-label inverse"><span>4</span> Python-laboratorium</p>
                <h2>Prøv. Endre. Kjør igjen.</h2>
              </div>
              <div className="live-badge"><span /> Ekte Python i nettleseren</div>
            </div>

            <div className="code-workbench">
              <div className="editor-panel">
                <div className="panel-bar">
                  <span><i className="dot coral" /><i className="dot cream" /><i className="dot green" /></span>
                  <strong>verksted.py</strong>
                  <button type="button" onClick={() => { setCode(active.starterCode); setFeedback(""); }}>Tilbakestill</button>
                </div>
                <label htmlFor="python-code" className="sr-only">Python-kode</label>
                <textarea
                  id="python-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  spellCheck={false}
                  autoCapitalize="off"
                  aria-describedby="editor-help"
                />
                <div className="editor-footer" id="editor-help">
                  <span>Du kan endre alt i kodefeltet.</span>
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
                <div className="output-tip"><strong>Observer:</strong> Stemmer resultatet med det du forventet?</div>
              </div>
            </div>
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
    </main>
  );
}
