const DAY=86400000;
const validTime=x=>Number.isFinite(x)&&x>=0&&x<=Date.now()+DAY;
const dateKey=time=>{const d=new Date(time);return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;};
export function nextReview(previous,correct,now=Date.now()){
 const sameDay=previous?.lastAt&&dateKey(previous.lastAt)===dateKey(now);
 const streak=correct?Math.min(4,Math.max(1,(previous?.streak||0)+(sameDay?0:1))):0;
 return {streak,lastAt:now,due:correct?now+[1,3,7,14][streak-1]*DAY:now};
}
export function dueQuestions(course,state,now=Date.now()){
 return course.quiz.filter(q=>state.answers[q.id]&&(!state.answers[q.id].last||(state.reviews[q.id]?.due??0)<=now));
}
export function dueCards(course,state,now=Date.now()){
 return course.cards.filter(c=>state.cardReviews[c.id]?state.cardReviews[c.id].due<=now:state.known.includes(c.id));
}
export function learningDefaults(){return {calcDrafts:{},calcAttempts:{},reviews:{},cardReviews:{},readAt:{},lastCalculation:null,lastRead:null};}
export function validateLearning(raw,course){
 const s=learningDefaults(),variants=course.exerciseVariants||3;
 const types=new Set(course.exerciseTypes.map(([id])=>id)),lessonIds=new Set(course.lessons.map(l=>l.id));
 const validKey=k=>typeof k==='string'&&types.has(k.replace(/-[0-2]$/,''))&&/^[a-z]+-[0-2]$/.test(k)&&Number(k.slice(-1))<variants;
 for(const [key,d]of Object.entries(raw.calcDrafts||{}))if(validKey(key)&&d&&typeof d==='object'){
  const strings=a=>(Array.isArray(a)?a:[]).slice(0,40).map(x=>typeof x==='string'?x.slice(0,64):'');
  s.calcDrafts[key]={values:strings(d.values),work:strings(d.work),checked:d.checked===true,stepsChecked:d.stepsChecked===true,helped:d.helped===true,updated:validTime(d.updated)?d.updated:0};
 }
 for(const[key,a]of Object.entries(raw.calcAttempts||{}))if(validKey(key)&&a&&validTime(a.at)&&typeof a.last==='boolean')s.calcAttempts[key]={at:a.at,last:a.last,independent:a.independent===true&&a.last===true};
 const reviewMap=(input,items)=>Object.fromEntries(items.flatMap(({id})=>{const a=input?.[id];return a&&Number.isInteger(a.streak)&&a.streak>=0&&a.streak<=4&&validTime(a.lastAt)&&Number.isFinite(a.due)&&a.due>=a.lastAt&&a.due<=a.lastAt+15*DAY?[[id,{streak:a.streak,lastAt:a.lastAt,due:a.due}]]:[];}));
 s.reviews=reviewMap(raw.reviews,course.quiz);s.cardReviews=reviewMap(raw.cardReviews,course.cards);
 for(const[id,time]of Object.entries(raw.readAt||{}))if(lessonIds.has(id)&&validTime(time))s.readAt[id]=time;
 if(validKey(raw.lastCalculation))s.lastCalculation=raw.lastCalculation;
 if(lessonIds.has(raw.lastRead))s.lastRead=raw.lastRead;
 return s;
}
export function exerciseDraft(state,type,variant){
 return {type,variant,values:[],work:[],checked:false,stepsChecked:false,helped:false,...state.calcDrafts?.[`${type}-${variant}`]};
}
export function storeExercise(state,session,now=Date.now()){
 const key=`${session.type}-${session.variant}`;
 state.calcDrafts[key]={values:[...session.values],work:[...(session.work||[])],checked:!!session.checked,stepsChecked:!!session.stepsChecked,helped:!!session.helped,updated:now};
 state.lastCalculation=key;
}
export function lessonEvidence(course,state,id){
 const qs=course.quiz.filter(q=>q.lesson===id),correct=qs.filter(q=>state.answers[q.id]?.last).length;
 const goals=course.checklist.filter(c=>c.lesson===id);
 const calculations=Object.entries(state.calcAttempts).filter(([key,a])=>a.independent&&a.last&&(key.replace(/-[0-2]$/,'')==='bezug'?'makebuy':key.replace(/-[0-2]$/,''))===id).length;
 return {read:state.read.includes(id),assessed:goals.length>0&&goals.every(c=>state.checks.includes(c.id)),quizCorrect:correct,quizTotal:qs.length,calculations,verified:(qs.length>=2&&correct===qs.length)||calculations>0};
}
export function learningSummary(course,state){
 const evidence=course.lessons.map(l=>lessonEvidence(course,state,l.id));
 return {read:evidence.filter(e=>e.read).length,assessed:evidence.filter(e=>e.assessed).length,verified:evidence.filter(e=>e.verified).length,quizCorrect:course.quiz.filter(q=>state.answers[q.id]?.last).length,calcsIndependent:Object.values(state.calcAttempts).filter(a=>a.last&&a.independent).length};
}
export function buildDailyPlan(course,state,now=Date.now()){
 const items=[],errors=course.quiz.filter(q=>state.answers[q.id]&&!state.answers[q.id].last),due=dueQuestions(course,state,now).filter(q=>!errors.some(e=>e.id===q.id));
 const today=new Date(now);today.setHours(0,0,0,0);
 const exam=new Date(state.examDate+'T00:00:00').getTime(),days=Math.round((exam-today.getTime())/DAY),budget=days>=0&&days<=3?25:35;
 if(errors.length)items.push({id:'errors',title:`${Math.min(10,errors.length)} Quizfehler gezielt wiederholen`,reason:'Fragen, die du zuletzt falsch beantwortet hast.',href:'#quiz/errors',minutes:Math.min(10,errors.length)+2});
 const failed=Object.entries(state.calcAttempts).filter(([,a])=>!a.last).sort((a,b)=>b[1].at-a[1].at)[0];
 if(failed){const [key]=failed,type=key.replace(/-[0-2]$/,'');items.push({id:'calc-error',title:`Rechenweg nacharbeiten: ${course.exerciseTypes.find(([id])=>id===type)[1]}`,reason:'Hier gab es zuletzt einen Fehler. Nutze die Zwischenschritte.',href:'#calc/'+key,minutes:10});}
 if(due.length)items.push({id:'due',title:`${Math.min(10,due.length)} fällige Quizfragen auffrischen`,reason:'Die letzte erfolgreiche Wiederholung liegt länger zurück.',href:'#quiz/due',minutes:Math.min(10,due.length)+2});
 const cards=dueCards(course,state,now);if(cards.length)items.push({id:'cards',title:`${cards.length} fällige Karteikarten wiederholen`,reason:'Die Wiederholung richtet sich nach deinen bisherigen Einschätzungen.',href:'#cards/due',minutes:5});
 const ordered=[...course.lessons].sort((a,b)=>Number(course.checklist.some(c=>c.lesson===b.id&&c.scope==='focus'))-Number(course.checklist.some(c=>c.lesson===a.id&&c.scope==='focus')));
 const unread=ordered.find(l=>!state.read.includes(l.id));
 if(unread)items.push({id:'read',title:unread.title,reason:course.checklist.some(c=>c.lesson===unread.id&&c.scope==='focus')?'Noch ungelesen · aktueller Schwerpunkt':'Noch ungelesen · zusätzliche Wiederholung',href:'#lesson/'+unread.id,minutes:unread.minutes});
 const preferred=state.lastRead||unread?.id;
 const untested=course.quiz.find(q=>q.lesson===preferred&&!state.answers[q.id])||course.quiz.find(q=>q.lesson===unread?.id&&!state.answers[q.id])||course.quiz.find(q=>!state.answers[q.id]);
 if(untested){const quizItem={id:'quiz',title:`Wissen prüfen: ${course.lessons.find(l=>l.id===untested.lesson).title}`,reason:'Zu diesem Thema sind noch Quizfragen offen.',href:'#quiz/'+untested.lesson,minutes:5};const readIndex=items.findIndex(item=>item.id==='read');if(state.lastRead===untested.lesson&&state.read.includes(state.lastRead)&&readIndex>=0)items.splice(readIndex,0,quizItem);else items.push(quizItem);}
 const calc=course.exerciseTypes.find(([type])=>!Array.from({length:course.exerciseVariants||3},(_,i)=>state.calcAttempts[`${type}-${i}`]?.independent).some(Boolean));
 if(calc&&!failed)items.push({id:'calc',title:calc[1]+' anwenden',reason:'Noch kein selbstständig gelöster Rechenversuch gespeichert.',href:'#calc/'+calc[0],minutes:10});
 if(!items.length)items.push({id:'transfer',title:'Eine eigene Antwort ausformulieren',reason:'Deine bisherigen Übungen sind bearbeitet. Wende das Wissen in einem neuen Beispiel an.',href:'#methods/massnahmenplan',minutes:15});
 const selected=[];let minutes=0;
 for(const item of items)if(selected.length<3&&(!selected.length||minutes+item.minutes<=budget)){selected.push(item);minutes+=item.minutes;}
 return {items:selected,budget,days,minutes};
}
