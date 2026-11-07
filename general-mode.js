// Anzeigeprofil mit allgemeinen Erklärungen und eigenen Übungsvarianten.
// Dies ist keine Zugriffssperre für öffentlich bereitgestellte Dateien.
export const sourceReference=/WEBRITEC|CYCLE|CASCO|Vorschlag|Klausurfoto|Fotoaufgabe|Foto|Nachschreib|Erwartungshorizont|Lehrerergänzung|Hauptkurs|Frau Gläser|\bAnlage\b|Anlagen|Deckblatt|Vorlage|Originalwerte/i;
const clean=(text,fallback='')=>typeof text==='string'&&!sourceReference.test(text)?text:fallback;
const examples={
 analyse:'Ein Betrieb hat erfahrene Fachkräfte und kurze Abstimmungswege. Beides sind interne Stärken. Neue Konkurrenz am Markt ist dagegen eine externe Entwicklung.',
 kalkulation:'Eigenes Beispiel: Selbstkosten 50 €, Barverkaufspreis 60 €. Gewinn: 10 €. Gewinnzuschlag auf die Selbstkosten: 10 / 50 × 100 = 20 %.',
 makebuy:'Ein Betrieb benötigt 500 Teile. Ein niedriger Einkaufspreis kann durch eine Mindestabnahme von 1.000 Teilen zusätzliche Kapitalbindung verursachen. Prüfe deshalb Menge, Gesamtkosten und betriebliche Folgen.',
 bestellmenge:'Ein Betrieb bestellt einen empfindlichen Rohstoff häufiger in kleinen Mengen. Mehr Bestellaufwand kann vertretbar sein, wenn dadurch weniger Ware verdirbt.',
 jit:'Ein Betrieb erhält Bauteile kurz vor dem Einsatz. Das senkt Bestände, setzt aber zuverlässige Termine und Qualität voraus.',
 sourcing:'Ein Betrieb kauft eine komplette Baugruppe statt vieler Einzelteile. Dadurch sinkt der eigene Montageaufwand, während die technische Abhängigkeit vom Modullieferanten steigen kann.',
 scm:'Ein Hersteller und sein Lieferant teilen Bedarfsprognosen. Der Lieferant kann früher planen; beide benötigen dafür verlässliche Daten und abgestimmte Abläufe.',
 personalbeschaffung:'Ein Betrieb benötigt zusätzliche Kapazität. Eine interne Versetzung hilft nur, wenn im abgebenden Bereich Spielraum besteht. Externe Einstellungen können die Gesamtzahl der Beschäftigten erhöhen.',
 mbo:'Ein Team vereinbart ein realistisches Qualitätsziel und entwickelt die Verbesserungen selbst. Klare Zuständigkeiten und regelmäßiges Feedback unterstützen die Zielerreichung.',
 kultur:'Ein Betrieb legt Wert auf offene Kommunikation. Regelmäßige Teamgespräche, transparente Zuständigkeiten und gemeinsame Lernzeiten können diese Kultur im Führungsalltag unterstützen.'
};
export function buildGeneralCourse(base){
 const lessons=base.lessons.map(l=>{
  const sections=l.sections.filter(([title,body])=>!sourceReference.test(title+' '+body));
  return {...l,cards:l.cards.filter(([q,a])=>!sourceReference.test(q+' '+a)),examNote:'',intro:clean(l.intro,'Hier lernst du die Grundlagen und ihre Anwendung in betrieblichen Situationen.'),sections:sections.length?sections:[['Grundidee','Beschreibe zunächst den Begriff und prüfe anschließend die Wirkung in einer betrieblichen Situation. Begründe dein Urteil anhand geeigneter Kriterien.']],example:examples[l.id]||clean(l.example,'Ein Unternehmen vergleicht mehrere Möglichkeiten anhand von Kosten, Qualität und organisatorischer Umsetzbarkeit. Eine gute Empfehlung erklärt auch die Grenzen der gewählten Lösung.'),pitfall:clean(l.pitfall,'Achte auf eine schlüssige Begründung und die Vorgaben der jeweiligen Übung.')};
 });
 const ids=new Set(lessons.map(l=>l.id));
 const cards=base.cards.filter(c=>!sourceReference.test(c.q+' '+c.a)).map(c=>({...c}));
 const quiz=base.quiz.filter(q=>!sourceReference.test(q.question+' '+q.options.join(' ')+' '+q.explanation)).map(q=>({...q,options:[...q.options]}));
 return {...base,label:'Allgemeines Lernen',source:'BRC · Grundlagen, Methoden und eigene Übungen',description:'Allgemeine BRC-Lerninhalte mit Erklärungen, Methoden und selbst erstellten Übungsbeispielen.',storageKey:base.storageKey+'-general',lessons,cards,quiz,exerciseVariants:2,checklist:base.checklist.filter(c=>ids.has(c.lesson)).map(c=>({...c,section:'Deine Lernziele',label:clean(c.label,lessons.find(l=>l.id===c.lesson).title)})),makeExercise:(type,variant=0)=>{const e=base.makeExercise(type,Math.abs(variant)%2+1);return {...e,source:'Eigenes Übungsbeispiel',description:clean(e.description,'Berechne die Ergebnisse anhand der angegebenen Übungswerte und halte deinen Rechenweg fest.')};}};
}
