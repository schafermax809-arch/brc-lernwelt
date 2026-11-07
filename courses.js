import * as mainData from './data.js?v=20261107-personal';
import {glaeserData,glaeserChecklist} from './glaeser.js?v=20261107-personal';
import {exerciseTypes,makeExercise} from './exercises.js?v=20261107-learning';
import {extendOrderExercise} from './extra-exercises.js?v=20261107-learning';
const mainChecklist=[
 ['mk1','Aktuelle Lehrerergänzung','Drei Kennzahlen auswerten; eine berechnen','kennzahlen'],
 ['mk2','Aktuelle Lehrerergänzung','FIFO und LIFO erklären und vergleichen','fifo'],
 ['mk3','Aktuelle Lehrerergänzung','Optimale Bestellmenge nur erklären, ohne Rechnung und Grafik','bestellmenge'],
 ['mk4','Aktuelle Lehrerergänzung','Vorwärtskalkulation anwenden','vorwaerts'],
 ['mk5','Aktuelle Lehrerergänzung','Rückwärtskalkulation anwenden','rueckwaerts'],
 ['mk6','Aktuelle Lehrerergänzung','Differenzkalkulation anwenden','kalkulation'],
 ['mk7','Buchbezug','Marktsegmentierung und fünf Marktbearbeitungsstrategien, S. 65–68','marktsegmentierung'],
 ['mk8','Buchbezug','Ansoff: vier Wachstumsstrategien erklären und zuordnen, S. 71–72','produktmatrix']
].map(([id,section,label,lesson])=>({id,section,label,lesson,scope:'focus'}));
function completeChecklist(data,base){
 const present=new Set(base.map(c=>c.lesson));
 return [...base.map(c=>({...c,scope:'focus'})),...data.lessons.filter(l=>!present.has(l.id)).map(l=>({id:'review-'+l.id,section:'Weitere Wiederholung · '+data.groups.find(g=>g.id===l.group).name,label:l.title+' erklären und anwenden',lesson:l.id,scope:'review'}))];
}
export const courses={
 main:{id:'main',label:'Mein Kurs',storageKey:'brc-lernwelt-v1',source:'Klausurvorschlag + aktuelle Lehrerergänzung',description:'Dein bisheriger Kurs mit den zusätzlichen Lehrerhinweisen. Andere Themen aus dem Vorschlag bleiben als Wiederholung erhalten.',...Object.fromEntries(['groups','lessons','cards','quiz','plan','examTasks'].map(k=>[k,mainData[k]])),checklist:completeChecklist(mainData,mainChecklist),exerciseTypes,makeExercise},
 glaeser:{id:'glaeser',label:'Frau Gläser',storageKey:'brc-lernwelt-glaeser-v1',source:'Checkliste Frau Gläser',description:'Ein eigener Lernbereich nach der zusätzlichen Checkliste: Bestandsoptimierung, Einsatzgüter, Lagerprinzipien, Personal und Inhalte aus 12.1/12.2.',...glaeserData,checklist:completeChecklist(glaeserData,glaeserChecklist),exerciseTypes:[['bestellmenge','Bestellmenge: Tabelle, Formel & Grafik'],['lagerkritisch','Kritische Lagermenge'],['deckungsbeitrag','Absoluter & relativer Deckungsbeitrag'],['breakeven','Break-even'],['vorwaerts','Zuschlagskalkulation vorwärts'],['kalkulation','Differenzkalkulation']],makeExercise:(type,variant=0)=>{const i=((variant%3)+3)%3,e=makeExercise(type,i);return type==='bestellmenge'?extendOrderExercise(e,i):e;}}
};
export function calculationTotal(course){return course.exerciseTypes.length*(course.exerciseVariants||3);}
export function activeCalculationIds(course,ids){const types=new Set(course.exerciseTypes.map(([id])=>id));return ids.filter(id=>types.has(id.replace(/-[0-2]$/,''))&&Number(id.slice(-1))<(course.exerciseVariants||3));}
