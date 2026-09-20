(function(root) {
'use strict';
const skins = [
{name:'经典奶娃',color:'#b7ed6a',price:0},{name:'桃桃汽水',color:'#ffb1b1',price:80},
{name:'蓝莓云朵',color:'#a5bcff',price:160},{name:'奶油小太阳',color:'#ffe08a',price:240}];
function profile(raw={}) {
 const n=x=>Number.isFinite(x)?Math.max(0,Math.floor(x)):0;
 raw=raw&&typeof raw==='object'?raw:{};
 const owned=[...new Set([0,...(Array.isArray(raw.owned)?raw.owned:[]).filter(x=>Number.isInteger(x)&&skins[x])])];
 return {coins:n(raw.coins),best:n(raw.best),runs:n(raw.runs),total:n(raw.total),owned,
 skin:owned.includes(raw.skin)?raw.skin:0,map:[0,1,2].includes(raw.map)?raw.map:0,sound:raw.sound!==false};
}
class Run {
 constructor(random=Math.random){this.random=random;this.reset();}
 reset(){this.state='menu';this.distance=0;this.coins=0;this.speed=18;this.lane=0;this.x=0;this.jump=0;this.vy=0;this.slide=0;this.objects=[];this.spawnIn=1;this.time=0;this.settled=false;}
 start(){this.reset();this.state='running';}
 action(a){
  if(this.state!=='running')return;
  if(a==='left')this.lane=Math.max(-1,this.lane-1);
  if(a==='right')this.lane=Math.min(1,this.lane+1);
  if(a==='jump'&&this.jump===0&&this.slide===0)this.vy=9;
  if(a==='slide'&&this.jump===0&&this.vy===0)this.slide=.85;
 }
 pause(){if(this.state==='running')this.state='paused';}
 resume(){if(this.state==='paused')this.state='running';}
 spawn(){
  const safe=Math.floor(this.random()*3)-1;
  for(const lane of [-1,0,1].filter(x=>x!==safe))
   if(this.random()<.78)this.objects.push({lane,z:105,type:['block','low','bar'][Math.floor(this.random()*3)]});
  for(let i=0;i<5;i++)this.objects.push({lane:safe,z:105+i*3.5,type:'coin'});
 }
 tick(dt){
  const events=[];if(this.state!=='running')return events;
  dt=Math.max(0,Math.min(dt,.05));this.time+=dt;this.speed=Math.min(32,18+this.time*.25);
  this.distance+=this.speed*dt;this.x+=(this.lane-this.x)*Math.min(1,dt*16);
  this.slide=Math.max(0,this.slide-dt);
  if(this.vy!==0||this.jump>0){this.jump=Math.max(0,this.jump+this.vy*dt);this.vy-=22*dt;if(this.jump===0)this.vy=0;}
  this.spawnIn-=dt;if(this.spawnIn<=0){this.spawn();this.spawnIn=1.7;}
  for(const o of this.objects){
   const previous=o.z;o.z-=this.speed*dt;
   if(o.hit||previous < -1||o.z>1||Math.abs(o.lane-this.x)>=.48)continue;
   if(o.type==='coin'){if(this.jump<1.1){o.hit=true;this.coins++;events.push('coin');}}
   else if(o.type==='block'||(o.type==='low'&&this.jump<1)||(o.type==='bar'&&this.slide<=0)){this.state='over';events.push('crash');break;}
  }
  this.objects=this.objects.filter(o=>o.z > -5&&!o.hit);return events;
 }
 settle(p){if(this.settled||this.state==='menu')return false;this.settled=true;p.coins+=this.coins;p.total+=this.coins;p.best=Math.max(p.best,Math.floor(this.distance));p.runs++;return true;}
}
function buy(p,index){const s=skins[index];if(!s)return false;if(!p.owned.includes(index)){if(p.coins<s.price)return false;p.coins-=s.price;p.owned.push(index);}p.skin=index;return true;}
const api={Run,profile,skins,buy};if(typeof module!=='undefined')module.exports=api;root.RunCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
