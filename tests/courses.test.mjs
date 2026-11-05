import {test} from 'node:test';
import assert from 'node:assert/strict';
import {courses,calculationTotal,activeCalculationIds} from '../courses.js';
import {kennzahlen,vorwaerts,rueckwaerts,lagerkritisch,deckungsbeitrag,andler} from '../math.js';
import {createHash} from 'node:crypto';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);

test('Buchabgleich: Ansoff deckt alle vier Produkt-Markt-Kombinationen ab',()=>{
 const l=courses.main.lessons.find(l=>l.id==='produktmatrix');
 assert.deepEqual(l.matrix.map(f=>[f.product,f.market,f.name]),[
  ['vorhanden','vorhanden','Marktdurchdringung'],['vorhanden','neu','Marktentwicklung'],
  ['neu','vorhanden','Produktentwicklung'],['neu','neu','Diversifikation']
 ]);
 assert.equal(courses.main.quiz.filter(q=>q.lesson===l.id).length,6);
 for(const q of courses.main.quiz){assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length);assert.equal(new Set(q.options).size,q.options.length);}
});
test('Buchabgleich: fünf Bearbeitungsstrategien und unveränderter Gläser-Kurs',()=>{
 const l=courses.main.lessons.find(l=>l.id==='marktsegmentierung');
 assert.equal(l.strategies.length,5);
 assert.deepEqual(l.strategies.map(s=>s.scope),['Gesamtmarkt','Ein Segment oder eine Nische','Alle wichtigen Marktsegmente','Mehrere gezielt ausgewählte Segmente','Einzelner Kunde als Segment']);
 assert.match(l.sections.find(([title])=>title.includes('Soziodemografische'))[1],/demografische UND sozioökonomische/);
 assert.equal(createHash('sha256').update(JSON.stringify(courses.glaeser)).digest('hex'),'e15752ebabb3d49f96322f5479ea6f5eb60a3769ce81a9e9a49d84770b2a4370');
});
test('Hauptkurs: Kennzahlen sowie drei Kalkulationsrichtungen; Bestellmenge ohne Rechenaufgaben',()=>{
 const c=courses.main;
 for(const id of ['kennzahlen','vorwaerts','rueckwaerts','kalkulation','marktsegmentierung','produktmatrix'])assert.ok(c.lessons.some(l=>l.id===id));
 assert.ok(!c.exerciseTypes.some(([id])=>id==='bestellmenge'));
 assert.ok(!c.lessons.find(l=>l.id==='bestellmenge').formula);
 assert.match(c.lessons.find(l=>l.id==='bestellmenge').examNote,/keine Berechnung/);
 assert.equal(c.makeExercise('kennzahlen',0).answers.length,1);
 assert.match(c.lessons.find(l=>l.id==='produktmatrix').title,/Ansoff/);
});
test('Frau Gläser: alle 19 Lernziele und eigenes Bestellmengendiagramm',()=>{
 const c=courses.glaeser;assert.equal(c.checklist.length,19);
 for(const id of ['abc','lagerplatz','lagerkritisch','fuehrungsstile','deckungsbeitrag'])assert.ok(c.lessons.some(l=>l.id===id));
 assert.ok(!c.lessons.some(l=>l.id==='kennzahlen'));
 const e=c.makeExercise('bestellmenge',0);assert.equal(e.chart.kind,'bestell');assert.ok(e.answers.some(([label])=>label.includes('Theoretische')));
 assert.notEqual(c.storageKey,courses.main.storageKey);
 assert.notEqual(c.lessons.find(l=>l.id==='bestellmenge'),courses.main.lessons.find(l=>l.id==='bestellmenge'));
});
test('Beide Kurse: eindeutige Inhalte, vollständige Verknüpfungen und eigene Generalprobe',()=>{
 for(const c of Object.values(courses)){
  for(const list of [c.lessons,c.cards,c.quiz,c.examTasks,c.checklist])assert.equal(new Set(list.map(x=>x.id)).size,list.length);
  for(const item of [...c.cards,...c.quiz,...c.checklist,...c.examTasks])assert.ok(c.lessons.some(l=>l.id===item.lesson),`${c.id}: ${item.lesson}`);
  for(const [, ...ids]of c.plan)for(const id of ids)assert.ok(id==='exam'||c.lessons.some(l=>l.id===id));
  for(const [type]of c.exerciseTypes)for(let i=0;i<3;i++){const e=c.makeExercise(type,i);assert.ok(c.lessons.some(l=>l.id===e.lesson));for(const [,unit,value]of e.answers)assert.ok(Number.isFinite(value),`${c.id}/${type}/${unit}`);}
  assert.equal(c.examTasks.reduce((a,t)=>a+t.points,0),67);assert.equal(c.examTasks.reduce((a,t)=>a+t.time,0),85);
 }
});
test('Fortschrittszählung ignoriert nicht aktive Altübungen',()=>{
 assert.equal(calculationTotal(courses.main),24);assert.equal(calculationTotal(courses.glaeser),18);
 assert.deepEqual(activeCalculationIds(courses.main,['bestellmenge-0','kennzahlen-0','vorwaerts-1']),['kennzahlen-0','vorwaerts-1']);
});
test('Kennzahlen und nicht definierte Quotienten',()=>{
 assert.deepEqual(kennzahlen({eigenkapital:400,gesamtkapital:1000,liquide:60,kurzfristig:200,anlage:500}),{ekquote:40,liquiditaet:30,deckung:80});
 assert.deepEqual(kennzahlen({eigenkapital:0,gesamtkapital:0,liquide:0,kurzfristig:0,anlage:0}),{ekquote:null,liquiditaet:null,deckung:null});
});
test('Vorwärts- und Rückwärtskalkulation sind bei identischen Basen invers',()=>{
 const d={material:10,lohn:15,mgk:20,fgk:160,vwgk:5,vtgk:5,gewinnsatz:25,rabatt:10,skonto:2};
 const a=vorwaerts(d),b=rueckwaerts({...d,liste:a.liste});near(a.selbstkosten,56.1);near(a.bar,70.125);near(b.material,10);near(b.selbstkosten,a.selbstkosten);
});
test('Eigen-/Fremdlagerung: Schnittpunkt und keine Schnittstelle bei gleicher Steigung',()=>{
 const r=lagerkritisch({eigenfix:12000,fremdfix:0,eigenvariabel:2,fremdvariabel:8,menge:3000});assert.deepEqual(r,{kritisch:2000,eigen:18000,fremd:24000});
 assert.equal(lagerkritisch({eigenfix:100,fremdfix:200,eigenvariabel:2,fremdvariabel:2,menge:5}).kritisch,null);
});
test('Absoluter und relativer Deckungsbeitrag: Engpasspriorität',()=>{
 const a=deckungsbeitrag({preis:50,variabel:32,menge:100,minuten:10}),b=deckungsbeitrag({preis:70,variabel:46,menge:100,minuten:20});
 assert.deepEqual(a,{stueck:18,gesamt:1800,relativ:1.8});near(b.relativ,1.2);assert.ok(a.stueck<b.stueck&&a.relativ>b.relativ);
 near(andler({bedarf:2400,kosten:60,preis:50,satz:20}),Math.sqrt(28800));
});
