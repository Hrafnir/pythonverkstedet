import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {pythonCommands} from '../app/pythonCommands.ts';
import {quickTutorials,codeSnippets,playgroundReferences} from '../app/content/helpContent.ts';
import {libraryGuides} from '../app/libraryGuides.ts';
import {modules} from '../app/content/course.ts';
import {pygameTutorials} from '../app/pygameTutorials.ts';
import {exampleFiles,completeExample} from '../app/lib/exampleFiles.ts';
const examples=[...pythonCommands.map(t=>({id:'command:'+t.id,code:t.example})),...quickTutorials.map(t=>({id:'guide:'+t.id,code:t.example})),...codeSnippets.map(t=>({id:'snippet:'+t.id,code:t.code})),...playgroundReferences.map(t=>({id:'book:'+t.id,code:t.example})),...libraryGuides.map(t=>({id:'library:'+t.id,code:t.example})),...pygameTutorials.map(t=>({id:'pygame:'+t.id,code:t.code})),...modules.flatMap(t=>[{id:'module:'+t.id,code:t.starterCode},...t.progression.steps.map((p,i)=>({id:`module:${t.id}:${i}`,code:p.code}))])].map(t=>({...t,code:completeExample(t.id,t.code),files:exampleFiles(t.code)}));
test('alle eksempler har gyldig Python-syntaks; selvstendige standardeksempler kjører med medfølgende filer',t=>{
  if(spawnSync('python3',['--version']).status!==0){t.skip('Python 3 kreves for innholdskontrollen');return;}
  const result=spawnSync('python3',['-c',`
import ast,json,subprocess,tempfile,pathlib
items=json.load(__import__('sys').stdin)
allowed=set('math statistics random csv fractions decimal collections itertools datetime json re string textwrap copy time pathlib os sys functools operator bisect heapq array enum typing unicodedata'.split())
errors=[]; runs=0; skipped=0
for item in items:
 try: tree=compile(item['code'],item['id'],'exec',ast.PyCF_ONLY_AST|ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
 except SyntaxError as e: errors.append([item['id'],str(e)]);continue
 mods={n.names[0].name.split('.')[0] if isinstance(n,ast.Import) else (n.module or '').split('.')[0] for n in ast.walk(tree) if isinstance(n,(ast.Import,ast.ImportFrom))}
 if mods-allowed or any(isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='input' for n in ast.walk(tree)): skipped+=1;continue
 with tempfile.TemporaryDirectory() as directory:
  for f in item['files']: pathlib.Path(directory,f['name']).write_text(f['content'],encoding='utf-8')
  try:
   r=subprocess.run(['python3','-c',item['code']],cwd=directory,capture_output=True,text=True,timeout=3);runs+=1
   if r.returncode: errors.append([item['id'],r.stderr.splitlines()[-1]])
  except subprocess.TimeoutExpired: errors.append([item['id'],'timeout'])
print(json.dumps(dict(syntax=len(items),runs=runs,skipped=skipped,errors=errors)))
`],{input:JSON.stringify(examples),encoding:'utf8',timeout:90000});
  assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(result.stdout);t.diagnostic(JSON.stringify(report));assert.deepEqual(report.errors,[]);
});
