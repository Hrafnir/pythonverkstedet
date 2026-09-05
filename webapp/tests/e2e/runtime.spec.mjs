import { expect, test } from "@playwright/test";

async function openPython(page) {
  await page.goto("/");
  await expect(page.getByRole("textbox", { name: "Skriv Python-kode" })).toBeVisible();
  return {
    editor: page.getByRole("textbox", { name: "Skriv Python-kode" }),
    output: page.locator(".output-panel:visible"),
    run: page.getByRole("button", { name: /Kjør kode/ }),
  };
}

async function runCode(page, editor, run, code) {
  await editor.fill(code);
  await run.click();
}

test("input pauser samme Python-kjøring, støtter flere svar og kan avbrytes", async ({ page }) => {
  const { editor, output, run } = await openPython(page);
  await runCode(page, editor, run, `import random
tall = random.random()
print("Før svar:", tall)
navn = input("Hva heter du? ")
alder = int(input("Hvor gammel er du? "))
print("Etter svar:", tall)
print(navn, "blir", alder + 1, "år neste år.")`);

  await expect(page.getByRole("dialog", { name: "Skriv et svar til Python" })).toBeVisible();
  const before = await output.locator(".console-output").textContent();
  const firstRandom = before.match(/Før svar:\s*([0-9.]+)/)?.[1];
  expect(firstRandom).toBeTruthy();

  const firstAnswer = page.getByRole("textbox", { name: "Svaret ditt" });
  const firstSubmit = page.getByRole("button", { name: "Send svaret til Python →" });
  await firstSubmit.focus();
  await page.keyboard.press("Tab");
  await expect(firstAnswer).toBeFocused();
  await firstAnswer.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(firstSubmit).toBeFocused();

  await firstAnswer.fill("Ada");
  await firstSubmit.click();
  await expect(page.getByText("Hvor gammel er du?", { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Svaret ditt" }).fill("14");
  await page.getByRole("button", { name: "Send svaret til Python →" }).click();
  await expect(output.locator(".console-output")).toContainText("Ada blir 15 år neste år.");

  const completed = await output.locator(".console-output").textContent();
  expect(completed).toContain(`Etter svar: ${firstRandom}`);

  await editor.fill('print("Koden er endret")');
  await expect(output.getByText("Dette er resultatet fra forrige kjøring.", { exact: false })).toBeVisible();

  await runCode(page, editor, run, 'svar = input("Stopp meg: ")\nprint(svar)');
  const answer = page.getByRole("textbox", { name: "Svaret ditt" });
  await expect(answer).toBeFocused();
  await answer.press("Escape");
  await expect(page.getByRole("dialog", { name: "Skriv et svar til Python" })).toBeHidden();
  await expect(output.locator(".console-output")).toContainText("Kjøringen ble stoppet");
});

test("standardbibliotek, datafiler og alle annonserte pakker kjører", async ({ page }) => {
  const { editor, output, run } = await openPython(page);
  await runCode(page, editor, run, `import math
import random
import statistics
import numpy as np
import pandas as pd
import matplotlib
from scipy import stats
import sympy as sp
from sklearn.linear_model import LinearRegression
from PIL import Image
import networkx as nx
from shapely.geometry import Polygon

tabell = pd.DataFrame({"tall": [1, 2, 3]})
linje = stats.linregress([1, 2, 3], [2, 4, 6])
x = sp.Symbol("x")
modell = LinearRegression().fit(np.array([[1], [2], [3]]), np.array([2, 4, 6]))
bilde = Image.new("RGB", (12, 8), "white")
nett = nx.path_graph(4)
figur = Polygon([(0, 0), (2, 0), (2, 1), (0, 1)])

print("PAKKER_OK", math.sqrt(81), statistics.mean([2, 4, 6]), int(tabell["tall"].sum()), round(linje.slope), sp.solve(x - 5)[0], round(modell.predict([[4]])[0]), bilde.size[0], nx.shortest_path_length(nett, 0, 3), figur.area)`);
  await expect(output.locator(".console-output")).toContainText("PAKKER_OK 9.0 4 6 2 5 8 12 3 2.0");

  await page.getByRole("button", { name: /^Filer/ }).click();
  await page.getByRole("button", { name: "Bruk eksempel .txt" }).click();
  await page.getByRole("button", { name: "Bruk eksempel .csv" }).click();
  await runCode(page, editor, run, `import csv

with open("temperaturer.txt", encoding="utf-8") as fil:
    temperaturer = [int(linje) for linje in fil if linje.strip()]

with open("maalinger.csv", encoding="utf-8-sig", newline="") as fil:
    rader = list(csv.DictReader(fil, delimiter=";"))

print("FILER_OK", sum(temperaturer), rader[-1]["dag"], rader[-1]["temperatur"])`);
  await expect(output.locator(".console-output")).toContainText("FILER_OK 65 fredag 13");
});

test("Matplotlib, Pillow, Turtle, SVG-verktøy og Snake gir interaktive resultater", async ({ page }) => {
  const { editor, output, run } = await openPython(page);
  await runCode(page, editor, run, `from PIL import Image, ImageDraw
import matplotlib.pyplot as plt

bilde = Image.new("RGB", (120, 80), "white")
tegn = ImageDraw.Draw(bilde)
tegn.rectangle((10, 10, 110, 70), fill="coral")
plt.imshow(bilde)
plt.axis("off")
plt.show()
print("BILDE_OK")`);
  await expect(output.locator(".console-output")).toContainText("BILDE_OK");
  await expect(output.locator(".plot-card img")).toBeVisible();
  await expect(output.getByRole("button", { name: "Lagre bilde" })).toBeVisible();

  await runCode(page, editor, run, `from turtle import *
for side in range(4):
    forward(100)
    left(90)
done()`);
  await expect(output.locator(".turtle-player")).toBeVisible();
  await expect(output.getByRole("button", { name: "Lagre SVG" })).toBeVisible();
  await expect(output.getByRole("button", { name: "Spill" })).toBeVisible();

  await runCode(page, editor, run, `from spill import Snake
spill = Snake(bredde=12, hoyde=8, fart=5)
spill.start()`);
  await expect(output.locator(".snake-player")).toBeVisible();
  await expect(output.getByRole("button", { name: "Start" })).toBeVisible();
});

test("editorhjelp og modale vinduer fungerer med tastatur", async ({ page }) => {
  const { editor } = await openPython(page);
  await editor.fill("for n in range(1, 6)");
  await editor.press("End");
  await editor.press("Enter");
  await expect(page.getByText("Mangler det et kolon?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Legg til : og lag innrykk" }).click();
  await expect(editor).toHaveValue(/^for n in range\(1, 6\):\n    \n?$/);

  await editor.fill("data = ");
  await editor.focus();
  await editor.press("End");
  await editor.press("{");
  await expect(editor).toHaveValue("data = {}");
  await editor.press("Enter");
  await expect(editor).toHaveValue("data = {\n    \n}");

  await editor.fill("ordbok = ");
  await editor.focus();
  await editor.press("End");
  await editor.dispatchEvent("keydown", { key: "{", code: "Digit8", altKey: true, shiftKey: true });
  await expect(editor).toHaveValue("ordbok = {}");

  await editor.fill("liste = ");
  await editor.focus();
  await editor.press("End");
  await editor.dispatchEvent("keydown", { key: "[", code: "Digit8", altKey: true });
  await expect(editor).toHaveValue("liste = []");

  await editor.fill("import numpy as np\nimport math\nimport random\nimport pygame\nimport requests");
  const libraryStatus = page.locator(".editor-library-status");
  await expect(libraryStatus).toContainText("NumPy som np er tilgjengelig offline");
  await expect(libraryStatus).toContainText("math er tilgjengelig");
  await expect(libraryStatus).toContainText("requests er ikke bekreftet i offline-pakken");
  await expect(page.locator(".py-library").filter({ hasText: /^numpy$/ }).first()).toBeVisible();
  await expect(page.locator(".py-library").filter({ hasText: /^np$/ }).first()).toBeVisible();
  await expect(page.locator(".py-library").filter({ hasText: /^pygame$/ }).first()).toBeVisible();
  const editorMetrics = await page.locator(".py-library").filter({ hasText: /^pygame$/ }).first().evaluate((token) => {
    const input = token.closest(".python-editor")?.querySelector(".syntax-input");
    if (!(input instanceof HTMLTextAreaElement)) return null;
    const tokenStyle = getComputedStyle(token);
    const inputStyle = getComputedStyle(input);
    return {
      tokenWeight: tokenStyle.fontWeight,
      inputWeight: inputStyle.fontWeight,
      tokenFamily: tokenStyle.fontFamily,
      inputFamily: inputStyle.fontFamily,
      tokenSize: tokenStyle.fontSize,
      inputSize: inputStyle.fontSize,
      tokenSpacing: tokenStyle.letterSpacing,
      inputSpacing: inputStyle.letterSpacing,
    };
  });
  expect(editorMetrics).not.toBeNull();
  expect(editorMetrics.tokenWeight).toBe(editorMetrics.inputWeight);
  expect(editorMetrics.tokenFamily).toBe(editorMetrics.inputFamily);
  expect(editorMetrics.tokenSize).toBe(editorMetrics.inputSize);
  expect(editorMetrics.tokenSpacing).toBe(editorMetrics.inputSpacing);

  await page.locator(".header-actions").getByRole("button", {name:"? Hjelp"}).click();
  await expect(page.getByRole("searchbox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".help-panel")).toBeHidden();
  await expect(editor).toBeFocused();
  await page.getByLabel("Appmeny").click();
  await page.getByRole("button", { name: "Gi tilbakemelding" }).click();
  await expect(page.getByRole("dialog", { name: "Gi tilbakemelding" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Gi tilbakemelding" })).toBeHidden();
});

test("samlet hjelp søker og åpner et eksempel uten å miste prosjektet", async ({ page }) => {
  const { editor, output, run } = await openPython(page);
  await editor.fill('print("MITT_UTKAST")');
  await page.locator(".header-actions").getByRole("button", {name:"? Hjelp"}).click();
  await page.getByRole("searchbox").fill("gjennomsnitt median typetall");
  await page.locator(".help-result").filter({hasText:"Gjennomsnitt, median og typetall"}).first().click();
  await page.getByRole("button", {name:"Prøv i nytt eksempel ↗"}).click();
  await expect(editor).toHaveValue(/statistics.multimode/);
  await run.click();
  await expect(output.locator(".console-output")).toContainText("Median: 7.5");
  await page.getByRole("combobox", {name:"Åpent prosjekt"}).selectOption("mitt-forste-prosjekt");
  await expect(editor).toHaveValue('print("MITT_UTKAST")');
});

test("IDE-hjelpen støtter forslag, feilmarkering, markert kode, steg og flere filer", async ({ page }) => {
  const { editor, output, run } = await openPython(page);

  await editor.fill("pri");
  await expect(page.locator(".editor-suggestions")).toContainText("print");
  await editor.press("Tab");
  await expect(editor).toHaveValue("print()");
  await expect(page.locator(".syntax-gutter span")).toHaveCount(1);

  await editor.fill('print("BARE_MARKERT")');
  await editor.focus();
  await editor.press("ControlOrMeta+A");
  await page.getByText("Flere verktøy", {exact:true}).click();
  await expect(page.getByRole("button", { name: "Kjør markert" })).toBeEnabled();
  await page.getByRole("button", { name: "Kjør markert" }).click();
  await expect(output.locator(".console-output")).toContainText("BARE_MARKERT");

  await editor.fill("start = 2\ndobbelt = start * 2\nprint(dobbelt)");
  await page.getByText("Flere verktøy",{exact:true}).click();
  await page.getByRole("button", { name: "Følg stegvis" }).click();
  await expect(page.locator(".trace-player")).toBeVisible();
  await expect(page.locator(".trace-player")).toContainText("Følg programmet");

  page.once("dialog", (dialog) => dialog.accept("hjelper.py"));
  await page.getByRole("button", { name: /^Filer/ }).click();
  await page.getByRole("button", { name: "+ Ny fil" }).click();
  await expect(page.getByRole("button", { name: "hjelper.py" })).toBeVisible();
  await editor.fill("def doble(tall):\n    return tall * 2");
  const mainFile = page.locator(".project-file-tabs button").filter({ hasNotText: /Ny fil|hjelper/ }).first();
  await mainFile.click();
  await editor.fill("from hjelper import doble\nprint(doble(6))");
  await run.click();
  await expect(output.locator(".console-output")).toContainText("12");

  await editor.fill("if 3 > 2\n    print('ja')");
  await run.click();
  await expect(page.locator(".syntax-gutter .is-error-line")).toHaveText("1");
});

for (const step of [1, 6]) test(`Pygame-steg ${step} starter og stopper`, async ({page}) => {
  await page.goto("/#pygame");
  await expect(page.getByRole("heading", {name:"Fang mynten", exact:true})).toBeVisible();
  await page.getByLabel("Velg steg").selectOption({index:step-1});
  await page.getByRole("button", {name:`Prøv steg ${step}`, exact:true}).click();
  const editor=page.getByRole("textbox", {name:"Skriv Pygame-kode"});
  await expect(editor).toHaveValue(/while kjorer:/);
  await page.getByRole("button", {name:"Start spillet"}).click();
  await expect(page.getByRole("button", {name:"Spillet kjører", exact:true})).toBeVisible();
  await expect(page.frameLocator('iframe[title="Pygame-spillflate"]').locator("canvas")).toBeVisible();
  await expect(page.locator(".pygame-console")).not.toContainText(/Traceback|Error:/);
  await page.getByRole("button", {name:"■ Stopp", exact:true}).click();
});

test("utkast, angre og historikk tåler oppfriskning", async ({page}) => {
  const {editor}=await openPython(page);
  await editor.fill('print("LAGRET")');
  await page.reload();
  await expect(editor).toHaveValue('print("LAGRET")');
  await page.getByRole('link',{name:'Lær',exact:true}).click();
  const lesson=page.getByRole('textbox',{name:'Skriv Python-kode'});
  await lesson.fill('print("MODUL_UTKAST")');
  await page.reload();
  await expect(lesson).toHaveValue('print("MODUL_UTKAST")');
  await page.getByText('Flere verktøy',{exact:true}).click();
  await page.getByRole('button',{name:'Tøm kodefeltet'}).click();
  await expect(lesson).toHaveValue('');
  await page.getByRole('button',{name:/Angre/}).click();
  await expect(lesson).toHaveValue('print("MODUL_UTKAST")');
  await page.getByRole('link',{name:'Øv',exact:true}).click();
  await page.goBack();
  await expect(page.getByRole('combobox',{name:'Velg modul'})).toHaveValue('1');
  await expect(lesson).toHaveValue('print("MODUL_UTKAST")');
});

test("stopp og navigasjon avbryter kjøring uten å flytte gamle resultater",async({page})=>{
  const {editor,run,output}=await openPython(page);
  await runCode(page,editor,run,'while True:\n    pass');
  await page.getByRole('button',{name:'■ Stopp',exact:true}).click();
  await expect(output).toContainText('stoppet');
  await expect(run).toBeEnabled();
  await run.click();
  await page.getByRole('link',{name:'Lær',exact:true}).click();
  await expect(page.getByRole('button',{name:'■ Stopp',exact:true})).toBeHidden();
  await expect(page.getByRole('combobox',{name:'Velg modul'})).toBeVisible();
});

for(const [width,height] of [[1280,720],[1366,768],[1024,768],[390,844],[640,360]]) test(`arbeidsflaten fungerer på ${width}×${height}`,async({page})=>{
  await page.setViewportSize({width,height});
  const {editor,run}=await openPython(page);
  await expect(run).toBeInViewport();
  await expect(editor).toBeInViewport();
  const metrics=await page.evaluate(()=>({width:document.documentElement.scrollWidth,view:innerWidth,font:getComputedStyle(document.querySelector('.syntax-input')).fontFamily}));
  expect(metrics.width).toBeLessThanOrEqual(metrics.view);
  expect(metrics.font).toMatch(/mono|Menlo|Consolas/i);
  await page.locator('.header-actions').getByRole('button',{name:'? Hjelp'}).click();
  await expect(page.getByRole('searchbox')).toBeInViewport();
  await page.getByRole('button',{name:'Lukk hjelpen og gå til koden'}).click();
  await expect(editor).toBeFocused();
});

test('modul 9 starter med en kort kjørbar graf og modul 10 får datafilen med',async({page})=>{
  await page.goto('/#learn/9');
  await page.getByRole('button',{name:/Forutsi/}).click();
  await page.getByRole('button',{name:'Prøv eksemplet i koden'}).click();
  const editor=page.getByRole('textbox',{name:'Skriv Python-kode'});
  expect((await editor.inputValue()).split('\n').length).toBeLessThan(20);
  await page.getByRole('button',{name:/Kjør kode/}).click();
  await expect(page.locator('.plot-card img')).toBeVisible();
  await page.getByRole('combobox',{name:'Velg modul'}).selectOption('10');
  await page.getByRole('button',{name:/Forutsi/}).click();
  await page.getByRole('button',{name:'Prøv eksemplet i koden'}).click();
  await page.getByRole('button',{name:/Kjør kode/}).click();
  await expect(page.locator('.console-output')).toContainText('13');
  await expect(page.locator('.error-coach')).toBeHidden();
});

test('vurdering krever gjeldende kjøring og gir ingen hardkodet godkjenning',async({page})=>{
  await page.goto('/#learn/1');
  await page.locator('.lesson-step-nav').getByRole('button',{name:/Oppgave/}).click();
  const editor=page.getByRole('textbox',{name:'Skriv Python-kode'});
  await editor.fill('print(560)');
  await page.getByRole('button',{name:'Sjekk resultatet'}).click();
  await expect(page.locator('.lesson-body [role="status"]')).toContainText(/Kjør/);
  await page.getByRole('button',{name:/Kjør kode/}).click();
  await expect(page.locator('.console-output')).toContainText('560');
  await editor.fill('print(100)');
  await page.getByRole('button',{name:'Sjekk resultatet'}).click();
  await expect(page.locator('.lesson-body [role="status"]')).toContainText(/Kjør/);
});
