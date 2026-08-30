import { expect, test } from "@playwright/test";

async function openPython(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Skriv og kjør" })).toBeVisible();
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
  const before = await output.locator("pre").textContent();
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
  await expect(output.locator("pre")).toContainText("Ada blir 15 år neste år.");

  const completed = await output.locator("pre").textContent();
  expect(completed).toContain(`Etter svar: ${firstRandom}`);

  await editor.fill('print("Koden er endret")');
  await expect(output.getByText("Dette er resultatet fra forrige kjøring.", { exact: false })).toBeVisible();

  await runCode(page, editor, run, 'svar = input("Stopp meg: ")\nprint(svar)');
  const answer = page.getByRole("textbox", { name: "Svaret ditt" });
  await expect(answer).toBeFocused();
  await answer.press("Escape");
  await expect(page.getByRole("dialog", { name: "Skriv et svar til Python" })).toBeHidden();
  await expect(output.locator("pre")).toContainText("Kjøringen ble stoppet");
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
  await expect(output.locator("pre")).toContainText("PAKKER_OK 9.0 4 6 2 5 8 12 3 2.0");

  await page.getByRole("button", { name: "Bruk eksempel .txt" }).click();
  await page.getByRole("button", { name: "Bruk eksempel .csv" }).click();
  await runCode(page, editor, run, `import csv

with open("temperaturer.txt", encoding="utf-8") as fil:
    temperaturer = [int(linje) for linje in fil if linje.strip()]

with open("maalinger.csv", encoding="utf-8-sig", newline="") as fil:
    rader = list(csv.DictReader(fil, delimiter=";"))

print("FILER_OK", sum(temperaturer), rader[-1]["dag"], rader[-1]["temperatur"])`);
  await expect(output.locator("pre")).toContainText("FILER_OK 65 fredag 13");
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
  await expect(output.locator("pre")).toContainText("BILDE_OK");
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

  await editor.fill("import numpy as np\nimport math\nimport requests");
  const libraryStatus = page.locator(".editor-library-status");
  await expect(libraryStatus).toContainText("NumPy som np er tilgjengelig offline");
  await expect(libraryStatus).toContainText("math er tilgjengelig");
  await expect(libraryStatus).toContainText("requests er ikke bekreftet i offline-pakken");
  await expect(page.locator(".py-library").filter({ hasText: /^numpy$/ }).first()).toBeVisible();
  await expect(page.locator(".py-library").filter({ hasText: /^np$/ }).first()).toBeVisible();

  const commands = page.locator(".top-actions").getByRole("button", { name: "Kommandoer", exact: true });
  await commands.click();
  await expect(page.getByRole("dialog", { name: "Kommandobibliotek" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Kommandobibliotek" })).toBeHidden();

  await page.getByRole("button", { name: "Gi tilbakemelding" }).click();
  await expect(page.getByRole("dialog", { name: "Gi tilbakemelding" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Gi tilbakemelding" })).toBeHidden();
});

test("matematikkhjelpen er søkbar og gir kjørbare oppskrifter", async ({ page }) => {
  const { editor, output, run } = await openPython(page);

  await page.getByRole("button", { name: "Kommandoer", exact: true }).first().click();
  const commandDialog = page.getByRole("dialog", { name: "Kommandobibliotek" });
  await commandDialog.getByRole("searchbox").fill("største felles divisor");
  await expect(commandDialog.getByRole("heading", { name: "gcd og lcm finner felles faktorer og multipler" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Hjelp mens du koder" }).first().click();
  const helpDialog = page.getByRole("dialog", { name: "Finn den lille detaljen" });
  await helpDialog.getByRole("searchbox").fill("gjennomsnitt median typetall");
  await expect(helpDialog.getByRole("heading", { name: "Gjennomsnitt, median og typetall" })).toBeVisible();
  await helpDialog.getByRole("button", { name: "+ Sett inn ved markøren" }).click();
  await page.getByRole("button", { name: "Lukk kodehjelpen" }).click();

  await expect(editor).toHaveValue(/statistics\.multimode/);
  await run.click();
  await expect(output.locator("pre")).toContainText("Gjennomsnitt: 8");
  await expect(output.locator("pre")).toContainText("Median: 7.5");
  await expect(output.locator("pre")).toContainText("Typetall: [7]");
});
