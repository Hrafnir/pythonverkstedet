import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const page = ["app/page.tsx", "app/content/course.ts", "app/content/helpContent.ts", "app/content/curriculum.ts", "app/components/PythonEditor.tsx", "app/lib/editorHelp.ts"].map(p => readFileSync(p, "utf8")).join("\n");
const commandLibrary = readFileSync("app/pythonCommands.ts", "utf8");
const mathCommands = readFileSync("app/mathCommands.ts", "utf8");
const mathHelp = readFileSync("app/mathHelp.ts", "utf8");
const challenges = readFileSync("app/challenges.ts", "utf8");
const examTraining = readFileSync("app/examTraining.ts", "utf8");
const pygameTutorialSource = readFileSync("app/pygameTutorials.ts", "utf8");
const libraryGuideSource = readFileSync("app/libraryGuides.ts", "utf8");
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
const { pygameTutorials } = await import("../app/pygameTutorials.ts");
const { libraryGuides } = await import("../app/libraryGuides.ts");

import { analyzePythonError, analyzePythonImports } from "../app/lib/pythonErrors.ts";
import { pythonRangePreview, pythonLineDiagnostic, startsPythonBlockWithoutColon, findPythonBlockSuggestion, pythonPairedEnter } from "../app/lib/editorHelp.ts";
import { pythonCodeOnly } from "../app/lib/pythonSource.ts";
import { modules } from "../app/content/course.ts";
import { quickTutorials, codeSnippets, playgroundReferences } from "../app/content/helpContent.ts";
import { lessonMeta, learningOrder } from "../app/content/learning.ts";
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
    assert.ok(results.slice(0,-1).every((result) => result.startsWith("✓")), `${challenge.id}: ${results.join(" | ")}`);
  }

  const sumChallenge = pythonChallenges.find((challenge) => challenge.id === "sum-variables");
  const flexibleSum = "vare = 599\nporto = 49\nsvar = vare + porto\nprint(f\"Totalprisen er {svar} kr\")";
  assert.ok(evaluateChallengeAttempt(sumChallenge, flexibleSum, "Totalprisen er 648 kr").slice(0,-1).every((result) => result.startsWith("✓")));

  const discountChallenge = pythonChallenges.find((challenge) => challenge.id === "discount");
  const flexibleDiscount = "gammel_pris = 800\nrabatt_i_kroner = gammel_pris * 0.25\nsluttpris = gammel_pris - rabatt_i_kroner\nprint(sluttpris, \"kr\")";
  assert.ok(evaluateChallengeAttempt(discountChallenge, flexibleDiscount, "600.0 kr").slice(0,-1).every((result) => result.startsWith("✓")));
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
    assert.ok(results.slice(0,-1).every((result) => !result.startsWith("○") && !result.startsWith("△")), `${task.id}: ${results.join(" | ")}`);
  }

  const savings = examTasks.find((task) => task.id === "savings-growth");
  const validAlternative = "saldo = 12000\nrente = 0.04\når = 0\n\nwhile saldo <= 15000:\n    saldo = saldo * (1 + rente)\n    år += 1\n\nprint(f\"Saldoen er {saldo:.2f} kr etter {år:.2f} år\")";
  const results = evaluateExamAttempt(savings, validAlternative, "Saldoen er 15183.83 kr etter 6.00 år");
  assert.ok(results.every((result) => !result.startsWith("○")), results.join(" | "));
  assert.ok(results.some((result) => result.startsWith("△") && result.includes("egen variabel")));
  assert.match(results.at(-1), /ikke|egen|kontroll/);
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
  assert.match(page, /Skolepython/);
  assert.match(html, /<html lang="nb">/);
  assert.equal(existsSync("app/_sites-preview/SkeletonPreview.tsx"), false);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
  const css = readFileSync("app/globals.css", "utf8");
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

test("Pygame-laben kjører pygame-ce i et eget canvas", () => {
  assert.match(page, /Pygame-lab/);
  assert.match(page, /src="\.\/pygame-runner\.html"/);

  assert.match(pygameTutorialSource, /await asyncio\.sleep\(0\)/);
  assert.match(page, /Lagre bilde/);
  assert.match(pygameFrame, /<canvas id="canvas"/);
  assert.match(pygameRunner, /loadPackage\("pygame-ce"\)/);
  assert.match(pygameRunner, /pyodide\.canvas\.setCanvas2D\(canvas\)/);
  assert.match(pygameRunner, /_skip_unwind_fatal_error = true/);
  assert.match(offlinePackages, /"pygame-ce"/);
});

test("Pygame-kurset bygger et komplett spill i seks pedagogiske steg", () => {
  assert.equal(pygameTutorials.length, 6);
  assert.deepEqual(pygameTutorials.map((tutorial) => tutorial.step), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(
    pygameTutorials.map((tutorial) => tutorial.shortTitle),
    ["Spilløkka", "Spilleren", "Bevegelse", "Kollisjon", "Poeng", "Ferdig spill"],
  );
  for (const tutorial of pygameTutorials) {
    assert.ok(tutorial.question.length > 30);
    assert.ok(tutorial.explanation.length > 80);
    assert.ok(tutorial.newIdeas.length >= 3);
    assert.ok(tutorial.observe.length >= 3);
    assert.ok(tutorial.experiments.length >= 3);
    assert.match(tutorial.code, /import pygame/);
    assert.match(tutorial.code, /await asyncio\.sleep\(0\)/);
  }
  assert.match(pygameTutorials.at(-1).code, /maal = 10/);
  assert.match(pygameTutorials.at(-1).code, /pygame\.K_SPACE/);
  assert.match(pygameTutorialSource, /Fang mynten/);
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

test("alle lærings- og hjelpeområder har unike, utfylte oppføringer", () => {
  for (const [items,count] of [[modules,10],[pythonChallenges,19],[examTasks,8],[pygameTutorials,6],[libraryGuides,38],[codeSnippets,16],[playgroundReferences,24]]) {
    assert.equal(items.length,count);
    assert.equal(new Set(items.map(t=>t.id)).size,count);
  }
  assert.equal(new Set(learningOrder).size,10);
  for(const m of modules){assert.ok(m.starterCode.trim());assert.equal(m.progression.steps.length>1,true);assert.ok(lessonMeta[m.id].tests.length>=2);}
  for(const t of [...pythonChallenges,...examTasks]){assert.ok(t.testCases.length>=1);assert.ok(t.hints.length);assert.ok(t.solutionCode.trim());}
});

test("diagnostikk ignorerer tekst og kommentarer, også flere linjer", () => {
  for(const line of ['if tekst == "a=b":', 'tekst = "“hei”"', 'tall = [1,2,3]', '# if alder = 14:', 'if (tall := 4):']) assert.equal(pythonLineDiagnostic(line),null,line);
  assert.equal(pythonRangePreview('print("range(4)")'),"");
  assert.equal(startsPythonBlockWithoutColon('if tekst == "#":'),false);
  const source='tekst = """\nif alder = 3;\n"""\nif alder = 3:';
  const masked=pythonCodeOnly(source);
  assert.equal(masked.length,source.length);
  assert.equal(masked.split('\n').length,source.split('\n').length);
  assert.equal(findPythonBlockSuggestion(source,26),null);
  assert.match(masked,/if alder = 3:$/);
  assert.equal(analyzePythonImports('tekst = """\nimport requests\n"""\nimport math').length,1);
});

test("hardkodet tekst gir ikke full uttelling i kildekodesjekken", () => {
  const challenge=pythonChallenges.find(t=>t.id==='sum-variables');
  const feedback=evaluateChallengeAttempt(challenge,'print("total 648 kr +")','total 648 kr +');
  assert.ok(feedback.some(t=>!t.startsWith('✓')));
  assert.ok(!feedback.at(-1).startsWith('✓'));
  const exam=examTasks.find(t=>t.id==='discount-code-reading');
  assert.ok(evaluateExamAttempt(exam,'print("pris rabatt * 360 840")','360 840').some(t=>t.startsWith('○')));
});

test("feilhjelpen gir konkrete neste steg for indeks, null og import", () => {
  for(const [name,word] of [['IndexError','indeks'],['ZeroDivisionError','nevner'],['ModuleNotFoundError','bibliotek']]) {
    const help=analyzePythonError(`File "<exec>", line 1\n${name}: problem`,'print(tall)');
    assert.equal(help.lineNumber,1);assert.match(JSON.stringify(help).toLowerCase(),new RegExp(word));assert.ok(help.questions.length>=2);
  }
});

test("parentespar får riktig innrykk og posisjon", () => {
  assert.deepEqual(pythonPairedEnter('data = {}',8),{insertion:'\n    \n',nextCursor:13});
  assert.equal(pythonPairedEnter('tekst = ""',9),null);
  assert.equal(pythonPairedEnter('print(5)',8),null);
  assert.equal(pythonPairedEnter('tall = 5',8),null);
});

test('ett hjelpesøk finner løkke, graf og fil med norske ord', async()=>{
  const {searchHelp,topics}=await import('../app/lib/helpSearch.ts');
  for(const query of ['gjenta fem ganger','tegne graf','lese fil','while','statistics']) assert.ok(searchHelp(query).length,query);
  assert.equal(searchHelp('løkke')[0].kind,'Oppskrift');
  assert.equal(topics.filter(t=>t.kind==='Kommando').length,143);
  assert.ok(!searchHelp('').some(t=>t.advanced));
  assert.ok(searchHelp('heapq').length);
});

test('kodefullføring følger markør, importer og egne navn',async()=>{
  const {suggestionsAtCursor,completionEdit}=await import('../app/lib/editorHelp.ts');
  const suggest=code=>suggestionsAtCursor(code,code.length).suggestions;
  assert.equal(suggest('pr')[0].label,'print');
  assert.deepEqual(completionEdit('pr',2,suggest('pr')[0]),{value:'print()',cursor:6});
  assert.deepEqual(completionEdit('print(5)',2,suggest('pr')[0]),{value:'print(5)',cursor:5});
  assert.equal(suggest('import random\nrandom.')[0].label,'randint');
  assert.equal(suggest('import random as r\nr.ra')[0].label,'randint');
  assert.equal(suggest('import numpy as np\nnp.lin')[0].label,'linspace');
  assert.equal(suggest('import ra')[0].insert,'random');
  assert.equal(suggest('from random import ra')[0].insert,'randint');
  assert.equal(suggest('pris = 800\npr')[0].label,'pris');
  assert.equal(suggest('def doble(tall):\n    return tall*2\ndo')[0].label,'doble');
  assert.equal(suggest('tall = []\ntall.ap')[0].label,'append');
  assert.equal(suggest('tekst = "hei"\ntekst.up')[0].label,'upper');
  for(const code of ['# pr','print("pr',"tekst = '''\npr",'ukjent.ra'])assert.deepEqual(suggest(code),[],code);
});
