export async function propertyRoutes(request,db,session,{url,json,rows,text,HttpError,body}){
 const path=url.pathname;
 if(request.method==='GET'&&path==='/api/buildings')return json({buildings:await rows(db,'SELECT b.*,COUNT(l.id) AS units FROM buildings b LEFT JOIN listings l ON l.building_id=b.id GROUP BY b.id ORDER BY b.created_at DESC')});
 if(request.method==='GET'&&path.startsWith('/api/buildings/')){
  const id=decodeURIComponent(path.slice(15));const building=await db.prepare('SELECT * FROM buildings WHERE id=?').bind(id).first();if(!building)throw new HttpError(404,'楼宇尚未收录。');
  const unit=url.searchParams.get('unit')?.trim().toUpperCase().replace(/^(?:UNIT(?:\s+|$)|#\s*)/,'');
  const listings=await rows(db,'SELECT l.id,l.unit,l.landlord_id,p.name AS landlord_name,COUNT(r.id) AS reviews,AVG((r.maintenance+r.communication+r.deposit)/3.0) AS score FROM listings l JOIN landlords p ON p.id=l.landlord_id LEFT JOIN reviews r ON r.listing_id=l.id AND r.status=\'published\' WHERE l.building_id=?'+(unit?' AND l.unit=?':'')+' GROUP BY l.id ORDER BY l.unit',...unit?[id,unit]:[id]);
  return json({building,listings});
 }
 if(request.method==='POST'&&path==='/api/listings'){
  if(request.headers.get('origin')!==url.origin)throw new HttpError(403,'请从本站提交。');const input=await body(request);if(!input||typeof input!=='object'||Array.isArray(input))throw new HttpError(400,'无效的资料。');
  const unit=text(input.unit,1,30,'Unit').toUpperCase().replace(/^(?:UNIT(?:\s+|$)|#\s*)/,'');if(!unit)throw new HttpError(400,'请输入 Unit。');
  const landlordName=text(input.landlordName,2,100,'出租方名称');if(input.consent!==true)throw new HttpError(400,'请确认这条对应关系来自你的租住经历。');
  const count=await db.prepare('SELECT COUNT(*) AS n FROM submissions WHERE session=? AND created_at>?').bind(session.hash,Date.now()-86400000).first();if(count.n>=5)throw new HttpError(429,'今天添加的资料较多，请明天再试。');
  let building;if(input.buildingId){building=await db.prepare('SELECT * FROM buildings WHERE id=?').bind(text(input.buildingId,1,80,'楼宇编号')).first();if(!building)throw new HttpError(404,'楼宇不存在。');}
  else{const address=text(input.address,5,200,'楼宇地址'),city=text(input.city,2,100,'城市');if(!Number.isFinite(input.latitude)||!Number.isFinite(input.longitude)||Math.abs(input.latitude)>90||Math.abs(input.longitude)>180)throw new HttpError(400,'请先在地图上确认楼宇位置。');building={id:crypto.randomUUID(),address,city,latitude:input.latitude,longitude:input.longitude};}
  const statements=[];if(!input.buildingId){const existing=await db.prepare('SELECT * FROM buildings WHERE address=? AND city=?').bind(building.address,building.city).first();if(existing)building=existing;else statements.push(db.prepare('INSERT INTO buildings (id,address,city,latitude,longitude,created_at) VALUES (?,?,?,?,?,?)').bind(building.id,building.address,building.city,building.latitude,building.longitude,Date.now()));}
  let landlord=await db.prepare('SELECT id FROM landlords WHERE name=? AND city=? AND district=?').bind(landlordName,building.city,building.address).first();if(!landlord){landlord={id:crypto.randomUUID()};statements.push(db.prepare('INSERT INTO landlords (id,name,city,district,created_at) VALUES (?,?,?,?,?)').bind(landlord.id,landlordName,building.city,building.address,Date.now()));}
  const id=crypto.randomUUID();statements.push(db.prepare('INSERT INTO listings (id,building_id,unit,landlord_id,created_at) VALUES (?,?,?,?,?)').bind(id,building.id,unit,landlord.id,Date.now()),db.prepare('INSERT INTO submissions (id,session,created_at) VALUES (?,?,?)').bind(crypto.randomUUID(),session.hash,Date.now()));
  try{await db.batch(statements);}catch(error){if(String(error).includes('UNIQUE'))throw new HttpError(409,'这个地址和 Unit 已有资料，请查看已收录的记录。');throw error;}
  return json({id,buildingId:building.id,landlordId:landlord.id},201);
 }
 return null;
}
