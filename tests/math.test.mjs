import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseNumber,kalkulation,breakeven,bestellen,nettobedarf,bezug,makebuy} from '../math.js';
import {lessons,cards,quiz,examTasks,plan} from '../data.js';
import {exerciseTypes,makeExercise} from '../exercises.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('Klausurfoto: vollständige Differenzkalkulation mit getrennten Prozentbasen',()=>{
 const r=kalkulation({material:8.2,lohn:12,mgk:23,fgk:210,vwgk:6,vtgk:6,liste:90,rabatt:5,skonto:2});
 near(r.materialGK,1.886);near(r.fertigungGK,25.2);near(r.herstellkosten,47.286);near(r.selbstkosten,52.96032);near(r.bar,83.79);near(r.gewinn,30.82968);assert.equal(Math.round(r.gewinnprozent*100)/100,58.21);
});
test('Klausurfoto: alle Bestellalternativen, Vergleich mit bisheriger Bestellung',()=>{
 const rows=bestellen({bedarf:2100,preis:750,kosten:250,satz:15,mindest:50,alternativen:[10,12,15,20,25]});
 assert.deepEqual(rows.map(r=>r.gesamt),[19937.5,18468.75,17250,16531.25,16600]);
 const best=rows.reduce((a,b)=>a.gesamt<b.gesamt?a:b);assert.equal(best.n,20);near(rows[1].gesamt-best.gesamt,1937.5);
});
test('Klausurfoto: Eigenfertigung und Bezug mit verschiedenen Mengen',()=>{
 const r=makebuy({material:22000,mgk:25,lohn:4500,fgk:75,vv:21,produktion:1000,liste:95000,rabatt:15,skonto:2,transport:800,kaufmenge:2000});
 near(r.eigen,42803.75);near(r.eigenstueck,42.80375);near(r.gesamt,79935);near(r.stueck,39.9675);
});
test('Deutsches Zahlenformat einschließlich Null, negativen Werten und ungültigen Eingaben',()=>{
 for(const [input,expected] of [['1.234,50',1234.5],['1234,50',1234.5],['1234.50',1234.5],['1.000',1000],['−5',NaN],['-9.000,00',-9000],['0',0],['',NaN],['12abc',NaN],['1,2,3',NaN]]){
  if(Number.isNaN(expected))assert.ok(Number.isNaN(parseNumber(input)));else near(parseNumber(input),expected);
 }
});
test('Break-even: ganze Stücke aufrunden und nicht erreichbare Schwelle',()=>{
 const r=breakeven({fix:25000,preis:75,variabel:40,menge:1000});near(r.schwelle,25000/35);assert.equal(r.ganze,715);near(r.gewinn,10000);
 assert.equal(breakeven({fix:100,preis:10,variabel:10,menge:10}).schwelle,null);
 assert.equal(breakeven({fix:100,preis:9,variabel:10,menge:10}).schwelle,null);
});
test('Nettobedarf: Reservierungen, rechtzeitige Zugänge und Überschuss',()=>{
 assert.deepEqual(nettobedarf({produktion:600,teile:1,zusatz:30,mindest:50,reserviert:20,lager:200,bestellt:100}),{brutto:630,netto:400});
 assert.equal(nettobedarf({produktion:400,teile:1,zusatz:20,mindest:30,reserviert:10,lager:500,bestellt:0}).netto,0);
});
test('Bezug: Skonto nach Rabatt, Bezugskosten danach',()=>{const r=bezug({liste:100,rabatt:10,skonto:2,transport:5,menge:2});near(r.ziel,90);near(r.bar,88.2);near(r.gesamt,93.2);near(r.stueck,46.6);});
test('Alle Zahlenvarianten liefern endliche Lösungen und vorhandene Lernzettel',()=>{
 for(const [type] of exerciseTypes)for(let i=0;i<3;i++){const e=makeExercise(type,i);assert.ok(lessons.some(l=>l.id===e.lesson));assert.ok(e.steps.length>=3);for(const [,unit,answer]of e.answers){assert.ok(Number.isFinite(answer),`${type}-${i} ${unit}`);}}
});
test('Lernmaterialien: konsistente Verweise, eindeutige IDs und Probeklausur',()=>{
 for(const list of [lessons,cards,quiz,examTasks])assert.equal(new Set(list.map(x=>x.id)).size,list.length);
 for(const c of [...cards,...quiz])assert.ok(lessons.some(l=>l.id===c.lesson));
 for(const q of quiz){assert.equal(q.options.length,4);assert.ok(q.correct>=0&&q.correct<4);}
 assert.equal(examTasks.reduce((a,t)=>a+t.points,0),67);assert.equal(examTasks.reduce((a,t)=>a+t.time,0),85);
 for(const [, ...ids]of plan)for(const id of ids)assert.ok(id==='exam'||lessons.some(l=>l.id===id));
});
test('Probeklausur: Rechenlösungen unabhängig kontrolliert',()=>{
 const r=kalkulation({material:10,lohn:15,mgk:20,fgk:160,vwgk:5,vtgk:5,liste:100,rabatt:10,skonto:2});near(r.selbstkosten,56.1);near(r.gewinn,32.1);assert.equal(Math.round(r.gewinnprozent*100)/100,57.22);
 const b=breakeven({fix:36000,preis:80,variabel:50,menge:900});assert.equal(b.ganze,1200);assert.equal(b.gewinn,-9000);
 assert.deepEqual(bestellen({bedarf:2400,preis:50,kosten:60,satz:20,mindest:40,alternativen:[10,12,20]}).map(r=>r.gesamt),[2200,2120,2200]);
});

