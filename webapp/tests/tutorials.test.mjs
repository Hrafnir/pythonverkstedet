import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {pythonTutorials} from '../app/content/pythonTutorials.ts';

test('tutorialene har kjørbare steg og testtilfeller for gjett-tallet',()=>{
  assert.equal(new Set(pythonTutorials.map(t=>t.id)).size,pythonTutorials.length);
  const steps=pythonTutorials.flatMap(t=>t.steps.map(s=>({...s,id:t.id})));
  assert.ok(steps.length>=15);
  for(const s of steps) for(const field of ['title','explanation','code','check','experiment'])assert.ok(s[field].trim());
  const result=spawnSync('python3',['-c',`
import sys, json, io, contextlib, random
steps=json.load(sys.stdin)
for step in steps:
    source=step['code']
    compile(source, step['id'], 'exec')
    # Fixed secret makes the interactive branches repeatable in the test only.
    if step['id']=='gjett-tallet': source=source.replace('random.randint(1, 100)', '50')
    answers=iter(step['testInputs'])
    output=io.StringIO()
    def answer(prompt=''):
        value=next(answers)
        print(prompt+value)
        return value
    random.seed(7)
    with contextlib.redirect_stdout(output): exec(source, {'input':answer})
    text=output.getvalue()
    if step['title']=='Gjenta og tell forsøk':
        assert 'høyere' in text and 'lavere' in text and '3 forsøk' in text, text
    if step['title']=='Tål feil i svaret':
        assert '1 forsøk' in text and 'Skriv et heltall' in text, text
    if step['title']=='Bruk en liste med spørsmål': assert '2 av 3' in text, text
    if step['title']=='La brukeren velge': assert 'ikke dele på null' in text, text
print(f"{len(steps)} tutorial-steg kjørt")
`],{input:JSON.stringify(steps),encoding:'utf8',timeout:10000});
  assert.equal(result.status,0,result.stderr||result.error?.message);assert.match(result.stdout,/tutorial-steg kjørt/);
});
