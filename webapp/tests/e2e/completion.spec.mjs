import {test,expect} from '@playwright/test';

test('forslag vises ved markøren, velges med tastatur og bevarer kode',async({page})=>{
  await page.goto('/');
  const editor=page.getByRole('textbox',{name:'Skriv Python-kode'});
  await editor.fill('pr');
  await expect(page.locator('.completion-ghost')).toHaveText('int');
  await expect(page.getByRole('listbox',{name:'Kodeforslag'})).toBeVisible();
  await editor.press('Tab');
  await expect(editor).toHaveValue('print()');
  expect(await editor.evaluate(e=>e.selectionStart)).toBe(6);
  await editor.pressSequentially('5');
  await editor.press(')');
  await expect(editor).toHaveValue('print(5)');
  await editor.press('Enter');
  await expect(editor).toHaveValue('print(5)\n');

  await editor.fill('import random\nrandom.ra');
  await expect(page.locator('.completion-popup').getByRole('option').first()).toContainText('randint');
  await editor.press('ArrowDown');
  await expect(page.locator('.completion-popup').getByRole('option',{selected:true})).toContainText('random');
  await editor.press('ArrowUp');
  await editor.press('Enter');
  await expect(editor).toHaveValue('import random\nrandom.randint()');
  await editor.pressSequentially('1,6');
  await expect(editor).toHaveValue('import random\nrandom.randint(1,6)');

  await editor.fill('pris = 800\npr');
  await expect(page.locator('.completion-popup').getByRole('option').first()).toContainText('pris');
  await editor.press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden();
  await editor.press('Enter');
  await expect(editor).toHaveValue('pris = 800\npr\n');

  await editor.fill('print(5)');
  await editor.press('Home');await editor.press('ArrowRight');await editor.press('ArrowRight');
  await editor.press('Control+Space');await editor.press('Tab');
  await expect(editor).toHaveValue('print(5)');
  for(const value of ['# pr','tekst = "pr',"tekst = '''\npr"]){await editor.fill(value);await expect(page.getByRole('listbox')).toBeHidden();}
});

for(const font of [15,19,28])test(`markør, kode og linjenummer har samme metrikk ved ${font}px og rulling`,async({page})=>{
  await page.addInitScript(size=>localStorage.setItem('bjornsveen-editor-font-size',String(size)),font);
  await page.goto('/');
  const editor=page.getByRole('textbox',{name:'Skriv Python-kode'});
  await editor.fill(Array.from({length:80},(_,i)=>i===3?'    print(3)':`print(${i})`).join('\n'));
  const metrics=await page.evaluate(()=>{
    const input=document.querySelector('.syntax-input'),style=getComputedStyle(input),layer=document.querySelector('.syntax-layer');
    const line=document.querySelectorAll('.syntax-line'),gutter=document.querySelectorAll('.syntax-gutter span');
    return {pitch:parseFloat(style.lineHeight),font:style.fontFamily,layerFont:getComputedStyle(layer).fontFamily,codePitch:(line[70].getBoundingClientRect().top-line[0].getBoundingClientRect().top)/70,gutterPitch:(gutter[70].getBoundingClientRect().top-gutter[0].getBoundingClientRect().top)/70};
  });
  expect(metrics.codePitch).toBeCloseTo(metrics.pitch,1);expect(metrics.gutterPitch).toBeCloseTo(metrics.pitch,1);expect(metrics.layerFont).toBe(metrics.font);
  await editor.press('ControlOrMeta+End');
  await expect.poll(()=>page.evaluate(()=>{
    const input=document.querySelector('.syntax-input'),layer=document.querySelector('.syntax-layer');return Math.abs(input.scrollTop-layer.scrollTop);
  })).toBeLessThan(1);
  await editor.press('Enter');await editor.pressSequentially('pr');
  await expect(page.getByRole('listbox')).toBeInViewport();
  const placement=await page.evaluate(()=>{
    const input=document.querySelector('.syntax-input'),ghost=document.querySelector('.completion-ghost'),style=getComputedStyle(input);
    const row=input.value.slice(0,input.selectionStart).split('\n').length-1;
    return {actual:ghost.getBoundingClientRect().top,expected:input.getBoundingClientRect().top+parseFloat(style.paddingTop)+row*parseFloat(style.lineHeight)-input.scrollTop};
  });
  expect(Math.abs(placement.actual-placement.expected)).toBeLessThan(1);
});

test('feilmarkering flytter ikke teksten til høyre',async({page})=>{
  await page.goto('/');
  const editor=page.getByRole('textbox',{name:'Skriv Python-kode'});
  await editor.fill('if True\n    print(1)');
  const textX=()=>page.locator('.syntax-line').first().evaluate(e=>{const r=document.createRange();r.selectNodeContents(e.querySelector('.py-keyword'));return r.getBoundingClientRect().x;});
  const before=await textX();
  await page.getByRole('button',{name:/Kjør kode/}).click();
  await expect(page.locator('.syntax-line.is-error-line')).toBeVisible();
  expect(await textX()).toBeCloseTo(before,1);
});
