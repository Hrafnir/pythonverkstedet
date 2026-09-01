import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const page = readFileSync("app/page.tsx", "utf8");
const commandLibrary = readFileSync("app/pythonCommands.ts", "utf8");
const mathCommands = readFileSync("app/mathCommands.ts", "utf8");
const mathHelp = readFileSync("app/mathHelp.ts", "utf8");
const challenges = readFileSync("app/challenges.ts", "utf8");
const examTraining = readFileSync("app/examTraining.ts", "utf8");
const worker = readFileSync("public/pyodide-worker.mjs", "utf8");
const pygameRunner = readFileSync("public/pygame-runner.mjs", "utf8");
const pygameFrame = readFileSync("public/pygame-runner.html", "utf8");
const workflow = readFileSync("../.github/workflows/deploy-pages.yml", "utf8");
const desktopMain = readFileSync("desktop/main.mjs", "utf8");
const desktopBuild = readFileSync("scripts/build-macos.mjs", "utf8");
const desktopPrepare = readFileSync("scripts/prepare-desktop-dev.mjs", "utf8");
const offlinePackages = readFileSync("scripts/download-pyodide.mjs", "utf8");
const { evaluateChallengeAttempt, pythonChallenges } = await import("../app/challenges.ts");
const { evaluateExamAttempt, examTasks } = await import("../app/examTraining.ts");
const { mathHelpTutorials } = await import("../app/mathHelp.ts");

const analyzerSource = page.slice(page.indexOf("function analyzePythonError"), page.indexOf("const pythonTokens"));
const analyzerJavaScript = ts.transpileModule(`${analyzerSource}\nglobalThis.analyzePythonError = analyzePythonError;`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;
const analyzerContext = vm.createContext({});
vm.runInContext(analyzerJavaScript, analyzerContext);
const analyzePythonError = analyzerContext.analyzePythonError;

const libraryHelperSource = page.slice(page.indexOf("type PythonLibraryDefinition"), page.indexOf("const pythonTokens"));
const libraryHelperJavaScript = ts.transpileModule(`${libraryHelperSource}\nglobalThis.analyzePythonImports = analyzePythonImports;`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;
const libraryHelperContext = vm.createContext({});
vm.runInContext(libraryHelperJavaScript, libraryHelperContext);
const { analyzePythonImports } = libraryHelperContext;

const editorHelperSource = page.slice(page.indexOf("type EditorDiagnostic"), page.indexOf("function PythonEditor"));
const editorHelperJavaScript = ts.transpileModule(`${editorHelperSource}\nglobalThis.pythonRangePreview = pythonRangePreview;\nglobalThis.pythonLineDiagnostic = pythonLineDiagnostic;\nglobalThis.startsPythonBlockWithoutColon = startsPythonBlockWithoutColon;\nglobalThis.findPythonBlockSuggestion = findPythonBlockSuggestion;\nglobalThis.pythonPairedEnter = pythonPairedEnter;`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;
const editorHelperContext = vm.createContext({});
vm.runInContext(editorHelperJavaScript, editorHelperContext);
const { pythonRangePreview, pythonLineDiagnostic, startsPythonBlockWithoutColon, findPythonBlockSuggestion, pythonPairedEnter } = editorHelperContext;

test("appen inneholder ti komplette læringsmoduler", () => {
  const moduleIds = page.match(/\n    id: (?:[1-9]|10),/g) ?? [];
  assert.equal(moduleIds.length, 10);
  for (const step of ["Problem", "Oppfriskning", "Lær", "Prøv", "Forklar", "Oppgave"]) {
    assert.match(page, new RegExp(`"${step}"`));
  }
  assert.equal((page.match(/    refresh: \{/g) ?? []).length, 10);
  assert.match(page, /navn = verdi/);
  assert.match(page, /Slik lager du en variabel/);
});

test("Python er første område, standardvisning og har ikke sidepanel", () => {
  assert.match(page, /id="module-select"/);
  assert.match(page, /const \[playground, setPlayground\] = useState\(true\)/);
  assert.match(page, /<option value="playground">Python<\/option>/);
  assert.match(page, /name: "Nytt program"/);
  assert.match(page, /setActiveProjectId\(firstProject\.id\)/);
  assert.match(page, /setCode\(""\)/);
  assert.doesNotMatch(page, /Fritt Python-rom/);
  assert.match(page, /playgroundCode/);
  assert.match(page, /Lokale prosjekter/);
  assert.match(page, /Importer \.py/);
  assert.match(page, /Bilde av kode \+ svar/);
  assert.match(page, /Kopier kode \+ svar/);
  assert.doesNotMatch(page, /<aside/);
  const pickerSource = page.slice(page.indexOf('id="module-select"'), page.indexOf('<nav className="top-actions"'));
  assert.ok(pickerSource.indexOf('<option value="playground">Python</option>') < pickerSource.indexOf("{modules.map"));
});

test("kommandobiblioteket er omfattende, søkbart på norsk og tilgjengelig i editoren", () => {
  assert.ok((commandLibrary.match(/^    id:/gm) ?? []).length >= 100);
  for (const entry of [
    "= gir en verdi til en variabel",
    "== undersøker om to verdier er like",
    ">= betyr større enn eller lik",
    "<= betyr mindre enn eller lik",
    "!= undersøker om verdier er ulike",
    "append legger til bakerst",
    "for gjentar kode for hver verdi",
    "plot tegner en linjegraf",
  ]) assert.match(commandLibrary, new RegExp(entry.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(commandLibrary, /keywords: \["større enn"/);
  assert.match(page, /normalizeCommandSearch/);
  assert.match(page, /filteredCommands/);
  assert.match(page, /Kommandobibliotek/);
  assert.match(page, /⌘ Kommandoer/);
  assert.match(page, /Søk etter tegn, kommando eller det du vil gjøre/);
  assert.match(page, /Sett inn ved markøren/);
});

test("matematikkhjelpen dekker grunnregning, statistikk og tilgjengelige biblioteker", () => {
  assert.ok((mathCommands.match(/^    id:/gm) ?? []).length >= 25);
  assert.ok((mathHelp.match(/^    id:/gm) ?? []).length >= 10);
  for (const content of [
    "math.sqrt",
    "math.hypot",
    "math.sin",
    "statistics.mean",
    "statistics.median",
    "statistics.multimode",
    "statistics.quantiles",
    "statistics.pstdev",
    "Fraction",
    "Decimal",
    "np.mean",
    "pd.DataFrame",
    "sp.solve",
    "stats.linregress",
    "LinearRegression",
    "plt.scatter",
    "plt.hist",
    "figur.area",
    "nx.shortest_path",
  ]) assert.match(`${commandLibrary}\n${mathCommands}\n${mathHelp}`, new RegExp(content.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const norwegianSearch of [
    "gjennomsnitt",
    "median",
    "standardavvik",
    "finn vinkel",
    "største felles divisor",
    "filtrer tabell",
    "nullpunkt",
  ]) assert.match(mathCommands, new RegExp(norwegianSearch, "i"));
  assert.match(page, /"Matematikk", "Biblioteker"/);
  assert.match(page, /Velg riktig matematikkverktøy/);
  assert.match(page, /Et bibliotek erstatter ikke den matematiske tankegangen/);
  const commandIds = [...`${commandLibrary}\n${mathCommands}`.matchAll(/^    id: "([^"]+)"/gm)].map((match) => match[1]);
  assert.equal(new Set(commandIds).size, commandIds.length, "Kommando-ID-er må være unike");
  assert.equal(new Set(mathHelpTutorials.map((tutorial) => tutorial.id)).size, mathHelpTutorials.length, "Tutorial-ID-er må være unike");
});

test("utfordringssiden bygger programmeringslogikk med gradvis støtte og mestring", () => {
  assert.equal((challenges.match(/^    id:/gm) ?? []).length, 19);
  assert.equal((challenges.match(/difficulty: "Enkel"/g) ?? []).length, 7);
  assert.equal((challenges.match(/difficulty: "Middels"/g) ?? []).length, 6);
  assert.equal((challenges.match(/difficulty: "Utfordrende"/g) ?? []).length, 6);
  assert.equal((challenges.match(/label: "Lite dytt"/g) ?? []).length, 19);
  assert.equal((challenges.match(/label: "Byggekloss"/g) ?? []).length, 19);
  assert.equal((challenges.match(/label: "Plan"/g) ?? []).length, 19);
  assert.equal((challenges.match(/label: "Nesten der"/g) ?? []).length, 19);
  assert.equal((challenges.match(/^    given: \[/gm) ?? []).length, 19);
  assert.equal((challenges.match(/^    programShould: \[/gm) ?? []).length, 19);
  assert.match(challenges, /Er trekanten rettvinklet/);
  assert.match(challenges, /Finn den ukjente kateten/);
  assert.match(challenges, /Lag en framtidsmaskin/);
  assert.match(challenges, /mest logiske|grunnlogikken|synlige mellomsteg/i);
  assert.match(page, /<option value="challenges">Utfordringer<\/option>/);
  assert.match(page, /Tenk\. Prøv\. Oppdag\./);
  assert.match(page, /Den gode utfordringssonen/);
  assert.match(page, /Ta bare så mye hjelp som du trenger/);
  assert.match(page, /Sjekk retning – ikke bare fasit/);
  assert.match(page, /Dette får du vite/);
  assert.match(page, /Programmet ditt skal/);
  assert.match(page, /godtar flere framgangsmåter og variabelnavn/);
  assert.match(page, /Løsningsforslag med forklaring/);
  assert.match(page, /skolepython-completed-challenges/);
  assert.match(page, /id="challenge-code"/);
});

test("mestringssjekken godkjenner løsningsforslagene og naturlige alternative løsninger", () => {
  const outputs = {
    "sum-variables": "Totalprisen er 648 kr",
    discount: "Den nye prisen er 600 kr",
    "even-odd": "14 er et partall",
    "input-age": "Ada er 19 år om fem år",
    hypotenuse: "Hypotenusen er 5 cm",
    "multiplication-table": "10 · 5 = 50",
    "ticket-price": "15 år betaler 90 kr",
    "right-triangle": "rettvinklet",
    "missing-leg": "12 cm",
    "largest-without-max": "19",
    "average-analysis": "14 og 2",
    "count-vowels": "7 vokaler",
    "turtle-polygon": "",
    "triangle-classifier": "uliksidet og rettvinklet",
    "prime-number": "97 er et primtall",
    "growth-threshold": "6 år",
    "dice-simulation": "",
    "caesar-cipher": "sbwkrq",
    "turtle-spiral": "",
  };

  for (const challenge of pythonChallenges) {
    const results = evaluateChallengeAttempt(challenge, challenge.solutionCode, outputs[challenge.id] ?? "");
    assert.ok(results.every((result) => result.startsWith("✓")), `${challenge.id}: ${results.join(" | ")}`);
  }

  const sumChallenge = pythonChallenges.find((challenge) => challenge.id === "sum-variables");
  const flexibleSum = "vare = 599\nporto = 49\nsvar = vare + porto\nprint(f\"Totalprisen er {svar} kr\")";
  assert.ok(evaluateChallengeAttempt(sumChallenge, flexibleSum, "Totalprisen er 648 kr").every((result) => result.startsWith("✓")));

  const discountChallenge = pythonChallenges.find((challenge) => challenge.id === "discount");
  const flexibleDiscount = "gammel_pris = 800\nrabatt_i_kroner = gammel_pris * 0.25\nsluttpris = gammel_pris - rabatt_i_kroner\nprint(sluttpris, \"kr\")";
  assert.ok(evaluateChallengeAttempt(discountChallenge, flexibleDiscount, "600.0 kr").every((result) => result.startsWith("✓")));
});

test("eksamenstreningen kobler læreplantolking, flervalg og kjørbar Python", () => {
  assert.equal((examTraining.match(/^    id:/gm) ?? []).length, 8);
  assert.equal((examTraining.match(/level: "Grunnleggende"/g) ?? []).length, 2);
  assert.equal((examTraining.match(/level: "Sammensatt"/g) ?? []).length, 4);
  assert.equal((examTraining.match(/level: "Utforskende"/g) ?? []).length, 2);
  assert.equal((examTraining.match(/correctIndex: \d/g) ?? []).length, 16);
  assert.equal((examTraining.match(/hints: \[/g) ?? []).length, 8);
  assert.match(examTraining, /lese og forklare tekstbasert programkode i Python/i);
  assert.match(examTraining, /modellere situasjoner og vurdere hvor gyldige modellene er/i);
  assert.match(examTraining, /ligningssett|personlig økonomi|eksponentialfunksjon|sannsynlighet/i);
  assert.match(page, /<option value="exam-training">Eksamenstrening<\/option>/);
  assert.match(page, /Les\. Tolk\. Bygg\. Begrunn\./);
  assert.match(page, /Flervalg · tolk først/);
  assert.match(page, /id="exam-code"/);
  assert.match(page, /skolepython-completed-exam-tasks/);
  assert.match(page, /Sensorblikk/);
  assert.match(page, /Trekant.*forbedringsråd|Trekant.*forbedring/is);
});

test("sensorsjekken godtar fasiter og skiller riktige svar fra forbedringsråd", () => {
  const outputs = {
    "discount-code-reading": "Du sparer 360 kr. Ny pris er 840 kr.",
    "taxi-linear-model": "0 km koster 85 kr. 5 km koster 170 kr. 12 km koster 289 kr.",
    "savings-growth": "Saldoen passerer målet etter 6 år. Da er saldoen 15183.83 kr.",
    "statistics-outlier": "Gjennomsnitt: 133.83 cm. Mulig avvik: 182 cm.",
    "dice-simulation": "Treff: 1667. Andel: 0.167. Prosent: 16.7 %.",
    "right-triangle-exam": "Trekanten kan regnes som rettvinklet. Avvik: 0.",
    "ticket-equation-search": "60 voksenbilletter og 60 barnebilletter. Programmet undersøkte 61 kandidater.",
    "water-model-validity": "14 min: 0 liter. Modellen blir negativ ved 14 minutter (-10 liter).",
  };

  for (const task of examTasks) {
    const results = evaluateExamAttempt(task, task.solutionCode, outputs[task.id] ?? "");
    assert.ok(results.every((result) => !result.startsWith("○") && !result.startsWith("△")), `${task.id}: ${results.join(" | ")}`);
  }

  const savings = examTasks.find((task) => task.id === "savings-growth");
  const validAlternative = "saldo = 12000\nrente = 0.04\når = 0\n\nwhile saldo <= 15000:\n    saldo = saldo * (1 + rente)\n    år += 1\n\nprint(f\"Saldoen er {saldo:.2f} kr etter {år:.2f} år\")";
  const results = evaluateExamAttempt(savings, validAlternative, "Saldoen er 15183.83 kr etter 6.00 år");
  assert.ok(results.every((result) => !result.startsWith("○")), results.join(" | "));
  assert.ok(results.some((result) => result.startsWith("△") && result.includes("egen variabel")));
  assert.ok(results.at(-1).startsWith("✓ Oppgaven er faglig løst"));
});

test("modulene har tom skrivelab, redigerbar fasit, kodefarger og ekstratriks", () => {
  assert.match(page, /Skriv selv/);
  assert.match(page, /Tom editor med hjelp/);
  assert.match(page, /Fasit er ikke låst/);
  assert.match(page, /pythonTokens/);
  assert.match(page, /Valgfritt ekstratriks/);
  assert.match(page, /Den nye prisen på produktet er/);
  assert.equal((page.match(/    typingSteps: \[/g) ?? []).length, 10);
  assert.match(page, /Skriv dette i kodefeltet/);
  assert.match(page, /Forklaring/);
  assert.match(page, /Gjør dette/);
  assert.match(page, /typing-explanation/);
  assert.equal((page.match(/    polish: \{/g) ?? []).length, 10);
});

test("alle moduler forklarer tankegangen grundig og inviterer til refleksjon", () => {
  assert.equal((page.match(/^        reflection:/gm) ?? []).length, 30);
  assert.equal((page.match(/^        why:/gm) ?? []).length, 30);
  assert.ok((page.match(/think:/g) ?? []).length >= 12);
  assert.ok((page.match(/breakdown:/g) ?? []).length >= 12);
  assert.match(page, /1 står for hele den gamle prisen: 100 %/);
  assert.match(page, /1 − 0\.25 = 0\.75/);
  assert.match(page, /0\.75 er det samme som 75 %/);
  assert.match(page, /Tenk først/);
  assert.match(page, /Dette skjer/);
  assert.match(page, /Derfor virker koden/);
  assert.match(page, /theory-reflection/);
  assert.match(page, /typing-deep-dive/);
});

test("alle moduler bygger kompetanse i små, kjørbare steg", () => {
  assert.equal((page.match(/    progression: \{/g) ?? []).length, 10);
  assert.match(page, /Små steg som bygger på hverandre/);
  assert.match(page, /Prøv koden i laboratoriet/);
  assert.match(page, /Legg sammen variabler/);
  assert.match(page, /poeng = poeng \+ 3/);
  assert.match(page, /poeng \+= 3/);
  assert.match(page, /poeng -= 2/);
  assert.match(page, /Den enkleste løsningen er å gi print flere deler/);
  assert.match(page, /Elegant senere: f-tekst/);
  assert.match(page, /tryProgressionCode/);
});

test("kodeeditoren støtter innrykk, lesbar tekst og fullskjerm", () => {
  assert.match(page, /event\.key === "Enter"/);
  assert.match(page, /codeBeforeComment\.endsWith\(":"\)/);
  assert.match(page, /Legg til : og lag innrykk/);
  assert.match(page, /const pythonPairMap/);
  assert.match(page, /Linje \{lineNumber\}, kolonne \{columnNumber\}/);
  assert.match(page, /Løkken teller slik/);
  assert.match(page, /indent-guide-layer/);
  assert.match(page, /event\.shiftKey/);
  assert.match(page, /bjornsveen-editor-font-size/);
  assert.match(page, /requestFullscreen/);
  assert.match(page, /Fullskjerm/);
  assert.match(page, /const playgroundCode = ""/);
  assert.match(page, /code: ""/);
});

test("editoren bekrefter tilgjengelige biblioteker og varsler om ukjente importer", () => {
  const imports = analyzePythonImports("import numpy as np\nimport math\nfrom matplotlib import pyplot\nimport requests");
  assert.equal(imports.length, 4);
  assert.equal(imports[0].label, "NumPy");
  assert.equal(imports[0].alias, "np");
  assert.equal(imports[0].available, true);
  assert.equal(imports[0].availability, "offline");
  assert.equal(imports[1].availability, "standard");
  assert.equal(imports[2].label, "Matplotlib");
  assert.equal(imports[3].available, false);
  assert.match(page, /editor-library-status/);
  assert.match(page, /kind = "library"/);
  assert.match(page, /er ikke bekreftet i offline-pakken/);
});

test("editoren lager og rydder par og åpner tomme klammer over flere linjer", () => {
  assert.match(page, /"\{": "\}"/);
  assert.match(page, /event\.key === "Backspace"/);
  assert.match(page, /pythonClosingCharacters\.has/);
  const braces = pythonPairedEnter("data = {}", 8);
  assert.equal(braces.insertion, "\n    \n");
  assert.equal(braces.nextCursor, 13);
  const indented = pythonPairedEnter("if sant:\n    data = []", 21);
  assert.equal(indented.insertion, "\n        \n    ");
  assert.equal(pythonPairedEnter('tekst = ""', 9), null);
});

test("editorhjelpen varsler presist og forklarer range uten å løse oppgaven", () => {
  assert.equal(startsPythonBlockWithoutColon("for n in range(1, 6)"), true);
  assert.equal(startsPythonBlockWithoutColon("for n in range(1, 6):"), false);
  assert.equal(startsPythonBlockWithoutColon("print('hei')"), false);
  assert.equal(findPythonBlockSuggestion("for n in range(4)", 17).position, 17);
  assert.equal(findPythonBlockSuggestion("for n in range(4)\n    ", 22).hasFollowingNewline, true);
  assert.match(pythonRangePreview("for n in range(1, 6):"), /1, 2, 3, 4, 5/);
  assert.match(pythonRangePreview("for n in range(5, 0, -2):"), /5, 3, 1/);
  assert.match(pythonRangePreview("for n in range(1, 6):"), /Stopptallet 6 er ikke med/);
  assert.equal(pythonRangePreview("print('hei')"), "");
  assert.equal(pythonLineDiagnostic("if alder = 14:").replacement, "==");
  assert.equal(pythonLineDiagnostic("for n in range(4);").replacement, ":");
  assert.equal(pythonLineDiagnostic("areal = 5 ^ 2").replacement, "**");
  assert.equal(pythonLineDiagnostic("pris = 2,5").kind, "tip");
});

test("Python-kjøringen sender tilbake en pedagogisk variabeloversikt", () => {
  assert.match(worker, /_skolepython_variables/);
  assert.match(worker, /callable\(_skolepython_value\)/);
  assert.match(worker, /variables = JSON\.parse/);
  assert.match(worker, /game, variables/);
  assert.match(page, /Dette husker Python nå/);
  assert.match(page, /Løkkevariabler viser den siste verdien/);
  assert.match(page, /setPythonVariables\(data\.variables \?\? \[\]\)/);
});

test("feildetektiven gjør Python-feil forståelige uten å rette koden", () => {
  assert.match(page, /type ErrorCoach/);
  assert.match(page, /function analyzePythonError/);
  assert.match(page, /semicolonHeader/);
  assert.match(page, /missingColon/);
  assert.match(page, /Python venter på et kolon/);
  assert.match(page, /Python finner ikke slutten på teksten/);
  assert.match(page, /Python venter på innrykk/);
  assert.match(page, /Python kjenner ikke igjen et navn/);
  assert.match(page, /Undersøk før du endrer/);
  assert.match(page, /Vis et tydeligere hint/);
  assert.match(page, /Vis den tekniske Python-feilen/);
  assert.match(page, /Gå til linje/);
  assert.match(page, /setErrorCoach\(analyzePythonError\(error, sourceCode\)\)/);
  assert.match(page, /Endre én liten ting, og kjør koden på nytt/);
  assert.doesNotMatch(page, /setCode\([^)]*(?:replace|fixed|corrected)/);
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.error-coach/);
  assert.match(css, /\.error-code-line/);
  assert.match(css, /\.error-technical pre/);
});

test("feildetektiven kjenner igjen vanlige elevfeil fra ekte Python-format", () => {
  const semicolon = analyzePythonError('File "<exec>", line 1\n    if x > 2;\n            ^\nSyntaxError: invalid syntax', "if x > 2;\n    print(x)");
  assert.equal(semicolon.lineNumber, 1);
  assert.equal(semicolon.title, "Et lite tegn står i veien");
  assert.match(semicolon.hint, /kolon \(:\)/);
  assert.equal("fixedCode" in semicolon, false);

  const colon = analyzePythonError('File "<exec>", line 1\n    for n in range(3)\n                     ^\nSyntaxError: expected \':\'', "for n in range(3)\n    print(n)");
  assert.equal(colon.title, "Python venter på et kolon");
  assert.equal(colon.codeLine, "for n in range(3)");

  const quote = analyzePythonError('File "<exec>", line 1\nSyntaxError: unterminated string literal', 'navn = "Ada\nprint(navn)');
  assert.equal(quote.title, "Python finner ikke slutten på teksten");

  const indent = analyzePythonError('File "<exec>", line 2\nIndentationError: expected an indented block after \'if\' statement on line 1', 'if True:\nprint("hei")');
  assert.equal(indent.title, "Python venter på innrykk");
  assert.equal(indent.lineNumber, 2);

  const name = analyzePythonError('File "<exec>", line 1, in <module>\nNameError: name \'ukjent\' is not defined', "print(ukjent)");
  assert.equal(name.kind, "name");
  assert.match(name.summary, /ukjent/);
});

test("Python-rommet støtter datapakker, grafer og prosjektlagring", () => {
  assert.match(page, /import numpy as np/);
  assert.match(page, /import matplotlib\.pyplot as plt/);
  assert.match(page, /import pandas as pd/);
  assert.match(page, /bjornsveen-python-projects/);
  assert.match(worker, /loadPackagesFromImports/);
  assert.match(worker, /matplotlib\.use\("Agg"\)/);
  assert.match(worker, /plt\.show = _bjornsveen_show/);
  assert.match(worker, /savefig/);
  assert.match(worker, /plots/);
  assert.match(page, /Åpne stort/);
  assert.match(page, /Lagre bilde/);
  assert.match(page, /plotImages/);
});

test("Python kan lese lokale tekst- og CSV-filer uten opplasting", () => {
  assert.match(page, /type PythonDataFile/);
  assert.match(page, /\+ Legg til \.txt eller \.csv/);
  assert.match(page, /Bruk eksempel \.txt/);
  assert.match(page, /Bruk eksempel \.csv/);
  assert.match(page, /accept="\.txt,\.csv,text\/plain,text\/csv"/);
  assert.match(page, /worker\.postMessage\(\{ type: "run", \.\.\.executionRef\.current \}\)/);
  assert.match(worker, /event\.data\.files/);
  assert.match(worker, /FS\.writeFile/);
  assert.match(worker, /\/home\/pyodide/);
  assert.match(page, /id: 10,[\s\S]*title: "Lister og datafiler"/);
  assert.match(page, /csv\.DictReader/);
  assert.match(page, /pd\.read_csv/);
  assert.match(page, /Filene blir bare behandlet lokalt på denne enheten/);
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.data-file-shelf/);
  assert.match(css, /\.data-file-list/);

  const missingFile = analyzePythonError(
    'File "<exec>", line 1, in <module>\nFileNotFoundError: [Errno 44] No such file or directory: \'tall.txt\'',
    'with open("tall.txt") as fil:\n    print(fil.read())',
  );
  assert.equal(missingFile.kind, "file");
  assert.match(missingFile.title, /finner ikke datafilen/);

  const missingColumn = analyzePythonError(
    'File "<exec>", line 4, in <module>\nKeyError: \'temperatur\'',
    'import csv\nwith open("data.csv") as fil:\n    for rad in csv.DictReader(fil):\n        print(rad["temperatur"])',
  );
  assert.equal(missingColumn.kind, "data");
  assert.match(missingColumn.title, /kolonnenavnet/);
});

test("input åpner en pedagogisk svar-dialog og kan fortsette gjennom flere spørsmål", () => {
  assert.match(worker, /event\.data\?\.type === "input-response"/);
  assert.match(worker, /pendingInputResolve/);
  assert.match(worker, /_skolepython_run_sync\(_skolepython_request_input/);
  assert.match(worker, /type: "input", prompt/);
  assert.doesNotMatch(worker, /event\.data\.inputs/);
  assert.doesNotMatch(worker, /__SKOLEPYTHON_INPUT_REQUIRED__/);
  assert.match(page, /Skriv et svar til Python/);
  assert.match(page, /function submitPythonInput/);
  assert.match(page, /type: "input-response", value: answer/);
  assert.match(page, /function cancelPythonInput/);
  assert.match(page, /input\(\)<\/code> gir alltid tekst/);
  assert.match(page, /Programmet ba om mer enn 20 svar/);
  assert.match(page, /handleModalKeyboard/);
  assert.match(page, /event\.key === "Escape"/);
  assert.match(page, /resultIsStale/);
  assert.match(page, /Dette er resultatet fra forrige kjøring/);
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.python-input-modal/);
  assert.match(css, /\.python-input-card/);
});

test("Python-rommet har et komplett, søkbart oppslagsverk", () => {
  assert.match(page, /Python-håndbok/);
  assert.match(page, /Søk i håndboken/);
  assert.match(page, /playgroundReferences/);
  const referenceSource = page.slice(page.indexOf("const playgroundReferences"), page.indexOf("const modules"));
  assert.equal((referenceSource.match(/    id: "(?:variabler|tekst|vilkar|tallmonster|lister|tekstfiler|csv-filer|funksjoner|tilfeldighet|tabeller|grafer|eksamensgraf|turtle-figurer|turtle-spiral|numpy|symbolsk|mattebibliotek|scipy|maskinlaering|pillow|networkx|shapely|spill-snake)",/g) ?? []).length, 23);
  assert.match(page, /Viktige koder og kommandoer/);
  assert.match(page, /Eksperimenter videre/);
  assert.match(page, /Åpne som nytt prosjekt/);
  assert.match(page, /Det gamle prosjektet er bevart/);
  assert.match(page, /Når koden ikke virker/);
  for (const errorName of ["SyntaxError", "IndentationError", "NameError", "TypeError"]) {
    assert.match(page, new RegExp(errorName));
  }
});

test("Python starter med tom editor og har en kodebygger", () => {
  const playgroundSource = page.slice(page.indexOf("{playground && ("), page.indexOf("{!playground && ("));
  assert.ok(playgroundSource.indexOf('id="python-editor"') < playgroundSource.indexOf("playground-guide"));
  assert.doesNotMatch(playgroundSource, /playground-hero/);
  assert.doesNotMatch(playgroundSource, /det frie rommet/);
  assert.match(page, /const playgroundCode = ""/);
  assert.match(page, /const codeSnippets: CodeSnippet\[]/);
  const snippetSource = page.slice(page.indexOf("const codeSnippets"), page.indexOf("const playgroundReferences"));
  assert.equal((snippetSource.match(/    id: "(?:variabler|print|regning|input-alder|input-trekant|for-lokke|if-else|liste|les-txt|les-csv|funksjon|tilfeldig|graf|eksamensgraf|turtle|snake)",/g) ?? []).length, 16);
  assert.match(page, /Bygg et program av små deler/);
  assert.match(page, /Legg til i editor/);
  assert.match(page, /appendSnippet/);
  assert.match(page, /Kopier/);
  assert.match(page, /for n in range\(1, 6\):/);
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.snippet-grid/);
  assert.match(css, /text-wrap: balance/);
  assert.match(css, /button:focus-visible/);
});

test("kodehjelpen lar eleven lære uten å forlate editoren", () => {
  const tutorialSource = page.slice(page.indexOf("const quickTutorials"), page.indexOf("type CurriculumFit"));
  assert.equal((tutorialSource.match(/    id: "/g) ?? []).length, 16);
  assert.match(page, /Hjelp mens du koder/);
  assert.match(page, /Finn den lille detaljen/);
  assert.match(page, /Tekst, variabler og regning i print/);
  assert.match(page, /Spør brukeren med input/);
  assert.match(page, /Regn med tall fra input/);
  assert.match(page, /print\(\"Til sammen blir det\", epler \+ paerer, \"frukter\.\"\)/);
  assert.match(page, /Steg for steg/);
  assert.match(page, /Vanlig feil å se etter/);
  assert.match(page, /\+ Sett inn ved markøren/);
  assert.match(page, /function insertTutorialCode/);
  assert.match(page, /selectionStart/);
  assert.match(page, /const nextCode = `\$\{before\}\$\{insertion\}\$\{after\}`/);
  assert.match(page, /copyTutorialCode/);
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.coding-help-drawer/);
  assert.match(css, /\.coding-help-body/);
  assert.match(css, /\.coding-tutorial-example/);
});

test("strukturert tilbakemelding åpnes som e-post til Skolepython-adressen", () => {
  assert.match(page, /Gi tilbakemelding/);
  assert.match(page, /mailto:skolepython@gmail\.com/);
  assert.match(page, /function composeFeedbackEmail/);
  assert.match(page, /Skolepython · Bjørnsveen: \$\{feedbackKind\}/);
  assert.match(page, /Ingen skjult innsending/);
  assert.match(page, /Appen lagrer ikke teksten/);
  assert.match(page, /Åpne ferdig e-post/);
  assert.match(desktopMain, /shell\.openExternal/);
  assert.match(desktopMain, /url\.startsWith\("mailto:"\)/);
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.feedback-modal/);
  assert.match(css, /\.feedback-card/);
});

test("Turtle tegner geometriske figurer lokalt i resultatpanelet", () => {
  assert.match(page, /from turtle import \*/);
  assert.match(page, /Tegn et Turtle-kvadrat/);
  assert.match(page, /geometrisk spiral/);
  assert.match(worker, /usesTurtle/);
  assert.match(worker, /class Turtle/);
  assert.match(worker, /def forward/);
  assert.match(worker, /def circle/);
  assert.match(worker, /def begin_fill/);
  assert.match(worker, /_sys\.modules\["turtle"\]/);
});

test("Turtle og geometriske figurer er en komplett egen modul", () => {
  assert.match(page, /id: 7,[\s\S]*title: "Turtle og geometriske figurer"/);
  assert.match(page, /vinkel = 360 \/ antall_sider/);
  assert.match(page, /En hel runde er 360 grader/);
  assert.match(page, /Tegn en valgfri mangekant/);
  assert.match(page, /Roter figuren og tegn den på nytt/);
  assert.match(page, /regulær åttekant/);
  assert.match(page, /lagre den som SVG/);
  assert.match(page, /Modul \{module\.id\}: \{module\.shortTitle\}/);
  assert.match(page, /av \{String\(modules\.length\)\.padStart\(2, "0"\)\}/);
});

test("Snake er en pedagogisk og spillbar egen modul", () => {
  assert.match(page, /id: 8,[\s\S]*title: "Bygg et spill: Snake"/);
  assert.match(page, /Koordinater plasserer alt på brettet/);
  assert.match(page, /def ett_steg/);
  assert.match(page, /from spill import Snake/);
  assert.match(page, /function SnakePlayer/);
  assert.match(page, /Bruk piltastene eller knappene under/);
  assert.match(page, /Lagre bilde/);
  assert.match(worker, /usesGame/);
  assert.match(worker, /class Snake/);
  assert.match(worker, /_sys\.modules\["spill"\]/);
  assert.match(worker, /game = JSON\.parse\(encodedGame\)/);
});

test("funksjonsgrafer har en komplett og kommentert eksamensmodul", () => {
  const templateSource = page.slice(page.indexOf("const examGraphTemplate"), page.indexOf("const codeSnippets"));
  assert.match(page, /id: 9,[\s\S]*title: "Tegn grafer\/funksjoner med Python"/);
  assert.match(templateSource, /# DEL 1: ENDRE BARE VERDIENE I DENNE DELEN/);
  assert.match(templateSource, /# Her skriver du aksetittelen for x-aksen/);
  assert.doesNotMatch(templateSource, /\n\/\/ /);
  assert.match(templateSource, /def f\(x\):[\s\S]*return 2 \* x \+ 3/);
  assert.match(templateSource, /y = f\(x\).*funksjonsverdiene f\(x\)/);
  assert.match(templateSource, /ax\.set_xlabel/);
  assert.match(templateSource, /ax\.set_ylabel/);
  assert.match(templateSource, /ax\.set_xlim/);
  assert.match(templateSource, /ax\.set_ylim/);
  assert.match(templateSource, /ax\.set_xticks/);
  assert.match(templateSource, /ax\.set_yticks/);
  assert.match(templateSource, /ax\.set_aspect\(akseforhold/);
  assert.match(page, /Utsnitt, tallsteg og akseforhold er tre ulike valg/);
  assert.match(page, /Lag en eksamensklar graf/);
  assert.match(worker, /dpi=240/);
});

test("læreplanfanen kartlegger alle mål på 8.–10. trinn til Python", () => {
  const curriculumSource = page.slice(page.indexOf("const curriculumGoals"), page.indexOf("const modules"));
  assert.equal((curriculumSource.match(/    id: "8-/g) ?? []).length, 10);
  assert.equal((curriculumSource.match(/    id: "9-/g) ?? []).length, 11);
  assert.equal((curriculumSource.match(/    id: "10-/g) ?? []).length, 11);
  assert.equal((curriculumSource.match(/    fit: "(?:Direkte|God støtte|Supplerende)"/g) ?? []).length, 32);
  assert.equal((curriculumSource.match(/    activity:/g) ?? []).length, 32);
  assert.equal((curriculumSource.match(/    tools:/g) ?? []).length, 32);
  assert.equal((curriculumSource.match(/    moduleIds:/g) ?? []).length, 32);
  assert.match(page, /<option value="curriculum">Læreplanmål<\/option>/);
  assert.match(page, /Fra læreplanmål til Python-aktivitet/);
  assert.match(page, /Python er et verktøy – matematikken er målet/);
  assert.match(page, /curriculumGrade/);
  assert.match(page, /curriculumFit/);
  assert.match(page, /Åpne Python/);
  assert.match(page, /Se originalen hos Udir/);
  assert.match(page, /MAT01-06, som gjelder fra 1\. august 2026/);
  for (const target of [
    "utforske hvordan algoritmer kan skapes, testes og forbedres ved hjelp av programmering",
    "simulere utfall i tilfeldige forsøk og beregne sannsynligheten",
    "utforske matematiske egenskaper og sammenhenger ved å bruke programmering",
    "lese og forklare tekstbasert programkode i Python",
  ]) assert.match(curriculumSource, new RegExp(target));
});

test("Turtle kan spilles av stegvis uten komprimerte mellombilder", () => {
  assert.match(worker, /_turtle_events/);
  assert.match(worker, /"line" if self\._down else "move"/);
  assert.match(worker, /canvasWidth/);
  assert.match(worker, /self\.postMessage\(\{ type: "result", output: `\$\{stdout\}\$\{stderr\}`, plots, turtle, game, variables, trace \}\)/);
  assert.match(page, /function renderTurtleFrame/);
  assert.match(page, /function TurtlePlayer/);
  assert.match(page, /Steg \$\{frame\} av \$\{lastFrame\}/);
  assert.match(page, /0,25×/);
  assert.match(page, /4×/);
  assert.match(page, /Vis ferdig/);
  assert.match(page, /Åpne stort/);
  assert.match(page, /canvas\.toDataURL\("image\/png"\)/);
  assert.doesNotMatch(worker, /_turtle_frames/);
});

test("Turtle har SVG-verktøy for vinylkutter og laser", () => {
  assert.match(page, /Skaperverksted/);
  assert.match(page, /function createTurtleSvg/);
  assert.match(page, /widthMm/);
  assert.match(page, /image\/svg\+xml/);
  assert.match(page, /Senterlinje/);
  assert.match(page, /To ytterlinjer/);
  assert.match(page, /Lukket omriss/);
  assert.match(page, /Behold farger fra Python/);
  assert.match(page, /Fargekode/);
  assert.match(page, /Behold tykkelser fra Python-koden/);
  assert.match(page, /Last ned SVG/);
  assert.match(page, /offsetTurtlePath/);
  assert.match(page, /turtlePaths\(events, workshop\)/);
  assert.match(page, /SVG-forhåndsvisning/);
  assert.match(page, /Vis Turtle/);
  assert.match(page, /!workshopPreview && cursor\.visible/);
  assert.doesNotMatch(page, /globalAlpha = 0\.12/);
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.turtle-maker-menu\[open\] \{ bottom:/);
  assert.match(css, /\.turtle-maker-menu\[open\] \.turtle-maker-panel \{ position: absolute; inset: 38px 0 0;/);
  assert.match(css, /overflow-y: auto/);
  assert.match(css, /overscroll-behavior: contain/);
  assert.match(css, /position: sticky/);
});

test("elev- og lærermodus finnes", () => {
  assert.match(page, /Elevmodus/);
  assert.match(page, /Lærermodus/);
  assert.match(page, /Undervisningstips og vurderingsstøtte/);
  assert.match(page, /pythonverkstedet-progress/);
});

test("Python kjører i en arbeider med sikkerhetsstopp", () => {
  assert.match(worker, /loadPyodide/);
  assert.match(worker, /runPythonAsync/);
  assert.match(page, /new Worker/);
  assert.match(page, /playground \? 90000 : challengeView \|\| examTrainingView \? 30000 : 8000/);
});

test("metadata og midlertidig startinnhold er ryddet", () => {
  const html = readFileSync("index.html", "utf8");
  assert.match(html, /Skolepython/);
  assert.match(html, /Fra Bjørnsveen/);
  assert.match(page, /<strong>Skolepython<\/strong>/);
  assert.match(page, /<small>Fra Bjørnsveen · Matematikk · 8.–10\. trinn<\/small>/);
  assert.match(html, /<html lang="nb">/);
  assert.equal(existsSync("app/_sites-preview/SkeletonPreview.tsx"), false);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
  assert.match(page, /© 2026 Eirik Ditlefsen Gaarde/);
  assert.match(page, /tvang en stakkars KI til å lage dette programmet/);
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.app-credit[\s\S]*font-size: 9px/);
});

test("GitHub Pages-pakken er komplett", () => {
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /npm run build:github/);
  for (const path of [
    "github-dist/index.html",
    "github-dist/pyodide-worker.mjs",
    "github-dist/og.png",
  ]) {
    assert.equal(existsSync(path), true, `${path} mangler`);
  }
});

test("Python-editoren har nybegynnervennlige IDE-verktøy", () => {
  assert.match(page, /className="syntax-gutter"/);
  assert.match(page, /editorSuggestions/);
  assert.match(page, /Kjør markert/);
  assert.match(page, /Følg stegvis/);
  assert.match(page, /executeCode\(code, "trace"\)/);
  assert.match(page, /className="project-file-tabs"/);
  assert.match(page, /function createProjectFile/);
  assert.match(page, /className="variable-search"/);
  assert.match(page, /errorLine=\{errorCoach\?\.lineNumber\}/);
  assert.match(worker, /_skolepython_sys\.settrace\(_skolepython_tracer\)/);
  assert.match(worker, /\/\\\.py\$\/i\.test/);
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.syntax-gutter/);
  assert.match(css, /\.is-error-line/);
  assert.match(css, /\.editor-suggestions/);
  assert.match(css, /\.trace-player/);
});

test("Pygame-laben kjører pygame-ce i et eget canvas", () => {
  assert.match(page, /Pygame-lab/);
  assert.match(page, /src="\.\/pygame-runner\.html"/);
  assert.match(page, /pygameStarterCode/);
  assert.match(page, /await asyncio\.sleep\(0\)/);
  assert.match(page, /Lagre bilde/);
  assert.match(pygameFrame, /<canvas id="canvas"/);
  assert.match(pygameRunner, /loadPackage\("pygame-ce"\)/);
  assert.match(pygameRunner, /pyodide\.canvas\.setCanvas2D\(canvas\)/);
  assert.match(pygameRunner, /_skip_unwind_fatal_error = true/);
  assert.match(offlinePackages, /"pygame-ce"/);
});

test("Mac-utgaven er offline, ARM64 og kan pakkes for IT", () => {
  assert.match(desktopMain, /Skolepython · Bjørnsveen/);
  assert.match(desktopMain, /smokeTestMode/);
  assert.match(desktopMain, /skolepython-smoke-/);
  assert.match(desktopMain, /app\.setPath\("userData", userDataPath\)/);
  assert.match(desktopMain, /Bjørnsveen Pythonverksted/);
  assert.match(desktopMain, /cancel: !allowed/);
  assert.match(desktopMain, /project:open/);
  assert.match(desktopMain, /project:save/);
  assert.match(desktopBuild, /macos-arm64/);
  assert.match(desktopMain, /BJORNSVEEN_SMOKE_OK/);
  assert.match(desktopMain, /import numpy as np/);
  assert.match(desktopMain, /import matplotlib\.pyplot as plt/);
  assert.match(desktopMain, /PYGAME_OFFLINE_OK/);
  assert.match(desktopMain, /pygame\.display\.set_mode/);
  assert.match(desktopMain, /plotWidth/);
  assert.match(desktopPrepare, /github-dist/);
  assert.match(desktopPrepare, /pyodide/);
  assert.match(desktopBuild, /hdiutil/);
  assert.match(desktopBuild, /pkgbuild/);
  assert.match(desktopBuild, /const productName = "Skolepython"/);
  assert.match(desktopBuild, /kodeormen\.icns/);
  assert.match(desktopBuild, /writeIcns/);
  assert.match(desktopBuild, /dmgStaging[\s\S]*run\("ditto"/);
  assert.match(desktopBuild, /finalAppDir[\s\S]*run\("ditto"/);
  assert.match(desktopBuild, /--noextattr/);
  assert.equal(existsSync("public/brand/kodeormen-master.png"), true);
  assert.equal(existsSync("public/brand/kodeormen-256.png"), true);
  assert.match(offlinePackages, /"numpy"/);
  assert.match(offlinePackages, /"matplotlib"/);
  assert.match(offlinePackages, /"scikit-learn"/);
  assert.match(offlinePackages, /"shapely"/);
  assert.match(offlinePackages, /"pygame-ce"/);
});
