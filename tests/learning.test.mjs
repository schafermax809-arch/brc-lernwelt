import {test} from 'node:test';
import assert from 'node:assert/strict';
import {courses} from '../courses.js';
import {buildGeneralCourse} from '../general-mode.js';
import {learningDefaults,validateLearning,storeExercise,exerciseDraft,nextReview,dueQuestions,dueCards,lessonEvidence,learningSummary,buildDailyPlan} from '../learning.js';
import {numericFeedback} from '../calculation-coach.js';
const DAY=86400000;
const state=()=>({...learningDefaults(),read:[],known:[],checks:[],answers:{},calculations:[],examDate:new Date().toISOString().slice(0,10)});

test('Vollständige Checklisten decken jeden Lernzettel ab und kennzeichnen Wiederholung gesondert',()=>{
 for(const c of Object.values(courses)){
  for(const l of c.lessons)assert.ok(c.checklist.some(item=>item.lesson===l.id));
  assert.ok(c.checklist.some(item=>item.scope==='review'));
  assert.ok(c.checklist.some(item=>item.scope==='focus'));
  assert.equal(new Set(c.checklist.map(item=>item.id)).size,c.checklist.length);
 }
 assert.equal(courses.main.checklist.length,22);
 assert.equal(courses.glaeser.checklist.filter(c=>c.scope==='focus').length,18);
});

test('Eingaben einschließlich 0 und Zwischenschritten bleiben über Export und Wiederladen erhalten',()=>{
 const s=state(),session={type:'kalkulation',variant:1,values:['0','123,45',''],work:['15,00'],checked:false,stepsChecked:true,helped:true};
 storeExercise(s,session);
 const loaded=validateLearning(JSON.parse(JSON.stringify(s)),courses.main);
 assert.deepEqual(exerciseDraft(loaded,'kalkulation',1).values,session.values);
 assert.deepEqual(exerciseDraft(loaded,'kalkulation',1).work,session.work);
 assert.equal(loaded.lastCalculation,'kalkulation-1');
 assert.equal(exerciseDraft(loaded,'kalkulation',0).values.length,0);
});

test('Neue Lernfelder migrieren alte Exporte und verwerfen fremde, überlange oder ungültige Daten',()=>{
 assert.deepEqual(validateLearning({},courses.main),learningDefaults());
 const now=Date.now(),raw={calcDrafts:{'bestellmenge-0':{values:['1']},'kalkulation-2':{values:['x'.repeat(200)],updated:now}},calcAttempts:{'kalkulation-0':{at:now,last:true,independent:true},'unknown-0':{at:now,last:true}},lastCalculation:'kalkulation-2',lastRead:'arbeitszeit',reviews:{[courses.main.quiz[0].id]:{streak:99,due:now,lastAt:now}}};
 const main=validateLearning(raw,courses.main);assert.equal(main.calcDrafts['kalkulation-2'].values[0].length,64);assert.equal(main.lastRead,null);assert.deepEqual(main.reviews,{});assert.equal(Object.keys(main.calcAttempts).length,1);
 const general=validateLearning(raw,buildGeneralCourse(courses.main));assert.equal(general.lastCalculation,null);assert.deepEqual(general.calcDrafts,{});
});

test('Wiederholung: Fehler sofort fällig, Erfolg mit Abstand; gleiche Tagesrunde erhöht das Intervall nicht',()=>{
 const now=Date.now(),first=nextReview(null,true,now);
 assert.equal(first.streak,1);assert.equal(first.due,now+DAY);
 const same=nextReview(first,true,now+1000);assert.equal(same.streak,1);
 const later=nextReview(first,true,now+2*DAY);assert.equal(later.streak,2);assert.equal(later.due,now+5*DAY);
 const wrong=nextReview(later,false,now+6*DAY);assert.equal(wrong.streak,0);assert.equal(wrong.due,wrong.lastAt);
 const c=courses.main,s=state(),id=c.quiz[0].id,card=c.cards[0].id;
 s.answers[id]={last:true,total:1,right:1};s.reviews[id]=first;s.known=[card];
 assert.equal(dueQuestions(c,s,now).length,0);assert.equal(dueQuestions(c,s,now+2*DAY).length,1);
 assert.equal(dueCards(c,s,now).length,1);
});

test('Lesen und Selbsteinschätzung ergeben allein keinen nachgewiesenen Übungserfolg',()=>{
 const c=courses.main,s=state(),id='kalkulation';s.read=[id];s.checks=c.checklist.filter(i=>i.lesson===id).map(i=>i.id);
 assert.equal(lessonEvidence(c,s,id).verified,false);
 s.calcAttempts['kalkulation-0']={at:Date.now(),last:true,independent:false};assert.equal(lessonEvidence(c,s,id).verified,false);
 s.calcAttempts['kalkulation-0'].independent=true;assert.equal(lessonEvidence(c,s,id).verified,true);
 assert.deepEqual(learningSummary(c,s),{read:1,assessed:1,verified:1,quizCorrect:0,calcsIndependent:1});
 const g=courses.glaeser,gs=state(),goals=g.checklist.filter(item=>item.lesson==='bestellmenge');
 gs.checks=[goals[0].id];assert.equal(lessonEvidence(g,gs,'bestellmenge').assessed,false);
 gs.checks=goals.map(item=>item.id);assert.equal(lessonEvidence(g,gs,'bestellmenge').assessed,true);
});

test('Tagesplan priorisiert offene Fehler und fehlerhafte Rechnungen innerhalb des Zeitbudgets',()=>{
 const c=courses.main,s=state(),now=Date.now();s.answers[c.quiz[0].id]={last:false,total:1,right:0};s.calcAttempts['kalkulation-1']={at:now,last:false,independent:false};
 const p=buildDailyPlan(c,s,now);assert.equal(p.items[0].href,'#quiz/errors');assert.equal(p.items[1].href,'#calc/kalkulation-1');assert.ok(p.items.length<=3);assert.ok(p.minutes<=p.budget);
 const fresh=buildDailyPlan(c,state(),now);assert.ok(fresh.items.some(i=>i.href.startsWith('#lesson/')));
 for(const item of fresh.items)assert.doesNotMatch(item.title,/arbeitszeit/i);
 const gs=state(),gp=buildDailyPlan(courses.glaeser,gs,now);assert.equal(gp.items.find(i=>i.id==='quiz').href,'#quiz/bestellmenge');
 gs.lastRead='bestellmenge';gs.read=['bestellmenge'];
 const follow=buildDailyPlan(courses.glaeser,gs,now);assert.ok(follow.items.findIndex(i=>i.id==='quiz')<follow.items.findIndex(i=>i.id==='read'));
});

test('Zwischenschritte sind für beide Kurse und alle Zahlenvarianten endlich und korrekt rückgemeldet',()=>{
 for(const c of Object.values(courses))for(const[type]of c.exerciseTypes)for(let v=0;v<3;v++){
  const e=c.makeExercise(type,v);assert.ok(Array.isArray(e.coaching));
  for(const step of e.coaching){assert.ok(Number.isFinite(step.value));assert.ok(step.rule&&step.hint);assert.equal(numericFeedback(String(Math.round(step.value*100)/100),step.value,step.unit,step.hint).ok,true);}
 }
 const example=courses.main.makeExercise('kalkulation',1);assert.equal(example.coaching.find(r=>r.id==='mk').value,15);assert.equal(example.coaching.find(r=>r.id==='hk').value,55);
});

test('Typische Prozentfehler erhalten eine konkrete Diagnose statt eines allgemeinen Fehlers',()=>{
 const e=courses.main.makeExercise('rueckwaerts',0),wrong=e.mistakes[0][0];
 const result=numericFeedback(String(wrong[0]),e.answers[0][2],'€','Allgemeiner Hinweis',e.mistakes[0]);
 assert.equal(result.ok,false);assert.match(result.message,/Selbstkosten/);assert.match(result.message,/Teile/);
 assert.equal(numericFeedback('',100,'€','Hinweis').ok,false);
 assert.equal(numericFeedback('1.234,50',1234.5,'€','Hinweis').ok,true);
});
