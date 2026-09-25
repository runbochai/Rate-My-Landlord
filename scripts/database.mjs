import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
export function createDatabase(filename=':memory:'){
 const connection=new DatabaseSync(filename);connection.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
 connection.exec('CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY)');
 for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort()){
  if(connection.prepare('SELECT name FROM _migrations WHERE name = ?').get(file))continue;
  connection.exec('BEGIN');try{connection.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));connection.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);connection.exec('COMMIT');}catch(e){connection.exec('ROLLBACK');throw e;}
 }
 const prepare=sql=>{let args=[];const statement=connection.prepare(sql);const wrapper={bind(...values){args=values;return wrapper;},async all(){return{results:statement.all(...args)};},async first(){return statement.get(...args)||null;},async run(){const r=statement.run(...args);return{success:true,meta:{changes:Number(r.changes)}};}};return wrapper;};
 return{prepare,async batch(statements){connection.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());connection.exec('COMMIT');return result;}catch(e){connection.exec('ROLLBACK');throw e;}},close:()=>connection.close()};
}
