export type ExampleFile = {name:string;content:string;size:number};
export const exampleDataFiles: Record<'txt'|'csv',ExampleFile> = {
  txt:{name:'temperaturer.txt',content:'12\n14\n11\n15\n13\n',size:15},
  csv:{name:'maalinger.csv',content:'dag;temperatur\nmandag;12\ntirsdag;14\nonsdag;11\ntorsdag;15\nfredag;13\n',size:76},
};
export function exampleFiles(source:string):ExampleFile[] {
  const names=[...source.matchAll(/["']([^"'\n/]+\.(?:csv|txt))["']/g)].map(m=>m[1]);
  return [...new Set(names)].map(name=>{
    const known=Object.values(exampleDataFiles).find(f=>f.name===name);
    if(known)return known;
    const content=name.endsWith('.csv')?'navn;poeng;verdi;dag;temperatur\nAda;8;12;mandag;12\nBo;12;14;tirsdag;14\nCeline;10;13;onsdag;13\n':/navn|tekst/.test(name)?'Ada\nBo\nCeline\n':'12\n14\n11\n15\n13\n';
    return {name,content,size:new TextEncoder().encode(content).length};
  });
}
export function completeExample(id:string,code:string) {
  return id==='snippet:print'?'navn = "Ada"\nalder = 15\n'+code:code;
}
