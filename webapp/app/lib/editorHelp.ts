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

const moduleMembers: Record<string, EditorSuggestion[]> = {
  random: [
    {label:"randint",insert:"randint()",cursorBack:1,detail:"Tilfeldig heltall, inkludert begge grensene"},
    {label:"choice",insert:"choice()",cursorBack:1,detail:"Velg et tilfeldig element fra en liste"},
    {label:"random",insert:"random()",cursorBack:1,detail:"Tilfeldig desimaltall fra 0 til 1"},
    {label:"shuffle",insert:"shuffle()",cursorBack:1,detail:"Bland rekkefølgen i en liste"},
    {label:"uniform",insert:"uniform()",cursorBack:1,detail:"Tilfeldig desimaltall mellom to grenser"},
  ],
  math: ["sqrt", "sin", "cos", "tan", "radians", "degrees", "hypot", "ceil", "floor"].map(label=>({label,insert:`${label}()`,cursorBack:1,detail:"Matematikkfunksjon"})).concat([{label:"pi",insert:"pi",cursorBack:0,detail:"Tallet π"}]),
  statistics: ["mean", "median", "multimode", "stdev", "pstdev", "quantiles"].map(label=>({label,insert:`${label}()`,cursorBack:1,detail:"Statistikk for en talliste"})),
  numpy: ["array", "linspace", "arange", "mean", "sum", "zeros", "sqrt"].map(label=>({label,insert:`${label}()`,cursorBack:1,detail:"NumPy"})),
  "matplotlib.pyplot": ["plot", "show", "scatter", "xlabel", "ylabel", "title", "grid", "legend", "subplots", "hist"].map(label=>({label,insert:`${label}()`,cursorBack:1,detail:"Tegn og tilpass en graf"})),
  pandas: ["DataFrame", "read_csv", "Series"].map(label=>({label,insert:`${label}()`,cursorBack:1,detail:"Arbeid med tabeller"})),
  turtle: ["forward", "backward", "left", "right", "color", "pensize", "penup", "pendown", "done"].map(label=>({label,insert:`${label}()`,cursorBack:1,detail:"Turtle-tegning"})),
};
const modulesForImport = ["random","math","statistics","csv","turtle","numpy","pandas","matplotlib.pyplot","pygame","spill"];

/** Small local completion catalog, plus names declared above the caret. No code is executed. */
export function suggestionsAtCursor(value: string, cursor: number, explicit = false) {
  cursor = Math.max(0,Math.min(cursor,value.length));
  const empty = {word:"",start:cursor,end:cursor,suggestions:[] as EditorSuggestion[]};
  const before = value.slice(0,cursor);
  if(!pythonCodeOnly(before+"X").endsWith("X")) return empty;
  const masked = pythonCodeOnly(before);
  const word = before.match(/[\p{L}_][\p{L}\p{N}_]*$/u)?.[0] ?? "";
  const start = cursor-word.length;
  const end = cursor+(value.slice(cursor).match(/^[\p{L}\p{N}_]*/u)?.[0].length ?? 0);
  const line = masked.slice(masked.lastIndexOf("\n")+1);
  const aliases = new Map<string,string>();
  for(const match of masked.matchAll(/\bimport\s+([\w.]+)(?:\s+as\s+(\w+))?/g)) aliases.set(match[2]||match[1],match[1]);
  for(const match of masked.matchAll(/\bfrom\s+([\w.]+)\s+import\s+(\w+)(?:\s+as\s+(\w+))?/g)) aliases.set(match[3]||match[2],`${match[1]}.${match[2]}`);
  const receiver=before.slice(0,start).match(/([\p{L}_][\p{L}\p{N}_.]*)\.$/u)?.[1];
  let candidates: EditorSuggestion[];
  if(receiver){
    const library=aliases.get(receiver)||receiver;
    candidates=moduleMembers[library]??[];
    // Offer methods only for simple assignments whose type is clear in the source.
    const definition=[...before.slice(0,start).matchAll(/^\s*([\p{L}_][\p{L}\p{N}_]*)\s*=\s*(.+)$/gmu)].reverse().find(m=>m[1]===receiver);
    if(definition?.[2].startsWith("[")) candidates=["append","extend","pop","sort","reverse","count","index"].map(label=>({label,insert:`${label}()`,cursorBack:1,detail:`Listemetode på ${receiver}`}));
    else if(/^['"]/.test(definition?.[2]??"")) candidates=["lower","upper","strip","split","replace","startswith","endswith"].map(label=>({label,insert:`${label}()`,cursorBack:1,detail:`Tekstmetode på ${receiver}`}));
  }else if(/^\s*(?:import|from)\s+[\w.]*$/.test(line)){
    candidates=modulesForImport.map(label=>({label,insert:label,detail:"Importer bibliotek"}));
  }else if(/^\s*from\s+([\w.]+)\s+import\s+\w*$/.test(line)){
    const library=line.match(/^\s*from\s+([\w.]+)/)![1];
    candidates=(moduleMembers[library]??[]).map(t=>({...t,insert:t.label,cursorBack:0}));
  }else{
    if(!explicit&&word.length<2)return empty;
    if(/\b(?:def|class)\s+[\w]*$/.test(line))return empty;
    const local:EditorSuggestion[]=[];
    for(const m of masked.slice(0,start).matchAll(/(?:^|\n)\s*(?:def\s+([\p{L}_][\p{L}\p{N}_]*)\s*\(|(?:for\s+)?([\p{L}_][\p{L}\p{N}_]*)\s*(?:=(?!=)|\bin\b))/gu)){
      const name=m[1]||m[2];local.push({label:name,insert:m[1]?`${name}()`:name,cursorBack:m[1]?1:0,detail:m[1]?"Funksjon i programmet":"Variabel i programmet"});
    }
    for(const [name] of aliases) local.push({label:name,insert:name,detail:"Importert navn"});
    candidates=[...local,...editorSuggestions.filter(t=>!modulesForImport.includes(t.label))];
  }
  const unique=new Map<string,EditorSuggestion>();
  for(const t of candidates)if(t.label.startsWith(word)&&t.label!==word&&!unique.has(t.label))unique.set(t.label,t);
  return {word,start,end,suggestions:[...unique.values()].slice(0,8)};
}

export function completionEdit(value:string,cursor:number,suggestion:EditorSuggestion) {
  const match=suggestionsAtCursor(value,cursor,true);
  let insert=suggestion.insert, back=suggestion.cursorBack??0;
  if(value[match.end]==="("&&insert.startsWith(suggestion.label+"(")){insert=suggestion.label;back=0;}
  return {value:value.slice(0,match.start)+insert+value.slice(match.end),cursor:match.start+insert.length-back};
}

export function pythonPairedEnter(value: string, cursor: number) {
  const opening = value[cursor - 1];
  const closing = value[cursor];
  if (!opening || !pythonPairMap[opening] || pythonPairMap[opening] !== closing || opening === "\"" || opening === "'") return null;
  const lineStart = value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  const indent = value.slice(lineStart, cursor).match(/^\s*/)?.[0] ?? "";
  return {
    insertion: `\n${indent}    \n${indent}`,
    nextCursor: cursor + indent.length + 5,
  };
}
