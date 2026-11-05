import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculateScheme,schemeExample,schemeRows} from '../calculation-schemes.js';
import {vorwaerts,rueckwaerts,kalkulation} from '../math.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('Vollständiges Schema: Sondereinzelkosten und zwei Abzüge mit Zielpreis als Basis',()=>{
 const r=calculateScheme('vorwaerts');
 for(const [key,value]of Object.entries({materialkosten:120,fertigungskosten:230,herstellkosten:350,verwaltung:35,vertrieb:17.5,selbstkosten:427.5,gewinn:85.5,bar:513,provision:16.2,skonto:10.8,ziel:540,rabatt:60,liste:600}))near(r[key],value);
 near(r.bar+r.provision+r.skonto,r.ziel);
 near(r.ziel+r.rabatt,r.liste);
});

test('Rückwärtsrechnung kehrt vollständige Vorwärtsrechnung einschließlich SEK um',()=>{
 for(const values of [schemeExample,{...schemeExample,material:215,lohn:37,sekf:12,sekv:53,mgk:13,fgk:210,vwgk:9,vtgk:7,gewinnsatz:18,skonto:3,provision:7,rabatt:12}]){
  const forward=calculateScheme('vorwaerts',values),back=calculateScheme('rueckwaerts',{...values,liste:forward.liste});
  for(const key of Object.keys(forward))near(back[key],forward[key]);
 }
});

test('Differenzkalkulation: Gewinnbasis und Verlust werden korrekt abgebildet',()=>{
 const r=calculateScheme('differenz',{...schemeExample,liste:560});
 near(r.gewinn,51.3);near(r.gewinnprozent,12);
 const loss=calculateScheme('differenz',{...schemeExample,liste:400});
 assert.ok(loss.gewinn<0);near(loss.gewinnprozent,loss.gewinn/loss.selbstkosten*100);
});

test('Schema ohne Sonderkosten und Provision stimmt mit bisherigen Rechentrainern überein',()=>{
 const d={...schemeExample,sekf:0,sekv:0,provision:0};
 for(const [mode,calculate]of [['vorwaerts',vorwaerts],['rueckwaerts',rueckwaerts],['differenz',kalkulation]]){
  const schema=calculateScheme(mode,d),existing=calculate(d);
  // Der bisherige Vorwärtstrainer liefert bei Gewinnfeldern Zwischenwerte;
  // verglichen werden hier die tatsächlich verwendeten Kosten und Verkaufspreise.
  for(const key of ['material','materialkosten','fertigungskosten','herstellkosten','selbstkosten','bar','ziel','liste'])if(key in existing)near(schema[key],existing[key]);
  if(mode==='differenz'){near(schema.gewinn,existing.gewinn);near(schema.gewinnprozent,existing.gewinnprozent);}
 }
});

test('Jedes Schema markiert genau seine gesuchte Größe und enthält die vollständige Preisstruktur',()=>{
 for(const [mode,target]of [['vorwaerts','liste'],['rueckwaerts','material'],['differenz','gewinn']]){
  const rows=schemeRows(mode);assert.deepEqual(rows.filter(x=>x.target).map(x=>x.id),[target]);
  assert.equal(rows.length,19);assert.equal(new Set(rows.map(x=>x.id)).size,19);
  for(const row of rows)assert.ok(Number.isFinite(calculateScheme(mode)[row.id]));
 }
 assert.throws(()=>calculateScheme('vorwaerts',{...schemeExample,skonto:50,provision:50}));
});
