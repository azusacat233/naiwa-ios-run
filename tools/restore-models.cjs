const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
(async()=>{
 const dir=path.join(__dirname,'../NaiwaRunner/Web/models');
 const entries=JSON.parse(await fs.readFile(path.join(__dirname,'model-downloads.json'),'utf8'));
 await fs.mkdir(dir,{recursive:true});
 for(const entry of entries){
  const dest=path.join(dir,entry.name);
  let bytes=await fs.readFile(dest).catch(()=>null);
  if(!bytes){
   const response=await fetch(entry.url,{signal:AbortSignal.timeout(90000)});
   if(!response.ok)throw new Error('Model download HTTP '+response.status+': '+entry.name);
   bytes=Buffer.from(await response.arrayBuffer());
  }
  const digest=crypto.createHash('sha256').update(bytes).digest('hex');
  if(digest!==entry.sha256)throw new Error('Model resource changed; checksum mismatch: '+entry.name);
  await fs.writeFile(dest,bytes);
  console.log('Verified '+entry.name);
 }
 require('./pack-models.cjs');
})().catch(error=>{console.error(error.message);process.exit(1)});
