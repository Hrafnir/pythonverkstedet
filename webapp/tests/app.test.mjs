import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/page.tsx", "utf8");
const worker = readFileSync("public/pyodide-worker.mjs", "utf8");
const workflow = readFileSync("../.github/workflows/deploy-pages.yml", "utf8");
const desktopMain = readFileSync("desktop/main.mjs", "utf8");
const desktopBuild = readFileSync("scripts/build-macos.mjs", "utf8");
const desktopPrepare = readFileSync("scripts/prepare-desktop-dev.mjs", "utf8");
const offlinePackages = readFileSync("scripts/download-pyodide.mjs", "utf8");

test("appen inneholder seks komplette læringsmoduler", () => {
  const moduleIds = page.match(/\n    id: [1-6],/g) ?? [];
  assert.equal(moduleIds.length, 6);
  for (const step of ["Problem", "Oppfriskning", "Lær", "Prøv", "Forklar", "Oppgave"]) {
    assert.match(page, new RegExp(`"${step}"`));
  }
  assert.equal((page.match(/    refresh: \{/g) ?? []).length, 6);
  assert.match(page, /navn = verdi/);
  assert.match(page, /Slik lager du en variabel/);
});

test("modulvelgeren har et fritt Python-rom uten sidepanel", () => {
  assert.match(page, /id="module-select"/);
  assert.match(page, /Fritt Python-rom/);
  assert.match(page, /playgroundCode/);
  assert.match(page, /Lokale prosjekter/);
  assert.match(page, /Importer \.py/);
  assert.match(page, /Bilde av kode \+ svar/);
  assert.match(page, /Kopier kode \+ svar/);
  assert.doesNotMatch(page, /<aside/);
});

test("modulene har tom skrivelab, redigerbar fasit, kodefarger og ekstratriks", () => {
  assert.match(page, /Skriv selv/);
  assert.match(page, /Tom editor med hjelp/);
  assert.match(page, /Fasit er ikke låst/);
  assert.match(page, /pythonTokens/);
  assert.match(page, /Valgfritt ekstratriks/);
  assert.match(page, /Den nye prisen på produktet er/);
  assert.equal((page.match(/    typingSteps: \[/g) ?? []).length, 6);
  assert.match(page, /Skriv dette i kodefeltet/);
  assert.match(page, /Forklaring/);
  assert.match(page, /Gjør dette/);
  assert.match(page, /typing-explanation/);
  assert.equal((page.match(/    polish: \{/g) ?? []).length, 6);
});

test("alle moduler bygger kompetanse i små, kjørbare steg", () => {
  assert.equal((page.match(/    progression: \{/g) ?? []).length, 6);
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
  assert.match(page, /event\.key !== "Tab"/);
  assert.match(page, /event\.shiftKey/);
  assert.match(page, /bjornsveen-editor-font-size/);
  assert.match(page, /requestFullscreen/);
  assert.match(page, /Fullskjerm/);
  assert.match(page, /const playgroundCode = ""/);
  assert.match(page, /code: ""/);
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

test("Python-rommet har et komplett, søkbart oppslagsverk", () => {
  assert.match(page, /Python-håndbok/);
  assert.match(page, /Søk i håndboken/);
  assert.match(page, /playgroundReferences/);
  assert.equal((page.match(/    id: "(?:variabler|tekst|vilkar|tallmonster|lister|funksjoner|tilfeldighet|tabeller|grafer|turtle-figurer|turtle-spiral|numpy|symbolsk)",/g) ?? []).length, 13);
  assert.match(page, /Viktige koder og kommandoer/);
  assert.match(page, /Eksperimenter videre/);
  assert.match(page, /Åpne som nytt prosjekt/);
  assert.match(page, /Det gamle prosjektet er bevart/);
  assert.match(page, /Når koden ikke virker/);
  for (const errorName of ["SyntaxError", "IndentationError", "NameError", "TypeError"]) {
    assert.match(page, new RegExp(errorName));
  }
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
  assert.match(worker, /self\.postMessage\(\{ type: "result", output: `\$\{stdout\}\$\{stderr\}`, plots, turtle \}\)/);
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
  assert.match(page, /playground \? 90000 : 8000/);
});

test("metadata og midlertidig startinnhold er ryddet", () => {
  const html = readFileSync("index.html", "utf8");
  assert.match(html, /Bjørnsveen Pythonverksted/);
  assert.match(html, /<html lang="nb">/);
  assert.equal(existsSync("app/_sites-preview/SkeletonPreview.tsx"), false);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
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

test("Mac-utgaven er offline, ARM64 og kan pakkes for IT", () => {
  assert.match(desktopMain, /no\.bjornsveen\.pythonverksted|Bjørnsveen Pythonverksted/);
  assert.match(desktopMain, /cancel: !allowed/);
  assert.match(desktopMain, /project:open/);
  assert.match(desktopMain, /project:save/);
  assert.match(desktopBuild, /macos-arm64/);
  assert.match(desktopMain, /BJORNSVEEN_SMOKE_OK/);
  assert.match(desktopMain, /import numpy as np/);
  assert.match(desktopMain, /import matplotlib\.pyplot as plt/);
  assert.match(desktopMain, /plotWidth/);
  assert.match(desktopPrepare, /github-dist/);
  assert.match(desktopPrepare, /pyodide/);
  assert.match(desktopBuild, /hdiutil/);
  assert.match(desktopBuild, /pkgbuild/);
  assert.match(desktopBuild, /kodeormen\.icns/);
  assert.match(desktopBuild, /--noextattr/);
  assert.equal(existsSync("public/brand/kodeormen-master.png"), true);
  assert.equal(existsSync("public/brand/kodeormen-256.png"), true);
  assert.match(offlinePackages, /"numpy"/);
  assert.match(offlinePackages, /"matplotlib"/);
  assert.match(offlinePackages, /"scikit-learn"/);
});
