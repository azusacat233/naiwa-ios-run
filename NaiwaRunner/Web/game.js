(() => {
'use strict';
const $=id=>document.getElementById(id), canvas=$('world'), ctx=canvas.getContext('2d');
const {Run,profile,skins,buy}=RunCore, run=new Run();
let saved=window.__nativeProfile;
if(!saved){try{saved=JSON.parse(localStorage.getItem('sprout-profile-v1')||'null');}catch{}}
const p=profile(saved);
const maps=[
 {name:'薄荷海岸',tag:'海风经过的地方',sky:'#d4efdf',ground:'#a8ce92',road:'#f0e4bd',edge:'#faf4da',hill:'#7eaf8b',accent:'#5c9c83'},
 {name:'蜜桃山谷',tag:'一路都是好心情',sky:'#f6dfd0',ground:'#ccb995',road:'#f0ddbf',edge:'#fff0d6',hill:'#bc969e',accent:'#a77b8b'},
 {name:'蓝调花园',tag:'掉进一朵柔软的云',sky:'#d8e1f2',ground:'#a6b8c4',road:'#e2e1d8',edge:'#f5f2e5',hill:'#8e9fc1',accent:'#747fa9'}
];
let W=390,H=844,dpr=1,last=0,clock=0,audio,toastTimer;
function save(){const json=JSON.stringify(p);try{localStorage.setItem('sprout-profile-v1',json);}catch{}window.webkit?.messageHandlers?.profile?.postMessage(json);refresh();}
function refresh(){$('balance').textContent=p.coins;$('best').textContent=p.best;$('mapLabel').textContent='0'+(p.map+1)+' / '+maps[p.map].name;$('sound').textContent=p.sound?'♪':'♫';$('sound').setAttribute('aria-pressed',String(p.sound));}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),1800);}
function tone(freq=650,duration=.08){
 if(!p.sound)return;
 try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});
 const oscillator=audio.createOscillator(),gain=audio.createGain();
 oscillator.type='sine';oscillator.frequency.setValueAtTime(freq,audio.currentTime);
 gain.gain.setValueAtTime(.07,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);
 oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+duration);
 }catch{}
}
function resize(){const rect=canvas.getBoundingClientRect();W=rect.width;H=rect.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);ctx.fill();}
function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function rect(x,y,w,h,color,r=0){ctx.fillStyle=color;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);ctx.fill();}
function projection(lane,z){const s=11/(Math.max(-3,z)+11), horizon=H*.37,base=H*(run.state==='menu'?.73:.86);return {x:W*.5+lane*W*.245*s,y:horizon+(base-horizon)*s,s};}
function road(){
 const m=maps[p.map], h=H*.37;
 const gradient=ctx.createLinearGradient(0,0,0,H);gradient.addColorStop(0,m.sky);gradient.addColorStop(1,'#f6f5db');ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
 ellipse(W*.78,H*.22,30,30,'#fff7cd');ellipse(W*.18,H*.29,64,18,'#ffffff65');ellipse(W*.27,H*.28,37,22,'#ffffff65');
 ellipse(W*.14,h+20,W*.48,58,m.hill);ellipse(W*.82,h+22,W*.49,85,m.ground);
 rect(0,h+25,W,H,m.ground);
 const far=projection(0,150),near=projection(0,-3);
 polygon([[far.x-9,far.y],[far.x+9,far.y],[near.x+W*.57*near.s,near.y],[W,H],[0,H],[near.x-W*.57*near.s,near.y]],m.edge);
 polygon([[far.x-7,far.y],[far.x+7,far.y],[near.x+W*.405*near.s,near.y],[W,H],[0,H],[near.x-W*.405*near.s,near.y]],m.road);
 const motion=run.state==='menu'?clock*5:run.distance;
 for(let z=150;z>=0;z-=5){
  const q=((z-motion%5)+155)%155;if(q>140)continue;
  for(const lane of [-.5,.5]){
   const a=projection(lane,q),b=projection(lane,q+2.2);
   polygon([[a.x-1.7*a.s,a.y],[a.x+1.7*a.s,a.y],[b.x+1.7*b.s,b.y],[b.x-1.7*b.s,b.y]],'#fff8e0b0');
  }
 }
 for(let i=16;i>=0;i--){
  const z=(i*10+170-motion%10)%170, q=projection(0,z), side=i%2?-1:1;
  const x=q.x+side*W*.57*q.s,s=q.s;
  ellipse(x,q.y+3*s,25*s,7*s,'#23482b1c');rect(x-3*s,q.y-47*s,6*s,47*s,'#9b8766',2*s);
  ellipse(x,q.y-55*s,23*s,30*s,m.accent);ellipse(x-9*s,q.y-60*s,15*s,24*s,m.hill);
  if(i%3===0){ellipse(x+side*35*s,q.y+10*s,9*s,4*s,'#f7e6bc');ellipse(x+side*35*s,q.y+4*s,4*s,7*s,'#fff2cc');}
 }
}
function obstacle(o){
 const q=projection(o.lane,o.z),s=q.s, x=q.x,y=q.y;
 if(o.type==='coin'){
  ellipse(x,y-20*s,10*s,3*s,'#8b73352a');
  ellipse(x,y-34*s,Math.max(3,Math.abs(Math.cos(clock*3+o.z*.04))*10)*s,13*s,'#e7a735');
  ellipse(x,y-34*s,6*s,9*s,'#ffe9a0');return;
 }
 const w=53*s,h=(o.type==='low'?30:76)*s;
 ellipse(x,y+3*s,w*.65,8*s,'#263e3824');
 if(o.type==='bar'){
  rect(x-w*.58,y-81*s,7*s,81*s,'#5e8c77',2*s);rect(x+w*.45,y-81*s,7*s,81*s,'#5e8c77',2*s);
  rect(x-w*.67,y-84*s,w*1.34,32*s,'#f5b163',4*s);
  for(let k=0;k<3;k++)polygon([[x-w*.5+k*22*s,y-82*s],[x-w*.3+k*22*s,y-82*s],[x-w*.5+k*22*s,y-54*s],[x-w*.7+k*22*s,y-54*s]],'#fff0c8');
 }else{
  rect(x-w/2,y-h,w,h,o.type==='low'?'#e7a37e':'#6f9f91',5*s);
  polygon([[x-w/2,y-h],[x-w/2+8*s,y-h-8*s],[x+w/2+8*s,y-h-8*s],[x+w/2,y-h]],o.type==='low'?'#f8cc9e':'#9ac2ab');
  polygon([[x+w/2,y-h],[x+w/2+8*s,y-h-8*s],[x+w/2+8*s,y-8*s],[x+w/2,y]],'#446d5f');
  rect(x-w*.35,y-h*.73,w*.7,7*s,'#fff4cf',2*s);
  if(o.type==='block')rect(x-w*.35,y-h*.36,w*.7,7*s,'#fff4cf',2*s);
 }
}
function character(){
 if(window.NaiwaActorView){const q=projection(run.state==='menu'?-.22:run.x,0);NaiwaActorView.draw({w:W,h:H,x:q.x,y:q.y,jump:run.jump,slide:run.slide,time:run.state==='running'?run.time:clock,state:run.state,skin:p.skin});return;}
 const home=run.state==='menu', q=projection(home?-.22:run.x,0);
 const size=home?1.12:Math.min(1,W/390), bounce=home?Math.sin(clock*2)*3:run.state==='running'?Math.sin(run.time*18)*2:0;
 ellipse(q.x,q.y+6,34*size,10*size,'#29513c25');
 ctx.save();ctx.translate(q.x,q.y-run.jump*57+bounce);ctx.scale(size,size);
 if(run.slide>0){ctx.translate(0,7);ctx.scale(1.15,.50);}
 const color=skins[p.skin].color;
 const step=run.state==='running'&&run.jump===0?Math.sin(run.time*18)*7:0;
 ellipse(-15,-4+step,12,8,'#355c45');ellipse(15,-4-step,12,8,'#355c45');
 ellipse(-32,-37-step*.5,9,16,color);ellipse(32,-37+step*.5,9,16,color);
 ellipse(0,-39,31,35,color);ellipse(0,-33,20,23,'#f8f5d6');
 ellipse(0,-81,36,31,color);ellipse(-12,-79,3,5,'#274d3c');ellipse(12,-79,3,5,'#274d3c');
 ellipse(-22,-70,6,3,'#f4a39a');ellipse(22,-70,6,3,'#f4a39a');
 ctx.strokeStyle='#274d3c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-75,7,.25,Math.PI-.25);ctx.stroke();
 rect(-24,-57,48,10,'#f08c60',5);polygon([[12,-52],[26,-50],[22,-32],[10,-38]],'#e77852');
 ctx.strokeStyle='#537f40';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-109);ctx.quadraticCurveTo(0,-119,5,-126);ctx.stroke();
 ctx.save();ctx.translate(-8,-121);ctx.rotate(.45);ellipse(0,0,13,6,'#548844');ctx.restore();
 ctx.save();ctx.translate(11,-127);ctx.rotate(-.45);ellipse(0,0,13,6,'#72a653');ctx.restore();ctx.restore();
}
function draw(){road();const objects=run.objects.filter(o=>o.z<145).sort((a,b)=>b.z-a.z);objects.filter(o=>o.z>0).forEach(obstacle);character();objects.filter(o=>o.z<=0).forEach(obstacle);}
function showDialog(html){$('panelBody').innerHTML=html;if(!$('panel').open)$('panel').showModal();}
function showPanel(type){
 if(run.state!=='menu')return;
 if(type==='actors'){showDialog('<h2>熟悉的追逐小队</h2><p class="sub">参考网页同款模型与原色贴图。开跑时控制奶娃。</p>'+[['runner','奶娃'],['bull','牛来'],['dog','猎犬']].map(([id,name])=>'<button class="option" data-actor="'+id+'"><span class="swatch">☺</span><strong>'+name+'</strong><span class="price">查看模型 ↗</span></button>').join(''));}
 if(type==='maps'){showDialog('<h2>今天，去哪里？</h2><p class="sub">三种风景，随心出发。地图免费开放。</p>'+maps.map((m,i)=>'<button class="option '+(p.map===i?'active':'')+'" data-map="'+i+'"><span class="swatch" style="background:'+m.sky+'">☀</span><span><strong>'+m.name+'</strong><small>'+m.tag+'</small></span><span class="price">'+(p.map===i?'已选择':'选择 ↗')+'</span></button>').join(''));}
 if(type==='skins'){showDialog('<h2>换个好心情</h2><p class="sub">收集金币解锁外观。余额 '+p.coins+' ✦ · 外观不改变能力。</p>'+skins.map((s,i)=>'<button class="option '+(p.skin===i?'active':'')+'" data-skin="'+i+'"><span class="swatch" style="background:'+s.color+'">✳</span><span><strong>'+s.name+'</strong><small>'+(p.owned.includes(i)?'已经在你的衣橱里':'用奔跑攒下的小惊喜')+'</small></span><span class="price">'+(p.skin===i?'已穿戴':p.owned.includes(i)?'穿上':s.price+' ✦')+'</span></button>').join(''));}
 if(type==='records'){showDialog('<h2>每一步，都算数</h2><p class="sub">只和昨天的自己比一比。</p><div class="stats"><div class="stat"><b>'+p.best+'</b>最远距离 / 米</div><div class="stat"><b>'+p.runs+'</b>完成旅程 / 次</div><div class="stat"><b>'+p.total+'</b>累计金币 / 枚</div><div class="stat"><b>'+p.owned.length+'/4</b>收集外观 / 款</div></div>'+[[p.best>=500,'初见远方','单次奔跑 500 米'],[p.total>=100,'口袋里的阳光','累计收集 100 枚金币'],[p.runs>=10,'出走成为习惯','完成 10 次旅程']].map(a=>'<div class="option"><span>'+(a[0]?'✦':'○')+'</span><span><strong>'+a[1]+'</strong><small>'+a[2]+'</small></span></div>').join(''));}
}
function syncUI(){const home=run.state==='menu';$('home').hidden=!home;document.querySelector('header').hidden=!home;$('hud').hidden=home;$('controls').hidden=home;refresh();}
function start(){$('panel').close();run.start();syncUI();tone(550);toast('跟随金币，寻找畅通的跑道');}
function finish(){if(run.settle(p))save();showDialog('<h2>这一程，很棒！</h2><p class="sub">风景还在，下一次会跑得更远。</p><div class="stats"><div class="stat"><b>'+Math.floor(run.distance)+'</b>本次距离 / 米</div><div class="stat"><b>'+run.coins+'</b>收集金币 / 枚</div></div><p class="sub">个人最佳 '+p.best+' 米 · 金币已存入背包</p><div class="panel-actions"><button class="primary" data-command="start">再出发一次 <span>↗</span></button><button class="secondary" data-command="home">回到小站</button></div>');}
function pause(){
 if(run.state!=='running')return;run.pause();audio?.suspend().catch(()=>{});
 showDialog('<h2>休息一小会儿</h2><p class="sub">跑道已经暂停。准备好了，再一起出发。</p><div class="panel-actions"><button class="primary" data-command="resume">继续兜风 <span>↗</span></button><button class="secondary" data-command="home">结束本次，保存并返回</button></div>');
}
function backHome(){if(run.settle(p))save();run.reset();$('panel').close();syncUI();}
function closePanel(){if(run.state==='paused'){run.resume();last=performance.now();}else if(run.state==='over'){backHome();} $('panel').close();}
$('start').onclick=start;$('pause').onclick=pause;$('closePanel').onclick=closePanel;
$('panel').addEventListener('cancel',e=>{e.preventDefault();closePanel();});
$('sound').onclick=()=>{p.sound=!p.sound;save();tone();};
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.panel)showPanel(b.dataset.panel);
 if(b.dataset.actor){window.NaiwaActorView?.select(b.dataset.actor);$('panel').close();}
 if(b.dataset.map!==undefined){p.map=Number(b.dataset.map);save();showPanel('maps');}
 if(b.dataset.skin!==undefined){if(buy(p,Number(b.dataset.skin))){save();showPanel('skins');tone();}else toast('金币还不够，再去跑一圈吧');}
 if(b.dataset.command==='start')start();
 if(b.dataset.command==='resume')closePanel();
 if(b.dataset.command==='home')backHome();
});
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();run.action(b.dataset.action);}));
let touch;
canvas.addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointerup',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))>18)run.action(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'slide':'jump');});
canvas.addEventListener('pointercancel',()=>touch=null);
document.addEventListener('keydown',e=>{if(e.repeat)return;const a={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'jump',ArrowDown:'slide',' ':'jump'}[e.key];if(a){e.preventDefault();run.action(a);}if(e.key==='Escape'&&!$('panel').open)pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('blur',pause);window.addEventListener('resize',resize);
window.SproutApp={pause,snapshot:()=>({state:run.state,distance:run.distance,coins:run.coins,lane:run.lane,jump:run.jump,slide:run.slide,profile:{...p}})};
function frame(now){const dt=last?(now-last)/1000:0;last=now;clock+=Math.min(dt,.05);const events=run.tick(dt);for(const e of events){if(e==='coin')tone(880);if(e==='crash'){tone(130,.25);finish();}}draw();$('distance').textContent=Math.floor(run.distance);$('runCoins').textContent=run.coins;$('speed').textContent=run.speed>=31?'风在耳边 · 全速前进':Math.round(run.speed)+' m/s · 慢慢加速';requestAnimationFrame(frame);}
resize();refresh();syncUI();requestAnimationFrame(frame);
})();