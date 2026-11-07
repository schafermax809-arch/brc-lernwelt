import {parseNumber,round} from './math.js';
export function coaching(type,d,r){
 const rows=[];
 const add=(id,label,value,rule,hint,wrong=[])=>rows.push({id,label,unit:'€',value,rule,hint,wrong});
 if(['kalkulation','vorwaerts','makebuy'].includes(type)){
  const mk=d.material*(1+d.mgk/100),fk=d.lohn*(1+d.fgk/100),hk=mk+fk;
  add('mk','Materialkosten',mk,'Materialeinzelkosten × (1 + MGK / 100)','Der MGK-Zuschlag bezieht sich auf die Materialeinzelkosten.');
  add('fk','Fertigungskosten',fk,'Fertigungslöhne × (1 + FGK / 100)','Die Löhne sind die Basis für den FGK-Zuschlag.');
  add('hk','Herstellkosten',hk,'Materialkosten + Fertigungskosten','Addiere beide Kostenblöcke einschließlich ihrer Gemeinkosten.');
  const sk=type==='makebuy'?r.eigen:r.selbstkosten;
  add('sk','Selbstkosten'+(type==='makebuy'?' gesamt':''),sk,'Herstellkosten × (1 + Verwaltung und Vertrieb / 100)','Verwaltung und Vertrieb beziehen sich hier auf die Herstellkosten.',[[hk+(mk+fk-mk)*(d.vwgk||d.vv||0)/100,'Prüfe die Basis: Verwaltung und Vertrieb werden auf die gesamten Herstellkosten aufgeschlagen.']]);
 }
 if(type==='vorwaerts'){
  add('bar','Barverkaufspreis',r.bar,'Selbstkosten × (1 + Gewinnzuschlag / 100)','Der Gewinnzuschlag bezieht sich auf die Selbstkosten.');
  add('ziel','Zielverkaufspreis',r.ziel,'Barpreis ÷ (1 − Skonto / 100)','Vorwärts ist der Barpreis der um Skonto verminderte Zielpreis. Teile durch den verbleibenden Anteil.',[[r.bar*(1+d.skonto/100),'Du hast offenbar Skonto auf den Barpreis aufgeschlagen. Teile stattdessen durch 1 − Skonto / 100.']]);
 }else if(type==='rueckwaerts'){
  add('ziel','Zielverkaufspreis',r.ziel,'Listenpreis × (1 − Rabatt / 100)','Der Rabatt wird vom Listenpreis abgezogen.');
  add('bar','Barverkaufspreis',r.bar,'Zielpreis × (1 − Skonto / 100)','Skonto bezieht sich auf den Zielpreis.');
  add('sk','Zulässige Selbstkosten',r.selbstkosten,'Barpreis ÷ (1 + Gewinnzuschlag / 100)','Der Barpreis enthält den Gewinnzuschlag auf die Selbstkosten.',[[r.bar*(1-d.gewinnsatz/100),'Du hast offenbar den Gewinnsatz vom Barpreis abgezogen. Die Basis sind die Selbstkosten: Teile den Barpreis durch 1 + Gewinnsatz / 100.']]);
  add('hk','Zulässige Herstellkosten',r.herstellkosten,'Selbstkosten ÷ (1 + (VwGK + VtGK) / 100)','Beide Zuschläge haben dieselbe Basis: die Herstellkosten.');
  add('fk','Bekannte Fertigungskosten',r.fertigungskosten,'Fertigungslöhne × (1 + FGK / 100)','Diesen bekannten Kostenblock berechnest du vorwärts.');
  add('mk','Zulässige Materialkosten',r.materialkosten,'Herstellkosten − Fertigungskosten','Ziehe den vollständigen Fertigungskostenblock ab.');
 }else if(type==='kalkulation'){
  add('ziel','Zielverkaufspreis',r.ziel,'Listenpreis × (1 − Rabatt / 100)','Rabatt bezieht sich auf den Listenpreis.');
  add('bar','Barverkaufspreis',r.bar,'Zielpreis × (1 − Skonto / 100)','Skonto wird erst nach dem Rabatt berücksichtigt.',[[d.liste*(1-(d.rabatt+d.skonto)/100),'Du hast möglicherweise Rabatt und Skonto addiert. Ziehe sie nacheinander auf ihren unterschiedlichen Basen ab.']]);
 }
 if(['bezug','makebuy'].includes(type)){
  add('ziel-kauf','Zieleinkaufspreis',r.ziel,'Listeneinkaufspreis × (1 − Rabatt / 100)','Der Listenpreis gilt für die gesamte angegebene Kaufmenge.');
  add('bar-kauf','Bareinkaufspreis',r.bar,'Zieleinkaufspreis × (1 − Skonto / 100)','Skonto bezieht sich auf den Preis nach Rabatt.');
  add('bezug','Bezugspreis gesamt',r.gesamt,'Bareinkaufspreis + Bezugskosten','Bezugskosten kommen nach den Preisabzügen hinzu.');
 }
 if(type==='bedarf'){
  add('brutto','Bruttobedarf',r.brutto,'Produktion × Teile je Produkt + Zusatzbedarf','Zusatzbedarf ist bereits als absolute Menge gegeben.');rows.at(-1).unit='Teile';
  add('roh-netto','Beschaffungsbedarf vor Begrenzung auf 0',r.brutto+d.mindest+d.reserviert-d.lager-d.bestellt,'Brutto + Mindestbestand + Reservierungen − Lager − rechtzeitige Zugänge','Ein negativer Wert bedeutet einen Überschuss; der endgültige Nettobedarf ist dann 0.');rows.at(-1).unit='Teile';
 }
 if(type==='breakeven'){
  add('db','Stückdeckungsbeitrag',r.db,'Preis − variable Stückkosten','Fixkosten gehören nicht in den Stückdeckungsbeitrag.');
  add('schwelle','Gewinnschwelle vor Aufrundung',r.schwelle,'Fixkosten ÷ Stückdeckungsbeitrag','Erst die rechnerische Schwelle ermitteln, dann für ganze Stück aufrunden.');rows.at(-1).unit='Stück (dezimal)';
 }
 if(type==='deckungsbeitrag'){
  add('db-a','Stückdeckungsbeitrag A',r.stueck,'Preis A − variable Stückkosten A','Der Gesamtbeitrag entsteht erst durch Multiplikation mit der Menge.');
 }
 if(type==='lagerkritisch'){
  add('fix-diff','Differenz der Fixkosten',d.eigenfix-d.fremdfix,'Fixkosten Eigenlager − Fixkosten Fremdlager','Berücksichtige die Fixkosten beider Alternativen.');
  add('var-diff','Differenz der variablen Stückkosten',d.fremdvariabel-d.eigenvariabel,'Variable Fremdlagerkosten − variable Eigenlagerkosten','Bei höherem eigenen Fixkostenblock steht hier die umgekehrte Differenz der variablen Kosten.');rows.at(-1).unit='€/Einheit';
 }
 if(type==='bestellmenge'){
  const count=d.alternativen[0],amount=d.bedarf/count,stock=amount/2+d.mindest;
  add('first-amount',`Bestellmenge bei ${count} Bestellungen`,amount,'Jahresbedarf ÷ Anzahl Bestellungen','Jahresbedarf und einzelne Bestellmenge sind unterschiedliche Größen.');rows.at(-1).unit='Einheiten';
  add('first-stock',`Durchschnittsbestand bei ${count} Bestellungen`,stock,'Bestellmenge ÷ 2 + Mindestbestand','Der Mindestbestand wird zum halben Bestelllos addiert.');rows.at(-1).unit='Einheiten';
  add('first-cost',`Gesamtkosten bei ${count} Bestellungen`,count*d.kosten+stock*d.preis*d.satz/100,'Anzahl × Bestellkosten + Durchschnittsbestand × Preis × Lagerkostensatz / 100','Vergleiche die Summe aus Bestell- und Lagerkosten, nicht nur einen Kostenblock.');
 }
 return rows;
}
export function answerMistakes(type,d,r){
 if(type==='vorwaerts')return [[],[[r.bar*(1+d.skonto/100),'Du hast möglicherweise Skonto auf den Barpreis aufgeschlagen. Teile durch den verbleibenden Anteil des Zielpreises.']],[[r.ziel*(1+d.rabatt/100),'Du hast möglicherweise Rabatt auf den Zielpreis aufgeschlagen. Teile durch 1 − Rabatt / 100.']]];
 if(type==='rueckwaerts')return [[[r.bar*(1-d.gewinnsatz/100),'Du hast möglicherweise den Gewinnsatz vom Barpreis abgezogen. Teile durch 1 + Gewinnsatz / 100: Die Basis sind die Selbstkosten.']]];
 if(type==='kalkulation')return [[],[],[[r.gewinn/r.bar*100,'Dein Wert entspricht möglicherweise Gewinn ÷ Barpreis. Gesucht ist der Gewinnzuschlag auf die Selbstkosten.']]];
 return [];
}
export function numericFeedback(value,expected,unit,hint,wrong=[]){
 const n=parseNumber(value),integer=['Stück','Teile','pro Jahr','Einheiten'].includes(unit),tolerance=integer?0.000001:0.021;
 if(!Number.isFinite(n))return {ok:false,message:'Bitte eine gültige Zahl eingeben.'};
 if(Math.abs(n-round(expected))<tolerance)return {ok:true,message:'✓ Richtig'};
 const match=wrong.find(([x])=>Math.abs(n-round(x))<tolerance);
 return {ok:false,message:match?.[1]||hint||'Prüfe die Werte, Einheit und Prozentbasis dieser Rechnung.'};
}
export function answerHint(type,index){
 const hints={
  vorwaerts:['Gewinn auf die Selbstkosten aufschlagen.','Barpreis durch 1 − Skonto / 100 teilen.','Zielpreis durch 1 − Rabatt / 100 teilen.'],
  rueckwaerts:['Barpreis durch 1 + Gewinnzuschlag / 100 teilen.','Selbstkosten durch 1 + (Verwaltung + Vertrieb) / 100 teilen.','Zuerst Fertigungskosten abziehen; Materialkosten dann durch 1 + MGK / 100 teilen.'],
  kalkulation:['Verwaltung und Vertrieb auf die Herstellkosten aufschlagen.','Gewinn = Barverkaufspreis − Selbstkosten.','Gewinnzuschlag = Gewinn ÷ Selbstkosten × 100.'],
  breakeven:['Verkaufspreis minus variable Stückkosten.','Fixkosten durch den Stückdeckungsbeitrag teilen und auf ganze Stück aufrunden.','Menge × Stückdeckungsbeitrag − Fixkosten.'],
  bedarf:['Produktion × Teile je Produkt + Zusatzbedarf.','Brutto + Mindestbestand + Reservierungen − Lager − rechtzeitige Zugänge; mindestens 0.'],
  bezug:['Rabatt und Skonto nacheinander abziehen, dann Bezugskosten addieren.','Gesamte Bezugskosten durch die angegebene Kaufmenge teilen.'],
  makebuy:['Gesamte Selbstkosten der Eigenfertigung durch die Produktionsmenge teilen.','Gesamte Bezugskosten durch die Mindestabnahmemenge teilen.'],
  lagerkritisch:['Differenz der Fixkosten durch die Differenz der variablen Stückkosten teilen.','Eigenfixkosten + eigene variable Kosten × Vergleichsmenge.','Fremdfixkosten + fremde variable Kosten × Vergleichsmenge.'],
  deckungsbeitrag:['Stückdeckungsbeitrag A × Absatzmenge A.','Stückdeckungsbeitrag A durch Minuten je Stück A teilen.','Stückdeckungsbeitrag B durch Minuten je Stück B teilen.'],
  bestellmenge:['Nur die vorgegebenen Bestellalternativen vergleichen.','Bestellkosten plus Lagerhaltungskosten mit Mindestbestand.','Kosten bei 12 Bestellungen minus günstigste Tabellenalternative.','Andler: Wurzel aus 2 × Jahresbedarf × Bestellkosten ÷ (Preis × Lagerkostensatz / 100).'],
  kennzahlen:['Den zur Kennzahl gehörenden Zähler durch den passenden Nenner teilen und mit 100 multiplizieren.']
 };
 return hints[type]?.[index]||'Prüfe die Bezugsgröße und den Rechenweg der Aufgabe.';
}
