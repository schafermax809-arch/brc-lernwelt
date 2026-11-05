import * as mainData from './data.js';
import {glaeserData,glaeserChecklist} from './glaeser.js';
import {exerciseTypes,makeExercise} from './exercises.js';
import {extendOrderExercise} from './extra-exercises.js';
const mainChecklist=[
 ['mk1','Aktuelle Lehrerergänzung','Drei Kennzahlen auswerten; eine berechnen','kennzahlen'],
 ['mk2','Aktuelle Lehrerergänzung','FIFO und LIFO erklären und vergleichen','fifo'],
 ['mk3','Aktuelle Lehrerergänzung','Optimale Bestellmenge nur erklären, ohne Rechnung und Grafik','bestellmenge'],
 ['mk4','Aktuelle Lehrerergänzung','Vorwärtskalkulation anwenden','vorwaerts'],
 ['mk5','Aktuelle Lehrerergänzung','Rückwärtskalkulation anwenden','rueckwaerts'],
 ['mk6','Aktuelle Lehrerergänzung','Differenzkalkulation anwenden','kalkulation'],
 ['mk7','Buchbezug','Marktsegmentierung und fünf Marktbearbeitungsstrategien, S. 65–68','marktsegmentierung'],
 ['mk8','Buchbezug','Ansoff: vier Wachstumsstrategien erklären und zuordnen, S. 71–72','produktmatrix']
].map(([id,section,label,lesson])=>({id,section,label,lesson}));
export const courses={
 main:{id:'main',label:'Mein Kurs',storageKey:'brc-lernwelt-v1',source:'Klausurvorschlag + aktuelle Lehrerergänzung',description:'Dein bisheriger Kurs mit den zusätzlichen Lehrerhinweisen. Andere Themen aus dem Vorschlag bleiben als Wiederholung erhalten.',...Object.fromEntries(['groups','lessons','cards','quiz','plan','examTasks'].map(k=>[k,mainData[k]])),checklist:mainChecklist,exerciseTypes,makeExercise},
 glaeser:{id:'glaeser',label:'Frau Gläser',storageKey:'brc-lernwelt-glaeser-v1',source:'Checkliste Frau Gläser',description:'Ein eigener Lernbereich nach der zusätzlichen Checkliste: Bestandsoptimierung, Einsatzgüter, Lagerprinzipien, Personal und Inhalte aus 12.1/12.2.',...glaeserData,checklist:glaeserChecklist,exerciseTypes:[['bestellmenge','Bestellmenge: Tabelle, Formel & Grafik'],['lagerkritisch','Kritische Lagermenge'],['deckungsbeitrag','Absoluter & relativer Deckungsbeitrag'],['breakeven','Break-even'],['vorwaerts','Zuschlagskalkulation vorwärts'],['kalkulation','Differenzkalkulation']],makeExercise:(type,variant=0)=>{const i=((variant%3)+3)%3,e=makeExercise(type,i);return type==='bestellmenge'?extendOrderExercise(e,i):e;}}
};
export function calculationTotal(course){return course.exerciseTypes.length*3;}
export function activeCalculationIds(course,ids){const types=new Set(course.exerciseTypes.map(([id])=>id));return ids.filter(id=>types.has(id.replace(/-[0-2]$/,'')));}
