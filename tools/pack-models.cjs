const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'../NaiwaRunner/Web/models');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const data={manifest:{characters:manifest.characters},binary:fs.readFileSync(path.join(dir,'characters.bin')).toString('base64'),textures:{}};
for(const name of ['runner','bull','dog'])data.textures[name]='data:image/png;base64,'+fs.readFileSync(path.join(dir,name+'-1.png')).toString('base64');
fs.writeFileSync(path.join(dir,'models-data.js'),'window.NaiwaModels='+JSON.stringify(data)+';');
console.log('Packed original geometry and color textures:',fs.statSync(path.join(dir,'models-data.js')).size,'bytes');