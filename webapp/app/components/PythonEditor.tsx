import type { EditorSuggestion } from "../lib/editorHelp";
import { pythonRangePreview, pythonLineDiagnostic, startsPythonBlockWithoutColon, findPythonBlockSuggestion, suggestionsAtCursor, completionEdit, pythonPairedEnter, pythonPairMap, pythonClosingCharacters } from "../lib/editorHelp";
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
  const [focused,setFocused] = useState(false);
  const [selectedCompletion,setSelectedCompletion] = useState(0);
  const [dismissed,setDismissed] = useState(false);
  const [explicitCompletion,setExplicitCompletion] = useState(false);
  const [hasSelection,setHasSelection] = useState(false);
  const [caret,setCaret] = useState({x:0,y:0,lineHeight:0,width:0,height:0});
  const composing = useRef(false);

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
  const suggestionData = suggestionsAtCursor(value, cursor, explicitCompletion);
  const completionOpen = focused && !hasSelection && !dismissed && !composing.current && suggestionData.suggestions.length > 0;
  const activeCompletion = Math.min(selectedCompletion,Math.max(0,suggestionData.suggestions.length-1));
  const suggested = suggestionData.suggestions[activeCompletion];
  const ghost = completionOpen && suggestionData.end===cursor && !value.slice(cursor).split("\n")[0].trim() ? suggested?.label.slice(suggestionData.word.length) : "";
  const menuWidth=Math.min(330,Math.max(0,caret.width-16));
  const roomBelow=caret.height-caret.y-caret.lineHeight-6;
  const menuAbove=roomBelow<Math.min(150,suggestionData.suggestions.length*32+28) && caret.y>roomBelow;
  const menuHeight=Math.min(270,Math.max(0,menuAbove?caret.y-6:roomBelow));
  const menuLeft=Math.max(8,Math.min(caret.x,caret.width-menuWidth-8));

  const lineCount = Math.max(1, value.split("\n").length);
  const blockSuggestion = pendingBlock
    ? { ...pendingBlock, hasFollowingNewline: false }
    : findPythonBlockSuggestion(value, cursor);

  function updateCaret() {
    const input=inputRef.current;
    if(!input)return;
    const style=getComputedStyle(input);
    const before=input.value.slice(0,input.selectionStart);
    const lines=before.split("\n");
    let column=0;
    const expanded=lines.at(-1)!.replace(/\t|[^\t]/gu, c=>{if(c!=="\t"){column++;return c;}const n=4-column%4;column+=n;return " ".repeat(n);});
    const context=document.createElement("canvas").getContext("2d")!;
    context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const lineHeight=parseFloat(style.lineHeight);
    setCaret({x:parseFloat(style.paddingLeft)+context.measureText(expanded).width-input.scrollLeft,y:parseFloat(style.paddingTop)+(lines.length-1)*lineHeight-input.scrollTop,lineHeight,width:input.clientWidth,height:input.clientHeight});
  }
  useLayoutEffect(()=>{updateCaret();},[value,cursor,fontSize,focused]);
  useEffect(()=>{
    const input=inputRef.current;if(!input)return;
    const resize=new ResizeObserver(updateCaret);resize.observe(input);return()=>resize.disconnect();
  },[]);
  useEffect(()=>{setSelectedCompletion(0);},[suggestionData.word,suggestionData.start]);
  useEffect(()=>{
    if(completionOpen)document.getElementById(`${id}-completion-${activeCompletion}`)?.scrollIntoView({block:"nearest"});
  },[activeCompletion,completionOpen,id]);

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
    setHasSelection(start!==end);
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
    const edit=completionEdit(liveValue,liveCursor,suggestion);
    onChange(edit.value);
    moveCursor(edit.cursor);
    setDismissed(true);setExplicitCompletion(false);setPendingBlock(null);
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

    if(composing.current || event.nativeEvent.isComposing)return;
    if(event.ctrlKey && event.code==="Space"){
      event.preventDefault();setExplicitCompletion(true);setDismissed(false);setSelectedCompletion(0);return;
    }
    if(completionOpen && !event.metaKey && !event.ctrlKey && !event.altKey){
      if(event.key==="Escape") {event.preventDefault();event.stopPropagation();setDismissed(true);setExplicitCompletion(false);return;}
      if(event.key==="ArrowDown" || event.key==="ArrowUp"){
        event.preventDefault();setSelectedCompletion((activeCompletion+(event.key==="ArrowDown"?1:-1)+suggestionData.suggestions.length)%suggestionData.suggestions.length);return;
      }
      if((event.key==="Tab"||event.key==="Enter")&&!event.shiftKey){
        event.preventDefault();acceptSuggestion(suggestionData.suggestions[activeCompletion],liveValue,start);return;
      }
    }
    if(["ArrowLeft","ArrowRight","Home","End"].includes(event.key)){setDismissed(true);setExplicitCompletion(false);}

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
            setDismissed(false);setExplicitCompletion(false);setSelectedCompletion(0);
            onChange(event.target.value);
            reportSelection(event.target);
            setPendingBlock(null);
          }}
          onKeyDown={handleEditorKeyDown}
          onFocus={()=>{setFocused(true);updateCaret();}}
          onBlur={(event) => {setFocused(false);reportSelection(event.currentTarget);}}
          onCompositionStart={()=>{composing.current=true;setDismissed(true);}}
          onCompositionEnd={()=>{composing.current=false;setDismissed(false);}}
          aria-autocomplete="both"
          aria-controls={completionOpen?`${id}-completions`:undefined}
          aria-activedescendant={completionOpen?`${id}-completion-${activeCompletion}`:undefined}
          onSelect={(event) => reportSelection(event.currentTarget)}
          onClick={(event) => reportSelection(event.currentTarget)}
          onKeyUp={(event) => reportSelection(event.currentTarget)}
          onScroll={(event) => {
            updateCaret();
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
        {ghost && caret.x>=0 && caret.y>=0 && caret.y<caret.height && <span className="completion-ghost" aria-hidden="true" style={{left:caret.x,top:caret.y,lineHeight:`${caret.lineHeight}px`}}>{ghost}</span>}
        {completionOpen && caret.y>=0 && caret.y<caret.height && menuHeight>45 && <div className="editor-suggestions completion-popup" style={{left:menuLeft,width:menuWidth,maxHeight:menuHeight,...(menuAbove?{bottom:caret.height-caret.y+4}:{top:caret.y+caret.lineHeight+4})}}>
          <div role="listbox" id={`${id}-completions`} aria-label="Kodeforslag">
            {suggestionData.suggestions.map((suggestion,index)=><button type="button" role="option" aria-selected={activeCompletion===index} id={`${id}-completion-${index}`} tabIndex={-1} key={suggestion.label} onMouseDown={event=>event.preventDefault()} onClick={()=>acceptSuggestion(suggestion)}>
              <code>{suggestion.label}</code><small>{suggestion.detail}</small>
            </button>)}
          </div>
          <small className="completion-shortcuts">↑↓ velg · Tab/Enter bruk · Esc lukk</small>
        </div>}
      </div>
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
