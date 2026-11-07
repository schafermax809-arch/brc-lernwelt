import {test} from 'node:test';
import assert from 'node:assert/strict';
import {proposalTasks,proposalDefault,validateProposal,proposalSummary} from '../proposal.js';
import {courses} from '../courses.js';

test('Vorschlag: beide Foto-Fassungen sind getrennt und vollständig verknüpft',()=>{
 assert.doesNotMatch(JSON.stringify(proposalTasks),/arbeitszeit|gleitzeit|teilzeit|schichtarbeit|jobsharing/i);
 assert.equal(proposalTasks.length,19);
 assert.equal(proposalTasks.filter(t=>t.set==='web').length,9);
 assert.equal(proposalTasks.filter(t=>t.set==='cycle').length,10);
 assert.equal(new Set(proposalTasks.map(t=>t.id)).size,19);
 for(const t of proposalTasks){assert.ok(courses.main.lessons.some(l=>l.id===t.lesson));assert.ok(t.prompt&&t.hint&&t.solution.length&&t.checks.length&&t.source);}
 assert.equal(proposalTasks.find(t=>t.id==='c-bestellmenge').optional,true);
 assert.equal(proposalTasks.find(t=>t.id==='w-kultur').points,null);
 assert.match(proposalTasks.find(t=>t.id==='c-portfolio').material,/fehlt/);
 assert.match(proposalTasks.find(t=>t.id==='c-bedarf').material,/Zahlen fehlen/);
});

test('Entfernte Aufgaben werden beim Laden alter Antworten nicht mehr übernommen',()=>{
 const s=validateProposal({filter:'cycle',active:'c-position',tasks:{'c-position':{answer:'Alte Antwort',done:true,revealed:true},'w-forderungen':{answer:'Alte Antwort',done:true,revealed:true},'c-makebuy':{answer:'Behalten',done:true,revealed:false}}});
 assert.deepEqual(Object.keys(s.tasks),['c-makebuy']);
 assert.ok(proposalTasks.some(t=>t.id===s.active));
 assert.equal(proposalSummary(s).done,1);
});
test('Antworten, Auswahl und Selbstkontrolle bleiben über JSON-Export/Import erhalten',()=>{
 const s=proposalDefault();s.filter='cycle';s.active='c-makebuy';s.tasks['c-makebuy']={answer:'Eigenfertigung: 42.803,75 €\nBezug: 79.935 € für 2.000 Stück.',done:true,revealed:true};
 const imported=validateProposal(JSON.parse(JSON.stringify(s)));
 assert.deepEqual(imported,s);
 assert.deepEqual(proposalSummary(imported,'cycle'),{total:10,done:1,started:1});
 assert.deepEqual(proposalSummary(imported,'web'),{total:9,done:0,started:0});
});
test('Alte Fortschritte funktionieren; unbekannte Aufgaben und ungültige Werte werden verworfen',()=>{
 assert.deepEqual(validateProposal(undefined),proposalDefault());
 const s=validateProposal({filter:'unknown',active:'unknown',tasks:{unknown:{done:true},'w-analyse':{answer:123,done:'true',revealed:1}}});
 assert.equal(s.filter,'web');assert.equal(s.active,'w-analyse');
 assert.deepEqual(Object.keys(s.tasks),['w-analyse']);
 assert.deepEqual(s.tasks['w-analyse'],{answer:'',done:false,revealed:false});
});
test('Import begrenzt Antwortlängen und Fortschritt zählt keine unbekannten Aufgaben',()=>{
 const s=validateProposal({tasks:{'w-analyse':{answer:'x'.repeat(20000),done:true,revealed:false}}});
 assert.equal(s.tasks['w-analyse'].answer.length,10000);
 s.tasks.unknown={answer:'irrelevant',done:true};
 assert.deepEqual(proposalSummary(s),{total:19,done:1,started:1});
});
