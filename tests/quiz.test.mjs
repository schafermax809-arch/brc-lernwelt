import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shuffleQuestionOptions} from '../quiz.js';
import {courses} from '../courses.js';
import {buildGeneralCourse} from '../general-mode.js';

test('Alle 24 Antwortreihenfolgen behalten Lösung, Erklärung und Fragezuordnung',()=>{
 for(const course of Object.values(courses))for(const question of course.quiz){
  const original=structuredClone(question),orders=new Set(),positions=new Set();
  for(let a=0;a<4;a++)for(let b=0;b<3;b++)for(let c=0;c<2;c++){
   const draws=[(a+.5)/4,(b+.5)/3,(c+.5)/2];
   const shuffled=shuffleQuestionOptions(question,()=>draws.shift());
   assert.equal(shuffled.options[shuffled.correct],question.options[question.correct]);
   assert.equal(shuffled.id,question.id);assert.equal(shuffled.explanation,question.explanation);
   assert.deepEqual([...shuffled.options].sort(),[...question.options].sort());
   orders.add(shuffled.options.join('|'));positions.add(shuffled.correct);
  }
  assert.equal(orders.size,24);assert.equal(positions.size,4);
  assert.deepEqual(question,original);
 }
});

test('Längste oder kürzeste Antwort ist in keinem Kurs eine überwiegend erfolgreiche Ratestrategie',()=>{
 for(const base of Object.values(courses))for(const course of [base,buildGeneralCourse(base)]){
  let longestGuess=0,shortestGuess=0;
  for(const q of course.quiz){
   const lengths=q.options.map(text=>text.length),max=Math.max(...lengths);
   if(lengths[q.correct]===max)longestGuess+=1/lengths.filter(n=>n===max).length;
   const min=Math.min(...lengths);
   if(lengths[q.correct]===min)shortestGuess+=1/lengths.filter(n=>n===min).length;
   assert.equal(new Set(q.options).size,4);
  }
  assert.ok(longestGuess/course.quiz.length<=.4,`${base.id}: ${(100*longestGuess/course.quiz.length).toFixed(1)} %`);
  assert.ok(shortestGuess/course.quiz.length<=.4,`${base.id}: kürzeste Antwort ${(100*shortestGuess/course.quiz.length).toFixed(1)} %`);
 }
});
