export function wrapExportLines(lines:string[],measure:(text:string)=>number,maxWidth:number){
  if(maxWidth<=0)throw new Error("Tekstflaten må ha positiv bredde");
  return lines.flatMap((line,index)=>{
    const rows:{text:string;lineNumber:number|null}[]=[];
    let text="";
    for(const character of Array.from(line)){
      if(text&&measure(text+character)>maxWidth){rows.push({text,lineNumber:rows.length?null:index+1});text="";}
      text+=character;
    }
    rows.push({text,lineNumber:rows.length?null:index+1});
    return rows;
  });
}
