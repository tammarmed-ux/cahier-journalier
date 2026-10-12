// Rejouer un test dépendant de l'heure à une date fixe :
//   SHIFT_TO=2026-10-15T10:00:00+01:00 node --import ./i18n/shiftdate.mjs test.js
// Décale Date côté Node et dans chaque page puppeteer (même décalage ; l'horloge continue d'avancer).
import {CdpPage} from '/workspace/cj-emu/node_modules/puppeteer-core/lib/puppeteer/cdp/Page.js';
const TO=Date.parse(process.env.SHIFT_TO);const OFF=TO-Date.now();
const R=Date;class Fk extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+OFF);}static now(){return R.now()+OFF;}}Fk.parse=R.parse;Fk.UTC=R.UTC;globalThis.Date=Fk;
const inj=`(()=>{const OFF=${OFF};const R=Date;class Fk extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+OFF);}static now(){return R.now()+OFF;}}Fk.parse=R.parse;Fk.UTC=R.UTC;window.Date=Fk;})();`;
const C=CdpPage._create;CdpPage._create=async function(...a){const p=await C.apply(this,a);try{await p.evaluateOnNewDocument(inj);}catch(e){}return p;};
