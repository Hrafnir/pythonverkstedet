"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Module = {
  id: number;
  title: string;
  shortTitle: string;
  eyebrow: string;
  question: string;
  intro: string;
  theory: { title: string; body: string; code?: string }[];
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
    theory: [
      {
        title: "En variabel er et navn på en verdi",
        body: "Når Python leser pris = 800, lagres verdien 800 under navnet pris. Likhetstegnet betyr her «gi variabelen en verdi».",
        code: "pris = 800",
      },
      {
        title: "Et uttrykk blir regnet ut",
        body: "Rabatt på 25 % gir vekstfaktoren 1 − 0,25 = 0,75. Python bruker punktum som desimalskilletegn.",
        code: "ny_pris = pris * (1 - rabatt)",
      },
      {
        title: "print viser resultatet",
        body: "print(...) skriver en verdi i resultatfeltet. Det gjør det mulig å observere hva programmet har regnet ut.",
        code: "print(ny_pris)",
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
    theory: [
      {
        title: "Sammenligning bruker to likhetstegn",
        body: "Uttrykket rest == 0 spør om rest er lik null. Svaret er enten sant eller usant.",
        code: "rest == 0",
      },
      {
        title: "% finner divisjonsresten",
        body: "17 % 2 blir 1, mens 18 % 2 blir 0. Alle partall gir rest 0 når de deles på 2.",
        code: "rest = tall % 2",
      },
      {
        title: "Innrykk viser hva som hører sammen",
        body: "Linjene under if og else må rykkes inn. Innrykket er en del av Python-språket.",
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
    theory: [
      {
        title: "for gjentar",
        body: "For hver verdi i tallfølgen utføres den innrykkede linjen én gang.",
        code: "for n in range(1, 6):",
      },
      {
        title: "Sluttverdien er ikke med",
        body: "range(1, 6) gir tallene 1, 2, 3, 4 og 5. Tallet 6 er stoppunktet.",
      },
      {
        title: "Uttrykket endres hver runde",
        body: "Når n får en ny verdi, regnes 2 * n ut på nytt. Slik oppstår en tallfølge.",
        code: "print(2 * n)",
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
    theory: [
      {
        title: "def lager funksjonen",
        body: "Navnet kommer etter def. Verdien i parentes kalles en parameter.",
        code: "def f(x):",
      },
      {
        title: "return sender svaret tilbake",
        body: "Uttrykket etter return bestemmer funksjonsverdien.",
        code: "return 2 * x + 3",
      },
      {
        title: "Et funksjonskall setter inn en verdi",
        body: "f(6) betyr at x får verdien 6. Resultatet blir 2 · 6 + 3 = 15.",
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
    theory: [
      {
        title: "random lager tilfeldige forsøk",
        body: "randint(1, 6) velger et heltall fra 1 til og med 6.",
        code: "kast = random.randint(1, 6)",
      },
      {
        title: "En teller samler resultater",
        body: "Hver gang kastet er 6, økes antall_seksere med én.",
        code: "antall_seksere += 1",
      },
      {
        title: "Relativ frekvens",
        body: "Antall seksere delt på antall kast kan sammenlignes med 1/6 ≈ 0,167.",
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
    theory: [
      {
        title: "Eksponentiell modell",
        body: "Ved 10 % vekst multipliseres verdien med vekstfaktoren 1,10 for hver periode.",
        code: "verdi = start * vekstfaktor ** tid",
      },
      {
        title: "** betyr potens",
        body: "1.10 ** 2 betyr 1,10². Python bruker to stjerner for potens.",
      },
      {
        title: "En modell har forutsetninger",
        body: "Konstant prosentvis vekst er en antakelse. Virkelige renter, priser eller bestander kan endre seg.",
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

const steps = ["Problem", "Teori", "Prøv", "Observer", "Oppgave"];

export default function Home() {
  const [activeId, setActiveId] = useState(1);
  const [teacherMode, setTeacherMode] = useState(false);
  const [code, setCode] = useState(modules[0].starterCode);
  const [output, setOutput] = useState("Trykk «Kjør kode» når du er klar.");
  const [runnerStatus, setRunnerStatus] = useState<"idle" | "loading" | "running" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState<number[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
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
    setActiveId(module.id);
    setCode(module.starterCode);
    setOutput("Trykk «Kjør kode» når du er klar.");
    setFeedback("");
    setMobileMenu(false);
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
        <button
          className="mobile-menu"
          type="button"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Åpne modulmeny"
          aria-expanded={mobileMenu}
        >
          <span />
          <span />
          <span />
        </button>
        <a className="brand" href="#top" aria-label="Pythonverkstedet hjem">
          <span className="brand-mark">py</span>
          <span>
            <strong>Pythonverkstedet</strong>
            <small>Matematikk · 8.–10. trinn</small>
          </span>
        </a>
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

      <div className="app-shell" id="top">
        <aside className={`sidebar ${mobileMenu ? "is-open" : ""}`}>
          <div className="sidebar-heading">
            <p className="kicker">Digitalt hefte</p>
            <h2>Seks verksteder</h2>
            <p>Les, prøv, observer og forklar.</p>
          </div>

          <div className="progress-card" aria-label={`${progress} prosent fullført`}>
            <div><span>Din progresjon</span><strong>{completed.length}/{modules.length}</strong></div>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          </div>

          <nav className="module-list" aria-label="Moduler">
            {modules.map((module) => (
              <button
                key={module.id}
                type="button"
                className={`${module.id === active.id ? "active" : ""} ${completed.includes(module.id) ? "done" : ""}`}
                onClick={() => chooseModule(module)}
              >
                <span className="module-number">{completed.includes(module.id) ? "✓" : module.id}</span>
                <span><small>Modul {module.id}</small>{module.shortTitle}</span>
              </button>
            ))}
          </nav>

          <div className="curriculum-note">
            <span>LK20 · MAT01-06</span>
            <p>Trener på å lese og forklare tekstbasert programkode i Python.</p>
          </div>
        </aside>

        {mobileMenu && <button className="menu-backdrop" aria-label="Lukk meny" onClick={() => setMobileMenu(false)} />}

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

          <section className="content-section theory-section">
            <div className="section-heading">
              <div>
                <p className="section-label"><span>2</span> Teori</p>
                <h2>Les koden som en matematisk tekst</h2>
              </div>
              <p>Ta én idé om gangen. Du trenger ikke pugge.</p>
            </div>
            <div className="theory-grid">
              {active.theory.map((item, index) => (
                <div className="theory-card" key={item.title}>
                  <span className="theory-index">0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  {item.code && <code>{item.code}</code>}
                </div>
              ))}
            </div>
          </section>

          <section className="content-section lab-section">
            <div className="section-heading lab-heading">
              <div>
                <p className="section-label inverse"><span>3</span> Python-laboratorium</p>
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
                <p className="section-label"><span>4</span> Observer og forklar</p>
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
              <p className="section-label inverse"><span>5</span> Din oppgave</p>
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
      </div>
    </main>
  );
}
