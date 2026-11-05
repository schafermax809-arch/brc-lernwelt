export const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
export function parseNumber(value){
 let s=String(value).trim().replace(/\s|€|%/g,'');
 if(!s) return NaN;
 if(s.includes(',')) s=s.replace(/\./g,'').replace(',','.');
 else if(/^[-+]?\d{1,3}(\.\d{3})+$/.test(s)) s=s.replace(/\./g,'');
 return /^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN;
}
export function kalkulation({material,lohn,mgk,fgk,vwgk,vtgk,liste,rabatt,skonto}){
 const materialGK=material*mgk/100, fertigungGK=lohn*fgk/100;
 const materialkosten=material+materialGK, fertigungskosten=lohn+fertigungGK;
 const herstellkosten=materialkosten+fertigungskosten;
 const verwaltung=herstellkosten*vwgk/100,vertrieb=herstellkosten*vtgk/100;
 const selbstkosten=herstellkosten+verwaltung+vertrieb;
 const ziel=liste*(1-rabatt/100),bar=ziel*(1-skonto/100),gewinn=bar-selbstkosten;
 return {materialGK,fertigungGK,materialkosten,fertigungskosten,herstellkosten,verwaltung,vertrieb,selbstkosten,ziel,bar,gewinn,gewinnprozent:gewinn/selbstkosten*100};
}
export function breakeven({fix,preis,variabel,menge}){
 const db=preis-variabel;
 return {db,schwelle:db>0?fix/db:null,ganze:db>0?Math.ceil(fix/db):null,gewinn:menge*db-fix};
}
export function bestellen({bedarf,preis,kosten,satz,mindest,alternativen}){
 return alternativen.map(n=>{const menge=bedarf/n,bestand=menge/2+mindest,wert=bestand*preis,bestellkosten=n*kosten,lagerkosten=wert*satz/100;return {n,menge,bestand,wert,bestellkosten,lagerkosten,gesamt:bestellkosten+lagerkosten};});
}
export function nettobedarf({produktion,teile,zusatz,mindest,reserviert,lager,bestellt}){
 const brutto=produktion*teile+zusatz;
 return {brutto,netto:Math.max(0,brutto+mindest+reserviert-lager-bestellt)};
}
export function bezug({liste,rabatt,skonto,transport,menge}){
 const ziel=liste*(1-rabatt/100),bar=ziel*(1-skonto/100),gesamt=bar+transport;
 return {ziel,bar,gesamt,stueck:gesamt/menge};
}
export function makebuy({material,mgk,lohn,fgk,vv,produktion,liste,rabatt,skonto,transport,kaufmenge}){
 const herstell=(material*(1+mgk/100)+lohn*(1+fgk/100));
 const eigen=herstell*(1+vv/100),eigenstueck=eigen/produktion;
 const fremd=bezug({liste,rabatt,skonto,transport,menge:kaufmenge});
 return {herstell,eigen,eigenstueck,...fremd};
}
export function vorwaerts(d){const costs=kalkulation({...d,liste:0,rabatt:0,skonto:0});const bar=costs.selbstkosten*(1+d.gewinnsatz/100),ziel=bar/(1-d.skonto/100),liste=ziel/(1-d.rabatt/100);return {...costs,bar,ziel,liste};}
export function rueckwaerts(d){const ziel=d.liste*(1-d.rabatt/100),bar=ziel*(1-d.skonto/100),selbstkosten=bar/(1+d.gewinnsatz/100),herstellkosten=selbstkosten/(1+(d.vwgk+d.vtgk)/100),fertigungskosten=d.lohn*(1+d.fgk/100),materialkosten=herstellkosten-fertigungskosten,material=materialkosten/(1+d.mgk/100);return {ziel,bar,selbstkosten,herstellkosten,fertigungskosten,materialkosten,material};}
export function kennzahlen({eigenkapital,gesamtkapital,liquide,kurzfristig,anlage}){return {ekquote:gesamtkapital>0?eigenkapital/gesamtkapital*100:null,liquiditaet:kurzfristig>0?liquide/kurzfristig*100:null,deckung:anlage>0?eigenkapital/anlage*100:null};}
export function lagerkritisch({eigenfix,fremdfix,eigenvariabel,fremdvariabel,menge}){const diff=fremdvariabel-eigenvariabel;return {kritisch:diff!==0?(eigenfix-fremdfix)/diff:null,eigen:eigenfix+eigenvariabel*menge,fremd:fremdfix+fremdvariabel*menge};}
export function deckungsbeitrag({preis,variabel,menge,minuten}){const stueck=preis-variabel;return {stueck,gesamt:stueck*menge,relativ:minuten>0?stueck/minuten:null};}
export function andler({bedarf,kosten,preis,satz}){return Math.sqrt(2*bedarf*kosten/(preis*satz/100));}
