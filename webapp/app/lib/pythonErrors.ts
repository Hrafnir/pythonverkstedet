import { pythonCodeOnly } from "./pythonSource.ts";
export type ErrorCoach = {
  kind: "syntax" | "indent" | "name" | "type" | "file" | "data" | "runtime";
  title: string;
  summary: string;
  lineNumber?: number;
  codeLine?: string;
  questions: string[];
  hint: string;
  technical: string;
};

export function analyzePythonError(rawError: string, source: string): ErrorCoach {
  const technical = rawError.trim() || "Python stoppet uten en teknisk feilmelding.";
  const lines = source.split("\n");
  const userLineMatches = [...technical.matchAll(/File ["']<(?:exec|string)>["'], line (\d+)/g)];
  const syntaxLineMatch = technical.match(/line (\d+)[\s\S]*?(?:SyntaxError|IndentationError|TabError)/);
  const parsedLine = Number(userLineMatches.at(-1)?.[1] ?? syntaxLineMatch?.[1] ?? 0);
  const lineNumber = parsedLine >= 1 && parsedLine <= lines.length ? parsedLine : undefined;
  const codeLine = lineNumber ? lines[lineNumber - 1] : undefined;
  const lineLabel = lineNumber ? `linje ${lineNumber}` : "koden";
  const trimmedLine = codeLine?.trim() ?? "";
  const blockHeader = /^\s*(?:if|elif|else|for|while|def|class|try|except|finally|with)\b/;
  const semicolonHeader = blockHeader.test(codeLine ?? "") && /;\s*(?:#.*)?$/.test(codeLine ?? "");
  const missingColon = blockHeader.test(codeLine ?? "") && !/:\s*(?:#.*)?$/.test(codeLine ?? "");
  const errorName = technical.match(/\b(SyntaxError|IndentationError|TabError|NameError|TypeError|IndexError|ValueError|ZeroDivisionError|ModuleNotFoundError):\s*([^\n]*)/);
  const detail = errorName?.[2]?.trim() ?? "";

  if (semicolonHeader) {
    return {
      kind: "syntax",
      title: "Et lite tegn står i veien",
      summary: `Python stoppet ved ${lineLabel}. Linjen ser ut som starten på en kodeblokk, men avslutningstegnet passer ikke med Python-reglene.`,
      lineNumber,
      codeLine,
      questions: [
        "Starter linjen med if, for, while eller def?",
        "Hvilket tegn bruker eksemplene i modulene rett før en innrykket blokk?",
        "Er det et semikolon der du forventet dette tegnet?",
      ],
      hint: "I Python åpnes en blokk med kolon (:). Sammenlign det siste tegnet på linjen med et fungerende if- eller for-eksempel.",
      technical,
    };
  }

  if (/SyntaxError/.test(technical) && (missingColon || /expected ['\"]?:['\"]?/i.test(detail))) {
    return {
      kind: "syntax",
      title: "Python venter på et kolon",
      summary: `Se nøye på slutten av ${lineLabel}. Python tror linjen skal starte en innrykket kodeblokk.`,
      lineNumber,
      codeLine,
      questions: [
        "Er dette en if-, elif-, else-, for-, while- eller def-linje?",
        "Skal de neste linjene ha innrykk og høre til denne linjen?",
        "Hvilket tegn mangler helt til slutt?",
      ],
      hint: "En linje som starter en innrykket blokk, avsluttes med kolon (:). Du må selv plassere tegnet på riktig sted.",
      technical,
    };
  }

  if (/unterminated string|EOL while scanning|string literal/i.test(technical)) {
    return {
      kind: "syntax",
      title: "Python finner ikke slutten på teksten",
      summary: `På ${lineLabel} ser en tekst ut til å begynne uten å bli avsluttet på samme måte.`,
      lineNumber,
      codeLine,
      questions: [
        "Hvor begynner teksten med et anførselstegn?",
        "Finnes det et tilsvarende anførselstegn etter siste bokstav?",
        "Er samme type tegn brukt på begge sider – ' eller \"?",
      ],
      hint: "Tekst må ha et par anførselstegn. Tell tegnene på linjen og kontroller at det finnes en tydelig start og slutt.",
      technical,
    };
  }

  if (/was never closed|unmatched ['\")\]}]|closing parenthesis|does not match opening/i.test(technical)) {
    return {
      kind: "syntax",
      title: "Et tegn mangler partneren sin",
      summary: `Python tror en parentes, hakeparentes eller krøllparentes rundt ${lineLabel} ikke er lukket riktig.`,
      lineNumber,
      codeLine,
      questions: [
        "Kan du peke på hvert åpningstegn: (, [ eller {?",
        "Har hvert åpningstegn et lukketegn av samme type?",
        "Er tegnene lukket i motsatt rekkefølge av den de ble åpnet i?",
      ],
      hint: "Tell åpne og lukkede tegn. Parene er (), [] og {}. Begynn på den markerte linjen og se også på linjen rett over.",
      technical,
    };
  }

  if (/IndentationError|TabError/.test(technical)) {
    const expectedBlock = /expected an indented block/i.test(technical);
    return {
      kind: "indent",
      title: expectedBlock ? "Python venter på innrykk" : "Innrykket følger ikke mønsteret",
      summary: expectedBlock
        ? `Python fant ikke en innrykket handling ved ${lineLabel}.`
        : `Ved ${lineLabel} er det sannsynligvis for mange, for få eller ulike typer innrykk.`,
      lineNumber,
      codeLine,
      questions: [
        "Hvilken if-, for-, while- eller def-linje skal denne linjen høre til?",
        "Har alle linjene i samme blokk like mange mellomrom?",
        "Kan Tab-knappen i editoren brukes til å lage fire mellomrom?",
      ],
      hint: expectedBlock
        ? "Linjen etter kolon må vanligvis rykkes inn ett nivå. Bruk Tab én gang i editoren."
        : "Marker linjene som skal høre sammen, og sammenlign hvor teksten begynner. Bruk Tab eller Shift+Tab for ett helt nivå.",
      technical,
    };
  }

  if (/SyntaxError/.test(technical)) {
    const assignmentInCondition = /^\s*(?:if|elif|while)\b/.test(pythonCodeOnly(codeLine ?? "")) && /(?<![<>=!:])=(?!=)/.test(pythonCodeOnly(codeLine ?? ""));
    return {
      kind: "syntax",
      title: "Python forstår ikke skrivemåten ennå",
      summary: `Python peker mot ${lineLabel}${trimmedLine ? ", men årsaken kan også stå like før stedet den peker på" : ""}.`,
      lineNumber,
      codeLine,
      questions: assignmentInCondition
        ? ["Prøver linjen å sammenligne to verdier?", "Hvor mange likhetstegn brukes når Python skal spørre «er lik»?", "Er kolon plassert helt til slutt?"]
        : ["Er kolon, komma og anførselstegn på riktig plass?", "Har alle parenteser en partner?", "Ser linjen rett over ferdig ut?"],
      hint: assignmentInCondition
        ? "Ett likhetstegn gir en variabel en verdi. To likhetstegn sammenligner verdier. Finn selv hvilket av dem denne linjen trenger."
        : "Les den markerte linjen tegn for tegn og sammenlign med nærmeste fungerende eksempel. Python markerer ofte stedet der den ga opp, ikke nødvendigvis det første gale tegnet.",
      technical,
    };
  }

  const specific = /IndexError/.test(technical) ? {
    title: "Plassen finnes ikke i listen", summary: "Indeksen peker utenfor listen eller teksten.",
    questions: ["Hvor mange elementer finnes?", "Starter du tellingen på 0?", "Kan listen være tom?"],
    hint: "For en liste med n elementer er de vanlige indeksene 0 til n − 1. Skriv ut len(liste) og indeksen før linjen som feiler."
  } : /ZeroDivisionError/.test(technical) ? {
    title: "Du prøver å dele på null", summary: "Nevneren ble 0. Python kan heller ikke ta rest med 0.",
    questions: ["Hvilken verdi står etter /, // eller %?", "Er listen tom når du regner gjennomsnitt?"],
    hint: "Kontroller nevneren før beregningen. Bruk et vilkår for å forklare hva programmet skal gjøre når verdien er 0."
  } : /ModuleNotFoundError/.test(technical) ? {
    title: "Biblioteket er ikke tilgjengelig", summary: "Importnavnet finnes ikke i dette kjøremiljøet.",
    questions: ["Er navnet stavet riktig?", "Krever eksemplet Pygame-miljøet?", "Finnes biblioteket under Hjelp → Bibliotek?"],
    hint: "Bruk bibliotekoversikten for å finne støttede importer. Pygame kjøres ved å velge Pygame i arbeidsmiljøet."
  } : null;
  if (specific) return { kind: "runtime", ...specific, lineNumber, codeLine, technical };

  if (/FileNotFoundError/.test(technical)) {
    const missingFile = technical.match(/No such file or directory: ['"]([^'"]+)['"]/)?.[1];
    return {
      kind: "file",
      title: "Python finner ikke datafilen",
      summary: missingFile
        ? `Programmet prøver å åpne «${missingFile}», men denne filen er ikke lagt til med nøyaktig samme navn.`
        : "Programmet prøver å åpne en fil som ikke finnes i Python-miljøet ennå.",
      lineNumber,
      codeLine,
      questions: [
        "Vises filen i Datafiler-feltet over editoren?",
        "Er filnavnet i open skrevet helt likt, også punktum, mellomrom og store bokstaver?",
        "Har du valgt riktig .txt- eller .csv-fil etter at siden ble lastet på nytt?",
      ],
      hint: missingFile
        ? `Legg til filen, og sammenlign navnet ved editoren med «${missingFile}» tegn for tegn. Filen sendes ikke til en server.`
        : "Trykk «Legg til .txt eller .csv», og bruk filnavnet som vises ved editoren i open eller read_csv.",
      technical,
    };
  }

  if (/KeyError/.test(technical)) {
    const missingKey = technical.match(/KeyError:\s*['"]([^'"]+)['"]/)?.[1];
    return {
      kind: "data",
      title: "Python finner ikke kolonnenavnet",
      summary: missingKey
        ? `Koden spør etter kolonnen «${missingKey}», men CSV-leseren finner ikke en overskrift med nøyaktig dette navnet.`
        : "Koden spør etter et navn som ikke finnes i raden eller ordboken.",
      lineNumber,
      codeLine,
      questions: [
        "Hva står det i den aller første raden i CSV-filen?",
        "Er store bokstaver, mellomrom og norske tegn skrevet helt likt i rad[...]?",
        "Ble riktig skilletegn valgt, eller ligger hele overskriftsraden i én kolonne?",
      ],
      hint: "Skriv midlertidig print(leser.fieldnames) rett etter DictReader-linjen. Da ser du navnene Python faktisk har lest, men du må selv velge riktig navn eller delimiter.",
      technical,
    };
  }

  if (/ValueError:[^\n]*could not convert string to float/i.test(technical)) {
    const badValue = technical.match(/could not convert string to float:\s*['"]([^'"]*)['"]/)?.[1];
    return {
      kind: "data",
      title: "En tekstverdi kan ikke gjøres om til tall",
      summary: badValue
        ? `float prøver å gjøre «${badValue}» om til et tall, men teksten har et tegn eller en form Python ikke forstår.`
        : "float har fått tekst som ikke kan tolkes som et tall.",
      lineNumber,
      codeLine,
      questions: [
        "Er dette en overskrift, en tom celle eller en manglende verdi?",
        "Bruker tallet desimalkomma som må erstattes med punktum?",
        "Kan du skrive ut teksten rett før float-linjen for å se hva som faktisk ble lest?",
      ],
      hint: "Undersøk verdien med print(repr(tekst)). Bruk strip for tomrom og replace(\",\", \".\") for desimalkomma, men ikke slett data uten å forstå hva raden betyr.",
      technical,
    };
  }

  if (/NameError/.test(technical)) {
    const unknownName = detail.match(/name ['\"]([^'\"]+)['\"] is not defined/)?.[1];
    return {
      kind: "name",
      title: "Python kjenner ikke igjen et navn",
      summary: unknownName
        ? `Navnet «${unknownName}» brukes ved ${lineLabel}, men Python har ikke sett en verdi eller definisjon med nøyaktig samme navn.`
        : `Et navn ved ${lineLabel} er ikke definert før det brukes.`,
      lineNumber,
      codeLine,
      questions: [
        "Er navnet skrevet helt likt hver gang, også store og små bokstaver?",
        "Blir variabelen eller funksjonen laget før denne linjen kjøres?",
        "Mangler det en import øverst i programmet?",
      ],
      hint: unknownName ? `Søk etter «${unknownName}» i koden. Sammenlign bokstav for bokstav med stedet der navnet skulle bli opprettet.` : "Finn første gang navnet brukes, og let etter en tidligere linje som gir det en verdi.",
      technical,
    };
  }

  if (/TypeError/.test(technical)) {
    return {
      kind: "type",
      title: "Verdiene passer ikke til denne handlingen",
      summary: `Programmet kom fram til ${lineLabel}, men verdiene der kan være av ulike typer – for eksempel tekst og tall.`,
      lineNumber,
      codeLine,
      questions: [
        "Hvilke verdier brukes på linjen, og er de tekst, heltall eller desimaltall?",
        "Prøver koden å legge sammen tekst og tall direkte?",
        "Kan print med komma brukes dersom målet bare er å vise verdiene?",
      ],
      hint: "Skriv eventuelt print(type(verdi)) rett før linjen for å undersøke typen. Endre deretter bare det som ikke passer til handlingen.",
      technical,
    };
  }

  return {
    kind: "runtime",
    title: "Programmet kom i gang, men stoppet underveis",
    summary: lineNumber ? `Python stoppet ved linje ${lineNumber}. Undersøk verdiene på denne linjen og linjene som førte fram til den.` : "Python stoppet under kjøring. Del problemet opp og undersøk én verdi om gangen.",
    lineNumber,
    codeLine,
    questions: [
      "Hva var den siste linjen som virket?",
      "Hvilke verdier har variablene rett før programmet stopper?",
      "Kan du legge inn en midlertidig print-linje for å undersøke dem?",
    ],
    hint: "Kjør en mindre del av programmet, eller legg inn print rett før stedet som stopper. Målet er først å finne hvilken verdi som ikke er som forventet.",
    technical,
  };
}

type PythonLibraryDefinition = {
  label: string;
  availability: "standard" | "offline" | "local";
  highlightedNames: string[];
};

type PythonImportStatus = {
  module: string;
  label: string;
  alias?: string;
  available: boolean;
  availability?: PythonLibraryDefinition["availability"];
};

const pythonLibraryCatalog: Record<string, PythonLibraryDefinition> = {
  math: { label: "math", availability: "standard", highlightedNames: ["math"] },
  statistics: { label: "statistics", availability: "standard", highlightedNames: ["statistics"] },
  fractions: { label: "fractions", availability: "standard", highlightedNames: ["fractions", "Fraction"] },
  decimal: { label: "decimal", availability: "standard", highlightedNames: ["decimal", "Decimal"] },
  random: { label: "random", availability: "standard", highlightedNames: ["random"] },
  csv: { label: "csv", availability: "standard", highlightedNames: ["csv"] },
  collections: { label: "collections", availability: "standard", highlightedNames: ["collections", "Counter"] },
  itertools: { label: "itertools", availability: "standard", highlightedNames: ["itertools"] },
  datetime: { label: "datetime", availability: "standard", highlightedNames: ["datetime", "date", "timedelta"] },
  json: { label: "json", availability: "standard", highlightedNames: ["json"] },
  re: { label: "re", availability: "standard", highlightedNames: ["re"] },
  time: { label: "time", availability: "standard", highlightedNames: ["time"] },
  pathlib: { label: "pathlib", availability: "standard", highlightedNames: ["pathlib", "Path"] },
  os: { label: "os", availability: "standard", highlightedNames: ["os"] },
  sys: { label: "sys", availability: "standard", highlightedNames: ["sys"] },
  string: { label: "string", availability: "standard", highlightedNames: ["string"] },
  textwrap: { label: "textwrap", availability: "standard", highlightedNames: ["textwrap"] },
  copy: { label: "copy", availability: "standard", highlightedNames: ["copy"] },
  functools: { label: "functools", availability: "standard", highlightedNames: ["functools"] },
  operator: { label: "operator", availability: "standard", highlightedNames: ["operator"] },
  bisect: { label: "bisect", availability: "standard", highlightedNames: ["bisect"] },
  heapq: { label: "heapq", availability: "standard", highlightedNames: ["heapq"] },
  array: { label: "array", availability: "standard", highlightedNames: ["array"] },
  enum: { label: "enum", availability: "standard", highlightedNames: ["enum"] },
  typing: { label: "typing", availability: "standard", highlightedNames: ["typing"] },
  unicodedata: { label: "unicodedata", availability: "standard", highlightedNames: ["unicodedata"] },
  numpy: { label: "NumPy", availability: "offline", highlightedNames: ["numpy", "np"] },
  pandas: { label: "pandas", availability: "offline", highlightedNames: ["pandas", "pd"] },
  matplotlib: { label: "Matplotlib", availability: "offline", highlightedNames: ["matplotlib", "pyplot", "plt"] },
  scipy: { label: "SciPy", availability: "offline", highlightedNames: ["scipy", "stats"] },
  sympy: { label: "SymPy", availability: "offline", highlightedNames: ["sympy", "sp"] },
  sklearn: { label: "scikit-learn", availability: "offline", highlightedNames: ["sklearn", "LinearRegression"] },
  PIL: { label: "Pillow", availability: "offline", highlightedNames: ["PIL", "Image", "ImageDraw"] },
  networkx: { label: "NetworkX", availability: "offline", highlightedNames: ["networkx", "nx"] },
  shapely: { label: "Shapely", availability: "offline", highlightedNames: ["shapely", "Polygon"] },
  pygame: { label: "Pygame", availability: "offline", highlightedNames: ["pygame"] },
  turtle: { label: "Turtle", availability: "local", highlightedNames: ["turtle"] },
  spill: { label: "Spill", availability: "local", highlightedNames: ["spill", "Snake"] },
};

export const pythonLibraryNames = new Set(Object.values(pythonLibraryCatalog).flatMap((library) => library.highlightedNames));

export function analyzePythonImports(source: string): PythonImportStatus[] {
  const imports: PythonImportStatus[] = [];
  const seen = new Set<string>();
  const addImport = (module: string, alias?: string) => {
    const root = module.split(".")[0];
    const definition = pythonLibraryCatalog[root];
    const key = `${module}:${alias ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    imports.push({
      module,
      alias,
      label: definition?.label ?? module,
      available: Boolean(definition),
      availability: definition?.availability,
    });
  };

  for (const line of pythonCodeOnly(source).split("\n")) {
    const code = pythonCodeOnly(line).trim();
    const fromMatch = code.match(/^from\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s+import\s+/);
    if (fromMatch) {
      addImport(fromMatch[1]);
      continue;
    }
    const importMatch = code.match(/^import\s+(.+)$/);
    if (!importMatch) continue;
    for (const part of importMatch[1].split(",")) {
      const moduleMatch = part.trim().match(/^([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)(?:\s+as\s+([A-Za-z_]\w*))?$/);
      if (moduleMatch) addImport(moduleMatch[1], moduleMatch[2]);
    }
  }
  return imports;
}
