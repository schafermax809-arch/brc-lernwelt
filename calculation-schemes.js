const euro=n=>new Intl.NumberFormat('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)+' €';
const number=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:2}).format(n);
export const schemeModes=[['vorwaerts','Vorwärtskalkulation','Listenverkaufspreis ermitteln'],['rueckwaerts','Rückwärtskalkulation','Materialeinzelkosten ermitteln'],['differenz','Differenzkalkulation','Gewinn ermitteln']];
export const schemeExample={material:100,lohn:80,mgk:20,fgk:150,sekf:30,vwgk:10,vtgk:5,sekv:25,gewinnsatz:20,skonto:2,provision:3,rabatt:10,liste:600};

// In diesem Schema beziehen sich Skonto UND Provision auf den Zielverkaufspreis.
export function calculateScheme(mode,d=schemeExample){
 if(!schemeModes.some(([id])=>id===mode))throw Error('Unbekanntes Kalkulationsschema');
 if(d.skonto+d.provision>=100||d.rabatt>=100)throw Error('Abzüge müssen unter 100 % liegen');
 let material=d.material,materialkosten,fertigungskosten=d.lohn*(1+d.fgk/100)+d.sekf,herstellkosten,selbstkosten,bar,ziel,liste=d.liste;
 if(mode==='rueckwaerts'){
  ziel=liste*(1-d.rabatt/100);bar=ziel*(1-(d.skonto+d.provision)/100);
  selbstkosten=bar/(1+d.gewinnsatz/100);
  herstellkosten=(selbstkosten-d.sekv)/(1+(d.vwgk+d.vtgk)/100);
  materialkosten=herstellkosten-fertigungskosten;material=materialkosten/(1+d.mgk/100);
 }else{
  materialkosten=material*(1+d.mgk/100);herstellkosten=materialkosten+fertigungskosten;
  selbstkosten=herstellkosten*(1+(d.vwgk+d.vtgk)/100)+d.sekv;
  if(mode==='vorwaerts'){bar=selbstkosten*(1+d.gewinnsatz/100);ziel=bar/(1-(d.skonto+d.provision)/100);liste=ziel/(1-d.rabatt/100);}
  else{ziel=liste*(1-d.rabatt/100);bar=ziel*(1-(d.skonto+d.provision)/100);}
 }
 const gewinn=bar-selbstkosten;
 return {material,materialGK:material*d.mgk/100,materialkosten,lohn:d.lohn,fertigungGK:d.lohn*d.fgk/100,sekf:d.sekf,fertigungskosten,herstellkosten,verwaltung:herstellkosten*d.vwgk/100,vertrieb:herstellkosten*d.vtgk/100,sekv:d.sekv,selbstkosten,gewinn,gewinnprozent:gewinn/selbstkosten*100,bar,provision:ziel*d.provision/100,skonto:ziel*d.skonto/100,ziel,rabatt:liste*d.rabatt/100,liste};
}

export function schemeRows(mode){
 const back=mode==='rueckwaerts',diff=mode==='differenz';
 const rows=[
 ['material','Materialeinzelkosten','',back?'Materialkosten ÷ (1 + MGK-Satz / 100)':'Gegeben; Ausgangspunkt der Kostenrechnung'],
 ['materialGK','Materialgemeinkosten','+','MGK-Satz % der Materialeinzelkosten'],
 ['materialkosten','Materialkosten','=',back?'Herstellkosten − Fertigungskosten':'Materialeinzelkosten + Materialgemeinkosten'],
 ['lohn','Fertigungslöhne','','Gegeben; Basis für den FGK-Zuschlag'],
 ['fertigungGK','Fertigungsgemeinkosten','+','FGK-Satz % der Fertigungslöhne'],
 ['sekf','Sondereinzelkosten der Fertigung','+','Als Betrag gegeben; sonst 0 €'],
 ['fertigungskosten','Fertigungskosten','=','Fertigungslöhne + FGK + Sondereinzelkosten der Fertigung'],
 ['herstellkosten','Herstellkosten','=',back?'(Selbstkosten − Sondereinzelkosten Vertrieb) ÷ (1 + (VwGK-Satz + VtGK-Satz) / 100)':'Materialkosten + Fertigungskosten'],
 ['verwaltung','Verwaltungsgemeinkosten','+','VwGK-Satz % der Herstellkosten'],
 ['vertrieb','Vertriebsgemeinkosten','+','VtGK-Satz % der Herstellkosten'],
 ['sekv','Sondereinzelkosten des Vertriebs','+','Als Betrag gegeben; sonst 0 €'],
 ['selbstkosten','Selbstkosten','=',back?'Barverkaufspreis ÷ (1 + Gewinnzuschlag / 100)':'Herstellkosten + VwGK + VtGK + Sondereinzelkosten Vertrieb'],
 ['gewinn','Gewinn',diff?'=':'+',diff?'Barverkaufspreis − Selbstkosten':'Gewinnzuschlag % der Selbstkosten'],
 ['bar','Barverkaufspreis','=',back||diff?'Zielverkaufspreis × (1 − (Skonto + Provision) / 100)':'Selbstkosten + Gewinn'],
 ['provision','Vertreterprovision','+','Provision % des Zielverkaufspreises'],
 ['skonto','Kundenskonto','+','Skonto % des Zielverkaufspreises'],
 ['ziel','Zielverkaufspreis','=',back||diff?'Listenverkaufspreis × (1 − Rabatt / 100)':'Barverkaufspreis ÷ (1 − (Skonto + Provision) / 100)'],
 ['rabatt','Kundenrabatt','+','Rabatt % des Listenverkaufspreises'],
 ['liste','Listenverkaufspreis','=',back||diff?'Gegeben; hier mit der Erlösrechnung beginnen':'Zielverkaufspreis ÷ (1 − Rabatt / 100)']
 ];
 return rows.map(([id,label,sign,rule])=>({id,label,sign,rule,total:sign==='=',target:id===(back?'material':diff?'gewinn':'liste'),given:['lohn','sekf','sekv',...(back||diff?['liste']:['material'])].includes(id)}));
}

const brief={
 vorwaerts:{direction:'↓ Von oben nach unten',goal:'Gesucht: Listenverkaufspreis',intro:'Du kennst die Kosten und den gewünschten Gewinnzuschlag. Baue erst die Kosten auf und rechne dann die Kundenabzüge in den Preis ein.',steps:['Material- und Fertigungskosten getrennt berechnen; zu Herstellkosten addieren.','Verwaltung, Vertrieb und Sondereinzelkosten Vertrieb ergänzen → Selbstkosten.','Gewinn auf die Selbstkosten aufschlagen → Barverkaufspreis.','Skonto und Provision einrechnen → Zielpreis. Rabatt einrechnen → Listenpreis.']},
 rueckwaerts:{direction:'↑ Von unten nach oben',goal:'Gesucht: Materialeinzelkosten',intro:'Der Listenpreis und der gewünschte Gewinnzuschlag stehen fest. Beginne unten beim Listenverkaufspreis. Der Aufbau des Schemas bleibt gleich; die Rechenregeln zeigen dir den Rückweg.',steps:['Unten starten: Rabatt abziehen → Zielpreis; Skonto und Provision abziehen → Barpreis.','Barpreis durch (1 + Gewinnzuschlag / 100) teilen → Selbstkosten.','Sondereinzelkosten Vertrieb abziehen; durch (1 + (VwGK + VtGK) / 100) teilen → Herstellkosten.','Fertigungskosten aus Löhnen, FGK und Sondereinzelkosten Fertigung vorwärts berechnen.','Fertigungskosten von Herstellkosten abziehen → Materialkosten; durch (1 + MGK / 100) teilen → Materialeinzelkosten.']},
 differenz:{direction:'Kosten ↓ · Erlöse ↑',goal:'Gesucht: Gewinn in € und %',intro:'Rechne die Kostenseite von oben bis zu den Selbstkosten. Rechne die Erlösseite von unten bis zum Barverkaufspreis. Die Differenz ist dein Gewinn oder Verlust.',steps:['Von oben: Kosten bis zu den Selbstkosten addieren.','Von unten: Rabatt, Skonto und Provision abziehen → Barverkaufspreis.','Gewinn = Barverkaufspreis − Selbstkosten. Ein negativer Wert ist ein Verlust.','Gewinnzuschlag in % = Gewinn ÷ Selbstkosten × 100. Die Selbstkosten sind die Basis.']}
};

const percentBases={materialGK:'Materialeinzelkosten',fertigungGK:'Fertigungslöhne',verwaltung:'Herstellkosten',vertrieb:'Herstellkosten',gewinn:'Selbstkosten',provision:'Zielverkaufspreis',skonto:'Zielverkaufspreis',rabatt:'Listenverkaufspreis'};
const percentRates={materialGK:'mgk',fertigungGK:'fgk',verwaltung:'vwgk',vertrieb:'vtgk',gewinn:'gewinnsatz',provision:'provision',skonto:'skonto',rabatt:'rabatt'};

export function renderLessonCalculationOverview(root,mode){
 if(!schemeModes.some(([id])=>id===mode))throw Error('Unbekanntes Kalkulationsschema');
 let example=false,rules=false;
 const b=brief[mode],d={...schemeExample,liste:mode==='differenz'?560:600},r=calculateScheme(mode,d);
 const draw=()=>{
  root.innerHTML=`<section class="lesson-scheme scheme-sheet ${rules?'scheme-with-rules':''}" aria-labelledby="lesson-scheme-title"><header class="scheme-sheet-head"><span class="eyebrow acid">DEINE KALKULATIONSÜBERSICHT</span><h2 id="lesson-scheme-title">Das Schema auf einen Blick.</h2><p>${b.goal} · Alle Preise netto.</p><div class="scheme-direction">${b.direction}</div></header>
  <div class="scheme-controls"><label><input type="checkbox" id="lesson-scheme-rules" ${rules?'checked':''}> Rechenregeln zeigen</label><label><input type="checkbox" id="lesson-scheme-example" ${example?'checked':''}> Zahlenbeispiel einblenden</label></div>
  <table class="scheme-table"><caption>${schemeModes.find(([id])=>id===mode)[1]} · Zuschläge immer von ihrer angegebenen Basis berechnen</caption><thead><tr><th scope="col"><span class="sr-only">Rechenzeichen</span></th><th scope="col">Kosten- und Preisaufbau</th>${example?'<th scope="col">Beispiel</th>':''}</tr></thead><tbody>${schemeRows(mode).map(row=>`<tr class="${row.total?'scheme-total ':''}${row.target?'scheme-target ':''}${['lohn','herstellkosten','selbstkosten','bar','ziel','liste'].includes(row.id)?'scheme-block':''}"><td class="scheme-sign" aria-hidden="true">${row.sign}</td><th scope="row"><span>${row.label}${row.target?'<b class="scheme-goal">GESUCHT</b>':''}</span>${percentBases[row.id]&&!(mode==='differenz'&&row.id==='gewinn')?`<span class="lesson-scheme-base">${example?number(d[percentRates[row.id]])+' % · ':''}Basis: ${percentBases[row.id]} (100 %)</span>`:''}<small>${row.rule}</small></th>${example?`<td class="scheme-value">${euro(r[row.id])}</td>`:''}</tr>`).join('')}</tbody></table>
  ${mode==='differenz'?`<div class="scheme-profit"><strong>Gewinn = Barverkaufspreis − Selbstkosten</strong><span>Gewinnzuschlag = Gewinn ÷ Selbstkosten × 100${example?` = ${number(r.gewinnprozent)} %`:''}</span></div>`:''}
  <p class="scheme-legend">${mode==='vorwaerts'?'Skonto und Provision vom Zielpreis, Rabatt vom Listenpreis berechnen. Beim Hochrechnen teilst du durch den verbleibenden Prozentsatz.':mode==='rueckwaerts'?'Unten beim Listenpreis beginnen. Rabatt, Skonto und Provision abziehen; Gewinn- und Gemeinkostenzuschläge durch Division zurückrechnen. Die „+“-Zeichen zeigen den Preisaufbau, nicht den Rückweg.':'Kosten von oben bis zu den Selbstkosten rechnen; Erlöse von unten bis zum Barverkaufspreis. Der Abstand zwischen beiden ist Gewinn oder Verlust.'}</p>
  <details class="lesson-scheme-details"><summary>Reihenfolge & wichtige Hinweise</summary><ol>${b.steps.map(step=>`<li>${step}</li>`).join('')}</ol><p>Sondereinzelkosten nur berücksichtigen, wenn sie anfallen. Hier beziehen sich Skonto und Provision beide auf den Zielverkaufspreis. Bei einer anderen ausdrücklich angegebenen Provisionsbasis gilt die Aufgabenstellung.</p>${example?`<p>Eigenes Lernbeispiel: ${mode==='rueckwaerts'?'Listenpreis 600,00 €':`Materialeinzelkosten 100,00 €${mode==='differenz'?', Listenpreis 560,00 €':''}`}; Löhne 80,00 €, Sondereinzelkosten Fertigung 30,00 €, Sondereinzelkosten Vertrieb 25,00 €. Zuschlagssätze stehen an den jeweiligen Zeilen. Intern ohne Zwischenrundung gerechnet, Anzeige auf zwei Nachkommastellen.</p>`:''}</details><a class="text-link lesson-scheme-link" href="#schemes/${mode}">Schema groß öffnen & selbst abfragen ↗</a></section>`;
  for(const [name,set]of [['rules',value=>rules=value],['example',value=>example=value]])root.querySelector('#lesson-scheme-'+name).onchange=e=>{set(e.target.checked);draw();root.querySelector('#lesson-scheme-'+name).focus({preventScroll:true});};
 };
 draw();
}

export function renderCalculationSchemes(root,requested,availableTypes=['vorwaerts','rueckwaerts','kalkulation']){
 const mode=schemeModes.some(([id])=>id===requested)?requested:'vorwaerts';
 let example=false,practice=false,rules=false;
 const d={...schemeExample,liste:mode==='differenz'?560:600},r=calculateScheme(mode,d),b=brief[mode],rows=schemeRows(mode);
 const draw=()=>{
 root.innerHTML=`<div class="page-heading"><div><h1>Kalkulation.<br><span class="acid">Zeile für Zeile.</span></h1><p>Drei übersichtliche Schemata mit Prozentbasen und Rechenrichtung. Alle Preise sind netto.</p></div><button class="btn secondary scheme-print" id="scheme-print">Schema drucken</button></div>
 <div class="scheme-tabs" role="group" aria-label="Kalkulationsschema auswählen">${schemeModes.map(([id,title,goal],i)=>`<a href="#schemes/${id}" ${id===mode?'aria-current="page"':''}><small>0${i+1} / ${goal}</small><strong>${title.replace('kalkulation','&shy;kalkulation')}</strong><span aria-hidden="true">${id==='vorwaerts'?'↓':id==='rueckwaerts'?'↑':'↕'}</span></a>`).join('')}</div>
 <div class="scheme-workspace"><article class="scheme-sheet ${rules?'scheme-with-rules':''}"><header class="scheme-sheet-head"><div><span class="eyebrow">${b.goal}</span><h2>${schemeModes.find(([id])=>id===mode)[1]}</h2><p>${b.intro}</p></div><div class="scheme-direction">${b.direction}</div></header>
 <div class="scheme-controls"><label><input type="checkbox" id="scheme-rules" ${rules?'checked':''}> Rechenregeln zeigen</label><label><input type="checkbox" id="scheme-example" ${example?'checked':''}> Zahlenbeispiel einblenden</label>${example?`<label><input type="checkbox" id="scheme-practice" ${practice?'checked':''}> Ergebnisse selbst abrufen</label>`:''}</div>
 ${example?`<details class="scheme-givens"><summary>Gegebene Werte im eigenen Beispiel</summary><p>${mode==='rueckwaerts'?'Listenpreis: 600,00 €':`Materialeinzelkosten: 100,00 €${mode==='differenz'?' · Listenpreis: 560,00 €':''}`} · Löhne: 80,00 € · MGK: 20 % · FGK: 150 % · Sondereinzelkosten Fertigung: 30,00 € · VwGK: 10 % · VtGK: 5 % · Sondereinzelkosten Vertrieb: 25,00 €${mode!=='differenz'?' · Gewinnzuschlag: 20 %':''} · Skonto: 2 % · Provision: 3 % · Rabatt: 10 %.</p><p>Intern ohne Zwischenrundung gerechnet. Angezeigte Beträge sind auf zwei Nachkommastellen gerundet.</p></details>`:''}
 <table class="scheme-table"><caption>Schema des Kosten- und Preisaufbaus · ${b.direction}</caption><thead><tr><th scope="col"><span class="sr-only">Rechenzeichen</span></th><th scope="col">Position & Rechenregel</th>${example?'<th scope="col">Betrag</th>':''}</tr></thead><tbody>${rows.map(row=>`<tr class="${row.total?'scheme-total ':''}${row.target?'scheme-target ':''}${['lohn','herstellkosten','selbstkosten','bar','ziel','liste'].includes(row.id)?'scheme-block':''}"><td class="scheme-sign" aria-hidden="true">${row.sign}</td><th scope="row"><span>${row.label}${row.target?'<b class="scheme-goal">GESUCHT</b>':''}</span><small>${row.rule}</small></th>${example?`<td class="scheme-value">${practice&&!row.given?`<button type="button" class="scheme-reveal" data-value="${row.id}" aria-label="${row.label}: Wert anzeigen">Aufdecken</button>`:euro(r[row.id])}</td>`:''}</tr>`).join('')}</tbody></table>
 ${mode==='differenz'?`<div class="scheme-profit"><strong>Gewinnzuschlag in %</strong><span>Gewinn ÷ Selbstkosten × 100${example&&!practice?` = ${number(r.gewinnprozent)} %`:''}</span>${example&&practice?`<button class="scheme-reveal" data-value="gewinnprozent" aria-label="Gewinnzuschlag: Wert anzeigen">Aufdecken</button>`:''}</div>`:''}
 <p class="scheme-legend">„+“ und „=“ zeigen den Aufbau des Preises. Beim Rückwärtsrechnen gelten die Rechenregeln in den Zeilen. Sondereinzelkosten nur berücksichtigen, wenn sie anfallen.</p></article>
 <aside class="scheme-notes"><section class="panel"><span class="eyebrow acid">DEIN RECHENWEG</span><h2>So gehst du vor.</h2><ol>${b.steps.map(t=>`<li>${t}</li>`).join('')}</ol></section><section class="panel"><span class="eyebrow acid">DIE 100-%-BASIS</span><h2>Darauf kommt’s an.</h2><dl><dt>Materialgemeinkosten</dt><dd>Materialeinzelkosten = 100 %</dd><dt>Fertigungsgemeinkosten</dt><dd>Fertigungslöhne = 100 %</dd><dt>Verwaltung & Vertrieb</dt><dd>Herstellkosten = 100 %</dd><dt>Gewinnzuschlag</dt><dd>Selbstkosten = 100 %</dd><dt>Skonto & Provision</dt><dd>Zielverkaufspreis = 100 %</dd><dt>Kundenrabatt</dt><dd>Listenverkaufspreis = 100 %</dd></dl></section>
 <div class="callout warning"><strong>Provision: Aufgabenstellung prüfen</strong>Hier beziehen sich Provision und Skonto beide auf den Zielverkaufspreis. Deshalb: ZVP = BVP ÷ (1 − (Skonto + Provision) / 100). Ohne Provision setzt du 0 % ein.<br><br>Bezieht sich die Provision ausdrücklich auf den Preis nach Skonto, gilt stattdessen: ZVP = BVP ÷ ((1 − Skonto / 100) × (1 − Provision / 100)). Die Prozentbasis entscheidet.</div>
 <a class="btn secondary" href="#calc${availableTypes.includes(mode==='differenz'?'kalkulation':mode)?'/'+(mode==='differenz'?'kalkulation':mode):''}">Im Rechentrainer anwenden ↗</a><p class="notice">Schemata nach deiner hochgeladenen Lernvorlage in eigener Darstellung. Im Rechentrainer gelten jeweils die dort angegebenen Werte und Kostenarten.</p></aside></div>`;
 root.querySelector('#scheme-rules').onchange=e=>{rules=e.target.checked;draw();root.querySelector('#scheme-rules').focus({preventScroll:true});};
root.querySelector('#scheme-example').onchange=e=>{example=e.target.checked;practice=false;draw();root.querySelector('#scheme-example').focus({preventScroll:true});};
 if(example)root.querySelector('#scheme-practice').onchange=e=>{practice=e.target.checked;draw();root.querySelector('#scheme-practice').focus({preventScroll:true});};
 root.querySelectorAll('[data-value]').forEach(button=>button.onclick=()=>{button.replaceWith(button.dataset.value==='gewinnprozent'?number(r.gewinnprozent)+' %':euro(r[button.dataset.value]));});
 root.querySelector('#scheme-print').onclick=()=>window.print();
 };
 draw();
}
