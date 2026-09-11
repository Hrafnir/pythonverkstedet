import { useEffect, useRef, useState } from "react";
import { pythonTutorials } from "../content/pythonTutorials";
import type { HelpExample } from "../lib/helpSearch";

export default function TutorialPanel({ topic, onTopic, onTry, onExample }: {
  topic:string; onTopic:(id:string)=>void; onTry:(example:HelpExample)=>void; onExample:(example:HelpExample)=>void;
}) {
  const [,id,position] = topic.split(":");
  const tutorial = pythonTutorials.find(t=>t.id===id);
  const index = tutorial ? Math.max(0,Math.min(tutorial.steps.length-1,Math.trunc(Number(position))||0)) : 0;
  const detailRef=useRef<HTMLElement>(null);
  useEffect(()=>{if(detailRef.current)detailRef.current.scrollTop=0;},[topic]);
  const [notice,setNotice] = useState("");
  const [completed,setCompleted] = useState<string[]>(()=>{
    try { const saved:unknown=JSON.parse(localStorage.getItem("skolepython-tutorial-progress")||"[]");return Array.isArray(saved)?saved.filter((v):v is string=>typeof v==="string"):[]; } catch { return []; }
  });
  function navigate(next:string){setNotice("");onTopic(next);}
  if(!tutorial)return <div className="tutorial-library">
    <p>Bygg et lite program, ett steg om gangen. Start enkelt, prøv i kodeflaten og forklar hva som skjer.</p>
    {pythonTutorials.map(t=><button className="tutorial-card" key={t.id} onClick={()=>navigate(`tutorial:${t.id}:0`)}>
      <small>{t.steps.length} steg · ca. {t.minutes} min</small><strong>{t.title}</strong><span>{t.summary}</span><span className="tutorial-concepts">{t.concepts.join(" · ")}</span><small>{t.steps.filter((_,i)=>completed.includes(`${t.id}:${i}`)).length} av {t.steps.length} markert gjennomført →</small>
    </button>)}
  </div>;
  const step=tutorial.steps[index];
  const key=`${tutorial.id}:${index}`;
  const example={id:`tutorial:${key}`,title:`${tutorial.title} – steg ${index+1}`,code:step.code};
  function toggleCompleted(){
    const next=completed.includes(key)?completed.filter(k=>k!==key):[...completed,key];setCompleted(next);
    try {localStorage.setItem("skolepython-tutorial-progress",JSON.stringify(next));}catch{setNotice("Progresjonen er bare lagret til du lukker siden.");}
  }
  return <article ref={detailRef} className="tutorial-detail">
    <button className="back-link" onClick={()=>navigate("tutorials")}>← Alle tutorials</button>
    <h3>{tutorial.title}</h3>
    <label className="tutorial-step-picker">Steg {index+1} av {tutorial.steps.length}<select aria-label="Velg tutorial-steg" value={index} onChange={e=>navigate(`tutorial:${tutorial.id}:${e.target.value}`)}>{tutorial.steps.map((s,i)=><option key={s.title} value={i}>{i+1}. {s.title}{completed.includes(`${tutorial.id}:${i}`)?" ✓":""}</option>)}</select></label>
    <progress max={tutorial.steps.length} value={tutorial.steps.filter((_,i)=>completed.includes(`${tutorial.id}:${i}`)).length} aria-label="Steg du har markert gjennomført" />
    <h4>{step.title}</h4><p className="tutorial-explanation">{step.explanation}</p>
    <div className="button-row"><button className="primary" onClick={()=>onTry(example)}>Bruk stegets kode</button><button onClick={async()=>{try{await navigator.clipboard.writeText(step.code);setNotice("Stegets kode er kopiert.");}catch{setNotice("Kopiering ble blokkert. Marker koden over og kopier manuelt.");}}}>Kopier steget</button></div>
    <details key={key} open><summary>Kjørbar kode for dette steget</summary><pre><code>{step.code}</code></pre></details>
    <button className="back-link" onClick={()=>onExample(example)}>Åpne i nytt prosjekt ↗</button><p className="muted">Åpne i nytt prosjekt bevarer arbeidet ditt. «Bruk stegets kode» erstatter kodefeltet og kan angres. Du kan også skrive koden selv.</p>
    <section className="tutorial-check"><h4>Test og forklar</h4><p>{step.check}</p></section>
    <h4>Prøv selv</h4><p>{step.experiment}</p>
    <label className="tutorial-complete"><input type="checkbox" checked={completed.includes(key)} onChange={toggleCompleted}/> Jeg har testet og kan forklare steget</label><p className="muted">Dette er egenvurdering, ikke en automatisk godkjenning av koden.</p>
    <nav className="tutorial-navigation" aria-label="Tutorial-steg"><button disabled={index===0} onClick={()=>navigate(`tutorial:${tutorial.id}:${index-1}`)}>← Forrige</button><span>{index+1} / {tutorial.steps.length}</span>{index<tutorial.steps.length-1?<button onClick={()=>navigate(`tutorial:${tutorial.id}:${index+1}`)}>Neste →</button>:<button onClick={()=>navigate("tutorials")}>Velg neste program →</button>}</nav>
    {notice&&<p role="status">{notice}</p>}
  </article>;
}
