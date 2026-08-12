import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/page.tsx", "utf8");
const worker = readFileSync("public/pyodide-worker.mjs", "utf8");
const workflow = readFileSync("../.github/workflows/deploy-pages.yml", "utf8");

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
  assert.match(page, /Kopier bilde/);
  assert.match(page, /Kopier tekst/);
  assert.doesNotMatch(page, /<aside/);
});

test("Python-rommet støtter datapakker, grafer og prosjektlagring", () => {
  assert.match(page, /import numpy as np/);
  assert.match(page, /import matplotlib\.pyplot as plt/);
  assert.match(page, /import pandas as pd/);
  assert.match(page, /bjornsveen-python-projects/);
  assert.match(worker, /loadPackagesFromImports/);
  assert.match(worker, /savefig/);
  assert.match(worker, /plot/);
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
