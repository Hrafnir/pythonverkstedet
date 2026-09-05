import { pythonCommands } from "../pythonCommands.ts";
import { libraryGuides } from "../libraryGuides.ts";
import { codeSnippets, playgroundReferences, quickTutorials } from "../content/helpContent.ts";
export type HelpExample = { id: string; title: string; code: string; environment?: "pygame" };
export type Topic = HelpExample & { kind: string; summary: string; explanation: string; steps: string[]; result?: string; notice?: string; challenge?: string; keywords: string; advanced?: boolean };
const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ø/g,"o").replace(/æ/g,"ae");
const coreLibraries = new Set(["math","statistics","random","csv","turtle","fractions","decimal","numpy","pandas","matplotlib","spill","pygame","PIL"]);
export const topics: Topic[] = [
  ...quickTutorials.map(t => ({ id:`guide:${t.id}`, title:t.title, kind:"Oppskrift", summary:t.question, explanation:t.intro, steps:t.steps, code:t.example, notice:t.notice, challenge:t.challenge, keywords:t.category })),
  ...pythonCommands.map(t => ({ id:`command:${t.id}`, title:t.title, kind:"Kommando", summary:t.summary, explanation:t.explanation, steps:[], code:t.example, result:t.result, notice:t.commonMistake, challenge:"Endre én verdi. Forutsi hva som blir annerledes før du kjører igjen.", keywords:[t.syntax,...t.keywords].join(" ") })),
  ...codeSnippets.map(t => ({ id:`snippet:${t.id}`, title:t.title, kind:"Byggekloss", summary:t.purpose, explanation:"Sett inn denne delen der den hører hjemme i programmet. Kontroller at nødvendige variabler er laget først.", steps:[], code:t.code, challenge:t.change, keywords:t.category, notice:t.id === "print" ? "Denne delen trenger variablene navn og alder. Lag dem først, eller prøv i et nytt eksempel." : undefined })),
  ...playgroundReferences.map(t => ({ id:`book:${t.id}`, title:t.title, kind:"Fordypning", summary:t.purpose, explanation:t.commands.map(c=>`${c.code}: ${c.explanation}`).join("\n"), steps:[], code:t.example, notice:t.tip, challenge:t.experiments.join(" "), keywords:t.category, advanced:t.level === "Videre" })),
  ...libraryGuides.map(t => ({ id:`library:${t.id}`, title:t.name, kind:"Bibliotek", summary:t.tagline, explanation:t.intro, steps:t.steps, code:t.example, notice:t.note, challenge:t.challenge, keywords:t.useCases.join(" "), advanced:!coreLibraries.has(t.id), environment:t.id === "pygame" ? "pygame" as const : undefined })),
];

const ignoredWords = new Set(["jeg", "vil", "kan", "hvordan", "en", "et", "med", "a", "det", "fem", "ganger"]);
export function searchHelp(query:string, kind="Alle", advanced=false) {
  const words=normalize(query).split(/\s+/).filter(w=>w&&!ignoredWords.has(w));
  return topics.filter(t=>(kind==="Alle"||t.kind===kind)&&(advanced||words.length||!t.advanced)).map(t=>{
    const hay=normalize(`${t.title} ${t.summary} ${t.explanation} ${t.keywords} ${t.code}`);
    const score=(t.kind==="Oppskrift"?8:0)-(t.advanced?3:0)+words.reduce((n,w)=>n+(normalize(t.title).includes(w)?5:0)+(normalize(t.keywords).includes(w)?3:0),0);
    return {topic:t,match:words.every(w=>hay.includes(w)),score};
  }).filter(t=>t.match).sort((a,b)=>b.score-a.score).map(t=>t.topic);
}
