// Shuffle a session copy so answer checking and review use the displayed order.
export function shuffleQuestionOptions(question,random=Math.random){
 const order=question.options.map((_,index)=>index);
 for(let i=order.length-1;i>0;i--){
  const j=Math.floor(random()*(i+1));
  [order[i],order[j]]=[order[j],order[i]];
 }
 return {...question,options:order.map(index=>question.options[index]),correct:order.indexOf(question.correct)};
}
