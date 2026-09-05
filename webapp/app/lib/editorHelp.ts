import { pythonCodeOnly } from "./pythonSource.ts";
type EditorDiagnostic = {
  kind: "tip" | "warning";
  message: string;
  fixLabel?: string;
  find?: string;
  fixPattern?: RegExp;
  replacement?: string;
};

export function pythonRangePreview(line: string) {
  const match = pythonCodeOnly(line).match(/\brange\(\s*(-?\d+)\s*(?:,\s*(-?\d+)\s*)?(?:,\s*(-?\d+)\s*)?\)/);
  if (!match) return "";
  const first = Number(match[1]);
  const second = match[2] === undefined ? undefined : Number(match[2]);
  const third = match[3] === undefined ? undefined : Number(match[3]);
  const start = second === undefined ? 0 : first;
  const stop = second === undefined ? first : second;
  const step = third ?? 1;
  if (step === 0) return "range kan ikke ha 0 som steg.";
  const values: number[] = [];
  for (let number = start; step > 0 ? number < stop : number > stop; number += step) {
    values.push(number);
    if (values.length === 9) break;
  }
  const hasMore = values.length === 9 && (step > 0 ? values[8] + step < stop : values[8] + step > stop);
  const expression = match[0];
  return values.length
    ? `${expression} gir ${values.join(", ")}${hasMore ? ", …" : ""}. Stopptallet ${stop} er ikke med.`
    : `${expression} gir ingen tall. Start, stopp og steg peker ikke mot hverandre.`;
}

export function pythonLineDiagnostic(line: string): EditorDiagnostic | null {
  const code = pythonCodeOnly(line).trim();
  if (!code) return null;
  if (/[“”‘’]/.test(code)) return {
    kind: "warning",
    message: "Disse anførselstegnene kommer ofte fra et dokument. Python trenger rette anførselstegn.",
    fixLabel: "Bytt til rette tegn",
    find: code.match(/[“”‘’]/)?.[0],
    replacement: /[“”]/.test(code.match(/[“”‘’]/)?.[0] ?? "") ? "\"" : "'",
  };
  if (/^(?:if|elif|while)\b.*(?:&&|\|\|)/.test(code)) {
    const find = code.includes("&&") ? "&&" : "||";
    return {
      kind: "warning",
      message: `Python skriver ${find === "&&" ? "og" : "eller"} med ord: ${find === "&&" ? "and" : "or"}.`,
      fixLabel: `Bytt ${find} til ${find === "&&" ? "and" : "or"}`,
      find,
      replacement: find === "&&" ? "and" : "or",
    };
  }
  if (/^(?:if|elif|while)\b[^#]*(?<![<>=!:])=(?!=)/.test(code)) return {
    kind: "warning",
    message: "I en betingelse gir = en verdi. Når du vil sammenligne to verdier, bruker Python ==.",
    fixLabel: "Bytt = til ==",
    fixPattern: /(?<![<>=!:])=(?!=)/,
    replacement: "==",
  };
  if (/^(?:if|elif|else|for|while|def|class|with|try|except|finally|match|case)\b.*;\s*$/.test(code)) return {
    kind: "warning",
    message: "En linje som starter en løkke eller et kodeblokk avsluttes med kolon (:), ikke semikolon (;).",
    fixLabel: "Bytt ; til :",
    find: ";",
    replacement: ":",
  };
  if (/\d\s*\^\s*\d/.test(code)) return {
    kind: "tip",
    message: "I Python betyr ^ noe annet enn potens. Bruk ** når du vil opphøye et tall.",
    fixLabel: "Bytt ^ til **",
    find: "^",
    replacement: "**",
  };
  if (/^\s*[\p{L}_]\w*\s*=\s*-?\d+,\d+\s*$/u.test(code)) return {
    kind: "tip",
    message: "Ser dette ut som et desimaltall? Python bruker punktum: 2.5. Komma lager to separate verdier.",
  };
  return null;
}

export function startsPythonBlockWithoutColon(line: string) {
  const code = pythonCodeOnly(line).trim();
  return /^(?:if|elif|else|for|while|def|class|with|try|except|finally|match|case)\b/.test(code)
    && !code.endsWith(":")
    && !code.endsWith(";")
    && !/[([{]$/.test(code);
}

type PythonBlockSuggestion = { position: number; indent: string; hasFollowingNewline: boolean };

export function findPythonBlockSuggestion(value: string, cursor: number): PythonBlockSuggestion | null {
  const safeCursor = Math.min(cursor, value.length);
  const currentStart = value.lastIndexOf("\n", Math.max(0, safeCursor - 1)) + 1;
  const nextNewline = value.indexOf("\n", safeCursor);
  const currentEnd = nextNewline === -1 ? value.length : nextNewline;
  const currentLine = pythonCodeOnly(value).slice(currentStart, currentEnd);
  if (startsPythonBlockWithoutColon(currentLine)) {
    return {
      position: currentEnd,
      indent: currentLine.match(/^\s*/)?.[0] ?? "",
      hasFollowingNewline: value[currentEnd] === "\n",
    };
  }
  if (currentLine.trim() || currentStart === 0) return null;
  const previousEnd = currentStart - 1;
  const previousStart = value.lastIndexOf("\n", Math.max(0, previousEnd - 1)) + 1;
  const previousLine = pythonCodeOnly(value).slice(previousStart, previousEnd);
  if (!startsPythonBlockWithoutColon(previousLine)) return null;
  return {
    position: previousEnd,
    indent: previousLine.match(/^\s*/)?.[0] ?? "",
    hasFollowingNewline: true,
  };
}

export const pythonPairMap: Record<string, string> = { "(": ")", "[": "]", "{": "}", "\"": "\"", "'": "'" };
export const pythonClosingCharacters = new Set(Object.values(pythonPairMap));

export type EditorSuggestion = { label: string; insert: string; detail: string; cursorBack?: number };

const editorSuggestions: EditorSuggestion[] = [
  { label: "print", insert: "print()", detail: "Vis tekst eller verdier", cursorBack: 1 },
  { label: "input", insert: "input()", detail: "Spør brukeren om en verdi", cursorBack: 1 },
  { label: "range", insert: "range()", detail: "Lag en tallfølge til en løkke", cursorBack: 1 },
  { label: "len", insert: "len()", detail: "Finn antall elementer", cursorBack: 1 },
  { label: "round", insert: "round(, 2)", detail: "Avrund et tall", cursorBack: 4 },
  { label: "int", insert: "int()", detail: "Gjør tekst om til heltall", cursorBack: 1 },
  { label: "float", insert: "float()", detail: "Gjør tekst om til desimaltall", cursorBack: 1 },
  { label: "str", insert: "str()", detail: "Gjør en verdi om til tekst", cursorBack: 1 },
  { label: "sum", insert: "sum()", detail: "Legg sammen en liste", cursorBack: 1 },
  { label: "min", insert: "min()", detail: "Finn minste verdi", cursorBack: 1 },
  { label: "max", insert: "max()", detail: "Finn største verdi", cursorBack: 1 },
  { label: "for", insert: "for n in range():\n    ", detail: "Gjenta kode flere ganger", cursorBack: 7 },
  { label: "while", insert: "while vilkaar:\n    ", detail: "Gjenta så lenge et vilkår er sant", cursorBack: 5 },
  { label: "if", insert: "if vilkaar:\n    ", detail: "Kjør kode når et vilkår er sant", cursorBack: 5 },
  { label: "else", insert: "else:\n    ", detail: "Alternativet når if ikke er sant" },
  { label: "def", insert: "def funksjon():\n    ", detail: "Lag en funksjon", cursorBack: 8 },
  { label: "return", insert: "return ", detail: "Send en verdi ut av en funksjon" },
  { label: "import", insert: "import ", detail: "Hent et bibliotek" },
  { label: "math", insert: "import math", detail: "Kvadratrot, pi og annen matematikk" },
  { label: "random", insert: "import random", detail: "Tilfeldige tall og valg" },
  { label: "statistics", insert: "import statistics", detail: "Gjennomsnitt, median og typetall" },
  { label: "numpy", insert: "import numpy as np", detail: "Regn med mange tall" },
  { label: "pandas", insert: "import pandas as pd", detail: "Arbeid med tabeller" },
  { label: "matplotlib", insert: "import matplotlib.pyplot as plt", detail: "Tegn grafer" },
  { label: "pygame", insert: "import pygame", detail: "Lag 2D-spill i Pygame-laben" },
];

export function suggestionsAtCursor(value: string, cursor: number) {
  const before = value.slice(0, cursor);
  const match = before.match(/[A-Za-z_][A-Za-z_0-9]*$/);
  const word = match?.[0] ?? "";
  if (word.length < 2) return { word: "", start: cursor, suggestions: [] as EditorSuggestion[] };
  const normalized = word.toLowerCase();
  return {
    word,
    start: cursor - word.length,
    suggestions: editorSuggestions.filter((suggestion) => suggestion.label.startsWith(normalized) && suggestion.label !== normalized).slice(0, 5),
  };
}

export function pythonPairedEnter(value: string, cursor: number) {
  const opening = value[cursor - 1];
  const closing = value[cursor];
  if (!opening || pythonPairMap[opening] !== closing || opening === "\"" || opening === "'") return null;
  const lineStart = value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  const indent = value.slice(lineStart, cursor).match(/^\s*/)?.[0] ?? "";
  return {
    insertion: `\n${indent}    \n${indent}`,
    nextCursor: cursor + indent.length + 5,
  };
}
