import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),catalogue=JSON.parse(await readFile(new URL('public/buildings.json',root),'utf8'));
const q='[out:json][timeout:55];way["building"="apartments"](43.3,-80.2,44.6,-78.6);out geom;';
async function download(query){const r=await fetch('https://maps.mail.ru/osm/tools/overpass/api/interpreter?data='+encodeURIComponent(query),{signal:AbortSignal.timeout(70000)});if(!r.ok)throw Error('Outline import '+r.status);const d=await r.json();if(d.remark)throw Error(d.remark);return d;}
const raw=process.argv[2]?JSON.parse(await readFile(process.argv[2],'utf8')):await download(q);
const ways=new Map(raw.elements.map(w=>['way/'+w.id,w])),outlines={};
for(const b of catalogue.buildings){if(!b.name&&(b.missingAddress||!b.address))continue;let w=ways.get(b.key);if(!w&&b.key.startsWith('curated/'))w=raw.elements.find(x=>x.bounds&&Math.abs((x.bounds.minlat+x.bounds.maxlat)/2-b.latitude)<.0003&&Math.abs((x.bounds.minlon+x.bounds.maxlon)/2-b.longitude)<.0003);if(!w?.geometry?.length)continue;const points=w.geometry.map(p=>[p.lat,p.lon]);if(points.length>=4)outlines[b.key]=points;}
await writeFile(new URL('public/footprints.json',root),JSON.stringify({source:'OpenStreetMap contributors',license:'ODbL-1.0',updatedAt:new Date().toISOString().slice(0,10),outlines}));console.log('Named/addressed building outlines: '+Object.keys(outlines).length);
