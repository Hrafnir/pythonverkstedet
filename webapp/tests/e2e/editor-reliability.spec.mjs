import {test,expect} from '@playwright/test';
test('angre og gjenta virker for autofullføring, parenteser og innrykk',async({page})=>{
 await page.goto('/');const e=page.getByRole('textbox',{name:'Skriv Python-kode'});
 await e.fill('pr');await e.press('Tab');await expect(e).toHaveValue('print()');
 await e.press('ControlOrMeta+z');await expect(e).toHaveValue('pr');expect(await e.evaluate(el=>el.selectionStart)).toBe(2);
 await e.press('ControlOrMeta+Shift+z');await expect(e).toHaveValue('print()');expect(await e.evaluate(el=>el.selectionStart)).toBe(6);
 await e.press('(');await expect(e).toHaveValue('print(())');await e.press('ControlOrMeta+z');await expect(e).toHaveValue('print()');
 await e.fill('if True:');await e.press('Enter');await expect(e).toHaveValue('if True:\n    ');
 await e.press('ControlOrMeta+z');await expect(e).toHaveValue('if True:');
 await e.fill('første');await e.pressSequentially('!');
 page.once('dialog',dialog=>dialog.accept('Historikk-test'));
 await page.getByRole('button',{name:'+ Nytt prosjekt',exact:true}).click();
 await e.fill('andre');await e.pressSequentially('?');
 await page.getByRole('combobox',{name:'Åpent prosjekt'}).selectOption({index:0});
 await expect(e).toHaveValue('første!');await e.press('ControlOrMeta+z');await expect(e).toHaveValue('første');
});
test('stegvis kjøring markerer editorlinjen og skjuler markering etter redigering',async({page})=>{
 await page.goto('/');const e=page.getByRole('textbox',{name:'Skriv Python-kode'});
 await e.fill('for n in range(2):\n    print(n)');
 await page.getByText('Flere verktøy',{exact:true}).click();await page.getByRole('button',{name:'Følg stegvis',exact:true}).click();
 await expect(page.locator('.syntax-line.is-trace-line')).toHaveCount(1);
 const check=async()=>{const line=Number(await page.locator('.trace-code-line>span').textContent());await expect(page.locator('.syntax-gutter .is-trace-line')).toHaveText(String(line));};
 await check();await page.getByRole('button',{name:'Neste →',exact:true}).click();await check();
 await e.fill('print(123)');await expect(page.locator('.syntax-line.is-trace-line')).toHaveCount(0);
});
test('nettbiblioteker merkes som nedlasting, ikke garantert offline',async({page})=>{
 await page.goto('/');await page.getByRole('textbox',{name:'Skriv Python-kode'}).fill('import numpy as np');
 await expect(page.getByLabel('Biblioteker i programmet')).toContainText('lastes ned ved behov');
 await expect(page.getByLabel('Biblioteker i programmet')).not.toContainText('tilgjengelig offline');
});
test('bildeeksport bryter lange linjer og beholder slutten av koden',async({page})=>{
 await page.addInitScript(()=>{
  Object.defineProperty(navigator,'clipboard',{value:{write:async()=>{throw new Error('Test nedlasting');}}});
  window.exportedText=[];
  const fill=CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...rest){
   window.exportedText.push({text,x,y,width:this.measureText(text).width,canvasWidth:this.canvas.width/2});
   return fill.call(this,text,x,y,...rest);
  };
 });
 await page.goto('/');
 const code='tekst = "'+ 'Lang tekst '.repeat(35)+'SLUTT"';
 await page.getByRole('textbox',{name:'Skriv Python-kode'}).fill(code);
 await page.getByText('Flere verktøy',{exact:true}).click();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Bilde av kode + svar',exact:true}).click();
 expect((await download).suggestedFilename()).toMatch(/-kode\.png$/);
 const rows=await page.evaluate(()=>window.exportedText);
 const body=rows.slice(2,rows.findIndex(row=>row.text==='SVAR / RESULTAT'));
 expect(body.filter((_,i)=>i%2===0).map(row=>row.text).join('')).toBe(code);
 expect(rows.some(row=>row.text==='↳')).toBe(true);
 for(const row of body)expect(row.x+row.width).toBeLessThanOrEqual(row.canvasWidth);
});
test('feilhjelpen kan fortsatt flytte markøren til feillinjen',async({page})=>{
 await page.goto('/');
 const e=page.getByRole('textbox',{name:'Skriv Python-kode'});
 await e.fill('print("før")\nif True\n    print(1)');
 await page.getByRole('button',{name:/Kjør kode/}).click();
 await page.getByRole('button',{name:'Gå til linje 2',exact:true}).click();
 await expect(e).toBeFocused();
 expect(await e.evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd))).toBe('if True');
});
