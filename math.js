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
