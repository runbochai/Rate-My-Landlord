import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('catalogue covers all five GTA regions with unique, valid building locations',async()=>{
 const d=JSON.parse(await readFile(new URL('../public/buildings.json',import.meta.url),'utf8'));
 assert.equal(d.license,'ODbL-1.0');assert.equal(new Set(d.buildings.map(b=>b.key)).size,d.buildings.length);
 for(const region of ['Toronto','York Region','Durham Region','Peel Region','Halton Region'])assert.ok(d.buildings.filter(b=>b.region===region).length>100,region);
 for(const b of d.buildings){assert.ok(b.latitude>=43.3&&b.latitude<=44.6);assert.ok(b.longitude>=-80.2&&b.longitude<=-78.6);assert.ok(['condo','residential'].includes(b.category));assert.ok(!('postcode' in b));if(!b.missingAddress)assert.match(b.address,/\d/);}
 const casa=d.buildings.find(b=>b.name==='CASA III');assert.equal(casa.address,'50 Charles Street East');assert.equal(casa.category,'condo');
});
