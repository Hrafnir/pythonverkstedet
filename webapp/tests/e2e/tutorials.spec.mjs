import {test,expect} from '@playwright/test';

test('tutorialer bevarer utkast, lar eleven velge steg og husker egenvurdering',async({page})=>{
  await page.goto('/');
  const editor=page.getByRole('textbox',{name:'Skriv Python-kode'});
  await editor.fill('print("mitt eget arbeid")');
  await page.getByRole('button',{name:'Tutorials',exact:true}).click();
  await page.getByRole('button',{name:/Gjett det hemmelige tallet/}).click();
  await expect(editor).toHaveValue('print("mitt eget arbeid")');
  await page.getByRole('button',{name:'Åpne i nytt prosjekt ↗'}).click();
  await expect(editor).toHaveValue(/randint/);
  await expect(page.getByRole('heading',{name:'Gjett det hemmelige tallet',exact:true})).toBeVisible();
  await page.getByRole('combobox',{name:'Velg tutorial-steg'}).selectOption('2');
  await expect(editor).not.toHaveValue(/while key/);
  await page.getByRole('button',{name:'Bruk stegets kode'}).click();
  await expect(editor).toHaveValue(/while key:/);
  await page.getByRole('button',{name:'Angre byttet',exact:true}).click();
  await expect(editor).not.toHaveValue(/while key/);
  await page.getByRole('checkbox',{name:'Jeg har testet og kan forklare steget'}).check();
  await page.reload();
  await expect(page.getByRole('checkbox',{name:'Jeg har testet og kan forklare steget'})).toBeChecked();
  await page.getByRole('button',{name:'← Alle tutorials'}).click();
  await expect(page.getByRole('button',{name:/Gjett det hemmelige tallet/})).toContainText('1 av 4');
  await page.getByRole('combobox',{name:'Åpent prosjekt'}).selectOption({index:0});
  await expect(editor).toHaveValue('print("mitt eget arbeid")');
});

test('synlige kopierknapper kopierer kode, resultat og input-tekst',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/');
  const editor=page.getByRole('textbox',{name:'Skriv Python-kode'});
  const code='print("Før svaret")\nsvar = input("Navn: ")\nprint("Hei", svar)';
  await editor.fill(code);
  await page.getByRole('button',{name:'Kopier kode',exact:true}).click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(code);
  await page.getByRole('button',{name:'Kjør kode',exact:true}).click();
  const answer=page.getByRole('textbox',{name:'Svaret ditt'});
  await expect(answer).toBeVisible();
  await answer.fill('Ada');
  await page.getByRole('button',{name:'Kopier svar',exact:true}).click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('Ada');
  await answer.press('Enter');
  await expect(page.locator('.console-output')).toContainText('Hei Ada');
  await page.getByRole('button',{name:'Kopier resultat',exact:true}).click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('Navn: Ada');
  await page.getByRole('button',{name:'Kopier kode + svar',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>navigator.clipboard.readText())).toContain(code);
  const both=await page.evaluate(()=>navigator.clipboard.readText());
  expect(both).toContain(code);expect(both).toContain('Hei Ada');
});


test('tutorialen kan brukes og gjenåpnes på en smal skjerm',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.getByRole('button',{name:'Tutorials',exact:true}).click();
  await page.getByRole('button',{name:/Gjett det hemmelige tallet/}).click();
  await page.getByRole('combobox',{name:'Velg tutorial-steg'}).selectOption('2');
  await page.getByRole('button',{name:'Bruk stegets kode'}).click();
  await expect(page.getByRole('textbox',{name:'Skriv Python-kode'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Kopier kode',exact:true})).toBeInViewport();
  await page.getByRole('navigation',{name:'Vis arbeidsfelt'}).getByRole('button',{name:'Hjelp',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Velg tutorial-steg'})).toHaveValue('2');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
