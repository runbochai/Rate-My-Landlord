window.RmlCatalogue = (() => {
 let records=[],metadata=null,layer=null,map=null,onSelect=null,visible=true;
 const normalized=s=>String(s||'').toLowerCase().replace(/\bstreet\b/g,'st').replace(/\bavenue\b/g,'ave').replace(/\b(east|west|north|south)\b/g,m=>m[0]).replace(/[^a-z0-9]/g,'');
 function match(record,known){return known.find(b=>normalized(b.address)===normalized(record.address)&&Math.abs(b.latitude-record.latitude)<.002&&Math.abs(b.longitude-record.longitude)<.002);}
 function search(query,known){const terms=query.toLowerCase().split(/\s+/).filter(Boolean);return records.filter(b=>terms.every(term=>(b.name+' '+b.address+' '+b.city).toLowerCase().includes(term))).slice(0,6).map(b=>({...b,...match(b,known)}));}
 function draw(){if(!map||!layer)return;layer.clearLayers();if(!visible)return;const zoom=map.getZoom(),bounds=map.getBounds().pad(.1),groups=new Map();
  for(const b of records){if(!bounds.contains([b.latitude,b.longitude]))continue;const point=map.project([b.latitude,b.longitude],zoom),key=zoom>=16?b.key:Math.floor(point.x/64)+':'+Math.floor(point.y/64);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(b);}
  for(const group of groups.values()){
   if(group.length>1){const lat=group.reduce((sum,b)=>sum+b.latitude,0)/group.length,lon=group.reduce((sum,b)=>sum+b.longitude,0)/group.length;L.marker([lat,lon],{icon:L.divIcon({className:'building-cluster',html:String(group.length),iconSize:[38,38],iconAnchor:[19,19]}),title:group.length+' 栋住宅楼'}).addTo(layer).on('click',()=>map.fitBounds(L.latLngBounds(group.map(b=>[b.latitude,b.longitude])),{padding:[50,50],maxZoom:17}));}
   else{const b=group[0],condo=b.category==='condo';const marker=L.marker([b.latitude,b.longitude],{icon:L.divIcon({className:'catalogue-pin '+(condo?'condo-pin':''),html:condo?'C':'▥',iconSize:[28,30],iconAnchor:[14,30]}),title:(b.name||b.address||'住宅楼')+' · '+(condo?'Condo':'公寓 / 住宅楼')}).addTo(layer).on('click',()=>onSelect(b));const label=document.createElement('span');label.textContent=b.name||b.address||'地址待补充';marker.bindTooltip(label,{permanent:zoom>=17,direction:'top',offset:[0,-30],className:'building-name-label'});}
  }
 }
 async function initialize(m,select){map=m;onSelect=select;layer=L.layerGroup().addTo(map);map.on('moveend',draw);const status=document.querySelector('#catalogue-count');try{const response=await fetch('/buildings.json');if(!response.ok)throw Error('Catalogue unavailable');const data=await response.json();records=data.buildings;metadata=data;status.textContent=records.length.toLocaleString()+' 栋楼宇';status.title='OpenStreetMap 公开楼宇资料；不是出租挂牌数量。更新日期：'+data.updatedAt;draw();}catch{status.textContent='楼宇图层暂不可用';}document.querySelector('#show-catalogue').addEventListener('change',event=>{visible=event.target.checked;draw();});}
 return{initialize,search,match,all:()=>records,metadata:()=>metadata};
})();
