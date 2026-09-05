import { useEffect, useMemo, useRef, useState } from "react";
import { topics, searchHelp } from "../lib/helpSearch";
import type { HelpExample } from "../lib/helpSearch";
export type { HelpExample } from "../lib/helpSearch";
export default function HelpPanel({ initialQuery = "", initialTopic = "", onInsert, onExample, onClose, onTopic }: {
  initialQuery?: string; initialTopic?: string; onInsert:(example:HelpExample)=>void; onExample:(example:HelpExample)=>void; onClose:()=>void; onTopic:(id:string)=>void;
}) {
  const [query,setQuery]=useState(initialQuery), [kind,setKind]=useState("Alle"), [advanced,setAdvanced]=useState(false), [selected,setSelected]=useState(initialTopic);
  const searchRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{ searchRef.current?.focus(); },[]);
  useEffect(()=>{setQuery(initialQuery);setSelected(initialTopic);},[initialQuery,initialTopic]);
  const matches=useMemo(()=>searchHelp(query,kind,advanced),[query,kind,advanced]);
  const topic=topics.find(t=>t.id===selected);
  return <aside className="help-panel" aria-label="Hjelp mens du koder">
    <header><div><small>OPPSLAG OG OPPSKRIFTER</small><h2>Hva vil du få til?</h2></div><button onClick={onClose} aria-label="Lukk hjelpen og gå til koden">Lukk ×</button></header>
    <label className="help-search">Søk i all hjelp<input ref={searchRef} type="search" value={query} onChange={e=>{setQuery(e.target.value);setSelected("");}} placeholder="Løkke, tegne graf, lese fil …" /></label>
    {!topic ? <>
      <div className="help-filters"><label>Vis<select value={kind} onChange={e=>setKind(e.target.value)}>{["Alle","Oppskrift","Kommando","Byggekloss","Bibliotek","Fordypning"].map(k=><option key={k}>{k}</option>)}</select></label><label><input type="checkbox" checked={advanced} onChange={e=>setAdvanced(e.target.checked)} /> Også videre stoff</label></div>
      <div className="help-results"><p className="muted" role="status">{matches.length} treff</p>{!matches.length && <p>Prøv ett kortere ord, for eksempel «løkke», «graf» eller «fil».</p>}{matches.map(t=><button className="help-result" key={t.id} onClick={()=>{setSelected(t.id);onTopic(t.id);}}><small>{t.kind}{t.advanced ? " · Videre" : ""}</small><strong>{t.title}</strong><span>{t.summary}</span><b aria-hidden="true">↗</b></button>)}</div>
    </> : <article className="help-detail" key={topic.id}>
      <button className="back-link" onClick={()=>{setSelected("");onTopic("");}}>← Til treffene</button><small>{topic.kind}</small><h3>{topic.title}</h3><p>{topic.summary}</p>
      <details><summary>Forklar det litt mer</summary><p className="preserve-lines">{topic.explanation}</p>{!!topic.steps.length && <ol>{topic.steps.map(step=><li key={step}>{step}</li>)}</ol>}</details>
      <h4>Prøv et eksempel</h4><pre><code>{topic.code}</code></pre>
      {topic.result && <div className="expected-result"><strong>Forventet resultat</strong><pre>{topic.result}</pre></div>}
      {!topic.result && <p className="muted">Forutsi resultatet. Grafer og tegninger vises i resultatfeltet; noen eksempler viser bare en del av et større program.</p>}
      <div className="button-row"><button className="primary" onClick={()=>onExample(topic)}>Prøv i nytt eksempel ↗</button><button onClick={()=>onInsert(topic)}>Sett inn ved markøren</button></div>
      <p className="muted">Nytt eksempel bevarer arbeidet ditt. Nødvendige eksempelfiler følger med. Innsetting beholder resten av koden og kan angres.</p>
      {topic.notice && <div className="notice"><strong>Viktig å vite</strong><p>{topic.notice}</p></div>}
      <h4>Prøv en endring</h4><p>{topic.challenge || "Endre én verdi, kjør på nytt og forklar forskjellen."}</p>
    </article>}
  </aside>;
}
