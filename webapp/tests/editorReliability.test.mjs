import test from 'node:test';
import assert from 'node:assert/strict';
import {EditorHistory} from '../app/lib/editorHistory.ts';
import {wrapExportLines} from '../app/lib/imageExport.ts';
test('historikk bevarer markering, skiller filer og forkaster redo ved ny endring',()=>{
 const a=new EditorHistory('pr'),b=new EditorHistory('annen fil');
 a.select(2,2);a.record('print()',6);assert.deepEqual(a.undo(),{text:'pr',start:2,end:2});assert.equal(a.redo().start,6);
 a.undo();a.record('pris',4);assert.equal(a.redo().text,'pris');assert.equal(b.undo().text,'annen fil');
 for(let i=0;i<300;i++)a.record(String(i),0);assert.ok(a.entries.length<=200);
});
test('bildeeksport bevarer hele linjer og nummererer kun første del',()=>{
 const source=['    print("'+ 'æ🙂'.repeat(100)+'")','','siste linje'];
 const rows=wrapExportLines(source,s=>Array.from(s).length,40);
 assert.ok(rows.every(r=>Array.from(r.text).length<=40));
 const rebuilt=[];for(const row of rows){if(row.lineNumber!==null)rebuilt.push(row.text);else rebuilt[rebuilt.length-1]+=row.text;}
 assert.deepEqual(rebuilt,source);assert.deepEqual(rows.filter(r=>r.lineNumber).map(r=>r.lineNumber),[1,2,3]);
});
