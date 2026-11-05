import {test} from 'node:test';
import assert from 'node:assert/strict';
import {courses,calculationTotal} from '../courses.js';
import {buildGeneralCourse,sourceReference} from '../general-mode.js';
import {methods} from '../methods.js';

test('Allgemeine Profile enthalten keine Vorlagenverweise und verändern die Lernprofile nicht',()=>{
 const before=JSON.stringify(courses);
 function check(value,path=''){if(typeof value==='string')assert.ok(!sourceReference.test(value),path+': '+value);else if(value&&typeof value==='object')for(const[k,v]of Object.entries(value))check(v,path+'.'+k);}
 for(const c of Object.values(courses)){
  const general=buildGeneralCourse(c);assert.notEqual(general.storageKey,c.storageKey);assert.equal(general.exerciseVariants,2);check(general);
  for(const[type]of general.exerciseTypes)for(let i=0;i<2;i++){const e=general.makeExercise(type,i);check(e);assert.ok(e.answers.every(a=>Number.isFinite(a[2])));assert.deepEqual(e.answers,c.makeExercise(type,i+1).answers);}
  assert.equal(calculationTotal(general),general.exerciseTypes.length*2);
 }
 assert.equal(JSON.stringify(courses),before);
});
test('Methodenseite: BRC-Auswahl und Quellenverweise entsprechen den bereitgestellten Dokumenten',()=>{
 assert.equal(methods.length,12);assert.equal(methods.filter(m=>m.primary).length,6);assert.equal(new Set(methods.map(m=>m.id)).size,12);
 for(const id of ['tischvorlage','uebersichtsmatrix','massnahmenplan','forderungskatalog','positionspapier','eroerterung'])assert.ok(methods.some(m=>m.id===id&&m.primary));
 for(const m of methods){assert.ok(m.steps.length>=4&&m.structure&&m.reader&&m.list&&m.checks.length===4);}
 assert.match(methods.find(m=>m.id==='entscheidung').example.join(' '),/3,8/);
 assert.match(methods.find(m=>m.id==='massnahmenplan').reader,/18–19/);
 assert.ok(!methods.some(m=>['planungsmatrix','wirkungskette','polaritaet','vernetzungsdiagramm'].includes(m.id)));
});
