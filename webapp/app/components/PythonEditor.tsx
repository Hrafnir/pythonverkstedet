import type { EditorSuggestion } from "../lib/editorHelp";
import { pythonRangePreview, pythonLineDiagnostic, startsPythonBlockWithoutColon, findPythonBlockSuggestion, suggestionsAtCursor, pythonPairedEnter, pythonPairMap, pythonClosingCharacters } from "../lib/editorHelp";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, CSSProperties, KeyboardEvent } from "react";
import { pythonCodeOnly } from "../lib/pythonSource";
import { analyzePythonImports, pythonLibraryNames } from "../lib/pythonErrors";
const pythonTokens = /(#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:False|None|True|and|as|break|class|continue|def|elif|else|for|from|if|import|in|is|not|or|pass|return|while)\b|\b(?:abs|float|int|len|max|min|print|range|round|str|sum)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;

function colorPython(source: string, importedAliases = new Set<string>()): ReactNode[] {
  return source.split(pythonTokens).map((token, index) => {
    let kind = "plain";
    if (token.startsWith("#")) kind = "comment";
    else if (token.startsWith('"') || token.startsWith("'")) kind = "string";
    else if (/^(?:False|None|True|and|as|break|class|continue|def|elif|else|for|from|if|import|in|is|not|or|pass|return|while)$/.test(token)) kind = "keyword";
    else if (/^(?:abs|float|int|len|max|min|print|range|round|str|sum)$/.test(token)) kind = "builtin";
    else if (pythonLibraryNames.has(token) || importedAliases.has(token)) kind = "library";
    else if (/^\d+(?:\.\d+)?$/.test(token)) kind = "number";
    return <span className={`py-${kind}`} key={`${index}-${token}`}>{token}</span>;
  });
}

function colorPythonLines(source: string, errorLine?: number) {
  const importedAliases = new Set(analyzePythonImports(source).flatMap((status) => status.available && status.alias ? [status.alias] : []));
  return source.split("\n").map((line, lineIndex) => {
    const leadingSpaces = line.match(/^ */)?.[0].length ?? 0;
    const indentLevels = Math.floor(leadingSpaces / 4);
    return (
      <span className={`syntax-line ${errorLine === lineIndex + 1 ? "is-error-line" : ""}`} key={`${lineIndex}-${line}`}>
        <span className="indent-guide-layer" aria-hidden="true">
          {Array.from({ length: indentLevels }, (_, level) => (
            <i key={level} style={{ left: `${(level + 1) * 4}ch` }} />
          ))}
        </span>
        {colorPython(line, importedAliases)}
      </span>
    );
  });
}

export function PythonEditor({ id, value, onChange, describedBy, fontSize, tall = false, errorLine, onSelectionChange }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  describedBy: string;
  fontSize: number;
  tall?: boolean;
  errorLine?: number;
  onSelectionChange?: (start: number, end: number, selected: string) => void;
}) {
  const escapeTabRef = useRef(false);
  const highlightRef = useRef<HTMLPreElement | null>(null);
  const gutterRef = useRef<HTMLPreElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [cursor, setCursor] = useState(0);
  const [pendingBlock, setPendingBlock] = useState<{ position: number; indent: string } | null>(null);

  useEffect(() => {
    if (cursor > value.length) setCursor(value.length);
  }, [cursor, value.length]);

  const lineStart = value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  const lineEndIndex = value.indexOf("\n", cursor);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const currentLine = value.slice(lineStart, lineEnd);
  const lineNumber = value.slice(0, cursor).split("\n").length;
  const columnNumber = cursor - lineStart + 1;
  const maskedLine = pythonCodeOnly(value).slice(lineStart, lineEnd);
  const rangePreview = pythonRangePreview(maskedLine);
  const lineDiagnostic = pythonLineDiagnostic(maskedLine);
  const importStatuses = analyzePythonImports(value);
  const suggestionData = suggestionsAtCursor(value, cursor);
  const lineCount = Math.max(1, value.split("\n").length);
  const blockSuggestion = pendingBlock
    ? { ...pendingBlock, hasFollowingNewline: false }
    : findPythonBlockSuggestion(value, cursor);

  const pendingCursor = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (pendingCursor.current === null || !inputRef.current) return;
    const next = pendingCursor.current;
    pendingCursor.current = null;
    inputRef.current.setSelectionRange(next, next);
    setCursor(next);
    onSelectionChange?.(next, next, "");
  }, [value]);
  function moveCursor(next: number) {
    pendingCursor.current = next;
    inputRef.current?.setSelectionRange(next, next);
    inputRef.current?.focus();
    setCursor(next);
    onSelectionChange?.(next, next, "");
  }

  function reportSelection(input: HTMLTextAreaElement) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    setCursor(start);
    onSelectionChange?.(start, end, input.value.slice(start, end));
  }

  function replaceSelection(start: number, end: number, replacement: string, nextCursor = start + replacement.length) {
    onChange(`${value.slice(0, start)}${replacement}${value.slice(end)}`);
    moveCursor(nextCursor);
  }

  function applyLineFix() {
    if (!lineDiagnostic || lineDiagnostic.replacement === undefined) return;
    const matchedText = lineDiagnostic.fixPattern
      ? pythonCodeOnly(currentLine).match(lineDiagnostic.fixPattern)?.[0]
      : lineDiagnostic.find;
    if (!matchedText) return;
    const localIndex = lineDiagnostic.fixPattern
      ? pythonCodeOnly(currentLine).search(lineDiagnostic.fixPattern)
      : pythonCodeOnly(currentLine).indexOf(matchedText);
    if (localIndex === -1) return;
    const start = lineStart + localIndex;
    replaceSelection(start, start + matchedText.length, lineDiagnostic.replacement, cursor + lineDiagnostic.replacement.length - matchedText.length);
  }

  function continueBlock(addColon: boolean) {
    if (!blockSuggestion) return;
    if (blockSuggestion.hasFollowingNewline) {
      if (addColon) replaceSelection(blockSuggestion.position, blockSuggestion.position, ":", cursor >= blockSuggestion.position ? cursor + 1 : cursor);
      setPendingBlock(null);
      return;
    }
    const insertion = `${addColon ? ":" : ""}\n${blockSuggestion.indent}${addColon ? "    " : ""}`;
    replaceSelection(blockSuggestion.position, blockSuggestion.position, insertion);
    setPendingBlock(null);
  }

  function acceptSuggestion(suggestion: EditorSuggestion, liveValue = value, liveCursor = cursor) {
    const match = suggestionsAtCursor(liveValue, liveCursor);
    if (!match.word) return;
    const nextCursor = match.start + suggestion.insert.length - (suggestion.cursorBack ?? 0);
    replaceSelection(match.start, liveCursor, suggestion.insert, nextCursor);
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if(event.key === "Escape") escapeTabRef.current = true;
    else if(event.key === "Tab" && escapeTabRef.current) { escapeTabRef.current = false; return; }
    else escapeTabRef.current = false;
    const input = event.currentTarget;
    const liveValue = input.value;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const replaceLiveSelection = (replacement: string, nextCursor = start + replacement.length, selectionStart = start, selectionEnd = end) => {
      onChange(`${liveValue.slice(0, selectionStart)}${replacement}${liveValue.slice(selectionEnd)}`);
      moveCursor(nextCursor);
    };

    if (event.key === "Escape" && pendingBlock) {
      event.preventDefault();
      setPendingBlock(null);
      return;
    }

    const liveSuggestions = suggestionsAtCursor(liveValue, start);
    if (event.key === "Tab" && !event.shiftKey && start === end && liveSuggestions.suggestions.length) {
      event.preventDefault();
      const suggestion = liveSuggestions.suggestions[0];
      replaceLiveSelection(
        suggestion.insert,
        liveSuggestions.start + suggestion.insert.length - (suggestion.cursorBack ?? 0),
        liveSuggestions.start,
        start,
      );
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && !event.metaKey && !event.ctrlKey && start === end) {
      event.preventDefault();
      const pairedEnter = pythonPairedEnter(liveValue, start);
      if (pairedEnter) {
        replaceLiveSelection(pairedEnter.insertion, pairedEnter.nextCursor);
        setPendingBlock(null);
        return;
      }
      const activeLineStart = liveValue.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const beforeCursor = liveValue.slice(activeLineStart, start);
      const indent = beforeCursor.match(/^\s*/)?.[0] ?? "";
      if (startsPythonBlockWithoutColon(beforeCursor)) {
        setPendingBlock({ position: start, indent });
        return;
      }
      const codeBeforeComment = pythonCodeOnly(beforeCursor).trimEnd();
      replaceLiveSelection(`\n${indent}${codeBeforeComment.endsWith(":") ? "    " : ""}`);
      setPendingBlock(null);
      return;
    }

    // På norsk Mac-tastatur skrives både { } og [ ] med Option/Alt.
    // event.key inneholder allerede det ferdige tegnet, så Alt må ikke
    // diskvalifisere et ellers gyldig åpningstegn.
    if (pythonPairMap[event.key] && !event.ctrlKey && !event.metaKey) {
      if ((event.key === "\"" || event.key === "'") && start === end && liveValue[start] === event.key) {
        event.preventDefault();
        moveCursor(start + 1);
        return;
      }
      event.preventDefault();
      const selected = liveValue.slice(start, end);
      replaceLiveSelection(`${event.key}${selected}${pythonPairMap[event.key]}`, start + 1 + selected.length);
      setPendingBlock(null);
      return;
    }
    if (pythonClosingCharacters.has(event.key) && start === end && liveValue[start] === event.key) {
      event.preventDefault();
      moveCursor(start + 1);
      return;
    }
    if (event.key === "Backspace" && start === end && start > 0 && pythonPairMap[liveValue[start - 1]] === liveValue[start]) {
      event.preventDefault();
      replaceLiveSelection("", start - 1, start - 1, start + 1);
      setPendingBlock(null);
      return;
    }

    if (event.key !== "Tab") {
      if (pendingBlock) setPendingBlock(null);
      return;
    }
    event.preventDefault();
    const selectedLineStart = liveValue.lastIndexOf("\n", Math.max(0, start - 1)) + 1;

    if (event.shiftKey) {
      const blockEnd = end > start ? end : liveValue.indexOf("\n", start) === -1 ? liveValue.length : liveValue.indexOf("\n", start);
      const block = liveValue.slice(selectedLineStart, blockEnd);
      let removedBeforeStart = 0;
      let removedTotal = 0;
      const unindented = block.replace(/^(?: {1,4}|\t)/gm, (indent, offset) => {
        if (selectedLineStart + offset < start) removedBeforeStart += indent.length;
        removedTotal += indent.length;
        return "";
      });
      onChange(`${liveValue.slice(0, selectedLineStart)}${unindented}${liveValue.slice(blockEnd)}`);
      requestAnimationFrame(() => {
        input.selectionStart = Math.max(selectedLineStart, start - removedBeforeStart);
        input.selectionEnd = Math.max(selectedLineStart, end - removedTotal);
        setCursor(input.selectionEnd);
      });
      return;
    }

    if (end > start) {
      const blockEnd = liveValue[end - 1] === "\n" ? end - 1 : end;
      const block = liveValue.slice(selectedLineStart, blockEnd);
      const indented = block.replace(/^/gm, "    ");
      const lineCount = (block.match(/^/gm) ?? []).length;
      onChange(`${liveValue.slice(0, selectedLineStart)}${indented}${liveValue.slice(blockEnd)}`);
      requestAnimationFrame(() => {
        input.selectionStart = start + 4;
        input.selectionEnd = end + lineCount * 4;
        setCursor(input.selectionEnd);
      });
      return;
    }

    onChange(`${liveValue.slice(0, start)}    ${liveValue.slice(end)}`);
    requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd = start + 4;
      setCursor(start + 4);
    });
  }
  return (
    <div className={`python-editor ${tall ? "is-tall" : ""}`} style={{ "--editor-font-size": `${fontSize}px` } as CSSProperties}>
      <div className="python-editor-surface">
        <pre className="syntax-gutter" ref={gutterRef} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, index) => (
            <span className={errorLine === index + 1 ? "is-error-line" : ""} key={index + 1}>{index + 1}</span>
          ))}
        </pre>
        <pre className="syntax-layer" ref={highlightRef} aria-hidden="true">{colorPythonLines(`${value}\n`, errorLine)}</pre>
        <textarea
          ref={inputRef}
          id={id}
          className="syntax-input"
          value={value}
          onChange={(event) => {
            pendingCursor.current = null;
            onChange(event.target.value);
            reportSelection(event.target);
            setPendingBlock(null);
          }}
          onKeyDown={handleEditorKeyDown}
          onBlur={(event) => reportSelection(event.currentTarget)}
          onSelect={(event) => reportSelection(event.currentTarget)}
          onClick={(event) => reportSelection(event.currentTarget)}
          onKeyUp={(event) => reportSelection(event.currentTarget)}
          onScroll={(event) => {
            if (!highlightRef.current) return;
            highlightRef.current.scrollTop = event.currentTarget.scrollTop;
            highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
            if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-describedby={`${describedBy} ${id}-assist`}
        />
      </div>
      {suggestionData.suggestions.length > 0 && (
        <div className="editor-suggestions" aria-label="Forslag mens du skriver">
          <span>Forslag for <code>{suggestionData.word}</code></span>
          {suggestionData.suggestions.map((suggestion) => (
            <button type="button" key={suggestion.label} onMouseDown={(event) => event.preventDefault()} onClick={() => acceptSuggestion(suggestion)}>
              <code>{suggestion.label}</code><small>{suggestion.detail}</small>
            </button>
          ))}
          <small>Trykk Tab for første forslag</small>
        </div>
      )}
      {importStatuses.length > 0 && (
        <div className="editor-library-status" aria-label="Biblioteker i programmet" aria-live="polite">
          {importStatuses.map((status) => (
            <span className={status.available ? "is-available" : "is-unknown"} key={`${status.module}-${status.alias ?? ""}`}>
              <strong aria-hidden="true">{status.available ? "✓" : "?"}</strong>
              {status.available
                ? `${status.label}${status.alias ? ` som ${status.alias}` : ""} er tilgjengelig${status.availability === "offline" || status.availability === "local" ? " offline" : ""}`
                : `${status.module} er ikke bekreftet i offline-pakken`}
            </span>
          ))}
        </div>
      )}
      <div className="editor-assist-bar" id={`${id}-assist`} aria-live="polite">
        <span className="editor-position">Linje {lineNumber}, kolonne {columnNumber}</span>
        {blockSuggestion ? (
          <span className="editor-inline-help is-warning">
            <strong>Mangler det et kolon?</strong> Denne linjen ser ut som starten på en løkke eller et kodeblokk.
            <span>
              <button type="button" onClick={() => continueBlock(true)}>Legg til : og lag innrykk</button>
              <button type="button" onClick={() => continueBlock(false)}>Ny linje uten kolon</button>
            </span>
          </span>
        ) : lineDiagnostic ? (
          <span className={`editor-inline-help is-${lineDiagnostic.kind}`}>
            <strong>{lineDiagnostic.kind === "warning" ? "Sjekk denne linjen:" : "Lite Python-tips:"}</strong> {lineDiagnostic.message}
            {lineDiagnostic.fixLabel && <button type="button" onClick={applyLineFix}>{lineDiagnostic.fixLabel}</button>}
          </span>
        ) : rangePreview ? (
          <span className="editor-inline-help is-range"><strong>Løkken teller slik:</strong> {rangePreview}</span>
        ) : (
          <span className="editor-inline-help is-quiet">Enter lager innrykk. (), [], {`{}`} og anførselstegn lukkes automatisk. Tab flytter koden fire mellomrom.</span>
        )}
      </div>
    </div>
  );
}
