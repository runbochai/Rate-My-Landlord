import {readFile,writeFile} from 'node:fs/promises';
const regions=[[324211,'Toronto'],[324214,'York Region'],[2408843,'Durham Region'],[4198907,'Peel Region'],[7034889,'Halton Region']];
const buildings=[],seen=new Set(),summaries=[];
const endpoint='https://maps.mail.ru/osm/tools/overpass/api/interpreter';
async function queryOverpass(query){const r=await fetch(endpoint+'?data='+encodeURIComponent(query),{headers:{'User-Agent':'RateMyLandlordGTA/1.0 (+https://github.com/runbochai/Rate-My-Landlord)'},signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error('Overpass '+r.status);const d=await r.json();if(d.remark)throw Error(d.remark);return d;}
const boundaries=process.argv[2]?JSON.parse(await readFile(process.argv[2],'utf8')):await queryOverpass('[out:json][timeout:40];relation["boundary"="administrative"]["admin_level"="6"](43.3,-80.2,44.6,-78.6);out geom;');console.log('Loaded region boundaries');
const raw=process.argv[3]?JSON.parse(await readFile(process.argv[3],'utf8')):await queryOverpass('[out:json][timeout:40];way["building"="apartments"](43.3,-80.2,44.6,-78.6);out center tags;');console.log('Loaded '+raw.elements.length+' candidate buildings');
function inside(lat,lon,boundary){let result=false;for(const member of boundary.members||[]){if(!['outer','inner',''].includes(member.role)||!member.geometry)continue;const points=member.geometry;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];if((a.lat>lat)!==(b.lat>lat)&&lon<(b.lon-a.lon)*(lat-a.lat)/(b.lat-a.lat)+a.lon)result=!result;}}return result;}
for(const [id,region] of regions){
 const boundary=boundaries.elements.find(x=>x.id===id);if(!boundary)throw Error('Missing boundary '+region);
 const data={elements:raw.elements.filter(x=>inside(x.center.lat,x.center.lon,boundary))};let count=0;
 for(const item of data.elements){const t=item.tags||{},latitude=item.lat??item.center?.lat,longitude=item.lon??item.center?.lon,key=`${item.type}/${item.id}`;if(seen.has(key)||!Number.isFinite(latitude)||!Number.isFinite(longitude))continue;seen.add(key);
 const address=[t['addr:housenumber'],t['addr:street']].filter(Boolean).join(' '),name=t.name||'',city=t['addr:city']||region;
 const condo=t.building==='condominium'||t.residential==='condominium'||/\bcondo(minium)?s?\b/i.test(name);
 buildings.push({key,name,address,city,region,latitude,longitude,category:condo?'condo':'residential',missingAddress:!t['addr:housenumber']||!t['addr:street']});count++;
 }summaries.push({region,count});console.log(region+': '+count);
}
const curated=[{key:'curated/casa-iii',name:'CASA III',address:'50 Charles Street East',city:'Toronto',latitude:43.66953,longitude:-79.38379,source:'https://www.toronto.ca/wp-content/uploads/2021/10/8fe1-2021-16369-Hayden-St.pdf'},{key:'way/303709935',name:'One Bloor East',address:'1 Bloor Street East',city:'Toronto',latitude:43.6698249,longitude:-79.3861067,source:'https://www.greatgulf.com/highrise/community/one-bloor'},{key:'way/229484421',name:'ICE 1',address:'12 York Street',city:'Toronto',latitude:43.6416277,longitude:-79.3820399,source:'https://tscc2510.ca/unit-floorplans'}];
for(const b of curated){const existing=buildings.find(x=>x.key===b.key||(Math.abs(x.latitude-b.latitude)<.0003&&Math.abs(x.longitude-b.longitude)<.0003));if(existing)Object.assign(existing,b,{category:'condo',missingAddress:false});else buildings.push({...b,region:'Toronto',category:'condo',missingAddress:false});}
const data={updatedAt:new Date().toISOString().slice(0,10),source:'OpenStreetMap contributors, with cited building corrections',license:'ODbL-1.0',attribution:'https://www.openstreetmap.org/copyright',coverage:'Toronto, York, Durham, Peel and Halton; mapped apartment buildings, not a complete condo register or rental listing count',regions:summaries,buildings};
await writeFile(new URL('../public/buildings.json',import.meta.url),JSON.stringify(data));console.log('Total: '+buildings.length);
