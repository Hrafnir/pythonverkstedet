export type EditorSnapshot = { text:string; start:number; end:number };
export class EditorHistory {
  entries:EditorSnapshot[];
  position=0;
  constructor(text:string){this.entries=[{text,start:0,end:0}];}
  get current(){return this.entries[this.position];}
  select(start:number,end:number){this.current.start=start;this.current.end=end;}
  record(text:string,start:number,end=start){
    if(text===this.current.text){this.select(start,end);return;}
    this.entries.splice(this.position+1);
    this.entries.push({text,start,end});
    let size=this.entries.reduce((n,s)=>n+s.text.length*2,0);
    while(this.entries.length>1&&(this.entries.length>200||size>2_000_000)){size-=this.entries.shift()!.text.length*2;}
    this.position=this.entries.length-1;
  }
  undo(){if(this.position>0)this.position--;return this.current;}
  redo(){if(this.position<this.entries.length-1)this.position++;return this.current;}
}
